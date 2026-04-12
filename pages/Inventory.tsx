import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { ITEMS } from '../data/items';
import { equipItem, unequipItem, sortItems, removeItems, removeItem } from '../store/slices/inventorySlice';
import { consumeItem } from '../store/slices/characterSlice';
import { addLog } from '../store/slices/logSlice';
import { Package, Shield, Sword, FlaskConical, CircleDashed, Footprints, Crown, MinusCircle, Shirt, Medal, ArrowUpDown, Trash2, LayoutGrid, CheckSquare, Plus, Minus, AlertTriangle } from 'lucide-react';
import { ItemCategory, ItemQuality, EquipmentSlot, ConsumableItem, InventorySlot, ItemInstance, Skill } from '../types';
import { REALM_NAMES } from '../constants';
import { Modal } from '../components/Modal';
import clsx from 'clsx';
import { getFormalSkill, getSkill } from '../data/skills';
import { getMissingPrerequisiteSkillIds, resolveReplacementSkillId } from '../data/skills/pool';
import { getSkillManualCategoryLabel, getSkillManualSourceLabels, getSkillManualTierLabel } from '../data/items/manuals';
import { GameHintBubble } from '../components/game/GameHintBubble';
import { GameTooltip } from '../components/game/GameTooltip';

interface InventoryProps {
  embedded?: boolean;
}

export const Inventory: React.FC<InventoryProps> = ({ embedded = false }) => {
  const { items, equipment } = useSelector((state: RootState) => state.inventory);
  const character = useSelector((state: RootState) => state.character);
  const dispatch = useDispatch();
  
  const [filter, setFilter] = useState<'all' | ItemCategory>('all');
  const [selectedSlot, setSelectedSlot] = useState<InventorySlot | null>(null);
  
  // Batch Management State
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());

  // Quantity Delete State
  const [itemToDelete, setItemToDelete] = useState<{
      itemId: string;
      name: string;
      count: number;
      max: number;
      quality: ItemQuality;
  } | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message: React.ReactNode;
      onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [hoveredItem, setHoveredItem] = useState<{
    slot: InventorySlot;
    x: number;
    y: number;
  } | null>(null);

  const filteredItems = items.filter(slot => {
    const item = ITEMS[slot.itemId];
    if (!item) return false;
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const selectedItemDef = selectedSlot ? ITEMS[selectedSlot.itemId] : null;
  const selectedConsumable =
    selectedItemDef?.category === ItemCategory.Consumable
      ? (selectedItemDef as ConsumableItem)
      : null;
  const selectedSkillEffect = selectedConsumable?.effects.find(
    (effect) => effect.type === 'learn_skill' && effect.skillId
  );
  const selectedSkill = selectedSkillEffect?.skillId
    ? getFormalSkill(selectedSkillEffect.skillId)
    : null;

  const getConsumableBlockedReason = (item: ConsumableItem) => {
    const manualEffect = item.effects.find(
      (effect) => effect.type === 'learn_skill' && effect.skillId
    );

    if (!manualEffect?.skillId) {
      return null;
    }

    const normalizedSkillId = resolveReplacementSkillId(manualEffect.skillId);
    const skill = getFormalSkill(normalizedSkillId);
    if (!skill) {
      return '技能資料缺失';
    }
    if (character.skills.includes(skill.id)) {
      return '已習得此技能';
    }
    if (item.requiredProfession && character.profession !== item.requiredProfession) {
      return '職業不符';
    }
    if (
      item.requiredRealm !== undefined &&
      character.majorRealm < item.requiredRealm
    ) {
      return `需達${REALM_NAMES[item.requiredRealm]}期`;
    }
    const missingPrerequisites = getMissingPrerequisiteSkillIds(character.skills, skill.id);
    if (missingPrerequisites.length > 0) {
      return `缺少前置：${missingPrerequisites
        .map((prerequisiteSkillId) => getSkill(prerequisiteSkillId)?.name ?? prerequisiteSkillId)
        .join('、')}`;
    }
    return null;
  };

  const selectedConsumableBlockedReason = selectedConsumable
    ? getConsumableBlockedReason(selectedConsumable)
    : null;

  const hoveredItemDef = hoveredItem ? ITEMS[hoveredItem.slot.itemId] : null;
  const hoveredSkillEffect =
    hoveredItemDef?.category === ItemCategory.Consumable
      ? (hoveredItemDef as ConsumableItem).effects.find(
          (effect) => effect.type === 'learn_skill' && effect.skillId
        )
      : null;
  const hoveredSkill = hoveredSkillEffect?.skillId
    ? getFormalSkill(hoveredSkillEffect.skillId)
    : null;

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

  const managementActions = (
    <div className="flex gap-2">
      <div className="relative group">
        <button 
            onClick={() => dispatch(sortItems())}
            className="p-2 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-500 hover:border-amber-900 transition-colors"
        >
            <ArrowUpDown size={18} />
        </button>
        <GameHintBubble className="bottom-full left-1/2 mb-2 -translate-x-1/2">
          整理
        </GameHintBubble>
      </div>
      <div className="relative group">
        <button 
            onClick={() => {
                setIsDeleteMode(!isDeleteMode);
                setSelectedForDelete(new Set());
                setSelectedSlot(null);
            }}
            className={clsx(
                "p-2 rounded border transition-all flex items-center gap-2 text-sm font-bold",
                isDeleteMode 
                    ? "bg-red-900/50 border-red-500 text-red-200 animate-pulse" 
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
            )}
        >
            {isDeleteMode ? <CheckSquare size={18} /> : <Trash2 size={18} />}
            {isDeleteMode && <span className="hidden md:inline">選擇模式</span>}
        </button>
        <GameHintBubble className="bottom-full left-1/2 mb-2 -translate-x-1/2">
          批量管理
        </GameHintBubble>
      </div>
    </div>
  );

  const filterTabs = (
    <div className="flex bg-stone-900 rounded-lg p-1 md:p-1.5 border border-stone-800 gap-1 overflow-x-auto max-w-full">
      <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="全部" />
      <FilterButton active={filter === ItemCategory.Equipment} onClick={() => setFilter(ItemCategory.Equipment)} label="裝備" />
      <FilterButton active={filter === ItemCategory.Consumable} onClick={() => setFilter(ItemCategory.Consumable)} label="丹藥" />
      <FilterButton active={filter === ItemCategory.Material} onClick={() => setFilter(ItemCategory.Material)} label="材料" />
    </div>
  );

  const equipmentSection = (
    <div className={clsx("shrink-0 p-4", embedded ? "border-t border-stone-800/80" : "bg-stone-900 border border-stone-800 rounded-xl")}>
      <h3 className="text-stone-400 text-sm md:text-base mb-3 font-bold border-b border-stone-800 pb-2 flex justify-between tracking-wider">
         <span>當前裝備</span>
      </h3>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <EquipSlot 
          label="武器" icon={Sword} 
          instance={getEquippedInstance(EquipmentSlot.Weapon)} 
          onUnequip={() => dispatch(unequipItem(EquipmentSlot.Weapon))}
          onClick={() => {
             const id = equipment[EquipmentSlot.Weapon];
             const slot = items.find(s => s.instanceId === id);
             if (slot) setSelectedSlot(slot);
          }}
        />
        <EquipSlot 
          label="副手" icon={Shield} 
          instance={getEquippedInstance(EquipmentSlot.Offhand)} 
          onUnequip={() => dispatch(unequipItem(EquipmentSlot.Offhand))}
          onClick={() => {
             const id = equipment[EquipmentSlot.Offhand];
             const slot = items.find(s => s.instanceId === id);
             if (slot) setSelectedSlot(slot);
          }}
        />
        <EquipSlot 
          label="頭部" icon={Crown} 
          instance={getEquippedInstance(EquipmentSlot.Head)} 
          onUnequip={() => dispatch(unequipItem(EquipmentSlot.Head))}
          onClick={() => {
             const id = equipment[EquipmentSlot.Head];
             const slot = items.find(s => s.instanceId === id);
             if (slot) setSelectedSlot(slot);
          }}
        />
        <EquipSlot 
          label="身軀" icon={Shirt} 
          instance={getEquippedInstance(EquipmentSlot.Body)} 
          onUnequip={() => dispatch(unequipItem(EquipmentSlot.Body))}
          onClick={() => {
             const id = equipment[EquipmentSlot.Body];
             const slot = items.find(s => s.instanceId === id);
             if (slot) setSelectedSlot(slot);
          }}
        />
        <EquipSlot 
          label="腿部" icon={Footprints} 
          instance={getEquippedInstance(EquipmentSlot.Legs)} 
          onUnequip={() => dispatch(unequipItem(EquipmentSlot.Legs))}
          onClick={() => {
             const id = equipment[EquipmentSlot.Legs];
             const slot = items.find(s => s.instanceId === id);
             if (slot) setSelectedSlot(slot);
          }}
        />
        <EquipSlot 
          label="飾品" icon={Medal} 
          instance={getEquippedInstance(EquipmentSlot.Accessory)} 
          onUnequip={() => dispatch(unequipItem(EquipmentSlot.Accessory))}
          onClick={() => {
             const id = equipment[EquipmentSlot.Accessory];
             const slot = items.find(s => s.instanceId === id);
             if (slot) setSelectedSlot(slot);
          }}
        />
      </div>
    </div>
  );

  const handleUseSelectedItem = () => {
    if (!selectedSlot || !selectedItemDef || selectedItemDef.category !== ItemCategory.Consumable) {
      return;
    }

    const consumable = selectedItemDef as ConsumableItem;
    const blockedReason = getConsumableBlockedReason(consumable);
    if (blockedReason) {
      dispatch(addLog({
        message: `[${consumable.name}] 無法使用：${blockedReason}。`,
        type: 'warning-low',
      }));
      return;
    }

    dispatch(
      consumeItem({
        itemId: consumable.id,
        effects: consumable.effects,
        maxConsumption: consumable.maxUsage,
      })
    );
    dispatch(
      removeItem({
        itemId: selectedSlot.itemId,
        count: 1,
        instanceId: selectedSlot.instanceId,
      })
    );

    if (selectedSkill) {
      dispatch(
        addLog({
          message: `你參悟了【${selectedSkill.name}】。`,
          type: 'success',
        })
      );
    } else {
      dispatch(
        addLog({
          message: `你使用了 [${consumable.name}]。`,
          type: 'gain',
        })
      );
    }

    if (!selectedSlot.instanceId && selectedSlot.count <= 1) {
      setSelectedSlot(null);
    }
  };

  return (
    <div
      className={clsx(
        "flex h-full min-h-0 flex-col",
        embedded
          ? "gap-5 overflow-hidden p-5 md:p-6"
          : "gap-6 overflow-y-auto p-6 md:overflow-hidden"
      )}
    >
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-200 tracking-widest flex items-center gap-2 shrink-0">
            <Package className="w-6 h-6 md:w-8 md:h-8 text-amber-600" /> 行囊空間
          </h2>
          
          <div className="flex gap-2 md:gap-4 items-center flex-wrap">
            {managementActions}
            {filterTabs}
          </div>
        </div>
      )}

      <div
        className={clsx(
          "grid w-full min-h-0 gap-6",
          embedded
            ? "flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]"
            : "grid-cols-1 md:flex-1 md:grid-cols-3 md:overflow-hidden"
        )}
      >
        {/* Left: Inventory Grid */}
        <div
          className={clsx(
            "min-h-[400px] overflow-y-auto rounded-xl border border-stone-800 bg-stone-900/50 p-4 md:p-6",
            embedded ? "order-2 min-h-0" : "md:col-span-2"
          )}
        >
           {embedded && (
             <div className="mb-4 flex flex-col gap-3 border-b border-stone-800 pb-4 md:flex-row md:items-center md:justify-between">
               <div className="flex items-center gap-2 text-stone-400">
                 <Package className="h-5 w-5 text-amber-500" />
                 <span className="text-sm font-bold tracking-[0.2em] text-stone-300">物品整備</span>
               </div>
               <div className="flex flex-wrap items-center gap-2 md:gap-3">
                 {managementActions}
                 {filterTabs}
               </div>
             </div>
           )}
           <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
             {filteredItems.map((slot, idx) => {
               const item = ITEMS[slot.itemId];
               if(!item) return null;
               
               const quality = slot.instance?.quality ?? item.quality;
               const isSelected = selectedSlot === slot;
               const equipped = isEquipped(slot.instanceId);
               
               const qualityBorder = getQualityBorderColor(quality);
               const qualityText = getQualityTextColor(quality);

               // Delete Mode Logic
               // Key is instanceId if available, else itemId
               const deleteKey = slot.instanceId || slot.itemId;
               const isMarkedForDelete = selectedForDelete.has(deleteKey);
               const canDelete = !equipped; // Cannot delete equipped items

               return (
                 <div 
                    key={`${slot.itemId}-${idx}`}
                    onClick={() => {
                        if (isDeleteMode) {
                            if (!canDelete) return; 
                            
                            const key = slot.instanceId || slot.itemId;
                            const newSet = new Set(selectedForDelete);
                            if (newSet.has(key)) newSet.delete(key);
                            else newSet.add(key);
                            setSelectedForDelete(newSet);
                        } else {
                            setSelectedSlot(slot);
                        }
                    }}
                    onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHoveredItem({
                          slot,
                          x: Math.min(rect.right + 16, window.innerWidth - 304),
                          y: Math.max(16, rect.top),
                        });
                    }}
                    onMouseLeave={() => {
                        setHoveredItem((current) =>
                          current?.slot === slot ? null : current
                        );
                    }}
                    className={clsx(
                        "aspect-square border-2 rounded-lg p-2 md:p-3 flex flex-col items-center justify-center relative group transition-all",
                        isDeleteMode 
                            ? (isMarkedForDelete 
                                ? "bg-red-900/20 border-red-500" 
                                : (canDelete ? "bg-stone-900 cursor-pointer border-stone-800 hover:border-red-500/50" : "bg-stone-950/50 border-stone-900 opacity-50 cursor-not-allowed"))
                            : (isSelected ? 'border-amber-500 bg-stone-800 cursor-pointer' : `${qualityBorder} bg-stone-900 cursor-pointer hover:brightness-110`),
                        equipped && !isDeleteMode ? 'ring-2 ring-amber-500/50 ring-offset-1 ring-offset-stone-900' : ''
                    )}
                 >
                    {/* Delete Mode Checkbox */}
                    {isDeleteMode && canDelete && (
                        <div className={clsx(
                            "absolute top-2 left-2 w-4 h-4 rounded border flex items-center justify-center z-20",
                            isMarkedForDelete ? "bg-red-600 border-red-600 text-white" : "border-stone-600 bg-black/50"
                        )}>
                            {isMarkedForDelete && <CheckSquare size={10} />}
                        </div>
                    )}

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
                    {item.category !== ItemCategory.Equipment && (
                        <span className="absolute top-1 right-1 bg-stone-950 text-stone-500 text-[9px] md:text-xs px-1 rounded">{slot.count}</span>
                    )}
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
        <div
          className={clsx(
            "flex min-h-0 flex-col overflow-y-auto xl:overflow-hidden",
            embedded
              ? "order-1 rounded-[24px] border border-stone-800/90 bg-stone-950/32"
              : "gap-4"
          )}
        >
           {embedded && (
             <div className="border-b border-stone-800/80 px-4 py-3">
               <div className="text-xs font-bold tracking-[0.28em] text-stone-500">裝備與鑑別</div>
             </div>
           )}

           {!embedded && equipmentSection}

           {/* Selected Item Detail / Delete Confirmation */}
           {isDeleteMode ? (
                <div className={clsx(
                  "flex-1 min-h-[300px] p-6 flex flex-col items-center justify-center text-center gap-4",
                  embedded
                    ? "bg-gradient-to-b from-red-950/20 to-transparent"
                    : "bg-gradient-to-b from-red-950/20 to-stone-900 border border-red-900/30 rounded-xl"
                )}>
                    <Trash2 size={48} className="text-red-500/50 mb-2" />
                    <h3 className="text-xl font-bold text-red-200">批量丟棄模式</h3>
                    <p className="text-stone-400 text-sm max-w-[200px]">
                        已選擇 <span className="text-red-400 font-bold text-lg">{selectedForDelete.size}</span> 個物品
                    </p>
                    
                    {/* Quick Select Buttons */}
                    <div className="flex flex-col gap-2 w-full px-4">
                        <div className="text-xs text-stone-500 font-bold border-b border-stone-800 pb-1 mb-1">
                            快速選擇 ({filter === 'all' ? '全部類別' : getCategoryName(filter)})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <button
                                onClick={() => {
                                    const toSelect = filteredItems
                                        .filter(slot => !isEquipped(slot.instanceId) && (slot.instance?.quality === ItemQuality.Low || (!slot.instance && ITEMS[slot.itemId]?.quality === ItemQuality.Low)))
                                        .map(slot => slot.instanceId || slot.itemId);
                                    
                                    const newSet = new Set(selectedForDelete);
                                    toSelect.forEach(id => newSet.add(id));
                                    setSelectedForDelete(newSet);
                                }}
                                className="text-xs py-1.5 rounded bg-stone-900 border border-stone-700 hover:border-stone-500 text-stone-400"
                             >
                                 全選凡品 (下)
                             </button>
                             <button
                                onClick={() => {
                                    const toSelect = filteredItems
                                        .filter(slot => !isEquipped(slot.instanceId) && (slot.instance?.quality === ItemQuality.Medium || (!slot.instance && ITEMS[slot.itemId]?.quality === ItemQuality.Medium)))
                                        .map(slot => slot.instanceId || slot.itemId);
                                    
                                    const newSet = new Set(selectedForDelete);
                                    toSelect.forEach(id => newSet.add(id));
                                    setSelectedForDelete(newSet);
                                }}
                                className="text-xs py-1.5 rounded bg-emerald-950/30 border border-emerald-900 hover:border-emerald-500 text-emerald-600 hover:text-emerald-400"
                             >
                                 全選靈品 (中)
                             </button>
                             <button
                                onClick={() => {
                                    const toSelect = filteredItems
                                        .filter(slot => !isEquipped(slot.instanceId) && (slot.instance?.quality === ItemQuality.High || (!slot.instance && ITEMS[slot.itemId]?.quality === ItemQuality.High)))
                                        .map(slot => slot.instanceId || slot.itemId);
                                    
                                    const newSet = new Set(selectedForDelete);
                                    toSelect.forEach(id => newSet.add(id));
                                    setSelectedForDelete(newSet);
                                }}
                                className="text-xs py-1.5 rounded bg-blue-950/30 border border-blue-900 hover:border-blue-500 text-blue-500 hover:text-blue-400"
                             >
                                 全選仙品 (上)
                             </button>
                             <button
                                onClick={() => {
                                    // Select ALL visible
                                    const toSelect = filteredItems
                                        .filter(slot => !isEquipped(slot.instanceId))
                                        .map(slot => slot.instanceId || slot.itemId);
                                    
                                    const newSet = new Set(selectedForDelete);
                                    toSelect.forEach(id => newSet.add(id));
                                    setSelectedForDelete(newSet);
                                }}
                                className="text-xs py-1.5 rounded bg-red-950/30 border border-red-900 hover:border-red-500 text-red-500 hover:text-red-400"
                             >
                                 全選當前頁
                             </button>
                        </div>
                    </div>
                    <button 
                        disabled={selectedForDelete.size === 0}
                        onClick={() => {
                            setConfirmModal({
                                isOpen: true,
                                title: '批量丟棄確認',
                                message: `確定要丟棄已選中的 ${selectedForDelete.size} 個物品嗎？此操作無法復原！`,
                                onConfirm: () => {
                                    dispatch(removeItems(Array.from(selectedForDelete)));
                                    setSelectedForDelete(new Set());
                                    setIsDeleteMode(false);
                                }
                            });
                        }}
                        className="bg-red-700 hover:bg-red-600 disabled:bg-stone-800 disabled:text-stone-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 mt-4"
                    >
                         確認丟棄
                    </button>
                    <button 
                        onClick={() => {
                            setIsDeleteMode(false);
                            setSelectedForDelete(new Set());
                        }}
                        className="text-stone-500 hover:text-stone-300 text-xs underline"
                    >
                        取消
                    </button>
                </div>
           ) : (
               selectedSlot && selectedItemDef ? (
                 <div className={clsx(
                   "flex-1 min-h-[300px] p-4 flex flex-col",
                   embedded ? "" : "bg-stone-900 border border-stone-800 rounded-xl"
                 )}>
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex flex-col">
                            <h3 className={`text-lg font-bold ${getQualityTextColor(selectedSlot.instance?.quality ?? selectedItemDef.quality)}`}>
                                {selectedItemDef.name}
                                {selectedItemDef.minRealm !== undefined && (
                                    <span className="text-xs text-amber-500 font-mono ml-2">
                                        [{REALM_NAMES[selectedItemDef.minRealm]}期]
                                    </span>
                                )}
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

                    {selectedSkill && (
                      <div className="mb-4 space-y-2 rounded-lg border border-indigo-900/40 bg-indigo-950/10 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-indigo-700/60 bg-indigo-950/40 px-2 py-1 text-[11px] font-bold tracking-[0.18em] text-indigo-200">
                            技能書
                          </span>
                          <span className="rounded-full border border-amber-700/50 bg-amber-950/30 px-2 py-1 text-[11px] font-bold text-amber-300">
                            {getSkillManualTierLabel(selectedSkill)}
                          </span>
                          <span className="rounded-full border border-stone-700 bg-stone-950/40 px-2 py-1 text-[11px] font-bold text-stone-300">
                            {selectedSkill.type === 'Active' ? '主動術式' : '被動心法'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400">
                          分類：<span className="text-stone-200">{getSkillManualCategoryLabel(selectedSkill)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getSkillManualSourceLabels(selectedSkill).map((source) => (
                            <span
                              key={source}
                              className="rounded-md border border-emerald-900/60 bg-emerald-950/20 px-2 py-1 text-[11px] text-emerald-300"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Stats & Affixes */}
                    {selectedSlot.instance && (
                        <div className="space-y-3 mb-4 bg-stone-950/30 p-2 rounded">
                            {/* Base Stats */}
                            {Object.keys(selectedSlot.instance.stats).length > 0 && (
                                 <div className="text-sm text-stone-300">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-xs text-stone-500">基礎屬性</div>
                                        {/* Comparison Header */}
                                        {(() => {
                                            if (selectedItemDef.category !== ItemCategory.Equipment) return null;
                                            if (isEquipped(selectedSlot.instanceId)) return null;
                                            
                                            // Find equipped item for comparison
                                            const equipSlot = (selectedItemDef as any).slot as EquipmentSlot;
                                            const equippedInstanceId = equipment[equipSlot];
                                            if (!equippedInstanceId) return null;
                                            const equippedItem = items.find(i => i.instanceId === equippedInstanceId);
                                            if (!equippedItem) return null;

                                            return (
                                                <div className="text-xs text-stone-600">
                                                    比較: <span className="text-stone-400">{ITEMS[equippedItem.itemId].name}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {Object.entries(selectedSlot.instance.stats).map(([key, val]) => {
                                        // Calculate Diff
                                        let diff = null;
                                        if (selectedItemDef.category === ItemCategory.Equipment && !isEquipped(selectedSlot.instanceId)) {
                                            const equipSlot = (selectedItemDef as any).slot as EquipmentSlot;
                                            const equippedInstanceId = equipment[equipSlot];
                                            if (equippedInstanceId) {
                                                const equippedItem = items.find(i => i.instanceId === equippedInstanceId);
                                                if (equippedItem && equippedItem.instance?.stats) {
                                                     const eqVal = (equippedItem.instance.stats as any)[key] || 0;
                                                     diff = (val as number) - eqVal;
                                                }
                                            }
                                        }

                                        return (
                                            <div key={key} className="flex justify-between items-center">
                                                <span>{getAttributeName(key)}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-amber-500">+{val}</span>
                                                    {diff !== null && diff !== 0 && (
                                                        <span className={clsx("font-mono text-xs", diff > 0 ? "text-emerald-500" : "text-red-500")}>
                                                            ({diff > 0 ? '+' : ''}{diff})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                   {effect.type === 'gain_exp' && `直接獲得修為: ${effect.value}`}
                                   {effect.type === 'lifespan' && `增加壽元: ${effect.value}`}
                                   {effect.type === 'learn_skill' && selectedSkill && `參悟後習得：【${selectedSkill.name}】`}
                               </div>
                           ))}
                           {selectedConsumable?.requiredProfession && (
                             <div>職業限制：{selectedConsumable.requiredProfession === 'Sword' ? '劍修' : selectedConsumable.requiredProfession === 'Body' ? '體修' : '法修'}</div>
                           )}
                           {selectedConsumable?.requiredRealm !== undefined && (
                             <div>境界限制：{REALM_NAMES[selectedConsumable.requiredRealm]}期以上</div>
                           )}
                           {selectedSkill && selectedSkill.prerequisiteSkillIds && selectedSkill.prerequisiteSkillIds.length > 0 && (
                             <div>
                               前置條件：
                               {selectedSkill.prerequisiteSkillIds
                                 .map((prerequisiteSkillId) => getSkill(prerequisiteSkillId)?.name ?? prerequisiteSkillId)
                                 .join('、')}
                             </div>
                           )}
                           {selectedConsumableBlockedReason && (
                             <div className="text-red-400">目前無法使用：{selectedConsumableBlockedReason}</div>
                           )}
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
                          className={clsx(
                            "flex-1 py-2 rounded text-sm transition-colors",
                            selectedConsumableBlockedReason
                              ? "bg-stone-800 text-stone-500 cursor-not-allowed"
                              : "bg-emerald-700 hover:bg-emerald-600 text-stone-100"
                          )}
                          disabled={Boolean(selectedConsumableBlockedReason)}
                          onClick={handleUseSelectedItem}
                        >
                          {selectedSkill ? '參悟' : '服用'}
                        </button>
                      )}

                      {/* Single Item Delete Button */}
                      {(selectedSlot.instanceId || selectedSlot.itemId) && (
                          <div className="relative group">
                            <button 
                               disabled={selectedSlot.instanceId ? isEquipped(selectedSlot.instanceId) : false}
                               onClick={() => {
                                   // Stackable Item (No instanceId)
                                   if (!selectedSlot.instanceId && selectedSlot.itemId) {
                                       setItemToDelete({
                                           itemId: selectedSlot.itemId,
                                           name: selectedItemDef.name,
                                           count: selectedSlot.count, // Default to Max
                                           max: selectedSlot.count,
                                           quality: ITEMS[selectedSlot.itemId].quality
                                       });
                                       return;
                                   }

                                   // Instance Item (Existing Logic)
                                   const idToDelete = selectedSlot.instanceId;
                                   if (idToDelete && !isEquipped(idToDelete)) {
                                       setConfirmModal({
                                           isOpen: true,
                                           title: '丟棄確認',
                                           message: (
                                               <span>確定要丟棄 <span className={getQualityTextColor(selectedSlot.instance?.quality ?? selectedItemDef.quality)}>{selectedItemDef.name}</span> 嗎？此操作無法復原！</span>
                                           ),
                                           onConfirm: () => {
                                               dispatch(removeItems([idToDelete]));
                                               setSelectedSlot(null);
                                           }
                                       });
                                   }
                               }}
                               className={clsx(
                                   "p-2 rounded border transition-all flex-none",
                                   (selectedSlot.instanceId && isEquipped(selectedSlot.instanceId))
                                       ? "bg-stone-900 border-stone-800 text-stone-600 cursor-not-allowed"
                                       : "bg-red-950/30 border-red-900/50 text-red-500 hover:bg-red-900/80 hover:text-red-200"
                               )}
                            >
                               <Trash2 size={18} />
                            </button>
                            <GameHintBubble className="bottom-full left-1/2 mb-2 -translate-x-1/2">
                              {selectedSlot.instanceId && isEquipped(selectedSlot.instanceId)
                                ? '裝備中不可丟棄'
                                : '丟棄'}
                            </GameHintBubble>
                          </div>
                      )}
                   </div>
                </div>
             </div>
               ) : (
                    <div className={clsx(
                      "p-4 flex-1 min-h-[300px] flex flex-col items-center justify-center text-stone-600",
                      embedded ? "" : "bg-stone-900/50 border border-stone-800 rounded-xl"
                    )}>
                         <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mb-4">
                             <LayoutGrid size={32} />
                         </div>
                         <p>選擇一個物品查看詳情</p>
                    </div>
                )
            )}

            {embedded && equipmentSection}
        </div>
      </div>

      {hoveredItem && hoveredItemDef && (
        <GameTooltip
          eyebrow={getInventoryTooltipEyebrow(hoveredItemDef, hoveredSkill)}
          title={hoveredItemDef.name}
          titleClassName={getQualityTextColor(
            hoveredItem.slot.instance?.quality ?? hoveredItemDef.quality
          )}
          footer={getInventoryTooltipFooter(hoveredItemDef, hoveredItem.slot)}
          widthClassName="w-72"
          className="animate-in fade-in duration-150 zoom-in-95"
          style={{ left: hoveredItem.x, top: hoveredItem.y }}
        >
          <p className="text-sm text-stone-400 italic">{hoveredItemDef.description}</p>

          {hoveredSkill && (
            <div className="space-y-2 rounded-xl border border-indigo-900/50 bg-indigo-950/15 p-3">
              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full border border-indigo-700/60 bg-indigo-950/40 px-2 py-1 text-indigo-200">
                  {hoveredSkill.type === 'Active' ? '主動術式' : '被動心法'}
                </span>
                <span className="rounded-full border border-amber-700/50 bg-amber-950/30 px-2 py-1 text-amber-300">
                  {getSkillManualTierLabel(hoveredSkill)}
                </span>
              </div>
              <div className="text-xs text-stone-300">
                分類：<span className="text-stone-100">{getSkillManualCategoryLabel(hoveredSkill)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getSkillManualSourceLabels(hoveredSkill).map((source) => (
                  <span
                    key={source}
                    className="rounded-md border border-emerald-900/60 bg-emerald-950/20 px-2 py-1 text-[11px] text-emerald-300"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hoveredItem.slot.instance && Object.keys(hoveredItem.slot.instance.stats).length > 0 && (
            <div className="space-y-1 rounded-xl border border-stone-800/90 bg-black/20 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">基礎屬性</div>
              {Object.entries(hoveredItem.slot.instance.stats).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs text-stone-300">
                  <span>{getAttributeName(key)}</span>
                  <span className="font-mono text-amber-400">+{value}</span>
                </div>
              ))}
            </div>
          )}

          {hoveredItem.slot.instance?.affixes && hoveredItem.slot.instance.affixes.length > 0 && (
            <div className="space-y-1 rounded-xl border border-amber-900/30 bg-amber-950/10 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">附加詞條</div>
              {hoveredItem.slot.instance.affixes.map((affix, index) => (
                <div key={`${affix.description}-${index}`} className="text-xs text-amber-300">
                  • {affix.description}
                </div>
              ))}
            </div>
          )}

          {hoveredSkill && hoveredSkill.prerequisiteSkillIds.length > 0 && (
            <div className="text-xs text-stone-400">
              前置：
              <span className="text-stone-200">
                {hoveredSkill.prerequisiteSkillIds
                  .map((prerequisiteSkillId) => getSkill(prerequisiteSkillId)?.name ?? prerequisiteSkillId)
                  .join('、')}
              </span>
            </div>
          )}
        </GameTooltip>
      )}
      
      {/* Confirm Modal (Standard) */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        eyebrow="ITEM DISPOSAL"
        icon={<AlertTriangle size={18} className="text-red-400" />}
        actions={
            <>
                <button 
                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    className="px-4 py-2 rounded border border-stone-600 text-stone-400 hover:text-stone-200"
                >
                    取消
                </button>
                <button 
                    onClick={() => {
                        confirmModal.onConfirm();
                        setConfirmModal({ ...confirmModal, isOpen: false });
                    }}
                    className="px-4 py-2 rounded bg-red-800 text-stone-100 hover:bg-red-700"
                >
                    確認
                </button>
            </>
        }
      >
        <div className="p-4 text-center">
            {confirmModal.message}
        </div>
      </Modal>

      {/* Partial Delete Modal (Quantity) */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="丟棄物品"
        eyebrow="BATCH DISPOSAL"
        icon={<Trash2 size={18} className="text-red-400" />}
        actions={
            <>
                <button 
                    onClick={() => setItemToDelete(null)}
                    className="px-4 py-2 rounded border border-stone-600 text-stone-400 hover:text-stone-200"
                >
                    取消
                </button>
                <button 
                    onClick={() => {
                        if(itemToDelete) {
                            dispatch(removeItem({ itemId: itemToDelete.itemId, count: itemToDelete.count }));
                            setItemToDelete(null);
                            setSelectedSlot(null);
                        }
                    }}
                    className="px-4 py-2 rounded bg-red-800 text-stone-100 hover:bg-red-700"
                >
                    確認丟棄
                </button>
            </>
        }
      >
        {itemToDelete && (
            <div className="flex flex-col items-center gap-6 p-4">
                <div className="text-center">
                    <div className={`text-xl font-bold mb-2 ${getQualityTextColor(itemToDelete.quality)}`}>{itemToDelete.name}</div>
                    <div className="text-stone-500 text-sm">當前擁有: {itemToDelete.max}</div>
                </div>

                <div className="flex items-center gap-4 bg-stone-950 p-2 rounded-lg border border-stone-800">
                    <button 
                        onClick={() => setItemToDelete(prev => prev ? ({ ...prev, count: Math.max(1, prev.count - 1) }) : null)}
                        className="w-10 h-10 rounded bg-stone-900 border border-stone-700 hover:border-amber-500 text-stone-300 flex items-center justify-center font-bold text-xl transition-colors"
                    >
                        -
                    </button>
                    <div className="w-20 text-center">
                         <input 
                            type="number"
                            value={itemToDelete.count}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setItemToDelete(prev => prev ? ({ ...prev, count: Math.min(prev.max, Math.max(1, val)) }) : null);
                            }}
                            className="w-full bg-transparent text-center text-xl font-bold text-amber-500 focus:outline-none"
                         />
                    </div>
                    <button 
                        onClick={() => setItemToDelete(prev => prev ? ({ ...prev, count: Math.min(prev.max, prev.count + 1) }) : null)}
                        className="w-10 h-10 rounded bg-stone-900 border border-stone-700 hover:border-amber-500 text-stone-300 flex items-center justify-center font-bold text-xl transition-colors"
                    >
                        +
                    </button>
                </div>
                
                <div className="flex gap-2 text-xs text-stone-500">
                    <button onClick={() => setItemToDelete(prev => prev ? ({ ...prev, count: 1 }) : null)} className="hover:text-amber-500 underline">最小</button>
                    <span>|</span>
                    <button onClick={() => setItemToDelete(prev => prev ? ({ ...prev, count: Math.floor(prev.max / 2) }) : null)} className="hover:text-amber-500 underline">一半</button>
                    <span>|</span>
                    <button onClick={() => setItemToDelete(prev => prev ? ({ ...prev, count: prev.max }) : null)} className="hover:text-amber-500 underline">最大</button>
                </div>

                <div className="text-red-400 text-sm animate-pulse">
                    此操作將永久移除物品，無法復原！
                </div>
            </div>
        )}
      </Modal>
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

const EquipSlot = ({ label, icon: Icon, instance, onUnequip, onClick }: { label: string, icon: any, instance: ItemInstance | null, onUnequip: () => void, onClick?: () => void }) => {
  const item = instance ? ITEMS[instance.templateId] : null;

  return (
    <div 
        onClick={onClick}
        className={`flex items-center gap-2 p-2 md:p-3 bg-stone-900/80 rounded border border-stone-800 relative group h-full transition-colors hover:border-stone-700 ${item ? 'cursor-pointer hover:bg-stone-800/80' : ''}`}
    >
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
         <button 
            onClick={(e) => {
                e.stopPropagation();
                onUnequip();
            }} 
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-900/90 text-red-100 text-[10px] md:text-xs px-2 py-1 rounded shadow-lg transition-all hover:bg-red-800 z-10 flex items-center gap-1"
         >
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

const getInventoryTooltipEyebrow = (
  item: { category: ItemCategory },
  skill: Skill | null
) => {
  if (skill) return 'SKILL MANUAL';

  switch (item.category) {
    case ItemCategory.Equipment:
      return 'EQUIPMENT';
    case ItemCategory.Consumable:
      return 'CONSUMABLE';
    case ItemCategory.Material:
      return 'CRAFT MATERIAL';
    case ItemCategory.Breakthrough:
      return 'BREAKTHROUGH ITEM';
    default:
      return 'ITEM DATA';
  }
};

const getInventoryTooltipFooter = (
  item: { quality: ItemQuality; minRealm?: number },
  slot: InventorySlot
) => {
  const quality = slot.instance?.quality ?? item.quality;
  const parts = [getQualityName(quality)];

  if (item.minRealm !== undefined) {
    parts.push(`${REALM_NAMES[item.minRealm]}期`);
  }

  if (!slot.instanceId) {
    parts.push(`持有 ${slot.count}`);
  }

  return parts.filter(Boolean).join(' · ');
};

const getAttributeName = (key: string) => {
    switch(key) {
        // Base Stats
        case 'attack': return '攻擊';
        case 'defense': return '防禦';
        case 'hp': return '氣血';
        case 'maxHp': return '氣血上限';
        case 'mp': return '真元';
        case 'maxMp': return '真元上限';
        case 'speed': return '速度';
        
        // Advanced Combat Stats
        case 'crit': return '暴擊';
        case 'critDamage': return '暴傷';
        case 'dodge': return '閃避';
        case 'blockRate': return '格擋';
        case 'res': return '抗性'; // Resistance
        case 'magic': return '術法'; // Magic Attack
        case 'regenHp': return '回春'; // HP Regen

        // Primary Attributes
        case 'physique': return '體魄';
        case 'rootBone': return '根骨';
        case 'insight': return '神識';
        case 'comprehension': return '悟性';
        case 'fortune': return '福緣';
        case 'charm': return '魅力';
        
        default: return key;
    }
}
