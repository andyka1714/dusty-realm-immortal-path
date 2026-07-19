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

const SAVE_THROTTLE_MS = 1000;
let lastSave = 0;
let pendingSaveTimer: ReturnType<typeof setTimeout> | undefined;
let pendingState: Parameters<typeof saveState>[0] | undefined;

const getPersistedState = () => ({
  character: store.getState().character,
  logs: store.getState().logs,
  adventure: store.getState().adventure,
  inventory: store.getState().inventory,
  workshop: store.getState().workshop,
  quest: store.getState().quest,
  soul: store.getState().soul,
  encounter: store.getState().encounter,
});

const flushPendingSave = () => {
  if (pendingSaveTimer !== undefined) {
    clearTimeout(pendingSaveTimer);
    pendingSaveTimer = undefined;
  }
  if (!pendingState) return;
  saveState(pendingState);
  pendingState = undefined;
  lastSave = Date.now();
};

store.subscribe(() => {
  pendingState = getPersistedState();
  const remaining = Math.max(0, SAVE_THROTTLE_MS - (Date.now() - lastSave));
  if (pendingSaveTimer === undefined) {
    pendingSaveTimer = setTimeout(flushPendingSave, remaining);
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingSave);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingSave();
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
