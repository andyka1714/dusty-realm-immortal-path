
import { Item } from '../types';

export const ITEMS: Record<string, Item> = {
  // Materials
  'spirit_stone': { id: 'spirit_stone', name: '下品靈石', type: 'material', description: '修仙界的通用貨幣，蘊含微量靈氣。', price: 1, rarity: 1 },
  'wolf_fang': { id: 'wolf_fang', name: '妖狼牙', type: 'material', description: '青尾狼的尖牙，可入藥或鍛造。', price: 5, rarity: 1 },
  'iron_ore': { id: 'iron_ore', name: '玄鐵礦', type: 'material', description: '基礎的鍛造材料。', price: 10, rarity: 1 },
  'spirit_herb': { id: 'spirit_herb', name: '聚靈草', type: 'material', description: '煉製聚氣丹的主材。', price: 8, rarity: 1 },
  
  // Breakthrough Items (Updated for 2.0 Realms)
  'bt_mortal_qi': { id: 'bt_mortal_qi', name: '引氣洗髓丹', type: 'breakthrough', description: '伐毛洗髓，開啟丹田納氣之能。突破練氣期必備。', price: 100, rarity: 2 },
  'bt_qi_foundation': { id: 'bt_qi_foundation', name: '五行築基臺', type: 'breakthrough', description: '將氣態靈力築成穩固基石的陣法核心。突破築基期必備。', price: 500, rarity: 3 },
  'bt_foundation_gold': { id: 'bt_foundation_gold', name: '混沌降塵丹', type: 'breakthrough', description: '凝液成丹，抵禦凝丹時的靈力反噬。突破金丹期必備。', price: 2000, rarity: 4 },
  'bt_gold_nascent': { id: 'bt_gold_nascent', name: '七彩結嬰寶丹', type: 'breakthrough', description: '碎丹成嬰，賦予元嬰五彩神光。突破元嬰期必備。', price: 10000, rarity: 5 },
  'bt_nascent_spirit': { id: 'bt_nascent_spirit', name: '定神混元香', type: 'breakthrough', description: '助神識與肉體分離，遨遊虛空而不散。突破化神期必備。', price: 50000, rarity: 5 },
  'bt_spirit_fusion': { id: 'bt_spirit_fusion', name: '萬法歸一髓', type: 'breakthrough', description: '肉身與神魂深度融合，觸摸法則邊緣。突破合體期必備。', price: 200000, rarity: 5 },
  'bt_fusion_maha': { id: 'bt_fusion_maha', name: '天道感悟果', type: 'breakthrough', description: '參透世間規則，引發天道共鳴。突破大乘期必備。', price: 1000000, rarity: 5 },
  'bt_maha_golden': { id: 'bt_maha_golden', name: '不滅法則晶', type: 'breakthrough', description: '將體內靈力轉化為仙元力，鑄就仙軀。突破金仙必備。', price: 5000000, rarity: 5 },
  'bt_golden_emperor': { id: 'bt_golden_emperor', name: '鴻蒙本源', type: 'breakthrough', description: '宇宙誕生初期的原始能量，踏入永生。突破仙帝必備。', price: 9999999, rarity: 5 },

  // Pills
  'qi_pill': { id: 'qi_pill', name: '聚氣丹', type: 'pill', description: '服用後略微增加修為。', price: 20, rarity: 1, effects: { cultivationSpeed: 5 } }, 
  'heal_pill': { id: 'heal_pill', name: '回春丹', type: 'pill', description: '恢復少量氣血。', price: 15, rarity: 1, effects: { healHp: 50 } },
  'foundation_pill': { id: 'foundation_pill', name: '築基輔助丹', type: 'pill', description: '增加些許築基成功率的普通丹藥。', price: 1000, rarity: 3 },
  
  // Equipment
  'iron_sword': { id: 'iron_sword', name: '鐵劍', type: 'weapon', description: '凡鐵打造的劍，聊勝於無。', price: 30, rarity: 1, effects: { stat: 'physique', value: 2 } },
  'cloth_robe': { id: 'cloth_robe', name: '布衣', type: 'armor', description: '普通的布衣。', price: 20, rarity: 1, effects: { stat: 'physique', value: 1 } },
  'spirit_sword': { id: 'spirit_sword', name: '青鋼劍', type: 'weapon', description: '注入了一絲靈氣的鋼劍，鋒利無比。', price: 200, rarity: 2, effects: { stat: 'rootBone', value: 5 } },
};

export const getItem = (id: string): Item | undefined => ITEMS[id];
