import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CompendiumModal } from "./CompendiumModal";

const renderCompendium = (props: Record<string, unknown>) =>
  renderToStaticMarkup(
    React.createElement(CompendiumModal as React.ComponentType<any>, {
      isOpen: true,
      onClose: () => undefined,
      embedded: true,
      ...props,
    })
  );

describe("CompendiumModal taxonomy layout", () => {
  it("renders item realm headings without sticky overlap classes", () => {
    const markup = renderCompendium({ initialTab: "item" });

    expect(markup).toContain('data-testid="compendium-item-header"');
    expect(markup).toContain("神兵法寶");
    expect(markup).toContain("依境界檢視正式物品");
    expect(markup).toContain('data-testid="compendium-item-grid"');
    expect(markup).toContain('data-testid="compendium-item-realm-heading-0"');
    expect(markup).toContain("凡人期");
    expect(markup).toContain("鏽鐵劍");
    const headingStart = markup.indexOf(
      'data-testid="compendium-item-realm-heading-0"'
    );
    const headingEnd = markup.indexOf("凡人期", headingStart);
    const headingMarkup = markup.slice(headingStart, headingEnd);
    expect(headingMarkup).not.toContain("sticky");
    expect(headingMarkup).not.toContain("top-0");
  });

  it("groups skills by profession and realm instead of rendering a flat mixed grid", () => {
    const markup = renderCompendium({
      initialTab: "skill",
      initialSkillProfession: "Sword",
    });

    expect(markup).toContain('data-testid="compendium-skill-profession-sword"');
    expect(markup).toContain('data-testid="compendium-skill-profession-body"');
    expect(markup).toContain('data-testid="compendium-skill-summary"');
    expect(markup).toContain("劍修功法");
    expect(markup).toContain("境界分段");
    expect(markup).toContain('data-testid="compendium-skill-realm-1"');
    expect(markup).toContain("疾風三疊");
    expect(markup).toContain("來源：藏經閣");
    expect(markup).not.toContain("裂地重拳");
  });

  it("surfaces item source tracing for route materials", () => {
    const markup = renderCompendium({ initialTab: "item" });

    expect(markup).toContain('data-testid="compendium-item-source-sword_path_starsteel"');
    expect(markup).toContain("來源追蹤");
    expect(markup).toContain("sect:sword:world-chapter-03");
    expect(markup).toContain("Workshop sink：萬古帝劍鍛造");
    expect(markup).toContain("repeatable aftermath");
  });

  it("surfaces manual source labels on skill cards", () => {
    const markup = renderCompendium({
      initialTab: "skill",
      initialSkillProfession: "Sword",
    });

    expect(markup).toContain("藏經閣：凡界藏經閣、宗門入門試煉");
  });

  it("focuses the sect tab on one sect with nested chapter cues", () => {
    const markup = renderCompendium({
      initialTab: "sect",
      initialSectId: "sword",
    });

    expect(markup).toContain('data-testid="compendium-sect-tab-sword"');
    expect(markup).toContain('data-testid="compendium-sect-panel-sword"');
    expect(markup).toContain("凌霄劍宗");
    expect(markup).toContain("宗門人物");
    expect(markup).toContain("傳承功法");
    expect(markup).toContain("章節線索");
    expect(markup).toContain('data-testid="compendium-sect-route-source-sword"');
    expect(markup).toContain('data-testid="compendium-sect-endgame-source-sword"');
    expect(markup).toContain("sect:sword:world-chapter-03");
    expect(markup).toContain("sect:sword:endgame-loop-v4");
    expect(markup).toContain("輪迴仙誓劍胎");
    expect(markup).toContain("斬天輪迴劍印");
    expect(markup).toContain("萬法聖城");
    expect(markup).not.toContain('data-testid="compendium-sect-panel-body"');
    expect(markup).not.toContain("汲取萬獸精血");
  });
});
