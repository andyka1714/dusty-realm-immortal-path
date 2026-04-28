import { expect, test, type Locator, type Page } from "@playwright/test";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { createRequire } from "node:module";

import adventureReducer from "../../store/slices/adventureSlice";
import characterReducer, {
  initializeCharacter,
} from "../../store/slices/characterSlice";
import encounterReducer from "../../store/slices/encounterSlice";
import inventoryReducer, { addItem } from "../../store/slices/inventorySlice";
import logReducer from "../../store/slices/logSlice";
import questReducer from "../../store/slices/questSlice";
import soulReducer, { createInitialSoulState } from "../../store/slices/soulSlice";
import workshopReducer from "../../store/slices/workshopSlice";
import type { PersistedSaveEnvelope } from "../../store/persistedStateMigration";
import { BESTIARY } from "../../data/enemies";
import { Gender, MajorRealm, SpiritRootId } from "../../types";
import { getAvailableReincarnationPerks } from "../../utils/reincarnation";

const require = createRequire(import.meta.url);
const { PNG } = require("playwright-core/lib/utilsBundle") as {
  PNG: {
    sync: {
      read: (buffer: Buffer) => { data: Uint8Array; width: number; height: number };
    };
  };
};

const SAVE_KEY = "dusty-realm-save-v1";

const rootReducer = combineReducers({
  character: characterReducer,
  logs: logReducer,
  adventure: adventureReducer,
  inventory: inventoryReducer,
  workshop: workshopReducer,
  quest: questReducer,
  soul: soulReducer,
  encounter: encounterReducer,
});

type RootFixtureState = ReturnType<typeof rootReducer>;

const createBaseState = () => rootReducer(undefined, { type: "@@INIT" });

const toEnvelope = (state: RootFixtureState): PersistedSaveEnvelope => ({
  schemaVersion: 2,
  current: {
    character: state.character,
    logs: state.logs,
    adventure: state.adventure,
    inventory: state.inventory,
    workshop: state.workshop,
    quest: state.quest,
    encounter: state.encounter,
  },
  soul: state.soul,
});

const installSave = async (page: Page, save: PersistedSaveEnvelope) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: SAVE_KEY, value: JSON.stringify(save) }
  );
};

const expectNoHorizontalOverflow = async (locator: Locator) => {
  await expect(locator).toBeVisible();
  const hasNoOverflow = await locator.evaluate(
    (element) => element.scrollWidth <= element.clientWidth + 1
  );
  expect(hasNoOverflow).toBe(true);
};

const expectWithinBox = async (child: Locator, parent: Locator) => {
  const childBox = await child.boundingBox();
  const parentBox = await parent.boundingBox();
  expect(childBox).not.toBeNull();
  expect(parentBox).not.toBeNull();
  if (!childBox || !parentBox) return;

  expect(childBox.x).toBeGreaterThanOrEqual(parentBox.x - 1);
  expect(childBox.y).toBeGreaterThanOrEqual(parentBox.y - 1);
  expect(childBox.x + childBox.width).toBeLessThanOrEqual(
    parentBox.x + parentBox.width + 1
  );
  expect(childBox.y + childBox.height).toBeLessThanOrEqual(
    parentBox.y + parentBox.height + 1
  );
};

const expectHorizontallyWithinBox = async (child: Locator, parent: Locator) => {
  const childBox = await child.boundingBox();
  const parentBox = await parent.boundingBox();
  expect(childBox).not.toBeNull();
  expect(parentBox).not.toBeNull();
  if (!childBox || !parentBox) return;

  expect(childBox.x).toBeGreaterThanOrEqual(parentBox.x - 1);
  expect(childBox.x + childBox.width).toBeLessThanOrEqual(
    parentBox.x + parentBox.width + 1
  );
};

const expectReadableHeight = async (locator: Locator, minHeight: number) => {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  expect(box.height).toBeGreaterThanOrEqual(minHeight);
};

const expectWithinViewport = async (locator: Locator, page: Page) => {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!box || !viewport) return;

  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + Math.min(box.height, viewport.height)).toBeLessThanOrEqual(
    viewport.height + 1
  );
};

const expectDoesNotCover = async (topLocator: Locator, lowerLocator: Locator) => {
  await expect(topLocator).toBeVisible();
  await expect(lowerLocator).toBeVisible();
  const topBox = await topLocator.boundingBox();
  const lowerBox = await lowerLocator.boundingBox();
  expect(topBox).not.toBeNull();
  expect(lowerBox).not.toBeNull();
  if (!topBox || !lowerBox) return;

  expect(topBox.y + topBox.height).toBeLessThanOrEqual(lowerBox.y + 1);
};

const expectCanvasHasNonBlackPixels = async (canvas: Locator) => {
  const image = PNG.sync.read(await canvas.screenshot({ type: "png" }));
  let nonBlack = 0;
  for (let index = 0; index < image.data.length; index += 4) {
    const alpha = image.data[index + 3];
    const brightness = image.data[index] + image.data[index + 1] + image.data[index + 2];
    if (alpha > 0 && brightness > 24) {
      nonBlack += 1;
    }
  }
  const sample = { nonBlack, total: image.width * image.height };

  expect(sample.total).toBeGreaterThan(0);
  expect(sample.nonBlack).toBeGreaterThan(sample.total * 0.05);
};

const createActiveRunSave = ({
  withPendingEncounter = false,
  pendingEventId = "fusion_sword_skyforge_oath",
}: {
  withPendingEncounter?: boolean;
  pendingEventId?: string;
} = {}) => {
  const store = configureStore({ reducer: rootReducer });

  store.dispatch(
    initializeCharacter({
      name: "韓立",
      gender: Gender.Male,
      spiritRootId: SpiritRootId.MIXED_FIVE,
      attributes: {
        physique: 12,
        rootBone: 13,
        insight: 11,
        comprehension: 14,
        fortune: 16,
        charm: 10,
      },
      lifespan: 35040,
    })
  );
  store.dispatch(addItem({ itemId: "novice_sword", count: 1 }));
  store.dispatch(addItem({ itemId: "novice_robe", count: 1 }));
  store.dispatch(addItem({ itemId: "qi_pill", count: 3 }));
  store.dispatch(addItem({ itemId: "iron_ore", count: 4 }));

  const state = store.getState();

  return toEnvelope({
    ...state,
    character: {
      ...state.character,
      majorRealm: MajorRealm.Foundation,
      spiritStones: 100000,
    },
    encounter: withPendingEncounter
      ? {
          pendingEvent: {
            eventId: pendingEventId,
            year: 42,
          },
          resolvedEventIds: [],
        }
      : state.encounter,
  });
};

const createVillageRunSave = () => {
  const save = createActiveRunSave();
  const adventure = save.current.adventure as RootFixtureState["adventure"];

  return {
    ...save,
    current: {
      ...save.current,
      adventure: {
        ...adventure,
        currentMapId: "0",
        playerPosition: { x: 20, y: 20 },
        visitedCells: { "20,20": true },
        activeMonsters: [],
        mapHistory: { "0": true },
      },
    },
  };
};

const createWildCombatRunSave = () => {
  const save = createActiveRunSave();
  const adventure = save.current.adventure as RootFixtureState["adventure"];
  const enemy = BESTIARY.m1_c1;
  const now = Date.now();

  return {
    ...save,
    current: {
      ...save.current,
      adventure: {
        ...adventure,
        currentMapId: "1",
        playerPosition: { x: 20, y: 20 },
        visitedCells: { "20,20": true, "19,20": true },
        mapHistory: { "1": true },
        activeMonsters: [
          {
            instanceId: "e2e-wild-dog",
            templateId: enemy.id,
            name: enemy.name,
            symbol: enemy.symbol,
            x: 19,
            y: 20,
            spawnX: 19,
            spawnY: 20,
            currentHp: enemy.maxHp,
            rank: enemy.rank,
            nextMoveTime: now + 60_000,
          },
        ],
        isBattling: false,
        currentEnemy: null,
        currentEnemyInstanceId: null,
        battleLogs: [],
        lastBattleResult: null,
        lastCommonSpawnTime: now,
        lastEliteSpawnTime: now,
        lastBossSpawnCheckTime: now,
      },
    },
  };
};

const createReincarnationHallSave = () => {
  const base = createBaseState();
  const lifetimeStats = {
    highestRealmEver: MajorRealm.NascentSoul,
    highestAgeYears: 620,
    totalDeaths: 4,
    totalReincarnations: 1,
  };
  const worldMemoryTags = ["route:sword:soul-sheath"];
  const summary = {
    cause: "lifespan" as const,
    ageYears: 620,
    highestRealm: MajorRealm.NascentSoul,
    realmMerit: 1000,
    ageMerit: 310,
    totalMeritGained: 1310,
    eligibleHeirlooms: [],
  };

  return toEnvelope({
    ...base,
    character: {
      ...base.character,
      isInitialized: true,
      isDead: true,
      name: "韓立",
      gender: Gender.Male,
      majorRealm: MajorRealm.NascentSoul,
      age: 620 * 365,
    },
    soul: {
      ...createInitialSoulState(),
      totalMerit: 1310,
      flowStep: "hall",
      lifetimeStats,
      unlockedPerkIds: getAvailableReincarnationPerks({
        lifetimeStats,
        worldMemoryTags,
      }).map((perk) => perk.id),
      worldMemoryTags,
      pendingLifeReview: summary,
      rebirthConfig: {
        plannerVersion: 2,
        selectedBuildIdentity: "balanced",
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      },
    },
  });
};

test("reincarnation hall keeps the mobile-first shared-control flow operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installSave(page, createReincarnationHallSave());

  await page.goto("/");

  await expect(page.getByText("輪迴大殿")).toBeVisible();
  await page.getByTestId("rebirth-build-sword").click();
  await page.getByTestId("rebirth-confirm").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("rebirth-confirm")).toBeVisible();
});

test("game shell overlay exposes inventory shared controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installSave(page, createActiveRunSave());

  await page.goto("/");

  await expect(page.getByTestId("dock-inventory")).toBeVisible();
  await page.getByTestId("dock-inventory").click();

  await expect(page.getByTestId("game-shell-panel")).toBeVisible();
  await expect(page.getByTestId("inventory-sort")).toBeVisible();
  const inventorySidePanel = page.getByTestId("inventory-side-panel");
  const selectedItemCard = page.locator("section").filter({ hasText: "物品詳情" }).first();
  const equipmentSection = page.locator("section").filter({ hasText: "當前裝備" }).first();

  await page.getByText("鏽鐵劍").click();
  await expect(selectedItemCard).toContainText("雖然生鏽了");
  await expect(selectedItemCard).toContainText("基礎屬性");
  await expect(selectedItemCard).toContainText("攻擊");
  await expect(selectedItemCard.getByRole("button", { name: "裝備" })).toBeVisible();
  await expect(equipmentSection).toContainText("武器");
  await expectNoHorizontalOverflow(inventorySidePanel);
  await expectNoHorizontalOverflow(selectedItemCard);
  await expectReadableHeight(selectedItemCard, 260);
  await expectReadableHeight(equipmentSection, 260);

  const sidePanelBox = await inventorySidePanel.boundingBox();
  const detailBox = await selectedItemCard.boundingBox();
  const equipmentBox = await equipmentSection.boundingBox();
  expect(sidePanelBox).not.toBeNull();
  expect(detailBox).not.toBeNull();
  expect(equipmentBox).not.toBeNull();
  if (sidePanelBox && detailBox && equipmentBox) {
    expect(detailBox.y).toBeGreaterThanOrEqual(sidePanelBox.y);
    expect(detailBox.y + detailBox.height).toBeLessThanOrEqual(equipmentBox.y);
    expect(equipmentBox.y + equipmentBox.height).toBeLessThanOrEqual(
      sidePanelBox.y + sidePanelBox.height + 1
    );
  }

  await page.getByTestId("inventory-filter-consumable").click();
  await expect(page.getByRole("tab", { name: "丹藥" })).toHaveAttribute(
    "data-state",
    "active"
  );
  await page.getByTestId("inventory-toggle-delete-mode").click();
  await expect(page.getByTestId("inventory-bulk-delete-confirm")).toBeVisible();
  await page.getByTestId("game-shell-panel-close").click();
  await expect(page.getByTestId("game-shell-panel")).toBeHidden();
});

test("character panel keeps dashboard panes and stat tooltip anchored", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installSave(page, createActiveRunSave());

  await page.goto("/");

  await page.getByTestId("dock-character").click();

  const panel = page.getByTestId("game-shell-panel");
  const dashboard = page.getByTestId("dashboard-character-panel");
  const logPanel = page.getByTestId("dashboard-log-panel");
  const logContent = logPanel.getByTestId("log-panel");
  const statsPanel = page.getByTestId("stats-panel");
  const spiritRootRow = page.getByTestId("stats-row-spirit-root");
  const actionsSection = page.locator("section").filter({ hasText: "修行抉擇" }).first();
  const guideSection = page.locator("section").filter({ hasText: "修煉指南" }).first();
  const manualCultivate = page.getByTestId("dashboard-manual-cultivate");
  const seclusion = page.getByTestId("dashboard-start-seclusion");
  const breakthrough = page.getByTestId("dashboard-breakthrough");
  const voluntaryReincarnation = page.getByTestId("dashboard-voluntary-reincarnation");

  await expect(panel).toBeVisible();
  await expect(dashboard).toBeVisible();
  await expectWithinBox(logPanel, panel);
  await expectWithinBox(statsPanel, panel);
  await expectNoHorizontalOverflow(dashboard);
  await expect(logContent).toContainText("修煉日誌");
  await expect(logContent).toContainText("暫無消息");
  await expect(guideSection).toContainText("閉關雖能大幅提升修為");
  await expectNoHorizontalOverflow(actionsSection);
  await expectNoHorizontalOverflow(guideSection);
  await expectNoHorizontalOverflow(logPanel);
  await expectDoesNotCover(actionsSection, guideSection);
  await expectDoesNotCover(guideSection, logPanel);

  const logPanelBox = await logPanel.boundingBox();
  expect(logPanelBox).not.toBeNull();
  if (logPanelBox) {
    expect(logPanelBox.height).toBeGreaterThan(160);
  }

  const manualBox = await manualCultivate.boundingBox();
  const seclusionBox = await seclusion.boundingBox();
  const breakthroughBox = await breakthrough.boundingBox();
  const voluntaryBox = await voluntaryReincarnation.boundingBox();
  const actionsBox = await actionsSection.boundingBox();
  const guideBox = await guideSection.boundingBox();
  expect(manualBox).not.toBeNull();
  expect(seclusionBox).not.toBeNull();
  expect(breakthroughBox).not.toBeNull();
  expect(voluntaryBox).not.toBeNull();
  expect(actionsBox).not.toBeNull();
  expect(guideBox).not.toBeNull();
  if (manualBox && seclusionBox && breakthroughBox && voluntaryBox && actionsBox && guideBox) {
    const actionBoxes = [manualBox, seclusionBox, breakthroughBox, voluntaryBox];
    const rowY = manualBox.y;
    actionBoxes.forEach((box) => {
      expect(Math.abs(box.y - rowY)).toBeLessThanOrEqual(4);
      expect(Math.abs(box.height - manualBox.height)).toBeLessThanOrEqual(4);
      expect(box.y + box.height).toBeLessThanOrEqual(actionsBox.y + actionsBox.height - 8);
    });
    expect(Math.abs(breakthroughBox.height - manualBox.height)).toBeLessThanOrEqual(4);
    expect(breakthroughBox.y).toBeGreaterThanOrEqual(manualBox.y - 1);
    expect(voluntaryBox.x).toBeGreaterThan(breakthroughBox.x + breakthroughBox.width - 8);
    expect(guideBox.height).toBeGreaterThanOrEqual(72);
  }

  await spiritRootRow.scrollIntoViewIfNeeded();
  const rowBox = await spiritRootRow.boundingBox();
  expect(rowBox).not.toBeNull();
  await spiritRootRow.hover();
  const tooltip = page.getByTestId("game-tooltip");
  await expect(tooltip).toBeVisible();

  const tooltipBox = await tooltip.boundingBox();
  expect(tooltipBox).not.toBeNull();
  if (tooltipBox && rowBox) {
    expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
    expect(tooltipBox.y).toBeGreaterThanOrEqual(0);
    expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(1440);
    expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(1000);

    const horizontalGap =
      tooltipBox.x >= rowBox.x + rowBox.width
        ? tooltipBox.x - (rowBox.x + rowBox.width)
        : rowBox.x - (tooltipBox.x + tooltipBox.width);
    expect(horizontalGap).toBeLessThanOrEqual(36);
  }
});

test("workshop and compendium embedded panels avoid horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installSave(page, createActiveRunSave());

  await page.goto("/");

  await page.getByTestId("dock-workshop").click();
  const workshopPanel = page.getByTestId("workshop-panel");
  await expect(workshopPanel).toBeVisible();
  await expect(page.getByTestId("workshop-grid")).toBeVisible();
  await expect(page.getByTestId("workshop-specialization-alchemy")).toBeVisible();
  await expectNoHorizontalOverflow(workshopPanel);
  await expectHorizontallyWithinBox(
    page.getByTestId("workshop-specialization-alchemy"),
    workshopPanel
  );
  await page.getByTestId("workshop-recipe-card-qi_pill").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("workshop-recipe-card-qi_pill")).toBeVisible();
  await expect(page.getByTestId("workshop-recipe-card-qi_pill")).toContainText("材料");
  await expect(page.getByTestId("workshop-recipe-card-qi_pill")).toContainText("產出");
  await expectHorizontallyWithinBox(page.getByTestId("workshop-recipe-card-qi_pill"), workshopPanel);

  await page.getByTestId("game-shell-panel-close").click();
  await expect(page.getByTestId("game-shell-panel")).toBeHidden();

  await page.getByTestId("dock-compendium").click();
  const compendiumPanel = page.getByTestId("compendium-panel");
  await expect(compendiumPanel).toBeVisible();
  await page.getByTestId("compendium-tab-map").click();
  await expect(page.getByTestId("compendium-map-layout")).toBeVisible();
  await expect(page.getByTestId("compendium-map-list")).toBeVisible();
  await expect(page.getByTestId("compendium-map-detail")).toBeVisible();
  await page.getByText("北郊荒徑").first().click();
  await expect(page.getByTestId("compendium-enemy-card-m1_c1")).toBeVisible();
  await expect(page.getByTestId("compendium-enemy-power-m1_c1")).toContainText("戰力");
  await expect(page.getByTestId("compendium-enemy-card-m1_c1")).toContainText("氣血");
  await expect(page.getByTestId("compendium-enemy-card-m1_c1")).toContainText("特殊攻擊");

  await page.getByTestId("compendium-tab-item").click();
  await expect(page.getByTestId("compendium-item-header")).toBeVisible();
  const itemHeading = page.getByTestId("compendium-item-realm-heading-0");
  const firstItemCard = page.getByTestId("compendium-item-card-novice_sword");
  await firstItemCard.scrollIntoViewIfNeeded();
  await expectDoesNotCover(itemHeading, firstItemCard);
  await page.getByTestId("compendium-item-card-sword_path_starsteel").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("compendium-item-source-sword_path_starsteel")).toContainText(
    "sect:sword:world-chapter-03"
  );
  await expect(page.getByTestId("compendium-item-source-sword_path_starsteel")).toContainText(
    "Workshop sink"
  );

  await page.getByTestId("compendium-tab-skill").click();
  await expect(page.getByTestId("compendium-skill-summary")).toContainText("劍修功法");
  await expect(page.getByTestId("compendium-skill-profession-sword")).toBeVisible();
  await expect(page.getByTestId("compendium-skill-realm-1")).toBeVisible();
  await expect(page.getByText("疾風三疊")).toBeVisible();
  await expect(page.getByText("凡界藏經閣、宗門入門試煉")).toBeVisible();

  await page.getByTestId("compendium-tab-sect").click();
  await expect(page.getByTestId("compendium-sect-panel-sword")).toBeVisible();
  await expect(page.getByText("章節線索")).toBeVisible();
  await expect(page.getByTestId("compendium-sect-route-source-sword")).toContainText(
    "sect:sword:world-chapter-03"
  );
  await expect(page.getByTestId("compendium-sect-endgame-source-sword")).toContainText(
    "sect:sword:endgame-loop-v4"
  );
  await page.getByTestId("compendium-sect-tab-body").click();
  await expect(page.getByTestId("compendium-sect-panel-body")).toBeVisible();
  await expect(page.getByTestId("compendium-sect-route-source-body")).toContainText(
    "萬獸血骨殘材"
  );
  await expect(page.getByTestId("compendium-sect-endgame-source-body")).toContainText(
    "sect:beast:endgame-loop-v4"
  );
  await expectNoHorizontalOverflow(compendiumPanel);
});

test("mobile workshop and compendium panels stay inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installSave(page, createActiveRunSave());

  await page.goto("/");

  await page.getByTestId("dock-workshop").click();
  const workshopPanel = page.getByTestId("game-shell-panel");
  await expectWithinViewport(workshopPanel, page);
  await expectNoHorizontalOverflow(page.getByTestId("workshop-panel"));
  await expect(page.getByTestId("workshop-grid")).toBeVisible();
  await page.getByTestId("workshop-recipe-card-qi_pill").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("workshop-recipe-card-qi_pill")).toBeVisible();

  await page.getByTestId("game-shell-panel-close").click();
  await expect(workshopPanel).toBeHidden();

  await page.getByTestId("dock-compendium").click();
  const compendiumShell = page.getByTestId("game-shell-panel");
  await expectWithinViewport(compendiumShell, page);
  await page.getByTestId("compendium-tab-item").click();
  await expect(page.getByTestId("compendium-item-header")).toBeVisible();
  await expectNoHorizontalOverflow(page.getByTestId("compendium-panel"));
  await page.getByTestId("compendium-item-card-novice_sword").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("compendium-item-card-novice_sword")).toBeVisible();
  await page.getByTestId("compendium-item-card-sword_path_starsteel").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("compendium-item-source-sword_path_starsteel")).toContainText(
    "來源追蹤"
  );
  await page.getByTestId("compendium-tab-skill").click();
  await expect(page.getByTestId("compendium-skill-summary")).toContainText("劍修功法");
  await expect(page.getByTestId("compendium-skill-profession-sword")).toBeVisible();
  await expect(page.getByText("凡界藏經閣、宗門入門試煉")).toBeVisible();
  await expectNoHorizontalOverflow(page.getByTestId("compendium-panel"));
  await page.getByTestId("compendium-tab-sect").click();
  await expect(page.getByTestId("compendium-sect-tab-sword")).toBeVisible();
  await expect(page.getByTestId("compendium-sect-panel-sword")).toBeVisible();
  await expect(page.getByTestId("compendium-sect-route-source-sword")).toContainText(
    "凌霄劍星鋼"
  );
  await expect(page.getByTestId("compendium-sect-endgame-source-sword")).toContainText(
    "sect:sword:endgame-loop-v4"
  );
  await expectNoHorizontalOverflow(page.getByTestId("compendium-panel"));
});

test("area and world map modal render visible map surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installSave(page, createWildCombatRunSave());

  await page.goto("/");

  await page.getByTestId("adventure-minimap-open").click();

  const modal = page.getByTestId("game-modal");
  const areaMap = page.getByTestId("adventure-area-map");
  const surface = page.getByTestId("adventure-area-map-surface");

  await expect(modal).toBeVisible();
  await expect(page.getByTestId("adventure-map-modal-content")).toBeVisible();
  await expect(areaMap).toBeVisible();
  await expect(surface).toBeVisible();
  await expect(page.getByTestId("adventure-area-map-player")).toBeVisible();

  const surfaceBox = await surface.boundingBox();
  expect(surfaceBox).not.toBeNull();
  if (surfaceBox) {
    expect(surfaceBox.width).toBeGreaterThan(300);
    expect(surfaceBox.height).toBeGreaterThan(300);
  }

  const surfacePaint = await surface.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
    };
  });
  expect(surfacePaint.backgroundColor).not.toBe("rgb(0, 0, 0)");
  expect(surfacePaint.backgroundImage).not.toBe("none");

  await page.getByTestId("adventure-map-tab-world").click();
  await expect(page.getByTestId("adventure-world-map")).toBeVisible();
  await expect(page.getByTestId("adventure-world-map-scroll")).toBeVisible();
});

test("adventure canvas and mobile map modal keep visible non-black surfaces", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installSave(page, createWildCombatRunSave());

  await page.goto("/");

  const canvas = page.getByTestId("adventure-stage").locator("canvas");
  await expect(canvas).toBeVisible();
  await expectCanvasHasNonBlackPixels(canvas);

  await page.getByTestId("adventure-minimap-open").click();
  const modal = page.getByTestId("game-modal");
  await expectWithinViewport(modal, page);
  await expectNoHorizontalOverflow(page.getByTestId("adventure-map-modal-content"));
  await expect(page.getByTestId("adventure-area-map-surface")).toBeVisible();
});

test("safe village state hides world-combat shortcuts", async ({ page }) => {
  await installSave(page, createVillageRunSave());

  await page.goto("/");

  await expect(page.getByText("城鎮中")).toBeVisible();
  await expect(page.getByTestId("adventure-command-basic-attack")).toBeHidden();
  await expect(page.getByTestId("adventure-command-auto-battle")).toBeHidden();
});

test("pending encounter modal keeps choice selectors inside the shared dialog shell", async ({
  page,
}) => {
  await installSave(page, createActiveRunSave({ withPendingEncounter: true }));

  await page.goto("/");

  await expect(page.getByTestId("game-modal")).toBeVisible();
  await expect(
    page.getByTestId("pending-encounter-choice-temper_skyforge")
  ).toBeVisible();
  await page.getByTestId("game-modal-close").click();
  await expect(page.getByTestId("game-modal")).toBeHidden();
});

test("mobile pending encounter modal exposes v3 route cues without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installSave(
    page,
    createActiveRunSave({
      withPendingEncounter: true,
      pendingEventId: "sword_emperor_heaven_sunder_oath",
    })
  );

  await page.goto("/");

  const modal = page.getByTestId("game-modal");
  await expectWithinViewport(modal, page);
  await expectNoHorizontalOverflow(modal);
  await expect(modal.getByText("仙帝終盤路線").first()).toBeVisible();
  await expect(modal.getByText("凌霄劍宗帝境", { exact: true })).toBeVisible();
  await expect(modal.getByText("凌霄劍星鋼 x2")).toBeVisible();
  await expect(
    page.getByTestId("pending-encounter-choice-claim_heaven_sunder_starsteel")
  ).toBeVisible();
});

test("clicking an adjacent monster starts world combat without waiting for auto battle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await installSave(page, createWildCombatRunSave());

  await page.goto("/");

  const canvas = page.getByTestId("adventure-stage").locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.getByText("歷練中")).toBeVisible();
  await expect(page.getByTestId("adventure-action-wheel")).toBeVisible();
  await expect(page.getByTestId("adventure-command-surface")).toBeHidden();

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width / 2 - 40, box.y + box.height / 2);

  await expect(page.getByText("荒徑野狗").first()).toBeVisible();
  await expect(page.getByTestId("adventure-action-basic-attack")).toBeEnabled();
  await expect(page.getByText(/造成\s+\d+\s+點傷害/).first()).toBeVisible({
    timeout: 2000,
  });
});
