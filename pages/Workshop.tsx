import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { upgradeGatheringLevel, deductSpiritStones } from '../store/slices/characterSlice';
import { addLog } from '../store/slices/logSlice';
import { calculateGatheringUpgradeCost } from '../constants';
import { Hammer, ArrowUpCircle, Flame } from 'lucide-react';
import clsx from 'clsx';
import { GameHintBubble } from '../components/game/GameHintBubble';
import { GameSection } from '../components/game/GameSection';
import {
  getUnlockedWorkshopRecipes,
  getWorkshopRecipeCraftingPlan,
  type WorkshopRecipe,
} from '../data/workshopRecipes';
import {
  WORKSHOP_SPECIALIZATION_BRANCH_LABELS,
  getWorkshopMasteryMilestoneStatuses,
  getWorkshopSpecializationNode,
  getWorkshopSpecializationNodeStatus,
  getWorkshopSpecializationNodesForDiscipline,
  getWorkshopSpecializationResetCost,
  type WorkshopSpecializationNode,
} from '../data/workshopSpecializationTree';
import { getEncounterMaterialSourceCues } from '../data/encounters';
import { ITEMS } from '../data/items';
import { craftWorkshopRecipe, selectWorkshopSpecialization } from '../store/actions/workshopActions';
import { MajorRealmCN, type WorkshopDiscipline } from '../types';

interface WorkshopProps {
  embedded?: boolean;
}

const getDisciplineMasteryLabel = (discipline: WorkshopDiscipline) =>
  discipline === "alchemy" ? "丹道" : "器道";

const getRecipeTierLabel = (tier?: WorkshopRecipe["tier"]) =>
  tier === "highRealm" ? "高階配方" : tier === "advanced" ? "進階配方" : "全部配方";

const getSpecializationEffectRows = (node: WorkshopSpecializationNode) => {
  const effect = node.effect;

  if (!effect) {
    return [];
  }

  return [
    `專精效果：${getRecipeTierLabel(effect.appliesToTier)}`,
    effect.spiritStoneCostMultiplier !== undefined
      ? `靈石消耗 x${effect.spiritStoneCostMultiplier}`
      : null,
    effect.masteryYieldBonus ? `熟練收益 +${effect.masteryYieldBonus}` : null,
    effect.qualityCue ? `品質：${effect.qualityCue}` : null,
    effect.outputCue ? `副收益：${effect.outputCue}` : null,
  ].filter((row): row is string => Boolean(row));
};

export const Workshop: React.FC<WorkshopProps> = ({ embedded = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { spiritStones, gatheringLevel, majorRealm } = useSelector((state: RootState) => state.character);
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const workshop = useSelector((state: RootState) => state.workshop);

  const upgradeCost = calculateGatheringUpgradeCost(gatheringLevel);
  const alchemyRecipes = getUnlockedWorkshopRecipes(workshop, "alchemy");
  const smithingRecipes = getUnlockedWorkshopRecipes(workshop, "smithing");

  const handleUpgradeGathering = () => {
     if (spiritStones >= upgradeCost) {
         dispatch(deductSpiritStones(upgradeCost));
         dispatch(upgradeGatheringLevel());
         dispatch(addLog({ message: `消耗 ${upgradeCost} 靈石，聚靈陣升級至 Lv.${gatheringLevel + 1}`, type: 'success' }));
     } else {
         dispatch(addLog({ message: "靈石不足，無法升級聚靈陣。", type: 'danger' }));
     }
  };

  const canAfford = spiritStones >= upgradeCost;
  const getOwnedCount = (itemId: string) =>
    inventory
      .filter((slot) => slot.itemId === itemId && !slot.instanceId)
      .reduce((total, slot) => total + slot.count, 0);

  const getRecipeLockReason = (
    recipe: WorkshopRecipe,
    spiritStoneCost: number
  ): string | null => {
    const disciplineLevel = recipe.discipline === "alchemy" ? workshop.alchemyLevel : workshop.blacksmithLevel;
    const missingIngredient = recipe.ingredients.find(
      (ingredient) => getOwnedCount(ingredient.itemId) < ingredient.count
    );

    if (recipe.minRealm !== undefined && majorRealm < recipe.minRealm) {
      return `未達境界：${MajorRealmCN[recipe.minRealm]}`;
    }

    if (disciplineLevel < recipe.requiredLevel) {
      return `${recipe.discipline === "alchemy" ? "煉丹爐" : "煉器台"}需 Lv.${recipe.requiredLevel}`;
    }

    if (spiritStones < spiritStoneCost) {
      return `靈石不足：${spiritStones.toLocaleString()}/${spiritStoneCost.toLocaleString()}`;
    }

    if (missingIngredient) {
      const item = ITEMS[missingIngredient.itemId];
      return `缺少材料：${item?.name ?? missingIngredient.itemId}`;
    }

    return null;
  };

  const renderSpecializationPanel = (
    discipline: WorkshopDiscipline
  ) => {
    const nodes = getWorkshopSpecializationNodesForDiscipline(discipline);
    const treeState = workshop.specializationTreeByDiscipline[discipline];
    const activeSpecialization = treeState.activeNodeId
      ? getWorkshopSpecializationNode(treeState.activeNodeId)
      : null;
    const milestoneStatuses = getWorkshopMasteryMilestoneStatuses(workshop, discipline);
    const reachedMilestoneCount = milestoneStatuses.filter((status) => status.isReached).length;
    const resetCost = getWorkshopSpecializationResetCost(workshop, discipline);
    const canReset = treeState.unlockedNodeIds.length > 0 && spiritStones >= resetCost;

    return (
      <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/15 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
              百業專精樹
            </div>
            <div className="mt-1 text-xs text-stone-300">
              目前節點：{activeSpecialization?.name ?? "尚未選定"}
            </div>
            <div className="mt-1 text-[11px] text-stone-500">
              啟用分支：
              {treeState.activeBranchId
                ? WORKSHOP_SPECIALIZATION_BRANCH_LABELS[treeState.activeBranchId] ?? treeState.activeBranchId
                : "尚未選定"}
            </div>
            <div className="mt-1 text-[11px] text-stone-500">
              熟練里程碑：{reachedMilestoneCount}/{milestoneStatuses.length}
            </div>
          </div>
          <button
            onClick={() =>
              dispatch(
                selectWorkshopSpecialization({
                  discipline,
                  specializationId: null,
                })
              )
            }
            disabled={!canReset}
            className="rounded-lg border border-cyan-800/60 bg-stone-950 px-2 py-1 text-[11px] text-cyan-100 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            重置 {resetCost} 靈石
          </button>
        </div>
        <div className="mt-2 grid gap-1 rounded-lg border border-cyan-900/50 bg-stone-950/50 p-2 text-[11px] text-stone-400">
          {milestoneStatuses.map((status) => (
            <div
              key={status.milestone.id}
              className={status.isReached ? "text-cyan-200" : "text-stone-500"}
            >
              {status.isReached ? "已達成" : `尚差 ${status.remainingMastery}`}：
              {status.milestone.name} · {status.milestone.cue}
            </div>
          ))}
        </div>
        <div className="mt-2 grid gap-2">
          {nodes.map((node: WorkshopSpecializationNode) => {
            const status = getWorkshopSpecializationNodeStatus({
              workshop,
              node,
              majorRealm,
              spiritStones,
            });
            const minMastery = node.unlockRequirement?.minMastery;
            const minRealm = node.unlockRequirement?.minRealm;
            const effectRows = getSpecializationEffectRows(node);

            return (
              <button
                key={node.id}
                onClick={() =>
                  dispatch(
                    selectWorkshopSpecialization({
                      discipline,
                      specializationId: node.id,
                    })
                  )
                }
                disabled={status.isActive || !status.isAvailable}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-left text-xs transition",
                  status.isActive
                    ? "border-cyan-400/60 bg-cyan-900/35 text-cyan-100"
                    : "border-stone-800 bg-stone-950/70 text-stone-400 hover:border-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                <div className="flex flex-wrap items-center gap-2 font-semibold text-stone-100">
                  <span>{node.name}</span>
                  <span className="rounded border border-cyan-800/60 px-1.5 py-0.5 text-[10px] text-cyan-300">
                    {status.actionLabel}
                  </span>
                  {status.isUnlocked && (
                    <span className="rounded border border-emerald-800/60 px-1.5 py-0.5 text-[10px] text-emerald-300">
                      已解鎖
                    </span>
                  )}
                </div>
                <div className="mt-1 leading-relaxed text-stone-500">
                  {node.description}
                </div>
                <div className="mt-2 grid gap-1 text-stone-400">
                  {minMastery !== undefined && (
                    <div>解鎖條件：{getDisciplineMasteryLabel(discipline)}熟練 {minMastery}</div>
                  )}
                  {minRealm !== undefined && <div>境界條件：{MajorRealmCN[minRealm]}</div>}
                  {node.prerequisiteNodeIds && node.prerequisiteNodeIds.length > 0 && (
                    <div>
                      前置節點：
                      {node.prerequisiteNodeIds
                        .map((nodeId) => getWorkshopSpecializationNode(nodeId)?.name ?? nodeId)
                        .join("、")}
                    </div>
                  )}
                  {node.conflictsWithBranchIds && node.conflictsWithBranchIds.length > 0 && (
                    <div>
                      互斥分支：
                      {node.conflictsWithBranchIds
                        .map((branchId) => WORKSHOP_SPECIALIZATION_BRANCH_LABELS[branchId] ?? branchId)
                        .join("、")}
                    </div>
                  )}
                  <div>{status.isUnlocked ? "切換成本" : "解鎖成本"}：{status.requiredCost} 靈石</div>
                  <div>節點重置成本：{node.resetCost ?? 0} 靈石</div>
                  {effectRows.map((row) => (
                    <div key={row}>{row}</div>
                  ))}
                  {status.lockReason && (
                    <div className="text-rose-300">鎖定原因：{status.lockReason}</div>
                  )}
                  {status.conflictReason && (
                    <div className="text-rose-300">分支衝突：{status.conflictReason}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRecipeCard = (recipe: WorkshopRecipe, actionLabel: string, costLabel: string) => {
    const craftingPlan = getWorkshopRecipeCraftingPlan(recipe, workshop);
    const lockReason = getRecipeLockReason(recipe, craftingPlan.spiritStoneCost);
    const disciplineMastery = workshop.masteryByDiscipline[recipe.discipline];
    const outputLabels = recipe.outputs
      .map((output) => ITEMS[output.itemId]?.name ?? output.itemId)
      .join("、");
    const baseMasteryYield = recipe.masteryYield ?? 1;
    const materialSourceRows = recipe.ingredients.flatMap((ingredient) => {
      const item = ITEMS[ingredient.itemId];
      const sourceCues = getEncounterMaterialSourceCues(ingredient.itemId);

      if (sourceCues.length === 0) {
        return [];
      }

      return [{
        itemId: ingredient.itemId,
        itemName: item?.name ?? ingredient.itemId,
        sourceText: sourceCues
          .slice(0, 3)
          .map((source) =>
            `${source.routeLabel ?? source.title} / ${source.categoryLabel ?? MajorRealmCN[source.minRealm]}`
          )
          .join("、"),
      }];
    });

    return (
      <div
        key={recipe.id}
        className={clsx(
          "rounded-xl border bg-stone-950/70 p-4",
          recipe.tier === "highRealm" ? "border-amber-700/70" : "border-stone-800"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold text-stone-100">{recipe.name}</div>
              {recipe.tier === "highRealm" && (
                <span className="rounded-full border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  高階
                </span>
              )}
              {recipe.minRealm !== undefined && (
                <span className="rounded-full border border-cyan-500/30 bg-cyan-950/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                  境界需求：{MajorRealmCN[recipe.minRealm]}
                </span>
              )}
            </div>
            <div className="mt-1 text-sm text-stone-500">{recipe.description}</div>

            {recipe.routeTags && recipe.routeTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {recipe.routeTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-stone-700 bg-stone-900 px-2 py-0.5 text-[10px] text-stone-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 text-xs text-stone-400">
              材料：
              {recipe.ingredients.map((ingredient) => {
                const item = ITEMS[ingredient.itemId];
                const owned = getOwnedCount(ingredient.itemId);
                return (
                  <span key={ingredient.itemId} className="ml-2 inline-flex items-center gap-1">
                    <span>{item?.name ?? ingredient.itemId}</span>
                    <span className={owned >= ingredient.count ? "text-emerald-400" : "text-rose-300"}>
                      {owned}/{ingredient.count}
                    </span>
                  </span>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-amber-300">
              {costLabel}：{craftingPlan.spiritStoneCost} 靈石
              {craftingPlan.spiritStoneCost !== recipe.spiritStoneCost && (
                <span className="ml-2 text-stone-500">
                  原消耗 {recipe.spiritStoneCost}
                </span>
              )}
            </div>
            <div className="mt-2 grid gap-1 text-xs text-stone-500">
              {outputLabels && <div>產出：{outputLabels}</div>}
              {recipe.qualityHint && <div>品質：{recipe.qualityHint}</div>}
              {recipe.sourceHint && <div>來源：{recipe.sourceHint}</div>}
              {recipe.tier === "highRealm" && recipe.sourceHint && (
                <div>來源線索：{recipe.sourceHint}</div>
              )}
              {materialSourceRows.map((source) => (
                <div key={source.itemId}>
                  材料來源：{source.itemName}：{source.sourceText}
                </div>
              ))}
              {craftingPlan.activeSpecialization && (
                <div className="rounded-lg border border-cyan-800/50 bg-cyan-950/20 px-2 py-1 text-cyan-200">
                  專精影響：{craftingPlan.activeSpecialization.name}
                  <span className="ml-2 text-cyan-300">
                    熟練 +{baseMasteryYield}→+{craftingPlan.masteryYield}
                  </span>
                </div>
              )}
              {craftingPlan.qualityCues.map((cue) => (
                <div key={cue} className="text-cyan-200">
                  品質專精：{cue}
                </div>
              ))}
              {craftingPlan.outputCues.map((cue) => (
                <div key={cue} className="text-cyan-200">
                  副收益提示：{cue}
                </div>
              ))}
              {craftingPlan.masteryYield && (
                <div>
                  {recipe.discipline === "alchemy" ? "丹道" : "器道"}熟練 +{craftingPlan.masteryYield}
                  <span className="ml-2 text-stone-600">目前 {disciplineMastery}</span>
                </div>
              )}
              {lockReason && <div className="text-rose-300">鎖定原因：{lockReason}</div>}
            </div>
          </div>
          <button
            onClick={() => dispatch(craftWorkshopRecipe(recipe.id))}
            disabled={Boolean(lockReason)}
            className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-200 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "flex h-full min-h-0 flex-col gap-6",
        embedded ? "overflow-y-auto p-5 md:p-6" : "overflow-y-auto p-6"
      )}
    >
      {!embedded && (
        <h2 className="text-2xl font-bold text-stone-200 tracking-widest flex items-center gap-2">
           <Hammer size={24} className="text-amber-600" /> 洞府百業
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Gathering Array */}
         <GameSection
            eyebrow="CAVE ARRAY"
            title="聚靈陣"
            bodyClassName="relative overflow-hidden"
            className="group"
         >
            <div className="absolute top-4 right-4 pointer-events-none">
               <Flame size={80} className="text-blue-500 animate-breathing drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]" />
            </div>

            <p className="text-sm text-stone-500 mb-6">匯聚天地靈氣，提升修煉速度。</p>
            
            <div className="flex justify-between items-end mb-4">
               <div>
                  <div className="text-stone-400 text-xs uppercase">目前等級</div>
                  <div className="text-3xl font-mono text-stone-200">{gatheringLevel} 層</div>
               </div>
               <div className="text-right">
                  <div className="text-stone-400 text-xs uppercase">修煉加成</div>
                  <div className="text-xl font-mono text-emerald-400">+{gatheringLevel * 5}%</div>
               </div>
            </div>

            <div className="relative group/btn w-full">
                <button 
                   onClick={handleUpgradeGathering}
                   disabled={!canAfford}
                   className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-stone-200 py-3 rounded-lg border border-stone-700 transition-all flex items-center justify-center gap-2"
                >
                   <ArrowUpCircle size={16} className={canAfford ? "text-amber-500" : "text-stone-600"} />
                   <span>升級</span>
                </button>
                
                {/* Tooltip */}
                <GameHintBubble eyebrow="CRAFT FLOW" className="bottom-full left-1/2 mb-2 -translate-x-1/2 group-hover/btn:opacity-100">
                   <div className={canAfford ? "text-emerald-400" : "text-red-400"}>
                       {canAfford ? "點擊升級" : "靈石不足"}
                   </div>
                   <div className="text-stone-500">消耗: {upgradeCost.toLocaleString()} 靈石</div>
                   {!canAfford && <div className="text-stone-600">擁有: {spiritStones.toLocaleString()}</div>}
                </GameHintBubble>
            </div>
         </GameSection>

         <GameSection
             eyebrow="PILL CRAFT"
             title={`煉丹爐 · Lv.${workshop.alchemyLevel}`}
             bodyClassName="space-y-4"
         >
             <p className="text-sm text-stone-500">萃取草木精華，煉製能直接補上修為節奏的丹藥。</p>
             {renderSpecializationPanel("alchemy")}
             <div className="space-y-3">
                {alchemyRecipes.map((recipe) => renderRecipeCard(recipe, "煉製", "爐火消耗"))}
             </div>
         </GameSection>
         
         <GameSection
             eyebrow="FORGE ALTAR"
             title={`煉器台 · Lv.${workshop.blacksmithLevel}`}
             bodyClassName="space-y-4"
         >
             <p className="text-sm text-stone-500">錘鍊礦材與妖獸部件，為當世 build 提供第一批可自製裝備。</p>
             {renderSpecializationPanel("smithing")}
             <div className="space-y-3">
                {smithingRecipes.map((recipe) => renderRecipeCard(recipe, "鍛造", "鍛台消耗"))}
             </div>
         </GameSection>
      </div>
    </div>
  );
};
