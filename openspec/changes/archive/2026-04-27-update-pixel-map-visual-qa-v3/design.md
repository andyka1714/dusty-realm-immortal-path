# Design: 像素地圖 visual QA v3

## Context

`utils/adventureTerrainPixelization.ts` 已提供正式 terrain/background pixelization：

- palette: 由 `mapData.theme` 解析。
- semantic role: `ground / variation / landmark / resourceNode / water / path / hazard / portalClearing / bossArena / poi`。
- skeleton: 代表不同 route / biome 的 floorplan。
- render motif: `portalThreshold / arenaRunes / hazardVeins / waterBands / corridorEdges` 等。
- guard: `ADVENTURE_TERRAIN_FORBIDDEN_ACTOR_KEYS` 防止 actor token、sprite、HUD、combat overlay 混入 terrain tile。

這輪不再重做 renderer，而是把 QA 變成可重複的 helper 與 regression。

## Goals

- 建立 `getAdventureTerrainVisualQaReport` 或等效 helper，回傳 semantic role、skeleton、motif、palette、tile key safety 的摘要。
- 覆蓋代表地圖族群，至少包含低階、宗門、五行 / 特殊地貌、渡劫 / 仙人、終盤。
- 讓 regression 明確檢查 path、water、hazard、portal threshold、boss arena、POI / resource node 是否存在。
- 維持 actor token / HUD / combat overlay 現狀，不把它們像素化。
- 不新增 persisted state。

## Non-Goals

- 不新增 3D。
- 不新增玩家、NPC、怪物 pixel sprite。
- 不重寫 `AdventureStage` renderer、戰鬥控制或地圖 runtime。
- 不新增新地圖內容；後續 `expand-map-local-content-density-v3` 才處理 local hook / NPC / rumor。

## QA Helper

Helper 應該只吃既有 terrain tiles 與 map metadata，輸出：

- `mapId`
- `theme`
- `paletteTheme`
- `semanticRoles`
- `skeletonIds`
- `motifKinds`
- `hasForbiddenActorKeys`
- `tileCount`

測試可用 table-driven representative maps 建報告，確認：

- 每張代表圖有至少一個 semantic role 與 skeleton。
- route / biome maps 不全是相同 skeleton。
- special terrain maps 包含 water / hazard / portal / boss / poi 對應 motif。
- forbidden actor token keys 仍為 false。

## Testing

- `npm test -- utils/adventureTerrainPixelization.test.ts`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `openspec validate --all --strict`
- `git diff --check`

## Release Notes

完成後回寫 base specs 與 tracking docs。Archive 時若 base specs 已在 implementation commit 回寫，使用 `--skip-specs --yes`。
