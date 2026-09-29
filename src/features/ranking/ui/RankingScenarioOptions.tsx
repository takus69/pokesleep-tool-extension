import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import pokemons from "@upstream/data/pokemons";
import {
  getMaxSkillLevel,
  type MainSkillName,
  MainSkillNames,
  VersatileCandidates,
} from "@upstream/util/MainSkill";
import PokemonIv from "@upstream/util/PokemonIv";
import { type IngredientType, IngredientTypes } from "@upstream/util/PokemonRp";
import { useTranslation } from "react-i18next";
import type { RankingScenarioConfig } from "../domain/RankingScenario";
import {
  IngredientTextField,
  LevelInput,
  NatureTextField,
  SleepingTimeControl,
  SubSkillControl,
} from "../upstreamUi";

export function rankingConfigIv(config: RankingScenarioConfig): PokemonIv {
  const pokemon = pokemons.find((value) => value.name === config.pokemonName);
  return new PokemonIv({
    pokemonName: config.pokemonName ?? "Pikachu",
    level: config.level,
    ingredient: config.ingredientPattern,
    nature: config.nature,
    subSkills: config.subSkills,
    ribbon: config.ribbon,
    mythIng1:
      config.mythIng1 ?? pokemon?.mythIng?.find((slot) => slot.c1 > 0)?.name,
    mythIng2:
      config.mythIng2 ?? pokemon?.mythIng?.find((slot) => slot.c2 > 0)?.name,
    mythIng3:
      config.mythIng3 ?? pokemon?.mythIng?.find((slot) => slot.c3 > 0)?.name,
    versatileSkill: config.versatileSkill,
  });
}

export const ribbonLabels = [
  "200 hours-",
  "200 hours+",
  "500 hours+",
  "1000 hours+",
  "2000 hours+",
];

export function RankingOptionSummary({
  config,
}: {
  config: RankingScenarioConfig;
}) {
  const { t } = useTranslation();
  const fixedPattern = !["ingredients", "ingredient"].includes(config.purpose);
  const iv = rankingConfigIv(config);
  return (
    <Typography variant="body2" color="text.secondary">
      {`Lv ${config.level} · ${t("skill level")} ${config.skillLevel === "max" ? "MAX" : config.skillLevel} · ${t(ribbonLabels[config.ribbon])}`}
      {fixedPattern &&
        ` · ${iv.isMythical ? [iv.mythIng1, iv.mythIng2, iv.mythIng3].map((name) => t(`ingredients.${name}`)).join(" / ") : config.pokemonName ? iv.ingredient : config.ingredientPattern}`}
      {config.purpose !== "traits" &&
        ` · ${t(`natures.${config.nature.name}`)} · ${iv.activeSubSkills.map((skill) => t(`subskill.${skill.name}`)).join(" / ") || t("none")}`}
      {!["traits", "ingredients"].includes(config.purpose) &&
        ` · ${t(`ranking.scenario.mythical ${config.mythical}`)} · ${t("ranking.scenario.include unevolved")}: ${t(config.includeUnevolved ? "on" : "off")}`}
    </Typography>
  );
}

export default function RankingScenarioOptions({
  config,
  onChange,
}: {
  config: RankingScenarioConfig;
  onChange: (config: RankingScenarioConfig) => void;
}) {
  const { t } = useTranslation();
  const update = (patch: Partial<RankingScenarioConfig>) =>
    onChange({ ...config, ...patch });
  const iv = rankingConfigIv(config);
  const exploration = !["traits", "ingredients"].includes(config.purpose);
  const maxSkillLevel = Math.max(...MainSkillNames.map(getMaxSkillLevel));
  return (
    <Accordion disableGutters defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack gap={0.5}>
          <Typography>{t("ranking.scenario.options")}</Typography>
          <RankingOptionSummary config={config} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={2}>
          <Stack direction="row" gap={2} alignItems="center">
            <Stack direction="row" gap={1} alignItems="center">
              <Typography variant="body2">{t("level")}</Typography>
              <LevelInput
                max100
                showSlider
                value={config.level}
                onChange={(level) => update({ level })}
              />
            </Stack>
            <TextField
              select
              fullWidth
              label={t("skill level")}
              size="small"
              value={config.skillLevel}
              onChange={(event) =>
                update({
                  skillLevel:
                    event.target.value === "max"
                      ? "max"
                      : Number(event.target.value),
                })
              }
            >
              <MenuItem value="max">MAX</MenuItem>
              {Array.from(
                { length: maxSkillLevel },
                (_, index) => index + 1,
              ).map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Typography variant="caption">
            {t("ranking.scenario.skill level note")}
          </Typography>
          <div>
            <Typography variant="body2">{t("sleeping time shared")}</Typography>
            <SleepingTimeControl
              value={config.ribbon}
              onChange={(ribbon) => update({ ribbon })}
            />
          </div>
          {config.purpose !== "traits" && (
            <>
              <div>
                <Typography variant="body2">{t("nature")}</Typography>
                <NatureTextField
                  iv={
                    new PokemonIv({
                      pokemonName: "Pikachu",
                      nature: config.nature,
                    })
                  }
                  onChange={(nature) => update({ nature })}
                />
              </div>
              <div>
                <Typography variant="body2">{t("sub skills")}</Typography>
                <SubSkillControl
                  value={config.subSkills}
                  onChange={({ value }) => update({ subSkills: value })}
                />
              </div>
            </>
          )}
          {!["ingredients", "ingredient"].includes(config.purpose) && (
            <div>
              <Typography variant="body2">
                {t("ranking.ingredientRanking.ingredient configuration")}
              </Typography>
              {config.purpose === "traits" && config.pokemonName ? (
                <IngredientTextField
                  iv={iv}
                  onChange={(value) =>
                    update({
                      ingredientPattern: value.ingredient,
                      mythIng1: value.mythIng1,
                      mythIng2: value.mythIng2,
                      mythIng3: value.mythIng3,
                    })
                  }
                />
              ) : (
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={config.ingredientPattern}
                  onChange={(event) =>
                    update({
                      ingredientPattern: event.target.value as IngredientType,
                    })
                  }
                >
                  {IngredientTypes.map((pattern) => (
                    <MenuItem key={pattern} value={pattern}>
                      {pattern}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </div>
          )}
          {exploration && (
            <>
              <TextField
                select
                size="small"
                label={t("ranking.scenario.mythical")}
                value={config.mythical}
                onChange={(event) =>
                  update({
                    mythical: event.target
                      .value as RankingScenarioConfig["mythical"],
                  })
                }
              >
                {["exclude", "same", "all"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {t(`ranking.scenario.mythical ${value}`)}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="caption" color="text.secondary">
                {t("ranking.scenario.mythical note")}
              </Typography>
              <FormControlLabel
                label={t("ranking.scenario.include unevolved")}
                control={
                  <Switch
                    checked={config.includeUnevolved}
                    onChange={(_event, checked) =>
                      update({ includeUnevolved: checked })
                    }
                  />
                }
              />
            </>
          )}
          {(config.pokemonName === "Mew" ||
            (exploration && config.mythical !== "exclude")) && (
            <TextField
              select
              size="small"
              label={t("skills.Versatile.name")}
              value={
                config.versatileSkill ??
                new PokemonIv({ pokemonName: "Mew" }).versatileSkill
              }
              onChange={(event) =>
                update({ versatileSkill: event.target.value as MainSkillName })
              }
            >
              {VersatileCandidates.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {t(`skills.${skill.replace(" (Random)", "")}.name`)}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
