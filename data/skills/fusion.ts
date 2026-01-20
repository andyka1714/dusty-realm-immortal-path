import { Skill, MajorRealm, ProfessionType } from "../../types";

export const FUSION_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Body Integration) ---
  s_bi_active: {
    id: "s_bi_active",
    name: "萬劍歸一",
    description:
      "對單體造成 800% 傷害。若目標處於【劍氣】狀態，消耗所有層數，每層提升 50% 傷害。",
    type: "Active",
    cooldown: 6,
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Sword,
    damageMultiplier: 8.0,
    targetType: "single",
    effectType: "damage",
  },
  s_bi_passive: {
    id: "s_bi_passive",
    name: "人劍合神",
    description: "自身受到的控制效果持續時間減少 1 回合。永久提升 20% 攻擊力。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  },

  // --- Body Cultivator (Body Integration) ---
  b_bi_active: {
    id: "b_bi_active",
    name: "法天象地",
    description:
      "變身巨人，生命值上限翻倍，當前生命值等比提升，持續 5 回合。結束後扣除溢出生命。",
    type: "Active",
    cooldown: 12,
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Body,
    targetType: "self",
    effectType: "buff",
    statusEffect: {
      id: "giant_form",
      duration: 5,
      chance: 1.0,
    },
  },
  b_bi_passive: {
    id: "b_bi_passive",
    name: "金剛法相",
    description: "受到的所有最終傷害減少 30%。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  },

  // --- Mage Cultivator (Body Integration) ---
  m_bi_active: {
    id: "m_bi_active",
    name: "元神出竅",
    description:
      "元神離體進行攻擊，對全體造成 400% 傷害，並無視敵人 50% 法術防禦。",
    type: "Active",
    cooldown: 6,
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Mage,
    damageMultiplier: 4.0,
    targetType: "all",
    effectType: "damage",
  },
  m_bi_passive: {
    id: "m_bi_passive",
    name: "五氣朝元",
    description: "每回合回復 5% 最大生命與 5% 最大靈力。技能不再消耗靈力。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Fusion,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
