import { ProfessionType } from "../types";
import type { PlayerWorldPassiveStatusOptions } from "./battleWorldStrikePlayerTypes";

export const getPlayerWorldSwordPassiveStatusNames = (
  options: PlayerWorldPassiveStatusOptions
) => {
  const statusNames: string[] = [];
  const {
    passiveFlags,
    skill,
    isCrit,
    dealsDirectDamage,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    voidSwordProc,
  } = options;

  if (passiveFlags.hasSwordMahayanaPassive && isCrit) {
    statusNames.push("劍道獨尊");
  }
  if (!skill && passiveFlags.hasSwordImmortalPassive) statusNames.push("仙元護體");
  if (!skill && passiveFlags.hasSwordHeartPassive) statusNames.push("養劍術");
  if (!skill && passiveFlags.hasSwordDeathWardPassive) statusNames.push("護體劍罡");
  if (!skill && passiveFlags.hasSwordFusionPassive) statusNames.push("人劍合神");
  if (
    passiveFlags.hasSwordGoldenPassive &&
    isCrit &&
    dealsDirectDamage &&
    skill?.profession === ProfessionType.Sword
  ) {
    statusNames.push("劍心通明");
  }
  if (swordTribulationActive) statusNames.push("向死而生");
  if (canonicalSkillId === "s_tr_active" && hasSwordQiChain) {
    statusNames.push("萬劍歸一");
  }
  if (!skill && passiveFlags.hasSwordEmperorPassive && dealsDirectDamage) {
    statusNames.push("萬法皆空");
  }
  if (!skill && passiveFlags.hasSwordEchoPassive && dealsDirectDamage) {
    statusNames.push("劍意化形");
  }
  if (
    passiveFlags.hasSwordQiPassive &&
    isCrit &&
    dealsDirectDamage &&
    skill?.profession === ProfessionType.Sword
  ) {
    statusNames.push("劍脈初成");
  }
  if (voidSwordProc) statusNames.push("法則之劍");

  return statusNames;
};
