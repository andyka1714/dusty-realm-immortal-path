import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventoryItem, EquipmentState, EquipmentSlot, BaseAttributes, ItemCategory, EquipmentItem } from '../../types';
import { ITEMS } from '../../data/items';

interface InventoryState {
  items: InventoryItem[];
  equipment: EquipmentState;
  equipmentStats: Partial<BaseAttributes>;
}

const initialState: InventoryState = {
  items: [],
  equipment: {
    [EquipmentSlot.Weapon]: null,
    [EquipmentSlot.Head]: null,
    [EquipmentSlot.Body]: null,
    [EquipmentSlot.Legs]: null,
    [EquipmentSlot.Accessory]: null,
    offhand: null,
  },
  equipmentStats: {
    physique: 0,
    rootBone: 0,
    insight: 0,
    comprehension: 0,
    fortune: 0,
    charm: 0,
  }
};

const calculateStats = (equipment: EquipmentState) => {
  const stats: Partial<BaseAttributes & { attack: number, defense: number, speed: number }> = { 
    physique: 0, rootBone: 0, insight: 0, comprehension: 0, fortune: 0, charm: 0,
    attack: 0, defense: 0, speed: 0
  };
  
  Object.values(equipment).forEach(itemId => {
    if (itemId && ITEMS[itemId] && ITEMS[itemId].category === ItemCategory.Equipment) {
      const item = ITEMS[itemId] as EquipmentItem;
      if (item.stats) {
        Object.entries(item.stats).forEach(([key, val]) => {
          // @ts-ignore
          if (stats[key] !== undefined) stats[key] += val;
          // @ts-ignore
          else stats[key] = val; // Initialize if not present (e.g. attack)
        });
      }
    }
  });
  return stats;
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ itemId: string; count: number }>) => {
      const { itemId, count } = action.payload;
      const existing = state.items.find(i => i.itemId === itemId);
      if (existing) {
        existing.count += count;
      } else {
        state.items.push({ itemId, count });
      }
    },
    removeItem: (state, action: PayloadAction<{ itemId: string; count: number }>) => {
      const { itemId, count } = action.payload;
      const existing = state.items.find(i => i.itemId === itemId);
      if (existing) {
        existing.count -= count;
        if (existing.count <= 0) {
          state.items = state.items.filter(i => i.itemId !== itemId);
        }
      }
    },
    equipItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const itemDef = ITEMS[itemId];
      if (!itemDef || itemDef.category !== ItemCategory.Equipment) return;

      const equipItem = itemDef as EquipmentItem;
      const slot = equipItem.slot; 

      if (slot) {
        // Unequip current if exists
        const currentEquip = state.equipment[slot];
        if (currentEquip) {
          const existing = state.items.find(i => i.itemId === currentEquip);
          if (existing) existing.count++;
          else state.items.push({ itemId: currentEquip, count: 1 });
        }

        // Remove 1 from inventory
        const invItem = state.items.find(i => i.itemId === itemId);
        if (invItem) {
          invItem.count--;
          if (invItem.count <= 0) state.items = state.items.filter(i => i.itemId !== itemId);
          
          // Equip
          state.equipment[slot] = itemId;
          state.equipmentStats = calculateStats(state.equipment);
        }
      }
    },
    unequipItem: (state, action: PayloadAction<EquipmentSlot>) => {
      const slot = action.payload;
      const itemId = state.equipment[slot];
      if (itemId) {
        state.equipment[slot] = null;
        // Add back to inventory
        const existing = state.items.find(i => i.itemId === itemId);
        if (existing) existing.count++;
        else state.items.push({ itemId, count: 1 });
        
        state.equipmentStats = calculateStats(state.equipment);
      }
    }
  },
});

export const { addItem, removeItem, equipItem, unequipItem } = inventorySlice.actions;
export default inventorySlice.reducer;