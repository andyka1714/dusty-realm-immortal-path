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
import { getUnlockedWorkshopRecipes } from '../data/workshopRecipes';
import { ITEMS } from '../data/items';
import { craftWorkshopRecipe } from '../store/actions/workshopActions';

interface WorkshopProps {
  embedded?: boolean;
}

export const Workshop: React.FC<WorkshopProps> = ({ embedded = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { spiritStones, gatheringLevel } = useSelector((state: RootState) => state.character);
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
             <div className="space-y-3">
                {alchemyRecipes.map((recipe) => {
                  const canCraftRecipe =
                    spiritStones >= recipe.spiritStoneCost &&
                    recipe.ingredients.every((ingredient) => getOwnedCount(ingredient.itemId) >= ingredient.count);
                  return (
                    <div key={recipe.id} className="rounded-xl border border-stone-800 bg-stone-950/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-base font-semibold text-stone-100">{recipe.name}</div>
                          <div className="mt-1 text-sm text-stone-500">{recipe.description}</div>
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
                          <div className="mt-2 text-xs text-amber-300">爐火消耗：{recipe.spiritStoneCost} 靈石</div>
                        </div>
                        <button
                          onClick={() => dispatch(craftWorkshopRecipe(recipe.id))}
                          disabled={!canCraftRecipe}
                          className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-200 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          煉製
                        </button>
                      </div>
                    </div>
                  );
                })}
             </div>
         </GameSection>
         
         <GameSection
             eyebrow="FORGE ALTAR"
             title={`煉器台 · Lv.${workshop.blacksmithLevel}`}
             bodyClassName="space-y-4"
         >
             <p className="text-sm text-stone-500">錘鍊礦材與妖獸部件，為當世 build 提供第一批可自製裝備。</p>
             <div className="space-y-3">
                {smithingRecipes.map((recipe) => {
                  const canCraftRecipe =
                    spiritStones >= recipe.spiritStoneCost &&
                    recipe.ingredients.every((ingredient) => getOwnedCount(ingredient.itemId) >= ingredient.count);
                  return (
                    <div key={recipe.id} className="rounded-xl border border-stone-800 bg-stone-950/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-base font-semibold text-stone-100">{recipe.name}</div>
                          <div className="mt-1 text-sm text-stone-500">{recipe.description}</div>
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
                          <div className="mt-2 text-xs text-amber-300">鍛台消耗：{recipe.spiritStoneCost} 靈石</div>
                        </div>
                        <button
                          onClick={() => dispatch(craftWorkshopRecipe(recipe.id))}
                          disabled={!canCraftRecipe}
                          className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-200 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          鍛造
                        </button>
                      </div>
                    </div>
                  );
                })}
             </div>
         </GameSection>
      </div>
    </div>
  );
};
