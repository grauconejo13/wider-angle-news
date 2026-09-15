import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "src/data/live-news.json");
const endpoint = "https://api.gdeltproject.org/api/v2/doc/doc";
const timespan = process.env.GDELT_TIMESPAN || "24h";

const scopes = [
  {
    id: "san-antonio",
    label: "San Antonio",
    query: '"San Antonio" sourcelang:english',
    limit: 35
  },
  {
    id: "texas",
    label: "Texas",
    query: "Texas sourcelang:english",
    limit: 35
  },
  {
    id: "us",
    label: "United States",
    query: '"United States" sourcelang:english',
    limit: 35
  },
  {
    id: "world",
    label: "Wider World",
    query: "(climate OR economy OR technology OR election OR energy) sourcelang:english",
    limit: 45
  }
];

const topicRules = {
  sports: {
    terms: ["college football", "football", "basketball", "baseball", "soccer", "hockey", "touchdown", "quarterback", "gameday", "tournament", "championship", "playoffs", "coach", "athlete", "defeats", "beats", "upsets", "rallies", "stuns"],
    paths: ["/sports/", "/sport/"]
  },
  health: {
    terms: ["public health", "mental health", "health", "hospital", "medical", "medicare", "medicaid", "disease", "outbreak", "vaccine", "patient", "doctor", "cancer"],
    paths: ["/health/", "/medicine/"]
  },
  "public-safety": {
    terms: ["public safety", "law enforcement", "police", "shooting", "crime", "arrest", "arrested", "emergency", "missing person", "investigation", "fraud", "fire department"],
    paths: ["/crime/", "/public-safety/"]
  },
  education: {
    terms: ["higher education", "school district", "education", "school", "university", "college", "student", "teacher", "campus", "classroom"],
    paths: ["/education/", "/schools/"]
  },
  science: {
    terms: ["scientific study", "researchers", "research", "scientist", "science", "space", "nasa", "discovery", "laboratory", "telescope"],
    paths: ["/science/", "/space/"]
  },
  technology: {
    terms: ["artificial intelligence", "data center", "machine learning", "cybersecurity", "software", "technology", "cyber", "robot", "semiconductor", "chip"],
    paths: ["/technology/", "/tech/"]
  },
  economy: {
    terms: ["cost of living", "interest rate", "consumer prices", "economy", "economic", "jobs", "wages", "trade", "tariff", "inflation", "market", "business", "shipping", "finance"],
    paths: ["/business/", "/economy/", "/finance/"]
  },
  environment: {
    terms: ["climate change", "extreme weather", "environment", "climate", "weather", "heat", "storm", "water", "energy", "flood", "wildfire", "pollution"],
    paths: ["/climate/", "/environment/", "/weather/"]
  },
  civic: {
    terms: ["city council", "supreme court", "white house", "election", "government", "congress", "senate", "lawmaker", "governor", "mayor", "court", "law", "policy", "vote", "campaign", "transit"],
    paths: ["/politics/", "/government/"]
  },
  culture: {
    terms: ["film", "movie", "music", "television", "celebrity", "actor", "artist", "museum", "theater", "festival"],
    paths: ["/culture/", "/entertainment/", "/arts/"]
  }
};

const clusterStopWords = new Set([
  "about", "after", "again", "against", "amid", "among", "and", "are", "because",
  "before", "being", "but", "could", "from", "have", "into", "just", "more", "most",
  "new", "not", "over", "says", "than", "that", "the", "their", "them", "there",
  "these", "they", "this", "through", "under", "was", "were", "what", "when", "where",
  "which", "while", "who", "will", "with", "would", "your"
]);

function normalizeForRules(value) {
  return ` ${String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;
}

function classifyTopic(title, url) {
  const titleText = normalizeForRules(title);
  let pathname = "";
  try {
    pathname = new URL(url).pathname.toLowerCase();
  } catch {
    // A valid URL is enforced elsewhere; classification can still use the title.
  }

  const ranked = Object.entries(topicRules).map(([topic, rule]) => {
    const signals = rule.terms.filter((term) => titleText.includes(normalizeForRules(term)));
    const pathSignals = rule.paths.filter((path) => pathname.includes(path));
    const termScore = signals.reduce((score, term) => score + (term.includes(" ") ? 4 : 2), 0);
    return { topic, score: termScore + pathSignals.length * 6, signals: [...signals, ...pathSignals] };
  }).sort((left, right) => right.score - left.score);

  const best = ranked[0];
  const runnerUp = ranked[1];
  if (!best || best.score === 0) {
    return { topic: "general", confidence: 35, signals: [] };
  }

  const margin = best.score - (runnerUp?.score || 0);
  const confidence = Math.min(96, Math.round(55 + best.score * 4 + margin * 2));
  return { topic: best.topic, confidence, signals: best.signals.slice(0, 4) };
}

function applyCategory(article) {
  const category = classifyTopic(article.title, article.url);
  return {
    ...article,
    topic: category.topic,
    categoryConfidence: category.confidence,
    categorySignals: category.signals
  };
}

function canonicalize(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || ["fbclid", "gclid"].includes(key)) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function parseSeenDate(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function titleTokens(title) {
  return new Set(
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .filter((token) => token.length > 2 && !clusterStopWords.has(token))
      .map((token) => token.replace(/(ing|ed|es|s)$/i, ""))
      .filter((token) => token.length > 2)
  );
}

function titleSimilarity(left, right) {
  const leftTokens = titleTokens(left);
  const rightTokens = titleTokens(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  const containment = shared / Math.min(leftTokens.size, rightTokens.size);
  const jaccard = shared / union;
  return Math.max(jaccard, shared >= 3 ? containment : 0);
}

function clusterArticles(articles) {
  const clusters = [];

  for (const article of articles) {
    let bestCluster = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      if (cluster.topic !== article.topic) continue;
      const score = Math.max(...cluster.articles.map((item) => titleSimilarity(item.title, article.title)));
      if (score >= 0.58 && score > bestScore) {
        bestCluster = cluster;
        bestScore = score;
      }
    }

    if (bestCluster) {
      bestCluster.articles.push(article);
    } else {
      clusters.push({ topic: article.topic, articles: [article] });
    }
  }

  return clusters
    .map((cluster) => {
      const distinct = [...new Map(cluster.articles.map((article) => [article.domain, article])).values()];
      const newest = distinct[0];
      const scopes = [...new Set(distinct.map((article) => article.scope))];
      return {
        id: createHash("sha256").update(distinct.map((article) => article.id).sort().join(":"))
          .digest("hex").slice(0, 18),
        title: newest.title,
        topic: cluster.topic,
        categoryConfidence: Math.round(distinct.reduce((total, article) => total + (article.categoryConfidence || 35), 0) / distinct.length),
        scope: scopes.includes("world") && scopes.length === 1 ? "world" : newest.scope,
        scopeLabel: scopes.length > 1 ? "Across regions" : newest.scopeLabel,
        seenAt: newest.seenAt,
        sourceCount: distinct.length,
        articles: distinct
      };
    })
    .filter((cluster) => cluster.sourceCount >= 2)
    .sort((a, b) => b.sourceCount - a.sourceCount || String(b.seenAt).localeCompare(String(a.seenAt)));
}

function normalizeArticle(article, scope) {
  const url = canonicalize(article.url);
  const title = String(article.title || "").trim();
  if (!url || !title) return null;

  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const domain = String(article.domain || hostname).replace(/^www\./, "");

  return applyCategory({
    id: createHash("sha256").update(url).digest("hex").slice(0, 18),
    title,
    url,
    domain,
    scope: scope.id,
    scopeLabel: scope.label,
    language: article.language || null,
    sourceCountry: article.sourcecountry || null,
    seenAt: parseSeenDate(article.seendate)
  });
}

async function fetchScope(scope) {
  const params = new URLSearchParams({
    query: scope.query,
    mode: "ArtList",
    maxrecords: String(scope.limit),
    format: "json",
    timespan,
    sort: "HybridRel"
  });

  const response = await fetch(`${endpoint}?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "wider-angle-news/0.2 (public-interest news index)"
    },
    signal: AbortSignal.timeout(30_000)
  });

  if (!response.ok) {
    throw new Error(`${scope.label}: GDELT returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  const articles = Array.isArray(payload.articles) ? payload.articles : [];
  return articles.map((article) => normalizeArticle(article, scope)).filter(Boolean);
}

async function readPreviousIndex() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    return null;
  }
}

const settled = await Promise.allSettled(scopes.map(fetchScope));
const successfulScopes = [];
const warnings = [];
const combined = [];

settled.forEach((result, index) => {
  const scope = scopes[index];
  if (result.status === "fulfilled") {
    successfulScopes.push(scope.id);
    combined.push(...result.value);
  } else {
    warnings.push(result.reason?.message || `${scope.label}: request failed`);
  }
});

const unique = [...new Map(combined.map((article) => [article.url, article])).values()]
  .sort((a, b) => String(b.seenAt).localeCompare(String(a.seenAt)))
  .slice(0, 120);

if (unique.length === 0) {
  const previous = await readPreviousIndex();
  if (previous?.articles?.length) {
    const preservedArticles = previous.articles.map(applyCategory);
    const preservedClusters = clusterArticles(preservedArticles);
    const preservedOutput = {
      ...previous,
      warnings,
      clustering: {
        method: "headline-token-similarity",
        minimumDistinctPublishers: 2,
        similarityThreshold: 0.58
      },
      clusters: preservedClusters,
      articles: preservedArticles
    };
    await writeFile(outputPath, `${JSON.stringify(preservedOutput, null, 2)}\n`, "utf8");
    console.warn("GDELT returned no usable articles; the existing cache was preserved and reclustered.");
    console.log(`Grouped ${preservedClusters.length} multi-source story clusters.`);
    warnings.forEach((warning) => console.warn(`- ${warning}`));
    process.exit(0);
  }
  throw new Error(`No usable GDELT articles were returned. ${warnings.join(" | ")}`);
}

const clusters = clusterArticles(unique);

const output = {
  generatedAt: new Date().toISOString(),
  provider: "GDELT DOC 2.0",
  timespan,
  successfulScopes,
  warnings,
  clustering: {
    method: "headline-token-similarity",
    minimumDistinctPublishers: 2,
    similarityThreshold: 0.58
  },
  clusters,
  articles: unique
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Saved ${unique.length} GDELT article signals to src/data/live-news.json.`);
console.log(`Grouped ${clusters.length} multi-source story clusters.`);
if (warnings.length) warnings.forEach((warning) => console.warn(`- ${warning}`));
