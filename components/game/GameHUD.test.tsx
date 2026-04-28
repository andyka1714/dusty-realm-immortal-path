import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../../store/slices/characterSlice";
import logReducer from "../../store/slices/logSlice";
import adventureReducer from "../../store/slices/adventureSlice";
import inventoryReducer from "../../store/slices/inventorySlice";
import workshopReducer from "../../store/slices/workshopSlice";
import questReducer from "../../store/slices/questSlice";
import soulReducer from "../../store/slices/soulSlice";
import encounterReducer from "../../store/slices/encounterSlice";
import { Gender, MajorRealm, SpiritRootId } from "../../types";
import { GameHUD } from "./GameHUD";

const renderHud = () => {
  const baseCharacter = characterReducer(undefined, { type: "@@INIT" });
  const store = configureStore({
    reducer: {
      character: characterReducer,
      logs: logReducer,
      adventure: adventureReducer,
      inventory: inventoryReducer,
      workshop: workshopReducer,
      quest: questReducer,
      soul: soulReducer,
      encounter: encounterReducer,
    },
    preloadedState: {
      character: {
        ...baseCharacter,
        isInitialized: true,
        isDead: false,
        name: "闕月星稀",
        gender: Gender.Male,
        majorRealm: MajorRealm.Foundation,
        minorRealm: 2,
        spiritRootId: SpiritRootId.HEAVENLY_WATER,
      },
      logs: logReducer(undefined, { type: "@@INIT" }),
      adventure: adventureReducer(undefined, { type: "@@INIT" }),
      inventory: inventoryReducer(undefined, { type: "@@INIT" }),
      workshop: workshopReducer(undefined, { type: "@@INIT" }),
      quest: questReducer(undefined, { type: "@@INIT" }),
      soul: soulReducer(undefined, { type: "@@INIT" }),
      encounter: encounterReducer(undefined, { type: "@@INIT" }),
    },
  });

  return renderToStaticMarkup(
    <Provider store={store}>
      <GameHUD />
    </Provider>
  );
};

describe("GameHUD", () => {
  it("renders a compact RPG character status card", () => {
    const markup = renderHud();

    expect(markup).toContain('data-testid="game-hud-character-card"');
    expect(markup).toContain('data-testid="game-hud-avatar"');
    expect(markup).toContain("闕月星稀");
    expect(markup).toContain("Lv.23");
    expect(markup).toContain("氣血");
    expect(markup).toContain("靈力");
    expect(markup).toContain("戰力");
    expect(markup).toContain("築基");
    expect(markup).toContain('data-testid="game-hud-compact-stat-grid"');
  });
});
