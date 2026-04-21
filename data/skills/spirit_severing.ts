import { Skill, MajorRealm, ProfessionType } from "../../types";

export const SPIRIT_SEVERING_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Soul Formation) ---
  s_sf_active: {
    id: "s_sf_active",
    name: "斬天拔劍術",
    description: "對單體造成 600% 劍傷，且本次必定暴擊。",
    type: "Active",
    cooldown: 8,
    minRealm: MajorRealm.SpiritSevering,
    profession: ProfessionType.Sword,
    damageMultiplier: 6.0,
    targetType: "single",
    effectType: "damage",
    // Charge logic
  },
  s_sf_passive: {
    id: "s_sf_passive",
    name: "劍意化形",
    description:
      "普攻將轉化為兩段傷害，每段造成 60% 攻擊力，均可觸發攻擊特效。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.SpiritSevering,
    profession: ProfessionType.Sword,
    // Multi-hit basic attack logic
  },

  // --- Body Cultivator (Soul Formation) ---
  b_sf_active: {
    id: "b_sf_active",
    name: "撼地擊",
    description:
      "對全體造成 250% 體魄傷害，並施加【破甲】與【易傷】2 回合。",
    type: "Active",
    cooldown: 5,
    minRealm: MajorRealm.SpiritSevering,
    profession: ProfessionType.Body,
    damageMultiplier: 2.5,
    targetType: "all",
    effectType: "damage",
    statusEffect: {
      id: "earth_shatter_debuff",
      duration: 2,
      chance: 1.0,
      value: 0.3, // 30% reduce
    },
  },
  b_sf_passive: {
    id: "b_sf_passive",
    name: "肉身成聖",
    description: "受到單次傷害超過最大生命 20% 時，該次傷害減半。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.SpiritSevering,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  },

  // --- Mage Cultivator (Soul Formation) ---
  m_sf_active: {
    id: "m_sf_active",
    name: "三昧真火",
    description:
      "對單體造成 300% 火法傷害，並附加【燃燒】3 回合。",
    type: "Active",
    cooldown: 4,
    minRealm: MajorRealm.SpiritSevering,
    profession: ProfessionType.Mage,
    damageMultiplier: 3.0,
    targetType: "single",
    effectType: "damage",
    statusEffect: {
      id: "true_fire_burn",
      duration: 3,
      chance: 1.0,
      value: 0.03,
    },
  },
  m_sf_passive: {
    id: "m_sf_passive",
    name: "道法自然",
    description: "所有技能冷卻時間減少 1 回合(最低 1 回合)。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.SpiritSevering,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
