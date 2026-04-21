import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PendingEncounterPanel } from "./PendingEncounterPanel";
import { ENCOUNTER_EVENTS } from "../../data/encounters";

describe("PendingEncounterPanel", () => {
  it("renders the pending event title, description, and choices", () => {
    const markup = renderToStaticMarkup(
      <PendingEncounterPanel
        event={ENCOUNTER_EVENTS.herb_garden}
        pending={{ eventId: "herb_garden", year: 11 }}
        onChoose={() => undefined}
      />
    );

    expect(markup).toContain("荒山藥圃");
    expect(markup).toContain("採摘靈草");
    expect(markup).toContain("凝神觀想");
  });
});
