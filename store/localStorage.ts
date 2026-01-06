const KEY = 'dusty-realm-save-v1';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load state", err);
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(KEY, serializedState);
  } catch (err) {
    console.error("Failed to save state", err);
  }
};