import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkshopDiscipline, WorkshopState } from '../../types';

export const createInitialWorkshopState = (): WorkshopState => ({
  alchemyLevel: 1,
  blacksmithLevel: 1,
  unlockedRecipes: ['qi_pill', 'novice_sword_reforge'],
  craftedRecipeCounts: {},
  masteryByDiscipline: {
    alchemy: 0,
    smithing: 0,
  },
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
      state.specializationByDiscipline[action.payload.discipline] =
        action.payload.specializationId;
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
  resetWorkshop,
} = workshopSlice.actions;
export default workshopSlice.reducer;
