import { Skill, MajorRealm, ProfessionType } from "../../types";

export const MAHAYANA_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Mahayana) ---
  s_ma_active: {
    id: "s_ma_active",
    name: "絕仙劍",
    description:
      "對全體敵人造成 500% 傷害，並斬斷其靈力流動，使其無法回復靈力，持續 3 回合。",
    type: "Active",
    cooldown: 8,
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Sword,
    damageMultiplier: 5.0,
    targetType: "all",
    effectType: "damage",
    statusEffect: {
      id: "spirit_sever",
      duration: 3,
      chance: 1.0,
    },
  },
  // --- Body Cultivator (Mahayana) ---
  b_ma_active: {
    id: "b_ma_active",
    name: "星辰隕",
    description:
      "跳向高空墜落，對全體造成 (攻擊力 + 50% 當前生命值) 的物理傷害，並暈眩 1 回合。",
    type: "Active",
    cooldown: 8,
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Body,
    targetType: "all",
    effectType: "damage",
    statusEffect: {
      id: "stun",
      duration: 1,
      chance: 1.0,
    },
  },
  // --- Mage Cultivator (Mahayana) ---
};
