import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "output/playwright/responsive-game-audit-20260719";
await mkdir(output, { recursive: true });
const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
const context = browser.contexts()[0];
const sourcePage = context.pages()[0] ?? await context.newPage();
const originalSave = await sourcePage.evaluate(() => localStorage.getItem("dusty-realm-save-v1"));
if (!originalSave) throw new Error("需要一份已進入遊戲的本機存檔才能執行全頁稽核");

const page = sourcePage;
const issues = [];

const collectMetrics = async (state, viewport) => {
  const result = await page.evaluate(() => {
    const root = document.documentElement;
    const interactive = [...document.querySelectorAll("button, input, select, [role='button'], [role='tab']")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
      });
    return {
      horizontalOverflow: Math.max(0, root.scrollWidth - innerWidth),
      brokenImages: [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.src),
      undersizedTargets: interactive
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 30), width: Math.round(rect.width), height: Math.round(rect.height) };
        })
        .filter((target) => target.width < 40 || target.height < 40)
        .slice(0, 20),
      stage: (() => {
        const stage = document.querySelector("[data-testid='adventure-stage']");
        if (!stage) return null;
        const rect = stage.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      })(),
    };
  });
  issues.push({ state, viewport, ...result });
};

const closeOpenSurface = async () => {
  const shellClose = page.getByTestId("game-shell-panel-close");
  if (await shellClose.isVisible().catch(() => false)) await shellClose.click();
  const modalClose = page.getByTestId("game-modal-close");
  if (await modalClose.isVisible().catch(() => false)) await modalClose.click();
};

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];
const panels = ["character", "inventory", "skills", "workshop", "compendium", "map"];

for (const viewport of viewports) {
  await page.setViewportSize(viewport);
  await page.goto("http://127.0.0.1:3003", { waitUntil: "networkidle" });
  await page.getByTestId("floating-dock").waitFor({ state: "visible" });
  await closeOpenSurface();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${output}/${viewport.name}-adventure.png` });
  await collectMetrics("adventure", viewport.name);

  for (const panel of panels) {
    await page.getByTestId(`dock-${panel}`).click();
    const surface = panel === "map" ? page.getByTestId("game-modal") : page.getByTestId("game-shell-panel");
    await surface.waitFor({ state: "visible" });
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${output}/${viewport.name}-${panel}.png` });
    await collectMetrics(panel, viewport.name);
    await closeOpenSurface();
  }
}

await writeFile(`${output}/metrics.json`, JSON.stringify(issues, null, 2));
await sourcePage.evaluate((save) => {
  if (save === null) localStorage.removeItem("dusty-realm-save-v1");
  else localStorage.setItem("dusty-realm-save-v1", save);
}, originalSave);
console.log(JSON.stringify(issues, null, 2));
process.exit(0);
