import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { upgradeGatheringArray } from '../store/slices/workshopSlice';
import { addLog } from '../store/slices/logSlice';
import { MajorRealm } from '../types';
import { Hammer, CircleDashed, ArrowUpCircle } from 'lucide-react';

export const Workshop: React.FC = () => {
  const dispatch = useDispatch();
  const { majorRealm, spiritStones } = useSelector((state: RootState) => state.character);
  const { gatheringLevel } = useSelector((state: RootState) => state.workshop);

  if (majorRealm < MajorRealm.Foundation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-500 p-8">
        <Hammer size={48} className="mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">洞府未開</h2>
        <p>築基期後方可開闢洞府，建立基業。</p>
      </div>
    );
  }

  const upgradeCost = gatheringLevel * 100;

  const handleUpgradeGathering = () => {
     if (spiritStones >= upgradeCost) {
         // Need a deductSpiritStones action, simulating logic here
         // In real app, dispatch(deductMoney(cost))
         dispatch(upgradeGatheringArray());
         dispatch(addLog({ message: `消耗 ${upgradeCost} 靈石，聚靈陣升級至 Lv.${gatheringLevel + 1}`, type: 'success' }));
     } else {
         dispatch(addLog({ message: "靈石不足，無法升級聚靈陣。", type: 'danger' }));
     }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-stone-200 tracking-widest flex items-center gap-2">
         <Hammer size={24} className="text-amber-600" /> 洞府百業
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Gathering Array */}
         <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <CircleDashed size={100} />
            </div>
            
            <h3 className="text-xl font-bold text-emerald-500 mb-2">聚靈陣</h3>
            <p className="text-sm text-stone-500 mb-6">匯聚天地靈氣，提升修煉速度。</p>
            
            <div className="flex justify-between items-end mb-4">
               <div>
                  <div className="text-stone-400 text-xs uppercase">Current Level</div>
                  <div className="text-3xl font-mono text-stone-200">Lv. {gatheringLevel}</div>
               </div>
               <div className="text-right">
                  <div className="text-stone-400 text-xs uppercase">Effect</div>
                  <div className="text-xl font-mono text-emerald-400">+{gatheringLevel * 10}%</div>
               </div>
            </div>

            <button 
               onClick={handleUpgradeGathering}
               className="w-full py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
               <ArrowUpCircle size={16} className="text-amber-500" />
               <span>升級 (消耗 {upgradeCost} 靈石)</span>
            </button>
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