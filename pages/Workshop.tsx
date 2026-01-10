import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { upgradeGatheringLevel, deductSpiritStones } from '../store/slices/characterSlice';
import { addLog } from '../store/slices/logSlice';
import { MajorRealm } from '../types';
import { Hammer, CircleDashed, ArrowUpCircle, Flame } from 'lucide-react';

export const Workshop: React.FC = () => {
  const dispatch = useDispatch();
  const { majorRealm, spiritStones, gatheringLevel } = useSelector((state: RootState) => state.character);

  // Exponential Cost Curve: 100 * 1.5^(Level-1)
  // Lv1: 100, Lv10: ~3.8k, Lv20: ~220k, Lv30: ~12M
  const upgradeCost = Math.floor(100 * Math.pow(1.5, gatheringLevel - 1));

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

  return (
    <div className="p-6 min-h-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-stone-200 tracking-widest flex items-center gap-2">
         <Hammer size={24} className="text-amber-600" /> 洞府百業
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Gathering Array */}
         <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-4 right-4 pointer-events-none">
               <Flame size={80} className="text-blue-500 animate-breathing drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]" />
            </div>
            
            <h3 className="text-xl font-bold text-emerald-500 mb-2">聚靈陣</h3>
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
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-stone-950 border border-stone-800 text-xs text-stone-300 rounded-lg shadow-xl opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap">
                   <div className={canAfford ? "text-emerald-400" : "text-red-400"}>
                       {canAfford ? "點擊升級" : "靈石不足"}
                   </div>
                   <div className="text-stone-500">消耗: {upgradeCost.toLocaleString()} 靈石</div>
                   {!canAfford && <div className="text-stone-600">擁有: {spiritStones.toLocaleString()}</div>}
                </div>
            </div>
         </div>

         {/* Alchemy (Placeholder) */}
         <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 opacity-50 relative">
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl z-10">
                 <span className="text-stone-400 font-bold border border-stone-600 px-3 py-1 rounded bg-stone-900">金丹期開放</span>
             </div>
             <h3 className="text-xl font-bold text-amber-500 mb-2">煉丹爐</h3>
             <p className="text-sm text-stone-500 mb-6">萃取草木精華，煉製輔助丹藥。</p>
             <div className="h-20"></div>
         </div>
         
         {/* Blacksmith (Placeholder) */}
         <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 opacity-50 relative">
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-xl z-10">
                 <span className="text-stone-400 font-bold border border-stone-600 px-3 py-1 rounded bg-stone-900">金丹期開放</span>
             </div>
             <h3 className="text-xl font-bold text-red-500 mb-2">煉器台</h3>
             <p className="text-sm text-stone-500 mb-6">錘鍊天材地寶，鑄造神兵利器。</p>
             <div className="h-20"></div>
         </div>
      </div>
    </div>
  );
};