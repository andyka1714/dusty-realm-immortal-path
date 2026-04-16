import { getFormalSkillId } from "../data/skills";
import { Skill } from "../types";

export const hasPassiveSkillId = (learnedSkills: Skill[], skillId: string) =>
  learnedSkills.some(
    (skill) =>
      skill.type === "Passive" &&
      getFormalSkillId(skill.id) === getFormalSkillId(skillId)
  );

export const hasExactPassiveSkillId = (
  learnedSkills: Skill[],
  skillIds: string | string[]
) => {
  const acceptedIds = new Set(Array.isArray(skillIds) ? skillIds : [skillIds]);
  return learnedSkills.some(
    (skill) => skill.type === "Passive" && acceptedIds.has(skill.id)
  );
};

export const hasLearnedSkillId = (learnedSkills: Skill[], skillId: string) =>
  learnedSkills.some(
    (skill) => getFormalSkillId(skill.id) === getFormalSkillId(skillId)
  );

export type PlayerPassiveFlags = {
  hasSwordQiPassive: boolean;
  hasBodyQiPassive: boolean;
  hasMageQiPassive: boolean;
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasBodyFoundationPassive: boolean;
  hasMageFoundationPassive: boolean;
  hasSwordGoldenPassive: boolean;
  hasSwordEchoPassive: boolean;
  hasSwordHeartPassive: boolean;
  hasBodySaintPassive: boolean;
  hasMageSpiritSeveringPassive: boolean;
  hasSwordFusionPassive: boolean;
  hasSwordVoidPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyAncientPassive: boolean;
  hasMageVoidPassive: boolean;
  hasSwordTribulationPassive: boolean;
  hasBodyTribulationPassive: boolean;
  hasMageTribulationPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyRebirthTruePassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageMahayanaPassive: boolean;
  hasMageImmortalPassive: boolean;
  hasSwordImmortalPassive: boolean;
  hasBodyEmperorPassive: boolean;
  hasSwordEmperorPassive: boolean;
  hasMageEmperorPassive: boolean;
};

const PLAYER_PASSIVE_FLAG_SKILL_IDS: Record<
  keyof PlayerPassiveFlags,
  string | string[]
> = {
  hasSwordQiPassive: "s_q_passive",
  hasBodyQiPassive: "b_q_passive",
  hasMageQiPassive: "m_q_passive",
  hasReflectPassive: "b_g_passive",
  hasInitialShieldPassive: "m_g_passive",
  hasSwordDeathWardPassive: "s_n_passive",
  hasBodyRebirthPassive: "b_n_passive",
  hasManaSpringPassive: "m_n_passive",
  hasBodyFoundationPassive: "b_f_passive",
  hasMageFoundationPassive: "m_f_passive",
  hasSwordGoldenPassive: "s_g_passive",
  hasSwordEchoPassive: "s_sf_passive",
  hasSwordHeartPassive: ["s_f_passive", "s_g_passive"],
  hasBodySaintPassive: "b_sf_passive",
  hasMageSpiritSeveringPassive: "m_sf_passive",
  hasSwordFusionPassive: ["s_bi_passive", "s_tr_passive"],
  hasSwordVoidPassive: ["s_vr_passive", "s_tr_passive"],
  hasBodyFusionPassive: "b_bi_passive",
  hasMageFusionPassive: "m_bi_passive",
  hasBodyAncientPassive: "b_vr_passive",
  hasMageVoidPassive: "m_vr_passive",
  hasSwordTribulationPassive: "s_tr_passive",
  hasBodyTribulationPassive: "b_tr_passive",
  hasMageTribulationPassive: "m_tr_passive",
  hasBodyImmortalPassive: "b_im_passive",
  hasBodyRebirthTruePassive: "b_ma_passive",
  hasSwordMahayanaPassive: "s_ma_passive",
  hasMageMahayanaPassive: "m_ma_passive",
  hasMageImmortalPassive: "m_im_passive",
  hasSwordImmortalPassive: "s_im_passive",
  hasBodyEmperorPassive: "b_ie_passive",
  hasSwordEmperorPassive: ["s_ie_passive", "s_tr_passive"],
  hasMageEmperorPassive: ["m_ie_passive", "m_sf_passive"],
};

export const getPlayerPassiveFlags = (
  learnedSkills: Skill[]
): PlayerPassiveFlags =>
  Object.fromEntries(
    Object.entries(PLAYER_PASSIVE_FLAG_SKILL_IDS).map(([flagName, skillId]) => [
      flagName,
      hasExactPassiveSkillId(learnedSkills, skillId),
    ])
  ) as PlayerPassiveFlags;

export const getCanonicalSkillId = (skill?: Skill) =>
  skill ? getFormalSkillId(skill.id) : undefined;

export const getBodyFoundationBloodlineStacks = (
  currentHp: number,
  maxHp: number
) => {
  if (maxHp <= 0) return 0;
  const missingRatio = Math.max(0, 1 - currentHp / maxHp);
  return Math.max(0, Math.min(9, Math.floor(missingRatio / 0.1)));
};

export const getSwordQiPassiveCritBonus = () => 3;

export const getCopperSkinReductionMultiplier = () => 0.97;

export const getMageQiCycleRecovery = (maxMp: number) =>
  Math.max(1, Math.floor(maxMp * 0.12));

export const isManaSpringEmpowered = (
  currentMp: number,
  maxMp: number,
  passiveFlags: Pick<PlayerPassiveFlags, "hasManaSpringPassive">
) => passiveFlags.hasManaSpringPassive && currentMp >= maxMp * 0.8;

export const hasSwordTribulationWindow = (
  currentHp: number,
  maxHp: number,
  passiveFlags: Pick<PlayerPassiveFlags, "hasSwordTribulationPassive">
) => passiveFlags.hasSwordTribulationPassive && currentHp <= maxHp * 0.2;
