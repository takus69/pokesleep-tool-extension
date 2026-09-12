import type { FeatureContext } from "../types";
import { metricLabels, purposeLabels, reasonLabels } from "./labels";
import {
  calculateRankingScenarioAsync,
  createRankingScenarioConfig,
  createStrengthParameter,
  deserializeStrengthParameter,
  fields,
  IngredientNames,
  MainSkillNames,
  PokemonTypes,
  pokemons,
  type RankingScenarioConfig,
  type RankingScenarioPurpose,
  type RankingScenarioResult,
  rankingScenarioMetrics,
  rankingScenarioPurposes,
  type StrengthParameter,
  validateRankingScenario,
} from "./upstream";

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] => {
  const value = document.createElement(tag);
  if (className) value.className = className;
  return value;
};

function option(
  value: string | number,
  label = String(value),
): HTMLOptionElement {
  const result = element("option");
  result.value = String(value);
  result.textContent = label;
  return result;
}

function field(label: string, control: HTMLElement): HTMLLabelElement {
  const wrapper = element("label", "field");
  const caption = element("span");
  caption.textContent = label;
  wrapper.append(caption, control);
  return wrapper;
}

function loadEnvironment(): StrengthParameter {
  const raw = window.localStorage.getItem("PstStrenghParam");
  if (raw === null) return createStrengthParameter({});
  try {
    return deserializeStrengthParameter(JSON.parse(raw));
  } catch {
    return createStrengthParameter({});
  }
}

function formatValue(value: number): string {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function renderResults(
  container: HTMLElement,
  result: RankingScenarioResult,
): void {
  container.replaceChildren();
  const summary = element("p", "summary");
  summary.textContent = `${result.groups.length}順位グループ・${result.entries.length}候補`;
  container.append(summary);

  const table = element("table");
  const head = element("thead");
  head.innerHTML =
    "<tr><th>順位</th><th>ポケモン・条件</th><th>評価値</th></tr>";
  table.append(head);
  const body = element("tbody");
  result.groups.slice(0, 100).forEach((group, index) => {
    for (const [entryIndex, entry] of group.entries.entries()) {
      const row = element("tr");
      const rank = element("td");
      rank.textContent = entryIndex === 0 ? String(index + 1) : "";
      const identity = element("td");
      const skills = entry.iv.activeSubSkills
        .map((skill) => skill.name)
        .join(" / ");
      identity.textContent = `${entry.iv.pokemonName} · ${entry.ingredientKey} · ${entry.iv.nature.name}${skills ? ` · ${skills}` : ""}`;
      const value = element("td");
      value.textContent = formatValue(entry.value);
      row.append(rank, identity, value);
      body.append(row);
    }
  });
  table.append(body);
  container.append(table);
  if (result.groups.length > 100) {
    const note = element("p", "note");
    note.textContent =
      "ブラウザ確認版では上位100順位グループを表示しています。";
    container.append(note);
  }
}

export function mountRankingPanel({ mountPoint }: FeatureContext): () => void {
  const style = element("style");
  style.textContent = `
    :host { color-scheme: light; }
    * { box-sizing: border-box; }
    button, select, input { font: inherit; }
    .launcher { position:fixed; right:16px; bottom:16px; z-index:2147483647; border:0; border-radius:999px; padding:12px 18px; color:white; background:#245c45; box-shadow:0 3px 12px #0005; cursor:pointer; font:600 14px system-ui,sans-serif; }
    .panel { position:fixed; inset:12px 12px 12px auto; z-index:2147483647; width:min(540px,calc(100vw - 24px)); display:none; grid-template-rows:auto 1fr; background:#f8fbf9; border:1px solid #b6c9bf; border-radius:14px; box-shadow:0 8px 32px #0005; overflow:hidden; font:14px system-ui,sans-serif; color:#17221d; }
    .panel.open { display:grid; }
    header { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:#245c45; color:white; }
    h2 { font-size:17px; margin:0; } .close { border:0; background:transparent; color:white; font-size:24px; cursor:pointer; }
    .content { overflow:auto; padding:16px; } .preview { margin:0 0 14px; padding:9px; border-radius:8px; background:#fff4cf; color:#614c00; }
    .form { display:grid; gap:12px; } .field { display:grid; gap:5px; font-weight:600; } select,input { width:100%; min-height:38px; border:1px solid #98aaa1; border-radius:7px; padding:7px 9px; background:white; }
    .actions { display:flex; gap:8px; } .primary,.secondary { border:0; border-radius:8px; padding:10px 14px; cursor:pointer; }
    .primary { background:#245c45; color:white; font-weight:600; } .secondary { background:#dfe9e4; color:#18372a; }
    .status { min-height:22px; margin:10px 0; } .error { color:#a21b1b; } .note,.summary { color:#52635b; }
    table { width:100%; border-collapse:collapse; background:white; } th,td { padding:7px; border-bottom:1px solid #dbe4df; text-align:left; vertical-align:top; } th { position:sticky; top:0; background:#e8f0ec; } td:first-child { width:48px; } td:last-child { white-space:nowrap; }
  `;

  const launcher = element("button", "launcher");
  launcher.textContent = "ランキング";
  launcher.type = "button";
  const panel = element("section", "panel");
  panel.setAttribute("aria-label", "ポケモン性能ランキング");
  const header = element("header");
  const title = element("h2");
  title.textContent = "ポケモン性能ランキング";
  const close = element("button", "close");
  close.type = "button";
  close.textContent = "×";
  close.setAttribute("aria-label", "閉じる");
  header.append(title, close);
  const content = element("div", "content");
  const preview = element("p", "preview");
  preview.textContent =
    "ブラウザ確認版：主要条件とランキング計算を確認できます。詳細条件と手持ち比較は次段階で追加します。";
  const form = element("div", "form");
  const purpose = element("select");
  for (const value of rankingScenarioPurposes)
    purpose.append(option(value, purposeLabels[value]));
  const condition = element("select");
  const metric = element("select");
  const level = element("input");
  level.type = "number";
  level.min = "1";
  level.max = "100";
  level.value = "60";
  const conditionField = field("対象", condition);
  form.append(
    field("目的", purpose),
    conditionField,
    field("ランキング指標", metric),
    field("レベル", level),
  );
  const actions = element("div", "actions");
  const calculate = element("button", "primary");
  calculate.type = "button";
  calculate.textContent = "ランキングを計算";
  const cancel = element("button", "secondary");
  cancel.type = "button";
  cancel.textContent = "中止";
  cancel.disabled = true;
  actions.append(calculate, cancel);
  form.append(actions);
  const status = element("p", "status");
  status.setAttribute("role", "status");
  const results = element("div");
  content.append(preview, form, status, results);
  panel.append(header, content);
  mountPoint.append(style, launcher, panel);

  let config: RankingScenarioConfig = createRankingScenarioConfig("traits");
  let environment = loadEnvironment();
  let controller: AbortController | undefined;

  const rebuild = () => {
    const selectedPurpose = purpose.value as RankingScenarioPurpose;
    config = createRankingScenarioConfig(selectedPurpose);
    config.level = Number(level.value);
    condition.replaceChildren(option("", "選択してください"));
    let label = "対象";
    if (selectedPurpose === "traits" || selectedPurpose === "ingredients") {
      label = "ポケモン";
      for (const pokemon of pokemons) condition.append(option(pokemon.name));
    } else if (selectedPurpose === "berry") {
      label = "きのみタイプ";
      for (const type of PokemonTypes) condition.append(option(type));
    } else if (selectedPurpose === "ingredient") {
      label = "食材";
      for (const ingredient of IngredientNames)
        condition.append(option(ingredient));
    } else if (selectedPurpose === "skill") {
      label = "メインスキル";
      for (const skill of MainSkillNames) condition.append(option(skill));
    } else {
      label = "マップ";
      for (const item of fields)
        condition.append(option(item.index, `${item.emoji} ${item.name}`));
    }
    const conditionCaption = conditionField.firstElementChild;
    if (conditionCaption !== null) conditionCaption.textContent = label;
    metric.replaceChildren();
    for (const value of rankingScenarioMetrics[selectedPurpose])
      metric.append(option(value, metricLabels[value]));
  };

  const applyCondition = () => {
    config.level = Number(level.value);
    config.target = metric.value as RankingScenarioConfig["target"];
    switch (config.purpose) {
      case "traits":
      case "ingredients":
        config.pokemonName = condition.value || undefined;
        break;
      case "berry":
        config.berry = condition.value
          ? (condition.value as typeof config.berry)
          : undefined;
        break;
      case "ingredient":
        config.ingredient = condition.value
          ? (condition.value as typeof config.ingredient)
          : undefined;
        break;
      case "skill":
        config.skill = condition.value
          ? (condition.value as typeof config.skill)
          : undefined;
        break;
      case "field":
        environment = {
          ...environment,
          fieldIndex: condition.value ? Number(condition.value) : -1,
        };
        break;
    }
  };

  const onCalculate = async () => {
    applyCondition();
    const invalid = validateRankingScenario(config, environment);
    if (invalid !== null) {
      status.className = "status error";
      status.textContent =
        reasonLabels[invalid] ?? `条件を確認してください（${invalid}）`;
      return;
    }
    controller?.abort();
    controller = new AbortController();
    calculate.disabled = true;
    cancel.disabled = false;
    results.replaceChildren();
    status.className = "status";
    status.textContent = "計算を開始しています…";
    try {
      const result = await calculateRankingScenarioAsync(config, environment, {
        signal: controller.signal,
        onProgress: (completed) => {
          status.textContent = `計算中：${completed}候補`;
        },
        onPartialResult: ({ result: partial, completed }) => {
          status.textContent = `計算中：${completed}候補（途中結果）`;
          renderResults(results, partial);
        },
      });
      status.textContent = "計算が完了しました。";
      renderResults(results, result);
    } catch (error) {
      status.className = "status error";
      status.textContent =
        error instanceof DOMException && error.name === "AbortError"
          ? "計算を中止しました。"
          : "計算に失敗しました。";
    } finally {
      calculate.disabled = false;
      cancel.disabled = true;
      controller = undefined;
    }
  };

  purpose.addEventListener("change", rebuild);
  launcher.addEventListener("click", () => panel.classList.add("open"));
  close.addEventListener("click", () => panel.classList.remove("open"));
  calculate.addEventListener("click", onCalculate);
  cancel.addEventListener("click", () => controller?.abort());
  rebuild();

  return () => {
    controller?.abort();
    style.remove();
    launcher.remove();
    panel.remove();
  };
}
