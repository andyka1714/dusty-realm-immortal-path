import { describe, expect, it, vi, afterEach } from "vitest";
import reducer, {
  attemptBreakthrough,
  consumeItem,
  learnSkill,
  setProfession,
} from "./characterSlice";
import { ConsumableItem, Gender, MajorRealm, ProfessionType, SpiritRootId } from "../../types";
import { ITEMS } from "../../data/items";
import { getSkillManualId } from "../../data/items/manuals";

describe("character skill acquisition rules", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not auto-grant profession skills on profession selection", () => {
    const state = reducer(undefined, setProfession(ProfessionType.Sword));
    expect(state.skills).toEqual([]);
  });

  it("does not auto-grant profession skills on major breakthrough", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const start = reducer(undefined, { type: "test/init" });
    const state = {
      ...start,
      isInitialized: true,
      gender: Gender.Male,
      spiritRootId: SpiritRootId.MIXED_FIVE,
      profession: ProfessionType.Sword,
      majorRealm: MajorRealm.Mortal,
      minorRealm: 9,
      currentExp: start.maxExp,
      isBreakthroughAvailable: true,
    };

    const next = reducer(
      state,
      attemptBreakthrough({ successChanceBonus: 0, consumedItem: true })
    );

    expect(next.majorRealm).toBe(MajorRealm.QiRefining);
    expect(next.skills).toEqual([]);
  });

  it("learns a skill from manuals only when realm and profession requirements are met", () => {
    const manual = ITEMS[getSkillManualId("s_q_active")] as ConsumableItem;
    const base = reducer(undefined, { type: "test/init" });

    const wrongProfession = reducer(
      {
        ...base,
        profession: ProfessionType.Body,
        majorRealm: MajorRealm.QiRefining,
      },
      consumeItem({
        itemId: manual.id,
        effects: manual.effects,
        maxConsumption: manual.maxUsage,
      })
    );
    expect(wrongProfession.skills).not.toContain("s_q_active");

    const wrongRealm = reducer(
      {
        ...base,
        profession: ProfessionType.Sword,
        majorRealm: MajorRealm.Mortal,
      },
      consumeItem({
        itemId: manual.id,
        effects: manual.effects,
        maxConsumption: manual.maxUsage,
      })
    );
    expect(wrongRealm.skills).not.toContain("s_q_active");

    const learned = reducer(
      {
        ...base,
        profession: ProfessionType.Sword,
        majorRealm: MajorRealm.QiRefining,
      },
      consumeItem({
        itemId: manual.id,
        effects: manual.effects,
        maxConsumption: manual.maxUsage,
      })
    );
    expect(learned.skills).toContain("s_q_active");
  });

  it("requires prerequisite skills before learning higher tier manuals", () => {
    const manual = ITEMS[getSkillManualId("s_f_active")] as ConsumableItem;
    const base = reducer(undefined, { type: "test/init" });

    const blocked = reducer(
      {
        ...base,
        profession: ProfessionType.Sword,
        majorRealm: MajorRealm.Foundation,
        skills: [],
      },
      consumeItem({
        itemId: manual.id,
        effects: manual.effects,
        maxConsumption: manual.maxUsage,
      })
    );
    expect(blocked.skills).not.toContain("s_f_active");

    const learned = reducer(
      {
        ...base,
        profession: ProfessionType.Sword,
        majorRealm: MajorRealm.Foundation,
        skills: ["s_q_active"],
      },
      consumeItem({
        itemId: manual.id,
        effects: manual.effects,
        maxConsumption: manual.maxUsage,
      })
    );
    expect(learned.skills).toContain("s_f_active");
  });

  it("uses replacement-aware prerequisite checks for legacy learned skills", () => {
    const base = reducer(undefined, { type: "test/init" });

    const learned = reducer(
      {
        ...base,
        profession: ProfessionType.Sword,
        majorRealm: MajorRealm.Tribulation,
        skills: ["s_n_active", "s_vr_active"],
      },
      consumeItem({
        itemId: "legacy_bi_manual",
        effects: [{ type: "learn_skill", skillId: "s_bi_active", value: 0 }],
      })
    );

    expect(learned.skills).toContain("s_tr_active");
    expect(learned.skills).not.toContain("s_bi_active");
  });

  it("normalizes retired skills into their formal replacement on character init flows", () => {
    const base = reducer(undefined, { type: "test/init" });

    const next = reducer(
      {
        ...base,
        isInitialized: true,
        skills: ["m_ie_active", "m_im_active", "m_tr_active"],
      },
      consumeItem({
        itemId: "noop",
        effects: [{ type: "gain_exp", value: 1 }],
      })
    );

    expect(next.skills).toContain("m_tr_active");
    expect(next.skills).not.toContain("m_ie_active");
    expect(next.skills).not.toContain("m_im_active");
  });

  it("maps retired manuals to the formal replacement skill instead of learning legacy entries", () => {
    const base = reducer(undefined, { type: "test/init" });

    const learned = reducer(
      {
        ...base,
        profession: ProfessionType.Mage,
        majorRealm: MajorRealm.ImmortalEmperor,
        skills: ["m_g_active", "m_n_active", "m_tr_active"],
      },
      consumeItem({
        itemId: "legacy_manual",
        effects: [{ type: "learn_skill", skillId: "m_ie_active", value: 0 }],
      })
    );

    expect(learned.skills).toContain("m_tr_active");
    expect(learned.skills).not.toContain("m_ie_active");
  });

  it("normalizes legacy ids when learnSkill reducer is used directly", () => {
    const base = reducer(undefined, { type: "test/init" });

    const learned = reducer(
      {
        ...base,
        skills: [],
      },
      learnSkill("b_ie_active")
    );

    expect(learned.skills).toContain("b_ma_active");
    expect(learned.skills).not.toContain("b_ie_active");
  });

  it("does not count runtime-only recovery effects as consumed character effects", () => {
    const base = reducer(undefined, { type: "test/init" });

    const next = reducer(
      {
        ...base,
        itemConsumption: {},
      },
      consumeItem({
        itemId: "heal_pill",
        effects: [{ type: "heal_hp", value: 50 }],
      })
    );

    expect(next.itemConsumption.heal_pill).toBeUndefined();
  });
});
