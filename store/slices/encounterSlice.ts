import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EncounterState, PendingEncounter } from "../../types";

export const createInitialEncounterState = (): EncounterState => ({
  pendingEvent: null,
  resolvedEventIds: [],
});

const encounterSlice = createSlice({
  name: "encounter",
  initialState: createInitialEncounterState(),
  reducers: {
    setPendingEncounter: (state, action: PayloadAction<PendingEncounter>) => {
      state.pendingEvent = action.payload;
    },
    clearPendingEncounter: (state) => {
      state.pendingEvent = null;
    },
    markEncounterResolved: (state, action: PayloadAction<string>) => {
      if (!state.resolvedEventIds.includes(action.payload)) {
        state.resolvedEventIds.push(action.payload);
      }
    },
    resetEncounter: () => createInitialEncounterState(),
  },
});

export const {
  setPendingEncounter,
  clearPendingEncounter,
  markEncounterResolved,
  resetEncounter,
} = encounterSlice.actions;

export default encounterSlice.reducer;
