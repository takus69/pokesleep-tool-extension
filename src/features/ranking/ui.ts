import { findUpstreamRankingSlot } from "../../integration/upstreamRankingSlot";
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

export function mountRankingPanel({
  hostElement,
  mountPoint,
}: FeatureContext): () => void {
  const root = document.getElementById("root");
  const slot = root === null ? null : findUpstreamRankingSlot(root);
  if (slot === null) {
    console.warn(
      "[Pokémon Sleep Tool Extension] ランキングタブの挿入位置を確認できないため停止しました。",
    );
    return () => undefined;
  }

  const style = element("style");
  style.textContent = `
    :host { color-scheme: light; }
    * { box-sizing: border-box; }
    button, select, input { font: inherit; }
    .panel { display:none; width:100%; max-width:760px; margin:0 auto 10rem; padding:8px; background:#f9f9f9; font:14px system-ui,sans-serif; color:#17221d; }
    .panel.open { display:block; }
    .content { padding:8px 0; } .preview { margin:0 0 14px; padding:9px; border-radius:8px; background:#fff4cf; color:#614c00; }
    .form { display:grid; gap:12px; } .field { display:grid; gap:5px; font-weight:600; } select,input { width:100%; min-height:38px; border:1px solid #98aaa1; border-radius:7px; padding:7px 9px; background:white; }
    .actions { display:flex; gap:8px; } .primary,.secondary { border:0; border-radius:8px; padding:10px 14px; cursor:pointer; }
    .primary { background:#245c45; color:white; font-weight:600; } .secondary { background:#dfe9e4; color:#18372a; }
    .status { min-height:22px; margin:10px 0; } .error { color:#a21b1b; } .note,.summary { color:#52635b; }
    table { width:100%; border-collapse:collapse; background:white; } th,td { padding:7px; border-bottom:1px solid #dbe4df; text-align:left; vertical-align:top; } th { position:sticky; top:0; background:#e8f0ec; } td:first-child { width:48px; } td:last-child { white-space:nowrap; }
  `;

  const panel = element("section", "panel");
  panel.setAttribute("aria-label", "ポケモン性能ランキング");
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
  panel.append(content);
  mountPoint.append(style, panel);

  const firstTab = slot.tabList.querySelector<HTMLElement>(
    ":scope > [role='tab']",
  );
  if (firstTab === null) return () => undefined;
  const rankingTab = firstTab.cloneNode(false) as HTMLButtonElement;
  rankingTab.removeAttribute("id");
  rankingTab.removeAttribute("aria-controls");
  rankingTab.setAttribute("aria-selected", "false");
  rankingTab.setAttribute("tabindex", "-1");
  rankingTab.textContent = "ランキング";
  rankingTab.dataset.pokesleepExtensionRanking = "true";
  slot.tabList.append(rankingTab);

  const originalHostParent = hostElement.parentElement;
  const originalHostNextSibling = hostElement.nextSibling;
  const originalHostDisplay = hostElement.style.display;
  const originalHostWidth = hostElement.style.width;
  const workspace = slot.workspaceHeader.parentElement;
  const originalContent = slot.workspaceHeader.nextElementSibling;
  workspace?.insertBefore(hostElement, originalContent);
  hostElement.style.display = "none";
  hostElement.style.width = "100%";

  const headerChildren = [...slot.workspaceHeader.children].filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && !child.contains(slot.tabList),
  );
  const savedHeaderDisplays = new Map(
    headerChildren.map((child) => [child, child.style.display]),
  );
  const originalContentDisplay =
    originalContent instanceof HTMLElement
      ? originalContent.style.display
      : undefined;

  const deactivate = () => {
    hostElement.style.display = "none";
    panel.classList.remove("open");
    rankingTab.setAttribute("aria-selected", "false");
    rankingTab.setAttribute("tabindex", "-1");
    rankingTab.style.removeProperty("color");
    rankingTab.style.removeProperty("border-bottom");
    for (const child of headerChildren)
      child.style.display = savedHeaderDisplays.get(child) ?? "";
    if (originalContent instanceof HTMLElement)
      originalContent.style.display = originalContentDisplay ?? "";
  };

  const activate = () => {
    for (const tab of slot.tabList.querySelectorAll<HTMLElement>(
      "[role='tab']",
    )) {
      tab.setAttribute("aria-selected", String(tab === rankingTab));
      tab.setAttribute("tabindex", tab === rankingTab ? "0" : "-1");
    }
    rankingTab.style.color = "#1976d2";
    rankingTab.style.borderBottom = "2px solid #1976d2";
    for (const child of headerChildren) child.style.display = "none";
    if (originalContent instanceof HTMLElement)
      originalContent.style.display = "none";
    hostElement.style.display = "block";
    panel.classList.add("open");
  };

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
  rankingTab.addEventListener("click", activate);
  const onNativeTabClick = (event: Event) => {
    if (event.target instanceof Node && !rankingTab.contains(event.target))
      deactivate();
  };
  slot.tabList.addEventListener("click", onNativeTabClick, true);
  calculate.addEventListener("click", onCalculate);
  cancel.addEventListener("click", () => controller?.abort());
  rebuild();

  return () => {
    controller?.abort();
    deactivate();
    slot.tabList.removeEventListener("click", onNativeTabClick, true);
    rankingTab.remove();
    style.remove();
    panel.remove();
    hostElement.style.display = originalHostDisplay;
    hostElement.style.width = originalHostWidth;
    if (originalHostParent !== null)
      originalHostParent.insertBefore(hostElement, originalHostNextSibling);
  };
}
