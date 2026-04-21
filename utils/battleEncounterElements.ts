import { ElementType, Enemy } from "../types";
import type {
  EncounterElementalAffinity,
  EncounterRestriction,
} from "./battleEncounterTypes";

const ELEMENT_RESTRICTION_ADVANTAGES = new Map<ElementType, ElementType>([
  [ElementType.Metal, ElementType.Wood],
  [ElementType.Wood, ElementType.Earth],
  [ElementType.Earth, ElementType.Water],
  [ElementType.Water, ElementType.Fire],
  [ElementType.Fire, ElementType.Metal],
]);

export const getEnemyElementalModifier = (
  attackerElement: ElementType,
  enemy: Enemy
): EncounterElementalAffinity => {
  if (attackerElement === ElementType.None) {
    return { multiplier: 1 };
  }
  if (enemy.weaknesses?.includes(attackerElement)) {
    return { multiplier: 1.18, reason: "weakness" };
  }
  if (enemy.resistances?.includes(attackerElement)) {
    return { multiplier: 0.84, reason: "resistance" };
  }
  return { multiplier: 1 };
};

export const getRestriction = (
  attacker: ElementType,
  defender: ElementType
): EncounterRestriction => {
  if (attacker === ElementType.None || defender === ElementType.None) {
    return { isEffective: false, isResisted: false };
  }

  if (ELEMENT_RESTRICTION_ADVANTAGES.get(attacker) === defender) {
    return { isEffective: true, isResisted: false };
  }

  if (ELEMENT_RESTRICTION_ADVANTAGES.get(defender) === attacker) {
    return { isEffective: false, isResisted: true };
  }

  return { isEffective: false, isResisted: false };
};
