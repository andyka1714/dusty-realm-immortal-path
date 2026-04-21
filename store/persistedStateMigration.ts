import { EncounterState, InventorySlot, ItemInstance, SoulState } from "../types";
import {
  isSkillManualLikeItemId,
  resolveFormalSkillManualItemId,
} from "../data/items/manuals";
import { getFormalSkill } from "../data/skills";
import { normalizeFormalSkillIds } from "../data/skills/pool";
import { createInitialSoulState } from "./slices/soulSlice";
import { createInitialEncounterState } from "./slices/encounterSlice";

export interface LegacyPersistedState {
  character: unknown;
  logs: unknown;
  adventure: unknown;
  inventory: unknown;
  workshop: unknown;
  quest: unknown;
  encounter?: unknown;
}

export interface PersistedSaveEnvelope {
  schemaVersion: 2;
  current: LegacyPersistedState;
  soul: unknown;
}

export type PersistedState = LegacyPersistedState | PersistedSaveEnvelope;

export interface HydratedPersistedState extends LegacyPersistedState {
  soul: SoulState;
  encounter: EncounterState;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const migratePersistedItemId = (itemId: string): string | null => {
  const migratedManualId = resolveFormalSkillManualItemId(itemId);
  if (migratedManualId) {
    return migratedManualId;
  }

  if (isSkillManualLikeItemId(itemId)) {
    return null;
  }

  return itemId;
};

const normalizePersistedSkillIds = (skillIds: string[]) =>
  normalizeFormalSkillIds(skillIds).filter((skillId) => Boolean(getFormalSkill(skillId)));

const migratePersistedItemConsumption = (itemConsumption: unknown) => {
  if (!isRecord(itemConsumption)) {
    return itemConsumption;
  }

  return Object.entries(itemConsumption).reduce<Record<string, number>>(
    (counts, [itemId, count]) => {
      if (!isFiniteNumber(count)) {
        return counts;
      }

      const migratedItemId = migratePersistedItemId(itemId);
      if (!migratedItemId) {
        return counts;
      }

      counts[migratedItemId] = (counts[migratedItemId] ?? 0) + count;
      return counts;
    },
    {}
  );
};

const migratePersistedItemInstance = (instance: unknown): ItemInstance | undefined => {
  if (!isRecord(instance)) {
    return undefined;
  }

  const nextInstance = { ...instance } as Record<string, unknown>;
  if (typeof nextInstance.templateId === "string") {
    const migratedTemplateId = migratePersistedItemId(nextInstance.templateId);
    if (!migratedTemplateId) {
      return undefined;
    }
    nextInstance.templateId = migratedTemplateId;
  }

  return nextInstance as unknown as ItemInstance;
};

const migratePersistedInventorySlot = (slot: unknown): InventorySlot | null => {
  if (!isRecord(slot)) {
    return null;
  }

  if (typeof slot.itemId !== "string" || !isFiniteNumber(slot.count)) {
    return null;
  }

  const migratedItemId = migratePersistedItemId(slot.itemId);
  if (!migratedItemId) {
    return null;
  }

  const nextSlot: InventorySlot = {
    itemId: migratedItemId,
    count: slot.count,
  };

  if (typeof slot.instanceId === "string") {
    nextSlot.instanceId = slot.instanceId;
  }

  if (slot.instance !== undefined) {
    const migratedInstance = migratePersistedItemInstance(slot.instance);
    if (!migratedInstance) {
      return null;
    }
    nextSlot.instance = migratedInstance;
  }

  return nextSlot;
};

const mergeStackableInventorySlots = (slots: InventorySlot[]) => {
  const mergedSlots: InventorySlot[] = [];
  const stackableIndex = new Map<string, InventorySlot>();

  slots.forEach((slot) => {
    if (slot.instanceId || slot.instance) {
      mergedSlots.push(slot);
      return;
    }

    const existing = stackableIndex.get(slot.itemId);
    if (existing) {
      existing.count += slot.count;
      return;
    }

    const nextSlot = { ...slot };
    stackableIndex.set(nextSlot.itemId, nextSlot);
    mergedSlots.push(nextSlot);
  });

  return mergedSlots;
};

export const migratePersistedCharacterState = (character: unknown) => {
  if (!isRecord(character)) {
    return character;
  }

  const nextCharacter = { ...character } as Record<string, unknown>;

  if (Array.isArray(character.skills)) {
    nextCharacter.skills = normalizePersistedSkillIds(
      character.skills.filter((skillId): skillId is string => typeof skillId === "string")
    );
  }

  if ("itemConsumption" in character) {
    nextCharacter.itemConsumption = migratePersistedItemConsumption(character.itemConsumption);
  }

  return nextCharacter;
};

export const migratePersistedInventoryState = (inventory: unknown) => {
  if (!isRecord(inventory)) {
    return inventory;
  }

  const nextInventory = { ...inventory } as Record<string, unknown>;

  if (Array.isArray(inventory.items)) {
    nextInventory.items = mergeStackableInventorySlots(
      inventory.items
        .map((slot) => migratePersistedInventorySlot(slot))
        .filter((slot): slot is InventorySlot => Boolean(slot))
    );
  }

  return nextInventory;
};

const migratePersistedSoulState = (soul: unknown): SoulState => {
  const initialSoul = createInitialSoulState();
  if (!isRecord(soul)) {
    return initialSoul;
  }

  const nextSoul: SoulState = {
    ...initialSoul,
    ...soul,
    lifetimeStats: {
      ...initialSoul.lifetimeStats,
      ...(isRecord(soul.lifetimeStats) ? soul.lifetimeStats : {}),
    },
    rebirthConfig: {
      ...initialSoul.rebirthConfig,
      ...(isRecord(soul.rebirthConfig) ? soul.rebirthConfig : {}),
    },
  };

  return nextSoul;
};

const migratePersistedEncounterState = (encounter: unknown): EncounterState => {
  const initialEncounter = createInitialEncounterState();
  if (!isRecord(encounter)) {
    return initialEncounter;
  }

  return {
    ...initialEncounter,
    ...encounter,
    pendingEvent: isRecord(encounter.pendingEvent) &&
      typeof encounter.pendingEvent.eventId === "string" &&
      isFiniteNumber(encounter.pendingEvent.year)
      ? {
          eventId: encounter.pendingEvent.eventId,
          year: encounter.pendingEvent.year,
        }
      : null,
    resolvedEventIds: Array.isArray(encounter.resolvedEventIds)
      ? encounter.resolvedEventIds.filter(
          (eventId): eventId is string => typeof eventId === "string"
        )
      : initialEncounter.resolvedEventIds,
  };
};

const isPersistedSaveEnvelope = (
  state: PersistedState
): state is PersistedSaveEnvelope =>
  isRecord(state) && state.schemaVersion === 2 && isRecord(state.current);

export const migratePersistedState = (
  state: PersistedState
): HydratedPersistedState => {
  const current = isPersistedSaveEnvelope(state) ? state.current : state;

  return {
    ...current,
    character: migratePersistedCharacterState(current.character),
    inventory: migratePersistedInventoryState(current.inventory),
    soul: migratePersistedSoulState(
      isPersistedSaveEnvelope(state) ? state.soul : undefined
    ),
    encounter: migratePersistedEncounterState(current.encounter),
  };
};
