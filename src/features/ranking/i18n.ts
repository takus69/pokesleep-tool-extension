import { getUpstreamDataStatus } from "../../integration/upstreamDataPack";
import { i18n } from "./upstreamUi";

const resources: Record<string, Record<string, string>> = {
  en: {
    "dataRefresh.checking": "Checking for the latest data.",
    "dataRefresh.updated": "The latest data has been applied.",
    "dataRefresh.pending":
      "New data is available and will be applied after the current calculation finishes.",
    "dataRefresh.failed":
      "Could not check the latest data. Previously saved or bundled data remains active.",
    "dataRefresh.stale": "Data has been updated. Please recalculate.",
    unsupportedEvent:
      "{{event}} is not supported yet. The ranking can still run, but its event effects will not be applied.",
    partialData:
      "{{count}} latest-data item(s) use unsupported mechanics and are excluded only from affected rankings.",
  },
  ja: {
    "dataRefresh.checking": "最新データを確認中です。",
    "dataRefresh.updated": "最新データを反映しました。",
    "dataRefresh.pending":
      "新しいデータを取得しました。計算終了後に反映します。",
    "dataRefresh.failed":
      "最新データを確認できませんでした。保存済みデータまたは同梱データを使用しています。",
    "dataRefresh.stale": "データが更新されました。再計算してください。",
    unsupportedEvent:
      "イベント「{{event}}」はまだ未対応です。ランキングは実行できますが、イベント効果は適用されません。",
    partialData:
      "最新データのうち{{count}}件は未対応の仕組みを含むため、影響するランキングだけから除外しています。",
  },
};

export function registerExtensionTranslations(language: string): void {
  i18n.addResourceBundle(
    "en",
    "translation",
    { extension: resources.en },
    true,
    true,
  );
  const resource = resources[language];
  if (resource !== undefined)
    i18n.addResourceBundle(
      language,
      "translation",
      { extension: resource },
      true,
      true,
    );
  for (const name of getUpstreamDataStatus().fallbackPokemonNames)
    if (!i18n.exists(`pokemons.${name}`, { lng: language }))
      i18n.addResource(language, "translation", `pokemons.${name}`, name);
}
