import { describe, expect, it, vi, afterEach } from "vitest";
import reducer, {
  attemptBreakthrough,
  consumeItem,
  equipActiveSkill,
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

  it("records a recoverable tribulation consequence after unsafe major breakthrough failure", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);

    const base = reducer(undefined, { type: "test/init" });
    const failed = reducer(
      {
        ...base,
        isInitialized: true,
        majorRealm: MajorRealm.Tribulation,
        minorRealm: 9,
        currentExp: base.maxExp,
        maxExp: base.maxExp,
        isBreakthroughAvailable: true,
      },
      attemptBreakthrough({ successChanceBonus: 0, consumedItem: true })
    );

    expect(failed.lastBreakthroughResult).toMatchObject({
      success: false,
      isTribulation: true,
      isMajor: true,
    });
    expect(failed.breakthroughConsequence).toMatchObject({
      type: "heart_demon",
      severity: "major",
      remainingDays: 365,
    });
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

  it("equips only learned active skills for the current profession", () => {
    const base = {
      ...reducer(undefined, { type: "test/init" }),
      profession: ProfessionType.Sword,
      majorRealm: MajorRealm.Foundation,
      skills: ["s_q_active", "s_f_active", "s_q_passive", "b_q_active"],
    };

    const equipped = reducer(base, equipActiveSkill("s_f_active"));
    expect(equipped.equippedActiveSkillId).toBe("s_f_active");

    const passiveBlocked = reducer(equipped, equipActiveSkill("s_q_passive"));
    expect(passiveBlocked.equippedActiveSkillId).toBe("s_f_active");

    const wrongProfessionBlocked = reducer(equipped, equipActiveSkill("b_q_active"));
    expect(wrongProfessionBlocked.equippedActiveSkillId).toBe("s_f_active");

    const cleared = reducer(equipped, equipActiveSkill(null));
    expect(cleared.equippedActiveSkillId).toBeNull();
  });

  it("allows learned common active skills to be equipped by any profession", () => {
    const base = {
      ...reducer(undefined, { type: "test/init" }),
      profession: ProfessionType.Sword,
      majorRealm: MajorRealm.Foundation,
      skills: ["common_f_active"],
    };

    const equipped = reducer(base, equipActiveSkill("common_f_active"));

    expect(equipped.equippedActiveSkillId).toBe("common_f_active");
  });

  it("clears breakthrough consequence when initializing a new run", () => {
    const base = reducer(undefined, { type: "test/init" });
    const initialized = reducer(
      {
        ...base,
        breakthroughConsequence: {
          type: "heart_demon",
          severity: "major",
          remainingDays: 365,
          label: "心魔纏身",
          recoveryHint: "靜修或服用清心丹可降低影響。",
        },
      },
      {
        type: "character/initializeCharacter",
        payload: {
          name: "韓立",
          gender: Gender.Male,
          spiritRootId: SpiritRootId.MIXED_FIVE,
        },
      }
    );

    expect(initialized.breakthroughConsequence).toBeNull();
  });

  it("does not count runtime-only recovery effects as consumed character effects", () => {
    const base = reducer(undefined, { type: "test/init" });

    const afterHealHp = reducer(
      {
        ...base,
        itemConsumption: {},
      },
      consumeItem({
        itemId: "heal_pill",
        effects: [{ type: "heal_hp", value: 50 }],
      })
    );

    const afterHealMp = reducer(afterHealHp, consumeItem({
      itemId: "spirit_recovery_test",
      effects: [{ type: "heal_mp", value: 30 }],
    }));

    const afterFullRestore = reducer(afterHealMp, consumeItem({
      itemId: "full_restore_test",
      effects: [{ type: "full_restore", value: 0 }],
    }));

    expect(afterFullRestore.itemConsumption.heal_pill).toBeUndefined();
    expect(afterFullRestore.itemConsumption.spirit_recovery_test).toBeUndefined();
    expect(afterFullRestore.itemConsumption.full_restore_test).toBeUndefined();
  });
});
