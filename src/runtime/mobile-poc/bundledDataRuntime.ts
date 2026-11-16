import type { UpstreamDataPackRuntime } from "../../integration/upstreamDataPackRefresh";

/** PoC only: no cache writes, network requests, or browser-extension APIs. */
export class MobilePocBundledDataRuntime implements UpstreamDataPackRuntime {
  async readCachedValue(): Promise<unknown> {
    return null;
  }

  async writeCachedValue(): Promise<void> {
    throw new Error("Mobile PoC uses bundled data only");
  }

  async fetchLatest(): Promise<never> {
    throw new Error("Mobile PoC uses bundled data only");
  }
}
