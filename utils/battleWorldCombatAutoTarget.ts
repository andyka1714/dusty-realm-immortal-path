export interface WorldCombatAutoTargetContext<TTarget> {
  isAutoBattling: boolean;
  isBattling: boolean;
  hasTargetMonster: boolean;
  showIntro: boolean;
  targets: TTarget[];
  getId: (target: TTarget) => string;
  getDistance: (target: TTarget) => number;
}

export const selectNearestWorldCombatTarget = <TTarget,>({
  targets,
  getId,
  getDistance,
}: {
  targets: TTarget[];
  getId: (target: TTarget) => string;
  getDistance: (target: TTarget) => number;
}) => {
  let nearestId: string | null = null;
  let minDistance = Infinity;

  targets.forEach((target) => {
    const distance = getDistance(target);
    if (distance < minDistance) {
      minDistance = distance;
      nearestId = getId(target);
    }
  });

  return nearestId;
};

export const resolveWorldCombatAutoTarget = <TTarget,>({
  isAutoBattling,
  isBattling,
  hasTargetMonster,
  showIntro,
  targets,
  getId,
  getDistance,
}: WorldCombatAutoTargetContext<TTarget>) => {
  if (
    !isAutoBattling ||
    isBattling ||
    hasTargetMonster ||
    showIntro ||
    targets.length === 0
  ) {
    return null;
  }

  return selectNearestWorldCombatTarget({
    targets,
    getId,
    getDistance,
  });
};
