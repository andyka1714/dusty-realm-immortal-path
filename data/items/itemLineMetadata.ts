import { MajorRealm } from "../../types";

export type ItemLineId =
  | "manual"
  | "equipment"
  | "alchemy_material"
  | "smithing_material"
  | "pill"
  | "quest_item"
  | "region_specialty"
  | "currency_token"
  | "talisman_array_artifact";

export const ITEM_LINE_REALM_COVERAGE: Record<
  ItemLineId,
  Partial<Record<MajorRealm, string[]>>
> = {
  manual: {
    [MajorRealm.Mortal]: ["凡界藏經閣入門秘卷"],
    [MajorRealm.QiRefining]: ["宗門入門秘卷"],
    [MajorRealm.Foundation]: ["宗門進階秘卷"],
    [MajorRealm.GoldenCore]: ["金丹真傳秘卷"],
  },
  equipment: {
    [MajorRealm.Mortal]: ["凡鐵武器", "粗布防具"],
    [MajorRealm.QiRefining]: ["入門法器", "門派制式裝"],
    [MajorRealm.Foundation]: ["築基職業套裝"],
    [MajorRealm.GoldenCore]: ["金丹真傳裝備"],
  },
  alchemy_material: {
    [MajorRealm.Mortal]: ["聚靈草", "野山參"],
    [MajorRealm.QiRefining]: ["凝氣草", "靈露"],
    [MajorRealm.Foundation]: ["凝露花", "玄霜芝"],
    [MajorRealm.GoldenCore]: ["九葉金蓮", "赤陽果"],
  },
  smithing_material: {
    [MajorRealm.Mortal]: ["凡鐵", "粗玉"],
    [MajorRealm.QiRefining]: ["玄鐵", "靈木"],
    [MajorRealm.Foundation]: ["寒鐵", "青玉"],
    [MajorRealm.GoldenCore]: ["赤銅精", "金紋石"],
  },
  pill: {
    [MajorRealm.Mortal]: ["回春散"],
    [MajorRealm.QiRefining]: ["聚氣丹"],
    [MajorRealm.Foundation]: ["築基輔助丹"],
    [MajorRealm.GoldenCore]: ["凝元丹"],
  },
  quest_item: {
    [MajorRealm.Mortal]: ["village_recommendation_letter", "broken_region_map"],
    [MajorRealm.QiRefining]: ["sect_trial_token", "monster_core_sample"],
    [MajorRealm.Foundation]: ["outer_disciple_seal", "ancient_jade_slip"],
    [MajorRealm.GoldenCore]: ["golden_core_trial_writ", "core_beast_trace"],
  },
  region_specialty: {
    [MajorRealm.Mortal]: ["village_spirit_sprout", "north_hill_sword_sand"],
    [MajorRealm.QiRefining]: ["west_forest_bloodvine", "east_lake_moondew"],
    [MajorRealm.Foundation]: ["cold_peak_ice_marrow", "beast_valley_bone_salt"],
    [MajorRealm.GoldenCore]: ["golden_lotus_pond_silt", "crimson_copper_spring"],
  },
  currency_token: {
    [MajorRealm.Mortal]: ["low_grade_spirit_stone_token"],
    [MajorRealm.QiRefining]: ["sect_contribution_token", "scripture_voucher"],
    [MajorRealm.Foundation]: ["trial_writ_token"],
    [MajorRealm.GoldenCore]: ["inheritance_fragment"],
  },
  talisman_array_artifact: {
    [MajorRealm.QiRefining]: ["thunder_talisman", "warding_talisman"],
    [MajorRealm.Foundation]: ["gathering_array_plate", "breakthrough_guard_array"],
    [MajorRealm.GoldenCore]: ["sword_artifact_embryo", "artifact_spirit_shard"],
  },
};

export const QUEST_ITEM_IDS = [
  "village_recommendation_letter",
  "broken_region_map",
  "sect_trial_token",
  "monster_core_sample",
  "outer_disciple_seal",
  "ancient_jade_slip",
  "golden_core_trial_writ",
  "core_beast_trace",
] as const;

export const REGION_SPECIALTY_ITEMS = [
  {
    itemId: "village_spirit_sprout",
    realm: MajorRealm.Mortal,
    regionLabel: "仙緣鎮",
    mapHint: "仙緣鎮周邊藥圃與村外草坡",
  },
  {
    itemId: "north_hill_sword_sand",
    realm: MajorRealm.Mortal,
    regionLabel: "北郊荒徑",
    mapHint: "凌霄山腳前的碎石坡",
  },
  {
    itemId: "west_forest_bloodvine",
    realm: MajorRealm.QiRefining,
    regionLabel: "西郊密林",
    mapHint: "萬獸谷外圍血藤林",
  },
  {
    itemId: "east_lake_moondew",
    realm: MajorRealm.QiRefining,
    regionLabel: "東郊靈湖",
    mapHint: "靈湖草甸的月露水脈",
  },
  {
    itemId: "cold_peak_ice_marrow",
    realm: MajorRealm.Foundation,
    regionLabel: "寒峰支脈",
    mapHint: "築基寒脈礦穴",
  },
  {
    itemId: "beast_valley_bone_salt",
    realm: MajorRealm.Foundation,
    regionLabel: "獸王谷",
    mapHint: "萬獸山莊試煉谷骨鹽地",
  },
  {
    itemId: "golden_lotus_pond_silt",
    realm: MajorRealm.GoldenCore,
    regionLabel: "金蓮池",
    mapHint: "金丹靈池沉積的蓮泥",
  },
  {
    itemId: "crimson_copper_spring",
    realm: MajorRealm.GoldenCore,
    regionLabel: "赤銅泉",
    mapHint: "金丹火脈旁的赤銅泉眼",
  },
] as const;

export const TOKEN_ITEMS = [
  {
    itemId: "low_grade_spirit_stone_token",
    exchangeLoop: "通用小額兌換與任務記帳",
  },
  {
    itemId: "sect_contribution_token",
    exchangeLoop: "宗門商店與門派支線兌換",
  },
  {
    itemId: "scripture_voucher",
    exchangeLoop: "藏經閣功法秘卷兌換",
  },
  {
    itemId: "trial_writ_token",
    exchangeLoop: "試煉、秘境與門派考核門票",
  },
  {
    itemId: "inheritance_fragment",
    exchangeLoop: "古修傳承、真傳秘卷與高階法寶兌換",
  },
] as const;

export const TALISMAN_ARRAY_ARTIFACT_ITEMS = [
  {
    itemId: "thunder_talisman",
    kind: "talisman",
    runtimeStatus: "usable",
  },
  {
    itemId: "warding_talisman",
    kind: "talisman",
    runtimeStatus: "usable",
  },
  {
    itemId: "gathering_array_plate",
    kind: "array",
    runtimeStatus: "catalog_only",
  },
  {
    itemId: "breakthrough_guard_array",
    kind: "array",
    runtimeStatus: "catalog_only",
  },
  {
    itemId: "sword_artifact_embryo",
    kind: "artifact",
    runtimeStatus: "catalog_only",
  },
  {
    itemId: "artifact_spirit_shard",
    kind: "spirit",
    runtimeStatus: "catalog_only",
  },
] as const;

export const FIRST_WAVE_ITEM_LINE_ITEM_IDS: Record<
  ItemLineId,
  Partial<Record<MajorRealm, string[]>>
> = {
  manual: {},
  equipment: {},
  alchemy_material: {
    [MajorRealm.Mortal]: ["spirit_herb", "wild_ginseng"],
    [MajorRealm.QiRefining]: ["condensed_qi_grass", "spirit_dew"],
    [MajorRealm.Foundation]: ["frost_lingzhi"],
    [MajorRealm.GoldenCore]: ["nine_leaf_golden_lotus"],
  },
  smithing_material: {
    [MajorRealm.Mortal]: ["iron_ore", "common_iron"],
    [MajorRealm.QiRefining]: ["spiritwood", "refined_xuan_iron"],
    [MajorRealm.Foundation]: ["cold_iron", "green_jade"],
    [MajorRealm.GoldenCore]: ["red_copper_essence", "gold_vein_stone"],
  },
  pill: {
    [MajorRealm.Mortal]: ["minor_qi_pill", "heal_pill"],
    [MajorRealm.QiRefining]: ["condensed_qi_pill", "iron_skin_pill"],
    [MajorRealm.Foundation]: ["marrow_cleansing_pill", "spirit_focus_pill"],
    [MajorRealm.GoldenCore]: ["golden_core_condensing_pill", "revitalizing_pill"],
  },
  quest_item: {},
  region_specialty: {},
  currency_token: {},
  talisman_array_artifact: {},
};
