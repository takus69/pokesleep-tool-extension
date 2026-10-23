// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://nitoyon.github.io/pokesleep-tool/iv/"}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RankingScenarioStorage } from "../../features/ranking/application/RankingScenarioPersistence";
import { MobilePocBundledDataRuntime } from "./bundledDataRuntime";

const { prepare, mount, createFeature } = vi.hoisted(() => ({
  prepare: vi.fn(async () => undefined),
  mount: vi.fn(),
  createFeature: vi.fn((storage: RankingScenarioStorage) => ({
    id: "ranking",
    storage,
  })),
}));
vi.mock("../../integration/upstreamDataPackRefresh", () => ({
  prepareUpstreamDataPack: prepare,
}));
vi.mock("../../features/ranking", () => ({
  createRankingFeature: createFeature,
}));
vi.mock("../../ui/mountSuite", () => ({ mountSuite: mount }));

import { MobilePocScenarioStorage, startMobileRankingPoc } from "./ranking";

describe("mobile PoC runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("chrome", undefined);
    window.history.replaceState(null, "", "/pokesleep-tool/iv/");
    window.localStorage.clear();
    document.body.innerHTML = `<main id="root">
      <div style="position: sticky"><div><div><div role="tablist">
        <button role="tab">A</button><button role="tab">B</button>
        <button role="tab">C</button>
      </div></div></div></div></main>`;
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("starts the shared feature without Chrome APIs, network or storage writes", async () => {
    window.localStorage.setItem("PstPokeBox", '["private-iv@nickname"]');
    const writes = vi.spyOn(Storage.prototype, "setItem");
    const removes = vi.spyOn(Storage.prototype, "removeItem");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await startMobileRankingPoc();
    expect(prepare).toHaveBeenCalledWith(
      expect.any(MobilePocBundledDataRuntime),
    );
    expect(createFeature).toHaveBeenCalledWith(
      expect.any(MobilePocScenarioStorage),
    );
    expect(mount).toHaveBeenCalledTimes(1);
    expect(writes).not.toHaveBeenCalled();
    expect(removes).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(document.getElementById("pokesleep-mobile-poc-starting")).toBeNull();
  });

  it("does not mount on unsupported pages or invalid saved values", async () => {
    window.history.replaceState(null, "", "/another-tool/");
    await startMobileRankingPoc();
    window.history.replaceState(null, "", "/pokesleep-tool/iv/");
    window.localStorage.setItem("PstPokeBox", "{}");
    await startMobileRankingPoc();
    expect(prepare).not.toHaveBeenCalled();
    expect(mount).not.toHaveBeenCalled();
  });

  it("prevents concurrent starts and coexistence with a mounted extension", async () => {
    await Promise.all([startMobileRankingPoc(), startMobileRankingPoc()]);
    expect(mount).toHaveBeenCalledTimes(1);
    const host = document.createElement("div");
    host.id = "pokesleep-extension-suite";
    document.body.append(host);
    await startMobileRankingPoc();
    expect(mount).toHaveBeenCalledTimes(1);
  });

  it("cleans up after a failed startup without exposing the exception", async () => {
    prepare.mockRejectedValueOnce(new Error("private-data"));
    await startMobileRankingPoc();
    expect(mount).not.toHaveBeenCalled();
    expect(document.getElementById("pokesleep-mobile-poc-starting")).toBeNull();
    expect(window.alert).toHaveBeenCalledWith(
      expect.not.stringContaining("private-data"),
    );
    await startMobileRankingPoc();
    expect(mount).toHaveBeenCalledTimes(1);
  });

  it("keeps scenario settings ephemeral and runtime fetch/cache disabled", async () => {
    const storage = new MobilePocScenarioStorage();
    storage.write("temporary");
    expect(storage.read()).toBe("temporary");
    expect(new MobilePocScenarioStorage().read()).toBeNull();
    const runtime = new MobilePocBundledDataRuntime();
    expect(await runtime.readCachedValue()).toBeNull();
    await expect(runtime.fetchLatest()).rejects.toThrow("bundled data only");
    await expect(runtime.writeCachedValue()).rejects.toThrow(
      "bundled data only",
    );
  });
});
