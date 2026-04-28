import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../../store/slices/characterSlice";
import inventoryReducer from "../../store/slices/inventorySlice";
import logReducer from "../../store/slices/logSlice";
import questReducer from "../../store/slices/questSlice";
import ShopPanel from "./ShopPanel";
import { Gender, ProfessionType } from "../../types";

vi.mock("../Modal", () => ({
  Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const createShopStore = () =>
  configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      logs: logReducer,
      quest: questReducer,
    },
    preloadedState: {
      character: characterReducer(undefined, { type: "@@INIT" }),
      inventory: inventoryReducer(undefined, { type: "@@INIT" }),
      logs: logReducer(undefined, { type: "@@INIT" }),
      quest: questReducer(undefined, { type: "@@INIT" }),
    },
  });

describe("ShopPanel supply readability", () => {
  it("shows basic supply prices, stock cues, and effects in the mortal general store", () => {
    const store = createShopStore();

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <ShopPanel shopId="general_store_mortal" onClose={() => {}} />
      </Provider>
    );

    expect(markup).toContain("聚氣丹");
    expect(markup).toContain("修為 +50");
    expect(markup).toContain("回春丹");
    expect(markup).toContain("恢復氣血 50");
    expect(markup).toContain("常備");
    expect(markup).toContain("庫存 1");
  });

  it("shows deterministic NPC attitude and discounted prices", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        quest: questReducer,
      },
      preloadedState: {
        character: {
          ...characterReducer(undefined, { type: "@@INIT" }),
          isInitialized: true,
          name: "韓立",
          gender: Gender.Male,
          profession: ProfessionType.Sword,
          attributes: {
            ...characterReducer(undefined, { type: "@@INIT" }).attributes,
            charm: 34,
          },
        },
        inventory: inventoryReducer(undefined, { type: "@@INIT" }),
        logs: logReducer(undefined, { type: "@@INIT" }),
        quest: {
          activeQuests: {},
          completedQuests: ["sect_sword_join", "sect_sword_task_04"],
          npcAffinity: {},
          sectAffinity: {},
          recentAffinityChanges: [],
        },
      },
    });

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <ShopPanel shopId="sect_shop_sword" onClose={() => {}} />
      </Provider>
    );

    expect(markup).toContain("態度：同道相助");
    expect(markup).toContain("魅力折扣 / 宗門身份 / 宗門功績");
    expect(markup).toContain("折扣 14%");
  });

  it("shows persisted NPC and sect affinity as shop discount sources", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        quest: questReducer,
      },
      preloadedState: {
        character: {
          ...characterReducer(undefined, { type: "@@INIT" }),
          isInitialized: true,
          name: "韓立",
          gender: Gender.Male,
          profession: ProfessionType.Sword,
        },
        inventory: inventoryReducer(undefined, { type: "@@INIT" }),
        logs: logReducer(undefined, { type: "@@INIT" }),
        quest: {
          activeQuests: {},
          completedQuests: ["sect_sword_join"],
          npcAffinity: {
            sect_sword_lingbao: {
              value: 18,
              lastReason: "常客往來",
              updatedAt: 100,
            },
          },
          sectAffinity: {
            sect_sword: {
              value: 12,
              lastReason: "宗門功績",
              updatedAt: 90,
            },
          },
          recentAffinityChanges: [],
        },
      },
    });

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <ShopPanel shopId="sect_shop_sword" onClose={() => {}} />
      </Provider>
    );

    expect(markup).toContain("態度：患難之交");
    expect(markup).toContain("NPC 好感：常客往來");
    expect(markup).toContain("宗門好感：宗門功績");
  });
});
