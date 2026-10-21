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
        for (const image of await page.locator("img").all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(node => node.decode());
        }

        const data = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          const bad = Array.from(document.querySelectorAll(
            ".wrap, header, main, .hero, .hero-visual, section, .features, .steps, .pair, .cols, .platforms, .platform, footer, img, table"
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
          return { width, documentScroll: document.documentElement.scrollWidth, bad, images };
        });

        assert.ok(data.documentScroll <= width + 1,
          width + "px " + theme + " document overflows: " + JSON.stringify(data));
        assert.deepEqual(data.bad, [],
          width + "px " + theme + " layout overflows: " + JSON.stringify(data.bad));
        assert.ok(data.images.every(img => img.loaded),
          width + "px " + theme + " image did not load: " + JSON.stringify(data.images));

        if (width <= 760) {
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
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
