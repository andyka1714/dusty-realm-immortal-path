import {
  HydratedPersistedState,
  migratePersistedState,
  PersistedSaveEnvelope,
  PersistedState,
} from "./persistedStateMigration";

export const KEY = 'dusty-realm-save-v1';

export const loadState = (): HydratedPersistedState | undefined => {
  if (typeof localStorage === "undefined") {
    return undefined;
  }
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

export const createSaveEnvelope = (
  state: HydratedPersistedState
): PersistedSaveEnvelope => ({
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
    });

export const serializeSaveState = (state: HydratedPersistedState): string =>
  JSON.stringify(createSaveEnvelope(state));

export const saveState = (state: HydratedPersistedState): boolean => {
  if (typeof localStorage === "undefined") {
    return false;
  }
  try {
    const serializedState = serializeSaveState(state);
    localStorage.setItem(KEY, serializedState);
    return true;
  } catch (err) {
    console.error("Failed to save state", err);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dusty-realm-save-error"));
    }
    return false;
  }
};
