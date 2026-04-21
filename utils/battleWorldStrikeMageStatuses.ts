import { ProfessionType } from "../types";
import { isManaSpringEmpowered } from "./battlePassives";
import type { PlayerWorldPassiveStatusOptions } from "./battleWorldStrikePlayerTypes";

export const getPlayerWorldMagePassiveStatusNames = (
  options: PlayerWorldPassiveStatusOptions
) => {
  const statusNames: string[] = [];
  const { passiveFlags, player, skill } = options;
  const isMageActionContext = !skill || skill.profession === ProfessionType.Mage;

  if (!skill && passiveFlags.hasMageQiPassive && player.profession === ProfessionType.Mage) {
    statusNames.push("靈潮循環");
  }
  if (!skill && passiveFlags.hasInitialShieldPassive) statusNames.push("元素護盾");
  if (!skill && passiveFlags.hasMageVoidPassive) statusNames.push("空間法則");
  if (isManaSpringEmpowered(player.mp, player.maxMp, passiveFlags)) {
    statusNames.push("法力源泉");
  }
  if (isMageActionContext && passiveFlags.hasMageFoundationPassive) {
    statusNames.push("靈力湧動");
  }
  if (isMageActionContext && passiveFlags.hasMageSpiritSeveringPassive) {
    statusNames.push("道法自然");
  }
  if (isMageActionContext && passiveFlags.hasMageFusionPassive) {
    statusNames.push("五氣朝元");
  }
  if (isMageActionContext && passiveFlags.hasMageMahayanaPassive) {
    statusNames.push("言出法隨");
  }
  if (isMageActionContext && passiveFlags.hasMageTribulationPassive) {
    statusNames.push("雷劫煉心");
  }
  if (isMageActionContext && passiveFlags.hasMageImmortalPassive) {
    statusNames.push("仙法通神");
  }
  if (isMageActionContext && passiveFlags.hasMageEmperorPassive) {
    statusNames.push("萬法歸宗");
  }

  return statusNames;
};
