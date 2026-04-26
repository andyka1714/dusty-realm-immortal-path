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
    actions,
    children,
  }: {
    isOpen: boolean;
    title: string;
    eyebrow?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <section data-modal-title={title} data-modal-eyebrow={eyebrow}>
        {children}
        {actions}
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
              eventId: "fusion_sword_skyforge_oath",
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

    expect(markup).toContain("合體劍爐誓");
    expect(markup).toContain('data-modal-title="機緣遭遇"');
    expect(markup).toContain("合體宗門回響");
    expect(markup).toContain('data-modal-eyebrow="劍脈續響"');
    expect(markup).toContain("機緣遭遇 · 11 歲");
    expect(markup).toContain("鍛成劍爐");
    expect(markup).toContain("封印劍火");
    expect(markup).toContain("暫且離開");
    expect(markup).toContain("劍修");
    expect(markup).toContain("凌霄劍宗後段承接");
  });
});
