import type { WorldCombatEncounterState, WorldPlayerDefeatOutcome, WorldPlayerDefeatPlan, WorldPlayerDefeatStatePlan } from "./battleLifecycleTypes";

export const getBattleRespawnMapId = (completedQuestIds: string[]) =>
  completedQuestIds.includes("sect_sword_join")
    ? "4"
    : completedQuestIds.includes("sect_beast_join")
      ? "14"
      : completedQuestIds.includes("sect_mystic_join")
        ? "23"
        : "0";

export const createClearWorldCombatEncounterState = ({
  worldPlayerShield,
  playerActionReadyAt,
  playerSkillReadyAt,
}: {
  worldPlayerShield: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
}): WorldCombatEncounterState => ({
  worldCombatTargetId: null,
  worldCombatTargetStatuses: [],
  worldCombatPlayerStatuses: [],
  worldLastCombatMessage: null,
  worldPlayerShield,
  playerActionReadyAt,
  playerSkillReadyAt,
  enemyActionReadyAtById: {},
  enemySpecialReadyAtById: {},
});

export const createResetWorldCombatEncounterState =
  (): WorldCombatEncounterState => ({
    ...createClearWorldCombatEncounterState({
      worldPlayerShield: 0,
      playerActionReadyAt: 0,
      playerSkillReadyAt: 0,
    }),
  });

export const resolveWorldPlayerDefeatOutcome = ({
  completedQuestIds,
}: {
  completedQuestIds: string[];
}): WorldPlayerDefeatOutcome => ({
  respawnMapId: getBattleRespawnMapId(completedQuestIds),
  startX: 20,
  startY: 20,
  logMessage: "你在野外遭受重創，被傳送回安全地帶調息。",
});

export const resolveWorldPlayerDefeatPlan = ({
  completedQuestIds,
  playerMaxHp,
}: {
  completedQuestIds: string[];
  playerMaxHp: number;
}): WorldPlayerDefeatPlan => ({
  defeatOutcome: resolveWorldPlayerDefeatOutcome({
    completedQuestIds,
  }),
  nextWorldPlayerHp: playerMaxHp,
  shouldClearTargetMonster: true,
  shouldClearAutoMovePath: true,
  shouldStopAutoBattle: true,
  encounterState: createResetWorldCombatEncounterState(),
});

export const createWorldPlayerDefeatStatePlan = ({
  defeatPlan,
}: {
  defeatPlan: WorldPlayerDefeatPlan;
}): WorldPlayerDefeatStatePlan => ({
  logEntry: {
    message: defeatPlan.defeatOutcome.logMessage,
    type: "danger",
  },
  respawnMapId: defeatPlan.defeatOutcome.respawnMapId,
  startX: defeatPlan.defeatOutcome.startX,
  startY: defeatPlan.defeatOutcome.startY,
  shouldClearTargetMonster: defeatPlan.shouldClearTargetMonster,
  shouldClearAutoMovePath: defeatPlan.shouldClearAutoMovePath,
  shouldStopAutoBattle: defeatPlan.shouldStopAutoBattle,
  nextWorldPlayerHp: defeatPlan.nextWorldPlayerHp,
  encounterState: defeatPlan.encounterState,
  shouldClearWorldCombatTimers: true,
});
