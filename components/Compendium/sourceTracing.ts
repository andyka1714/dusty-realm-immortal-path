import { BESTIARY } from "../../data/enemies";
import { ENCOUNTER_EVENTS, type EncounterRepeatPolicy } from "../../data/encounters";
import {
  getSkillManualId,
  getSkillManualSources,
  type SkillManualSourceEntry,
} from "../../data/items/manuals";
import { SHOPS } from "../../data/shops";
import {
  WORKSHOP_RECIPES,
  type WorkshopRecipe,
  type WorkshopRecipeDiscipline,
  type WorkshopRecipeTier,
} from "../../data/workshopRecipes";
import { MajorRealmCN, type EnemyRank, type ProfessionType, type Skill } from "../../types";
import { getSkill } from "../../data/skills";

export type CompendiumSourceKind =
  | "drop"
  | "shop"
  | "workshop_output"
  | "workshop_sink"
  | "encounter_route"
  | "skill_manual";

export interface CompendiumSourceChip {
  kind: CompendiumSourceKind;
  label: string;
  detail?: string;
  tags: string[];
}

export interface CompendiumDropSource {
  enemyId: string;
  enemyName: string;
  rank: EnemyRank;
  realmLabel: string;
}

export interface CompendiumShopSource {
  shopId: string;
  shopName: string;
}

export interface CompendiumWorkshopSource {
  recipeId: string;
  recipeName: string;
  discipline: WorkshopRecipeDiscipline;
  tier?: WorkshopRecipeTier;
  routeTags: string[];
  sourceHint: string;
}

export interface CompendiumEncounterRouteSource {
  eventId: string;
  eventTitle: string;
  choiceId: string;
  choiceLabel: string;
  categoryLabel?: string;
  routeLabel?: string;
  chainLabel?: string;
  memoryCue?: string;
  sectLabel?: string;
  repeatPolicy?: EncounterRepeatPolicy;
  worldMemoryTags: string[];
  cueLabels: string[];
}

export interface CompendiumItemSourceTrace {
  itemId: string;
  sources: CompendiumSourceChip[];
  dropSources: CompendiumDropSource[];
  shopSources: CompendiumShopSource[];
  workshopOutputs: CompendiumWorkshopSource[];
  workshopSinks: CompendiumWorkshopSource[];
  encounterRoutes: CompendiumEncounterRouteSource[];
}

export interface CompendiumSkillSourceTrace {
  skillId: string;
  skillName: string;
  profession?: ProfessionType;
  formalSourceTier?: Skill["formalSourceTier"];
  formalSourceLabel: string;
  manualId: string;
  manualSources: SkillManualSourceEntry[];
  manualSourceLabels: string[];
  sources: CompendiumSourceChip[];
}

const getFormalSourceLabel = (source?: Skill["formalSourceTier"]): string => {
  switch (source) {
    case "shop":
      return "藏經閣";
    case "elite":
      return "精英掉落";
    case "boss":
      return "首領核心";
    case "inheritance":
      return "古修傳承";
    default:
      return "未標記";
  }
};

const dedupeStrings = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

const compareByLabel = <T>(getLabel: (value: T) => string) => (left: T, right: T) =>
  getLabel(left).localeCompare(getLabel(right), "zh-Hant");

const toWorkshopSource = (recipe: WorkshopRecipe): CompendiumWorkshopSource => ({
  recipeId: recipe.id,
  recipeName: recipe.name,
  discipline: recipe.discipline,
  tier: recipe.tier,
  routeTags: recipe.routeTags ?? [],
  sourceHint: recipe.sourceHint ?? "",
});

const buildDropSources = (itemId: string): CompendiumDropSource[] =>
  Object.values(BESTIARY)
    .filter((enemy) => enemy.drops.includes(itemId))
    .map((enemy) => ({
      enemyId: enemy.id,
      enemyName: enemy.name,
      rank: enemy.rank,
      realmLabel: MajorRealmCN[enemy.realm],
    }))
    .sort(compareByLabel((source) => `${source.realmLabel}:${source.enemyName}`));

const buildShopSources = (itemId: string): CompendiumShopSource[] =>
  Object.values(SHOPS)
    .filter((shop) => shop.items.some((item) => item.itemId === itemId))
    .map((shop) => ({
      shopId: shop.id,
      shopName: shop.name,
    }))
    .sort(compareByLabel((source) => source.shopName));

const buildWorkshopOutputSources = (itemId: string): CompendiumWorkshopSource[] =>
  Object.values(WORKSHOP_RECIPES)
    .filter((recipe) => recipe.outputs.some((output) => output.itemId === itemId))
    .map(toWorkshopSource)
    .sort(compareByLabel((source) => source.recipeName));

const buildWorkshopSinkSources = (itemId: string): CompendiumWorkshopSource[] =>
  Object.values(WORKSHOP_RECIPES)
    .filter((recipe) => recipe.ingredients.some((ingredient) => ingredient.itemId === itemId))
    .map(toWorkshopSource)
    .sort(compareByLabel((source) => source.recipeName));

const buildEncounterRouteSources = (
  itemId: string
): CompendiumEncounterRouteSource[] =>
  Object.values(ENCOUNTER_EVENTS)
    .flatMap((event) =>
      event.choices
        .filter((choice) =>
          choice.reward.items?.some((rewardItem) => rewardItem.itemId === itemId)
        )
        .map((choice) => ({
          eventId: event.id,
          eventTitle: event.title,
          choiceId: choice.id,
          choiceLabel: choice.label,
          categoryLabel: event.presentation?.categoryLabel,
          routeLabel: event.presentation?.routeLabel,
          chainLabel: event.presentation?.chainLabel,
          memoryCue: event.presentation?.memoryCue,
          sectLabel: event.presentation?.sectLabel,
          repeatPolicy: event.selector?.repeatPolicy,
          worldMemoryTags: [
            ...(event.selector?.requiredWorldMemoryTags ?? []),
            ...(event.chain?.worldMemoryTags ?? []),
          ],
          cueLabels: choice.cue?.tags?.map((tag) => tag.label) ?? [],
        }))
    )
    .sort(compareByLabel((source) => `${source.eventTitle}:${source.choiceLabel}`));

const buildItemSourceChips = (
  dropSources: CompendiumDropSource[],
  shopSources: CompendiumShopSource[],
  workshopOutputs: CompendiumWorkshopSource[],
  workshopSinks: CompendiumWorkshopSource[],
  encounterRoutes: CompendiumEncounterRouteSource[]
): CompendiumSourceChip[] => [
  ...dropSources.map((source) => ({
    kind: "drop" as const,
    label: `${source.enemyName} 掉落`,
    detail: source.realmLabel,
    tags: [source.rank, source.realmLabel],
  })),
  ...shopSources.map((source) => ({
    kind: "shop" as const,
    label: source.shopName,
    tags: [source.shopId],
  })),
  ...workshopOutputs.map((source) => ({
    kind: "workshop_output" as const,
    label: `Workshop 產物：${source.recipeName}`,
    detail: source.sourceHint || undefined,
    tags: source.routeTags,
  })),
  ...encounterRoutes.map((source) => ({
    kind: "encounter_route" as const,
    label: dedupeStrings([
      source.routeLabel,
      source.sectLabel,
      source.categoryLabel,
      source.chainLabel,
      source.eventTitle,
      source.repeatPolicy === "repeatable" ? "repeatable aftermath" : undefined,
      ...source.worldMemoryTags,
      ...source.cueLabels,
    ]).join(" / "),
    detail: source.memoryCue,
    tags: dedupeStrings([...source.worldMemoryTags, ...source.cueLabels]),
  })),
  ...workshopSinks.map((source) => ({
    kind: "workshop_sink" as const,
    label: `Workshop sink：${source.recipeName}`,
    detail: source.sourceHint || undefined,
    tags: source.routeTags,
  })),
];

export const buildCompendiumItemSourceTrace = (
  itemId: string
): CompendiumItemSourceTrace => {
  const dropSources = buildDropSources(itemId);
  const shopSources = buildShopSources(itemId);
  const workshopOutputs = buildWorkshopOutputSources(itemId);
  const workshopSinks = buildWorkshopSinkSources(itemId);
  const encounterRoutes = buildEncounterRouteSources(itemId);

  return {
    itemId,
    sources: buildItemSourceChips(
      dropSources,
      shopSources,
      workshopOutputs,
      workshopSinks,
      encounterRoutes
    ),
    dropSources,
    shopSources,
    workshopOutputs,
    workshopSinks,
    encounterRoutes,
  };
};

export const buildCompendiumSkillSourceTrace = (
  skillOrId: Skill | string
): CompendiumSkillSourceTrace => {
  const skill = typeof skillOrId === "string" ? getSkill(skillOrId) : skillOrId;

  if (!skill) {
    throw new Error(`Unknown skill for compendium source tracing: ${skillOrId}`);
  }

  const manualSources = getSkillManualSources(skill);
  const manualSourceLabels = manualSources.map((source) => source.label);
  const formalSourceLabel = getFormalSourceLabel(skill.formalSourceTier);

  return {
    skillId: skill.id,
    skillName: skill.name,
    profession: skill.profession,
    formalSourceTier: skill.formalSourceTier,
    formalSourceLabel,
    manualId: getSkillManualId(skill.id),
    manualSources,
    manualSourceLabels,
    sources: [
      {
        kind: "skill_manual",
        label: `${formalSourceLabel}：${manualSourceLabels.join("、")}`,
        tags: manualSources.map((source) => source.type),
      },
    ],
  };
};
