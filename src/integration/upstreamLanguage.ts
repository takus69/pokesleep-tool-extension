import { loadConfig } from "@upstream/ui/AppConfig";

/** Read the official preference without saving or changing it. */
export function readUpstreamLanguage(browserLanguage: string): string {
  let detected = "en";
  if (/ja/i.test(browserLanguage)) detected = "ja";
  else if (/ko/i.test(browserLanguage)) detected = "ko";
  else if (/^zh-hant/i.test(browserLanguage)) detected = "zh-TW";
  else if (/^zh/i.test(browserLanguage)) detected = "zh-CN";
  const stored = loadConfig(detected).language;
  return ["en", "ja", "ko", "zh-CN", "zh-TW"].includes(stored)
    ? stored
    : detected;
}
