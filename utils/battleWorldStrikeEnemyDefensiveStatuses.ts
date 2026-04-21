import type { EnemyWorldPassiveStatusOptions } from "./battleWorldStrikeEnemyTypes";

export const getEnemyWorldDefensivePassiveStatusNames = (
  options: EnemyWorldPassiveStatusOptions
) => {
  const statusNames: string[] = [];
  const {
    prePassiveDamage,
    bodyFoundationStacks,
    copperSkinTriggered,
    bodyFusionTriggered,
    elementalBarrierTriggered,
    reflectTriggered,
  } = options;

  if (reflectTriggered) statusNames.push("反震");
  if (bodyFoundationStacks > 0) statusNames.push("蠻荒血脈");
  if (copperSkinTriggered) statusNames.push("銅皮鐵骨");
  if (bodyFusionTriggered) statusNames.push("金剛法相");
  if (options.passiveFlags.hasBodySaintPassive && prePassiveDamage > 0) {
    statusNames.push("肉身成聖");
  }
  if (elementalBarrierTriggered) statusNames.push("元素護盾");

  return statusNames;
};
