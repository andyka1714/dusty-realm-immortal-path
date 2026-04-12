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
  // --- Body Cultivator (Body Integration) ---
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
};
