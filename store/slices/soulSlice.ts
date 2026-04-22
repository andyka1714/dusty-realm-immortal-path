import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MajorRealm,
  SoulState,
  LifeReviewSummary,
  RebirthConfig,
  SpiritRootId,
} from "../../types";
import {
  DEFAULT_REINCARNATION_PERKS,
  getAvailableReincarnationPerks,
  getRebirthConfigCost,
  getRebirthConfigHeirloomSlotCount,
} from "../../utils/reincarnation";

export const createInitialSoulState = (): SoulState => ({
  totalMerit: 0,
  flowStep: "inactive",
  lifetimeStats: {
    highestRealmEver: MajorRealm.Mortal,
    highestAgeYears: 0,
    totalDeaths: 0,
    totalReincarnations: 0,
  },
  unlockedPerkIds: getAvailableReincarnationPerks({
    highestRealmEver: MajorRealm.Mortal,
    highestAgeYears: 0,
    totalDeaths: 0,
    totalReincarnations: 0,
  }).map((perk) => perk.id),
  heirloomVault: [],
  pendingLifeReview: null,
  rebirthConfig: {
    selectedPerkIds: [],
    selectedHeirloomIds: [],
  },
});

const canAffordConfig = (state: SoulState, config: RebirthConfig) =>
  getRebirthConfigCost(config) <= state.totalMerit;

const clampSelectedHeirlooms = (
  config: RebirthConfig,
  slotLimit = getRebirthConfigHeirloomSlotCount(config)
): RebirthConfig => ({
  ...config,
  selectedHeirloomIds: config.selectedHeirloomIds.slice(-slotLimit),
});

const soulSlice = createSlice({
  name: "soul",
  initialState: createInitialSoulState(),
  reducers: {
    startLifeReview: (state, action: PayloadAction<LifeReviewSummary>) => {
      const summary = action.payload;
      state.totalMerit += summary.totalMeritGained;
      state.flowStep = "life_review";
      state.pendingLifeReview = summary;
      state.rebirthConfig = {
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      };
      state.lifetimeStats.highestRealmEver = Math.max(
        state.lifetimeStats.highestRealmEver,
        summary.highestRealm
      );
      state.lifetimeStats.highestAgeYears = Math.max(
        state.lifetimeStats.highestAgeYears,
        summary.ageYears
      );
      state.lifetimeStats.totalDeaths += 1;
      state.unlockedPerkIds = getAvailableReincarnationPerks(
        state.lifetimeStats
      ).map((perk) => perk.id);
    },
    enterReincarnationHall: (state) => {
      if (!state.pendingLifeReview) return;
      state.flowStep = "hall";
    },
    toggleRebirthPerk: (state, action: PayloadAction<string>) => {
      if (state.flowStep !== "hall") return;
      if (!state.unlockedPerkIds.includes(action.payload)) return;

      const hasPerk = state.rebirthConfig.selectedPerkIds.includes(action.payload);
      const nextConfig: RebirthConfig = {
        ...state.rebirthConfig,
        selectedPerkIds: hasPerk
          ? state.rebirthConfig.selectedPerkIds.filter((perkId) => perkId !== action.payload)
          : [...state.rebirthConfig.selectedPerkIds, action.payload],
      };

      const clampedConfig = clampSelectedHeirlooms(nextConfig);

      if (!hasPerk || canAffordConfig(state, clampedConfig)) {
        state.rebirthConfig = clampedConfig;
      }
    },
    toggleSelectedHeirloom: (state, action: PayloadAction<string>) => {
      if (state.flowStep !== "hall" || !state.pendingLifeReview) return;

      const hasHeirloom = state.rebirthConfig.selectedHeirloomIds.includes(action.payload);
      const slotLimit = getRebirthConfigHeirloomSlotCount(state.rebirthConfig);
      state.rebirthConfig.selectedHeirloomIds = hasHeirloom
        ? state.rebirthConfig.selectedHeirloomIds.filter((id) => id !== action.payload)
        : [...state.rebirthConfig.selectedHeirloomIds, action.payload].slice(-slotLimit);
    },
    setRebirthSpiritRootOverride: (
      state,
      action: PayloadAction<SpiritRootId | undefined>
    ) => {
      if (state.flowStep !== "hall") return;

      const nextConfig: RebirthConfig = {
        ...state.rebirthConfig,
        spiritRootOverride: action.payload,
      };

      if (canAffordConfig(state, nextConfig)) {
        state.rebirthConfig = nextConfig;
      }
    },
    finalizeRebirth: (state) => {
      const pending = state.pendingLifeReview;
      if (!pending) return;

      const selectedCandidates = pending.eligibleHeirlooms.filter((candidate) =>
        state.rebirthConfig.selectedHeirloomIds.includes(candidate.id)
      );
      const cost = getRebirthConfigCost(state.rebirthConfig);
      state.totalMerit = Math.max(0, state.totalMerit - cost);
      state.heirloomVault = selectedCandidates;
      state.lifetimeStats.totalReincarnations += 1;
      state.flowStep = "inactive";
      state.pendingLifeReview = null;
      state.rebirthConfig = {
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      };
    },
    clearReincarnationFlow: (state) => {
      state.flowStep = "inactive";
      state.pendingLifeReview = null;
      state.rebirthConfig = {
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      };
    },
  },
});

export const {
  startLifeReview,
  enterReincarnationHall,
  toggleRebirthPerk,
  toggleSelectedHeirloom,
  setRebirthSpiritRootOverride,
  finalizeRebirth,
  clearReincarnationFlow,
} = soulSlice.actions;

export default soulSlice.reducer;
