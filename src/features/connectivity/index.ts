import type { FeatureModule } from "../types";

export const connectivityFeature: FeatureModule = {
  id: "connectivity",
  defaultEnabled: true,
  mount({ mountPoint }) {
    const badge = document.createElement("div");
    badge.textContent = "拡張機能スイート: 接続済み";
    badge.setAttribute("role", "status");
    Object.assign(badge.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      zIndex: "2147483647",
      padding: "8px 12px",
      borderRadius: "8px",
      color: "#fff",
      background: "#245c45",
      font: "13px system-ui, sans-serif",
      boxShadow: "0 2px 8px #0004",
    });
    mountPoint.append(badge);
    return () => badge.remove();
  },
};
