export interface WorldCombatActionWindow {
  engagedTargetId: string | null;
  shouldPlayerAct: boolean;
  usePlayerSkill: boolean;
  shouldEnemyAct: boolean;
}

export const resolveWorldCombatActionWindow = ({
  now,
  distance,
  playerEngagementRange,
  playerActionReadyAt,
  playerSkillReadyAt,
  hasPrimaryActiveSkill,
  isAutoBattling,
  worldCombatTargetId,
  targetedMonsterInstanceId,
  enemyEngagementRange,
  enemyActionReadyAt,
}: {
  now: number;
  distance: number;
  playerEngagementRange: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  hasPrimaryActiveSkill: boolean;
  isAutoBattling: boolean;
  worldCombatTargetId: string | null;
  targetedMonsterInstanceId: string;
  enemyEngagementRange: number;
  enemyActionReadyAt: number;
}): WorldCombatActionWindow => {
  const engagedTargetId =
    worldCombatTargetId ?? (isAutoBattling ? targetedMonsterInstanceId : null);
  const isEngagedWithTarget = engagedTargetId === targetedMonsterInstanceId;
  const shouldPlayerAct =
    isEngagedWithTarget &&
    distance <= playerEngagementRange &&
    now >= playerActionReadyAt;
  const usePlayerSkill = hasPrimaryActiveSkill && now >= playerSkillReadyAt;
  const shouldEnemyAct =
    engagedTargetId === targetedMonsterInstanceId &&
    distance <= enemyEngagementRange &&
    now >= enemyActionReadyAt;

  return {
    engagedTargetId,
    shouldPlayerAct,
    usePlayerSkill,
    shouldEnemyAct,
  };
};

export const runWorldCombatActionWindowStep = ({
  actionWindow,
  runPlayerAction,
  runEnemyAction,
}: {
  actionWindow: WorldCombatActionWindow;
  runPlayerAction: (usePlayerSkill: boolean) => void;
  runEnemyAction: () => void;
}) => {
  if (actionWindow.shouldPlayerAct) {
    runPlayerAction(actionWindow.usePlayerSkill);
  }

  if (actionWindow.shouldEnemyAct) {
    runEnemyAction();
  }

  return actionWindow;
};

export const runWorldCombatStep = ({
  now = Date.now(),
  distance,
  playerEngagementRange,
  playerActionReadyAt,
  playerSkillReadyAt,
  hasPrimaryActiveSkill,
  isAutoBattling,
  worldCombatTargetId,
  targetedMonsterInstanceId,
  enemyEngagementRange,
  enemyActionReadyAt,
  runPlayerAction,
  runEnemyAction,
}: {
  now?: number;
  distance: number;
  playerEngagementRange: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  hasPrimaryActiveSkill: boolean;
  isAutoBattling: boolean;
  worldCombatTargetId: string | null;
  targetedMonsterInstanceId: string;
  enemyEngagementRange: number;
  enemyActionReadyAt: number;
  runPlayerAction: (usePlayerSkill: boolean) => void;
  runEnemyAction: () => void;
}) => {
  const actionWindow = resolveWorldCombatActionWindow({
    now,
    distance,
    playerEngagementRange,
    playerActionReadyAt,
    playerSkillReadyAt,
    hasPrimaryActiveSkill,
    isAutoBattling,
    worldCombatTargetId,
    targetedMonsterInstanceId,
    enemyEngagementRange,
    enemyActionReadyAt,
  });

  runWorldCombatActionWindowStep({
    actionWindow,
    runPlayerAction,
    runEnemyAction,
  });

  return actionWindow;
};
