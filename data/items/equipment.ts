import { Item, ItemCategory, ItemQuality, EquipmentSlot, EquipmentType, MajorRealm } from '../../types';

export const EQUIPMENT_ITEMS: Record<string, Item> = {
  // --- Mortal Realm Equipment (Novice Set) ---
  'novice_sword': { 
    id: 'novice_sword', name: '鏽鐵劍', category: ItemCategory.Equipment, slot: EquipmentSlot.Weapon, subType: EquipmentType.Sword,
    description: '雖然生鏽了，但磨一磨還是能用的。', price: 60, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.Mortal,
    stats: { attack: 8 } 
  },
  'wooden_shield': {
    id: 'wooden_shield', name: '木鍋蓋', category: ItemCategory.Equipment, slot: EquipmentSlot.Offhand, subType: EquipmentType.Shield,
    description: '廚房隨手拿來的鍋蓋，擋擋小石子還行。', price: 35, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.Mortal,
    stats: { defense: 5 }
  },
  'straw_hat': {
    id: 'straw_hat', name: '草帽', category: ItemCategory.Equipment, slot: EquipmentSlot.Head, subType: EquipmentType.Helmet,
    description: '遮陽避雨，農家必備。', price: 30, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.Mortal,
    stats: { defense: 2, hp: 30 }
  },
  'novice_robe': { 
    id: 'novice_robe', name: '粗布衣', category: ItemCategory.Equipment, slot: EquipmentSlot.Body, subType: EquipmentType.SimpleRobe,
    description: '尋常人家穿的粗布衣服，內襯了些棉花。', price: 50, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.Mortal,
    stats: { physique: 1, defense: 10 } 
  },
  'straw_sandals': {
    id: 'straw_sandals', name: '草鞋', category: ItemCategory.Equipment, slot: EquipmentSlot.Legs, subType: EquipmentType.Boots,
    description: '用稻草編織的鞋子，輕便但不耐穿。', price: 35, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.Mortal,
    stats: { defense: 2, speed: 2 } 
  },
  'wooden_charm': {
    id: 'wooden_charm', name: '平安符', category: ItemCategory.Equipment, slot: EquipmentSlot.Accessory, subType: EquipmentType.Ring,
    description: '廟裡求來的平安符，寄託著家人的祝福。', price: 40, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.Mortal,
    stats: { fortune: 1 }
  },

  // --- Qi Refining Equipment ---
  // Synced with docs/04_Items/Equipment/01_QiRefining.md
  
  // 1. Spirit Sword Set (Sword) - Target: Atk 110, Def 65, HP 650
  'spirit_iron_sword': {
    id: 'spirit_iron_sword', name: '紋鐵劍', category: ItemCategory.Equipment, slot: EquipmentSlot.Weapon, subType: EquipmentType.Sword,
    description: '刻有些許靈紋的精鐵劍。', price: 300, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 50, crit: 5 }
  },
  'sword_tassel': {
    id: 'sword_tassel', name: '劍穗', category: ItemCategory.Equipment, slot: EquipmentSlot.Offhand, subType: EquipmentType.Shield,
    description: '繫在劍柄上的流蘇。', price: 175, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 20, dodge: 5 }
  },
  'focus_headband': {
    id: 'focus_headband', name: '凝神帶', category: ItemCategory.Equipment, slot: EquipmentSlot.Head, subType: EquipmentType.Helmet,
    description: '幫助集中精神的頭帶。', price: 150, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 5, defense: 10, hp: 120, speed: 3 }
  },
  'azure_robe': {
    id: 'azure_robe', name: '青雲衫', category: ItemCategory.Equipment, slot: EquipmentSlot.Body, subType: EquipmentType.Armor,
    description: '輕盈的修仙長衫，繡有雲紋。', price: 250, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 10, defense: 30, hp: 320, speed: 5 }
  },
  'light_boots': {
    id: 'light_boots', name: '輕靈靴', category: ItemCategory.Equipment, slot: EquipmentSlot.Legs, subType: EquipmentType.Boots,
    description: '穿上後身輕如燕。', price: 175, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 10, defense: 10, hp: 110, speed: 10 }
  },
  'whetstone_ring': {
    id: 'whetstone_ring', name: '礪劍戒', category: ItemCategory.Equipment, slot: EquipmentSlot.Accessory, subType: EquipmentType.Ring,
    description: '戒指上鑲嵌著一塊磨劍石碎片。', price: 200, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 15, defense: 5, hp: 100, crit: 5 }
  },

  // 2. Body Forging Set (Body) - Target: Atk 65, Def 90, HP 900
  'bear_paw_gauntlet': {
    id: 'bear_paw_gauntlet', name: '熊力拳套', category: ItemCategory.Equipment, slot: EquipmentSlot.Weapon, subType: EquipmentType.Gauntlet,
    description: '模仿棕熊巨掌打造的拳套。', price: 300, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 20, defense: 0, hp: 50, physique: 10 }
  },
  'heavy_iron_shield': {
    id: 'heavy_iron_shield', name: '玄鐵盾', category: ItemCategory.Equipment, slot: EquipmentSlot.Offhand, subType: EquipmentType.Shield,
    description: '摻入了少量玄鐵，沉重無比。', price: 175, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 5, defense: 20, hp: 180, blockRate: 10 }
  },
  'wolf_skull_helm': {
    id: 'wolf_skull_helm', name: '狼首盔', category: ItemCategory.Equipment, slot: EquipmentSlot.Head, subType: EquipmentType.Helmet,
    description: '用妖狼頭骨打磨而成的頭盔。', price: 150, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 5, defense: 15, hp: 230 }
  },
  'boar_skin_armor': {
    id: 'boar_skin_armor', name: '蠻皮甲', category: ItemCategory.Equipment, slot: EquipmentSlot.Body, subType: EquipmentType.Armor,
    description: '處理過的野豬妖獸皮。', price: 250, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 10, defense: 35, hp: 340 }
  },
  'battle_boots': {
    id: 'battle_boots', name: '戰靴', category: ItemCategory.Equipment, slot: EquipmentSlot.Legs, subType: EquipmentType.Boots,
    description: '適合踩踏與站樁的重型靴子。', price: 175, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 10, defense: 15, hp: 100 }
  },
  'vitality_beads': {
    id: 'vitality_beads', name: '氣血珠', category: ItemCategory.Equipment, slot: EquipmentSlot.Accessory, subType: EquipmentType.Ring,
    description: '佩戴後感到氣血翻湧。', price: 200, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { attack: 15, defense: 5, hp: 50, regenHp: 5 }
  },

  // 3. Elemental Set (Magic) - Target: Mag 170, Def 40, HP 400
  'spirit_wood_staff': {
    id: 'spirit_wood_staff', name: '靈木杖', category: ItemCategory.Equipment, slot: EquipmentSlot.Weapon, subType: EquipmentType.Staff,
    description: '採自靈氣充裕的老樹枝幹。', price: 300, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { magic: 60, insight: 5 }
  },
  'spirit_orb': {
    id: 'spirit_orb', name: '聚靈珠', category: ItemCategory.Equipment, slot: EquipmentSlot.Offhand, subType: EquipmentType.Shield,
    description: '能夠在戰鬥中自動汲取周圍游離的靈氣。', price: 175, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { magic: 40, insight: 3 }
  },
  'mystic_crown': {
    id: 'mystic_crown', name: '道冠', category: ItemCategory.Equipment, slot: EquipmentSlot.Head, subType: EquipmentType.Helmet,
    description: '正統道修的象徵。', price: 150, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { magic: 10, defense: 10, hp: 50, insight: 2 }
  },
  'taoist_vestment': {
    id: 'taoist_vestment', name: '八卦法衣', category: ItemCategory.Equipment, slot: EquipmentSlot.Body, subType: EquipmentType.Armor,
    description: '繡有八卦陣圖，能微弱抵禦元素傷害。', price: 250, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { magic: 30, defense: 20, hp: 150, res: 10, insight: 2 }
  },
  'cloud_step_shoes': {
    id: 'cloud_step_shoes', name: '踏雲履', category: ItemCategory.Equipment, slot: EquipmentSlot.Legs, subType: EquipmentType.Boots,
    description: '據說是仿照仙人踏雲之姿製作的鞋子。', price: 175, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { magic: 10, defense: 5, hp: 100, speed: 5 }
  },
  'elemental_ring': {
    id: 'elemental_ring', name: '五行戒', category: ItemCategory.Equipment, slot: EquipmentSlot.Accessory, subType: EquipmentType.Ring,
    description: '戒指流轉著五色光芒。', price: 200, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.QiRefining,
    stats: { magic: 20, defense: 5, hp: 100 }
  }
};
