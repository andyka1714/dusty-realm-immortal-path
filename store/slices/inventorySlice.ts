import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventorySlot, EquipmentState, EquipmentSlot, BaseAttributes, ItemCategory, ItemInstance, ItemQuality, EquipmentStats } from '../../types';
import { ITEMS } from '../../data/items';

interface InventoryState {
  items: InventorySlot[]; // Inventory content - now includes equipped items too
  equipment: EquipmentState; // Stores instanceId references
  equipmentStats: EquipmentStats;
}

const initialState: InventoryState = {
  items: [],
  equipment: {
    [EquipmentSlot.Weapon]: null,
    [EquipmentSlot.Head]: null,
    [EquipmentSlot.Body]: null,
    [EquipmentSlot.Legs]: null,
    [EquipmentSlot.Accessory]: null,
    [EquipmentSlot.Offhand]: null,
  },
  equipmentStats: {
    physique: 0, rootBone: 0, insight: 0, comprehension: 0, fortune: 0, charm: 0
  }
};

// Helper: Generate a basic instance for an item ID
const createBasicInstance = (itemId: string): ItemInstance => {
  const template = ITEMS[itemId];
  return {
    instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: itemId,
    quality: ItemQuality.Low,
    stats: (template && template.category === ItemCategory.Equipment) ? (template as any).stats || {} : {},
    affixes: []
  };
};

const calculateStats = (items: InventorySlot[], equipment: EquipmentState) => {
  const stats: Partial<BaseAttributes & { attack: number, defense: number, speed: number, hp: number, maxHp: number, mp: number, maxMp: number }> = { 
    physique: 0, rootBone: 0, insight: 0, comprehension: 0, fortune: 0, charm: 0,
    attack: 0, defense: 0, speed: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0
  };
  
  Object.values(equipment).forEach(instanceId => {
    if (!instanceId) return;
    const slot = items.find(i => i.instanceId === instanceId);
    if (slot && slot.instance && slot.instance.stats) {
      Object.entries(slot.instance.stats).forEach(([key, val]) => {
        // @ts-ignore
        if (stats[key] !== undefined) stats[key] += val;
        // @ts-ignore
        else stats[key] = val;
      });
    }
  });
  return stats;
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ itemId: string; count: number; instance?: ItemInstance }>) => {
      const { itemId, count, instance } = action.payload;
      const itemDef = ITEMS[itemId];
      if (!itemDef) return;

      if (instance) {
        // Direct instance add
        state.items.push({ itemId, count: 1, instanceId: instance.instanceId, instance });
      } else {
        if (itemDef.category === ItemCategory.Equipment) {
          // Auto-generate instance for equipment if missing
          for(let i=0; i<count; i++) {
            const newInst = createBasicInstance(itemId);
            state.items.push({ itemId, count: 1, instanceId: newInst.instanceId, instance: newInst });
          }
        } else {
          // Stackable logic
          const existing = state.items.find(i => i.itemId === itemId && !i.instanceId);
          if (existing) {
            existing.count += count;
          } else {
            state.items.push({ itemId, count });
          }
        }
      }
    },
    removeItem: (state, action: PayloadAction<{ itemId: string; count: number; instanceId?: string }>) => {
      const { itemId, count, instanceId } = action.payload;
      
      // Prevent removing currently equipped items
      if (instanceId && Object.values(state.equipment).includes(instanceId)) {
          return;
      }

      if (instanceId) {
        // Remove specific instance
        state.items = state.items.filter(i => i.instanceId !== instanceId);
      } else {
        // Remove from stack
        const existing = state.items.find(i => i.itemId === itemId && !i.instanceId);
        if (existing) {
          existing.count -= count;
          if (existing.count <= 0) {
            state.items = state.items.filter(i => i !== existing);
          }
        }
      }
    },
    equipItem: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload;
      const slotItem = state.items.find(i => i.instanceId === instanceId);
      if (!slotItem || !slotItem.instance) return; 

      const itemDef = ITEMS[slotItem.itemId];
      if (!itemDef || itemDef.category !== ItemCategory.Equipment) return;

      const equipSlot = (itemDef as any).slot as EquipmentSlot;
      if (!equipSlot) return;

      // Update equipment slot to point to this instance
      // We do NOT remove it from items anymore
      state.equipment[equipSlot] = instanceId;
      
      state.equipmentStats = calculateStats(state.items, state.equipment);
    },
    unequipItem: (state, action: PayloadAction<EquipmentSlot>) => {
      const slot = action.payload;
      if (state.equipment[slot]) {
        state.equipment[slot] = null;
        // We do NOT add it back to items because it never left
        state.equipmentStats = calculateStats(state.items, state.equipment);
      }
    }
  },
});

export const { addItem, removeItem, equipItem, unequipItem } = inventorySlice.actions;
export default inventorySlice.reducer;