import type { PokemonBoxItem } from "@upstream/util/PokemonBox";
import {
  type BoxSortConfig,
  sortPokemonItems,
} from "@upstream/util/PokemonBoxSort";
import type { StrengthParameter } from "@upstream/util/PokemonStrength";
import type i18next from "i18next";

export type BoxOrderResult =
  | { ok: true; items: PokemonBoxItem[]; emptyMessage: string }
  | { ok: false; message: string };

/** Apply the upstream BoxView ordering, including its final ascending reversal. */
export function orderUpstreamBoxItems(
  items: readonly PokemonBoxItem[],
  config: BoxSortConfig,
  parameter: StrengthParameter,
  t: typeof i18next.t,
): BoxOrderResult {
  try {
    const [sorted, message] = sortPokemonItems(
      [...items],
      config.sort,
      config.descending,
      config.ingredient,
      config.mainSkill,
      parameter,
      t,
    );
    return {
      ok: true,
      items: config.descending ? sorted : [...sorted].reverse(),
      emptyMessage: items.length === 0 ? t("box is empty") : message,
    };
  } catch {
    return {
      ok: false,
      message: t("ranking.scenario.reason calculationFailed"),
    };
  }
}
