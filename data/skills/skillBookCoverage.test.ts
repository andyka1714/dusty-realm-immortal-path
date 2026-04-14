import { describe, expect, it } from "vitest";
import { ITEMS } from "../items";
import { ELITE_ENEMIES } from "../enemies/elite";
import { BOSS_ENEMIES } from "../enemies/boss";
import { QUESTS } from "../quests";
import { SHOPS } from "../shops";
import { ConsumableItem } from "../../types";
import { FORMAL_CORE_SKILLS, SKILLS } from ".";
import { getSkillManualId, SKILL_MANUAL_SOURCE_REGISTRY } from "../items/manuals";

const getAllObtainableItemIds = () => {
  const ids = new Set<string>();

  Object.values(SHOPS).forEach((shop) => {
    shop.items.forEach((item) => ids.add(item.itemId));
  });

  Object.values(ELITE_ENEMIES).forEach((enemy) => {
    enemy.drops.forEach((dropId) => ids.add(dropId));
  });

  Object.values(BOSS_ENEMIES).forEach((enemy) => {
    enemy.drops.forEach((dropId) => ids.add(dropId));
  });

  Object.values(QUESTS).forEach((quest) => {
    quest.rewards.forEach((reward) => {
      reward.items?.forEach((item) => ids.add(item.itemId));
    });
  });

  return ids;
};

const getShopItemIds = () =>
  new Set(
    Object.values(SHOPS).flatMap((shop) => shop.items.map((item) => item.itemId))
  );

const getEliteDropIds = () =>
  new Set(
    Object.values(ELITE_ENEMIES).flatMap((enemy) => enemy.drops)
  );

const getBossDropIds = () =>
  new Set(
    Object.values(BOSS_ENEMIES).flatMap((enemy) => enemy.drops)
  );

describe("skill book coverage", () => {
  it("creates a learnable manual for every formal core skill", () => {
    FORMAL_CORE_SKILLS.forEach((skill) => {
      const manualId = getSkillManualId(skill.id);
      const item = ITEMS[manualId] as ConsumableItem | undefined;

      expect(item, `${skill.id} 缺少技能書物品`).toBeDefined();
      expect(item?.effects.some((effect) => effect.type === "learn_skill" && effect.skillId === skill.id)).toBe(true);
      expect(item?.requiredRealm).toBe(skill.minRealm);
      expect(item?.requiredProfession).toBe(
        skill.profession && skill.profession !== "None" ? skill.profession : undefined
      );
    });
  });

  it("ensures every skill manual is obtainable from at least one source", () => {
    const obtainableIds = getAllObtainableItemIds();

    FORMAL_CORE_SKILLS.forEach((skill) => {
      const manualId = getSkillManualId(skill.id);
      expect(obtainableIds.has(manualId), `${skill.id} 沒有任何來源`).toBe(true);
    });
  });

  it("retires transition and legacy skills from the formal acquisition pool", () => {
    Object.values(SKILLS)
      .filter((skill) => skill.poolStatus !== "core")
      .forEach((skill) => {
        const manualId = getSkillManualId(skill.id);
        expect(ITEMS[manualId], `${skill.id} 不應再有正式技能書`).toBeUndefined();
        expect(SKILL_MANUAL_SOURCE_REGISTRY[skill.id], `${skill.id} 不應再有正式來源 registry`).toBeUndefined();
      });
  });

  it("keeps all passive skills on explicit effect wiring without legacy passive tag fields", () => {
    Object.values(SKILLS)
      .filter((skill) => skill.type === "Passive")
      .forEach((skill) => {
        expect("passiveEffectTags" in skill, `${skill.id} 不應再保留 passiveEffectTags 欄位`).toBe(false);
      });
  });

  it("builds a source registry entry for every formal skill manual", () => {
    FORMAL_CORE_SKILLS.forEach((skill) => {
      const entry = SKILL_MANUAL_SOURCE_REGISTRY[skill.id];

      expect(entry, `${skill.id} 缺少技能書來源 registry`).toBeDefined();
      expect(entry?.manualId).toBe(getSkillManualId(skill.id));
      expect(entry?.sources.length, `${skill.id} 缺少來源分類`).toBeGreaterThan(0);
      expect(entry?.categoryLabel.length, `${skill.id} 缺少分類標籤`).toBeGreaterThan(0);
      expect(entry?.tierLabel.length, `${skill.id} 缺少階級標籤`).toBeGreaterThan(0);
    });
  });

  it("aligns formal source tiers with actual obtainable sources", () => {
    const shopItemIds = getShopItemIds();
    const eliteDropIds = getEliteDropIds();
    const bossDropIds = getBossDropIds();
    const inheritanceShop = SHOPS.inheritance_pavilion;

    FORMAL_CORE_SKILLS.forEach((skill) => {
      const manualId = getSkillManualId(skill.id);

      switch (skill.formalSourceTier) {
        case "shop":
          expect(shopItemIds.has(manualId), `${skill.id} 應存在商店來源`).toBe(true);
          break;
        case "elite":
          expect(eliteDropIds.has(manualId), `${skill.id} 應存在精英掉落`).toBe(true);
          break;
        case "boss":
          expect(bossDropIds.has(manualId), `${skill.id} 應存在 Boss 掉落`).toBe(true);
          break;
        case "inheritance":
          expect(
            inheritanceShop.items.some((item) => item.itemId === manualId),
            `${skill.id} 應存在傳承來源`
          ).toBe(true);
          break;
        default:
          break;
      }
    });
  });
});
