import {
  Button,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  ThemeProvider,
} from "@mui/material";
import { PokemonBoxItem } from "@upstream/util/PokemonBox";
import PokemonIv from "@upstream/util/PokemonIv";
import { createStrengthParameter } from "@upstream/util/PokemonStrength";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  IvForm,
  i18n,
  loadLanguage,
  PokemonIcon,
} from "../../src/features/ranking/upstreamUi";
import ReadOnlyComparisonBoxPanel from "../../src/features/ranking/workspace/ReadOnlyComparisonBoxPanel";

const fixtures: Record<string, string> = {
  blissey: "Blissey",
  luxray: "Luxray",
  venusaur: "Venusaur",
  gourgeist: "Gourgeist (Jumbo)",
  magnezone: "Magnezone",
  dedenne: "Dedenne",
  cramorant: "Cramorant",
};
const roles = {
  food: ["blissey", "luxray", "venusaur", "gourgeist"],
  pot: ["magnezone"],
  chance: ["dedenne", "cramorant"],
};
const ivs = Object.fromEntries(
  Object.entries(fixtures).map(([key, pokemonName]) => [
    key,
    new PokemonIv({ pokemonName, level: 60 }),
  ]),
);
const parameter = createStrengthParameter({});
const theme = createTheme({
  typography: { fontFamily: '"M PLUS 1p", Meiryo, sans-serif' },
});
let openEditor: (role: keyof typeof roles, id?: string) => void;

function PokemonEditor() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<keyof typeof roles>("food");
  const [tab, setTab] = useState(0);
  const [iv, setIv] = useState(ivs.blissey);
  const [selected, setSelected] = useState(0);
  openEditor = (nextRole, id) => {
    setRole(nextRole);
    setIv(ivs[id || roles[nextRole][0]]);
    setSelected(id ? Math.max(0, roles[nextRole].indexOf(id)) : 0);
    setTab(id ? 0 : 1);
    setOpen(true);
  };
  const keys = roles[role];
  const items = keys.map(
    (key, index) => new PokemonBoxItem(ivs[key], undefined, index),
  );
  const fixtureId = Object.keys(fixtures).find(
    (key) => fixtures[key] === iv.pokemonName && keys.includes(key),
  );
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: (theme) => ({
            height: "min(800px, calc(100% - 64px))",
            overflow: "hidden",
            [theme.breakpoints.down("sm")]: {
              borderRadius: 0,
              height: "100%",
              margin: 0,
              maxHeight: "none",
              maxWidth: "none",
              width: "100%",
            },
          }),
        },
      }}
    >
      <DialogTitle>担当ポケモン</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="ポケモン" />
          <Tab label="ボックス" />
        </Tabs>
        {tab === 1 ? (
          <ReadOnlyComparisonBoxPanel
            items={items}
            selectedId={selected}
            emptyMessage="ボックスに個体がありません"
            onSelect={(id) => {
              setSelected(id);
              setIv(items[id].iv);
            }}
          />
        ) : (
          <IvForm
            hideCandyButton
            pokemonIv={iv}
            parameter={parameter}
            dispatch={(action) => {
              if (action.type === "updateIv") setIv(action.payload.iv);
            }}
            onChange={setIv}
          />
        )}
        <p style={{ fontSize: 12, color: "#666" }}>
          ランキング比較と同じIvForm・ボックス部品を使用。ボックスはモック用の個体です。能力を編集しても、このモックの日次取得量は設定例のままです。
        </p>
        {!fixtureId && (
          <p style={{ color: "#b43b32" }}>
            この個体の日次量はモック未対応です。ボックスの設定例を選んでください。
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          disabled={!fixtureId}
          onClick={() => {
            if (!fixtureId) return;
            ivs[fixtureId] = iv;
            window.dispatchEvent(
              new CustomEvent("mock-pokemon-selected", {
                detail: { id: fixtureId, level: iv.level },
              }),
            );
            setOpen(false);
          }}
        >
          この個体を担当に設定
        </Button>
        <Button onClick={() => setOpen(false)}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}

await loadLanguage("ja");
await i18n.changeLanguage("ja");
const host = document.createElement("div");
document.body.append(host);
createRoot(host).render(
  <ThemeProvider theme={theme}>
    <PokemonEditor />
  </ThemeProvider>,
);
const roots = new Map<Element, ReturnType<typeof createRoot>>();
function renderIcons() {
  for (const [node, root] of roots)
    if (!node.isConnected) {
      root.unmount();
      roots.delete(node);
    }
  for (const node of document.querySelectorAll<HTMLElement>(
    "[data-pokemon-icon]",
  )) {
    const iv = ivs[node.dataset.pokemonIcon || ""];
    if (!iv) continue;
    const root = roots.get(node) || createRoot(node);
    roots.set(node, root);
    root.render(
      <ThemeProvider theme={theme}>
        <PokemonIcon idForm={iv.idForm} shiny={iv.shiny} size={32} />
      </ThemeProvider>,
    );
  }
}
window.addEventListener("mock-pokemon-rows", renderIcons);
document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLElement>(
    "[data-pokemon-role]",
  );
  if (button)
    openEditor?.(
      button.dataset.pokemonRole as keyof typeof roles,
      button.dataset.pokemonId,
    );
});
renderIcons();
