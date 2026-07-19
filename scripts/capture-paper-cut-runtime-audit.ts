import { chromium } from "playwright";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { mkdir } from "node:fs/promises";

import adventureReducer from "../store/slices/adventureSlice";
import characterReducer, { initializeCharacter } from "../store/slices/characterSlice";
import encounterReducer from "../store/slices/encounterSlice";
import inventoryReducer, { addItem } from "../store/slices/inventorySlice";
import logReducer from "../store/slices/logSlice";
import questReducer from "../store/slices/questSlice";
import soulReducer from "../store/slices/soulSlice";
import workshopReducer from "../store/slices/workshopSlice";
import { BESTIARY } from "../data/enemies";
import { Gender, MajorRealm, SpiritRootId } from "../types";

const output = "output/playwright/audit-paper-cut-runtime-20260719";
const saveKey = "dusty-realm-save-v1";
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

const store = configureStore({ reducer: rootReducer });
store.dispatch(initializeCharacter({
  name: "玄清",
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
}));
store.dispatch(addItem({ itemId: "novice_sword", count: 1 }));
store.dispatch(addItem({ itemId: "novice_robe", count: 1 }));
store.dispatch(addItem({ itemId: "qi_pill", count: 3 }));

const state = store.getState();
const enemy = BESTIARY.m1_c1;
const now = Date.now();
const save = {
  schemaVersion: 2,
  current: {
    character: {
      ...state.character,
      majorRealm: MajorRealm.Foundation,
      spiritStones: 100000,
    },
    logs: state.logs,
    inventory: state.inventory,
    workshop: state.workshop,
    quest: state.quest,
    encounter: state.encounter,
    adventure: {
      ...state.adventure,
      currentMapId: "1",
      playerPosition: { x: 20, y: 20 },
      visitedCells: { "20,20": true, "19,20": true },
      mapHistory: { "1": true },
      activeMonsters: [{
        instanceId: "audit-paper-wolf",
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
      }],
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
  soul: state.soul,
};

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1656, height: 1081 } });
const page = await context.newPage();
await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
  key: saveKey,
  value: JSON.stringify(save),
});
await page.goto("http://127.0.0.1:3003", { waitUntil: "networkidle" });
await page.getByTestId("adventure-stage").waitFor({ state: "visible" });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${output}/01-desktop-wild-map.png` });
await page.getByTestId("dock-character").click();
await page.getByTestId("game-shell-panel").waitFor({ state: "visible" });
await page.waitForTimeout(400);
await page.screenshot({ path: `${output}/02-desktop-character-panel.png` });
const metrics = await page.evaluate(() => ({
  horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
  brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
  paperPanels: document.querySelectorAll(".paper-panel, .paper-cut-section").length,
}));
console.log(JSON.stringify(metrics, null, 2));
await browser.close();
