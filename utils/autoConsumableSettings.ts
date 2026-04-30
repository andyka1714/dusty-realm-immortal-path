import type { AutoConsumableSettings } from "../types";

export const AUTO_CONSUMABLE_THRESHOLD_MIN = 10;
export const AUTO_CONSUMABLE_THRESHOLD_MAX = 90;

export const DEFAULT_AUTO_CONSUMABLE_SETTINGS: AutoConsumableSettings = {
  hp: { enabled: true, thresholdPercent: 45 },
  mp: { enabled: false, thresholdPercent: 25 },
};

const clampThreshold = (value: unknown, fallback: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(
    AUTO_CONSUMABLE_THRESHOLD_MIN,
    Math.min(AUTO_CONSUMABLE_THRESHOLD_MAX, Math.round(value))
  );
};

export const sanitizeAutoConsumableSettings = (
  value: unknown
): AutoConsumableSettings => {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const hp =
    typeof record.hp === "object" && record.hp !== null
      ? (record.hp as Record<string, unknown>)
      : {};
  const mp =
    typeof record.mp === "object" && record.mp !== null
      ? (record.mp as Record<string, unknown>)
      : {};

  return {
    hp: {
      enabled:
        typeof hp.enabled === "boolean"
          ? hp.enabled
          : DEFAULT_AUTO_CONSUMABLE_SETTINGS.hp.enabled,
      thresholdPercent: clampThreshold(
        hp.thresholdPercent,
        DEFAULT_AUTO_CONSUMABLE_SETTINGS.hp.thresholdPercent
      ),
    },
    mp: {
      enabled:
        typeof mp.enabled === "boolean"
          ? mp.enabled
          : DEFAULT_AUTO_CONSUMABLE_SETTINGS.mp.enabled,
      thresholdPercent: clampThreshold(
        mp.thresholdPercent,
        DEFAULT_AUTO_CONSUMABLE_SETTINGS.mp.thresholdPercent
      ),
    },
  };
};
