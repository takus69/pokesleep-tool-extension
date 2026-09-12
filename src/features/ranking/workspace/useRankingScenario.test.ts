import { describe, expect, it } from "vitest";
import { isRankingRunCurrent } from "./useRankingScenario";

describe("ranking run lifecycle", () => {
  it("keeps a started run current until explicitly replaced or cancelled", () => {
    expect(isRankingRunCurrent(4, 4, { aborted: false })).toBe(true);
    expect(isRankingRunCurrent(4, 5, { aborted: false })).toBe(false);
    expect(isRankingRunCurrent(4, 4, { aborted: true })).toBe(false);
  });
});
