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
};
