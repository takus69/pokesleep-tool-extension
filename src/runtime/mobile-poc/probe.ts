import {
  formatMobileCompatibility,
  inspectMobileCompatibility,
} from "../../integration/mobileCompatibilityProbe";

window.alert(
  formatMobileCompatibility(
    inspectMobileCompatibility({
      url: new URL(window.location.href),
      document,
      readStorage: (key) => window.localStorage.getItem(key),
    }),
  ),
);
