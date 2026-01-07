import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { ITEMS } from '../data/items';
import { equipItem, unequipItem } from '../store/slices/inventorySlice';
import { Package, Shield, Sword, FlaskConical, CircleDashed } from 'lucide-react';
import { ItemCategory, ItemQuality, EquipmentSlot, ConsumableItem } from '../types';

export const Inventory: React.FC = () => {
  const { items, equipment } = useSelector((state: RootState) => state.inventory);
  const dispatch = useDispatch();
  
  const [filter, setFilter] = useState<'all' | ItemCategory>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const filteredItems = items.filter(slot => {
    const item = ITEMS[slot.itemId];
    if (!item) return false;
    if (filter === 'all') return true;
    return item.category === filter;
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
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="全部" />
            <FilterButton active={filter === ItemCategory.Equipment} onClick={() => setFilter(ItemCategory.Equipment)} label="裝備" />
            <FilterButton active={filter === ItemCategory.Consumable} onClick={() => setFilter(ItemCategory.Consumable)} label="丹藥" />
            <FilterButton active={filter === ItemCategory.Material} onClick={() => setFilter(ItemCategory.Material)} label="材料" />
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
                    {item.category === ItemCategory.Equipment && <Sword size={20} className="text-stone-400" />}
                    {item.category === ItemCategory.Consumable && <FlaskConical size={20} className="text-emerald-400" />}
                    {item.category === ItemCategory.Material && <CircleDashed size={20} className="text-stone-600" />}
                    {/* Fallback Icon */}
                    {![ItemCategory.Equipment, ItemCategory.Consumable, ItemCategory.Material].includes(item.category) && <Package size={20} className="text-stone-600"/>}
                    
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
                 itemId={equipment[EquipmentSlot.Weapon]} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Weapon))}
               />
               <EquipSlot 
                 label="防具" 
                 icon={Shield} 
                 itemId={equipment[EquipmentSlot.Body]} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Body))}
               />
               {/* Can look to add Head/Legs slots visually later */}
             </div>
           </div>

           {/* Selected Item Detail */}
           {selectedItem ? (
             <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <h3 className={`text-lg font-bold ${getQualityColor(selectedItem.quality)}`}>{selectedItem.name}</h3>
                   <span className="text-xs bg-stone-800 px-2 py-1 rounded text-stone-400">{getCategoryName(selectedItem.category)}</span>
                </div>
                <p className="text-sm text-stone-500 italic mb-4 flex-1">{selectedItem.description}</p>
                
                <div className="border-t border-stone-800 pt-3 mt-auto space-y-2">
                   {selectedItem.category === ItemCategory.Consumable && (selectedItem as ConsumableItem).effects && (
                     <div className="text-xs text-stone-400 space-y-1">
                       {(selectedItem as ConsumableItem).effects.map((effect, idx) => (
                           <div key={idx}>
                               {effect.type === 'full_restore' && '完全恢復狀態'}
                               {effect.type === 'heal_hp' && `恢復氣血: ${effect.value}`}
                               {effect.type === 'heal_mp' && `恢復真元: ${effect.value}`}
                               {effect.type === 'buff_stat' && `提升${effect.stat}: +${effect.value}`}
                           </div>
                       ))}
                     </div>
                   )}
                   <div className="flex gap-2 mt-3">
                      {selectedItem.category === ItemCategory.Equipment && (
                        <button 
                          onClick={() => { dispatch(equipItem(selectedItem.id)); setSelectedItemId(null); }}
                          className="flex-1 bg-amber-700 hover:bg-amber-600 text-stone-100 py-2 rounded text-sm transition-colors"
                        >
                          裝備
                        </button>
                      )}
                      {selectedItem.category === ItemCategory.Consumable && (
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

const FilterButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded text-sm transition-all ${
        active 
          ? 'bg-stone-700 text-stone-100 shadow' 
          : 'text-stone-500 hover:text-stone-300'
      }`}
    >
      {label}
    </button>
);

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

const getQualityColor = (quality: ItemQuality) => {
  switch(quality) {
    case ItemQuality.Low: return 'text-stone-300';
    case ItemQuality.Medium: return 'text-emerald-400';
    case ItemQuality.High: return 'text-blue-400';
    case ItemQuality.Immortal: return 'text-amber-400';
    default: return 'text-stone-300';
  }
};

const getCategoryName = (category: ItemCategory) => {
  switch(category) {
    case ItemCategory.Equipment: return '裝備';
    case ItemCategory.Consumable: return '消耗品';
    case ItemCategory.Material: return '材料';
    case ItemCategory.SkillBook: return '功法';
    case ItemCategory.Breakthrough: return '突破';
    default: return '物品';
  }
};