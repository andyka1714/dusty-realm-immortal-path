import { Item, ItemCategory, ItemQuality, MaterialType, MajorRealm } from '../../types';

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
  'sword_path_starsteel': {
    id: 'sword_path_starsteel',
    name: '凌霄劍星鋼',
    category: ItemCategory.Material,
    subType: MaterialType.Ore,
    description: '凌霄劍宗前哨殘核熔出的劍心星鋼。',
    price: 25000,
    quality: ItemQuality.Immortal,
    maxStack: 999,
    minRealm: MajorRealm.SpiritSevering,
  },
  'mystic_path_starlotus': {
    id: 'mystic_path_starlotus',
    name: '縹緲星魂蓮',
    category: ItemCategory.Material,
    subType: MaterialType.Herb,
    description: '縹緲仙宮星砂秘材孕出的凝神靈蓮。',
    price: 24000,
    quality: ItemQuality.Immortal,
    maxStack: 999,
    minRealm: MajorRealm.SpiritSevering,
  },
  'beast_path_bloodbone': {
    id: 'beast_path_bloodbone',
    name: '萬獸血骨殘材',
    category: ItemCategory.Material,
    subType: MaterialType.MonsterPart,
    description: '萬獸山莊高壓鍛體後剝離的血骨殘材。',
    price: 22000,
    quality: ItemQuality.Immortal,
    maxStack: 999,
    minRealm: MajorRealm.SpiritSevering,
  },
};
