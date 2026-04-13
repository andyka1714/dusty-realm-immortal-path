import { MajorRealm, ProfessionType, Skill } from "../../types";
import { getSkillPoolEntry } from "./pool";
import { MAHAYANA_SKILLS } from "./mahayana";
import { TRIBULATION_SKILLS } from "./tribulation";
import { VOID_REFINING_SKILLS } from "./void_refining";

const buildRetiredActiveAlias = (
  replacementSkill: Skill,
  overrides: Pick<
    Skill,
    "id" | "name" | "description" | "minRealm" | "profession" | "targetType" | "effectType"
  > &
    Partial<
      Pick<
        Skill,
        | "cooldown"
        | "damageMultiplier"
        | "statusEffect"
        | "cooldownSeconds"
        | "castRange"
        | "castTimeMs"
        | "projectileSpeed"
        | "areaShape"
        | "areaRadius"
        | "maxTargets"
      >
    >
): Skill => ({
  ...replacementSkill,
  ...overrides,
  replacementSkillId:
    getSkillPoolEntry(overrides.id)?.replacementSkillId ?? replacementSkill.replacementSkillId,
  cooldown: overrides.cooldown ?? replacementSkill.cooldown,
  damageMultiplier: overrides.damageMultiplier ?? replacementSkill.damageMultiplier,
  statusEffect: overrides.statusEffect ?? replacementSkill.statusEffect,
});

export const VOID_REFINING_RETIRED_ACTIVE_ALIASES: Record<string, Skill> = {
  s_vr_active: buildRetiredActiveAlias(MAHAYANA_SKILLS.s_ma_active, {
    id: "s_vr_active",
    name: "虛空劍陣",
    description: "召喚劍陣，持續 3 回合。每回合對隨機敵人造成 3 次 100% 傷害。",
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Sword,
    targetType: "all",
    effectType: "summon",
    cooldown: 7,
    damageMultiplier: undefined,
    statusEffect: undefined,
    cooldownSeconds: 6.8,
    castRange: 2,
    castTimeMs: 280,
    projectileSpeed: undefined,
    areaShape: "line",
    areaRadius: 1,
    maxTargets: 4,
  }),
};

export const FUSION_RETIRED_ACTIVE_ALIASES: Record<string, Skill> = {
  s_bi_active: buildRetiredActiveAlias(TRIBULATION_SKILLS.s_tr_active, {
    id: "s_bi_active",
    name: "萬劍歸一",
    description:
      "對單體造成 800% 傷害。若目標處於【劍氣】狀態，消耗所有層數，每層提升 50% 傷害。",
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Sword,
    targetType: "single",
    effectType: "damage",
    cooldown: 6,
    damageMultiplier: 8.0,
    statusEffect: undefined,
    cooldownSeconds: 5.8,
    castRange: 1,
    castTimeMs: 260,
    projectileSpeed: undefined,
    areaShape: "single",
    areaRadius: 0,
    maxTargets: 1,
  }),
  b_bi_active: buildRetiredActiveAlias(MAHAYANA_SKILLS.b_ma_active, {
    id: "b_bi_active",
    name: "法天象地",
    description:
      "變身巨人，生命值上限翻倍，當前生命值等比提升，持續 5 回合。結束後扣除溢出生命。",
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Body,
    targetType: "self",
    effectType: "buff",
    cooldown: 12,
    damageMultiplier: undefined,
    statusEffect: {
      id: "giant_form",
      duration: 5,
      chance: 1.0,
    },
    cooldownSeconds: 11,
    castRange: 0,
    castTimeMs: 360,
    projectileSpeed: undefined,
    areaShape: "self",
    areaRadius: 0,
    maxTargets: 1,
  }),
  m_bi_active: buildRetiredActiveAlias(TRIBULATION_SKILLS.m_tr_active, {
    id: "m_bi_active",
    name: "元神出竅",
    description:
      "元神離體進行攻擊，對全體造成 400% 傷害，並無視敵人 50% 法術防禦。",
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Mage,
    targetType: "all",
    effectType: "damage",
    cooldown: 6,
    damageMultiplier: 4.0,
    statusEffect: undefined,
    cooldownSeconds: 5.5,
    castRange: 5,
    castTimeMs: 420,
    projectileSpeed: 12,
    areaShape: "circle",
    areaRadius: 2,
    maxTargets: 6,
  }),
};

export const MAHAYANA_RETIRED_ACTIVE_ALIASES: Record<string, Skill> = {
  m_ma_active: buildRetiredActiveAlias(TRIBULATION_SKILLS.m_tr_active, {
    id: "m_ma_active",
    name: "掌心雷",
    description:
      "瞬發，對單體造成 600% 雷系傷害，並有 80% 機率麻痺目標 (無法行動) 1 回合。",
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Mage,
    targetType: "single",
    effectType: "damage",
    cooldown: 4,
    damageMultiplier: 6.0,
    statusEffect: {
      id: "paralyze",
      duration: 1,
      chance: 0.8,
    },
    cooldownSeconds: 3.8,
    castRange: 5,
    castTimeMs: 360,
    projectileSpeed: 13,
    areaShape: "single",
    areaRadius: 0,
    maxTargets: 1,
  }),
};

export const TRIBULATION_RETIRED_ACTIVE_ALIASES: Record<string, Skill> = {
  b_tr_active: buildRetiredActiveAlias(VOID_REFINING_SKILLS.b_vr_active, {
    id: "b_tr_active",
    name: "硬抗天劫",
    description:
      "嘲諷全體敵人，並將自身受到的 50% 傷害反彈給來源，持續 3 回合。",
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Body,
    targetType: "all",
    effectType: "special",
    cooldown: 6,
    damageMultiplier: undefined,
    statusEffect: {
      id: "reflect_taunt",
      duration: 3,
      chance: 1.0,
      value: 0.5,
    },
    cooldownSeconds: 5.6,
    castRange: 1,
    castTimeMs: 320,
    projectileSpeed: undefined,
    areaShape: "cone",
    areaRadius: 1,
    maxTargets: 3,
  }),
};

export const IMMORTAL_RETIRED_ACTIVE_ALIASES: Record<string, Skill> = {
  s_im_active: buildRetiredActiveAlias(TRIBULATION_SKILLS.s_tr_active, {
    id: "s_im_active",
    name: "誅仙劍陣",
    description:
      "展開誅仙劍陣領域，持續 5 回合。領域內敵方全體每回合受到 300% 攻擊傷害且防禦降低 30%。",
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Sword,
    targetType: "all",
    effectType: "special",
    cooldown: 15,
    damageMultiplier: undefined,
    statusEffect: {
      id: "zhuxian_domain",
      duration: 5,
      chance: 1.0,
      value: 0.3,
    },
    cooldownSeconds: 13.5,
    castRange: 2,
    castTimeMs: 360,
    projectileSpeed: undefined,
    areaShape: "line",
    areaRadius: 2,
    maxTargets: 4,
  }),
  b_im_active: buildRetiredActiveAlias(MAHAYANA_SKILLS.b_ma_active, {
    id: "b_im_active",
    name: "祖巫降臨",
    description:
      "召喚祖巫虛影，對全體造成 800% 傷害，並將傷害量的 50% 轉化為自身與隊友的生命治療。",
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Body,
    targetType: "all",
    effectType: "damage",
    cooldown: 10,
    damageMultiplier: 8.0,
    statusEffect: undefined,
    cooldownSeconds: 9,
    castRange: 1,
    castTimeMs: 340,
    projectileSpeed: undefined,
    areaShape: "cone",
    areaRadius: 1,
    maxTargets: 3,
  }),
  m_im_active: buildRetiredActiveAlias(TRIBULATION_SKILLS.m_tr_active, {
    id: "m_im_active",
    name: "撒豆成兵",
    description: "召喚 3 個金甲天兵助戰，繼承自身 100% 屬性，持續 5 回合。",
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Mage,
    targetType: "self",
    effectType: "summon",
    cooldown: 12,
    damageMultiplier: undefined,
    statusEffect: undefined,
    cooldownSeconds: 11,
    castRange: 0,
    castTimeMs: 420,
    projectileSpeed: undefined,
    areaShape: "self",
    areaRadius: 0,
    maxTargets: 1,
  }),
};

export const IMMORTAL_EMPEROR_RETIRED_ACTIVE_ALIASES: Record<string, Skill> = {
  s_ie_active: buildRetiredActiveAlias(TRIBULATION_SKILLS.s_tr_active, {
    id: "s_ie_active",
    name: "一劍開天",
    description:
      "對敵方全體造成 2000% 毀滅傷害。此傷害無視護盾、無敵與減傷效果。",
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Sword,
    targetType: "all",
    effectType: "damage",
    cooldown: 20,
    damageMultiplier: 20.0,
    statusEffect: undefined,
    cooldownSeconds: 18,
    castRange: 3,
    castTimeMs: 420,
    projectileSpeed: undefined,
    areaShape: "line",
    areaRadius: 2,
    maxTargets: 5,
  }),
  b_ie_active: buildRetiredActiveAlias(MAHAYANA_SKILLS.b_ma_active, {
    id: "b_ie_active",
    name: "掌中神國",
    description:
      "將敵方全體困入掌中神國，每回合造成 500% 傷害並吸取其 10% 最大生命值，持續 3 回合。",
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Body,
    targetType: "all",
    effectType: "special",
    cooldown: 15,
    damageMultiplier: 5.0,
    statusEffect: {
      id: "god_kingdom",
      duration: 3,
      chance: 1.0,
      value: 0.1,
    },
    cooldownSeconds: 13.5,
    castRange: 2,
    castTimeMs: 380,
    projectileSpeed: undefined,
    areaShape: "cone",
    areaRadius: 2,
    maxTargets: 4,
  }),
  m_ie_active: buildRetiredActiveAlias(TRIBULATION_SKILLS.m_tr_active, {
    id: "m_ie_active",
    name: "一念花開",
    description:
      "一念之間，萬物生滅。對敵方全體造成 1500% 傷害，並將其增益狀態轉化為等量的負面狀態。",
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Mage,
    targetType: "all",
    effectType: "special",
    cooldown: 15,
    damageMultiplier: 15.0,
    statusEffect: undefined,
    cooldownSeconds: 13.5,
    castRange: 6,
    castTimeMs: 460,
    projectileSpeed: 14,
    areaShape: "circle",
    areaRadius: 3,
    maxTargets: 6,
  }),
};

export const RETIRED_ACTIVE_ALIASES_BY_REALM: Partial<
  Record<MajorRealm, Record<string, Skill>>
> = {
  [MajorRealm.VoidRefining]: VOID_REFINING_RETIRED_ACTIVE_ALIASES,
  [MajorRealm.Fusion]: FUSION_RETIRED_ACTIVE_ALIASES,
  [MajorRealm.Mahayana]: MAHAYANA_RETIRED_ACTIVE_ALIASES,
  [MajorRealm.Tribulation]: TRIBULATION_RETIRED_ACTIVE_ALIASES,
  [MajorRealm.Immortal]: IMMORTAL_RETIRED_ACTIVE_ALIASES,
  [MajorRealm.ImmortalEmperor]: IMMORTAL_EMPEROR_RETIRED_ACTIVE_ALIASES,
};

export const ALL_RETIRED_ACTIVE_ALIASES: Record<string, Skill> = Object.assign(
  {},
  ...Object.values(RETIRED_ACTIVE_ALIASES_BY_REALM)
);

const selectRetiredActiveAliases = (skillIds: string[]) =>
  Object.fromEntries(
    skillIds.map((skillId) => [skillId, ALL_RETIRED_ACTIVE_ALIASES[skillId]])
  ) as Record<string, Skill>;

export const BATTLE_ABSORBED_RETIRED_ACTIVE_SKILL_IDS = [
  "s_vr_active",
  "s_bi_active",
  "b_bi_active",
  "m_bi_active",
  "m_ma_active",
  "b_tr_active",
  "s_im_active",
  "b_im_active",
  "m_im_active",
  "s_ie_active",
  "b_ie_active",
  "m_ie_active",
];

export const BATTLE_ABSORBED_RETIRED_ACTIVE_ALIASES: Record<string, Skill> =
  selectRetiredActiveAliases(BATTLE_ABSORBED_RETIRED_ACTIVE_SKILL_IDS);

export const BATTLE_ABSORBED_RETIRED_ACTIVE_ALIAS_VIEWS = Object.values(
  BATTLE_ABSORBED_RETIRED_ACTIVE_ALIASES
);

export const RETIREMENT_READY_RETIRED_ACTIVE_ALIASES =
  BATTLE_ABSORBED_RETIRED_ACTIVE_ALIASES;

export const RETIREMENT_READY_RETIRED_ACTIVE_SKILL_IDS =
  BATTLE_ABSORBED_RETIRED_ACTIVE_SKILL_IDS;

export const RETIREMENT_READY_RETIRED_ACTIVE_ALIAS_VIEWS =
  BATTLE_ABSORBED_RETIRED_ACTIVE_ALIAS_VIEWS;

export const RETIREMENT_READY_RETIRED_ACTIVE_ALIAS_ID_SET = new Set<string>(
  RETIREMENT_READY_RETIRED_ACTIVE_SKILL_IDS
);

export const stripRetirementReadyActiveAliases = (
  skills: Record<string, Skill>
) =>
  Object.fromEntries(
    Object.entries(skills).filter(
      ([skillId]) => !RETIREMENT_READY_RETIRED_ACTIVE_ALIAS_ID_SET.has(skillId)
    )
  ) as Record<string, Skill>;
