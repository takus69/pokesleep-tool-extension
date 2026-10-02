import { useSyncExternalStore } from "react";
import {
  getUpstreamDataRefreshState,
  subscribeUpstreamDataRefresh,
} from "../../../integration/upstreamDataRefreshState";

export function useUpstreamDataRefresh() {
  return useSyncExternalStore(
    subscribeUpstreamDataRefresh,
    getUpstreamDataRefreshState,
  );
}
