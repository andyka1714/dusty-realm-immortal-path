import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../../store/slices/characterSlice";
import inventoryReducer from "../../store/slices/inventorySlice";
import logReducer from "../../store/slices/logSlice";
import ShopPanel from "./ShopPanel";

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
});
