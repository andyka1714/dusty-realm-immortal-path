import { Skill, MajorRealm, ProfessionType } from "../../types";

export const IMMORTAL_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Immortal) ---
  s_im_active: {
    id: "s_im_active",
    name: "誅仙劍陣",
    description:
      "展開誅仙劍陣領域，持續 5 回合。領域內敵方全體每回合受到 300% 攻擊傷害且防禦降低 30%。",
    type: "Active",
    cooldown: 15,
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Sword,
    targetType: "all",
    effectType: "special", // Field effect
    statusEffect: {
      id: "zhuxian_domain",
      duration: 5,
      chance: 1.0,
      value: 0.3,
    },
  },
  s_im_passive: {
    id: "s_im_passive",
    name: "仙元護體",
    description: "每 5 回合獲得一層無敵護盾，可抵擋一次任意傷害。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  },

  // --- Body Cultivator (Immortal) ---
  b_im_active: {
    id: "b_im_active",
    name: "祖巫降臨",
    description:
      "召喚祖巫虛影，對全體造成 800% 傷害，並將傷害量的 50% 轉化為自身與隊友的生命治療。",
    type: "Active",
    cooldown: 10,
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Body,
    damageMultiplier: 8.0,
    targetType: "all",
    effectType: "damage",
    // Lifesteal logic
  },
  b_im_passive: {
    id: "b_im_passive",
    name: "仙體無垢",
    description: "免疫中毒、流血、燃燒等持續傷害效果。生命回復效果提升 50%。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  },

  // --- Mage Cultivator (Immortal) ---
  m_im_active: {
    id: "m_im_active",
    name: "撒豆成兵",
    description: "召喚 3 個金甲天兵助戰，繼承自身 100% 屬性，持續 5 回合。",
    type: "Active",
    cooldown: 12,
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Mage,
    targetType: "self",
    effectType: "summon",
  },
  m_im_passive: {
    id: "m_im_passive",
    name: "仙法通神",
    description: "所有技能有機率 (30%) 連續施放兩次，第二次不消耗靈力與冷卻。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Immortal,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
