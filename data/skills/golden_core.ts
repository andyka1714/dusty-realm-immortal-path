import { Skill, MajorRealm, ProfessionType } from "../../types";

export const GOLDEN_CORE_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Golden Core) ---
  s_g_active: {
    id: "s_g_active",
    name: "萬劍歸宗",
    description:
      "消耗所有【劍氣】，對全體敵人造成 (150% + 劍氣層數x20%) 攻擊傷害。",
    type: "Active",
    cooldown: 5,
    minRealm: MajorRealm.GoldenCore,
    profession: ProfessionType.Sword,
    damageMultiplier: 1.5,
    targetType: "all",
    effectType: "damage",
    // Special logic for consuming potential stacks handled in engine
  },
  s_g_passive: {
    id: "s_g_passive",
    name: "劍心通明",
    description: "暴擊時有 30% 機率立即重置「流光劍影」冷卻時間。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.GoldenCore,
    profession: ProfessionType.Sword,
    // Special cooldown reset logic
  },

  // --- Body Cultivator (Golden Core) ---
  b_g_active: {
    id: "b_g_active",
    name: "不滅戰吼",
    description:
      "嘲諷全體敵人，並獲得相當於最大生命值 20% 的護盾，持續 2 回合。",
    type: "Active",
    cooldown: 5,
    minRealm: MajorRealm.GoldenCore,
    profession: ProfessionType.Body,
    targetType: "all", // Taunt all
    effectType: "special",
    statusEffect: {
      id: "taunt",
      duration: 2,
      chance: 1.0,
    },
    // Shield logic separate
  },
  b_g_passive: {
    id: "b_g_passive",
    name: "荊棘皮層",
    description: "受到近戰攻擊時，反彈 15% 原始傷害給攻擊者。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.GoldenCore,
    profession: ProfessionType.Body,
    effectType: "special",
  },

  // --- Mage Cultivator (Golden Core) ---
  m_g_active: {
    id: "m_g_active",
    name: "冰封千里",
    description:
      "對全體造成 180% 水系傷害，並有 40% 機率「凍結」(無法行動) 1 回合。",
    type: "Active",
    cooldown: 5,
    minRealm: MajorRealm.GoldenCore,
    profession: ProfessionType.Mage,
    damageMultiplier: 1.8,
    targetType: "all",
    effectType: "damage",
    statusEffect: {
      id: "freeze",
      duration: 1,
      chance: 0.4,
    },
  },
  m_g_passive: {
    id: "m_g_passive",
    name: "元素護盾",
    description: "戰鬥開始時獲得一層能夠抵擋 1 次技能傷害的護盾。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.GoldenCore,
    profession: ProfessionType.Mage,
    effectType: "buff", // Initial buff
    targetType: "self",
  },
};
