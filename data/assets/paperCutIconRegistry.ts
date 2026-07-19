import { Item, ItemCategory, ItemQuality, Skill } from "../../types";

const FRAME_ROOT = "/assets/generated/ui/paper-cut-core-v1/frames";

export const PAPER_CUT_ICON_PATHS = {
  sword: `${FRAME_ROOT}/icon-1.png`,
  staff: `${FRAME_ROOT}/icon-2.png`,
  armor: `${FRAME_ROOT}/icon-3.png`,
  boots: `${FRAME_ROOT}/icon-4.png`,
  pill: `${FRAME_ROOT}/icon-5.png`,
  spiritStone: `${FRAME_ROOT}/icon-6.png`,
  herb: `${FRAME_ROOT}/icon-7.png`,
  monsterPart: `${FRAME_ROOT}/icon-8.png`,
  swordSkill: `${FRAME_ROOT}/icon-9.png`,
  healSkill: `${FRAME_ROOT}/icon-10.png`,
  fireSkill: `${FRAME_ROOT}/icon-11.png`,
  thunderSkill: `${FRAME_ROOT}/icon-12.png`,
  scroll: `${FRAME_ROOT}/icon-13.png`,
  map: `${FRAME_ROOT}/icon-14.png`,
  inventory: `${FRAME_ROOT}/icon-15.png`,
  cultivation: `${FRAME_ROOT}/icon-16.png`,
} as const;

export const getPaperCutItemIcon = (item: Item): string => {
  const id = item.id.toLowerCase();
  if (item.category === ItemCategory.Equipment) {
    if (id.includes("staff") || id.includes("法杖") || id.includes("magic")) {
      return PAPER_CUT_ICON_PATHS.staff;
    }
    if (id.includes("boot") || id.includes("shoe")) return PAPER_CUT_ICON_PATHS.boots;
    if (id.includes("armor") || id.includes("robe") || id.includes("body")) {
      return PAPER_CUT_ICON_PATHS.armor;
    }
    return PAPER_CUT_ICON_PATHS.sword;
  }
  if (item.category === ItemCategory.Material) {
    return /herb|grass|flower|root|wood|leaf/.test(id)
      ? PAPER_CUT_ICON_PATHS.herb
      : PAPER_CUT_ICON_PATHS.monsterPart;
  }
  if (item.category === ItemCategory.Breakthrough) return PAPER_CUT_ICON_PATHS.cultivation;
  if (/manual|skill|scripture|book/.test(id)) return PAPER_CUT_ICON_PATHS.scroll;
  if (/stone|crystal|jade|ore/.test(id)) return PAPER_CUT_ICON_PATHS.spiritStone;
  if (/map|token|marker/.test(id)) return PAPER_CUT_ICON_PATHS.map;
  return PAPER_CUT_ICON_PATHS.pill;
};

export const getPaperCutSkillIcon = (skill: Skill): string => {
  const text = `${skill.id} ${skill.name} ${skill.description}`.toLowerCase();
  if (skill.effectType === "heal" || /heal|回春|療|生機/.test(text)) {
    return PAPER_CUT_ICON_PATHS.healSkill;
  }
  if (/fire|火|炎|焰/.test(text)) return PAPER_CUT_ICON_PATHS.fireSkill;
  if (/thunder|雷|電/.test(text)) return PAPER_CUT_ICON_PATHS.thunderSkill;
  if (/sword|劍|斬|鋒/.test(text)) return PAPER_CUT_ICON_PATHS.swordSkill;
  return PAPER_CUT_ICON_PATHS.cultivation;
};

export const PAPER_CUT_QUALITY_CLASS: Record<ItemQuality, string> = {
  [ItemQuality.Low]: "paper-tier-low",
  [ItemQuality.Medium]: "paper-tier-medium",
  [ItemQuality.High]: "paper-tier-high",
  [ItemQuality.Immortal]: "paper-tier-immortal",
};
