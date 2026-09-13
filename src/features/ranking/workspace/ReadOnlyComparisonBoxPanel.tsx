import { ButtonBase, Typography } from "@mui/material";
import { styled } from "@mui/system";
import PokemonIcon from "@upstream/ui/IvCalc/PokemonIcon";
import type { PokemonBoxItem } from "@upstream/util/PokemonBox";
import { useTranslation } from "react-i18next";

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
      <Typography color="text.secondary" sx={{ m: "5rem auto 0" }}>
        {t("box is empty")}
      </Typography>
    );
  }
  return (
    <BoxItems>
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <BoxItem key={item.id}>
            <ButtonBase
              onClick={() => onSelect(item.id)}
              aria-pressed={selected}
              className={selected ? "selected" : undefined}
            >
              <header>
                <span className="lv">Lv.</span>
                {item.iv.level}
              </header>
              <PokemonIcon
                idForm={item.iv.idForm}
                shiny={item.iv.shiny}
                size={32}
              />
              <footer>
                {item.nickname || t(`pokemons.${item.iv.pokemonName}`)}
              </footer>
            </ButtonBase>
          </BoxItem>
        );
      })}
    </BoxItems>
  );
}

const BoxItems = styled("div")({
  alignContent: "flex-start",
  display: "flex",
  flexWrap: "wrap",
  margin: "0.8rem 0",
  overflowX: "hidden",
  overflowY: "auto",
  width: "100%",
});

/** Read-only form of the upstream BoxView card. */
const BoxItem = styled("div")({
  position: "relative",
  "& > button": {
    border: "1px solid transparent",
    display: "block",
    fontFamily: '"M PLUS 1p"',
    padding: "0.2rem 0",
    textAlign: "center",
    width: "80px",
    "& > header": {
      fontSize: "0.7rem",
      fontWeight: "bold",
      "& > span.lv": {
        color: "#62d540",
        fontSize: "0.6rem",
        paddingRight: "0.2rem",
      },
    },
    "& > div": { margin: "0.1rem auto" },
    "& > footer": {
      color: "#666",
      fontSize: "0.8rem",
      overflowWrap: "anywhere",
    },
    "&.selected": {
      background: "#d3e9f7",
      border: "1px solid #5e7da0",
      borderRadius: "0.5rem",
    },
  },
});
