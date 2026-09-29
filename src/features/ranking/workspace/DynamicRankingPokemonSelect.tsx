import { TextField } from "@mui/material";
import pokemons from "@upstream/data/pokemons";
import PokemonIv from "@upstream/util/PokemonIv";
import React from "react";
import { useTranslation } from "react-i18next";
import { type PokemonOption, PokemonSelectDialog } from "../upstreamUi";

/** Upstream picker adapted so data-only additions retain a readable name. */
export default function DynamicRankingPokemonSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (pokemonName: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const options = React.useMemo<PokemonOption[]>(
    () =>
      pokemons.map((pokemon) => ({
        ...pokemon,
        idForm: new PokemonIv({ pokemonName: pokemon.name }).idForm,
        localName: t(`pokemons.${pokemon.name}`, {
          defaultValue: pokemon.name,
        }),
        isNonEvolving: pokemon.evolutionCount === -1,
        isFullyEvolved: pokemon.isFullyEvolved,
        ing1Name: pokemon.ing1.name,
        ing2Name: pokemon.ing2.name,
        ing3Name: pokemon.ing3?.name,
      })),
    [t],
  );
  const selected = options.find((pokemon) => pokemon.name === value);
  const unselected = {
    ...options[0],
    id: -1,
    idForm: -1,
    name: "",
    localName: "",
  };
  const dialogOptions = selected ? options : [unselected, ...options];

  return (
    <>
      <TextField
        label={t("pokemon")}
        value={selected?.localName ?? ""}
        placeholder={t("ranking.scenario.select condition")}
        fullWidth
        size="small"
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        slotProps={{
          input: { readOnly: true },
          htmlInput: { role: "button", "aria-haspopup": "dialog" },
        }}
      />
      <PokemonSelectDialog
        open={open}
        shiny={false}
        pokemonOptions={dialogOptions}
        selectedValue={selected ?? unselected}
        onClose={() => setOpen(false)}
        onChange={(pokemon) => onChange(pokemon.name)}
      />
    </>
  );
}
