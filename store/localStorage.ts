interface PersistedState {
  character: unknown;
  logs: unknown;
  adventure: unknown;
  inventory: unknown;
  workshop: unknown;
  quest: unknown;
}

const KEY = 'dusty-realm-save-v1';

export const loadState = (): PersistedState | undefined => {
  try {
    const serializedState = localStorage.getItem(KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as PersistedState;
  } catch (err) {
    console.error("Failed to load state", err);
    return undefined;
  }
};

export const saveState = (state: PersistedState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(KEY, serializedState);
  } catch (err) {
    console.error("Failed to save state", err);
  }
};
