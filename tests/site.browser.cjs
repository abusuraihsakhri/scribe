"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: "reduce" });
  const url = pathToFileURL(path.resolve(__dirname, "../site/index.html")).href;
  const sizes = [320, 360, 390, 430, 540, 760, 768, 1024, 1366, 1920];
  try {
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of sizes) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(url, { waitUntil: "load" });
        await page.evaluate(theme => localStorage.setItem("scribe-theme", theme), theme);
        await page.reload({ waitUntil: "load" });
        assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
        for (const image of await page.locator("img").all()) {
          if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
          await image.evaluate(node => node.decode());
        }

        const data = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          const bad = Array.from(document.querySelectorAll(
            ".wrap, .topbar, .navbar, main, .hero, .hero-copy, .hero-media, .hero-facts, .showcase, section, .section-head, .feature-grid, .figure-grid, .comparison-wrap, .compare-table, .compare-table tbody tr, .workflow, .shortcut-grid, .download-grid, .platform, .release-privacy, footer, img, table"
          )).filter(el => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return false;
            return r.left < -1 || r.right > width + 1 || el.scrollWidth > el.clientWidth + 2;
          }).map(el => ({
            name: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
              (el.className && typeof el.className === "string" ? "." + el.className.trim().replace(/\s+/g, ".") : ""),
            scroll: el.scrollWidth, client: el.clientWidth,
            rect: [Math.round(el.getBoundingClientRect().left), Math.round(el.getBoundingClientRect().right)]
          }));
          const images = Array.from(document.querySelectorAll("img")).map(img => ({
            src: img.getAttribute("src"), loaded: img.complete && img.naturalWidth > 0
          }));
          const visible = {
            light: getComputedStyle(document.querySelector(".shot-light")).display !== "none",
            dark: getComputedStyle(document.querySelector(".shot-dark")).display !== "none"
          };
          const background = getComputedStyle(document.body).backgroundColor;
          return { width, documentScroll: document.documentElement.scrollWidth, bad, images, visible, background };
        });

        assert.ok(data.documentScroll <= width + 1,
          width + "px " + theme + " document overflows: " + JSON.stringify(data));
        assert.deepEqual(data.bad, [],
          width + "px " + theme + " layout overflows: " + JSON.stringify(data.bad));
        assert.deepEqual(data.visible, { light: theme === "light", dark: theme === "dark" },
          width + "px screenshot does not match selected theme");
        assert.ok(data.images.every(img => img.loaded),
          width + "px " + theme + " image did not load: " + JSON.stringify(data.images));

        assert.equal(await page.locator(".compare-table tbody tr").count(), 5);
        const compareLayout = await page.locator(".compare-table tbody tr").first()
          .evaluate(el => getComputedStyle(el).display);
        assert.equal(compareLayout, width <= 700 ? "block" : "table-row",
          width + "px comparison layout should fit the viewport");

        if (width <= 820) {
          const menu = page.locator(".mobile-menu");
          assert.equal(await page.locator(".desktop-nav").isVisible(), false);
          await menu.locator("summary").click();
          assert.equal(await page.getByRole("navigation", { name: "Mobile navigation" }).isVisible(), true);
          const afterOpen = await page.evaluate(() => document.documentElement.scrollWidth);
          assert.ok(afterOpen <= width + 1, width + "px mobile menu overflows");
        } else {
          assert.equal(await page.locator(".desktop-nav").isVisible(), true);
        }
        process.stdout.write("PASS " + theme + " " + width + "px\n");
      }
    }
    await page.setViewportSize({ width: 320, height: 750 });
    await page.goto(url, { waitUntil: "load" });
    const nav = page.locator(".mobile-menu");
    await nav.locator("summary").click();
    await page.getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Download" }).click();
    assert.equal(new URL(page.url()).hash, "#download");
    console.log("PASS mobile download navigation");
    // The site defaults to light (as MCM does), and the explicit choice persists.
    await page.evaluate(() => localStorage.removeItem("scribe-theme"));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload({ waitUntil: "load" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    assert.equal(await page.locator("#themeLabel").textContent(), "Light");
    await page.locator("#themeToggle").click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await page.locator("#themeToggle").getAttribute("aria-pressed"), "true");
    const darkBackground = await page.locator("body").evaluate(el => getComputedStyle(el).backgroundColor);
    await page.reload({ waitUntil: "load" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.locator("#themeToggle").click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    assert.equal(await page.locator("#themeToggle").getAttribute("aria-pressed"), "false");
    const lightBackground = await page.locator("body").evaluate(el => getComputedStyle(el).backgroundColor);
    assert.notEqual(darkBackground, lightBackground);
    await page.reload({ waitUntil: "load" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    console.log("PASS persistent light/dark toggle and first-visit light default");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
