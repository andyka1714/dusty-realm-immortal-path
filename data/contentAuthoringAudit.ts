import { buildCompendiumItemSourceTrace } from "../components/Compendium/sourceTracing";
import { BESTIARY } from "./enemies";
import { ENCOUNTER_EVENTS } from "./encounters";
import { ITEMS } from "./items";
import { MAPS } from "./maps";
import { WORLD_STORY_NPCS } from "./npcs";
import { QUESTS } from "./quests";
import { SHOPS } from "./shops";
import { WORKSHOP_RECIPES } from "./workshopRecipes";

export const ROUTE_MATERIAL_AUDIT_TARGETS = [
  "sword_path_starsteel",
  "beast_path_bloodbone",
  "mystic_path_starlotus",
] as const;

export interface ContentAuditReferenceIssue {
  source: string;
  id: string;
  missingId: string;
  field: string;
}

export interface ContentAuthoringAuditReport {
  invalidItemReferences: ContentAuditReferenceIssue[];
  invalidQuestReferences: ContentAuditReferenceIssue[];
  invalidNpcReferences: ContentAuditReferenceIssue[];
}

export interface RouteMaterialAuditEntry {
  itemId: (typeof ROUTE_MATERIAL_AUDIT_TARGETS)[number];
  hasSource: boolean;
  hasWorkshopSink: boolean;
  hasCompendiumTracing: boolean;
  sourceKinds: string[];
}

export interface RouteMaterialAuditReport {
  routeMaterials: RouteMaterialAuditEntry[];
}

const pushIfMissing = ({
  issues,
  source,
  id,
  missingId,
  field,
  exists,
}: {
  issues: ContentAuditReferenceIssue[];
  source: string;
  id: string;
  missingId: string | undefined;
  field: string;
  exists: boolean;
}) => {
  if (!missingId || exists) {
    return;
  }

  issues.push({ source, id, missingId, field });
};

const npcIds = () =>
  new Set(
    [
      ...WORLD_STORY_NPCS,
      ...MAPS.flatMap((map) => map.npcs),
    ].map((npc) => npc.id)
  );

export const auditContentAuthoringCatalog = (): ContentAuthoringAuditReport => {
  const invalidItemReferences: ContentAuditReferenceIssue[] = [];
  const invalidQuestReferences: ContentAuditReferenceIssue[] = [];
  const invalidNpcReferences: ContentAuditReferenceIssue[] = [];
  const knownNpcIds = npcIds();

  Object.values(QUESTS).forEach((quest) => {
    pushIfMissing({
      issues: invalidNpcReferences,
      source: "quest",
      id: quest.id,
      missingId: quest.giverId,
      field: "giverId",
      exists: knownNpcIds.has(quest.giverId),
    });
    pushIfMissing({
      issues: invalidNpcReferences,
      source: "quest",
      id: quest.id,
      missingId: quest.submitNpcId,
      field: "submitNpcId",
      exists: !quest.submitNpcId || knownNpcIds.has(quest.submitNpcId),
    });

    quest.requirements.forEach((requirement, index) => {
      pushIfMissing({
        issues: invalidNpcReferences,
        source: "quest",
        id: quest.id,
        missingId: requirement.targetNpcId,
        field: `requirements[${index}].targetNpcId`,
        exists: !requirement.targetNpcId || knownNpcIds.has(requirement.targetNpcId),
      });
      if (requirement.type === "item") {
        pushIfMissing({
          issues: invalidItemReferences,
          source: "quest",
          id: quest.id,
          missingId: requirement.targetId,
          field: `requirements[${index}].targetId`,
          exists: !requirement.targetId || Boolean(ITEMS[requirement.targetId]),
        });
      }
    });

    quest.rewards.forEach((reward, rewardIndex) => {
      reward.items?.forEach((item, itemIndex) => {
        pushIfMissing({
          issues: invalidItemReferences,
          source: "quest",
          id: quest.id,
          missingId: item.itemId,
          field: `rewards[${rewardIndex}].items[${itemIndex}].itemId`,
          exists: Boolean(ITEMS[item.itemId]),
        });
      });
    });
  });

  MAPS.forEach((map) => {
    map.npcs.forEach((npc) => {
      npc.questIds?.forEach((questId, index) => {
        pushIfMissing({
          issues: invalidQuestReferences,
          source: "map.npc",
          id: `${map.id}:${npc.id}`,
          missingId: questId,
          field: `questIds[${index}]`,
          exists: Boolean(QUESTS[questId]),
        });
      });
    });
  });

  Object.values(ENCOUNTER_EVENTS).forEach((event) => {
    event.selector?.requiredCompletedQuestIds?.forEach((questId, index) => {
      pushIfMissing({
        issues: invalidQuestReferences,
        source: "encounter",
        id: event.id,
        missingId: questId,
        field: `selector.requiredCompletedQuestIds[${index}]`,
        exists: Boolean(QUESTS[questId]),
      });
    });
    event.choices.forEach((choice) => {
      choice.reward.items?.forEach((item, itemIndex) => {
        pushIfMissing({
          issues: invalidItemReferences,
          source: "encounter",
          id: `${event.id}:${choice.id}`,
          missingId: item.itemId,
          field: `reward.items[${itemIndex}].itemId`,
          exists: Boolean(ITEMS[item.itemId]),
        });
      });
    });
  });

  Object.values(SHOPS).forEach((shop) => {
    shop.items.forEach((item, index) => {
      pushIfMissing({
        issues: invalidItemReferences,
        source: "shop",
        id: shop.id,
        missingId: item.itemId,
        field: `items[${index}].itemId`,
        exists: Boolean(ITEMS[item.itemId]),
      });
    });
  });

  Object.values(BESTIARY).forEach((enemy) => {
    enemy.drops.forEach((itemId, index) => {
      pushIfMissing({
        issues: invalidItemReferences,
        source: "enemy",
        id: enemy.id,
        missingId: itemId,
        field: `drops[${index}]`,
        exists: Boolean(ITEMS[itemId]),
      });
    });
  });

  Object.values(WORKSHOP_RECIPES).forEach((recipe) => {
    recipe.ingredients.forEach((ingredient, index) => {
      pushIfMissing({
        issues: invalidItemReferences,
        source: "workshopRecipe",
        id: recipe.id,
        missingId: ingredient.itemId,
        field: `ingredients[${index}].itemId`,
        exists: Boolean(ITEMS[ingredient.itemId]),
      });
    });
    recipe.outputs.forEach((output, index) => {
      pushIfMissing({
        issues: invalidItemReferences,
        source: "workshopRecipe",
        id: recipe.id,
        missingId: output.itemId,
        field: `outputs[${index}].itemId`,
        exists: Boolean(ITEMS[output.itemId]),
      });
    });
  });

  return {
    invalidItemReferences,
    invalidQuestReferences,
    invalidNpcReferences,
  };
};

export const auditRouteMaterialSourceCoverage = (): RouteMaterialAuditReport => ({
  routeMaterials: ROUTE_MATERIAL_AUDIT_TARGETS.map((itemId) => {
    const trace = buildCompendiumItemSourceTrace(itemId);
    const sourceKinds = Array.from(new Set(trace.sources.map((source) => source.kind)));
    const hasSource =
      trace.dropSources.length > 0 ||
      trace.shopSources.length > 0 ||
      trace.workshopOutputs.length > 0 ||
      trace.encounterRoutes.length > 0;
    const hasWorkshopSink = trace.workshopSinks.length > 0;

    return {
      itemId,
      hasSource,
      hasWorkshopSink,
      hasCompendiumTracing: trace.sources.length > 0,
      sourceKinds,
    };
  }),
});
