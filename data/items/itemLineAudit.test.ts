import { describe, expect, it } from "vitest";
import { ConsumableItem, ConsumableType, ItemCategory, MajorRealm } from "../../types";
import { SHOPS } from "../shops";
import { WORKSHOP_RECIPES } from "../workshopRecipes";
import { ITEMS } from ".";
import {
  FIRST_WAVE_ITEM_LINE_ITEM_IDS,
  ITEM_LINE_REALM_COVERAGE,
  QUEST_ITEM_IDS,
  REGION_SPECIALTY_ITEMS,
  TALISMAN_ARRAY_ARTIFACT_ITEMS,
  TOKEN_ITEMS,
} from "./itemLineMetadata";

describe("item line metadata", () => {
  const allMajorRealms = [
    MajorRealm.Mortal,
    MajorRealm.QiRefining,
    MajorRealm.Foundation,
    MajorRealm.GoldenCore,
    MajorRealm.NascentSoul,
    MajorRealm.SpiritSevering,
    MajorRealm.VoidRefining,
    MajorRealm.Fusion,
    MajorRealm.Mahayana,
    MajorRealm.Tribulation,
    MajorRealm.Immortal,
    MajorRealm.ImmortalEmperor,
  ];

  it("covers low and mid realms for first-wave item lines", () => {
    const requiredRealms = [
      MajorRealm.Mortal,
      MajorRealm.QiRefining,
      MajorRealm.Foundation,
      MajorRealm.GoldenCore,
    ];

    for (const line of [
      "manual",
      "equipment",
      "alchemy_material",
      "smithing_material",
      "pill",
    ] as const) {
      for (const realm of requiredRealms) {
        expect(
          ITEM_LINE_REALM_COVERAGE[line][realm]?.length ?? 0,
          `${line} realm ${realm}`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("anchors low and mid realm alchemy and smithing materials to real item ids", () => {
    const materialLines = ["alchemy_material", "smithing_material"] as const;
    const requiredRealms = [
      MajorRealm.Mortal,
      MajorRealm.QiRefining,
      MajorRealm.Foundation,
      MajorRealm.GoldenCore,
    ];

    for (const line of materialLines) {
      for (const realm of requiredRealms) {
        const itemIds = FIRST_WAVE_ITEM_LINE_ITEM_IDS[line][realm] ?? [];

        expect(itemIds.length, `${line} realm ${realm} ids`).toBeGreaterThan(0);
        itemIds.forEach((itemId) => {
          expect(ITEMS[itemId], `${itemId} should exist`).toBeDefined();
        });
      }
    }
  });

  it("gives first-wave alchemy and smithing materials at least one workshop sink", () => {
    const sinkedItemIds = new Set(
      Object.values(WORKSHOP_RECIPES).flatMap((recipe) =>
        recipe.ingredients.map((ingredient) => ingredient.itemId)
      )
    );

    for (const line of ["alchemy_material", "smithing_material"] as const) {
      const itemIds = Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS[line]).flat();
      itemIds.forEach((itemId) => {
        expect(sinkedItemIds.has(itemId), `${itemId} should have a recipe sink`).toBe(
          true
        );
      });
    }
  });

  it("anchors first-wave pills to real consumables with effects and sources", () => {
    const sourcedItemIds = new Set([
      ...Object.values(WORKSHOP_RECIPES).flatMap((recipe) =>
        recipe.outputs.map((output) => output.itemId)
      ),
      ...Object.values(SHOPS).flatMap((shop) =>
        shop.items.map((shopItem) => shopItem.itemId)
      ),
    ]);

    const requiredEffectTypes = new Set([
      "gain_exp",
      "heal_hp",
      "heal_mp",
      "breakthrough_chance",
      "buff_stat",
    ]);

    const pillIds = Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill).flat();
    expect(pillIds.length).toBeGreaterThan(0);

    pillIds.forEach((itemId) => {
      const item = ITEMS[itemId] as ConsumableItem | undefined;

      expect(item, `${itemId} should exist`).toBeDefined();
      expect(item?.category, `${itemId} category`).toBe(ItemCategory.Consumable);
      expect(item?.subType, `${itemId} subtype`).toBe(ConsumableType.Pill);
      expect(item?.effects.length ?? 0, `${itemId} effects`).toBeGreaterThan(0);
      expect(sourcedItemIds.has(itemId), `${itemId} should have a shop or recipe source`).toBe(true);
      item?.effects.forEach((effect) => {
        expect(
          requiredEffectTypes.has(effect.type),
          `${itemId} effect ${effect.type} should fit the first-wave pill line`
        ).toBe(true);
      });
    });
  });

  it("covers combat pill purposes and shared recovery cooldown for low and mid realms", () => {
    const pillIds = Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill).flat();
    const pills = pillIds.map((itemId) => ITEMS[itemId] as ConsumableItem);
    const effectTypes = new Set(
      pills.flatMap((pill) => pill.effects.map((effect) => effect.type))
    );

    expect(Array.from(effectTypes)).toEqual(
      expect.arrayContaining([
        "gain_exp",
        "heal_hp",
        "heal_mp",
        "breakthrough_chance",
        "buff_stat",
      ])
    );

    pills
      .filter((pill) =>
        pill.effects.some((effect) =>
          ["heal_hp", "heal_mp", "full_restore"].includes(effect.type)
        )
      )
      .forEach((pill) => {
        expect(pill.cooldown, `${pill.id} recovery cooldown`).toBe(5);
      });
  });

  it("does not publish full-restore pills in the current realm pill progression", () => {
    const pillIds = Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill).flat();
    const fullRestorePills = pillIds.filter((itemId) => {
      const item = ITEMS[itemId] as ConsumableItem | undefined;
      return item?.effects.some((effect) => effect.type === "full_restore");
    });

    expect(fullRestorePills).toEqual([]);
  });

  it("gives every major realm a cultivation, HP recovery, and MP recovery pill with a source", () => {
    const sourcedItemIds = new Set([
      ...Object.values(WORKSHOP_RECIPES).flatMap((recipe) =>
        recipe.outputs.map((output) => output.itemId)
      ),
      ...Object.values(SHOPS).flatMap((shop) =>
        shop.items.map((shopItem) => shopItem.itemId)
      ),
    ]);

    allMajorRealms.forEach((realm) => {
      const pillIds = FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill[realm] ?? [];
      const pills = pillIds.map((itemId) => ITEMS[itemId] as ConsumableItem | undefined);

      expect(pillIds.length, `realm ${realm} pill ids`).toBeGreaterThanOrEqual(3);
      expect(
        pills.some((pill) => pill?.effects.some((effect) => effect.type === "gain_exp")),
        `realm ${realm} should have a cultivation pill`
      ).toBe(true);
      expect(
        pills.some((pill) => pill?.effects.some((effect) => effect.type === "heal_hp")),
        `realm ${realm} should have an HP pill`
      ).toBe(true);
      expect(
        pills.some((pill) => pill?.effects.some((effect) => effect.type === "heal_mp")),
        `realm ${realm} should have an MP pill`
      ).toBe(true);

      pillIds.forEach((itemId) => {
        expect(ITEMS[itemId], `${itemId} should exist`).toBeDefined();
        expect(sourcedItemIds.has(itemId), `${itemId} should have a source`).toBe(true);
      });
    });
  });

  it("keeps realm recovery pill values in a conservative five-second cooldown envelope", () => {
    const recoveryEnvelope: Record<
      MajorRealm,
      { hp: [number, number]; mp: [number, number] }
    > = {
      [MajorRealm.Mortal]: { hp: [45, 65], mp: [35, 55] },
      [MajorRealm.QiRefining]: { hp: [75, 110], mp: [65, 95] },
      [MajorRealm.Foundation]: { hp: [160, 230], mp: [130, 190] },
      [MajorRealm.GoldenCore]: { hp: [700, 1100], mp: [600, 900] },
      [MajorRealm.NascentSoul]: { hp: [2500, 3800], mp: [1800, 2800] },
      [MajorRealm.SpiritSevering]: { hp: [10000, 15000], mp: [7500, 11000] },
      [MajorRealm.VoidRefining]: { hp: [34000, 52000], mp: [25000, 38000] },
      [MajorRealm.Fusion]: { hp: [100000, 150000], mp: [76000, 115000] },
      [MajorRealm.Mahayana]: { hp: [300000, 430000], mp: [220000, 320000] },
      [MajorRealm.Tribulation]: { hp: [850000, 1200000], mp: [620000, 850000] },
      [MajorRealm.Immortal]: { hp: [2200000, 3000000], mp: [1500000, 2200000] },
      [MajorRealm.ImmortalEmperor]: { hp: [5200000, 6800000], mp: [3600000, 4800000] },
    };

    allMajorRealms.forEach((realm) => {
      const pills = (FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill[realm] ?? []).map(
        (itemId) => ITEMS[itemId] as ConsumableItem
      );
      const hpValues = pills.flatMap((pill) =>
        pill.effects
          .filter((effect) => effect.type === "heal_hp")
          .map((effect) => effect.value)
      );
      const mpValues = pills.flatMap((pill) =>
        pill.effects
          .filter((effect) => effect.type === "heal_mp")
          .map((effect) => effect.value)
      );

      expect(
        hpValues.some(
          (value) =>
            value >= recoveryEnvelope[realm].hp[0] &&
            value <= recoveryEnvelope[realm].hp[1]
        ),
        `realm ${realm} HP recovery envelope`
      ).toBe(true);
      expect(
        mpValues.some(
          (value) =>
            value >= recoveryEnvelope[realm].mp[0] &&
            value <= recoveryEnvelope[realm].mp[1]
        ),
        `realm ${realm} MP recovery envelope`
      ).toBe(true);

      pills
        .filter((pill) =>
          pill.effects.some((effect) =>
            ["heal_hp", "heal_mp", "full_restore"].includes(effect.type)
          )
        )
        .forEach((pill) => {
          expect(pill.cooldown, `${pill.id} recovery cooldown`).toBe(5);
        });
    });
  });

  it("keeps quest items separate from workshop recipes and shops", () => {
    const workshopItemIds = new Set(
      Object.values(WORKSHOP_RECIPES).flatMap((recipe) => [
        ...recipe.ingredients.map((ingredient) => ingredient.itemId),
        ...recipe.outputs.map((output) => output.itemId),
      ])
    );
    const shopItemIds = new Set(
      Object.values(SHOPS).flatMap((shop) =>
        shop.items.map((shopItem) => shopItem.itemId)
      )
    );

    expect(QUEST_ITEM_IDS.length).toBeGreaterThan(0);

    QUEST_ITEM_IDS.forEach((itemId) => {
      const item = ITEMS[itemId];

      expect(item, `${itemId} should exist`).toBeDefined();
      expect(item?.category, `${itemId} category`).toBe(ItemCategory.Material);
      expect(workshopItemIds.has(itemId), `${itemId} should not be a recipe item`).toBe(
        false
      );
      expect(shopItemIds.has(itemId), `${itemId} should not be sold in shops`).toBe(
        false
      );
    });
  });

  it("anchors region specialties to real items with map source metadata", () => {
    expect(REGION_SPECIALTY_ITEMS.length).toBeGreaterThanOrEqual(6);

    REGION_SPECIALTY_ITEMS.forEach((specialty) => {
      const item = ITEMS[specialty.itemId];

      expect(item, `${specialty.itemId} should exist`).toBeDefined();
      expect(item?.category, `${specialty.itemId} category`).toBe(ItemCategory.Material);
      expect(item?.minRealm, `${specialty.itemId} min realm`).toBe(specialty.realm);
      expect(specialty.regionLabel.length, `${specialty.itemId} region`).toBeGreaterThan(0);
      expect(specialty.mapHint.length, `${specialty.itemId} map hint`).toBeGreaterThan(0);
    });
  });

  it("anchors currency tokens to inventory items without workshop sinks", () => {
    const workshopItemIds = new Set(
      Object.values(WORKSHOP_RECIPES).flatMap((recipe) => [
        ...recipe.ingredients.map((ingredient) => ingredient.itemId),
        ...recipe.outputs.map((output) => output.itemId),
      ])
    );

    expect(TOKEN_ITEMS.length).toBeGreaterThanOrEqual(5);

    TOKEN_ITEMS.forEach((token) => {
      const item = ITEMS[token.itemId];

      expect(item, `${token.itemId} should exist`).toBeDefined();
      expect(item?.category, `${token.itemId} category`).toBe(ItemCategory.Material);
      expect(item?.maxStack, `${token.itemId} stack`).toBeGreaterThanOrEqual(999);
      expect(token.exchangeLoop.length, `${token.itemId} exchange loop`).toBeGreaterThan(0);
      expect(workshopItemIds.has(token.itemId), `${token.itemId} should not be a workshop item`).toBe(false);
    });
  });

  it("separates usable talismans from catalog-only arrays artifacts and spirits", () => {
    expect(TALISMAN_ARRAY_ARTIFACT_ITEMS.length).toBeGreaterThanOrEqual(6);

    TALISMAN_ARRAY_ARTIFACT_ITEMS.forEach((entry) => {
      const item = ITEMS[entry.itemId];

      expect(item, `${entry.itemId} should exist`).toBeDefined();
      if (entry.kind === "talisman") {
        const consumable = item as ConsumableItem;
        expect(consumable.category, `${entry.itemId} category`).toBe(ItemCategory.Consumable);
        expect(consumable.effects.length, `${entry.itemId} effects`).toBeGreaterThan(0);
      } else {
        expect(item?.category, `${entry.itemId} category`).toBe(ItemCategory.Material);
        expect(entry.runtimeStatus, `${entry.itemId} runtime status`).toBe("catalog_only");
      }
    });
  });
});
