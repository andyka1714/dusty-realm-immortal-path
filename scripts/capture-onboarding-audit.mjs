import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const output = "output/playwright/audit-paper-cut-20260718";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.addInitScript(() => localStorage.removeItem("dusty-realm-save-v1"));
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3003", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6200);
await page.screenshot({ path: `${output}/06-mobile-story.png`, fullPage: true });
await page.getByTestId("intro-name-input").waitFor({ state: "visible", timeout: 5000 });
await page.screenshot({ path: `${output}/07-mobile-identity.png`, fullPage: true });
await page.getByTestId("intro-name-input").fill("玄清");
await page.getByTestId("intro-gender-female").click();
await page.getByRole("button", { name: "確認" }).click();
await page.getByAltText("感靈石").waitFor({ state: "visible" });
await page.screenshot({ path: `${output}/08-mobile-spirit-stone.png`, fullPage: true });
await page.getByAltText("感靈石").click();
await page.getByTestId("intro-embark").waitFor({ state: "visible", timeout: 6000 });
await page.screenshot({ path: `${output}/09-mobile-destiny.png`, fullPage: true });
await page.getByTestId("intro-embark").click();
await page.getByTestId("floating-dock").waitFor({ state: "visible", timeout: 8000 });
await page.waitForTimeout(900);
await page.screenshot({ path: `${output}/10-mobile-first-adventure.png`, fullPage: true });
const metrics = await page.evaluate(() => ({
  horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
  brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
}));
console.log(JSON.stringify(metrics, null, 2));
await browser.close();
