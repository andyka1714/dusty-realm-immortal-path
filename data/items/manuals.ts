import { Item, ItemCategory, ItemQuality, ConsumableType } from '../../types';

// Manuals / Skill Books
export const MANUAL_ITEMS: Record<string, Item> = {
  'manual_basic_breath': {
    id: 'manual_basic_breath', name: '吐納法', category: ItemCategory.Consumable, subType: ConsumableType.Manual,
    description: '基礎的呼吸吐納之法，修煉入門。修煉速度 +5% (被動)。', price: 500, quality: ItemQuality.Low, maxStack: 1,
    effects: [] 
  },
  'manual_iron_skin': {
    id: 'manual_iron_skin', name: '鐵布衫', category: ItemCategory.Consumable, subType: ConsumableType.Manual,
    description: '錘鍊皮膜，如著鐵衣。防禦力 +10 (被動)。', price: 800, quality: ItemQuality.Low, maxStack: 1,
    effects: []
  },
  'manual_swift_step': {
    id: 'manual_swift_step', name: '輕身術', category: ItemCategory.Consumable, subType: ConsumableType.Manual,
    description: '身輕如燕，步法靈動。速度 +5，閃避 +1% (被動)。', price: 800, quality: ItemQuality.Low, maxStack: 1,
    effects: []
  },
  'manual_spirit_strike': {
    id: 'manual_spirit_strike', name: '靈力一擊', category: ItemCategory.Consumable, subType: ConsumableType.Manual,
    description: '凝聚靈力於兵刃，造成額外傷害。戰鬥時 10% 機率造成 150% 傷害 (主動)。', price: 1500, quality: ItemQuality.Medium, maxStack: 1,
    effects: []
  },
  // Map Item
  'map_mortal_region': {
    id: 'map_mortal_region', name: '凡界地圖', category: ItemCategory.Consumable, subType: ConsumableType.Map,
    description: '繪製了凡界主要區域的粗略地圖。', price: 100, quality: ItemQuality.Low, maxStack: 1,
    effects: []
  }
};

