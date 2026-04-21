import type {
  CombatLoopFeatureFlags,
  CombatRuntimeContext,
} from "./battleEncounter";
import type { CombatLoopState } from "./battleTimeline";
import type { CombatStatusLike } from "./battleStatusTypes";

export type PreparedAutoBattleExecution = {
  state: CombatLoopState<CombatStatusLike>;
  runtimeContext: CombatRuntimeContext;
  featureFlags: CombatLoopFeatureFlags;
  processStatusTicks: (currentMs: number) => void;
};
