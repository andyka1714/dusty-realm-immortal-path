import { Skill, MajorRealm, ProfessionType } from "../../types";

export const TRIBULATION_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Tribulation) ---
  s_tr_active: {
    id: "s_tr_active",
    name: "破劫一擊",
    description: "對單體造成 1000% 真實傷害。若擊殺目標，重置此技能冷卻。",
    type: "Active",
    cooldown: 10,
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Sword,
    damageMultiplier: 10.0,
    targetType: "single",
    effectType: "damage",
  },
  s_tr_passive: {
    id: "s_tr_passive",
    name: "向死而生",
    description: "生命值低於 20% 時，必定暴擊，且傷害提升 50%。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Sword,
    effectType: "buff",
    targetType: "self",
  },

  // --- Body Cultivator (Tribulation) ---
  b_tr_active: {
    id: "b_tr_active",
    name: "硬抗天劫",
    description:
      "嘲諷全體敵人，並將自身受到的 50% 傷害反彈給來源，持續 3 回合。",
    type: "Active",
    cooldown: 6,
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Body,
    targetType: "all",
    effectType: "special",
    statusEffect: {
      id: "reflect_taunt",
      duration: 3,
      chance: 1.0,
      value: 0.5,
    },
  },
  b_tr_passive: {
    id: "b_tr_passive",
    name: "萬劫不滅",
    description:
      "每承受一次傷害，防禦力提升 2%，最多疊加 50 層，持續至戰鬥結束。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Body,
    effectType: "buff",
    targetType: "self",
  },

  // --- Mage Cultivator (Tribulation) ---
  m_tr_active: {
    id: "m_tr_active",
    name: "九霄神雷",
    description:
      "召喚最強雷劫，對敵方全體造成 800% 傷害。對「麻痺」單位造成 1.5 倍傷害。",
    type: "Active",
    cooldown: 8,
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Mage,
    damageMultiplier: 8.0,
    targetType: "all",
    effectType: "damage",
  },
  m_tr_passive: {
    id: "m_tr_passive",
    name: "雷劫煉心",
    description: "免疫所有控制效果。受到雷屬性傷害時回復生命值。",
    type: "Passive",
    cooldown: 0,
    minRealm: MajorRealm.Tribulation,
    profession: ProfessionType.Mage,
    effectType: "buff",
    targetType: "self",
  },
};
