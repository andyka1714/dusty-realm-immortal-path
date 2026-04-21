import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkshopState } from '../../types';

const initialState: WorkshopState = {
  alchemyLevel: 1,
  blacksmithLevel: 1,
  unlockedRecipes: ['qi_pill', 'novice_sword_reforge'],
  craftedRecipeCounts: {},
};

const workshopSlice = createSlice({
  name: 'workshop',
  initialState,
  reducers: {
    upgradeAlchemy: (state) => {
      state.alchemyLevel += 1;
    },
    unlockRecipe: (state, action: PayloadAction<string>) => {
      if (!state.unlockedRecipes.includes(action.payload)) {
        state.unlockedRecipes.push(action.payload);
      }
    },
    recordRecipeCrafted: (state, action: PayloadAction<string>) => {
      state.craftedRecipeCounts[action.payload] =
        (state.craftedRecipeCounts[action.payload] ?? 0) + 1;
    },
    resetWorkshop: () => initialState,
  },
});

export const { upgradeAlchemy, unlockRecipe, recordRecipeCrafted, resetWorkshop } = workshopSlice.actions;
export default workshopSlice.reducer;
