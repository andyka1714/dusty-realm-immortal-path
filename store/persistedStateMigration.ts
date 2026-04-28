import {
  BreakthroughConsequence,
  EncounterState,
  HeirloomCandidate,
  InventorySlot,
  ItemInstance,
  LifeReviewSummary,
  MajorRealm,
  SoulState,
  WorkshopDiscipline,
  WorkshopState,
} from "../types";
import {
  isSkillManualLikeItemId,
  resolveFormalSkillManualItemId,
} from "../data/items/manuals";
import { getFormalSkill } from "../data/skills";
import { normalizeFormalSkillIds } from "../data/skills/pool";
import {
  getAvailableReincarnationPerks,
  sanitizeRebirthConfig,
} from "../utils/reincarnation";
import { createInitialSoulState } from "./slices/soulSlice";
import { createInitialEncounterState } from "./slices/encounterSlice";
import { createInitialWorkshopState } from "./slices/workshopSlice";
import {
  createInitialWorkshopSpecializationTreeState,
  getWorkshopSpecializationNode,
  getWorkshopSpecializationNodesForDiscipline,
} from "../data/workshopSpecializationTree";

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
  workshop: WorkshopState;
  soul: SoulState;
  encounter: EncounterState;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNonNegativeInteger = (value: unknown): value is number =>
  Number.isInteger(value) && typeof value === "number" && value >= 0;

const isPositiveInteger = (value: unknown): value is number =>
  Number.isInteger(value) && typeof value === "number" && value >= 1;

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

const migratePersistedBreakthroughConsequence = (
  consequence: unknown
): BreakthroughConsequence | null => {
  if (!isRecord(consequence)) {
    return null;
  }

  const isValidType =
    consequence.type === "heart_demon" ||
    consequence.type === "foundation_injury" ||
    consequence.type === "tribulation_backlash";
  const isValidSeverity =
    consequence.severity === "minor" ||
    consequence.severity === "major" ||
    consequence.severity === "critical";

  if (
    !isValidType ||
    !isValidSeverity ||
    !isPositiveInteger(consequence.remainingDays) ||
    typeof consequence.label !== "string" ||
    typeof consequence.recoveryHint !== "string"
  ) {
    return null;
  }

  const type = consequence.type as BreakthroughConsequence["type"];
  const severity = consequence.severity as BreakthroughConsequence["severity"];

  return {
    type,
    severity,
    remainingDays: consequence.remainingDays,
    label: consequence.label,
    recoveryHint: consequence.recoveryHint,
  };
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

const migratePersistedHeirloomCandidate = (candidate: unknown): HeirloomCandidate | null => {
  if (!isRecord(candidate)) {
    return null;
  }

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.itemId !== "string" ||
    typeof candidate.label !== "string" ||
    (candidate.sourceType !== "equipment" && candidate.sourceType !== "skill_manual") ||
    !isPositiveInteger(candidate.count) ||
    !isNonNegativeInteger(candidate.quality)
  ) {
    return null;
  }

  const nextCandidate: HeirloomCandidate = {
    id: candidate.id,
    itemId: candidate.itemId,
    label: candidate.label,
    sourceType: candidate.sourceType,
    count: candidate.count,
    quality: candidate.quality,
  };

  if (typeof candidate.instanceId === "string") {
    nextCandidate.instanceId = candidate.instanceId;
  }
  if (candidate.instance !== undefined) {
    const migratedInstance = migratePersistedItemInstance(candidate.instance);
    if (migratedInstance) {
      nextCandidate.instance = migratedInstance;
    }
  }

  return nextCandidate;
};

const migratePersistedLifeReviewSummary = (summary: unknown): LifeReviewSummary | null => {
  if (!isRecord(summary)) {
    return null;
  }

  if (
    (summary.cause !== "lifespan" &&
      summary.cause !== "battle" &&
      summary.cause !== "voluntary") ||
    !isNonNegativeInteger(summary.ageYears) ||
    !isFiniteNumber(summary.highestRealm) ||
    !isFiniteNumber(summary.realmMerit) ||
    !isFiniteNumber(summary.ageMerit) ||
    !isFiniteNumber(summary.totalMeritGained)
  ) {
    return null;
  }

  return {
    cause: summary.cause,
    ageYears: summary.ageYears,
    highestRealm: summary.highestRealm as MajorRealm,
    realmMerit: summary.realmMerit,
    ageMerit: summary.ageMerit,
    totalMeritGained: summary.totalMeritGained,
    eligibleHeirlooms: Array.isArray(summary.eligibleHeirlooms)
      ? summary.eligibleHeirlooms
          .map((candidate) => migratePersistedHeirloomCandidate(candidate))
          .filter((candidate): candidate is HeirloomCandidate => Boolean(candidate))
      : [],
  };
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

  nextCharacter.breakthroughConsequence = migratePersistedBreakthroughConsequence(
    character.breakthroughConsequence
  );

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
    worldMemoryTags: Array.isArray(soul.worldMemoryTags)
      ? Array.from(
          new Set(
            soul.worldMemoryTags.filter(
              (tag): tag is string => typeof tag === "string" && tag.length > 0
            )
          )
        )
      : initialSoul.worldMemoryTags,
    pendingLifeReview: migratePersistedLifeReviewSummary(soul.pendingLifeReview),
  };

  const plannerContext = {
    lifetimeStats: nextSoul.lifetimeStats,
    worldMemoryTags: nextSoul.worldMemoryTags,
  };
  const unlockedPerkIds = getAvailableReincarnationPerks(plannerContext).map(
    (perk) => perk.id
  );

  nextSoul.unlockedPerkIds = unlockedPerkIds;
  nextSoul.rebirthConfig = sanitizeRebirthConfig({
    config: nextSoul.rebirthConfig,
    totalMerit: nextSoul.totalMerit,
    plannerContext,
    summary: nextSoul.pendingLifeReview,
  });
  if (nextSoul.flowStep !== "inactive" && !nextSoul.pendingLifeReview) {
    nextSoul.flowStep = "inactive";
  }

  return nextSoul;
};

const sanitizeEncounterPresentationCue = (value: unknown) => {
  if (!isRecord(value)) {
    return undefined;
  }

  const nextCue: Record<string, string> = {};
  ["chainLabel", "memoryCue", "routeLabel", "professionLabel", "sectLabel"].forEach(
    (key) => {
      if (typeof value[key] === "string" && value[key].length > 0) {
        nextCue[key] = value[key];
      }
    }
  );

  return Object.keys(nextCue).length > 0 ? nextCue : undefined;
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
          presentationCue: sanitizeEncounterPresentationCue(
            encounter.pendingEvent.presentationCue
          ),
        }
      : null,
    resolvedEventIds: Array.isArray(encounter.resolvedEventIds)
      ? encounter.resolvedEventIds.filter(
          (eventId): eventId is string => typeof eventId === "string"
        )
      : initialEncounter.resolvedEventIds,
  };
};

const WORKSHOP_DISCIPLINES: WorkshopDiscipline[] = ["alchemy", "smithing"];

const sanitizeWorkshopNumberRecord = (value: unknown) => {
  const initialWorkshop = createInitialWorkshopState();
  const nextRecord: WorkshopState["masteryByDiscipline"] = {
    ...initialWorkshop.masteryByDiscipline,
  };
  if (!isRecord(value)) {
    return nextRecord;
  }

  WORKSHOP_DISCIPLINES.forEach((discipline) => {
    if (isNonNegativeInteger(value[discipline])) {
      nextRecord[discipline] = value[discipline];
    }
  });

  return nextRecord;
};

const sanitizeWorkshopSpecializationRecord = (value: unknown) => {
  const initialWorkshop = createInitialWorkshopState();
  const nextRecord: WorkshopState["specializationByDiscipline"] = {
    ...initialWorkshop.specializationByDiscipline,
  };
  if (!isRecord(value)) {
    return nextRecord;
  }

  WORKSHOP_DISCIPLINES.forEach((discipline) => {
    const specializationId = value[discipline];
    if (typeof specializationId === "string") {
      nextRecord[discipline] = specializationId;
    } else if (specializationId === null) {
      nextRecord[discipline] = null;
    }
  });

  return nextRecord;
};

const appendWorkshopSpecializationNodeWithPrerequisites = (
  nodeId: string,
  unlockedNodeIds: string[]
) => {
  const node = getWorkshopSpecializationNode(nodeId);
  if (!node) {
    return;
  }

  node.prerequisiteNodeIds?.forEach((prerequisiteNodeId) => {
    appendWorkshopSpecializationNodeWithPrerequisites(prerequisiteNodeId, unlockedNodeIds);
  });

  if (!unlockedNodeIds.includes(node.id)) {
    unlockedNodeIds.push(node.id);
  }
};

const sanitizeWorkshopSpecializationTreeRecord = (
  treeValue: unknown,
  legacySpecializationValue: unknown
): WorkshopState["specializationTreeByDiscipline"] => {
  const initialTreeState = createInitialWorkshopSpecializationTreeState();
  const legacySpecializations = sanitizeWorkshopSpecializationRecord(legacySpecializationValue);
  const nextTreeState: WorkshopState["specializationTreeByDiscipline"] = {
    alchemy: { ...initialTreeState.alchemy, unlockedNodeIds: [] },
    smithing: { ...initialTreeState.smithing, unlockedNodeIds: [] },
  };

  WORKSHOP_DISCIPLINES.forEach((discipline) => {
    const disciplineNodeIds = new Set(
      getWorkshopSpecializationNodesForDiscipline(discipline).map((node) => node.id)
    );
    const rawDisciplineTree = isRecord(treeValue) && isRecord(treeValue[discipline])
      ? treeValue[discipline]
      : undefined;
    const rawUnlockedNodeIds = rawDisciplineTree?.unlockedNodeIds;
    const unlockedNodeIds = Array.isArray(rawUnlockedNodeIds)
      ? rawUnlockedNodeIds.filter(
          (nodeId): nodeId is string =>
            typeof nodeId === "string" && disciplineNodeIds.has(nodeId)
        )
      : [];

    const rawActiveNodeId = rawDisciplineTree?.activeNodeId;
    const legacyActiveNodeId = legacySpecializations[discipline];
    const activeNodeId =
      typeof rawActiveNodeId === "string" && disciplineNodeIds.has(rawActiveNodeId)
        ? rawActiveNodeId
        : typeof legacyActiveNodeId === "string" && disciplineNodeIds.has(legacyActiveNodeId)
          ? legacyActiveNodeId
          : null;

    if (activeNodeId) {
      appendWorkshopSpecializationNodeWithPrerequisites(activeNodeId, unlockedNodeIds);
    }

    const activeNode = activeNodeId ? getWorkshopSpecializationNode(activeNodeId) : null;

    nextTreeState[discipline] = {
      unlockedNodeIds,
      activeNodeId: activeNode && unlockedNodeIds.includes(activeNode.id) ? activeNode.id : null,
      activeBranchId:
        activeNode && unlockedNodeIds.includes(activeNode.id) ? activeNode.branchId : null,
    };
  });

  return nextTreeState;
};

const sanitizeCraftedRecipeCounts = (value: unknown) => {
  if (!isRecord(value) || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>((counts, [recipeId, count]) => {
    if (isNonNegativeInteger(count)) {
      counts[recipeId] = count;
    }
    return counts;
  }, {});
};

const migratePersistedWorkshopState = (workshop: unknown): WorkshopState => {
  const initialWorkshop = createInitialWorkshopState();
  if (!isRecord(workshop)) {
    return initialWorkshop;
  }

  const specializationTreeByDiscipline = sanitizeWorkshopSpecializationTreeRecord(
    workshop.specializationTreeByDiscipline,
    workshop.specializationByDiscipline
  );
  const specializationByDiscipline: WorkshopState["specializationByDiscipline"] = {
    alchemy: specializationTreeByDiscipline.alchemy.activeNodeId,
    smithing: specializationTreeByDiscipline.smithing.activeNodeId,
  };

  return {
    ...initialWorkshop,
    ...workshop,
    alchemyLevel: isPositiveInteger(workshop.alchemyLevel)
      ? workshop.alchemyLevel
      : initialWorkshop.alchemyLevel,
    blacksmithLevel: isPositiveInteger(workshop.blacksmithLevel)
      ? workshop.blacksmithLevel
      : initialWorkshop.blacksmithLevel,
    unlockedRecipes: Array.isArray(workshop.unlockedRecipes)
      ? workshop.unlockedRecipes.filter(
          (recipeId): recipeId is string => typeof recipeId === "string"
        )
      : initialWorkshop.unlockedRecipes,
    craftedRecipeCounts: sanitizeCraftedRecipeCounts(workshop.craftedRecipeCounts),
    masteryByDiscipline: sanitizeWorkshopNumberRecord(workshop.masteryByDiscipline),
    specializationTreeByDiscipline,
    specializationByDiscipline,
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
    workshop: migratePersistedWorkshopState(current.workshop),
    soul: migratePersistedSoulState(
      isPersistedSaveEnvelope(state) ? state.soul : undefined
    ),
    encounter: migratePersistedEncounterState(current.encounter),
  };
};
