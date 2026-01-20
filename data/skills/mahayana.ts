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
  s_ma_passive: {
    id: "s_ma_passive",
    name: "劍道獨尊",
    description: "場上每有一個敵人，自身暴擊率提升 5%，暴擊傷害提升 10%。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
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
  b_ma_passive: {
    id: "b_ma_passive",
    name: "滴血重生 (真)",
    description:
      "受到致命傷害時，立即回復 50% 生命值，並獲得 3 回合無敵。(每場戰鬥限 1 次)。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Body,
    effectType: "special",
    targetType: "self",
  },

  // --- Mage Cultivator (Mahayana) ---
  m_ma_active: {
    id: "m_ma_active",
    name: "掌心雷",
    description:
      "瞬發，對單體造成 600% 雷系傷害，並有 80% 機率麻痺目標 (無法行動) 1 回合。",
    type: "Active",
    cooldown: 4,
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Mage,
    damageMultiplier: 6.0,
    targetType: "single",
    effectType: "damage",
    statusEffect: {
      id: "paralyze",
      duration: 1,
      chance: 0.8,
    },
  },
  m_ma_passive: {
    id: "m_ma_passive",
    name: "言出法隨",
    description: "技能傷害提升 40%，且必定命中。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Mahayana,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
