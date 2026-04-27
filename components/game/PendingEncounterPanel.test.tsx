import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PendingEncounterPanel } from "./PendingEncounterPanel";
import { ENCOUNTER_EVENTS } from "../../data/encounters";

describe("PendingEncounterPanel", () => {
  it("renders encounter context and structured choice cues", () => {
    const markup = renderToStaticMarkup(
      <PendingEncounterPanel
        event={ENCOUNTER_EVENTS.fusion_sword_skyforge_oath}
        pending={{ eventId: "fusion_sword_skyforge_oath", year: 87 }}
        onChoose={() => undefined}
      />
    );

    expect(markup).toContain("合體劍爐誓");
    expect(markup).toContain("合體宗門回響");
    expect(markup).toContain("劍脈續響");
    expect(markup).toContain("合體劍爐會延續");
    expect(markup).toContain("凌霄劍宗");
    expect(markup).toContain("劍修");
    expect(markup).toContain("凌霄劍宗後段承接");
    expect(markup).toContain("鍛成劍爐");
    expect(markup).toContain("封印劍火");
    expect(markup).toContain("劍脈續響");
  });

  it("renders v3 emperor route event cues without relying on long description only", () => {
    const markup = renderToStaticMarkup(
      <PendingEncounterPanel
        event={ENCOUNTER_EVENTS.sword_emperor_heaven_sunder_oath}
        pending={{ eventId: "sword_emperor_heaven_sunder_oath", year: 990 }}
        onChoose={() => undefined}
      />
    );

    expect(markup).toContain("仙帝終盤路線");
    expect(markup).toContain("凌霄劍宗");
    expect(markup).toContain("凌霄劍宗帝境");
    expect(markup).toContain("凌霄劍星鋼 x2");
    expect(markup).toContain("高風險");
  });

  it("renders v3 aftermath route, chain, memory, and choice cue tags", () => {
    const markup = renderToStaticMarkup(
      <PendingEncounterPanel
        event={ENCOUNTER_EVENTS.sword_immortal_afterglow_starsteel}
        pending={{ eventId: "sword_immortal_afterglow_starsteel", year: 1010 }}
        onChoose={() => undefined}
      />
    );

    expect(markup).toContain("仙人 v3 路線餘波");
    expect(markup).toContain("凌霄劍宗");
    expect(markup).toContain("帝劍餘波");
    expect(markup).toContain("v3 凌霄劍宗世界章節記憶");
    expect(markup).toContain("穩定");
    expect(markup).toContain("凌霄劍星鋼 x1");
    expect(markup).toContain("材料來源");
  });
});
