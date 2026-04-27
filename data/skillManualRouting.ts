import { BESTIARY } from "./enemies";
import {
  getSkillManualId,
  getSkillManualSources,
  type SkillManualSourceEntry,
} from "./items/manuals";
import { SHOPS } from "./shops";
import {
  FORMAL_CORE_SKILLS_SORTED,
  getSkill,
} from "./skills";
import {
  MajorRealmCN,
  type EnemyRank,
  type Skill,
  type SkillManualSourceType,
} from "../types";

export type SkillManualConcreteRouteType = "shop" | "drop" | "quest";

export interface SkillManualConcreteRoute {
  type: SkillManualConcreteRouteType;
  id: string;
  label: string;
  detail?: string;
  sourceType: SkillManualSourceType;
  tags: string[];
}

export interface SkillManualRouteTrace {
  skillId: string;
  manualId: string;
  manualSources: SkillManualSourceEntry[];
  routes: SkillManualConcreteRoute[];
}

const compareRoutes = (
  left: SkillManualConcreteRoute,
  right: SkillManualConcreteRoute
) => `${left.type}:${left.label}`.localeCompare(
  `${right.type}:${right.label}`,
  "zh-Hant"
);

const getShopSourceType = (
  shopId: string,
  manualSources: SkillManualSourceEntry[]
): SkillManualSourceType => {
  if (shopId === "inheritance_pavilion") {
    return "inheritance";
  }

  if (shopId === "skill_shop_mortal") {
    return "shop_mortal";
  }

  const shopSectSource = manualSources.find((source) => source.type === "shop_sect");
  return shopSectSource ? "shop_sect" : "shop_mortal";
};

const getDropSourceType = (rank: EnemyRank): SkillManualSourceType =>
  rank === "Boss" ? "drop_boss" : "drop_elite";

const dedupeRoutes = (routes: SkillManualConcreteRoute[]) => {
  const seen = new Set<string>();
  return routes.filter((route) => {
    const key = `${route.type}:${route.id}:${route.sourceType}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const buildSkillManualRouteTrace = (
  skillOrId: Skill | string
): SkillManualRouteTrace => {
  const skill = typeof skillOrId === "string" ? getSkill(skillOrId) : skillOrId;
  if (!skill) {
    throw new Error(`Unknown skill for manual routing: ${skillOrId}`);
  }

  const manualId = getSkillManualId(skill.id);
  const manualSources = getSkillManualSources(skill);
  const routes: SkillManualConcreteRoute[] = [];

  for (const shop of Object.values(SHOPS)) {
    if (!shop.items.some((item) => item.itemId === manualId)) {
      continue;
    }

    const sourceType = getShopSourceType(shop.id, manualSources);
    routes.push({
      type: "shop",
      id: shop.id,
      label: shop.name,
      detail: shop.description,
      sourceType,
      tags: [shop.id, sourceType],
    });
  }

  for (const enemy of Object.values(BESTIARY)) {
    if (!enemy.drops.includes(manualId)) {
      continue;
    }

    const sourceType = getDropSourceType(enemy.rank);
    routes.push({
      type: "drop",
      id: enemy.id,
      label: `${enemy.name} 掉落`,
      detail: `${MajorRealmCN[enemy.realm]}期 / ${enemy.rank}`,
      sourceType,
      tags: [enemy.id, enemy.rank, sourceType],
    });
  }

  if (manualSources.some((source) => source.type === "quest_sect_trial")) {
    routes.push({
      type: "quest",
      id: "quest_sect_trial",
      label: "宗門入門試煉",
      detail: "入門主動核心秘卷",
      sourceType: "quest_sect_trial",
      tags: ["quest_sect_trial"],
    });
  }

  return {
    skillId: skill.id,
    manualId,
    manualSources,
    routes: dedupeRoutes(routes).sort(compareRoutes),
  };
};

export const buildAllFormalCoreManualRouteTraces = () =>
  FORMAL_CORE_SKILLS_SORTED.map((skill) => buildSkillManualRouteTrace(skill));
