import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkshopDiscipline, WorkshopState } from '../../types';
import {
  createInitialWorkshopSpecializationTreeState,
  getWorkshopSpecializationNode,
} from '../../data/workshopSpecializationTree';

export const createInitialWorkshopState = (): WorkshopState => ({
  alchemyLevel: 1,
  blacksmithLevel: 1,
  unlockedRecipes: ['qi_pill', 'novice_sword_reforge'],
  craftedRecipeCounts: {},
  masteryByDiscipline: {
    alchemy: 0,
    smithing: 0,
  },
  specializationTreeByDiscipline: createInitialWorkshopSpecializationTreeState(),
  specializationByDiscipline: {
    alchemy: null,
    smithing: null,
  },
});

const initialState: WorkshopState = createInitialWorkshopState();

type RecordRecipeCraftedPayload =
  | string
  | {
      recipeId: string;
      discipline?: WorkshopDiscipline;
      masteryYield?: number;
    };

const workshopSlice = createSlice({
  name: 'workshop',
  initialState,
  reducers: {
    upgradeAlchemy: (state) => {
      state.alchemyLevel += 1;
    },
    upgradeBlacksmith: (state) => {
      state.blacksmithLevel += 1;
    },
    unlockRecipe: (state, action: PayloadAction<string>) => {
      if (!state.unlockedRecipes.includes(action.payload)) {
        state.unlockedRecipes.push(action.payload);
      }
    },
    recordRecipeCrafted: (state, action: PayloadAction<RecordRecipeCraftedPayload>) => {
      const recipeId = typeof action.payload === 'string' ? action.payload : action.payload.recipeId;
      state.craftedRecipeCounts[recipeId] =
        (state.craftedRecipeCounts[recipeId] ?? 0) + 1;

      if (typeof action.payload !== 'string' && action.payload.discipline) {
        state.masteryByDiscipline[action.payload.discipline] +=
          action.payload.masteryYield ?? 1;
      }
    },
    setWorkshopSpecialization: (
      state,
      action: PayloadAction<{
        discipline: WorkshopDiscipline;
        specializationId: string | null;
      }>
    ) => {
      const node = action.payload.specializationId
        ? getWorkshopSpecializationNode(action.payload.specializationId)
        : null;
      const treeState = state.specializationTreeByDiscipline[action.payload.discipline];

      state.specializationByDiscipline[action.payload.discipline] =
        action.payload.specializationId;

      if (action.payload.specializationId === null) {
        treeState.activeNodeId = null;
        treeState.activeBranchId = null;
        return;
      }

      if (!node || node.discipline !== action.payload.discipline) {
        return;
      }

      if (!treeState.unlockedNodeIds.includes(node.id)) {
        treeState.unlockedNodeIds.push(node.id);
      }
      treeState.activeNodeId = node.id;
      treeState.activeBranchId = node.branchId;
    },
    unlockWorkshopSpecializationNode: (
      state,
      action: PayloadAction<{
        discipline: WorkshopDiscipline;
        nodeId: string;
      }>
    ) => {
      const node = getWorkshopSpecializationNode(action.payload.nodeId);
      if (!node || node.discipline !== action.payload.discipline) {
        return;
      }

      const treeState = state.specializationTreeByDiscipline[action.payload.discipline];
      if (!treeState.unlockedNodeIds.includes(node.id)) {
        treeState.unlockedNodeIds.push(node.id);
      }
      treeState.activeNodeId = node.id;
      treeState.activeBranchId = node.branchId;
      state.specializationByDiscipline[action.payload.discipline] = node.id;
    },
    activateWorkshopSpecializationNode: (
      state,
      action: PayloadAction<{
        discipline: WorkshopDiscipline;
        nodeId: string;
      }>
    ) => {
      const node = getWorkshopSpecializationNode(action.payload.nodeId);
      const treeState = state.specializationTreeByDiscipline[action.payload.discipline];
      if (
        !node ||
        node.discipline !== action.payload.discipline ||
        !treeState.unlockedNodeIds.includes(node.id)
      ) {
        return;
      }

      treeState.activeNodeId = node.id;
      treeState.activeBranchId = node.branchId;
      state.specializationByDiscipline[action.payload.discipline] = node.id;
    },
    resetWorkshopSpecializationTree: (
      state,
      action: PayloadAction<{
        discipline: WorkshopDiscipline;
      }>
    ) => {
      state.specializationTreeByDiscipline[action.payload.discipline] =
        createInitialWorkshopSpecializationTreeState()[action.payload.discipline];
      state.specializationByDiscipline[action.payload.discipline] = null;
    },
    resetWorkshop: () => createInitialWorkshopState(),
  },
});

export const {
  upgradeAlchemy,
  upgradeBlacksmith,
  unlockRecipe,
  recordRecipeCrafted,
  setWorkshopSpecialization,
  unlockWorkshopSpecializationNode,
  activateWorkshopSpecializationNode,
  resetWorkshopSpecializationTree,
  resetWorkshop,
} = workshopSlice.actions;
export default workshopSlice.reducer;
