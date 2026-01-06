import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { ITEMS } from '../data/items';
import { equipItem, unequipItem } from '../store/slices/inventorySlice';
import { Package, Shield, Sword, FlaskConical, CircleDashed } from 'lucide-react';
import { ItemType } from '../types';

export const Inventory: React.FC = () => {
  const { items, equipment } = useSelector((state: RootState) => state.inventory);
  const dispatch = useDispatch();
  
  const [filter, setFilter] = useState<'all' | 'weapon' | 'pill' | 'material'>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const filteredItems = items.filter(slot => {
    const item = ITEMS[slot.itemId];
    if (!item) return false;
    if (filter === 'all') return true;
    if (filter === 'weapon') return item.type === 'weapon' || item.type === 'armor';
    return item.type === filter;
  });

  const selectedItem = selectedItemId ? ITEMS[selectedItemId] : null;

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-200 tracking-widest flex items-center gap-2">
          <Package size={24} className="text-amber-600" /> 行囊空間
        </h2>
        
        {/* Filter Tabs */}
        <div className="flex bg-stone-900 rounded-lg p-1 border border-stone-800">
          {(['all', 'weapon', 'pill', 'material'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded text-sm transition-all ${
                filter === f 
                  ? 'bg-stone-700 text-stone-100 shadow' 
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {f === 'all' && '全部'}
              {f === 'weapon' && '裝備'}
              {f === 'pill' && '丹藥'}
              {f === 'material' && '材料'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left: Inventory Grid */}
        <div className="md:col-span-2 bg-stone-900/50 border border-stone-800 rounded-xl p-4 overflow-y-auto min-h-[400px]">
           <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
             {filteredItems.map((slot) => {
               const item = ITEMS[slot.itemId];
               if(!item) return null;
               return (
                 <div 
                    key={slot.itemId}
                    onClick={() => setSelectedItemId(slot.itemId)}
                    className={`aspect-square bg-stone-900 border-2 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer relative group transition-all
                      ${selectedItemId === slot.itemId ? 'border-amber-500 bg-stone-800' : 'border-stone-800 hover:border-stone-600'}
                    `}
                 >
                    {item.type === 'weapon' && <Sword size={20} className="text-stone-400" />}
                    {item.type === 'armor' && <Shield size={20} className="text-stone-400" />}
                    {item.type === 'pill' && <FlaskConical size={20} className="text-emerald-400" />}
                    {item.type === 'material' && <CircleDashed size={20} className="text-stone-600" />}
                    
                    <span className="text-[10px] text-stone-400 mt-1 text-center line-clamp-1 w-full">{item.name}</span>
                    <span className="absolute top-1 right-1 bg-stone-950 text-stone-500 text-[9px] px-1 rounded">{slot.count}</span>
                 </div>
               );
             })}
             {filteredItems.length === 0 && (
               <div className="col-span-full text-center text-stone-600 py-10 italic">
                 行囊空空如也...
               </div>
             )}
           </div>
        </div>

        {/* Right: Equipment & Details */}
        <div className="flex flex-col gap-4">
           {/* Equipment Slots */}
           <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
             <h3 className="text-stone-400 text-sm mb-3 font-bold border-b border-stone-800 pb-2">當前裝備</h3>
             <div className="space-y-3">
               <EquipSlot 
                 label="武器" 
                 icon={Sword} 
                 itemId={equipment.weapon} 
                 onUnequip={() => dispatch(unequipItem('weapon'))}
               />
               <EquipSlot 
                 label="防具" 
                 icon={Shield} 
                 itemId={equipment.armor} 
                 onUnequip={() => dispatch(unequipItem('armor'))}
               />
             </div>
           </div>

           {/* Selected Item Detail */}
           {selectedItem ? (
             <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <h3 className={`text-lg font-bold ${getRarityColor(selectedItem.rarity)}`}>{selectedItem.name}</h3>
                   <span className="text-xs bg-stone-800 px-2 py-1 rounded text-stone-400">{getTypeName(selectedItem.type)}</span>
                </div>
                <p className="text-sm text-stone-500 italic mb-4 flex-1">{selectedItem.description}</p>
                
                <div className="border-t border-stone-800 pt-3 mt-auto space-y-2">
                   {selectedItem.effects && (
                     <div className="text-xs text-stone-400 space-y-1">
                       {selectedItem.effects.stat && <div>屬性加成: {selectedItem.effects.stat} +{selectedItem.effects.value}</div>}
                       {selectedItem.effects.healHp && <div>氣血恢復: {selectedItem.effects.healHp}</div>}
                       {selectedItem.effects.cultivationSpeed && <div>修為提升: +{selectedItem.effects.cultivationSpeed}</div>}
                     </div>
                   )}
                   <div className="flex gap-2 mt-3">
                      {(selectedItem.type === 'weapon' || selectedItem.type === 'armor') && (
                        <button 
                          onClick={() => { dispatch(equipItem(selectedItem.id)); setSelectedItemId(null); }}
                          className="flex-1 bg-amber-700 hover:bg-amber-600 text-stone-100 py-2 rounded text-sm transition-colors"
                        >
                          裝備
                        </button>
                      )}
                      {selectedItem.type === 'pill' && (
                        <button 
                          className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-stone-100 py-2 rounded text-sm transition-colors"
                          onClick={() => alert("功能開發中...")}
                        >
                          服用
                        </button>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-stone-900/30 border border-stone-800 border-dashed rounded-xl p-4 flex-1 flex items-center justify-center text-stone-600 text-sm">
               選擇物品查看詳情
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const EquipSlot = ({ label, icon: Icon, itemId, onUnequip }: any) => {
  const item = itemId ? ITEMS[itemId] : null;
  return (
    <div className="flex items-center gap-3 p-2 bg-stone-950/50 rounded border border-stone-800">
       <div className="p-2 bg-stone-900 rounded border border-stone-700 text-stone-500">
         <Icon size={16} />
       </div>
       <div className="flex-1">
         <div className="text-xs text-stone-500">{label}</div>
         <div className={`text-sm ${item ? 'text-stone-200' : 'text-stone-600 italic'}`}>
           {item ? item.name : '未裝備'}
         </div>
       </div>
       {item && (
         <button onClick={onUnequip} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">
           卸下
         </button>
       )}
    </div>
  );
};

const getRarityColor = (rarity: number) => {
  switch(rarity) {
    case 1: return 'text-stone-300'; // Common
    case 2: return 'text-emerald-400'; // Uncommon
    case 3: return 'text-blue-400'; // Rare
    case 4: return 'text-purple-400'; // Epic
    case 5: return 'text-amber-400'; // Legendary
    default: return 'text-stone-300';
  }
};

const getTypeName = (type: ItemType) => {
  switch(type) {
    case 'weapon': return '武器';
    case 'armor': return '防具';
    case 'pill': return '丹藥';
    case 'material': return '材料';
    case 'manual': return '功法';
    default: return '物品';
  }
};