## Context

像素風的產品決策已固定：只做地圖 terrain/background，不碰 actor token。v2 應該把目前 semantic motif 擴成可重複產地圖的 production language。

## Goals

- 擴 biome / tile / landmark / special terrain vocabulary
- 保持 target marker、HUD、combat overlay 可讀
- 用 regression 鎖住 actor token 不被像素化

## Non-Goals

- 不建立角色、怪物、NPC pixel sprite
- 不更改玩家 / 怪物 / NPC 文字 token
- 不重寫 PixiJS renderer 架構

## Decisions

- 主要改動集中在 deterministic terrain helper 與 background drawing
- actor layer、combat overlay、HUD 只做可讀性 guard，不做視覺替換
- pixel art bible 必須同步更新，避免後續又回到全像素化歧義
