import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MajorRealm,
  ReincarnationBuildIdentity,
  SoulState,
  LifeReviewSummary,
  RebirthConfig,
  SpiritRootId,
} from "../../types";
import {
  getRebirthConfigCost,
  getAvailableReincarnationPerks,
  getReincarnationSoulSealById,
  REINCARNATION_PLANNER_VERSION,
  sanitizeRebirthConfig,
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
    lifetimeStats: {
      highestRealmEver: MajorRealm.Mortal,
      highestAgeYears: 0,
      totalDeaths: 0,
      totalReincarnations: 0,
    },
    worldMemoryTags: [],
  }).map((perk) => perk.id),
  heirloomVault: [],
  worldMemoryTags: [],
  pendingLifeReview: null,
  rebirthConfig: {
    plannerVersion: REINCARNATION_PLANNER_VERSION,
    selectedBuildIdentity: "balanced",
    selectedPerkIds: [],
    selectedHeirloomIds: [],
  },
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
      state.lifetimeStats.highestRealmEver = Math.max(
        state.lifetimeStats.highestRealmEver,
        summary.highestRealm
      );
      state.lifetimeStats.highestAgeYears = Math.max(
        state.lifetimeStats.highestAgeYears,
        summary.ageYears
      );
      state.lifetimeStats.totalDeaths += 1;
      state.unlockedPerkIds = getAvailableReincarnationPerks({
        lifetimeStats: state.lifetimeStats,
        worldMemoryTags: state.worldMemoryTags,
      }).map((perk) => perk.id);
      state.rebirthConfig = sanitizeRebirthConfig({
        config: undefined,
        totalMerit: state.totalMerit,
        plannerContext: {
          lifetimeStats: state.lifetimeStats,
          worldMemoryTags: state.worldMemoryTags,
        },
        summary,
      });
    },
    enterReincarnationHall: (state) => {
      if (!state.pendingLifeReview) return;
      state.flowStep = "hall";
    },
    setRebirthBuildIdentity: (
      state,
      action: PayloadAction<ReincarnationBuildIdentity>
    ) => {
      if (state.flowStep !== "hall" || !state.pendingLifeReview) return;
      state.rebirthConfig = sanitizeRebirthConfig({
        config: {
          ...state.rebirthConfig,
          selectedBuildIdentity: action.payload,
          selectedSealId:
            action.payload === "balanced"
              ? undefined
              : state.rebirthConfig.selectedSealId,
        },
        totalMerit: state.totalMerit,
        plannerContext: {
          lifetimeStats: state.lifetimeStats,
          worldMemoryTags: state.worldMemoryTags,
        },
        summary: state.pendingLifeReview,
      });
    },
    setRebirthSoulSeal: (state, action: PayloadAction<string | undefined>) => {
      if (state.flowStep !== "hall" || !state.pendingLifeReview) return;

      const selectedSeal = action.payload;
      const selectedBuildIdentity = selectedSeal
        ? getReincarnationSoulSealById(selectedSeal)?.lane ??
          state.rebirthConfig.selectedBuildIdentity
        : state.rebirthConfig.selectedBuildIdentity;

      state.rebirthConfig = sanitizeRebirthConfig({
        config: {
          ...state.rebirthConfig,
          selectedBuildIdentity,
          selectedSealId:
            state.rebirthConfig.selectedSealId === selectedSeal
              ? undefined
              : selectedSeal,
        },
        totalMerit: state.totalMerit,
        plannerContext: {
          lifetimeStats: state.lifetimeStats,
          worldMemoryTags: state.worldMemoryTags,
        },
        summary: state.pendingLifeReview,
      });
    },
    toggleRebirthPerk: (state, action: PayloadAction<string>) => {
      if (state.flowStep !== "hall" || !state.pendingLifeReview) return;
      if (!state.unlockedPerkIds.includes(action.payload)) return;

      const hasPerk = state.rebirthConfig.selectedPerkIds.includes(action.payload);
      const nextConfig: RebirthConfig = {
        ...state.rebirthConfig,
        selectedPerkIds: hasPerk
          ? state.rebirthConfig.selectedPerkIds.filter((perkId) => perkId !== action.payload)
          : [...state.rebirthConfig.selectedPerkIds, action.payload],
      };
      state.rebirthConfig = sanitizeRebirthConfig({
        config: nextConfig,
        totalMerit: state.totalMerit,
        plannerContext: {
          lifetimeStats: state.lifetimeStats,
          worldMemoryTags: state.worldMemoryTags,
        },
        summary: state.pendingLifeReview,
      });
    },
    toggleSelectedHeirloom: (state, action: PayloadAction<string>) => {
      if (state.flowStep !== "hall" || !state.pendingLifeReview) return;

      const hasHeirloom = state.rebirthConfig.selectedHeirloomIds.includes(action.payload);
      state.rebirthConfig = sanitizeRebirthConfig({
        config: {
          ...state.rebirthConfig,
          selectedHeirloomIds: hasHeirloom
            ? state.rebirthConfig.selectedHeirloomIds.filter((id) => id !== action.payload)
            : [...state.rebirthConfig.selectedHeirloomIds, action.payload],
        },
        totalMerit: state.totalMerit,
        plannerContext: {
          lifetimeStats: state.lifetimeStats,
          worldMemoryTags: state.worldMemoryTags,
        },
        summary: state.pendingLifeReview,
      });
    },
    setRebirthSpiritRootOverride: (
      state,
      action: PayloadAction<SpiritRootId | undefined>
    ) => {
      if (state.flowStep !== "hall" || !state.pendingLifeReview) return;
      state.rebirthConfig = sanitizeRebirthConfig({
        config: {
          ...state.rebirthConfig,
          spiritRootOverride: action.payload,
        },
        totalMerit: state.totalMerit,
        plannerContext: {
          lifetimeStats: state.lifetimeStats,
          worldMemoryTags: state.worldMemoryTags,
        },
        summary: state.pendingLifeReview,
      });
    },
    finalizeRebirth: (state) => {
      const pending = state.pendingLifeReview;
      if (!pending) return;

      state.rebirthConfig = sanitizeRebirthConfig({
        config: state.rebirthConfig,
        totalMerit: state.totalMerit,
        plannerContext: {
          lifetimeStats: state.lifetimeStats,
          worldMemoryTags: state.worldMemoryTags,
        },
        summary: pending,
      });
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
        plannerVersion: REINCARNATION_PLANNER_VERSION,
        selectedBuildIdentity: "balanced",
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      };
    },
    addWorldMemoryTags: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((tag) => {
        if (typeof tag !== "string" || tag.length === 0) {
          return;
        }

        if (!state.worldMemoryTags.includes(tag)) {
          state.worldMemoryTags.push(tag);
        }
      });
      state.unlockedPerkIds = getAvailableReincarnationPerks({
        lifetimeStats: state.lifetimeStats,
        worldMemoryTags: state.worldMemoryTags,
      }).map((perk) => perk.id);
      if (state.pendingLifeReview) {
        state.rebirthConfig = sanitizeRebirthConfig({
          config: state.rebirthConfig,
          totalMerit: state.totalMerit,
          plannerContext: {
            lifetimeStats: state.lifetimeStats,
            worldMemoryTags: state.worldMemoryTags,
          },
          summary: state.pendingLifeReview,
        });
      }
    },
    clearReincarnationFlow: (state) => {
      state.flowStep = "inactive";
      state.pendingLifeReview = null;
      state.rebirthConfig = {
        plannerVersion: REINCARNATION_PLANNER_VERSION,
        selectedBuildIdentity: "balanced",
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      };
    },
  },
});

export const {
  startLifeReview,
  enterReincarnationHall,
  setRebirthBuildIdentity,
  setRebirthSoulSeal,
  toggleRebirthPerk,
  toggleSelectedHeirloom,
  setRebirthSpiritRootOverride,
  finalizeRebirth,
  clearReincarnationFlow,
  addWorldMemoryTags,
} = soulSlice.actions;

export default soulSlice.reducer;
