import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../../store/slices/characterSlice";
import logReducer from "../../store/slices/logSlice";
import { Gender, MajorRealm, ProfessionType } from "../../types";
import { SkillPanel } from "./SkillPanel";

const renderSkillPanel = (skills: string[], equippedActiveSkillId: string | null = null) => {
  const store = configureStore({
    reducer: {
      character: characterReducer,
      logs: logReducer,
    },
    preloadedState: {
      character: {
        ...characterReducer(undefined, { type: "@@INIT" }),
        isInitialized: true,
        name: "韓立",
        gender: Gender.Male,
        profession: ProfessionType.Sword,
        majorRealm: MajorRealm.Foundation,
        skills,
        equippedActiveSkillId,
      },
      logs: logReducer(undefined, { type: "@@INIT" }),
    },
  });

  return renderToStaticMarkup(
    <Provider store={store}>
      <SkillPanel />
    </Provider>
  );
};

describe("SkillPanel", () => {
  it("renders learned active skills, passive skills, and current combat loadout", () => {
    const markup = renderSkillPanel(["s_q_active", "s_f_active", "s_q_passive"], "s_q_active");

    expect(markup).toContain("戰鬥功法");
    expect(markup).toContain("目前裝備");
    expect(markup).toContain("疾風三疊");
    expect(markup).toContain("流光劍影");
    expect(markup).toContain("被動心法");
    expect(markup).toContain("劍脈初成");
    expect(markup).toContain('data-testid="skill-panel"');
  });

  it("keeps the learned skill panel separate from the world compendium", () => {
    const markup = renderSkillPanel([]);

    expect(markup).toContain("尚未學會可用功法");
    expect(markup).toContain("藏經閣");
    expect(markup).not.toContain("萬界圖鑑");
  });

  it("explains the full manual acquisition, inventory study, and combat equip loop", () => {
    const markup = renderSkillPanel(["s_q_active"]);

    expect(markup).toContain("功法取得流程");
    expect(markup).toContain("藏經閣購買");
    expect(markup).toContain("背包參悟");
    expect(markup).toContain("裝備參戰");
    expect(markup).toContain("買到秘卷不等於已學會");
  });
});
