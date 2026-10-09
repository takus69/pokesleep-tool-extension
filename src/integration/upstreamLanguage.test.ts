// @vitest-environment jsdom
import { beforeEach, expect, it } from "vitest";
import { readUpstreamLanguage } from "./upstreamLanguage";

beforeEach(() => localStorage.clear());

it.each([
  ["ja-JP", "ja"],
  ["ko-KR", "ko"],
  ["zh-Hant-TW", "zh-TW"],
  ["zh-CN", "zh-CN"],
  ["fr-FR", "en"],
])("uses browser %s without a stored preference", (browser, expected) => {
  expect(readUpstreamLanguage(browser)).toBe(expected);
  expect(localStorage.length).toBe(0);
});

it("uses browser language when unrelated settings are saved", () => {
  const saved = JSON.stringify({ pwacnt: 1 });
  localStorage.setItem("PokeSleepTool", saved);
  expect(readUpstreamLanguage("ja-JP")).toBe("ja");
  expect(localStorage.getItem("PokeSleepTool")).toBe(saved);
});

it.each([
  "en",
  "ja",
  "ko",
  "zh-CN",
  "zh-TW",
])("preserves the explicit %s preference", (language) => {
  const saved = JSON.stringify({ language });
  localStorage.setItem("PokeSleepTool", saved);
  expect(readUpstreamLanguage("ja-JP")).toBe(language);
  expect(localStorage.getItem("PokeSleepTool")).toBe(saved);
});

it("ignores an unsupported preference without rewriting it", () => {
  const saved = JSON.stringify({ language: "unknown" });
  localStorage.setItem("PokeSleepTool", saved);
  expect(readUpstreamLanguage("ja-JP")).toBe("ja");
  expect(localStorage.getItem("PokeSleepTool")).toBe(saved);
});
