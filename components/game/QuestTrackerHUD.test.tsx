import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../../store/slices/characterSlice";
import inventoryReducer from "../../store/slices/inventorySlice";
import questReducer from "../../store/slices/questSlice";
import { QuestTrackerHUD } from "./QuestTrackerHUD";

const createMarkup = (
  activeQuests: ReturnType<typeof questReducer>["activeQuests"] = {},
  completedQuests: string[] = []
) => {
  const store = configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      quest: questReducer,
    },
    preloadedState: {
      character: characterReducer(undefined, { type: "@@INIT" }),
      inventory: inventoryReducer(undefined, { type: "@@INIT" }),
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
    expect(markup).toContain('data-lifecycle-status="ready"');
    expect(markup).toContain("劍宗試煉：斬虎");
    expect(markup).toContain("討伐 守山靈虎");
    expect(markup).toContain("0 / 1");
    expect(markup).toContain('data-lifecycle-status="active"');
    expect(markup).toContain('data-layout-anchor="below-character-hud"');
  });

  it("aligns with the character HUD and avoids duplicated ready dialogue copy", () => {
    const markup = createMarkup({
      tutorial_01: { progress: 0, isReadyToComplete: true },
    });

    expect(markup).toContain("w-[min(370px,calc(100vw-2rem))]");
    expect(markup).toContain("回報林守拙");
    expect(markup).not.toContain("對話：前往");
    expect(markup).not.toContain("village_chief");
    expect(markup).not.toContain("前往林守拙");
    expect(markup).not.toContain(
      '<span class="shrink-0 text-stone-500">可回報</span>'
    );
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
    const markup = createMarkup({}, ["tutorial_01"]);

    expect(markup).toContain("防身利器");
    expect(markup).toContain("村長建議你去鐵匠鋪領取一把防身兵器。");
    expect(markup).toContain("可接取");
    expect(markup).toContain('data-lifecycle-status="available"');
    expect(markup).toContain('data-testid="quest-tracker-item-tutorial_02_get_sword"');
    expect(markup).toContain('data-navigation-kind="npc"');
    expect(markup).toContain("前往林守拙");
    expect(markup).not.toContain("前往鐵匠鋪");
    expect(markup).not.toContain("前往對話");
    expect(markup).not.toContain("village_chief");
    expect(markup).not.toContain("village_blacksmith");
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
