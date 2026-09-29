import type { RankingScenarioConfig } from "../domain/RankingScenario";

export type RankingResultSubject = {
  kind: "pokemon" | "berry" | "skill" | "ingredient";
  value: string;
};

/** Only describe selections that affected the calculated candidates or metric. */
export function getRankingResultSubjects(
  config: RankingScenarioConfig,
): RankingResultSubject[] {
  const subjects: RankingResultSubject[] = [];
  if (
    (config.purpose === "traits" || config.purpose === "ingredients") &&
    config.pokemonName
  )
    subjects.push({ kind: "pokemon", value: config.pokemonName });
  if (config.purpose === "berry" && config.berry)
    subjects.push({ kind: "berry", value: config.berry });
  if (config.purpose === "skill" && config.skill)
    subjects.push({ kind: "skill", value: config.skill });
  if (
    (config.purpose === "ingredient" ||
      config.target === "specificIngredientCount") &&
    config.ingredient
  )
    subjects.push({ kind: "ingredient", value: config.ingredient });
  return subjects;
}
