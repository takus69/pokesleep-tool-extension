import { TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import pokemons from "../../../../../pokesleep-tool/src/data/pokemons";
import PokemonSelectDialog from "../../../../../pokesleep-tool/src/ui/IvCalc/IvForm/PokemonSelectDialog";
import type { PokemonOption } from "../../../../../pokesleep-tool/src/ui/IvCalc/IvForm/PokemonTextField";
import PokemonIv from "../../../../../pokesleep-tool/src/util/PokemonIv";

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
        placeholder={t("fork.scenario.select condition")}
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
