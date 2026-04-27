import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import characterReducer from "../store/slices/characterSlice";
import inventoryReducer from "../store/slices/inventorySlice";
import logReducer from "../store/slices/logSlice";
import adventureReducer from "../store/slices/adventureSlice";
import workshopReducer from "../store/slices/workshopSlice";
import questReducer from "../store/slices/questSlice";
import soulReducer from "../store/slices/soulSlice";
import { Dashboard } from "./Dashboard";
import { Gender, MajorRealm } from "../types";

const createDashboardMarkup = (flowStep: "life_review" | "hall") => {
  const soulState = {
    ...soulReducer(undefined, { type: "@@INIT" }),
    flowStep,
    totalMerit: 375,
    pendingLifeReview: {
      cause: "lifespan",
      ageYears: 350,
      highestRealm: MajorRealm.GoldenCore,
      realmMerit: 200,
      ageMerit: 175,
      totalMeritGained: 375,
      eligibleHeirlooms: [],
    },
  } as ReturnType<typeof soulReducer>;

  const store = configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      logs: logReducer,
      adventure: adventureReducer,
      workshop: workshopReducer,
      quest: questReducer,
      soul: soulReducer,
    },
    preloadedState: {
      character: {
        ...characterReducer(undefined, { type: "@@INIT" }),
        isInitialized: true,
        isDead: true,
        name: "韓立",
        gender: Gender.Male,
        majorRealm: MajorRealm.GoldenCore,
        age: 350 * 365,
      },
      inventory: inventoryReducer(undefined, { type: "@@INIT" }),
      logs: logReducer(undefined, { type: "@@INIT" }),
      adventure: adventureReducer(undefined, { type: "@@INIT" }),
      workshop: workshopReducer(undefined, { type: "@@INIT" }),
      quest: questReducer(undefined, { type: "@@INIT" }),
      soul: soulState,
    },
  });

  return renderToStaticMarkup(
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};

const createAliveDashboardMarkup = () => {
  const store = configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      logs: logReducer,
      adventure: adventureReducer,
      workshop: workshopReducer,
      quest: questReducer,
      soul: soulReducer,
    },
    preloadedState: {
      character: {
        ...characterReducer(undefined, { type: "@@INIT" }),
        isInitialized: true,
        isDead: false,
        name: "韓立",
        gender: Gender.Male,
        majorRealm: MajorRealm.GoldenCore,
        age: 350 * 365,
      },
      inventory: inventoryReducer(undefined, { type: "@@INIT" }),
      logs: logReducer(undefined, { type: "@@INIT" }),
      adventure: adventureReducer(undefined, { type: "@@INIT" }),
      workshop: workshopReducer(undefined, { type: "@@INIT" }),
      quest: questReducer(undefined, { type: "@@INIT" }),
      soul: soulReducer(undefined, { type: "@@INIT" }),
    },
  });

  return renderToStaticMarkup(
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};

describe("Dashboard reincarnation flow", () => {
  it("renders the life review summary screen", () => {
    const markup = createDashboardMarkup("life_review");

    expect(markup).toContain("本世結算");
    expect(markup).toContain("進入輪迴大殿");
  });

  it("renders the reincarnation hall screen", () => {
    const markup = createDashboardMarkup("hall");

    expect(markup).toContain("輪迴大殿");
    expect(markup).toContain("先天根骨");
    expect(markup).toContain("投胎轉世");
  });

  it("shows the voluntary reincarnation entry on a living run", () => {
    const markup = createAliveDashboardMarkup();

    expect(markup).toContain("主動坐化");
    expect(markup).toContain("本世收束");
    expect(markup).toContain("飛升/結局回顧後主動重開");
    expect(markup).toContain('data-testid="dashboard-manual-cultivate"');
    expect(markup).toContain('data-testid="dashboard-start-seclusion"');
    expect(markup).toContain('data-testid="dashboard-breakthrough"');
    expect(markup).toContain('data-testid="dashboard-voluntary-reincarnation"');
  });
});
