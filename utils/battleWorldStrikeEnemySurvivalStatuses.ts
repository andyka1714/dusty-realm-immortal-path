import { ElementType } from "../types";
import type { EnemyWorldPassiveStatusOptions } from "./battleWorldStrikeEnemyTypes";

export const getEnemyWorldSurvivalPassiveStatusNames = (
  options: EnemyWorldPassiveStatusOptions
) => {
  const statusNames: string[] = [];
  const {
    voidEvasion,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    mageTribulationControlTriggered,
    swordFusionControlTriggered,
    bodyRebirthTrueTriggered,
    swordDeathWardTriggered,
    bodyEmperorTriggered,
    enemyElement,
  } = options;

  if (swordDeathWardTriggered) statusNames.push("護體劍罡");
  if (bodyTribulationTriggered) statusNames.push("萬劫不滅");
  if (mageTribulationTriggered && enemyElement === ElementType.Metal) {
    statusNames.push("雷劫煉心");
  }
  if (mageTribulationControlTriggered) statusNames.push("雷劫煉心");
  if (swordFusionControlTriggered) statusNames.push("人劍合神");
  if (bodyRebirthTrueTriggered) statusNames.push("滴血重生");
  if (bodyEmperorTriggered) statusNames.push("不死不滅");
  if (voidEvasion) statusNames.push("空間法則");

  return statusNames;
};
