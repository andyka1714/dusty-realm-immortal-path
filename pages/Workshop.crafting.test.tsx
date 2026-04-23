import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer, { initializeCharacter } from "../store/slices/characterSlice";
import inventoryReducer from "../store/slices/inventorySlice";
import workshopReducer from "../store/slices/workshopSlice";
import logReducer from "../store/slices/logSlice";
import { Workshop } from "./Workshop";
import { Gender, MajorRealm } from "../types";
import { createInitialWorkshopSpecializationTreeState } from "../data/workshopSpecializationTree";

type TestStoreState = {
  character: ReturnType<typeof characterReducer>;
  inventory: ReturnType<typeof inventoryReducer>;
  workshop: ReturnType<typeof workshopReducer>;
  logs: ReturnType<typeof logReducer>;
};

const createWorkshopStore = (preloadedState?: Partial<TestStoreState>) =>
  configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      workshop: workshopReducer,
      logs: logReducer,
    },
    preloadedState,
  });

describe("Workshop crafting UI", () => {
  it("renders formal alchemy and smithing recipes instead of placeholder gates", () => {
    const store = createWorkshopStore();

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <Workshop />
      </Provider>
    );

    expect(markup).toContain("聚氣丹");
    expect(markup).toContain("鏽鐵劍重鑄");
    expect(markup).not.toContain("金丹期開放");
  });

  it("renders high-tier recipe cues and lock reasons without changing actor tokens", () => {
    const character = {
      ...characterReducer(
        undefined,
        initializeCharacter({ name: "韓立", gender: Gender.Male })
      ),
      majorRealm: MajorRealm.NascentSoul,
      spiritStones: 999,
    };
    const workshop = {
      ...workshopReducer(undefined, { type: "@@INIT" }),
      alchemyLevel: 8,
      unlockedRecipes: ["qi_pill", "novice_sword_reforge", "immortal_emperor_breakthrough_pill"],
      masteryByDiscipline: {
        alchemy: 12,
        smithing: 0,
      },
    };
    const store = createWorkshopStore({ character, workshop });

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <Workshop />
      </Provider>
    );

    expect(markup).toContain("九轉鴻蒙丹");
    expect(markup).toContain("高階");
    expect(markup).toContain("境界需求：化神");
    expect(markup).toContain("縹緲仙宮");
    expect(markup).toContain("品質：仙品破境丹");
    expect(markup).toContain("來源：縹緲仙宮星砂秘材");
    expect(markup).toContain("丹道熟練 +28");
    expect(markup).toContain("目前 12");
    expect(markup).toContain("鎖定原因：未達境界：化神");
    expect(markup).not.toContain("pixel-sprite");
  });

  it("renders workshop specialization state and affected recipe cues", () => {
    const character = {
      ...characterReducer(
        undefined,
        initializeCharacter({ name: "韓立", gender: Gender.Male })
      ),
      majorRealm: MajorRealm.Tribulation,
      spiritStones: 999,
    };
    const workshop = {
      ...workshopReducer(undefined, { type: "@@INIT" }),
      alchemyLevel: 8,
      blacksmithLevel: 8,
      unlockedRecipes: [
        "qi_pill",
        "novice_sword_reforge",
        "immortal_ascension_elixir",
        "great_dao_body_forge",
      ],
      masteryByDiscipline: {
        alchemy: 24,
        smithing: 4,
      },
      specializationTreeByDiscipline: {
        ...createInitialWorkshopSpecializationTreeState(),
        alchemy: {
          unlockedNodeIds: ["alchemy_inner_fire_foundation", "alchemy_hongmeng_condenser"],
          activeNodeId: "alchemy_hongmeng_condenser",
          activeBranchId: "alchemy_hongmeng",
        },
      },
      specializationByDiscipline: {
        alchemy: "alchemy_hongmeng_condenser",
        smithing: null,
      },
    };
    const store = createWorkshopStore({ character, workshop });

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <Workshop />
      </Provider>
    );

    expect(markup).toContain("百業專精樹");
    expect(markup).toContain("目前節點：鴻蒙凝丹");
    expect(markup).toContain("啟用分支：鴻蒙凝丹");
    expect(markup).toContain("目前節點：尚未選定");
    expect(markup).toContain("星火鍛胚");
    expect(markup).toContain("解鎖條件：丹道熟練 24");
    expect(markup).toContain("前置節點：內火定基");
    expect(markup).toContain("互斥分支：萬獸生息");
    expect(markup).toContain("重置 360 靈石");
    expect(markup).toContain("節點重置成本：240 靈石");
    expect(markup).toContain("鎖定原因：需先解鎖「爐心定鍛」");
    expect(markup).toContain("專精影響：鴻蒙凝丹");
    expect(markup).toContain("品質專精：爐火穩定");
    expect(markup).toContain("爐火消耗：216 靈石");
    expect(markup).toContain("原消耗 240");
    expect(markup).toContain("丹道熟練 +32");
    expect(markup).toContain("材料來源：萬獸血骨殘材");
    expect(markup).toContain("渡劫百業材料");
    expect(markup).toContain("材料 sink 維持原配方");
    expect(markup).not.toContain("pixel-sprite");
  });
});
