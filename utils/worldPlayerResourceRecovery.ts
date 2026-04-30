import type { BaseAttributes } from "../types";

export const WORLD_RESOURCE_RECOVERY_INTERVAL_MS = 5_000;

export interface ResourceRecoveryEffect {
  id: string;
  source: "skill" | "consumable" | "equipment" | "passive";
  resource: "hp" | "mp";
  amountPerTick: number;
  tickIntervalMs: number;
  expiresAtMs: number;
}

interface ResourceSnapshot {
  current: number;
  max: number;
}

interface ResourceRecoveryResult {
  current: number;
  recovered: number;
}

export interface WorldPlayerResourceRecoveryResult {
  didRecover: boolean;
  nextRecoveredAt: number;
  hp: ResourceRecoveryResult;
  mp: ResourceRecoveryResult;
}

const clampResource = (value: number, max: number) =>
  Math.max(0, Math.min(max, Math.floor(value)));

const getEligibleEffectAmount = ({
  effects,
  resource,
  now,
  elapsedMs,
}: {
  effects: ResourceRecoveryEffect[];
  resource: "hp" | "mp";
  now: number;
  elapsedMs: number;
}) =>
  effects
    .filter(
      (effect) =>
        effect.resource === resource &&
        effect.expiresAtMs >= now &&
        effect.tickIntervalMs > 0 &&
        elapsedMs >= effect.tickIntervalMs
    )
    .reduce((sum, effect) => sum + Math.max(0, effect.amountPerTick), 0);

export const resolveWorldPlayerResourceRecovery = ({
  now,
  lastRecoveredAt,
  hp,
  mp,
  attributes,
  regenHp,
  recoveryEffects = [],
}: {
  now: number;
  lastRecoveredAt: number;
  hp: ResourceSnapshot;
  mp: ResourceSnapshot;
  attributes: BaseAttributes;
  regenHp: number;
  recoveryEffects?: ResourceRecoveryEffect[];
}): WorldPlayerResourceRecoveryResult => {
  const elapsedMs = now - lastRecoveredAt;

  if (elapsedMs < WORLD_RESOURCE_RECOVERY_INTERVAL_MS) {
    return {
      didRecover: false,
      nextRecoveredAt: lastRecoveredAt,
      hp: { current: hp.current, recovered: 0 },
      mp: { current: mp.current, recovered: 0 },
    };
  }

  const hpBaseRecovery = Math.max(1, Math.floor(hp.max * 0.02));
  const hpAttributeRecovery = Math.floor(
    (attributes.physique + attributes.rootBone) * 0.2
  );
  const hpEffectRecovery = getEligibleEffectAmount({
    effects: recoveryEffects,
    resource: "hp",
    now,
    elapsedMs,
  });
  const hpRecovery =
    hpBaseRecovery +
    hpAttributeRecovery +
    Math.max(0, Math.floor(regenHp)) +
    hpEffectRecovery;

  const mpBaseRecovery = Math.max(1, Math.floor(mp.max * 0.03));
  const mpAttributeRecovery = Math.floor(
    (attributes.insight + attributes.comprehension) * 0.15
  );
  const mpEffectRecovery = getEligibleEffectAmount({
    effects: recoveryEffects,
    resource: "mp",
    now,
    elapsedMs,
  });
  const mpRecovery = mpBaseRecovery + mpAttributeRecovery + mpEffectRecovery;

  const nextHp = clampResource(hp.current + hpRecovery, hp.max);
  const nextMp = clampResource(mp.current + mpRecovery, mp.max);

  return {
    didRecover: nextHp !== hp.current || nextMp !== mp.current,
    nextRecoveredAt:
      lastRecoveredAt +
      Math.floor(elapsedMs / WORLD_RESOURCE_RECOVERY_INTERVAL_MS) *
        WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
    hp: {
      current: nextHp,
      recovered: Math.max(0, nextHp - hp.current),
    },
    mp: {
      current: nextMp,
      recovered: Math.max(0, nextMp - mp.current),
    },
  };
};
