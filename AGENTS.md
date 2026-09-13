# AGENTS.md

## Scope

This repository is a Manifest V3 browser-extension suite for Pokémon Sleep Tool. The initial targets are desktop Chrome and Edge. Keep reusable logic independent from Chromium APIs so Safari and a limited bookmarklet remain possible.

`C:\workspaces\pokesleep-tool` is a read-only reference unless the user explicitly authorizes changes. Never retire its published page as part of extension work.

## Architecture rules

- Keep browser-independent logic in `src/domain`.
- Keep each optional feature in `src/features/<feature>` and register it through `FeatureModule`.
- Confine upstream URL, DOM, and storage-format knowledge to `src/integration`.
- Confine Chrome APIs and MV3 entry points to `src/runtime/chromium` and storage implementations.
- UI must consume typed models, not inspect upstream DOM or storage directly.
- Fail closed on missing or unknown upstream data. Do not display guessed calculations or rewrite upstream storage.
- Request only minimal target-site permissions. Do not load executable code remotely.

## Workflow

- Use small PDCA units: document the plan, inspect relevant code, implement narrowly, run the closest test, adjust, then run `npm run verify`.
- Preserve user changes and avoid unrelated formatting.
- Add contract tests for every adapter/schema change and behavioral tests for domain changes.
- Before completion, test the unpacked `dist` extension in both Chrome and Edge when UI automation is available; otherwise document the manual gap.
- Commit only verified changes, one clear purpose per commit. Do not bypass hooks. Use Conventional Commit style.
- When importing upstream/fork code, record source repository, commit, original path, license, and material modifications in `THIRD_PARTY_NOTICES.md`.

## Commands

- `npm run test -- <path>`: narrow test
- `npm run typecheck`: TypeScript
- `npm run lint`: Biome check
- `npm run build`: production MV3 bundle
- `npm run sync:upstream-data`: refresh checked-in upstream JSON from `POKESLEEP_TOOL_SOURCE` or the sibling checkout
- `npm run release:prepare`: refresh upstream JSON, then run full verification
- `npm run verify`: full verification
