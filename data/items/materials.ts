import { Item, ItemCategory, ItemQuality, MaterialType } from '../../types';

export const MATERIAL_ITEMS: Record<string, Item> = {
  // --- Materials ---
  'spirit_stone': { 
    id: 'spirit_stone', name: '下品靈石', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '修仙界的通用貨幣，蘊含微量靈氣。', price: 1, quality: ItemQuality.Low, maxStack: 99999 
  },
  'wolf_fang': { 
    id: 'wolf_fang', name: '妖狼牙', category: ItemCategory.Material, subType: MaterialType.MonsterPart,
    description: '青尾狼的尖牙，可入藥或鍛造。', price: 5, quality: ItemQuality.Low, maxStack: 999 
  },
  'iron_ore': { 
    id: 'iron_ore', name: '玄鐵礦', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '基礎的鍛造材料。', price: 10, quality: ItemQuality.Low, maxStack: 999 
  },
  'spirit_herb': { 
    id: 'spirit_herb', name: '聚靈草', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '煉製聚氣丹的主材。', price: 8, quality: ItemQuality.Low, maxStack: 999 
  },
};
