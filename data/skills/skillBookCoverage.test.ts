import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../../types";
import { ITEMS } from "../items";
import { ELITE_ENEMIES } from "../enemies/elite";
import { BOSS_ENEMIES } from "../enemies/boss";
import { QUESTS } from "../quests";
import { SHOPS } from "../shops";
import { ConsumableItem } from "../../types";
import { FORMAL_CORE_SKILLS, SKILLS, getSkillFormalAcquisitionTier } from ".";
import {
  getSkillManualAcquisitionTierLabel,
  getSkillManualId,
  resolveFormalSkillManualItemId,
  SKILL_MANUAL_SOURCE_REGISTRY,
} from "../items/manuals";

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

const getQuestRewardItemIds = () =>
  new Set(
    Object.values(QUESTS).flatMap((quest) =>
      quest.rewards.flatMap((reward) => reward.items?.map((item) => item.itemId) ?? [])
    )
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
      expect(item?.manualSkillId).toBe(skill.id);
      expect(item?.manualAcquisitionTier).toBe(getSkillFormalAcquisitionTier(skill));
      expect(item?.manualSourceTypes).toEqual(
        SKILL_MANUAL_SOURCE_REGISTRY[skill.id]?.sources.map((source) => source.type)
      );
      expect(item?.prerequisiteSkillIds).toEqual(skill.prerequisiteSkillIds ?? []);
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

  it("maps retired manual ids to formal core manuals for migration without re-exposing them", () => {
    expect(resolveFormalSkillManualItemId(getSkillManualId("s_bi_active"))).toBe(
      getSkillManualId("s_tr_active")
    );
    expect(resolveFormalSkillManualItemId("m_ie_active_manual")).toBe(
      getSkillManualId("m_tr_active")
    );
    expect(ITEMS[getSkillManualId("s_bi_active")]).toBeUndefined();
    expect(ITEMS[getSkillManualId("m_ie_active")]).toBeUndefined();
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
      expect(entry?.acquisitionTier).toBe(getSkillFormalAcquisitionTier(skill));
      expect(entry?.acquisitionTierLabel).toBe(
        getSkillManualAcquisitionTierLabel(getSkillFormalAcquisitionTier(skill))
      );
      expect(entry?.requiredRealm).toBe(skill.minRealm);
      expect(entry?.requiredProfession).toBe(
        skill.profession && skill.profession !== ProfessionType.None
          ? skill.profession
          : undefined
      );
      expect(entry?.prerequisiteSkillIds).toEqual(skill.prerequisiteSkillIds ?? []);
    });
  });

  it("aligns manual source registry entries with actual obtainable sources", () => {
    const shopItemIds = getShopItemIds();
    const eliteDropIds = getEliteDropIds();
    const bossDropIds = getBossDropIds();
    const questRewardIds = getQuestRewardItemIds();
    const inheritanceShopIds = new Set(
      SHOPS.inheritance_pavilion.items.map((item) => item.itemId)
    );

    FORMAL_CORE_SKILLS.forEach((skill) => {
      const manualId = getSkillManualId(skill.id);
      const sourceTypes =
        SKILL_MANUAL_SOURCE_REGISTRY[skill.id]?.sources.map((source) => source.type) ?? [];

      sourceTypes.forEach((sourceType) => {
        switch (sourceType) {
          case "shop_mortal":
          case "shop_sect":
            expect(shopItemIds.has(manualId), `${skill.id} 應存在商店來源`).toBe(true);
            break;
          case "quest_sect_trial":
            expect(questRewardIds.has(manualId), `${skill.id} 應存在宗門試煉來源`).toBe(true);
            expect(skill.minRealm).toBe(MajorRealm.QiRefining);
            expect(skill.type).toBe("Active");
            break;
          case "drop_elite":
            expect(eliteDropIds.has(manualId), `${skill.id} 應存在精英掉落`).toBe(true);
            break;
          case "drop_boss":
            expect(bossDropIds.has(manualId), `${skill.id} 應存在 Boss 掉落`).toBe(true);
            break;
          case "inheritance":
            expect(inheritanceShopIds.has(manualId), `${skill.id} 應存在傳承來源`).toBe(true);
            break;
          default:
            break;
        }
      });
    });
  });

  it("keeps formal high-realm skill descriptions aligned with supported battle semantics", () => {
    const expectedDescriptions: Record<string, string> = {
      s_n_active: "對單體造成 400% 劍傷，並附加【流血】3 回合。",
      m_n_active: "對全體造成 250% 雷法傷害。",
      s_sf_active: "對單體造成 600% 劍傷，且本次必定暴擊。",
      b_sf_active: "對全體造成 250% 體魄傷害，並施加【破甲】與【易傷】2 回合。",
      m_sf_active: "對單體造成 300% 火法傷害，並附加【燃燒】3 回合。",
      b_vr_active:
        "對非 Boss 直接吞噬斬殺；對 Boss 造成 500% 傷害並附加【中毒】3 回合，自身獲得【反震】。",
      m_vr_active: "將敵方放逐 1 回合，使其暫時無法行動。",
      s_ma_active:
        "對全體造成 500% 劍傷，並施加【絕仙封脈】3 回合；後續劍陣會再追斬兩次。",
      b_ma_active:
        "對全體造成重擊並附加【暈眩】1 回合；同時獲得【法天象地】護體並回復氣血。",
      s_tr_active:
        "對單體造成 1000% 斬擊傷害，附加【燃燒】與【誅仙劍陣】破甲；若擊殺目標，重置此技能冷卻。",
      m_tr_active:
        "對全體造成 800% 雷法傷害並施加【麻痺】；若目標仍存活，會再觸發反噬與金甲天兵追擊。",
    };

    Object.entries(expectedDescriptions).forEach(([skillId, description]) => {
      expect(SKILLS[skillId]?.description, `${skillId} 描述未對齊最新實作`).toBe(description);
    });

    const unsupportedDescriptionFragments = [
      "無視防禦",
      "傷害翻倍",
      "引導 2 回合",
      "冷卻時間暫停",
      "不可驅散",
      "50% 當前生命值",
    ];

    FORMAL_CORE_SKILLS.filter((skill) => skill.minRealm >= MajorRealm.NascentSoul).forEach(
      (skill) => {
        unsupportedDescriptionFragments.forEach((fragment) => {
          expect(
            skill.description.includes(fragment),
            `${skill.id} 仍保留超出目前引擎語意的描述片段：${fragment}`
          ).toBe(false);
        });
      }
    );
  });
});
