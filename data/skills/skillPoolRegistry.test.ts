import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../../types";
import {
  BATTLE_ABSORBED_RETIRED_PASSIVE_SKILLS,
  BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP,
  BATTLE_ABSORBED_RETIRED_SKILLS,
  BATTLE_ABSORBED_RETIRED_SKILL_MAP,
  FORMAL_CORE_ACTIVE_SKILLS,
  FORMAL_CORE_SKILL_MAP,
  FORMAL_CORE_SKILL_NAME_INDEX,
  FORMAL_CORE_PASSIVE_SKILLS,
  FORMAL_CORE_SKILLS_BY_REALM,
  FORMAL_CORE_SKILLS_SORTED,
  FORMAL_CORE_SKILLS_BY_PROFESSION,
  FORMAL_CORE_SKILLS_BY_SOURCE_TIER,
  getBattleAbsorbedRetiredSkills,
  getBattleAbsorbedRetiredPassiveSkills,
  getFormalCoreSkillsByRealm,
  getFormalCoreSkills,
  getSkill,
  getFormalSkill,
  getFormalSkillByNameExact,
  getFormalSkillId,
  getFormalSkillByName,
  getRetirementReadyRetiredSkills,
  getRetiredSkillsByRealm,
  getSkillsByRealm,
  isBattleAbsorbedRetiredSkill,
  isBattleAbsorbedRetiredPassiveSkill,
  isRetirementReadyRetiredSkill,
  normalizeLearnedSkills,
  RETIRED_SKILL_MAP,
  RETIRED_SKILL_NAME_INDEX,
  RETIREMENT_READY_RETIRED_SKILL_MAP,
  RETIRED_SKILLS_BY_REALM,
  SKILLS,
  SKILL_NAME_INDEX,
  SKILL_POOL_REGISTRY,
  SKILL_PROFESSION_POOLS,
} from ".";

describe("skill pool registry", () => {
  it("assigns formal pool metadata to every defined skill", () => {
    Object.values(SKILLS).forEach((skill) => {
      expect(SKILL_POOL_REGISTRY[skill.id], `${skill.id} 缺少技能池 registry`).toBeDefined();
      expect(skill.poolStatus, `${skill.id} 缺少 poolStatus`).toBeDefined();
      expect(skill.formalRole, `${skill.id} 缺少 formalRole`).toBeDefined();
      expect(skill.formalSourceTier, `${skill.id} 缺少 formalSourceTier`).toBeDefined();
      expect(skill.prerequisiteSkillIds, `${skill.id} 缺少 prerequisiteSkillIds`).toBeDefined();
    });
  });

  it("keeps exactly 12 core skills per profession with 7 active and 5 passive", () => {
    [ProfessionType.Sword, ProfessionType.Body, ProfessionType.Mage].forEach((profession) => {
      const coreSkills = SKILL_PROFESSION_POOLS[profession]
        .map((entry) => SKILLS[entry.skillId])
        .filter((skill) => skill.poolStatus === "core");

      expect(coreSkills.length, `${profession} 核心技能數量錯誤`).toBe(12);
      expect(coreSkills.filter((skill) => skill.type === "Active").length, `${profession} 核心主動技能數量錯誤`).toBe(7);
      expect(coreSkills.filter((skill) => skill.type === "Passive").length, `${profession} 核心被動技能數量錯誤`).toBe(5);
    });
  });

  it("ensures prerequisite chains only point to skills of the same profession", () => {
    Object.values(SKILLS).forEach((skill) => {
      skill.prerequisiteSkillIds?.forEach((prerequisiteSkillId) => {
        const prerequisite = SKILLS[prerequisiteSkillId];

        expect(prerequisite, `${skill.id} 的前置技能 ${prerequisiteSkillId} 不存在`).toBeDefined();
        expect(prerequisite?.profession, `${skill.id} 的前置技能 ${prerequisiteSkillId} 職業錯誤`).toBe(skill.profession);
      });
    });
  });

  it("requires non-core skills after nascent soul to be explicitly marked as transition or legacy", () => {
    Object.values(SKILLS)
      .filter((skill) => skill.minRealm >= 5)
      .forEach((skill) => {
        expect(["core", "transition", "legacy"]).toContain(skill.poolStatus);
      });
  });

  it("maps every retired skill to a formal core replacement in the same profession", () => {
    Object.values(SKILLS)
      .filter((skill) => skill.poolStatus !== "core")
      .forEach((skill) => {
        const replacement = skill.replacementSkillId
          ? SKILLS[skill.replacementSkillId]
          : undefined;

        expect(replacement, `${skill.id} 缺少 replacementSkillId`).toBeDefined();
        expect(replacement?.poolStatus, `${skill.id} 的替代技能必須是 core`).toBe("core");
        expect(replacement?.profession, `${skill.id} 的替代技能職業錯誤`).toBe(
          skill.profession
        );
      });
  });

  it("resolves retired ids to the formal core skill view", () => {
    expect(getFormalSkillId("m_ie_active")).toBe("m_tr_active");
    expect(getFormalSkill("b_ie_active")?.id).toBe("b_ma_active");
    expect(getFormalSkillByName("一念花開")?.id).toBe("m_tr_active");

    const normalized = normalizeLearnedSkills(["m_ie_active", "m_im_active", "m_tr_active"]);
    expect(normalized.map((skill) => skill.id)).toEqual(["m_tr_active"]);
  });

  it("provides per-profession formal core groupings", () => {
    expect(FORMAL_CORE_SKILLS_BY_PROFESSION[ProfessionType.Sword]).toHaveLength(12);
    expect(FORMAL_CORE_SKILLS_BY_PROFESSION[ProfessionType.Body]).toHaveLength(12);
    expect(FORMAL_CORE_SKILLS_BY_PROFESSION[ProfessionType.Mage]).toHaveLength(12);
  });

  it("keeps formal core skill views sorted by realm", () => {
    const allFormalRealms = FORMAL_CORE_SKILLS_SORTED.map((skill) => skill.minRealm);
    expect(allFormalRealms).toEqual([...allFormalRealms].sort((left, right) => left - right));

    [ProfessionType.Sword, ProfessionType.Body, ProfessionType.Mage].forEach((profession) => {
      const professionRealms = FORMAL_CORE_SKILLS_BY_PROFESSION[profession].map(
        (skill) => skill.minRealm
      );
      expect(professionRealms).toEqual(
        [...professionRealms].sort((left, right) => left - right)
      );
    });
  });

  it("builds formal source-tier and type indexes from the core pool", () => {
    expect(FORMAL_CORE_ACTIVE_SKILLS.every((skill) => skill.poolStatus === "core")).toBe(true);
    expect(FORMAL_CORE_PASSIVE_SKILLS.every((skill) => skill.poolStatus === "core")).toBe(true);
    expect(FORMAL_CORE_ACTIVE_SKILLS.every((skill) => skill.type === "Active")).toBe(true);
    expect(FORMAL_CORE_PASSIVE_SKILLS.every((skill) => skill.type === "Passive")).toBe(true);

    const indexedCoreCount =
      FORMAL_CORE_SKILLS_BY_SOURCE_TIER.shop.length +
      FORMAL_CORE_SKILLS_BY_SOURCE_TIER.elite.length +
      FORMAL_CORE_SKILLS_BY_SOURCE_TIER.boss.length +
      FORMAL_CORE_SKILLS_BY_SOURCE_TIER.inheritance.length;

    expect(indexedCoreCount).toBe(FORMAL_CORE_SKILLS_SORTED.length);
  });

  it("supports formal core filtering by source tier, realm, profession, and type", () => {
    expect(
      getFormalCoreSkills({ formalSourceTier: "inheritance" }).every(
        (skill) => skill.formalSourceTier === "inheritance"
      )
    ).toBe(true);

    expect(
      getFormalCoreSkills({
        profession: ProfessionType.Sword,
        formalSourceTier: "boss",
        type: "Active",
      }).every(
        (skill) =>
          skill.profession === ProfessionType.Sword &&
          skill.formalSourceTier === "boss" &&
          skill.type === "Active"
      )
    ).toBe(true);

    expect(
      getFormalCoreSkills({ minRealm: 7 }).every((skill) => skill.minRealm === 7)
    ).toBe(true);
  });

  it("builds realm-level skill datasets for formal and retired slices", () => {
    expect(getSkillsByRealm(MajorRealm.VoidRefining).length).toBeGreaterThan(0);
    expect(getFormalCoreSkillsByRealm(MajorRealm.VoidRefining)).toEqual(
      FORMAL_CORE_SKILLS_BY_REALM[MajorRealm.VoidRefining]
    );
    expect(getRetiredSkillsByRealm(MajorRealm.VoidRefining)).toEqual(
      RETIRED_SKILLS_BY_REALM[MajorRealm.VoidRefining]
    );
    expect(
      getFormalCoreSkillsByRealm(MajorRealm.VoidRefining).every(
        (skill) => skill.poolStatus === "core"
      )
    ).toBe(true);
    expect(
      getRetiredSkillsByRealm(MajorRealm.VoidRefining).every(
        (skill) => skill.poolStatus !== "core"
      )
    ).toBe(true);
  });

  it("builds name and id indexes for formal and retired skills", () => {
    expect(FORMAL_CORE_SKILL_MAP.s_q_active?.poolStatus).toBe("core");
    expect(RETIRED_SKILL_MAP.s_ie_active?.poolStatus).toBe("legacy");
    expect(SKILL_NAME_INDEX["一念花開"]?.id).toBe("m_ie_active");
    expect(FORMAL_CORE_SKILL_NAME_INDEX["萬劍歸一"]).toBeUndefined();
    expect(RETIRED_SKILL_NAME_INDEX["萬劍歸一"]?.id).toBe("s_bi_active");
    expect(getFormalSkillByNameExact("疾風三疊")?.id).toBe("s_q_active");
  });

  it("tracks which retired actives are already battle-absorbed by formal core skills", () => {
    expect(BATTLE_ABSORBED_RETIRED_SKILL_MAP.s_vr_active?.replacementSkillId).toBe("s_ma_active");
    expect(BATTLE_ABSORBED_RETIRED_SKILL_MAP.s_bi_active?.replacementSkillId).toBe("s_tr_active");
    expect(BATTLE_ABSORBED_RETIRED_SKILL_MAP.b_ie_active?.replacementSkillId).toBe("b_ma_active");
    expect(BATTLE_ABSORBED_RETIRED_SKILL_MAP.m_ie_active?.replacementSkillId).toBe("m_tr_active");
    expect(isBattleAbsorbedRetiredSkill("m_im_active")).toBe(true);
    expect(isBattleAbsorbedRetiredSkill("m_bi_active")).toBe(true);
    expect(isBattleAbsorbedRetiredSkill("b_tr_active")).toBe(true);
    expect(isBattleAbsorbedRetiredSkill("s_bi_active")).toBe(true);

    const absorbedIds = getBattleAbsorbedRetiredSkills().map((skill) => skill.id);
    const expectedIds = [...BATTLE_ABSORBED_RETIRED_SKILLS]
      .sort((left, right) => {
        if (left.minRealm !== right.minRealm) return left.minRealm - right.minRealm;
        if (left.type !== right.type) return left.type === "Active" ? -1 : 1;
        return left.name.localeCompare(right.name, "zh-Hant");
      })
      .map((skill) => skill.id);

    expect(absorbedIds).toEqual(expectedIds);
  });

  it("surfaces retirement-ready retired actives for the next data cleanup step", () => {
    expect(RETIREMENT_READY_RETIRED_SKILL_MAP.s_vr_active?.type).toBe("Active");
    expect(RETIREMENT_READY_RETIRED_SKILL_MAP.b_ie_active?.replacementSkillId).toBe("b_ma_active");
    expect(RETIREMENT_READY_RETIRED_SKILL_MAP.m_ie_active?.replacementSkillId).toBe("m_tr_active");
    expect(isRetirementReadyRetiredSkill("s_im_active")).toBe(true);
    expect(isRetirementReadyRetiredSkill("s_bi_passive")).toBe(false);
    expect(
      getRetirementReadyRetiredSkills().every((skill) => skill.poolStatus !== "core" && skill.type === "Active")
    ).toBe(true);
  });

  it("keeps retirement-ready retired actives out of realm datasets after centralizing aliases", () => {
    expect(getSkillsByRealm(MajorRealm.VoidRefining).some((skill) => skill.id === "s_vr_active")).toBe(false);
    expect(getSkillsByRealm(MajorRealm.Fusion).some((skill) => skill.id === "b_bi_active")).toBe(false);
    expect(getSkillsByRealm(MajorRealm.Mahayana).some((skill) => skill.id === "m_ma_active")).toBe(false);
    expect(getSkillsByRealm(MajorRealm.Immortal).some((skill) => skill.id === "s_im_active")).toBe(false);
    expect(getSkillsByRealm(MajorRealm.ImmortalEmperor).some((skill) => skill.id === "m_ie_active")).toBe(false);
  });

  it("keeps battle-absorbed retired passives addressable after alias centralization", () => {
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.s_f_passive?.replacementSkillId).toBe(
      "s_g_passive"
    );
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.s_vr_passive?.replacementSkillId).toBe(
      "s_tr_passive"
    );
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.s_ie_passive?.replacementSkillId).toBe(
      "s_tr_passive"
    );
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.s_bi_passive?.replacementSkillId).toBe(
      "s_tr_passive"
    );
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.b_tr_passive?.replacementSkillId).toBe(
      "b_sf_passive"
    );
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.m_tr_passive?.replacementSkillId).toBe(
      "m_sf_passive"
    );
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.b_ie_passive?.replacementSkillId).toBe(
      "b_sf_passive"
    );
    expect(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP.m_ie_passive?.replacementSkillId).toBe(
      "m_sf_passive"
    );
    expect(isBattleAbsorbedRetiredPassiveSkill("s_im_passive")).toBe(true);
    expect(isBattleAbsorbedRetiredPassiveSkill("s_f_passive")).toBe(true);
    expect(isBattleAbsorbedRetiredPassiveSkill("s_vr_passive")).toBe(true);
    expect(isBattleAbsorbedRetiredPassiveSkill("m_tr_passive")).toBe(true);
    expect(isBattleAbsorbedRetiredPassiveSkill("b_vr_passive")).toBe(true);
    expect(isBattleAbsorbedRetiredPassiveSkill("m_ma_passive")).toBe(true);
    expect(
      getSkillsByRealm(MajorRealm.Immortal).some((skill) => skill.id === "b_im_passive")
    ).toBe(false);
    expect(
      getBattleAbsorbedRetiredPassiveSkills().map((skill) => skill.id)
    ).toEqual(BATTLE_ABSORBED_RETIRED_PASSIVE_SKILLS.map((skill) => skill.id).sort((left, right) => {
      const leftSkill = BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP[left];
      const rightSkill = BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_MAP[right];
      if (leftSkill.minRealm !== rightSkill.minRealm) return leftSkill.minRealm - rightSkill.minRealm;
      if (leftSkill.type !== rightSkill.type) return leftSkill.type === "Active" ? -1 : 1;
      return leftSkill.name.localeCompare(rightSkill.name, "zh-Hant");
    }));
  });

  it("keeps retirement-ready retired skills scoped to absorbed active aliases after pending cleanup", () => {
    expect(RETIREMENT_READY_RETIRED_SKILL_MAP.s_bi_active?.replacementSkillId).toBe(
      "s_tr_active"
    );
    expect(RETIREMENT_READY_RETIRED_SKILL_MAP.b_ie_active?.replacementSkillId).toBe(
      "b_ma_active"
    );
    expect(RETIREMENT_READY_RETIRED_SKILL_MAP.m_ie_active?.replacementSkillId).toBe(
      "m_tr_active"
    );
    expect(
      getRetirementReadyRetiredSkills().every(
        (skill) =>
          isBattleAbsorbedRetiredSkill(skill.id) &&
          !isBattleAbsorbedRetiredPassiveSkill(skill.id)
      )
    ).toBe(true);
    expect(
      getSkillsByRealm(MajorRealm.Foundation).some((skill) => skill.id === "s_f_passive")
    ).toBe(false);
  });

  it("keeps retirement-ready retired actives out of realm datasets while preserving central lookup compatibility", () => {
    expect(getSkill("s_vr_active")?.replacementSkillId).toBe("s_ma_active");
    expect(getSkill("b_ie_active")?.replacementSkillId).toBe("b_ma_active");
    expect(getSkill("m_ie_active")?.replacementSkillId).toBe("m_tr_active");

    expect(
      getSkillsByRealm(MajorRealm.VoidRefining).some(
        (skill) => skill.id === "s_vr_active"
      )
    ).toBe(false);
    expect(
      getSkillsByRealm(MajorRealm.Fusion).some(
        (skill) => skill.id === "b_bi_active"
      )
    ).toBe(false);
    expect(
      getSkillsByRealm(MajorRealm.ImmortalEmperor).some(
        (skill) => skill.id === "m_ie_active"
      )
    ).toBe(false);
  });
});
