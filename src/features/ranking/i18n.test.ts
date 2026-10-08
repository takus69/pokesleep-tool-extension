// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { beforeEach, expect, it, vi } from "vitest";

vi.hoisted(() => {
  window.matchMedia = () => ({ matches: true }) as MediaQueryList;
});

import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "../../integration/upstreamDataPack";
import event from "../../vendor/upstream-data/event.json";
import pokemon from "../../vendor/upstream-data/pokemon.json";
import { registerExtensionTranslations } from "./i18n";
import { i18n, loadLanguage } from "./upstreamUi";

const updatedPokemon = [
  ...pokemon,
  ...["Foongus", "Amoonguss"].map((name, index) => ({
    ...pokemon[0],
    id: 590 + index,
    name,
  })),
];
const names = {
  en: { pokemons: { Foongus: "Foongus", Amoonguss: "Amoonguss" } },
  ja: {
    pokemons: {
      Foongus: "タマゲタケ",
      Amoonguss: "モロバレル",
      Bulbasaur: "incorrect remote name",
    },
  },
  ko: { pokemons: { Foongus: "깜놀버슬" } },
};

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  await loadLanguage("ja");
  await i18n.changeLanguage("ja");
  for (const language of ["en", "ja"])
    for (const name of ["Foongus", "Amoonguss"])
      delete i18n.getResourceBundle(language, "translation").pokemons[name];
  i18n.removeResourceBundle("ko", "translation");
});

it("fills new Japanese names after network application and preserves bundled names", () => {
  applyUpstreamDataPack(
    validateUpstreamDataPack(updatedPokemon, event, names),
    "network",
    1,
  );
  registerExtensionTranslations("ja");
  expect(i18n.t("pokemons.Foongus")).toBe("タマゲタケ");
  expect(i18n.t("pokemons.Amoonguss")).toBe("モロバレル");
  expect(i18n.t("pokemons.Bulbasaur")).toBe("フシギダネ");
  expect(i18n.t("pokemons.Foongus", { lng: "en" })).toBe("Foongus");
  expect(i18n.hasResourceBundle("ko", "translation")).toBe(false);
});

it("does not let an earlier English fallback block a later Japanese translation", () => {
  applyUpstreamDataPack(
    validateUpstreamDataPack(updatedPokemon, event),
    "network",
    1,
  );
  registerExtensionTranslations("ja");
  expect(i18n.t("pokemons.Foongus")).toBe("Foongus");
  expect(
    i18n.getResource("ja", "translation", "pokemons.Foongus"),
  ).toBeUndefined();
  applyUpstreamDataPack(
    validateUpstreamDataPack(updatedPokemon, event, names),
    "network",
    2,
  );
  registerExtensionTranslations("ja");
  expect(i18n.t("pokemons.Foongus")).toBe("タマゲタケ");
});

it("loads the full bundle before adding names for another language", async () => {
  applyUpstreamDataPack(
    validateUpstreamDataPack(updatedPokemon, event, names),
    "cached",
    1,
  );
  registerExtensionTranslations("ja");
  await loadLanguage("ko");
  registerExtensionTranslations("ko");
  expect(i18n.getResource("ko", "translation", "pokemons.Bulbasaur")).toBe(
    "이상해씨",
  );
  expect(i18n.t("pokemons.Foongus", { lng: "ko" })).toBe("깜놀버슬");
});

it("refreshes already mounted labels without changing upstream storage", async () => {
  function Names() {
    const { t } = useTranslation();
    return React.createElement(
      "span",
      null,
      `${t("pokemons.Foongus")} / ${t("pokemons.Amoonguss")}`,
    );
  }
  localStorage.setItem("PokeSleepTool", '{"language":"ja"}');
  localStorage.setItem("PstPokeBox", "sentinel");
  const before = { ...localStorage };
  const host = document.createElement("div");
  const root = createRoot(host);
  await act(async () => {
    root.render(React.createElement(Names));
  });
  expect(host.textContent).not.toContain("タマゲタケ");
  await act(async () => {
    applyUpstreamDataPack(
      validateUpstreamDataPack(updatedPokemon, event, names),
      "network",
      1,
    );
    registerExtensionTranslations("ja");
  });
  expect(host.textContent).toBe("タマゲタケ / モロバレル");
  expect({ ...localStorage }).toEqual(before);
  await act(async () => {
    root.unmount();
  });
});
