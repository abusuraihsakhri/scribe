// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

vi.mock("@tauri-apps/api/core", () => ({ convertFileSrc: (path: string) => `asset://localhost/${path}` }));
vi.mock("@tauri-apps/plugin-opener", () => ({ openUrl: vi.fn() }));

const { openUrl } = await import("@tauri-apps/plugin-opener");
const { Preview } = await import("./Preview");

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;

function render(content: string, props: { basePath?: string; onOpenFile?: (path: string) => void } = {}) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  act(() => {
    root = createRoot(host);
    root.render(createElement(Preview, { content, ...props }));
  });
  return host;
}

function click(host: HTMLElement, text: string) {
  const link = [...host.querySelectorAll("a")].find((a) => a.textContent === text)!;
  act(() => link.click());
}

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  vi.mocked(openUrl).mockReset();
});

describe("Preview links", () => {
  it("opens relative Markdown links as files, ignoring the fragment", () => {
    const onOpenFile = vi.fn();
    const host = render("[guide](../guide/setup%20notes.md#install)", { basePath: "C:\\docs\\notes", onOpenFile });

    click(host, "guide");

    expect(onOpenFile).toHaveBeenCalledWith("C:\\docs\\guide\\setup notes.md");
  });

  it("scrolls to headings for in-page anchors", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const host = render("[jump](#getting-started)\n\n## Getting Started");

    click(host, "jump");

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(host.querySelector("h2"));
  });

  it("hands web and mail links to the system opener", () => {
    const host = render("[site](https://example.com) [mail](mailto:a@example.com)");

    click(host, "site");
    click(host, "mail");

    expect(openUrl).toHaveBeenCalledWith("https://example.com");
    expect(openUrl).toHaveBeenCalledWith("mailto:a@example.com");
  });

  it("does not open non-Markdown local links", () => {
    const onOpenFile = vi.fn();
    const host = render("[run](tool.exe)", { basePath: "C:\\docs", onOpenFile });

    click(host, "run");

    expect(onOpenFile).not.toHaveBeenCalled();
    expect(openUrl).not.toHaveBeenCalled();
  });
});

describe("Preview images", () => {
  it("resolves parent-relative images through the asset protocol", () => {
    const host = render("![logo](../assets/logo.png)", { basePath: "C:\\docs\\notes" });
    expect(host.querySelector("img")?.getAttribute("src")).toBe("asset://localhost/C:\\docs\\assets\\logo.png");
  });

  it("retries a failed local image once with a cache-busting query", () => {
    const host = render("![logo](logo.png)", { basePath: "C:\\docs" });
    const img = host.querySelector("img")!;

    act(() => img.dispatchEvent(new Event("error")));
    act(() => img.dispatchEvent(new Event("error")));

    expect(img.getAttribute("src")).toBe("asset://localhost/C:\\docs\\logo.png?retry=1");
  });

  it("drops UNC images, which would leak credentials over SMB", () => {
    const host = render("![x](//attacker/share/x.png)", { basePath: "C:\\docs" });
    expect(host.querySelector("img")).toBeNull();
  });
});
