import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PendingEncounterPanel } from "./PendingEncounterPanel";
import { ENCOUNTER_EVENTS } from "../../data/encounters";

describe("PendingEncounterPanel", () => {
  it("renders encounter context and structured choice cues", () => {
    const markup = renderToStaticMarkup(
      <PendingEncounterPanel
        event={ENCOUNTER_EVENTS.herb_garden}
        pending={{ eventId: "herb_garden", year: 11 }}
        onChoose={() => undefined}
      />
    );

    expect(markup).toContain("荒山藥圃");
    expect(markup).toContain("山野機緣");
    expect(markup).toContain("採摘靈草");
    expect(markup).toContain("凝神觀想");
    expect(markup).toContain("聚靈草 x2");
    expect(markup).toContain("煉丹材料");
    expect(markup).toContain("穩定修為");
    expect(markup).toContain("低風險");
  });
});
