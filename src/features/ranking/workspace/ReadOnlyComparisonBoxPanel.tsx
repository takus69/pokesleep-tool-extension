import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ButtonBase, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import PokemonIcon from "../../../../../pokesleep-tool/src/ui/IvCalc/PokemonIcon";
import type { PokemonBoxItem } from "../../../../../pokesleep-tool/src/util/PokemonBox";

export default function ReadOnlyComparisonBoxPanel({
  items,
  selectedId,
  onSelect,
}: {
  items: readonly PokemonBoxItem[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ m: "5rem auto" }}>
        {t("box is empty")}
      </Typography>
    );
  }
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      alignContent="flex-start"
      gap={1}
      sx={{ overflowY: "auto", p: 1 }}
    >
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <ButtonBase
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-pressed={selected}
            sx={{
              border: "1px solid",
              borderColor: selected ? "primary.main" : "divider",
              borderRadius: 1,
              minWidth: 92,
              p: 1,
              position: "relative",
            }}
          >
            <Stack alignItems="center" gap={0.5}>
              <Typography variant="caption">Lv. {item.iv.level}</Typography>
              <PokemonIcon
                idForm={item.iv.idForm}
                shiny={item.iv.shiny}
                size={32}
              />
              <Typography variant="caption">
                {item.nickname || t(`pokemons.${item.iv.pokemonName}`)}
              </Typography>
            </Stack>
            {selected && (
              <CheckCircleIcon
                color="primary"
                sx={{ position: "absolute", right: 2, top: 2, fontSize: 18 }}
              />
            )}
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
