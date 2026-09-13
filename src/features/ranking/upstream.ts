// Build-time adapter for the pinned official upstream. Vite bundles imported
// code into the extension; no executable code is fetched at runtime.
export { default as fields } from "@upstream/data/fields";
export {
  default as pokemons,
  type IngredientName,
  IngredientNames,
  type PokemonType,
  PokemonTypes,
} from "@upstream/data/pokemons";
export {
  type MainSkillName,
  MainSkillNames,
} from "@upstream/util/MainSkill";
export {
  createStrengthParameter,
  deserializeStrengthParameter,
  type StrengthParameter,
} from "@upstream/util/StrengthParameter";
export {
  createRankingScenarioConfig,
  rankingScenarioPurposes,
} from "./application/RankingScenarioState";
export {
  calculateRankingScenarioAsync,
  type RankingScenarioConfig,
  type RankingScenarioMetric,
  type RankingScenarioPurpose,
  type RankingScenarioResult,
  rankingScenarioMetrics,
  validateRankingScenario,
} from "./domain/RankingScenario";
