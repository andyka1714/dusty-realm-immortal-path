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
  if (item.category === ItemCategory.Equipment) {
    return `/assets/generated/icons/equipment-paper-v3/${item.id}.webp`;
  }
  return `/assets/generated/icons/items-paper-v3/${item.id}.webp`;
};

export const getPaperCutSkillIcon = (skill: Skill): string =>
  `/assets/generated/icons/skills-paper-v3/${skill.id}.webp`;

export const PAPER_CUT_QUALITY_CLASS: Record<ItemQuality, string> = {
  [ItemQuality.Low]: "paper-tier-low",
  [ItemQuality.Medium]: "paper-tier-medium",
  [ItemQuality.High]: "paper-tier-high",
  [ItemQuality.Immortal]: "paper-tier-immortal",
};
