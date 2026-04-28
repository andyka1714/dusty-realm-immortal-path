import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../../store/slices/characterSlice";
import questReducer from "../../store/slices/questSlice";
import { NPCType } from "../../types";
import { QuestModal } from "./QuestModal";

vi.mock("../Modal", () => ({
  Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

describe("QuestModal affinity display", () => {
  it("shows persisted NPC relationship and latest reason", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        quest: questReducer,
      },
      preloadedState: {
        character: characterReducer(undefined, { type: "@@INIT" }),
        quest: {
          activeQuests: {},
          completedQuests: [],
          npcAffinity: {
            sect_sword_patrol_captain: {
              value: 18,
              lastReason: "完成任務：巡山統領",
              updatedAt: 123,
            },
          },
          sectAffinity: {
            sect_sword: {
              value: 5,
              lastReason: "完成宗門任務",
              updatedAt: 123,
            },
          },
          recentAffinityChanges: [],
        },
      },
    });

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <QuestModal
          npc={{
            id: "sect_sword_patrol_captain",
            name: "巡山統領",
            symbol: "巡",
            type: NPCType.Quest,
            x: 1,
            y: 1,
            description: "巡山統領",
          }}
          onClose={() => {}}
        />
      </Provider>
    );

    expect(markup).toContain("關係：患難之交");
    expect(markup).toContain("NPC 好感：完成任務：巡山統領");
    expect(markup).toContain("宗門好感：完成宗門任務");
  });
});
