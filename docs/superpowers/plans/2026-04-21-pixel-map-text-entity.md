# Pixel Map + Text Entity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the pixel-art prototype focused on pixelized terrain and combat cues while rendering players, monsters, and NPC-style entities as readable single-character text tokens.

**Architecture:** Reuse the existing `AdventurePixelStagePrototype` and preview harness. Keep terrain, portal, projectile, danger-zone, and focus-reticle rendering in Pixi canvas, but replace entity sprite blocks with text-token chrome driven by scene-model metadata from `utils/pixelAdventurePrototype.ts`.

**Tech Stack:** React, PixiJS Legacy canvas renderer, Vitest, OpenSpec docs, Safari/browser preview verification.

---

### Task 1: Add text-token metadata to the pixel prototype scene model

**Files:**
- Modify: `utils/pixelAdventurePrototype.ts`
- Modify: `utils/pixelAdventurePrototype.test.ts`

- [ ] **Step 1: Write the failing test for entity token metadata**

```ts
it("builds readable text-token metadata for the player and monsters", () => {
  const model = buildPixelPrototypeScene({
    mapData: map20,
    playerPosition: { x: 40, y: 40 },
    activeMonsters: [
      {
        instanceId: "preview-ranged",
        templateId: "m20_c1",
        name: "蝕骨田鼬",
        x: 43,
        y: 40,
        currentHp: 42,
        rank: EnemyRank.Common,
        spawnX: 43,
        spawnY: 40,
      },
    ],
    portals: map20.portals,
    targetMonsterId: "preview-ranged",
    combatPresentation: null,
    width: 760,
    height: 560,
    isMobile: false,
  });

  expect(model.player.tokenLabel).toBe("我");
  expect(model.monsters[0]?.tokenLabel).toBe("鼬");
  expect(model.monsters[0]?.tokenTone).toBe("enemy");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `npm test -- utils/pixelAdventurePrototype.test.ts`
Expected: FAIL because `tokenLabel` / `tokenTone` do not exist on the scene model yet.

- [ ] **Step 3: Add minimal scene-model fields for token rendering**

```ts
export interface PixelPrototypeMonsterModel extends Coordinate {
  instanceId: string;
  templateId: string;
  name: string;
  archetype: PixelPrototypeMonsterArchetype;
  isTargeted: boolean;
  worldX: number;
  worldY: number;
  tokenLabel: string;
  tokenTone: "enemy" | "elite" | "boss";
}

export interface PixelPrototypePlayerModel extends Coordinate {
  worldX: number;
  worldY: number;
  tokenLabel: string;
  tokenTone: "player";
}
```

- [ ] **Step 4: Implement a stable token-label resolver**

```ts
const resolveEntityTokenLabel = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "敵";
  return trimmed[trimmed.length - 1] ?? "敵";
};
```

- [ ] **Step 5: Run the targeted test to verify it passes**

Run: `npm test -- utils/pixelAdventurePrototype.test.ts`
Expected: PASS with the new player/monster token metadata available.

- [ ] **Step 6: Commit**

```bash
git add utils/pixelAdventurePrototype.ts utils/pixelAdventurePrototype.test.ts
git commit -m "feat: add pixel prototype text token metadata"
```

### Task 2: Replace entity sprite blocks with text-token rendering in the pixel stage

**Files:**
- Modify: `components/adventure/AdventurePixelStagePrototype.tsx`
- Modify: `components/adventure/AdventurePixelStagePrototype.test.tsx`

- [ ] **Step 1: Write the failing stage test for text-token entities**

```tsx
it("renders text-token entities instead of pixel block sprites", () => {
  const markup = renderToStaticMarkup(
    <AdventurePixelStagePrototype
      mapData={map20}
      playerPosition={{ x: 40, y: 40 }}
      activeMonsters={[monsterRanged]}
      portals={map20.portals}
      targetMonsterId="monster-ranged"
      combatPresentation={null}
      width={528}
      height={528}
      onTileClick={() => undefined}
    />
  );

  expect(markup).toContain("像素地圖 + 文字 token");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `npm test -- components/adventure/AdventurePixelStagePrototype.test.tsx`
Expected: FAIL because the stage legend and runtime still assume pixel entity blocks.

- [ ] **Step 3: Remove block-sprite constants and replace them with a shared token renderer**

```ts
const drawEntityToken = ({
  container,
  centerX,
  centerY,
  label,
  tone,
  isTargeted,
  cellSize,
}: {
  container: PIXI.Container;
  centerX: number;
  centerY: number;
  label: string;
  tone: "player" | "enemy" | "elite" | "boss";
  isTargeted: boolean;
  cellSize: number;
}) => {
  const shell = new PIXI.Graphics();
  const accent = tone === "player" ? 0x4ade80 : 0xf59e0b;
  shell.beginFill(0x111827, 0.92);
  shell.lineStyle(2, accent, 1);
  shell.drawRoundedRect(-12, -12, 24, 24, 6);
  shell.endFill();

  const text = new PIXI.Text(label, {
    fontFamily: "PingFang TC, Noto Sans TC, sans-serif",
    fontSize: Math.max(14, Math.floor(cellSize * 0.42)),
    fill: 0xf8fafc,
    fontWeight: "700",
  });

  shell.x = centerX;
  shell.y = centerY;
  text.anchor.set(0.5);
  text.x = centerX;
  text.y = centerY;
  container.addChild(shell, text);
};
```

- [ ] **Step 4: Update the stage legend copy to match the new hybrid baseline**

```tsx
<div className="font-bold tracking-[0.18em] text-cyan-200">
  像素地圖 + 文字 token
</div>
```

- [ ] **Step 5: Run the targeted stage test to verify it passes**

Run: `npm test -- components/adventure/AdventurePixelStagePrototype.test.tsx`
Expected: PASS with the new legend and stage shell.

- [ ] **Step 6: Commit**

```bash
git add components/adventure/AdventurePixelStagePrototype.tsx components/adventure/AdventurePixelStagePrototype.test.tsx
git commit -m "feat: render pixel prototype entities as text tokens"
```

### Task 3: Update preview copy and docs to match the hybrid prototype

**Files:**
- Modify: `components/adventure/AdventurePixelPrototypePreview.tsx`
- Modify: `components/adventure/AdventurePixelPrototypePreview.test.tsx`
- Modify: `docs/04_UI/pixel_art_bible.md`
- Modify: `openspec/changes/evaluate-pixel-art-vertical-slice/design.md`
- Modify: `docs/superpowers/specs/2026-04-21-pixel-map-text-entity-design.md`

- [ ] **Step 1: Write the failing preview test for the new copy**

```tsx
it("describes the prototype as a pixel-map plus text-token validation surface", () => {
  const markup = renderToStaticMarkup(<AdventurePixelPrototypePreview />);

  expect(markup).toContain("像素地圖");
  expect(markup).toContain("文字 token");
});
```

- [ ] **Step 2: Run the preview test to verify it fails**

Run: `npm test -- components/adventure/AdventurePixelPrototypePreview.test.tsx`
Expected: FAIL because the preview copy still describes sprite-style pixel entities.

- [ ] **Step 3: Update preview copy and notes to explain the hybrid direction**

```tsx
<p className="mt-2 max-w-3xl text-sm leading-6 text-stone-300 md:text-[15px]">
  這個入口用來驗證像素化地圖、文字 token 實體與右側 HUD 的共存可讀性，
  不改動正式遊玩流程。
</p>
```

- [ ] **Step 4: Run the preview test to verify it passes**

Run: `npm test -- components/adventure/AdventurePixelPrototypePreview.test.tsx`
Expected: PASS with the updated copy.

- [ ] **Step 5: Commit**

```bash
git add components/adventure/AdventurePixelPrototypePreview.tsx components/adventure/AdventurePixelPrototypePreview.test.tsx docs/04_UI/pixel_art_bible.md openspec/changes/evaluate-pixel-art-vertical-slice/design.md docs/superpowers/specs/2026-04-21-pixel-map-text-entity-design.md
git commit -m "docs: align pixel prototype with text-token entities"
```

### Task 4: Verify the hybrid prototype end to end

**Files:**
- Verify only: `components/adventure/AdventurePixelStagePrototype.tsx`
- Verify only: `components/adventure/AdventurePixelPrototypePreview.tsx`
- Verify only: `utils/pixelAdventurePrototype.ts`

- [ ] **Step 1: Run the focused prototype test suite**

Run: `npm test -- utils/pixelAdventurePrototype.test.ts components/adventure/AdventurePixelStagePrototype.test.tsx components/adventure/AdventurePixelPrototypePreview.test.tsx`
Expected: PASS with all targeted prototype tests green.

- [ ] **Step 2: Run full repo verification**

Run: `npm test`
Expected: PASS with no new failing test files.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS with `tsc --noEmit`.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS; chunk-size warnings are acceptable if they remain warnings only.

- [ ] **Step 5: Run OpenSpec validation**

Run: `openspec validate evaluate-pixel-art-vertical-slice --strict`
Expected: `Change 'evaluate-pixel-art-vertical-slice' is valid`

- [ ] **Step 6: Capture manual browser evidence**

Run:

```bash
open -a Safari 'http://127.0.0.1:4181/?pixel-prototype-preview=1&pixel-prototype-mode=desktop'
open -a Safari 'http://127.0.0.1:4181/?pixel-prototype-preview=1&pixel-prototype-mode=mobile'
```

Expected: both modes show pixelized terrain with text-token entities instead of block sprites.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "test: verify hybrid pixel map text entity prototype"
```
