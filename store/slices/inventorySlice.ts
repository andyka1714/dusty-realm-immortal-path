import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventoryItem, Equipment, ItemType, BaseAttributes } from '../../types';
import { ITEMS } from '../../data/items';

interface InventoryState {
  items: InventoryItem[];
  equipment: Equipment;
  equipmentStats: Partial<BaseAttributes>;
}

const initialState: InventoryState = {
  items: [],
  equipment: {
    weapon: null,
    armor: null,
    accessory: null,
  },
  equipmentStats: {
    physique: 0,
    rootBone: 0,
    insight: 0,
    comprehension: 0,
    fortune: 0,
  }
};

const calculateStats = (equipment: Equipment) => {
  const stats = { physique: 0, rootBone: 0, insight: 0, comprehension: 0, fortune: 0 };
  Object.values(equipment).forEach(itemId => {
    if (itemId && ITEMS[itemId] && ITEMS[itemId].effects?.stat) {
      const statName = ITEMS[itemId].effects!.stat!;
      const value = ITEMS[itemId].effects!.value || 0;
      stats[statName] += value;
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
      if (!itemDef) return;

      let slot: keyof Equipment | null = null;
      if (itemDef.type === 'weapon') slot = 'weapon';
      if (itemDef.type === 'armor') slot = 'armor';
      // if (itemDef.type === 'accessory') slot = 'accessory';

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
    unequipItem: (state, action: PayloadAction<keyof Equipment>) => {
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