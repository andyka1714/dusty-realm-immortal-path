# Humanoid Sprite Standard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 player / NPC 共用的人形 walk sprite 標準，並重新生成男女凡人走路素材。

**Architecture:** TypeScript 端提供標準常數與 asset metadata，讓 runtime / registry 可以驗證人形素材契約。資產端用 deterministic normalizer 將 raw 4x4 sheet 正規化到 96x96 frame、80px 高度、footline 88、centerX 48，並用 QC gate 拒收不一致輸出。

**Tech Stack:** TypeScript、Vitest、Pillow、OpenSpec、Vite public assets。

---

### Task 1: Humanoid Sprite Metadata

**Files:**
- Create: `utils/humanoidSpriteStandard.ts`
- Create: `utils/humanoidSpriteStandard.test.ts`
- Modify: `data/assets/types.ts`
- Modify: `data/assets/assetRegistry.ts`
- Modify: `data/assets/assetRegistry.test.ts`

- [ ] **Step 1: Write tests for standard constants and metadata**

Run: `npm test -- utils/humanoidSpriteStandard.test.ts data/assets/assetRegistry.test.ts`
Expected before implementation: FAIL because `utils/humanoidSpriteStandard` and metadata fields do not exist.

- [ ] **Step 2: Implement constants and metadata**

Add `HUMANOID_WALK_SPRITE_STANDARD` with:

```ts
frameWidth: 96
frameHeight: 96
targetHeight: 80
heightTolerance: 1
footlineY: 88
centerX: 48
centerTolerance: 1
rowOrder: ["down", "left", "right", "up"]
```

Extend `GeneratedSpriteMetadata` with optional humanoid fields and assign them to male/female player walk assets.

- [ ] **Step 3: Run tests**

Run: `npm test -- utils/humanoidSpriteStandard.test.ts data/assets/assetRegistry.test.ts`
Expected: PASS.

### Task 2: Deterministic Normalizer / QC

**Files:**
- Create: `scripts/normalize_humanoid_walk_sprite.py`
- Generated assets under `public/assets/generated/characters/player/*`

- [ ] **Step 1: Implement Python normalizer**

The script accepts `--input`, `--output-dir`, `--prompt-file`, and writes:

```text
raw-sheet.png
sheet-transparent.png
frames/player_sheet-1.png ... player_sheet-16.png
animation.gif
pipeline-meta.json
```

It normalizes each frame to 96x96, target height 80, footline 88, centerX 48, removes chroma-key background, and verifies final output.

- [ ] **Step 2: Run QC on current bad assets**

Run normalizer QC against current assets and confirm it reports current male/female height drift before replacing them.

### Task 3: Regenerate Male/Female Raw Sheets

**Files:**
- Replace generated image bundles under:
  - `public/assets/generated/characters/player/mortal-male-v1/`
  - `public/assets/generated/characters/player/mortal-female-v1/`

- [ ] **Step 1: Generate raw sheets**

Use `image_gen` to create strict 4x4 top-down RPG walk sheets for male and female mortal characters with wooden sword on back.

- [ ] **Step 2: Normalize and QC**

Run `scripts/normalize_humanoid_walk_sprite.py` on each raw sheet. If QC fails, reject and regenerate.

- [ ] **Step 3: Review sheets visually**

Use `view_image` on final `sheet-transparent.png` and representative up/side frames.

### Task 4: Runtime / Verification

**Files:**
- `components/adventure/AdventureStage.tsx`
- `data/assets/assetRegistry.ts`
- `utils/playerSpriteAnimation.ts`

- [ ] **Step 1: Confirm runtime uses independent frame PNG**

AdventureStage must load frame URLs from registry and not runtime-crop walk frames from sheet.

- [ ] **Step 2: Run verification**

Run:

```bash
npm test -- utils/humanoidSpriteStandard.test.ts data/assets/assetRegistry.test.ts utils/playerSpriteAnimation.test.ts utils/pixelAdventurePrototype.test.ts
npm run typecheck
openspec validate add-humanoid-sprite-standard --strict
```

Expected: all pass.
