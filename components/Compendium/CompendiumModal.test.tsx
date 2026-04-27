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

    expect(markup).toContain('data-testid="compendium-item-grid"');
    expect(markup).toContain('data-testid="compendium-item-realm-heading-0"');
    expect(markup).toContain("凡人期");
    expect(markup).toContain("鏽鐵劍");
    expect(markup).not.toContain(
      'data-testid="compendium-item-realm-heading-0" class="text-xl font-bold text-amber-500 border-l-4 border-amber-600 pl-3 sticky top-0'
    );
  });

  it("groups skills by profession and realm instead of rendering a flat mixed grid", () => {
    const markup = renderCompendium({
      initialTab: "skill",
      initialSkillProfession: "Sword",
    });

    expect(markup).toContain('data-testid="compendium-skill-profession-sword"');
    expect(markup).toContain('data-testid="compendium-skill-profession-body"');
    expect(markup).toContain('data-testid="compendium-skill-realm-1"');
    expect(markup).toContain("疾風三疊");
    expect(markup).toContain("來源：藏經閣");
    expect(markup).not.toContain("裂地重拳");
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
    expect(markup).toContain("萬法聖城");
    expect(markup).not.toContain('data-testid="compendium-sect-panel-body"');
    expect(markup).not.toContain("汲取萬獸精血");
  });
});
