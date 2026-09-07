# Technical architecture

## Current MVP

The current project is a Vite-powered static application:

```text
src/index.html    Interface structure
src/styles.css    Editorial and responsive styling
src/app.js        Demo data, filters, modes, and analysis dialogs
dist/             Generated production build
```

Run locally with `npm run dev` and generate the production output with
`npm run build`.

## Planned data flow

```text
GDELT + curated RSS + public records
                  |
             normalize URLs
                  |
        identify likely duplicates
                  |
            form story clusters
                  |
       retrieve permitted source text
                  |
     one structured AI analysis per cluster
                  |
          validation and confidence rules
                  |
             cached story record
                  |
        My Orbit / Wider World filters
```

## Cost-control rules

- Fetch feeds on a schedule rather than on every page request.
- Analyze a cluster once and reuse the result for every reader.
- Use location and subject tags for personalization without additional AI calls.
- Begin with a limited, reviewed source set.
- Reprocess a cluster only when materially new information appears.
- Meter any future open-ended research features separately.

## Proposed story record

```json
{
  "id": "stable-cluster-id",
  "headline": "Descriptive shared headline",
  "summary": "Concise multi-source account",
  "status": "developing",
  "locations": ["San Antonio", "Texas", "United States"],
  "topics": ["technology", "energy"],
  "agency": "prepare",
  "establishedPoints": [],
  "unclearPoints": [],
  "angles": [],
  "sources": [],
  "firstSeenAt": "ISO-8601 timestamp",
  "lastAnalyzedAt": "ISO-8601 timestamp"
}
```

## Source and copyright boundary

The product should store and display only content it has permission to process:
feed content, allowed excerpts, public records, licensed material, and necessary
metadata. It should link to original publishers rather than republishing complete
articles.
