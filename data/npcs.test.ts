import { describe, expect, it } from "vitest";
import { NPCType } from "../types";
import { VILLAGE_NPCS } from "./npcs";

describe("NPC scripture pavilion routing", () => {
  it("exposes a mortal scripture pavilion keeper that opens the entry skill shop", () => {
    expect(VILLAGE_NPCS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "village_scripture_keeper",
          name: "藏經閣執事",
          type: NPCType.Shop,
          shopId: "skill_shop_mortal",
        }),
      ])
    );
  });
});
