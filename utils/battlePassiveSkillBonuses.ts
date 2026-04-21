export interface PassiveSkillBonuses {
  hpPercent: number;
  mpPercent: number;
  attackPercent: number;
  magicPercent: number;
  defensePercent: number;
  resPercent: number;
  critBonus: number;
  critDamageBonus: number;
  dodgeBonus: number;
  damageReductionBonus: number;
  regenHpBonus: number;
}

export const createEmptyPassiveSkillBonuses = (): PassiveSkillBonuses => ({
  hpPercent: 0,
  mpPercent: 0,
  attackPercent: 0,
  magicPercent: 0,
  defensePercent: 0,
  resPercent: 0,
  critBonus: 0,
  critDamageBonus: 0,
  dodgeBonus: 0,
  damageReductionBonus: 0,
  regenHpBonus: 0,
});

export const addPassiveSkillBonuses = (
  target: PassiveSkillBonuses,
  source: Partial<PassiveSkillBonuses>
) => {
  target.hpPercent += source.hpPercent ?? 0;
  target.mpPercent += source.mpPercent ?? 0;
  target.attackPercent += source.attackPercent ?? 0;
  target.magicPercent += source.magicPercent ?? 0;
  target.defensePercent += source.defensePercent ?? 0;
  target.resPercent += source.resPercent ?? 0;
  target.critBonus += source.critBonus ?? 0;
  target.critDamageBonus += source.critDamageBonus ?? 0;
  target.dodgeBonus += source.dodgeBonus ?? 0;
  target.damageReductionBonus += source.damageReductionBonus ?? 0;
  target.regenHpBonus += source.regenHpBonus ?? 0;
};
