import React from "react";
import { describe, expect, it, vi } from "vitest";
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
import { GameShell } from "./GameShell";
import { Gender } from "../../types";

vi.mock("../Modal", () => ({
  Modal: ({
    isOpen,
    title,
    eyebrow,
    children,
  }: {
    isOpen: boolean;
    title: string;
    eyebrow?: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <section data-modal-title={title} data-modal-eyebrow={eyebrow}>
        {children}
      </section>
    ) : null,
}));

vi.mock("./GameHUD", () => ({
  GameHUD: () => <div>HUD</div>,
}));

const createMarkup = (withPendingEncounter = false) => {
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
        ...characterReducer(undefined, { type: "@@INIT" }),
        isInitialized: true,
        isDead: false,
        name: "韓立",
        gender: Gender.Male,
      },
      logs: logReducer(undefined, { type: "@@INIT" }),
      adventure: adventureReducer(undefined, { type: "@@INIT" }),
      inventory: inventoryReducer(undefined, { type: "@@INIT" }),
      workshop: workshopReducer(undefined, { type: "@@INIT" }),
      quest: questReducer(undefined, { type: "@@INIT" }),
      soul: soulReducer(undefined, { type: "@@INIT" }),
      encounter: withPendingEncounter
        ? {
            pendingEvent: {
              eventId: "herb_garden",
              year: 11,
            },
            resolvedEventIds: [],
          }
        : encounterReducer(undefined, { type: "@@INIT" }),
    },
  });

  return renderToStaticMarkup(
    <Provider store={store}>
      <GameShell />
    </Provider>
  );
};

describe("GameShell", () => {
  it("renders the formal dock entries for the main panels", () => {
    const markup = createMarkup();

    expect(markup).toContain("道途");
    expect(markup).toContain("背包");
    expect(markup).toContain("洞府");
    expect(markup).toContain("圖鑑");
  });

  it("renders the pending encounter content when a formal event is waiting", () => {
    const markup = createMarkup(true);

    expect(markup).toContain("荒山藥圃");
    expect(markup).toContain("山野機緣");
    expect(markup).toContain('data-modal-eyebrow="山野機緣"');
    expect(markup).toContain("Encounter · 11 歲");
    expect(markup).toContain("採摘靈草");
    expect(markup).toContain("凝神觀想");
    expect(markup).toContain("聚靈草 x2");
    expect(markup).toContain("煉丹材料");
  });
});
