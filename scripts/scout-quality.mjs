import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const indexPath = resolve("src/data/live-news.json");
const registryPath = resolve("src/data/source-registry.json");

const [index, registry] = await Promise.all([
  readFile(indexPath, "utf8").then(JSON.parse),
  readFile(registryPath, "utf8").then(JSON.parse)
]);

const blocked = new Set((registry.blockedDomains || []).map((value) => value.toLowerCase()));
const junkPatterns = (registry.junkTitlePatterns || []).map((value) => value.toLowerCase());
const defaults = registry.defaults || { tier: "standard", enabled: true, weight: 1 };

function sourceConfig(domain) {
  const normalized = String(domain || "").toLowerCase().replace(/^www\./, "");
  const exact = registry.sources?.[normalized];
  if (exact) return { ...defaults, ...exact };

  const parent = Object.entries(registry.sources || {}).find(([candidate]) =>
    normalized.endsWith(`.${candidate}`)
  );
  return parent ? { ...defaults, ...parent[1] } : { ...defaults };
}

function assess(article) {
  const domain = String(article.domain || "").toLowerCase().replace(/^www\./, "");
  const title = String(article.title || "").trim();
  const config = sourceConfig(domain);
  const reasons = [];

  if (!title || title.length < 18) reasons.push("title-too-short");
  if (blocked.has(domain)) reasons.push("blocked-domain");
  if (config.enabled === false) reasons.push("source-disabled");
  if (junkPatterns.some((pattern) => title.toLowerCase().includes(pattern))) reasons.push("promotional-title-pattern");

  const repeatedPunctuation = (title.match(/[!?]{2,}/g) || []).length;
  if (repeatedPunctuation > 1) reasons.push("excessive-punctuation");

  const qualityScore = Math.max(0, Math.min(100,
    Math.round(60 * Number(config.weight || 1) - reasons.length * 25)
  ));

  return {
    ...article,
    sourceName: config.name || domain,
    sourceTier: config.tier || "standard",
    sourceWeight: Number(config.weight || 1),
    qualityScore,
    qualityStatus: reasons.length ? "rejected" : "accepted",
    qualityReasons: reasons
  };
}

const assessed = (index.articles || []).map(assess);
const accepted = assessed.filter((article) => article.qualityStatus === "accepted");
const rejected = assessed.filter((article) => article.qualityStatus === "rejected");
const acceptedIds = new Set(accepted.map((article) => article.id));

const clusters = (index.clusters || [])
  .map((cluster) => {
    const articles = (cluster.articles || [])
      .map(assess)
      .filter((article) => acceptedIds.has(article.id));
    const distinctDomains = new Set(articles.map((article) => article.domain));
    if (distinctDomains.size < 2) return null;
    return {
      ...cluster,
      articles,
      sourceCount: distinctDomains.size,
      sourceQualityAverage: Math.round(
        articles.reduce((sum, article) => sum + article.qualityScore, 0) / articles.length
      )
    };
  })
  .filter(Boolean);

const output = {
  ...index,
  provider: index.provider || "GDELT DOC 2.0",
  scout: {
    version: "1.0",
    stage: "source-quality",
    registryVersion: registry.version || 1,
    assessed: assessed.length,
    accepted: accepted.length,
    rejected: rejected.length,
    rejectionSummary: rejected.reduce((summary, article) => {
      for (const reason of article.qualityReasons) summary[reason] = (summary[reason] || 0) + 1;
      return summary;
    }, {})
  },
  clusters,
  articles: accepted
};

await writeFile(indexPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Scout v1 assessed ${assessed.length} articles: ${accepted.length} accepted, ${rejected.length} rejected.`);
console.log(`Scout retained ${clusters.length} multi-source clusters after quality filtering.`);
