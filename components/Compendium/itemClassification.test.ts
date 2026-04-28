import { describe, expect, it } from "vitest";
import { ITEMS } from "../../data/items";
import {
  getCompendiumItemCategory,
  getCompendiumItemCategoryLabel,
} from "./itemClassification";

const expectItemCategory = (itemId: string, categoryLabel: string) => {
  const item = ITEMS[itemId];
  expect(item, `${itemId} should exist in item catalog`).toBeDefined();
  expect(getCompendiumItemCategory(item).label).toBe(categoryLabel);
  expect(getCompendiumItemCategoryLabel(item)).toBe(categoryLabel);
};

describe("compendium item classification", () => {
  it("maps the planned item lines into player-facing compendium categories", () => {
    expectItemCategory("manual_s_q_active", "功法秘卷");
    expectItemCategory("novice_sword", "裝備");
    expectItemCategory("minor_qi_pill", "丹藥");
    expectItemCategory("wild_ginseng", "煉丹材料");
    expectItemCategory("common_iron", "煉器材料");
    expectItemCategory("village_recommendation_letter", "任務物品");
    expectItemCategory("village_spirit_sprout", "地區特產");
    expectItemCategory("sect_contribution_token", "貨幣代幣");
    expectItemCategory("thunder_talisman", "符籙");
    expectItemCategory("gathering_array_plate", "陣盤");
    expectItemCategory("sword_artifact_embryo", "法寶器靈");
    expectItemCategory("artifact_spirit_shard", "法寶器靈");
  });
});
