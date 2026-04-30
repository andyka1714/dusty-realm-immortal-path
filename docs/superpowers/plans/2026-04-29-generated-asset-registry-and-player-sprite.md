# Generated Asset Registry and Player Sprite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立生成素材 registry 基底，並產出第一個男性凡人主角 sprite bundle。

**Architecture:** 素材檔放在 `public/assets/generated/**`，runtime 只透過 `assetId` 查 registry，不直接依賴散落圖片路徑。第一階段只註冊與驗證玩家素材，不把所有 domain model 一次改完。

**Tech Stack:** TypeScript, React/Vite public assets, Vitest, OpenSpec, `$generate2dsprite`, built-in image generation.

---

### Task 1: OpenSpec 與文件

**Files:**
- Create: `docs/superpowers/specs/2026-04-29-generated-asset-pipeline-design.md`
- Create: `openspec/changes/add-generated-asset-registry-and-player-sprite/*`

- [x] 寫入完整素材管線設計。
- [x] 建立 OpenSpec proposal / tasks / specs。
- [x] 驗證 `openspec validate add-generated-asset-registry-and-player-sprite --strict`。

### Task 2: Asset Registry

**Files:**
- Create: `data/assets/types.ts`
- Create: `data/assets/assetRegistry.ts`
- Create: `data/assets/assetRegistry.test.ts`
- Create: `data/assets/index.ts`

- [ ] 新增 RED test：已註冊玩家素材可解析。
- [ ] 新增 RED test：未知 assetId fallback。
- [ ] 實作 `AssetDefinition`、`getAssetDefinition`、`getAssetFileUrl`。
- [ ] 跑 targeted tests。

### Task 3: Player Sprite Metadata

**Files:**
- Create: `public/assets/generated/characters/player/mortal-male-v1/asset.json`
- Create: `public/assets/generated/characters/player/mortal-male-v1/prompt-used.txt`
- Create: `public/assets/generated/characters/player/mortal-male-v1/pipeline-meta.json`

- [ ] 寫入男性凡人角色素材 metadata。
- [ ] 將 metadata 與 registry 保持一致。
- [ ] 跑 targeted tests。

### Task 4: Generate Sprite

**Files:**
- Create: `public/assets/generated/characters/player/mortal-male-v1/raw-sheet.png`
- Create: `public/assets/generated/characters/player/mortal-male-v1/sheet-transparent.png`
- Create: `public/assets/generated/characters/player/mortal-male-v1/frames/*`
- Create: `public/assets/generated/characters/player/mortal-male-v1/animation.gif`

- [ ] 使用 `$generate2dsprite` prompt 產生 4x4 男性凡人 walk sheet raw image。
- [ ] 使用 `generate2dsprite.py process` 後處理 magenta key、切幀與 GIF。
- [ ] 檢查輸出是否符合 rows/cols/anchor metadata。

### Task 5: Verification

- [ ] 跑 `npm test -- data/assets/assetRegistry.test.ts`
- [ ] 跑 `npm run typecheck`
- [ ] 跑 `npm run build`
- [ ] 跑 `openspec validate add-generated-asset-registry-and-player-sprite --strict`
- [ ] 跑 `git diff --check`
