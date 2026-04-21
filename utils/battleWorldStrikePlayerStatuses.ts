import { ProfessionType } from "../types";
import {
  type BuildPlayerWorldStrikeStatusNamesOptions,
  type PlayerWorldPassiveStatusOptions,
} from "./battleWorldStrikePlayerTypes";
import { getPlayerWorldBodyPassiveStatusNames } from "./battleWorldStrikeBodyStatuses";
import { getPlayerWorldMagePassiveStatusNames } from "./battleWorldStrikeMageStatuses";
import { getPlayerWorldSwordPassiveStatusNames } from "./battleWorldStrikeSwordStatuses";

const getPlayerWorldPassiveStatusNames = (
  options: PlayerWorldPassiveStatusOptions
) => {
  const { passiveFlags, skill } = options;
  const statusNames = [
    ...getPlayerWorldSwordPassiveStatusNames(options),
    ...getPlayerWorldBodyPassiveStatusNames(options),
    ...getPlayerWorldMagePassiveStatusNames(options),
  ];

  if (skill?.profession === ProfessionType.Mage && passiveFlags.hasMageMahayanaPassive) {
    statusNames.unshift("言出法隨");
  }

  return statusNames;
};

export const buildPlayerWorldStrikeStatusNames = ({
  playerSideStatuses,
  ...passiveStatusOptions
}: BuildPlayerWorldStrikeStatusNamesOptions) =>
  Array.from(
    new Set([
      ...playerSideStatuses.map((status) => status.name),
      ...getPlayerWorldPassiveStatusNames(passiveStatusOptions),
    ])
  );
