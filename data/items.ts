
import { Item, ItemCategory, ItemQuality, EquipmentSlot, EquipmentType, ConsumableType, MaterialType } from '../types';

export const ITEMS: Record<string, Item> = {
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
  
  // --- Consumables & Pills ---
  'qi_pill': { 
    id: 'qi_pill', name: '聚氣丹', category: ItemCategory.Consumable, subType: ConsumableType.Pill,
    description: '服用後略微增加修為。', price: 20, quality: ItemQuality.Low, maxStack: 99,
    effects: [{ type: 'gain_exp', value: 50 }] 
  }, 
  'heal_pill': { 
    id: 'heal_pill', name: '回春丹', category: ItemCategory.Consumable, subType: ConsumableType.Pill,
    description: '恢復少量氣血。', price: 15, quality: ItemQuality.Low, maxStack: 99,
    effects: [{ type: 'heal_hp', value: 50 }] 
  },
  'foundation_pill': { 
    id: 'foundation_pill', name: '築基輔助丹', category: ItemCategory.Consumable, subType: ConsumableType.Pill,
    description: '增加些許築基成功率的普通丹藥。', price: 1000, quality: ItemQuality.Medium, maxStack: 10,
    effects: [{ type: 'breakthrough_chance', value: 10 }] 
  },
  'longevity_pill': { 
    id: 'longevity_pill', name: '長生丹', category: ItemCategory.Consumable, subType: ConsumableType.Pill,
    description: '奪天地造化，強行延壽10年。一生只能服用5次。', price: 50000, quality: ItemQuality.High, maxStack: 5,
    maxUsage: 5,
    effects: [{ type: 'lifespan', value: 3650 }] 
  },

  // --- Breakthrough Items ---
  'bt_mortal_qi': { 
    id: 'bt_mortal_qi', name: '引氣洗髓丹', category: ItemCategory.Breakthrough, subType: ConsumableType.Pill,
    description: '伐毛洗髓，開啟丹田納氣之能。突破練氣期必備。', price: 100, quality: ItemQuality.Medium, maxStack: 1,
    effects: [] 
  },
  'bt_qi_foundation': { id: 'bt_qi_foundation', name: '五行築基臺', category: ItemCategory.Breakthrough, subType: ConsumableType.Other, description: '將氣態靈力築成穩固基石的陣法核心。突破築基期必備。', price: 500, quality: ItemQuality.Medium, maxStack: 1, effects: [] },
  'bt_foundation_gold': { id: 'bt_foundation_gold', name: '混沌降塵丹', category: ItemCategory.Breakthrough, subType: ConsumableType.Pill, description: '凝液成丹，抵禦凝丹時的靈力反噬。突破金丹期必備。', price: 2000, quality: ItemQuality.High, maxStack: 1, effects: [] },
  'bt_gold_nascent': { id: 'bt_gold_nascent', name: '七彩結嬰寶丹', category: ItemCategory.Breakthrough, subType: ConsumableType.Pill, description: '碎丹成嬰，賦予元嬰五彩神光。突破元嬰期必備。', price: 10000, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },
  'bt_nascent_spirit': { id: 'bt_nascent_spirit', name: '定神混元香', category: ItemCategory.Breakthrough, subType: ConsumableType.Other, description: '助神識與肉體分離，遨遊虛空而不散。突破化神期必備。', price: 50000, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },
  'bt_spirit_void': { id: 'bt_spirit_void', name: '太虛破障丹', category: ItemCategory.Breakthrough, subType: ConsumableType.Pill, description: '觸摸虛空壁壘，以虛化實。突破煉虛期必備。', price: 150000, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },
  'bt_void_fusion': { id: 'bt_void_fusion', name: '萬法歸一髓', category: ItemCategory.Breakthrough, subType: ConsumableType.Other, description: '肉身與神魂深度融合，觸摸法則邊緣。突破合體期必備。', price: 300000, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },
  'bt_fusion_maha': { id: 'bt_fusion_maha', name: '天道感悟果', category: ItemCategory.Breakthrough, subType: ConsumableType.Other, description: '參透世間規則，引發天道共鳴。突破大乘期必備。', price: 800000, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },
  'bt_maha_trib': { id: 'bt_maha_trib', name: '九轉渡劫丹', category: ItemCategory.Breakthrough, subType: ConsumableType.Pill, description: '以九轉藥力護住心脈，直面天劫洗禮。突破渡劫期必備。', price: 2000000, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },
  'bt_trib_immortal': { id: 'bt_trib_immortal', name: '飛昇仙引', category: ItemCategory.Breakthrough, subType: ConsumableType.Other, description: '凝聚仙元，洗去凡胎，踏入仙道。突破人仙必備。', price: 5000000, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },
  'bt_immortal_emperor': { id: 'bt_immortal_emperor', name: '鴻蒙本源', category: ItemCategory.Breakthrough, subType: ConsumableType.Other, description: '宇宙誕生初期的原始能量，證道仙帝。突破仙帝必備。', price: 9999999, quality: ItemQuality.Immortal, maxStack: 1, effects: [] },

  // --- Equipment ---
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

export const getItem = (id: string): Item | undefined => ITEMS[id];
