import {
  type BuildEnemyWorldStrikeStatusNamesOptions,
  type EnemyWorldPassiveStatusOptions,
} from "./battleWorldStrikeEnemyTypes";
import { getEnemyWorldDefensivePassiveStatusNames } from "./battleWorldStrikeEnemyDefensiveStatuses";
import { getEnemyWorldIncomingStatusNames } from "./battleWorldStrikeEnemyIncomingStatuses";
import { getEnemyWorldSurvivalPassiveStatusNames } from "./battleWorldStrikeEnemySurvivalStatuses";

const getEnemyWorldPassiveStatusNames = (
  options: EnemyWorldPassiveStatusOptions
) => [
  ...getEnemyWorldDefensivePassiveStatusNames(options),
  ...getEnemyWorldSurvivalPassiveStatusNames(options),
];

export const buildEnemyWorldStrikeStatusNames = ({
  incomingStatuses,
  passiveFlags,
  preBodySaintDamage,
  playerMaxHp,
  enemyElement,
  voidEvasion,
  bodyFoundationStacks,
  copperSkinTriggered,
  bodyFusionTriggered,
  elementalBarrierTriggered,
  reflectTriggered,
  bodyTribulationTriggered,
  mageTribulationTriggered,
  bodyRebirthTrueTriggered,
  bodyEmperorTriggered,
  swordDeathWardTriggered,
}: BuildEnemyWorldStrikeStatusNamesOptions) => [
  ...incomingStatuses.normalizedIncomingStatuses.map((status) => status.name),
  ...getEnemyWorldPassiveStatusNames({
    passiveFlags,
    prePassiveDamage: preBodySaintDamage,
    playerMaxHp,
    voidEvasion,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
    enemyElement,
    bodyTribulationTriggered,
    mageTribulationTriggered,
    mageTribulationControlTriggered:
      incomingStatuses.mageTribulationControlTriggered,
    swordFusionControlTriggered: incomingStatuses.swordFusionControlTriggered,
    bodyRebirthTrueTriggered,
    swordDeathWardTriggered,
    bodyEmperorTriggered,
  }),
  ...getEnemyWorldIncomingStatusNames({
    bodyImmortalTriggered: incomingStatuses.bodyImmortalTriggered,
    swordEmperorTriggered: incomingStatuses.swordEmperorTriggered,
    controlImmuneTriggered: incomingStatuses.controlImmuneTriggered,
  }),
];
