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
  'wild_ginseng': {
    id: 'wild_ginseng', name: '野山參', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '凡界山林常見的補氣藥根，可作低階修為丹藥引。', price: 6, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.Mortal,
  },
  'condensed_qi_grass': {
    id: 'condensed_qi_grass', name: '凝氣草', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '吸納薄弱靈氣而生的草藥，適合練氣期丹方。', price: 24, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.QiRefining,
  },
  'spirit_dew': {
    id: 'spirit_dew', name: '靈露', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '清晨凝於靈草葉尖的露珠，可調和入門丹火。', price: 30, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.QiRefining,
  },
  'frost_lingzhi': {
    id: 'frost_lingzhi', name: '玄霜芝', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '生於寒濕靈脈旁的芝草，可穩住築基後的經脈躁動。', price: 120, quality: ItemQuality.Medium, maxStack: 999,
    minRealm: MajorRealm.Foundation,
  },
  'nine_leaf_golden_lotus': {
    id: 'nine_leaf_golden_lotus', name: '九葉金蓮', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '九葉抱金，能牽引丹田靈液凝成金丹。', price: 520, quality: ItemQuality.High, maxStack: 999,
    minRealm: MajorRealm.GoldenCore,
  },
  'common_iron': {
    id: 'common_iron', name: '凡鐵', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '凡間鐵匠最常用的鐵料，適合入門重鑄。', price: 4, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.Mortal,
  },
  'spiritwood': {
    id: 'spiritwood', name: '靈木', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '受靈氣滋養的木芯，常用於法杖與陣盤胚體。', price: 35, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.QiRefining,
  },
  'refined_xuan_iron': {
    id: 'refined_xuan_iron', name: '精煉玄鐵', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '玄鐵經靈火淬煉後的精料，可承受初階靈紋。', price: 48, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.QiRefining,
  },
  'cold_iron': {
    id: 'cold_iron', name: '寒鐵', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '帶有寒氣的築基礦材，適合打造穩定靈力的兵刃。', price: 150, quality: ItemQuality.Medium, maxStack: 999,
    minRealm: MajorRealm.Foundation,
  },
  'green_jade': {
    id: 'green_jade', name: '青玉', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '可導引靈氣的青色玉料，常嵌於護符與劍鞘。', price: 180, quality: ItemQuality.Medium, maxStack: 999,
    minRealm: MajorRealm.Foundation,
  },
  'red_copper_essence': {
    id: 'red_copper_essence', name: '赤銅精', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '赤銅反覆熔煉後留下的精華，足以承接金丹真火。', price: 650, quality: ItemQuality.High, maxStack: 999,
    minRealm: MajorRealm.GoldenCore,
  },
  'gold_vein_stone': {
    id: 'gold_vein_stone', name: '金紋石', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '石中天然生成金色道紋，是金丹裝備的穩定基材。', price: 700, quality: ItemQuality.High, maxStack: 999,
    minRealm: MajorRealm.GoldenCore,
  },
  'village_recommendation_letter': {
    id: 'village_recommendation_letter', name: '村長薦書', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '村長親筆寫下的薦書，只作任務與拜入門派時的身分憑證。', price: 0, quality: ItemQuality.Low, maxStack: 1,
    minRealm: MajorRealm.Mortal,
  },
  'broken_region_map': {
    id: 'broken_region_map', name: '殘破地圖', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '標著附近山路與舊礦點的殘圖，是探索任務的線索物。', price: 0, quality: ItemQuality.Low, maxStack: 9,
    minRealm: MajorRealm.Mortal,
  },
  'sect_trial_token': {
    id: 'sect_trial_token', name: '門派試煉令', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '三宗試煉用的令牌，代表持有者已取得入門考核資格。', price: 0, quality: ItemQuality.Low, maxStack: 9,
    minRealm: MajorRealm.QiRefining,
  },
  'monster_core_sample': {
    id: 'monster_core_sample', name: '妖丹樣本', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '封存於玉盒中的妖丹樣本，用於任務回報與長老判斷妖獸異動。', price: 0, quality: ItemQuality.Low, maxStack: 99,
    minRealm: MajorRealm.QiRefining,
  },
  'outer_disciple_seal': {
    id: 'outer_disciple_seal', name: '外門弟子印', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '記錄外門身分與任務履歷的印記，不作一般材料用途。', price: 0, quality: ItemQuality.Medium, maxStack: 1,
    minRealm: MajorRealm.Foundation,
  },
  'ancient_jade_slip': {
    id: 'ancient_jade_slip', name: '古修玉簡', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '殘留古修神念的玉簡，是劇情與傳承任務的重要線索。', price: 0, quality: ItemQuality.Medium, maxStack: 9,
    minRealm: MajorRealm.Foundation,
  },
  'golden_core_trial_writ': {
    id: 'golden_core_trial_writ', name: '金丹試煉符詔', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '長老頒下的金丹試煉符詔，只能用於宗門主線任務。', price: 0, quality: ItemQuality.High, maxStack: 1,
    minRealm: MajorRealm.GoldenCore,
  },
  'core_beast_trace': {
    id: 'core_beast_trace', name: '金丹妖獸蹤跡', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '記錄金丹妖獸行蹤的靈痕拓片，可作追蹤與回報任務證物。', price: 0, quality: ItemQuality.High, maxStack: 9,
    minRealm: MajorRealm.GoldenCore,
  },
  'village_spirit_sprout': {
    id: 'village_spirit_sprout', name: '鎮郊靈芽', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '仙緣鎮外藥圃偶爾冒出的靈芽，是凡人最早接觸的地區特產。', price: 5, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.Mortal,
  },
  'north_hill_sword_sand': {
    id: 'north_hill_sword_sand', name: '北嶺劍砂', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '凌霄山腳碎石坡常見的細砂，帶有微弱金性，適合入門劍器任務。', price: 7, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.Mortal,
  },
  'west_forest_bloodvine': {
    id: 'west_forest_bloodvine', name: '西林血藤', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '西郊密林吸收妖獸血氣生出的藤蔓，是體修任務常用特產。', price: 28, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.QiRefining,
  },
  'east_lake_moondew': {
    id: 'east_lake_moondew', name: '靈湖月露', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '東郊靈湖夜間凝成的月露，帶有清冷水性，適合法修任務與丹材。', price: 30, quality: ItemQuality.Low, maxStack: 999,
    minRealm: MajorRealm.QiRefining,
  },
  'cold_peak_ice_marrow': {
    id: 'cold_peak_ice_marrow', name: '寒峰冰髓', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '築基寒脈中滲出的冰髓，可作穩脈任務與寒性器材。', price: 160, quality: ItemQuality.Medium, maxStack: 999,
    minRealm: MajorRealm.Foundation,
  },
  'beast_valley_bone_salt': {
    id: 'beast_valley_bone_salt', name: '獸谷骨鹽', category: ItemCategory.Material, subType: MaterialType.MonsterPart,
    description: '獸王谷骨鹽地凝成的白色晶粒，可鎮壓血氣與煉體反噬。', price: 170, quality: ItemQuality.Medium, maxStack: 999,
    minRealm: MajorRealm.Foundation,
  },
  'golden_lotus_pond_silt': {
    id: 'golden_lotus_pond_silt', name: '金蓮池泥', category: ItemCategory.Material, subType: MaterialType.Herb,
    description: '金蓮池底沉積的靈泥，能滋養金丹期蓮類丹材。', price: 600, quality: ItemQuality.High, maxStack: 999,
    minRealm: MajorRealm.GoldenCore,
  },
  'crimson_copper_spring': {
    id: 'crimson_copper_spring', name: '赤銅泉砂', category: ItemCategory.Material, subType: MaterialType.Ore,
    description: '赤銅泉眼沉積的火脈砂粒，可輔助金丹真火鍛造。', price: 680, quality: ItemQuality.High, maxStack: 999,
    minRealm: MajorRealm.GoldenCore,
  },
  'low_grade_spirit_stone_token': {
    id: 'low_grade_spirit_stone_token', name: '下品靈石票', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '小額靈石票據，可作通用任務記帳與低階兌換，不取代角色靈石餘額。', price: 1, quality: ItemQuality.Low, maxStack: 99999,
    minRealm: MajorRealm.Mortal,
  },
  'sect_contribution_token': {
    id: 'sect_contribution_token', name: '宗門貢獻牌', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '記錄宗門貢獻的令牌，未來可用於宗門商店與門派支線兌換。', price: 0, quality: ItemQuality.Medium, maxStack: 99999,
    minRealm: MajorRealm.QiRefining,
  },
  'scripture_voucher': {
    id: 'scripture_voucher', name: '藏經閣書券', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '藏經閣核發的兌換券，專供功法秘卷與心法殘頁兌換。', price: 0, quality: ItemQuality.Medium, maxStack: 99999,
    minRealm: MajorRealm.QiRefining,
  },
  'trial_writ_token': {
    id: 'trial_writ_token', name: '試煉符券', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '開啟門派試煉或秘境入口的符券，作為門票型代幣。', price: 0, quality: ItemQuality.Medium, maxStack: 99999,
    minRealm: MajorRealm.Foundation,
  },
  'inheritance_fragment': {
    id: 'inheritance_fragment', name: '傳承殘頁', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '古修傳承中剝落的殘頁，可累積兌換真傳秘卷或高階法寶線索。', price: 0, quality: ItemQuality.High, maxStack: 99999,
    minRealm: MajorRealm.GoldenCore,
  },
  'gathering_array_plate': {
    id: 'gathering_array_plate', name: '聚靈陣盤', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '刻有聚靈紋路的陣盤胚，作為洞府與場域系統的 catalog-only 物品。', price: 900, quality: ItemQuality.Medium, maxStack: 99,
    minRealm: MajorRealm.Foundation,
  },
  'breakthrough_guard_array': {
    id: 'breakthrough_guard_array', name: '護關陣盤', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '可用於後續突破護關玩法的陣盤，目前只作高階任務與 recipe 語彙。', price: 1200, quality: ItemQuality.Medium, maxStack: 99,
    minRealm: MajorRealm.Foundation,
  },
  'sword_artifact_embryo': {
    id: 'sword_artifact_embryo', name: '劍形法寶胚', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '尚未開鋒的法寶胚體，未接入法寶裝備欄前只作 catalog-only 物品。', price: 3200, quality: ItemQuality.High, maxStack: 9,
    minRealm: MajorRealm.GoldenCore,
  },
  'artifact_spirit_shard': {
    id: 'artifact_spirit_shard', name: '器靈碎片', category: ItemCategory.Material, subType: MaterialType.Other,
    description: '殘缺器靈留下的碎片，未接入器靈養成前只作傳承與法寶線索。', price: 4500, quality: ItemQuality.High, maxStack: 99,
    minRealm: MajorRealm.GoldenCore,
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
