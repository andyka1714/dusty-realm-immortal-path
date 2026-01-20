import { Skill, MajorRealm, ProfessionType } from "../../types";

export const VOID_REFINING_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Void Refinement) ---
  s_vr_active: {
    id: "s_vr_active",
    name: "虛空劍陣",
    description: "召喚劍陣，持續 3 回合。每回合對隨機敵人造成 3 次 100% 傷害。",
    type: "Active",
    cooldown: 7, // Design adjusted
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Sword,
    targetType: "all", // Summon logic
    effectType: "summon",
    // Summon logic
  },
  s_vr_passive: {
    id: "s_vr_passive",
    name: "法則之劍",
    description: "攻擊時有 10% 機率無視目標 50% 防禦力，並造成 150% 暴擊傷害。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  },

  // --- Body Cultivator (Void Refinement) ---
  b_vr_active: {
    id: "b_vr_active",
    name: "吞天蝕日",
    description:
      "吞噬一名非 Boss 敵人(低於自身境界)立即斬殺；對 Boss 造成 500% 傷害並回復大量生命。",
    type: "Active",
    cooldown: 10,
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Body,
    damageMultiplier: 5.0,
    targetType: "single",
    effectType: "special", // Execute logic
  },
  b_vr_passive: {
    id: "b_vr_passive",
    name: "荒古戰體",
    description: "永久提升 30% 最大生命值。每回合解除自身一個負面狀態。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  },

  // --- Mage Cultivator (Void Refinement) ---
  m_vr_active: {
    id: "m_vr_active",
    name: "袖裡乾坤",
    description:
      "將敵方放逐至異空間 1 回合(無法行動、無敵)，並使其冷卻時間暫停。",
    type: "Active",
    cooldown: 7,
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Mage,
    targetType: "single",
    effectType: "special", // Banish logic
    statusEffect: {
      id: "banish",
      duration: 1,
      chance: 1.0,
    },
  },
  m_vr_passive: {
    id: "m_vr_passive",
    name: "空間法則",
    description:
      "閃避率提升 20%。受到攻擊時有 30% 機率將傷害轉移至虛空 (免疫該次傷害)。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
