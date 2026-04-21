import { Skill, MajorRealm, ProfessionType } from "../../types";

export const NASCENT_SOUL_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Nascent Soul) ---
  s_n_active: {
    id: "s_n_active",
    name: "天外飛仙",
    description:
      "對單體造成 400% 劍傷，並附加【流血】3 回合。",
    type: "Active",
    cooldown: 6,
    minRealm: MajorRealm.NascentSoul,
    profession: ProfessionType.Sword,
    damageMultiplier: 4.0,
    targetType: "single",
    effectType: "damage",
    statusEffect: {
      id: "bleed",
      duration: 3,
      chance: 1.0,
      value: 0.02,
    },
  },
  s_n_passive: {
    id: "s_n_passive",
    name: "護體劍罡",
    description:
      "受到致命傷害時，消耗所有靈力抵擋該次傷害，並對敵方造成等量反傷 (每場戰鬥限 1 次)。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.NascentSoul,
    profession: ProfessionType.Sword,
    // Death prevention logic
  },

  // --- Body Cultivator (Nascent Soul) ---
  b_n_active: {
    id: "b_n_active",
    name: "獸神附體",
    description: "變身獸神形態 3 回合：攻擊力+30%，吸血+20%，免疫控制。",
    type: "Active",
    cooldown: 8,
    minRealm: MajorRealm.NascentSoul,
    profession: ProfessionType.Body,
    targetType: "self",
    effectType: "buff",
    statusEffect: {
      id: "beast_god_form",
      duration: 3,
      chance: 1.0,
    },
  },
  b_n_passive: {
    id: "b_n_passive",
    name: "滴血重生",
    description: "每回合回復 (2% 最大生命 + 5% 已損失生命)。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.NascentSoul,
    profession: ProfessionType.Body,
    effectType: "heal",
    targetType: "self",
  },

  // --- Mage Cultivator (Nascent Soul) ---
  m_n_active: {
    id: "m_n_active",
    name: "九天雷劫",
    description:
      "對全體造成 250% 雷法傷害。",
    type: "Active",
    cooldown: 6,
    minRealm: MajorRealm.NascentSoul,
    profession: ProfessionType.Mage,
    damageMultiplier: 2.5,
    targetType: "all",
    effectType: "damage",
    // Channeling logic
  },
  m_n_passive: {
    id: "m_n_passive",
    name: "法力源泉",
    description: "每回合回復 10% 最大靈力值。靈力大於 80% 時，傷害提升 20%。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.NascentSoul,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
