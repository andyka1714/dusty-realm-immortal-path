import type { EnemyWorldIncomingStatusOptions } from "./battleWorldStrikeEnemyTypes";

export const getEnemyWorldIncomingStatusNames = ({
  bodyImmortalTriggered,
  swordEmperorTriggered,
  controlImmuneTriggered,
}: EnemyWorldIncomingStatusOptions) => {
  const statusNames: string[] = [];
  if (bodyImmortalTriggered) statusNames.push("仙體無垢");
  if (swordEmperorTriggered) statusNames.push("萬法皆空");
  if (controlImmuneTriggered) statusNames.push("獸神附體");
  return statusNames;
};
