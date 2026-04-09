import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkshopState } from '../../types';

const initialState: WorkshopState = {
  alchemyLevel: 1,
  blacksmithLevel: 1,
  unlockedRecipes: ['qi_pill'],
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
    }
  },
});

export const { upgradeAlchemy, unlockRecipe } = workshopSlice.actions;
export default workshopSlice.reducer;
