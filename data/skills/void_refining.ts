import { Skill, MajorRealm, ProfessionType } from "../../types";

export const VOID_REFINING_SKILLS: Record<string, Skill> = {
  // --- Body Cultivator (Void Refinement) ---
  b_vr_active: {
    id: "b_vr_active",
    name: "吞天蝕日",
    description:
      "對非 Boss 直接吞噬斬殺；對 Boss 造成 500% 傷害並附加【中毒】3 回合，自身獲得【反震】。",
    type: "Active",
    cooldown: 10,
    minRealm: MajorRealm.VoidRefining,
    profession: ProfessionType.Body,
    damageMultiplier: 5.0,
    targetType: "single",
    effectType: "special", // Execute logic
    statusEffect: {
      id: "poison",
      duration: 3,
      chance: 1.0,
      value: 0.018,
    },
  },
  // --- Mage Cultivator (Void Refinement) ---
  m_vr_active: {
    id: "m_vr_active",
    name: "袖裡乾坤",
    description:
      "將敵方放逐 1 回合，使其暫時無法行動。",
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
};
