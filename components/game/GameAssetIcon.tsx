import clsx from "clsx";
import { Item, ItemQuality, Skill } from "../../types";
import {
  getPaperCutItemIcon,
  getPaperCutSkillIcon,
  PAPER_CUT_QUALITY_CLASS,
} from "../../data/assets/paperCutIconRegistry";

type Props = {
  item?: Item;
  skill?: Skill;
  quality?: ItemQuality;
  className?: string;
  decorative?: boolean;
};

export const GameAssetIcon = ({
  item,
  skill,
  quality = item?.quality ?? ItemQuality.Low,
  className,
  decorative = true,
}: Props) => {
  const src = item
    ? getPaperCutItemIcon(item)
    : skill
      ? getPaperCutSkillIcon(skill)
      : undefined;
  if (!src) return null;

  return (
    <span
      className={clsx("paper-asset-icon", PAPER_CUT_QUALITY_CLASS[quality], className)}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : item?.name ?? skill?.name}
    >
      <img src={src} alt="" draggable={false} />
    </span>
  );
};
