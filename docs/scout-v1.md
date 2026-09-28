# Wider Angle Scout v1

Phase 8 introduces a deterministic source-quality pass between raw news ingestion and the public Wider Angle dataset.

## Pipeline

1. `fetch-news.mjs` gathers and normalizes GDELT article signals.
2. `scout-quality.mjs` evaluates each article against the public source registry and quality rules.
3. Rejected promotional, disabled, blocked, or malformed signals are removed.
4. Existing multi-publisher clusters are revalidated after filtering.
5. Accepted articles receive source tier, source weight, quality score, and quality status metadata.
6. Scout run statistics are written into `live-news.json` for observability.

## Source registry

`src/data/source-registry.json` contains transparent source metadata. Source tiers are operational metadata, not political or ideological ratings. Unknown publishers remain eligible with the default `standard` tier.

## Commands

- `npm run fetch-news:raw` — raw GDELT ingestion only
- `npm run scout` — quality pass over the current cache
- `npm run fetch-news` — ingestion followed by Scout
- `npm run refresh` — full ingestion, Scout, and production build

## Phase boundary

Scout v1 intentionally does not use an LLM and does not infer political bias. It improves input hygiene before later cross-source comparison and change detection phases.

A later Scout iteration can add curated RSS adapters behind the same normalized article contract without changing the public UI.
