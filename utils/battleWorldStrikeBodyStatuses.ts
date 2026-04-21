import type { PlayerWorldPassiveStatusOptions } from "./battleWorldStrikePlayerTypes";

export const getPlayerWorldBodyPassiveStatusNames = (
  options: PlayerWorldPassiveStatusOptions
) => {
  const statusNames: string[] = [];
  const { passiveFlags, skill, bodyFoundationStacks } = options;

  if (bodyFoundationStacks > 0) statusNames.push("蠻荒血脈");
  if (!skill && passiveFlags.hasBodyAncientPassive) statusNames.push("荒古戰體");
  if (!skill && passiveFlags.hasBodyQiPassive) statusNames.push("銅皮鐵骨");
  if (!skill && passiveFlags.hasBodyFusionPassive) statusNames.push("金剛法相");
  if (!skill && passiveFlags.hasReflectPassive) statusNames.push("荊棘皮層");
  if (!skill && passiveFlags.hasBodySaintPassive) statusNames.push("肉身成聖");
  if (!skill && passiveFlags.hasBodyRebirthPassive) statusNames.push("滴血重生");
  if (!skill && passiveFlags.hasBodyRebirthTruePassive) {
    statusNames.push("滴血重生（真）");
  }
  if (!skill && passiveFlags.hasBodyTribulationPassive) statusNames.push("萬劫不滅");
  if (!skill && passiveFlags.hasBodyImmortalPassive) statusNames.push("仙體無垢");
  if (!skill && passiveFlags.hasBodyEmperorPassive) statusNames.push("不死不滅");

  return statusNames;
};
