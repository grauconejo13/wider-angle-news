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

const topicTerms = {
  technology: ["ai", "artificial intelligence", "software", "technology", "cyber", "robot", "data center", "chip"],
  economy: ["economy", "economic", "jobs", "trade", "tariff", "inflation", "market", "business", "price", "shipping"],
  environment: ["climate", "weather", "heat", "storm", "water", "energy", "environment", "flood", "fire"],
  civic: ["election", "government", "council", "court", "law", "policy", "vote", "public", "transit"]
};

function classifyTopic(title) {
  const lower = title.toLowerCase();
  for (const [topic, terms] of Object.entries(topicTerms)) {
    if (terms.some((term) => lower.includes(term))) return topic;
  }
  return "civic";
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

function normalizeArticle(article, scope) {
  const url = canonicalize(article.url);
  const title = String(article.title || "").trim();
  if (!url || !title) return null;

  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const domain = String(article.domain || hostname).replace(/^www\./, "");

  return {
    id: createHash("sha256").update(url).digest("hex").slice(0, 18),
    title,
    url,
    domain,
    scope: scope.id,
    scopeLabel: scope.label,
    topic: classifyTopic(title),
    language: article.language || null,
    sourceCountry: article.sourcecountry || null,
    seenAt: parseSeenDate(article.seendate)
  };
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
    console.warn("GDELT returned no usable articles; the existing cache was preserved.");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
    process.exit(0);
  }
  throw new Error(`No usable GDELT articles were returned. ${warnings.join(" | ")}`);
}

const output = {
  generatedAt: new Date().toISOString(),
  provider: "GDELT DOC 2.0",
  timespan,
  successfulScopes,
  warnings,
  articles: unique
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Saved ${unique.length} GDELT article signals to src/data/live-news.json.`);
if (warnings.length) warnings.forEach((warning) => console.warn(`- ${warning}`));
