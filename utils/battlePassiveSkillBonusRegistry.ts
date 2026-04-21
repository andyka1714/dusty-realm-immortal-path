import { ProfessionType, Skill } from "../types";
import { getFormalSkillId } from "../data/skills";
import {
  addPassiveSkillBonuses,
  createEmptyPassiveSkillBonuses,
  type PassiveSkillBonuses,
} from "./battlePassiveSkillBonuses";

const FORMAL_PASSIVE_SKILL_BONUS_MAP: Record<
  string,
  Partial<PassiveSkillBonuses>
> = {
  s_q_passive: {
    attackPercent: 6,
    critBonus: 2,
    critDamageBonus: 11,
  },
  s_g_passive: {
    attackPercent: 10,
    critBonus: 3,
    critDamageBonus: 17,
  },
  s_n_passive: {
    attackPercent: 12,
    critBonus: 3.4,
    critDamageBonus: 20,
  },
  s_sf_passive: {
    attackPercent: 14,
    critBonus: 4,
    critDamageBonus: 23,
  },
  s_tr_passive: {
    attackPercent: 20,
    critBonus: 5.8,
    critDamageBonus: 32,
  },
  s_bi_passive: {
    attackPercent: 22,
    critBonus: 6.2,
    critDamageBonus: 35,
  },
  s_vr_passive: {
    attackPercent: 24,
    critBonus: 6.8,
    critDamageBonus: 38,
  },
  s_ma_passive: {
    attackPercent: 26,
    critBonus: 7.4,
    critDamageBonus: 42,
  },
  s_im_passive: {
    attackPercent: 29,
    critBonus: 8.2,
    critDamageBonus: 46,
  },
  s_ie_passive: {
    attackPercent: 32,
    critBonus: 9,
    critDamageBonus: 50,
  },
  b_q_passive: {
    damageReductionBonus: 1,
  },
  b_f_passive: {
    hpPercent: 11,
    defensePercent: 8,
    damageReductionBonus: 1,
  },
  b_g_passive: {
    hpPercent: 14,
    defensePercent: 10,
    damageReductionBonus: 1,
  },
  b_n_passive: {
    hpPercent: 17,
    defensePercent: 12,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_sf_passive: {
    hpPercent: 20,
    defensePercent: 14,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_tr_passive: {
    hpPercent: 23,
    defensePercent: 16,
    damageReductionBonus: 1,
    regenHpBonus: 1,
  },
  b_bi_passive: {
    hpPercent: 26,
    defensePercent: 18,
    damageReductionBonus: 2,
    regenHpBonus: 1,
  },
  b_vr_passive: {
    hpPercent: 30,
    defensePercent: 20,
    damageReductionBonus: 2,
    regenHpBonus: 2,
  },
  b_ma_passive: {
    hpPercent: 34,
    defensePercent: 22,
    damageReductionBonus: 2,
    regenHpBonus: 2,
  },
  b_im_passive: {
    hpPercent: 38,
    defensePercent: 24,
    damageReductionBonus: 3,
    regenHpBonus: 2,
  },
  b_ie_passive: {
    hpPercent: 42,
    defensePercent: 26,
    damageReductionBonus: 3,
    regenHpBonus: 3,
  },
  m_q_passive: {
    magicPercent: 9,
    mpPercent: 10,
    resPercent: 6,
    critDamageBonus: 6,
  },
  m_f_passive: {
    magicPercent: 16,
    mpPercent: 18,
    resPercent: 10,
    critDamageBonus: 12,
  },
  m_g_passive: {
    magicPercent: 15,
    mpPercent: 18,
    resPercent: 10,
    critDamageBonus: 10,
  },
  m_n_passive: {
    magicPercent: 18,
    mpPercent: 22,
    resPercent: 12,
    critDamageBonus: 12,
  },
  m_sf_passive: {
    magicPercent: 21,
    mpPercent: 26,
    resPercent: 14,
    critDamageBonus: 14,
    dodgeBonus: 1,
  },
  m_tr_passive: {
    magicPercent: 24,
    mpPercent: 30,
    resPercent: 16,
    critDamageBonus: 16,
    dodgeBonus: 1,
  },
  m_bi_passive: {
    magicPercent: 27,
    mpPercent: 34,
    resPercent: 18,
    critDamageBonus: 18,
    dodgeBonus: 2,
  },
  m_vr_passive: {
    magicPercent: 30,
    mpPercent: 38,
    resPercent: 20,
    critDamageBonus: 20,
    dodgeBonus: 2,
  },
  m_ma_passive: {
    magicPercent: 33,
    mpPercent: 42,
    resPercent: 22,
    critDamageBonus: 22,
    dodgeBonus: 2,
  },
  m_im_passive: {
    magicPercent: 36,
    mpPercent: 46,
    resPercent: 24,
    critDamageBonus: 24,
    dodgeBonus: 3,
  },
  m_ie_passive: {
    magicPercent: 40,
    mpPercent: 50,
    resPercent: 26,
    critDamageBonus: 26,
    dodgeBonus: 3,
  },
};

export const getProfessionPassives = (profession: ProfessionType) => {
  switch (profession) {
    case ProfessionType.Sword:
      return {
        critBonus: 8,
        critDamageBonus: 45,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
    case ProfessionType.Body:
      return {
        critBonus: 0,
        critDamageBonus: 0,
        damageReductionBonus: 3,
        regenHpBonus: 0,
      };
    case ProfessionType.Mage:
      return {
        critBonus: 4,
        critDamageBonus: 20,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
    default:
      return {
        critBonus: 0,
        critDamageBonus: 0,
        damageReductionBonus: 0,
        regenHpBonus: 0,
      };
  }
};

export const getPassiveSkillBonuses = (
  learnedSkills: Skill[]
): PassiveSkillBonuses => {
  const bonuses = createEmptyPassiveSkillBonuses();

  learnedSkills
    .filter((skill) => skill.type === "Passive" && skill.profession)
    .forEach((skill) => {
      addPassiveSkillBonuses(
        bonuses,
        FORMAL_PASSIVE_SKILL_BONUS_MAP[getFormalSkillId(skill.id)] ?? {}
      );
    });

  return bonuses;
};
