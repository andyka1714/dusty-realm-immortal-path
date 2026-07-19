import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const output = "output/playwright/audit-paper-cut-20260718";
await mkdir(output, { recursive: true });
const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
const context = browser.contexts()[0];
const pages = context.pages();
const sourcePage = pages[0] ?? await context.newPage();
const originalSave = await sourcePage.evaluate(() => localStorage.getItem("dusty-realm-save-v1"));
const seededSave = JSON.parse(originalSave);
seededSave.current.inventory.items = [
  { itemId: "novice_sword", count: 1 },
  { itemId: "novice_robe", count: 1 },
  { itemId: "qi_pill", count: 3 },
  { itemId: "iron_ore", count: 4 },
];
seededSave.current.character.profession = "Sword";
seededSave.current.character.skills = ["s_q_active", "s_f_active", "s_q_passive"];
seededSave.current.character.equippedActiveSkillId = "s_q_active";
const page = await context.newPage();
await page.addInitScript((save) => {
  localStorage.setItem("dusty-realm-save-v1", save);
}, JSON.stringify(seededSave));

await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:3003", { waitUntil: "networkidle" });
const modalClose = page.getByTestId("game-modal-close");
if (await modalClose.isVisible().catch(() => false)) await modalClose.click();
await page.waitForTimeout(1600);
await page.screenshot({ path: `${output}/01-desktop-adventure.png`, fullPage: true });

const inventoryButton = page.getByTestId("dock-inventory");
if (await inventoryButton.isVisible().catch(() => false)) {
  await inventoryButton.click();
  await page.getByTestId("game-shell-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${output}/02-desktop-inventory.png`, fullPage: true });
  await page.getByTestId("game-shell-panel-close").click();
}

const skillButton = page.getByTestId("dock-skills");
if (await skillButton.isVisible().catch(() => false)) {
  await skillButton.click();
  await page.getByTestId("game-shell-panel").waitFor({ state: "visible" });
  await page.mouse.move(1380, 960);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${output}/03-desktop-skills.png`, fullPage: true });
  await page.getByTestId("game-shell-panel-close").click();
}

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(700);
await page.screenshot({ path: `${output}/04-mobile-adventure.png`, fullPage: true });
if (await inventoryButton.isVisible().catch(() => false)) {
  await inventoryButton.click();
  await page.getByTestId("game-shell-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${output}/05-mobile-inventory.png`, fullPage: true });
}

const metrics = await page.evaluate(() => ({
  viewport: { width: innerWidth, height: innerHeight },
  horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
  brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
  paperIcons: document.querySelectorAll(".paper-asset-icon").length,
}));
console.log(JSON.stringify(metrics, null, 2));
await sourcePage.evaluate((save) => {
  const key = "dusty-realm-save-v1";
  if (save === null) localStorage.removeItem(key);
  else localStorage.setItem(key, save);
}, originalSave);
await page.close();
process.exit(0);
