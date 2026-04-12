import { Skill, MajorRealm, ProfessionType } from "../../types";

export const VOID_REFINING_SKILLS: Record<string, Skill> = {
  // --- Body Cultivator (Void Refinement) ---
  b_vr_active: {
    id: "b_vr_active",
    name: "吞天蝕日",
    description:
      "吞噬一名非 Boss 敵人(低於自身境界)立即斬殺；對 Boss 造成 500% 傷害並附加【蝕骨毒】3 回合，同時回復大量生命。",
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
};
