import { Item, ItemCategory, ItemQuality, EquipmentSlot, EquipmentType } from '../../types';

export const EQUIPMENT_ITEMS: Record<string, Item> = {
  // --- Mortal Realm Equipment (Novice Set) ---
  'novice_sword': { 
    id: 'novice_sword', name: '鏽鐵劍', category: ItemCategory.Equipment, slot: EquipmentSlot.Weapon, subType: EquipmentType.Sword,
    description: '雖然生鏽了，但磨一磨還是能用的。', price: 10, quality: ItemQuality.Low, maxStack: 1,
    stats: { attack: 8 } 
  },
  'wooden_shield': {
    id: 'wooden_shield', name: '木鍋蓋', category: ItemCategory.Equipment, slot: EquipmentSlot.Offhand, subType: EquipmentType.Shield,
    description: '廚房隨手拿來的鍋蓋，擋擋小石子還行。', price: 10, quality: ItemQuality.Low, maxStack: 1,
    stats: { defense: 5 }
  },
  'straw_hat': {
    id: 'straw_hat', name: '草帽', category: ItemCategory.Equipment, slot: EquipmentSlot.Head, subType: EquipmentType.Helmet,
    description: '遮陽避雨，農家必備。', price: 5, quality: ItemQuality.Low, maxStack: 1,
    stats: { defense: 2, hp: 30 }
  },
  'novice_robe': { 
    id: 'novice_robe', name: '粗布衣', category: ItemCategory.Equipment, slot: EquipmentSlot.Body, subType: EquipmentType.SimpleRobe,
    description: '尋常人家穿的粗布衣服，內襯了些棉花。', price: 20, quality: ItemQuality.Low, maxStack: 1,
    stats: { physique: 1, defense: 10 } 
  },
  'straw_sandals': {
    id: 'straw_sandals', name: '草鞋', category: ItemCategory.Equipment, slot: EquipmentSlot.Legs, subType: EquipmentType.Boots,
    description: '用稻草編織的鞋子，輕便但不耐穿。', price: 5, quality: ItemQuality.Low, maxStack: 1,
    stats: { defense: 2, speed: 2 } 
  },
  'wooden_charm': {
    id: 'wooden_charm', name: '平安符', category: ItemCategory.Equipment, slot: EquipmentSlot.Accessory, subType: EquipmentType.Ring,
    description: '廟裡求來的平安符，寄託著家人的祝福。', price: 20, quality: ItemQuality.Low, maxStack: 1,
    stats: { fortune: 1 }
  },
};
