import {
  HydratedPersistedState,
  migratePersistedState,
  PersistedSaveEnvelope,
  PersistedState,
} from "./persistedStateMigration";

const KEY = 'dusty-realm-save-v1';

export const loadState = (): HydratedPersistedState | undefined => {
  try {
    const serializedState = localStorage.getItem(KEY);
    if (serializedState === null) {
      return undefined;
    }
    return migratePersistedState(JSON.parse(serializedState) as PersistedState);
  } catch (err) {
    console.error("Failed to load state", err);
    return undefined;
  }
};

export const saveState = (state: HydratedPersistedState): void => {
  try {
    const payload: PersistedSaveEnvelope = {
      schemaVersion: 2,
      current: {
        character: state.character,
        logs: state.logs,
        adventure: state.adventure,
        inventory: state.inventory,
        workshop: state.workshop,
        quest: state.quest,
        encounter: state.encounter,
      },
      soul: state.soul,
    };
    const serializedState = JSON.stringify(payload);
    localStorage.setItem(KEY, serializedState);
  } catch (err) {
    console.error("Failed to save state", err);
  }
};
