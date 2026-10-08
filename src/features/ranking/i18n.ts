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
  const status = getUpstreamDataStatus();
  let namesAdded = false;
  // Do not create partial bundles for languages loadLanguage has not loaded yet.
  for (const lng of new Set(["en", language])) {
    const resource =
      status.pokemonNames[lng as keyof typeof status.pokemonNames];
    if (resource === undefined) continue;
    for (const [name, text] of Object.entries(resource.pokemons))
      if (
        i18n.getResource(lng, "translation", `pokemons.${name}`) === undefined
      ) {
        i18n.addResource(lng, "translation", `pokemons.${name}`, text);
        namesAdded = true;
      }
  }
  for (const name of status.fallbackPokemonNames)
    if (!i18n.exists(`pokemons.${name}`, { lng: "en" })) {
      i18n.addResource("en", "translation", `pokemons.${name}`, name);
      namesAdded = true;
    }
  if (namesAdded) i18n.emit("languageChanged", i18n.language);
}
