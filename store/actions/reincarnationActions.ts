import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { DAYS_PER_YEAR } from "../../constants";
import { Gender, HeirloomCandidate, LifeEndCause, SpiritRootId, BaseAttributes } from "../../types";
import {
  calculateLifeReviewSummary,
  getRebirthConfigSpiritStoneBonus,
  getRebirthConfigStatBonuses,
  sanitizeRebirthConfig,
} from "../../utils/reincarnation";
import { finalizeRebirth, startLifeReview } from "../slices/soulSlice";
import {
  addSpiritStones,
  generateInitialStats,
  initializeCharacter,
} from "../slices/characterSlice";
import { addLog, clearLogs } from "../slices/logSlice";
import { resetAdventure } from "../slices/adventureSlice";
import { addItem, resetInventory } from "../slices/inventorySlice";
import { resetWorkshop } from "../slices/workshopSlice";
import { resetQuest } from "../slices/questSlice";
import { resetEncounter } from "../slices/encounterSlice";

const applyAttributeBonuses = (
  base: BaseAttributes,
  bonuses: Record<string, number>
): BaseAttributes => ({
  physique: base.physique + (bonuses.physique ?? 0),
  rootBone: base.rootBone + (bonuses.rootBone ?? 0),
  insight: base.insight + (bonuses.insight ?? 0),
  comprehension: base.comprehension + (bonuses.comprehension ?? 0),
  fortune: base.fortune + (bonuses.fortune ?? 0),
  charm: base.charm + (bonuses.charm ?? 0),
});

const cloneHeirloomCandidate = (candidate: HeirloomCandidate) => {
  if (candidate.sourceType === "equipment" && candidate.instance) {
    return {
      itemId: candidate.itemId,
      count: 1,
      instance: {
        ...candidate.instance,
        instanceId: `heirloom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      },
    };
  }

  return {
    itemId: candidate.itemId,
    count: 1,
  };
};

export const startLifeReviewFromCurrentRun = (
  cause?: LifeEndCause
): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const state = getState();

    if (!state.character.isInitialized || state.soul.flowStep !== "inactive") {
      return;
    }

    const resolvedCause =
      cause ?? state.character.lastDeathCause ?? "lifespan";

    dispatch(
      startLifeReview(
        calculateLifeReviewSummary({
          cause: resolvedCause,
          highestRealm: state.character.majorRealm,
          ageYears: Math.floor(state.character.age / DAYS_PER_YEAR),
          inventory: state.inventory.items,
        })
      )
    );
  };

export const completeRebirthFromHall = (): ThunkAction<
  void,
  RootState,
  unknown,
  Action<string>
> => (dispatch, getState) => {
  const state = getState();
  const pendingReview = state.soul.pendingLifeReview;
  if (state.soul.flowStep !== "hall" || !pendingReview) {
    return;
  }

  const normalizedConfig = sanitizeRebirthConfig({
    config: state.soul.rebirthConfig,
    totalMerit: state.soul.totalMerit,
    plannerContext: {
      lifetimeStats: state.soul.lifetimeStats,
      worldMemoryTags: state.soul.worldMemoryTags,
    },
    summary: pendingReview,
  });
  const selectedHeirlooms = pendingReview.eligibleHeirlooms.filter((candidate) =>
    normalizedConfig.selectedHeirloomIds.includes(candidate.id)
  );

  const spiritRootId =
    normalizedConfig.spiritRootOverride ?? state.character.spiritRootId;
  const attributes = applyAttributeBonuses(
    generateInitialStats(spiritRootId as SpiritRootId),
    getRebirthConfigStatBonuses(normalizedConfig)
  );

  dispatch(clearLogs());
  dispatch(resetAdventure());
  dispatch(resetInventory());
  dispatch(resetWorkshop());
  dispatch(resetQuest());
  dispatch(resetEncounter());
  dispatch(
    initializeCharacter({
      name: state.character.name || "無名道友",
      gender: state.character.gender || Gender.Male,
      spiritRootId,
      attributes,
    })
  );

  const spiritStoneBonus = getRebirthConfigSpiritStoneBonus(normalizedConfig);
  if (spiritStoneBonus > 0) {
    dispatch(addSpiritStones({ amount: spiritStoneBonus, source: "other" }));
  }

  selectedHeirlooms.forEach((candidate) => {
    dispatch(addItem(cloneHeirloomCandidate(candidate)));
  });

  dispatch(finalizeRebirth());
  dispatch(addLog({ message: "輪迴既定，新一世已重新展開。", type: "gold" }));
};
