import { expect, test, type Page } from "@playwright/test";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

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
import { Gender, MajorRealm, SpiritRootId } from "../../types";
import { getAvailableReincarnationPerks } from "../../utils/reincarnation";

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

const createActiveRunSave = ({
  withPendingEncounter = false,
}: {
  withPendingEncounter?: boolean;
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
            eventId: "fusion_sword_skyforge_oath",
            year: 42,
          },
          resolvedEventIds: [],
        }
      : state.encounter,
  });
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
  await installSave(page, createActiveRunSave());

  await page.goto("/");

  await expect(page.getByTestId("dock-inventory")).toBeVisible();
  await page.getByTestId("dock-inventory").click();

  await expect(page.getByTestId("game-shell-panel")).toBeVisible();
  await expect(page.getByTestId("inventory-sort")).toBeVisible();
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

test("pending encounter modal keeps choice selectors inside the shared dialog shell", async ({
  page,
}) => {
  await installSave(page, createActiveRunSave({ withPendingEncounter: true }));

  await page.goto("/");

  await expect(page.getByTestId("game-modal")).toBeVisible();
  await expect(
    page.getByTestId("pending-encounter-choice-temper_skyforge")
  ).toBeVisible();
});
