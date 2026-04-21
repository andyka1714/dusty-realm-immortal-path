import type { WorldShieldedDamageResolution } from "./battleWorldStrikeLiveTypes";

export const resolveWorldShieldedDamage = ({
  incomingDamage,
  currentShield,
}: {
  incomingDamage: number;
  currentShield: number;
}): WorldShieldedDamageResolution => {
  const absorbed = Math.min(currentShield, incomingDamage);
  return {
    absorbed,
    damageTaken: incomingDamage - absorbed,
    remainingShield: Math.max(0, currentShield - absorbed),
  };
};
