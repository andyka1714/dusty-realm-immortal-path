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
  quest_item: {},
  region_specialty: {},
  currency_token: {},
  talisman_array_artifact: {},
};

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
