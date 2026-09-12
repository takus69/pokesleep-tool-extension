// Build-time adapter for the read-only ranking fork. Vite bundles the imported
// data and calculation code into the extension; no code is fetched at runtime.
export { default as fields } from "../../../../pokesleep-tool/src/data/fields";
export {
  default as pokemons,
  type IngredientName,
  IngredientNames,
  type PokemonType,
  PokemonTypes,
} from "../../../../pokesleep-tool/src/data/pokemons";
export {
  createRankingScenarioConfig,
  rankingScenarioPurposes,
} from "../../../../pokesleep-tool/src/fork/RankingScenarioState";
export {
  type MainSkillName,
  MainSkillNames,
} from "../../../../pokesleep-tool/src/util/MainSkill";
export {
  calculateRankingScenarioAsync,
  type RankingScenarioConfig,
  type RankingScenarioMetric,
  type RankingScenarioPurpose,
  type RankingScenarioResult,
  rankingScenarioMetrics,
  validateRankingScenario,
} from "../../../../pokesleep-tool/src/util/RankingScenario";
export {
  createStrengthParameter,
  deserializeStrengthParameter,
  type StrengthParameter,
} from "../../../../pokesleep-tool/src/util/StrengthParameter";
