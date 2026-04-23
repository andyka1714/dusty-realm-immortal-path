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
  WORKSHOP_SPECIALIZATIONS,
  getUnlockedWorkshopRecipes,
  getWorkshopRecipeCraftingPlan,
  getWorkshopSpecializationUnlockStatus,
  type WorkshopRecipe,
  type WorkshopSpecialization,
} from '../data/workshopRecipes';
import { getEncounterMaterialSourceCues } from '../data/encounters';
import { ITEMS } from '../data/items';
import { craftWorkshopRecipe, selectWorkshopSpecialization } from '../store/actions/workshopActions';
import { MajorRealmCN, type WorkshopDiscipline } from '../types';

interface WorkshopProps {
  embedded?: boolean;
}

const getWorkshopSpecializationsForDiscipline = (discipline: WorkshopDiscipline) =>
  Object.values(WORKSHOP_SPECIALIZATIONS).filter(
    (specialization) => specialization.discipline === discipline
  );

const getDisciplineMasteryLabel = (discipline: WorkshopDiscipline) =>
  discipline === "alchemy" ? "丹道" : "器道";

export const Workshop: React.FC<WorkshopProps> = ({ embedded = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { spiritStones, gatheringLevel, majorRealm } = useSelector((state: RootState) => state.character);
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const workshop = useSelector((state: RootState) => state.workshop);

  const upgradeCost = calculateGatheringUpgradeCost(gatheringLevel);
  const alchemyRecipes = getUnlockedWorkshopRecipes(workshop, "alchemy");
  const smithingRecipes = getUnlockedWorkshopRecipes(workshop, "smithing");
  const alchemySpecializations = getWorkshopSpecializationsForDiscipline("alchemy");
  const smithingSpecializations = getWorkshopSpecializationsForDiscipline("smithing");

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
    discipline: WorkshopDiscipline,
    specializations: WorkshopSpecialization[]
  ) => {
    const activeId = workshop.specializationByDiscipline[discipline];
    const activeSpecialization = activeId ? WORKSHOP_SPECIALIZATIONS[activeId] : null;

    return (
      <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/15 p-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          百業專精
        </div>
        <div className="mt-1 text-xs text-stone-300">
          目前專精：{activeSpecialization?.name ?? "尚未選定"}
        </div>
        <div className="mt-2 grid gap-2">
          {specializations.map((specialization) => {
            const isActive = activeId === specialization.id;
            const unlockStatus = getWorkshopSpecializationUnlockStatus(workshop, specialization);
            const minMastery = specialization.unlockRequirement?.minMastery;
            const canAffordSwitch = spiritStones >= (specialization.switchCost ?? 0);

            return (
              <button
                key={specialization.id}
                onClick={() =>
                  dispatch(
                    selectWorkshopSpecialization({
                      discipline,
                      specializationId: specialization.id,
                    })
                  )
                }
                disabled={!unlockStatus.unlocked || !canAffordSwitch}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-left text-xs transition",
                  isActive
                    ? "border-cyan-400/60 bg-cyan-900/35 text-cyan-100"
                    : "border-stone-800 bg-stone-950/70 text-stone-400 hover:border-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                <div className="font-semibold text-stone-100">
                  可選專精：{specialization.name}
                </div>
                <div className="mt-1 leading-relaxed text-stone-500">
                  {specialization.description}
                </div>
                <div className="mt-2 grid gap-1 text-stone-400">
                  {minMastery !== undefined && (
                    <div>解鎖條件：{getDisciplineMasteryLabel(discipline)}熟練 {minMastery}</div>
                  )}
                  <div>切換成本：{specialization.switchCost ?? 0} 靈石</div>
                  {isActive && <div>重置成本：{specialization.resetCost ?? 0} 靈石</div>}
                  {!unlockStatus.unlocked && (
                    <div className="text-rose-300">鎖定原因：{unlockStatus.reason}</div>
                  )}
                  {unlockStatus.unlocked && !canAffordSwitch && !isActive && (
                    <div className="text-rose-300">鎖定原因：靈石不足</div>
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
             {renderSpecializationPanel("alchemy", alchemySpecializations)}
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
             {renderSpecializationPanel("smithing", smithingSpecializations)}
             <div className="space-y-3">
                {smithingRecipes.map((recipe) => renderRecipeCard(recipe, "鍛造", "鍛台消耗"))}
             </div>
         </GameSection>
      </div>
    </div>
  );
};
