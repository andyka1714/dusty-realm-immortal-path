import { Skill, MajorRealm, ProfessionType } from "../../types";

export const IMMORTAL_EMPEROR_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Immortal Emperor) ---
  s_ie_active: {
    id: "s_ie_active",
    name: "一劍開天",
    description:
      "對敵方全體造成 2000% 毀滅傷害。此傷害無視護盾、無敵與減傷效果。",
    type: "Active",
    cooldown: 20,
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Sword,
    damageMultiplier: 20.0,
    targetType: "all",
    effectType: "damage",
    // Pierce all logic
  },
  s_ie_passive: {
    id: "s_ie_passive",
    name: "萬法皆空",
    description: "免疫所有負面狀態。普攻傷害轉化為真實傷害。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  },

  // --- Body Cultivator (Immortal Emperor) ---
  b_ie_active: {
    id: "b_ie_active",
    name: "掌中神國",
    description:
      "將敵方全體困入掌中神國，每回合造成 500% 傷害並吸取其 10% 最大生命值，持續 3 回合。",
    type: "Active",
    cooldown: 15,
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Body,
    targetType: "all",
    effectType: "special",
    statusEffect: {
      id: "god_kingdom",
      duration: 3,
      chance: 1.0,
      value: 0.1, // 10% HP drain
    },
  },
  b_ie_passive: {
    id: "b_ie_passive",
    name: "不死不滅",
    description: "除非受到「法則」類攻擊，否則生命值不會低於 1 點。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  },

  // --- Mage Cultivator (Immortal Emperor) ---
  m_ie_active: {
    id: "m_ie_active",
    name: "一念花開",
    description:
      "一念之間，萬物生滅。對敵方全體造成 1500% 傷害，並將其增益狀態轉化為等量的負面狀態。",
    type: "Active",
    cooldown: 15,
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Mage,
    damageMultiplier: 15.0,
    targetType: "all",
    effectType: "special",
    // Invert buff logic
  },
  m_ie_passive: {
    id: "m_ie_passive",
    name: "萬法歸宗",
    description:
      "所有元素抗性提升 80%。戰鬥開始時，所有敵方單位冷卻時間增加 2 回合。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.ImmortalEmperor,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
