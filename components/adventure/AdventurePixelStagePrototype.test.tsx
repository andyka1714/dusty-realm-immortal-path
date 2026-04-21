import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MAPS } from "../../data/maps";
import { EnemyRank } from "../../types";
import { AdventurePixelStagePrototype } from "./AdventurePixelStagePrototype";

const map20 = MAPS.find((map) => map.id === "20");
const map21 = MAPS.find((map) => map.id === "21");

describe("AdventurePixelStagePrototype", () => {
  it("renders the pixel prototype legend for the representative map", () => {
    expect(map20).toBeTruthy();

    const markup = renderToStaticMarkup(
      <AdventurePixelStagePrototype
        mapData={map20!}
        playerPosition={{ x: 40, y: 40 }}
        activeMonsters={[
          {
            instanceId: "monster-ranged",
            templateId: "m20_c1",
            name: "田間稻草人",
            x: 42,
            y: 40,
            currentHp: 30,
            rank: EnemyRank.Common,
            spawnX: 42,
            spawnY: 40,
          },
        ]}
        portals={map20!.portals}
        targetMonsterId="monster-ranged"
        combatPresentation={null}
        width={528}
        height={528}
        onTileClick={() => undefined}
      />
    );

    expect(markup).toContain("像素原型 Vertical Slice");
    expect(markup).toContain("東郊靈田");
    expect(markup).toContain("近戰命中");
    expect(markup).toContain("投射物");
  });

  it("renders a scope notice on unsupported maps", () => {
    expect(map21).toBeTruthy();

    const markup = renderToStaticMarkup(
      <AdventurePixelStagePrototype
        mapData={map21!}
        playerPosition={{ x: 40, y: 40 }}
        activeMonsters={[]}
        portals={map21!.portals}
        targetMonsterId={null}
        combatPresentation={null}
        width={528}
        height={528}
        onTileClick={() => undefined}
      />
    );

    expect(markup).toContain("目前像素風 vertical slice 只鎖定在東郊靈田");
  });
});
