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
});
