import { Item } from "../../../types";
import { MORTAL_QI_ITEMS } from "./mortal_qi";
import { FOUNDATION_ITEMS } from "./foundation";
import { GOLDEN_CORE_ITEMS } from "./golden_core";
import { NASCENT_SOUL_ITEMS } from "./nascent_soul";
import { SPIRIT_SEVERING_ITEMS } from "./spirit_severing";
import { VOID_REFINING_ITEMS } from "./void_refining";
import { FUSION_ITEMS } from "./fusion";
import { MAHAYANA_ITEMS } from "./mahayana";
import { TRIBULATION_ITEMS } from "./tribulation";
import { IMMORTAL_ITEMS } from "./immortal";
import { IMMORTAL_EMPEROR_ITEMS } from "./immortal_emperor";

export const EQUIPMENT_ITEMS: Record<string, Item> = {
  ...MORTAL_QI_ITEMS,
  ...FOUNDATION_ITEMS,
  ...GOLDEN_CORE_ITEMS,
  ...NASCENT_SOUL_ITEMS,
  ...SPIRIT_SEVERING_ITEMS,
  ...VOID_REFINING_ITEMS,
  ...FUSION_ITEMS,
  ...MAHAYANA_ITEMS,
  ...TRIBULATION_ITEMS,
  ...IMMORTAL_ITEMS,
  ...IMMORTAL_EMPEROR_ITEMS,
};
