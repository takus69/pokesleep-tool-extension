import type { RankingScenarioMetric, RankingScenarioPurpose } from "./upstream";

export const purposeLabels: Record<RankingScenarioPurpose, string> = {
  traits: "ポケモンのサブスキル・性格を比較する",
  ingredients: "ポケモンの食材構成を比較する",
  berry: "きのみ要員を探す",
  ingredient: "食材要員を探す",
  skill: "スキル要員を探す",
  field: "マップに合うポケモンを探す",
};

export const metricLabels: Record<RankingScenarioMetric, string> = {
  specificIngredientCount: "指定食材の期待取得数",
  ingredientStrength: "食材エナジー",
  berryStrength: "きのみエナジー",
  skillCount: "スキル期待発動回数",
  totalStrength: "合計エナジー",
};

export const reasonLabels: Record<string, string> = {
  missingPokemon: "ポケモンを選択してください。",
  missingIngredient: "食材を選択してください。",
  missingBerry: "きのみのタイプを選択してください。",
  missingSkill: "スキルを選択してください。",
  missingField: "マップを選択してください。",
  invalidLevel: "レベルは1〜100で指定してください。",
  invalidSkillLevel: "スキルレベルが無効です。",
  invalidMetric: "この目的では選択できない指標です。",
};
