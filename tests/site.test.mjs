import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const page = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const release = "https://github.com/abusuraihsakhri/scribe/releases/download/v0.1.3/";
const latest = "https://github.com/abusuraihsakhri/scribe/releases/latest";

class Node {
  constructor(tag = "text") {
    this.tagName = tag;
    this.childNodes = [];
    this.href = "";
    this.className = "";
    this._text = "";
  }
  set textContent(value) {
    this._text = String(value);
    this.childNodes = [];
  }
  get textContent() {
    return this._text + this.childNodes.map((child) => child.textContent).join("");
  }
  appendChild(child) {
    this.childNodes.push(child);
    return child;
  }
  append(...children) {
    children.forEach((child) => this.appendChild(child));
  }
  replaceChildren(...children) {
    this.childNodes = children.flatMap((child) =>
      child.tagName === "fragment" ? child.childNodes : [child]);
    this._text = "";
  }
}
function mockDocument() {
  const nodes = Object.fromEntries([
    "windows-downloads", "mac-downloads", "linux-downloads",
    "release-meta", "download-lead", "download-primary"
  ].map((id) => [id, new Node("div")]));
  for (const id of ["windows-downloads", "mac-downloads", "linux-downloads"]) {
    const fallback = new Node("a");
    fallback.href = latest;
    nodes[id].appendChild(fallback);
  }
  nodes["download-primary"].href = "#download";
  return {
    nodes,
    getElementById: (id) => nodes[id] ?? null,
    createDocumentFragment: () => new Node("fragment"),
    createElement: (tag) => new Node(tag),
    createTextNode: (value) => {
      const item = new Node();
      item.textContent = value;
      return item;
    }
  };
}
async function renderRelease(fixture, platform = "Win32") {
  const document = mockDocument();
  const fetch = async () => {
    if (fixture instanceof Error) throw fixture;
    return { ok: fixture !== null, json: async () => fixture };
  };
  runInNewContext(script, { fetch, document, navigator: { platform }, URL, Set, Number });
  // Allow the async release request and JSON parsing to settle.
  await new Promise((resolve) => setImmediate(resolve));
  return document.nodes;
}
const fixture = {
  tag_name: "v0.1.3",
  html_url: "https://github.com/abusuraihsakhri/scribe/releases/tag/v0.1.3",
  assets: [
    { name: "Scribe_0.1.3_x64-setup.exe", size: 3062069, browser_download_url: release + "Scribe_0.1.3_x64-setup.exe" },
    { name: "Scribe_0.1.3_universal.dmg", size: 8355499, browser_download_url: release + "Scribe_0.1.3_universal.dmg" },
    { name: "Scribe_0.1.3_amd64.deb", size: 5463234, browser_download_url: release + "Scribe_0.1.3_amd64.deb" }
  ]
};

test("page has semantic landmarks and accessible mobile navigation", () => {
  assert.match(page, /<html lang="en">/);
  assert.match(page, /<main id="main">/);
  assert.match(page, /href="#main"/);
  assert.match(page, /<h1>/);
  assert.match(page, /aria-label="Mobile navigation"/);
  assert.match(page, /\.mobile-menu nav a \{ display: block;/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(page, /prefers-color-scheme: dark/);
  assert.equal((page.match(/<script>/g) || []).length, 1);
});

test("referenced local image assets exist", () => {
  const sources = [...page.matchAll(/(?:src|srcset)="(screenshots\/[^"]+|favicon\.svg)"/g)];
  assert.ok(sources.length >= 5);
  for (const match of sources) assert.ok(existsSync(join("site", match[1])), match[1]);
});

test("release code avoids HTML insertion and preserves offline download links", async () => {
  assert.ok(script);
  assert.doesNotMatch(script, /\.innerHTML\s*=/);
  const offline = await renderRelease(new Error("offline"));
  for (const id of ["windows-downloads", "mac-downloads", "linux-downloads"]) {
    assert.equal(offline[id].childNodes[0].href, latest);
  }
  assert.equal(offline["download-primary"].href, "#download");
});

test("populates platform download links from validated release assets", async () => {
  const data = await renderRelease(fixture);
  assert.match(data["release-meta"].textContent, /v0\.1\.3/);
  assert.equal(data["windows-downloads"].childNodes[0].href, fixture.assets[0].browser_download_url);
  assert.equal(data["mac-downloads"].childNodes.length, 1);
  assert.equal(data["linux-downloads"].childNodes[0].href, fixture.assets[2].browser_download_url);
  assert.equal(data["download-primary"].href, fixture.assets[0].browser_download_url);
  assert.match(data["windows-downloads"].childNodes[0].textContent, /2\.9 MB/);
});

test("rejects injected or non-GitHub release URLs", async () => {
  const tainted = {
    tag_name: "<img src=x onerror=alert(1)>",
    html_url: "javascript:alert(1)",
    assets: [
      { name: "malicious_x64-setup.exe", browser_download_url: "javascript:alert(1)" },
      { name: "forged_universal.dmg", browser_download_url: "https://evil.example/payload" },
      { name: "wrong_amd64.deb", browser_download_url: "https://github.com/other/repo/releases/download/v1/file.deb" }
    ]
  };
  const data = await renderRelease(tainted);
  for (const id of ["windows-downloads", "mac-downloads", "linux-downloads"]) {
    assert.equal(data[id].childNodes[0].href, latest);
  }
  assert.equal(data["download-primary"].href, "#download");
  assert.doesNotMatch(data["release-meta"].textContent, /<img/);
});

test("Linux and macOS select the correct available primary download", async () => {
  const mac = await renderRelease(fixture, "MacIntel");
  const linux = await renderRelease(fixture, "Linux x86_64");
  assert.equal(mac["download-primary"].href, fixture.assets[1].browser_download_url);
  assert.equal(linux["download-primary"].href, fixture.assets[2].browser_download_url);
});
