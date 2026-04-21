import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../store/slices/characterSlice";
import inventoryReducer from "../store/slices/inventorySlice";
import workshopReducer from "../store/slices/workshopSlice";
import logReducer from "../store/slices/logSlice";
import { Workshop } from "./Workshop";

describe("Workshop crafting UI", () => {
  it("renders formal alchemy and smithing recipes instead of placeholder gates", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        workshop: workshopReducer,
        logs: logReducer,
      },
    });

    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <Workshop />
      </Provider>
    );

    expect(markup).toContain("聚氣丹");
    expect(markup).toContain("鏽鐵劍重鑄");
    expect(markup).not.toContain("金丹期開放");
  });
});
