import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { ITEMS } from '../data/items';
import { equipItem, unequipItem } from '../store/slices/inventorySlice';
import { Package, Shield, Sword, FlaskConical, CircleDashed, Footprints, Crown, MinusCircle, Shirt, Medal } from 'lucide-react';
import { ItemCategory, ItemQuality, EquipmentSlot, ConsumableItem, InventorySlot, ItemInstance } from '../types';

export const Inventory: React.FC = () => {
  const { items, equipment } = useSelector((state: RootState) => state.inventory);
  const dispatch = useDispatch();
  
  const [filter, setFilter] = useState<'all' | ItemCategory>('all');
  const [selectedSlot, setSelectedSlot] = useState<InventorySlot | null>(null);

  const filteredItems = items.filter(slot => {
    const item = ITEMS[slot.itemId];
    if (!item) return false;
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const selectedItemDef = selectedSlot ? ITEMS[selectedSlot.itemId] : null;

  // Helper to check if an instance is equipped
  const isEquipped = (instanceId?: string) => {
      if (!instanceId) return false;
      return Object.values(equipment).includes(instanceId);
  };

  // Helper to resolve equipped instance from ID
  const getEquippedInstance = (slot: EquipmentSlot) => {
      const id = equipment[slot];
      if (!id) return null;
      return items.find(i => i.instanceId === id)?.instance || null;
  };

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-200 tracking-widest flex items-center gap-2">
          <Package className="w-6 h-6 md:w-8 md:h-8 text-amber-600" /> 行囊空間
        </h2>
        
        <div className="flex bg-stone-900 rounded-lg p-1 md:p-1.5 border border-stone-800 gap-1">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="全部" />
            <FilterButton active={filter === ItemCategory.Equipment} onClick={() => setFilter(ItemCategory.Equipment)} label="裝備" />
            <FilterButton active={filter === ItemCategory.Consumable} onClick={() => setFilter(ItemCategory.Consumable)} label="丹藥" />
            <FilterButton active={filter === ItemCategory.Material} onClick={() => setFilter(ItemCategory.Material)} label="材料" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left: Inventory Grid */}
        <div className="md:col-span-2 bg-stone-900/50 border border-stone-800 rounded-xl p-4 md:p-6 overflow-y-auto min-h-[400px]">
           <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
             {filteredItems.map((slot, idx) => {
               const item = ITEMS[slot.itemId];
               if(!item) return null;
               
               const quality = slot.instance?.quality ?? item.quality;
               const isSelected = selectedSlot === slot;
               const equipped = isEquipped(slot.instanceId);
               
               const qualityBorder = getQualityBorderColor(quality);
               const qualityText = getQualityTextColor(quality);

               return (
                 <div 
                    key={`${slot.itemId}-${idx}`}
                    onClick={() => setSelectedSlot(slot)}
                    className={`aspect-square bg-stone-900 border-2 rounded-lg p-2 md:p-3 flex flex-col items-center justify-center cursor-pointer relative group transition-all
                      ${isSelected ? 'border-amber-500 bg-stone-800' : `${qualityBorder} hover:brightness-110`}
                      ${equipped ? 'ring-2 ring-amber-500/50 ring-offset-1 ring-offset-stone-900' : ''}
                    `}
                 >
                    {/* Equipped Badge */}
                    {equipped && <span className="absolute top-1 left-1 text-[10px] md:text-xs bg-amber-700 text-stone-100 px-1 rounded z-10 font-bold shadow-sm">裝</span>}

                    {item.category === ItemCategory.Equipment && (
                        <>
                          {(item as any).slot === EquipmentSlot.Weapon && <Sword className={`w-5 h-5 md:w-8 md:h-8 ${qualityText}`} />}
                          {(item as any).slot === EquipmentSlot.Head && <Crown className={`w-5 h-5 md:w-8 md:h-8 ${qualityText}`} />}
                          {(item as any).slot === EquipmentSlot.Body && <Shirt className={`w-5 h-5 md:w-8 md:h-8 ${qualityText}`} />}
                          {(item as any).slot === EquipmentSlot.Legs && <Footprints className={`w-5 h-5 md:w-8 md:h-8 ${qualityText}`} />}
                          {(item as any).slot === EquipmentSlot.Accessory && <Medal className={`w-5 h-5 md:w-8 md:h-8 ${qualityText}`} />}
                          {(item as any).slot === EquipmentSlot.Offhand && <Shield className={`w-5 h-5 md:w-8 md:h-8 ${qualityText}`} />}
                        </>
                    )}
                    {item.category === ItemCategory.Consumable && <FlaskConical className="w-5 h-5 md:w-8 md:h-8 text-emerald-400" />}
                    {item.category === ItemCategory.Material && <CircleDashed className="w-5 h-5 md:w-8 md:h-8 text-stone-600" />}
                    {![ItemCategory.Equipment, ItemCategory.Consumable, ItemCategory.Material].includes(item.category) && <Package className="w-5 h-5 md:w-8 md:h-8 text-stone-600"/>}
                    
                    <span className={`text-[10px] md:text-sm font-medium mt-1 md:mt-2 text-center line-clamp-1 w-full ${qualityText}`}>{item.name}{slot.instance ? (slot.instance.quality >= 2 ? '+' : '') : ''}</span>
                    <span className="absolute top-1 right-1 bg-stone-950 text-stone-500 text-[9px] md:text-xs px-1 rounded">{slot.count}</span>
                 </div>
               );
             })}
             {filteredItems.length === 0 && (
               <div className="col-span-full text-center text-stone-600 py-10 italic md:text-lg">
                 行囊空空如也...
               </div>
             )}
           </div>
        </div>

        {/* Right: Equipment & Details */}
        <div className="flex flex-col gap-4 overflow-y-auto">
           {/* Equipment Slots */}
           <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shrink-0">
             <h3 className="text-stone-400 text-sm md:text-base mb-3 font-bold border-b border-stone-800 pb-2 flex justify-between tracking-wider">
                <span>當前裝備</span>
             </h3>
             <div className="grid grid-cols-2 gap-2 md:gap-3">
               <EquipSlot 
                 label="武器" icon={Sword} 
                 instance={getEquippedInstance(EquipmentSlot.Weapon)} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Weapon))}
               />
               <EquipSlot 
                 label="副手" icon={Shield} 
                 instance={getEquippedInstance(EquipmentSlot.Offhand)} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Offhand))}
               />
               <EquipSlot 
                 label="頭部" icon={Crown} 
                 instance={getEquippedInstance(EquipmentSlot.Head)} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Head))}
               />
               <EquipSlot 
                 label="身軀" icon={Shirt} 
                 instance={getEquippedInstance(EquipmentSlot.Body)} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Body))}
               />
               <EquipSlot 
                 label="腿部" icon={Footprints} 
                 instance={getEquippedInstance(EquipmentSlot.Legs)} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Legs))}
               />
               <EquipSlot 
                 label="飾品" icon={Medal} 
                 instance={getEquippedInstance(EquipmentSlot.Accessory)} 
                 onUnequip={() => dispatch(unequipItem(EquipmentSlot.Accessory))}
               />
             </div>
           </div>

           {/* Selected Item Detail */}
           {selectedSlot && selectedItemDef ? (
             <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex flex-col">
                        <h3 className={`text-lg font-bold ${getQualityTextColor(selectedSlot.instance?.quality ?? selectedItemDef.quality)}`}>
                            {selectedItemDef.name}
                        </h3>
                        {selectedSlot.instance && (
                            <span className="text-xs text-stone-500">
                                {getQualityName(selectedSlot.instance.quality)}
                            </span>
                        )}
                   </div>
                   <span className="text-xs bg-stone-800 px-2 py-1 rounded text-stone-400">{getCategoryName(selectedItemDef.category)}</span>
                </div>
                
                <p className="text-sm text-stone-500 italic mb-4">{selectedItemDef.description}</p>
                
                {/* Stats & Affixes */}
                {selectedSlot.instance && (
                    <div className="space-y-3 mb-4 bg-stone-950/30 p-2 rounded">
                        {/* Base Stats */}
                        {Object.keys(selectedSlot.instance.stats).length > 0 && (
                             <div className="text-sm text-stone-300">
                                <div className="text-xs text-stone-500 mb-1">基礎屬性</div>
                                {Object.entries(selectedSlot.instance.stats).map(([key, val]) => (
                                    <div key={key} className="flex justify-between">
                                        <span>{getAttributeName(key)}</span>
                                        <span className="font-mono text-amber-500">+{val}</span>
                                    </div>
                                ))}
                             </div>
                        )}
                        {/* Affixes */}
                        {selectedSlot.instance.affixes && selectedSlot.instance.affixes.length > 0 && (
                            <div className="text-sm">
                                <div className="text-xs text-stone-500 mb-1">附加詞條</div>
                                {selectedSlot.instance.affixes.map((affix, i) => (
                                    <div key={i} className="text-amber-400/90 text-xs py-0.5">
                                        • {affix.description}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t border-stone-800 pt-3 mt-auto space-y-2">
                   {/* Consumable Effects */}
                   {selectedItemDef.category === ItemCategory.Consumable && (selectedItemDef as ConsumableItem).effects && (
                     <div className="text-xs text-stone-400 space-y-1">
                       {(selectedItemDef as ConsumableItem).effects.map((effect, idx) => (
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
                      {selectedItemDef.category === ItemCategory.Equipment && selectedSlot.instance && (
                        <button 
                          onClick={() => { 
                                if(selectedSlot.instanceId) {
                                    const alreadyEquipped = isEquipped(selectedSlot.instanceId);
                                    if (alreadyEquipped) {
                                         const slotKey = (Object.keys(equipment) as EquipmentSlot[]).find(key => equipment[key] === selectedSlot.instanceId);
                                         if (slotKey) dispatch(unequipItem(slotKey));
                                    } else {
                                        dispatch(equipItem(selectedSlot.instanceId)); 
                                    }
                                }
                          }}
                          className={`flex-1 ${isEquipped(selectedSlot.instanceId) ? 'bg-red-900/80 hover:bg-red-800' : 'bg-amber-700 hover:bg-amber-600'} text-stone-100 py-2 rounded text-sm transition-colors`}
                        >
                          {isEquipped(selectedSlot.instanceId) ? '卸下' : '裝備'}
                        </button>
                      )}
                      
                      {selectedItemDef.category === ItemCategory.Consumable && (
                        <button 
                          className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-stone-100 py-2 rounded text-sm transition-colors"
                          onClick={() => alert("使用功能即將開放!")}
                        >
                          服用
                        </button>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-stone-900/30 border border-stone-800 border-dashed rounded-xl p-4 flex-1 flex items-center justify-center text-stone-600 text-sm min-h-[200px]">
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

const EquipSlot = ({ label, icon: Icon, instance, onUnequip }: { label: string, icon: any, instance: ItemInstance | null, onUnequip: () => void }) => {
  const item = instance ? ITEMS[instance.templateId] : null;

  return (
    <div className="flex items-center gap-2 p-2 md:p-3 bg-stone-900/80 rounded border border-stone-800 relative group h-full transition-colors hover:border-stone-700">
       <div className={`p-1.5 md:p-2.5 rounded border ${instance ? 'border-amber-900/50 bg-amber-950/20' : 'border-stone-800 bg-stone-950'} text-stone-500`}>
         <Icon className={`w-4 h-4 md:w-6 md:h-6 ${instance ? getQualityTextColor(instance.quality) : ''}`} />
       </div>
       <div className="flex-1 min-w-0 flex flex-col justify-center">
         <div className="text-[10px] md:text-xs text-stone-500 font-bold uppercase tracking-wider leading-none mb-0.5">{label}</div>
         <div className={`text-xs md:text-base font-bold truncate ${item ? getQualityTextColor(instance!.quality) : 'text-stone-600 italic'}`}>
           {item ? item.name : '未裝備'}
         </div>
       </div>
       {item && (
         <button onClick={onUnequip} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-900/90 text-red-100 text-[10px] md:text-xs px-2 py-1 rounded shadow-lg transition-all hover:bg-red-800 z-10 flex items-center gap-1">
           <MinusCircle className="w-3 h-3 md:w-4 md:h-4" /> 卸下
         </button>
       )}
    </div>
  );
};

// Utilities
const getQualityBorderColor = (quality: ItemQuality) => {
  switch(quality) {
    case ItemQuality.Low: return 'border-stone-700';
    case ItemQuality.Medium: return 'border-emerald-800/60 bg-emerald-950/10';
    case ItemQuality.High: return 'border-blue-800/60 bg-blue-950/10';
    case ItemQuality.Immortal: return 'border-amber-600/60 bg-amber-950/20';
    default: return 'border-stone-800';
  }
};

const getQualityTextColor = (quality: ItemQuality) => {
  switch(quality) {
    case ItemQuality.Low: return 'text-stone-400';
    case ItemQuality.Medium: return 'text-emerald-400';
    case ItemQuality.High: return 'text-blue-400';
    case ItemQuality.Immortal: return 'text-amber-400';
    default: return 'text-stone-500';
  }
};

const getQualityName = (quality: ItemQuality) => {
    switch(quality) {
        case ItemQuality.Low: return '下品';
        case ItemQuality.Medium: return '中品';
        case ItemQuality.High: return '上品';
        case ItemQuality.Immortal: return '仙品';
        default: return '';
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

const getAttributeName = (key: string) => {
    switch(key) {
        case 'attack': return '攻擊';
        case 'defense': return '防禦';
        case 'hp': return '氣血';
        case 'maxHp': return '氣血上限';
        case 'speed': return '速度';
        case 'crit': return '暴擊';
        default: return key;
    }
}