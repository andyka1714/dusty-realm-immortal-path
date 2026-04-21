import type { CombatStatusLike } from "./battleStatusTypes";

export const hasIncapacitatingStatus = (
  statuses: CombatStatusLike[],
  currentTimeMs: number
) =>
  statuses.some(
    (status) =>
      status.kind === "incapacitate" && status.expiresAtMs > currentTimeMs
  );
