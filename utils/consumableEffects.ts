import { ConsumableEffect } from "../types";

export interface RuntimeResourceSnapshot {
  current: number;
  max: number;
}

export interface ConsumableRuntimeResources {
  hp?: RuntimeResourceSnapshot;
  mp?: RuntimeResourceSnapshot;
}

export interface ConsumableRecoveryResult {
  hp?: RuntimeResourceSnapshot;
  mp?: RuntimeResourceSnapshot;
  appliedEffects: number;
}

const hasEffect = (
  effects: readonly ConsumableEffect[],
  type: ConsumableEffect["type"]
) => effects.some((effect) => effect.type === type);

export const hasRecoveryEffect = (effects: readonly ConsumableEffect[]) =>
  hasEffect(effects, "heal_hp") ||
  hasEffect(effects, "heal_mp") ||
  hasEffect(effects, "full_restore");

export const formatConsumableEffectLabel = (
  effect: ConsumableEffect,
  options: { skillName?: string; useColon?: boolean } = {}
) => {
  const separator = options.useColon ? ": " : " ";

  switch (effect.type) {
    case "full_restore":
      return "完全恢復狀態";
    case "heal_hp":
      return `恢復氣血${separator}${effect.value}`;
    case "heal_mp":
      return `恢復真元${separator}${effect.value}`;
    case "gain_exp":
      return `修為 +${effect.value}`;
    case "buff_stat":
      return effect.stat
        ? `提升${effect.stat}: +${effect.value}`
        : `屬性 +${effect.value}`;
    case "lifespan":
      return `壽元 +${effect.value}`;
    case "breakthrough_chance":
      return `突破機率: +${effect.value}%`;
    case "learn_skill":
      return options.skillName
        ? `參悟後習得：【${options.skillName}】`
        : "功法秘卷";
    default:
      return "";
  }
};

export const getConsumableRecoveryBlockedReason = (
  effects: readonly ConsumableEffect[],
  resources: ConsumableRuntimeResources
) => {
  if (!hasRecoveryEffect(effects)) {
    return null;
  }

  const needsHp = hasEffect(effects, "heal_hp") || hasEffect(effects, "full_restore");
  const needsMp = hasEffect(effects, "heal_mp");

  if (needsHp && !resources.hp) {
    return "目前沒有可恢復的戰鬥氣血";
  }

  if (needsMp && !resources.mp) {
    return "目前沒有可恢復的真元資源";
  }

  const hpAlreadyFull = !needsHp || !resources.hp || resources.hp.current >= resources.hp.max;
  const mpAlreadyFull = !needsMp || !resources.mp || resources.mp.current >= resources.mp.max;

  if (hpAlreadyFull && mpAlreadyFull) {
    if (needsHp && needsMp) {
      return "氣血與真元皆已滿";
    }
    if (needsHp) {
      return "氣血已滿";
    }
    return "真元已滿";
  }

  return null;
};

export const applyConsumableRecoveryEffects = (
  effects: readonly ConsumableEffect[],
  resources: ConsumableRuntimeResources
): ConsumableRecoveryResult => {
  let appliedEffects = 0;
  const next: ConsumableRecoveryResult = {
    hp: resources.hp ? { ...resources.hp } : undefined,
    mp: resources.mp ? { ...resources.mp } : undefined,
    appliedEffects,
  };

  for (const effect of effects) {
    if (effect.type === "heal_hp" && next.hp && next.hp.current < next.hp.max) {
      next.hp.current = Math.min(next.hp.max, next.hp.current + effect.value);
      appliedEffects += 1;
    }

    if (effect.type === "heal_mp" && next.mp && next.mp.current < next.mp.max) {
      next.mp.current = Math.min(next.mp.max, next.mp.current + effect.value);
      appliedEffects += 1;
    }

    if (effect.type === "full_restore") {
      let restored = false;
      if (next.hp && next.hp.current < next.hp.max) {
        next.hp.current = next.hp.max;
        restored = true;
      }
      if (next.mp && next.mp.current < next.mp.max) {
        next.mp.current = next.mp.max;
        restored = true;
      }
      if (restored) {
        appliedEffects += 1;
      }
    }
  }

  next.appliedEffects = appliedEffects;
  return next;
};
