# Pixel Terrain Text Token Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the pixel prototype so only terrain and combat cues stay pixelized while entities render as compact single-character plaques closer to the in-map text style the user wants.

**Architecture:** Keep the existing `AdventurePixelStagePrototype` Pixi renderer and scene-model pipeline. Add one pure token-style helper for plaque/caption rules, then consume that helper from the stage renderer so the visual direction stays testable and stable across desktop/mobile preview modes.

**Tech Stack:** React, PixiJS legacy canvas renderer, Vitest, TypeScript, OpenSpec

---

### Task 1: Lock the updated hybrid direction in docs before renderer work

**Files:**
- Modify: `docs/04_UI/pixel_art_bible.md`
- Modify: `docs/superpowers/specs/2026-04-21-pixel-map-text-entity-design.md`
- Modify: `openspec/changes/evaluate-pixel-art-vertical-slice/design.md`

- [ ] **Step 1: Update the design language from generic text token to compact single-character plaque**

Document the following rules:

- terrain / portal / danger cue remain pixelized
- player / NPC / monster stay as single-character plaques
- player remains caption-free by default
- ordinary monsters stay single-character only
- targeted or high-priority enemies may show a short caption above the plaque

- [ ] **Step 2: Verify docs reflect the narrowed scope**

Run: `rg -n "單字牌|名牌|只像素化地圖|文字 token|terrain" docs/04_UI/pixel_art_bible.md docs/superpowers/specs/2026-04-21-pixel-map-text-entity-design.md openspec/changes/evaluate-pixel-art-vertical-slice/design.md`

Expected: all three files clearly state that only map/cues are pixelized and entity presentation stays text-based.

- [ ] **Step 3: Commit the docs checkpoint**

```bash
git add docs/04_UI/pixel_art_bible.md docs/superpowers/specs/2026-04-21-pixel-map-text-entity-design.md openspec/changes/evaluate-pixel-art-vertical-slice/design.md docs/superpowers/plans/2026-04-21-pixel-terrain-text-token-polish.md
git commit -m "docs: refine pixel terrain text token direction"
```

### Task 2: Add a pure plaque-style helper with TDD

**Files:**
- Create: `utils/pixelPrototypeEntityToken.ts`
- Create: `utils/pixelPrototypeEntityToken.test.ts`

- [ ] **Step 1: Write the failing tests for plaque chrome and caption rules**

```ts
it("keeps the player as a compact green plaque without caption", () => {
  expect(
    resolvePixelPrototypeEntityTokenStyle({
      tone: "player",
      cellSize: 48,
      isTargeted: false,
      name: "玩家",
    })
  ).toMatchObject({
    label: "我",
    showCaption: false,
  });
});

it("promotes targeted enemies with a caption plaque", () => {
  expect(
    resolvePixelPrototypeEntityTokenStyle({
      tone: "enemy",
      cellSize: 48,
      isTargeted: true,
      name: "蝕骨田鼬",
      label: "鼬",
    })
  ).toMatchObject({
    label: "鼬",
    caption: "蝕骨田鼬",
    showCaption: true,
  });
});
```

- [ ] **Step 2: Run the helper test and confirm RED**

Run: `npm test -- utils/pixelPrototypeEntityToken.test.ts`

Expected: FAIL because the helper file does not exist yet.

- [ ] **Step 3: Implement the minimal helper**

Expose a single pure resolver that returns:

- plaque size
- border width
- radius
- accent/fill/text colors
- caption text and whether it should render

- [ ] **Step 4: Run the helper test and confirm GREEN**

Run: `npm test -- utils/pixelPrototypeEntityToken.test.ts`

Expected: PASS

- [ ] **Step 5: Commit the helper checkpoint**

```bash
git add utils/pixelPrototypeEntityToken.ts utils/pixelPrototypeEntityToken.test.ts
git commit -m "feat: add pixel prototype plaque token helper"
```

### Task 3: Wire plaque-style tokens into the prototype renderer

**Files:**
- Modify: `components/adventure/AdventurePixelStagePrototype.tsx`
- Modify: `components/adventure/AdventurePixelStagePrototype.test.tsx`
- Modify: `components/adventure/AdventurePixelPrototypePreview.tsx`
- Modify: `components/adventure/AdventurePixelPrototypePreview.test.tsx`

- [ ] **Step 1: Write the failing renderer-copy tests for plaque wording**

```tsx
it("renders the refined single-character plaque legend", () => {
  const markup = renderToStaticMarkup(/* ... */);
  expect(markup).toContain("像素地圖 + 單字牌");
});

it("describes the preview as pixel terrain plus text plaques", () => {
  const markup = renderToStaticMarkup(<AdventurePixelPrototypePreview />);
  expect(markup).toContain("單字牌");
});
```

- [ ] **Step 2: Run the targeted renderer tests and confirm RED**

Run: `npm test -- components/adventure/AdventurePixelStagePrototype.test.tsx components/adventure/AdventurePixelPrototypePreview.test.tsx`

Expected: FAIL because the copy and renderer still use the older wording/chrome.

- [ ] **Step 3: Implement the minimal renderer changes**

Apply the helper in `drawEntityToken(...)` so the stage:

- uses a tighter plaque frame
- keeps player/monster tokens text-based
- draws a short caption above targeted enemies only
- preserves target focus, danger zone, projectile, and status cues

- [ ] **Step 4: Run the targeted renderer tests and confirm GREEN**

Run: `npm test -- components/adventure/AdventurePixelStagePrototype.test.tsx components/adventure/AdventurePixelPrototypePreview.test.tsx utils/pixelPrototypeEntityToken.test.ts`

Expected: PASS

- [ ] **Step 5: Commit the renderer checkpoint**

```bash
git add components/adventure/AdventurePixelStagePrototype.tsx components/adventure/AdventurePixelStagePrototype.test.tsx components/adventure/AdventurePixelPrototypePreview.tsx components/adventure/AdventurePixelPrototypePreview.test.tsx utils/pixelPrototypeEntityToken.ts utils/pixelPrototypeEntityToken.test.ts
git commit -m "feat: polish pixel prototype text plaques"
```

### Task 4: Full verification and visual validation

**Files:**
- Verify only: `components/adventure/AdventurePixelStagePrototype.tsx`
- Verify only: `components/adventure/AdventurePixelPrototypePreview.tsx`
- Verify only: `utils/pixelPrototypeEntityToken.ts`

- [ ] **Step 1: Run the full automated verification set**

Run: `npm test && npm run typecheck && npm run build && openspec validate evaluate-pixel-art-vertical-slice --strict`

Expected:

- tests pass
- typecheck passes
- build passes
- OpenSpec validation passes

- [ ] **Step 2: Run the preview server**

Run: `npx vite preview --host 127.0.0.1 --port 4182`

Expected: preview server is reachable on port `4182`.

- [ ] **Step 3: Verify desktop and mobile preview manually**

Open:

- `http://127.0.0.1:4182/?pixel-prototype-preview=1&pixel-prototype-mode=desktop`
- `http://127.0.0.1:4182/?pixel-prototype-preview=1&pixel-prototype-mode=mobile`

Expected:

- map terrain stays pixelized
- player and monsters render as single-character plaques
- targeted monster can show a compact name caption
- performance panel still renders
- layout remains readable in both desktop and mobile modes

- [ ] **Step 4: Commit the verified phase**

```bash
git add -A
git commit -m "test: verify pixel terrain text plaque prototype"
```
