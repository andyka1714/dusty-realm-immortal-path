import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../store/slices/characterSlice";
import inventoryReducer from "../store/slices/inventorySlice";
import logReducer from "../store/slices/logSlice";
import { Inventory } from "./Inventory";

type TestStoreState = {
  character: ReturnType<typeof characterReducer>;
  inventory: ReturnType<typeof inventoryReducer>;
  logs: ReturnType<typeof logReducer>;
};

const createInventoryStore = (preloadedState?: Partial<TestStoreState>) =>
  configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      logs: logReducer,
    },
    preloadedState,
  });

const renderInventory = (
  props: Partial<React.ComponentProps<typeof Inventory>> = {},
  itemId = "heal_pill"
) => {
  const inventory = {
    ...inventoryReducer(undefined, { type: "@@INIT" }),
    items: [{ itemId, count: 2 }],
  };
  const store = createInventoryStore({ inventory });

  return renderToStaticMarkup(
    <Provider store={store}>
      <Inventory embedded initialSelectedItemId={itemId} {...props} />
    </Provider>
  );
};

describe("Inventory combat supplies", () => {
  it("blocks recovery pills when no combat HP resource is available", () => {
    const markup = renderInventory();

    expect(markup).toContain("回春丹");
    expect(markup).toContain("恢復氣血: 50");
    expect(markup).toContain("目前無法使用：目前沒有可恢復的戰鬥氣血");
  });

  it("shows recovery pills as usable when a damaged HP resource is provided", () => {
    const markup = renderInventory({
      combatResourceContext: {
        hp: { current: 40, max: 120 },
      },
      onUseRecoveryConsumable: () => true,
    });

    expect(markup).toContain("回春丹");
    expect(markup).not.toContain("目前無法使用");
    expect(markup).toContain("戰鬥補給共用冷卻：5 秒");
  });

  it("blocks recovery pills when no runtime recovery handler is provided", () => {
    const markup = renderInventory({
      combatResourceContext: {
        hp: { current: 40, max: 120 },
      },
    });

    expect(markup).toContain("目前無法使用：目前沒有可套用補給的戰鬥流程");
  });

  it("shows non-recovery consumable effects with the shared readable labels", () => {
    const markup = renderInventory({}, "foundation_pill");

    expect(markup).toContain("築基輔助丹");
    expect(markup).toContain("突破機率: +10%");
  });

  it("shows skill manuals as a study step before equipping from the skill panel", () => {
    const markup = renderInventory({}, "manual_s_q_active");

    expect(markup).toContain("參悟");
    expect(markup).toContain("參悟後可至底部「功法」面板裝備主動術式參戰");
  });
});
