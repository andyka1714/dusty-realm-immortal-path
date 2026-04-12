import { MajorRealm, ProfessionType, Skill } from "../../types";
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

export const BATTLE_ABSORBED_RETIRED_PASSIVE_ALIASES: Record<string, Skill> = {
  ...IMMORTAL_RETIRED_PASSIVE_ALIASES,
  ...IMMORTAL_EMPEROR_RETIRED_PASSIVE_ALIASES,
};

export const BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_IDS = Object.keys(
  BATTLE_ABSORBED_RETIRED_PASSIVE_ALIASES
);

export const RETIREMENT_READY_RETIRED_PASSIVE_ALIASES =
  BATTLE_ABSORBED_RETIRED_PASSIVE_ALIASES;
