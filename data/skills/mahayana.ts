import { Skill, MajorRealm, ProfessionType } from "../../types";

export const MAHAYANA_SKILLS: Record<string, Skill> = {
  // --- Sword Cultivator (Mahayana) ---
  s_ma_active: {
    id: "s_ma_active",
    name: "絕仙劍",
    description:
      "對全體造成 500% 劍傷，並施加【絕仙封脈】3 回合；後續劍陣會再追斬兩次。",
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
      "對全體造成重擊並附加【暈眩】1 回合；同時獲得【法天象地】護體並回復氣血。",
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
