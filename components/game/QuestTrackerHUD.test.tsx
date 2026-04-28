import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../../store/slices/characterSlice";
import questReducer from "../../store/slices/questSlice";
import { QuestTrackerHUD } from "./QuestTrackerHUD";

const createMarkup = (
  activeQuests: ReturnType<typeof questReducer>["activeQuests"] = {},
  completedQuests: string[] = []
) => {
  const store = configureStore({
    reducer: {
      character: characterReducer,
      quest: questReducer,
    },
    preloadedState: {
      character: characterReducer(undefined, { type: "@@INIT" }),
      quest: {
        activeQuests,
        completedQuests,
      },
    },
  });

  return renderToStaticMarkup(
    <Provider store={store}>
      <QuestTrackerHUD />
    </Provider>
  );
};

describe("QuestTrackerHUD", () => {
  it("renders active quest progress and ready state", () => {
    const markup = createMarkup({
      tutorial_02_get_sword: { progress: 0, isReadyToComplete: true },
      sect_sword_task_01: { progress: 0, isReadyToComplete: false },
    });

    expect(markup).toContain("任務追蹤");
    expect(markup).toContain("防身利器");
    expect(markup).toContain("可回報");
    expect(markup).toContain("劍宗試煉：斬虎");
    expect(markup).toContain("討伐 0 / 1");
    expect(markup).toContain('data-layout-anchor="below-character-hud"');
  });

  it("renders a compact empty state", () => {
    const markup = createMarkup({}, [
      "tutorial_01",
      "tutorial_02_get_sword",
      "tutorial_03_scripture_intro",
    ]);

    expect(markup).toContain("目前沒有進行中的任務");
  });

  it("renders next main quest guidance when no quest is active", () => {
    const markup = createMarkup({}, ["tutorial_01", "tutorial_02_get_sword"]);

    expect(markup).toContain("藏經初問");
    expect(markup).toContain("下一主線");
    expect(markup).toContain('data-testid="quest-tracker-item-tutorial_03_scripture_intro"');
    expect(markup).toContain('data-navigation-kind="npc"');
    expect(markup).toContain("前往藏經閣執事");
  });

  it("renders a mobile trigger and collapsible sheet without persisted state", () => {
    const markup = createMarkup({
      tutorial_02_get_sword: { progress: 0, isReadyToComplete: true },
    });

    expect(markup).toContain('data-testid="quest-tracker-mobile-toggle"');
    expect(markup).toContain('aria-controls="quest-tracker-mobile-panel"');
    expect(markup).toContain('data-testid="quest-tracker-mobile-panel"');
    expect(markup).toContain("任務");
    expect(markup).toContain("防身利器");
  });
});
