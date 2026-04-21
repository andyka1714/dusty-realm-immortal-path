import { configureStore, combineReducers } from '@reduxjs/toolkit';
import characterReducer from './slices/characterSlice';
import logReducer from './slices/logSlice';
import adventureReducer from './slices/adventureSlice';
import inventoryReducer from './slices/inventorySlice';
import workshopReducer from './slices/workshopSlice';
import questReducer from './slices/questSlice'; // 1. Import questReducer
import soulReducer from './slices/soulSlice';
import encounterReducer from './slices/encounterSlice';
import { loadState, saveState } from './localStorage';

const rootReducer = combineReducers({
  character: characterReducer,
  logs: logReducer,
  adventure: adventureReducer,
  inventory: inventoryReducer,
  workshop: workshopReducer,
  quest: questReducer, // 2. Add quest: questReducer
  soul: soulReducer,
  encounter: encounterReducer,
});

const preloadedState = loadState() as Partial<ReturnType<typeof rootReducer>> | undefined;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

let lastSave = 0;
store.subscribe(() => {
  const now = Date.now();
  if (now - lastSave > 1000) {
    saveState({
        character: store.getState().character,
        logs: store.getState().logs,
        adventure: store.getState().adventure,
        inventory: store.getState().inventory,
        workshop: store.getState().workshop,
        quest: store.getState().quest,
        soul: store.getState().soul,
        encounter: store.getState().encounter,
    });
    lastSave = now;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
