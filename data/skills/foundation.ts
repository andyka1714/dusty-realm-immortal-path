import { Skill, MajorRealm, ProfessionType } from "../../types";

export const FOUNDATION_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Foundation) ---
  s_f_active: {
    id: "s_f_active",
    name: "流光劍影",
    description:
      "對單體敵人造成 200% 攻擊傷害，並附加一層【劍氣】(提升 5% 暴擊率，可疊加)。",
    type: "Active",
    cooldown: 3,
    minRealm: MajorRealm.Foundation,
    profession: ProfessionType.Sword,
    damageMultiplier: 3.2,
    targetType: "single",
    effectType: "damage",
    cooldownSeconds: 3.0,
    castRange: 2,
    castTimeMs: 220,
    areaShape: "single",
    maxTargets: 1,
    statusEffect: {
      id: "sword_qi",
      duration: 99, // Until used
      chance: 1.0,
      value: 1, // 1 stack
    },
  },
  // --- Body Cultivator (Foundation) ---
  b_f_active: {
    id: "b_f_active",
    name: "蠻王衝撞",
    description:
      "對單體造成 (150% 攻擊 + 30% 當前防禦) 傷害，並暈眩目標 1 回合。",
    type: "Active",
    cooldown: 4,
    minRealm: MajorRealm.Foundation,
    profession: ProfessionType.Body,
    damageMultiplier: 1.5,
    // Note: Defense scaling logic needs special handling in battle engine
    targetType: "single",
    effectType: "damage",
    cooldownSeconds: 3.8,
    castRange: 1,
    castTimeMs: 360,
    areaShape: "cone",
    areaRadius: 1,
    maxTargets: 3,
    statusEffect: {
      id: "stun",
      duration: 1,
      chance: 1.0,
    },
  },
  b_f_passive: {
    id: "b_f_passive",
    name: "蠻荒血脈",
    description: "生命值每降低 10%，防禦力提升 5%，攻擊力提升 2%。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Foundation,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  },

  // --- Mage Cultivator (Foundation) ---
  m_f_active: {
    id: "m_f_active",
    name: "五行連彈",
    description: "對隨機敵人造成 3 次 80% 法術傷害，每次屬性隨機。",
    type: "Active",
    cooldown: 3,
    minRealm: MajorRealm.Foundation,
    profession: ProfessionType.Mage,
    damageMultiplier: 3.0,
    targetType: "single", // Actually random x 3, but defined as single target logic repeatedly?
    // Simplified as single for now, need "multi-hit" logic
    effectType: "damage",
    cooldownSeconds: 3.2,
    castRange: 6,
    castTimeMs: 480,
    projectileSpeed: 12,
    areaShape: "single",
    areaRadius: 0,
    maxTargets: 1,
  },
  m_f_passive: {
    id: "m_f_passive",
    name: "靈力湧動",
    description: "每釋放一次技能，下一次技能傷害提升 10% (可疊加 3 層)。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Foundation,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
    passiveEffectTags: ["shield", "spellpower", "mana_flow"],
  },
};
