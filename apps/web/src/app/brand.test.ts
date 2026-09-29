import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { LegalPage } from "../components/legal/LegalPage";

describe("landing brand", () => {
  it("keeps the public header's home link accessible after replacing text with a symbol", () => {
    const html = renderToStaticMarkup(LegalPage({ title: "이용약관", children: "본문" }));
    const link = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/)?.[0];
    expect(link).toContain('href="/"');
    expect(link).toContain('alt="MINGLES"');
  });
  // 히어로는 MINGLES 워드마크 활자다 — 2026-09-14에 심볼 이미지로 바꿨던 것을 대표 지시(2026-09-21)로 되돌렸다.
  it("keeps the MINGLES wordmark letters (not the symbol image) in the main heading", () => {
    const html = renderToStaticMarkup(createElement(Home));
    const heading = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0];
    expect(heading).toContain('aria-label="MINGLES"');
    expect(heading).not.toContain("<img");
    expect(heading?.replace(/<[^>]+>/g, "")).toContain("MINGLES");
  });
});
