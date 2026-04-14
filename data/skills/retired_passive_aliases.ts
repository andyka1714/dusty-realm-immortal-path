import { MajorRealm, ProfessionType, Skill } from "../../types";
import { getSkillPoolEntry } from "./pool";
import { buildRetiredAliasRecord, buildRetiredAliasViews } from "./retired_alias_utils";
import { GOLDEN_CORE_SKILLS } from "./golden_core";
import { NASCENT_SOUL_SKILLS } from "./nascent_soul";
import { SPIRIT_SEVERING_SKILLS } from "./spirit_severing";
import { TRIBULATION_SKILLS } from "./tribulation";

const buildRetiredPassiveAlias = (
  replacementSkill: Skill,
  overrides: Pick<
    Skill,
    "id" | "name" | "description" | "minRealm" | "profession" | "effectType" | "targetType"
  >
): Skill => ({
  ...replacementSkill,
  ...overrides,
  replacementSkillId:
    getSkillPoolEntry(overrides.id)?.replacementSkillId ?? replacementSkill.replacementSkillId,
  type: "Passive",
  cooldown: 0,
});

export const IMMORTAL_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  s_im_passive: buildRetiredPassiveAlias(TRIBULATION_SKILLS.s_tr_passive, {
    id: "s_im_passive",
    name: "仙元護體",
    description: "每 5 回合獲得一層無敵護盾，可抵擋一次任意傷害。",
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  }),
  b_im_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.b_sf_passive, {
    id: "b_im_passive",
    name: "仙體無垢",
    description: "免疫中毒、流血、燃燒等持續傷害效果。生命回復效果提升 50%。",
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  }),
  m_im_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.m_sf_passive, {
    id: "m_im_passive",
    name: "仙法通神",
    description: "所有技能有機率 (30%) 連續施放兩次，第二次不消耗靈力與冷卻。",
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  }),
};

export const IMMORTAL_EMPEROR_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  s_ie_passive: buildRetiredPassiveAlias(TRIBULATION_SKILLS.s_tr_passive, {
    id: "s_ie_passive",
    name: "萬法皆空",
    description: "免疫所有負面狀態。普攻傷害轉化為真實傷害。",
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  }),
  b_ie_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.b_sf_passive, {
    id: "b_ie_passive",
    name: "不死不滅",
    description: "除非受到「法則」類攻擊，否則生命值不會低於 1 點。",
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  }),
  m_ie_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.m_sf_passive, {
    id: "m_ie_passive",
    name: "萬法歸宗",
    description: "所有元素抗性提升 80%。戰鬥開始時，所有敵方單位冷卻時間增加 2 回合。",
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  }),
};

export const FOUNDATION_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  s_f_passive: buildRetiredPassiveAlias(GOLDEN_CORE_SKILLS.s_g_passive, {
    id: "s_f_passive",
    name: "養劍術",
    description: "每回合結束時，若未受到傷害，攻擊力提升 3% (最多疊加 5 層)。",
    minRealm: MajorRealm.Foundation,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  }),
};

export const VOID_REFINING_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  s_vr_passive: buildRetiredPassiveAlias(TRIBULATION_SKILLS.s_tr_passive, {
    id: "s_vr_passive",
    name: "法則之劍",
    description: "攻擊時有 10% 機率無視目標 50% 防禦力，並造成 150% 暴擊傷害。",
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  }),
  b_vr_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.b_sf_passive, {
    id: "b_vr_passive",
    name: "荒古戰體",
    description: "永久提升 30% 最大生命值。每回合解除自身一個負面狀態。",
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  }),
  m_vr_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.m_sf_passive, {
    id: "m_vr_passive",
    name: "空間法則",
    description: "閃避率提升 20%。受到攻擊時有 30% 機率將傷害轉移至虛空 (免疫該次傷害)。",
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  }),
};

export const FUSION_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  s_bi_passive: buildRetiredPassiveAlias(TRIBULATION_SKILLS.s_tr_passive, {
    id: "s_bi_passive",
    name: "人劍合神",
    description: "自身受到的控制效果持續時間減少 1 回合。永久提升 20% 攻擊力。",
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  }),
  b_bi_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.b_sf_passive, {
    id: "b_bi_passive",
    name: "金剛法相",
    description: "受到的所有最終傷害減少 30%。",
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  }),
  m_bi_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.m_sf_passive, {
    id: "m_bi_passive",
    name: "五氣朝元",
    description: "每回合回復 5% 最大生命與 5% 最大靈力。技能不再消耗靈力。",
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  }),
};

export const MAHAYANA_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  s_ma_passive: buildRetiredPassiveAlias(TRIBULATION_SKILLS.s_tr_passive, {
    id: "s_ma_passive",
    name: "劍道獨尊",
    description: "場上每有一個敵人，自身暴擊率提升 5%，暴擊傷害提升 10%。",
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  }),
  b_ma_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.b_sf_passive, {
    id: "b_ma_passive",
    name: "滴血重生 (真)",
    description: "受到致命傷害時，立即回復 50% 生命值，並獲得 3 回合無敵。(每場戰鬥限 1 次)。",
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Body,
    effectType: "special",
    targetType: "self",
  }),
  m_ma_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.m_sf_passive, {
    id: "m_ma_passive",
    name: "言出法隨",
    description: "技能傷害提升 40%，且必定命中。",
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  }),
};

export const TRIBULATION_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  b_tr_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.b_sf_passive, {
    id: "b_tr_passive",
    name: "萬劫不滅",
    description: "每承受一次傷害，防禦力提升 2%，最多疊加 50 層，持續至戰鬥結束。",
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  }),
  m_tr_passive: buildRetiredPassiveAlias(SPIRIT_SEVERING_SKILLS.m_sf_passive, {
    id: "m_tr_passive",
    name: "雷劫煉心",
    description: "免疫所有控制效果。受到雷屬性傷害時回復生命值。",
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  }),
};

export const RETIRED_PASSIVE_ALIASES_BY_REALM: Partial<
  Record<MajorRealm, Record<string, Skill>>
> = {
  [MajorRealm.Foundation]: FOUNDATION_RETIRED_PASSIVE_ALIASES,
  [MajorRealm.VoidRefining]: VOID_REFINING_RETIRED_PASSIVE_ALIASES,
  [MajorRealm.Fusion]: FUSION_RETIRED_PASSIVE_ALIASES,
  [MajorRealm.Mahayana]: MAHAYANA_RETIRED_PASSIVE_ALIASES,
  [MajorRealm.Tribulation]: TRIBULATION_RETIRED_PASSIVE_ALIASES,
  [MajorRealm.Immortal]: IMMORTAL_RETIRED_PASSIVE_ALIASES,
  [MajorRealm.ImmortalEmperor]: IMMORTAL_EMPEROR_RETIRED_PASSIVE_ALIASES,
};

export const ALL_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = Object.assign(
  {},
  ...Object.values(RETIRED_PASSIVE_ALIASES_BY_REALM)
);

export const BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_IDS = Object.keys(
  ALL_RETIRED_PASSIVE_ALIASES
);

export const BATTLE_ABSORBED_RETIRED_PASSIVE_ALIASES: Record<string, Skill> =
  buildRetiredAliasRecord(
    BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_IDS,
    ALL_RETIRED_PASSIVE_ALIASES
  );

export const BATTLE_ABSORBED_RETIRED_PASSIVE_ALIAS_VIEWS = buildRetiredAliasViews(
  BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_IDS,
  ALL_RETIRED_PASSIVE_ALIASES
);

export const RETIREMENT_READY_RETIRED_PASSIVE_ALIASES =
  BATTLE_ABSORBED_RETIRED_PASSIVE_ALIASES;

export const RETIREMENT_READY_RETIRED_PASSIVE_SKILL_IDS =
  BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_IDS;

export const RETIREMENT_READY_RETIRED_PASSIVE_ALIAS_VIEWS =
  BATTLE_ABSORBED_RETIRED_PASSIVE_ALIAS_VIEWS;

export const RETIREMENT_READY_RETIRED_PASSIVE_ALIAS_ID_SET = new Set<string>(
  RETIREMENT_READY_RETIRED_PASSIVE_SKILL_IDS
);

export const BATTLE_ABSORBED_RETIRED_PASSIVE_ALIAS_ID_SET = new Set<string>(
  BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_IDS
);

export const stripBattleAbsorbedPassiveAliases = (
  skills: Record<string, Skill>
) =>
  Object.fromEntries(
    Object.entries(skills).filter(
      ([skillId]) => !BATTLE_ABSORBED_RETIRED_PASSIVE_ALIAS_ID_SET.has(skillId)
    )
  ) as Record<string, Skill>;
