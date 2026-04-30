import React, { useState, useMemo, useRef } from "react";
import {
  X,
  Book,
  Map as MapIcon,
  Sword,
  Scroll,
  Shield,
  Skull,
  Database,
  User,
} from "lucide-react";
import {
  MajorRealm,
  MajorRealmCN,
  ProfessionType,
  EnemyRank,
  Item,
  EquipmentItem,
  Enemy,
  Skill,
  NPCType,
  ItemCategory,
  ItemQuality,
  ConsumableItem,
  ConsumableEffect,
} from "../../types";
import { ELEMENT_NAMES } from "../../constants";
import { ITEMS } from "../../data/items";
import {
  FORMAL_CORE_SKILLS_BY_PROFESSION,
  FORMAL_CORE_SKILLS_SORTED,
} from "../../data/skills";
import { COMMON_ENEMIES } from "../../data/enemies/common";
import { ELITE_ENEMIES } from "../../data/enemies/elite";
import { BOSS_ENEMIES } from "../../data/enemies/boss";
import { MAPS } from "../../data/maps";
import clsx from "clsx";
import { GameTooltip } from "../game/GameTooltip";
import { GameHintBubble } from "../game/GameHintBubble";
import { Button } from "../ui/button";
import {
  buildCompendiumItemSourceTrace,
  buildCompendiumSkillSourceTrace,
  type CompendiumItemSourceTrace,
  type CompendiumSourceChip,
  type CompendiumSourceKind,
} from "./sourceTracing";
import {
  COMPENDIUM_GENERAL_ITEM_CATEGORIES,
  getCompendiumItemCategory,
  isCompendiumEquipmentItem,
  isCompendiumGeneralItem,
  type CompendiumItemCategoryId,
} from "./itemClassification";
import {
  calculateEnemyCombatPower,
  formatCombatPower,
} from "../../utils/combatPower";
import {
  EQUIPMENT_REALM_AUDIT,
  type EquipmentPathId,
} from "../../data/items/equipment/audit";
import {
  RECOVERY_CONSUMABLE_COOLDOWN_MS,
  formatConsumableEffectLabel,
  hasRecoveryEffect,
} from "../../utils/consumableEffects";
import { getStatusLabel } from "../../utils/battleStatusLabels";
import { getPassiveSkillBonuses } from "../../utils/battlePassiveSkillBonusRegistry";

interface CompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  initialTab?: TabType;
  initialEquipmentProfession?: ProfessionType;
  initialSkillProfession?: ProfessionType;
  initialSectId?: SectId;
  initialMapId?: string;
}

type TabType = "realm" | "map" | "item" | "equipment" | "skill" | "sect";
type SectId = "sword" | "body" | "mage";
type GeneralItemCategoryId = Exclude<
  CompendiumItemCategoryId,
  "manual" | "equipment"
>;

const getSkillTypeLabel = (type: Skill["type"]): string =>
  type === "Active" ? "主動" : "被動";

const getProfessionLabel = (profession?: ProfessionType): string => {
  switch (profession) {
    case ProfessionType.Sword:
      return "劍修";
    case ProfessionType.Body:
      return "體修";
    case ProfessionType.Mage:
      return "法修";
    default:
      return "通用";
  }
};

const getProfessionRouteLabel = (profession?: ProfessionType): string => {
  switch (profession) {
    case ProfessionType.Sword:
      return "凌霄劍宗";
    case ProfessionType.Body:
      return "萬獸山莊";
    case ProfessionType.Mage:
      return "縹緲仙宮";
    default:
      return "通用";
  }
};

const realmCompendiumDetails: Record<
  MajorRealm,
  { role: string; description: string }
> = {
  [MajorRealm.Mortal]: {
    role: "入道準備",
    description: "凡軀未脫，仍以氣血、武藝與基礎資源立足。",
  },
  [MajorRealm.QiRefining]: {
    role: "引氣入體",
    description: "初識靈氣運轉，能修習入門功法並使用基礎法器。",
  },
  [MajorRealm.Foundation]: {
    role: "道基初立",
    description: "築成修行根基，職業路線開始分化，裝備與功法逐漸成型。",
  },
  [MajorRealm.GoldenCore]: {
    role: "金丹凝華",
    description: "靈力凝成金丹，爆發、護體與持續戰鬥能力明顯提升。",
  },
  [MajorRealm.NascentSoul]: {
    role: "元神出竅",
    description: "元嬰護命，能承受更高風險並接觸宗門深層傳承。",
  },
  [MajorRealm.SpiritSevering]: {
    role: "神意化形",
    description: "神識與術法大幅增長，開始影響大型戰場與秘境路線。",
  },
  [MajorRealm.VoidRefining]: {
    role: "煉虛合道",
    description: "觸及空間與虛界規則，材料、掉落與奇遇來源更稀有。",
  },
  [MajorRealm.Fusion]: {
    role: "天地合體",
    description: "肉身、元神與大道相合，職業裝備逐步轉向高階套系。",
  },
  [MajorRealm.Mahayana]: {
    role: "大乘圓滿",
    description: "凡修極境，開始收束古修傳承與渡劫前置資源。",
  },
  [MajorRealm.Tribulation]: {
    role: "破劫登仙",
    description: "直面天劫考驗，需要完整功法、裝備與突破資源支撐。",
  },
  [MajorRealm.Immortal]: {
    role: "仙道初成",
    description: "脫離凡俗界限，進入仙域、帝路與高階法寶循環。",
  },
  [MajorRealm.ImmortalEmperor]: {
    role: "帝路終局",
    description: "統御大道本源，對應終盤首領、仙帝傳承與專屬材料閉環。",
  },
};

const getItemSubtypeLabel = (item: Item): string => {
  if ("subType" in item) {
    switch (item.subType) {
      case "Pill":
        return "丹藥";
      case "Fateful":
        return "機緣";
      case "Manual":
        return "功法";
      case "Map":
        return "地圖";
      case "Herb":
        return "藥草";
      case "MonsterPart":
        return "妖獸素材";
      case "Ore":
        return "礦石";
      case "Sword":
        return "長劍";
      case "Gauntlet":
        return "拳套";
      case "Staff":
        return "法杖";
      case "Helmet":
        return "頭冠";
      case "Armor":
        return "護甲";
      case "Boots":
        return "靴履";
      case "Ring":
        return "戒飾";
      case "SimpleRobe":
        return "法袍";
      case "Shield":
        return "護盾";
      case "Accessory":
        return "飾品";
      default:
        return "其他";
    }
  }

  return "其他";
};

const getSkillSourceLabel = (source?: Skill["formalSourceTier"]): string => {
  switch (source) {
    case "shop":
      return "藏經閣";
    case "elite":
      return "精英掉落";
    case "boss":
      return "首領核心";
    case "inheritance":
      return "古修傳承";
    default:
      return "未標記";
  }
};

const getEnemyRankLabel = (rank: EnemyRank): string => {
  switch (rank) {
    case EnemyRank.Boss:
      return "首領";
    case EnemyRank.Elite:
      return "精英";
    default:
      return "普通";
  }
};

const getEnemyAiLabel = (aiStyle?: Enemy["aiStyle"]): string => {
  switch (aiStyle) {
    case "ranged":
      return "遠程";
    case "caster":
      return "施法";
    default:
      return "近戰";
  }
};

const getElementLabel = (element: Enemy["element"]) =>
  element === undefined ? "無" : ELEMENT_NAMES[element];

const formatEnemyElements = (elements?: Enemy["resistances"]) =>
  elements && elements.length > 0
    ? elements.map((element) => ELEMENT_NAMES[element]).join("、")
    : "無";

const sourceChipClassNames: Record<CompendiumSourceKind, string> = {
  drop: "border-red-900/40 bg-red-950/30 text-red-300",
  shop: "border-cyan-900/40 bg-cyan-950/30 text-cyan-300",
  workshop_output: "border-emerald-900/40 bg-emerald-950/30 text-emerald-300",
  workshop_sink: "border-amber-900/40 bg-amber-950/30 text-amber-300",
  encounter_route: "border-violet-900/40 bg-violet-950/30 text-violet-300",
  skill_manual: "border-indigo-900/40 bg-indigo-950/30 text-indigo-300",
};

const dropRankChipClassNames: Record<EnemyRank, string> = {
  [EnemyRank.Common]: "border-stone-700 bg-stone-900/70 text-stone-300",
  [EnemyRank.Elite]: "border-sky-700/50 bg-sky-950/40 text-sky-200",
  [EnemyRank.Boss]: "border-red-800/60 bg-red-950/45 text-red-200",
};

const enemyRankLabels: Record<EnemyRank, string> = {
  [EnemyRank.Common]: "普通",
  [EnemyRank.Elite]: "精英",
  [EnemyRank.Boss]: "首領",
};

const dedupeSourceLabels = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

const getVisibleSourceChips = (sources: CompendiumSourceChip[]) => {
  const visible = sources.slice(0, 5);
  const hasWorkshopSink = visible.some((source) => source.kind === "workshop_sink");
  const firstWorkshopSink = sources.find((source) => source.kind === "workshop_sink");

  if (!hasWorkshopSink && firstWorkshopSink) {
    return [...visible.slice(0, 4), firstWorkshopSink];
  }

  return visible;
};

const renderSourceChips = (
  sources: CompendiumSourceChip[],
  emptyLabel = "無紀錄"
) => {
  if (sources.length === 0) {
    return <span className="text-[10px] text-stone-700 italic">{emptyLabel}</span>;
  }

  return getVisibleSourceChips(sources).map((source, index) => (
    <span
      key={`${source.kind}-${source.label}-${index}`}
      className={clsx(
        "max-w-full rounded border px-1.5 py-0.5 text-[10px] leading-4",
        source.kind === "drop" && source.rank
          ? dropRankChipClassNames[source.rank]
          : sourceChipClassNames[source.kind]
      )}
      title={source.detail}
    >
      {source.label}
    </span>
  ));
};

const renderSourceGroup = (
  title: string,
  children: React.ReactNode,
  testId: string
) => (
  <section className="space-y-2" data-testid={testId}>
    <div className="text-[11px] font-bold text-amber-200">{title}</div>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </section>
);

const renderGroupedSourcePopover = (sourceTrace: CompendiumItemSourceTrace) => (
  <div
    className="max-h-[420px] space-y-4 overflow-y-auto pr-2"
    data-testid="compendium-source-popover-content"
  >
    {sourceTrace.dropSources.length > 0 &&
      renderSourceGroup(
        "掉落來源",
        sourceTrace.dropSources.map((source) => (
          <span
            key={source.enemyId}
            className={clsx(
              "rounded border px-2 py-1 text-[11px] leading-4",
              dropRankChipClassNames[source.rank]
            )}
            title={enemyRankLabels[source.rank]}
          >
            {source.enemyName} 掉落
          </span>
        )),
        "compendium-source-group-drops"
      )}

    {sourceTrace.shopSources.length > 0 &&
      renderSourceGroup(
        "商店販賣",
        sourceTrace.shopSources.map((source) => (
          <span
            key={source.shopId}
            className="rounded border border-emerald-900/40 bg-emerald-950/30 px-2 py-1 text-[11px] leading-4 text-emerald-300"
          >
            {source.shopName} 販賣
          </span>
        )),
        "compendium-source-group-shops"
      )}

    {sourceTrace.workshopOutputs.length > 0 && (
      <section className="space-y-2" data-testid="compendium-source-group-workshop-output">
        <div className="text-[11px] font-bold text-amber-200">工坊製作</div>
        {sourceTrace.workshopOutputs.map((source) => (
          <div key={source.recipeId} className="space-y-1">
            <span className="inline-flex rounded border border-purple-900/40 bg-purple-950/30 px-2 py-1 text-[11px] leading-4 text-purple-300">
              {source.recipeName}
            </span>
            {source.sourceHint && (
              <p className="text-xs leading-relaxed text-stone-500">
                {source.sourceHint}
              </p>
            )}
          </div>
        ))}
      </section>
    )}

    {sourceTrace.workshopSinks.length > 0 && (
      <section className="space-y-2" data-testid="compendium-source-group-workshop-sink">
        <div className="text-[11px] font-bold text-amber-200">工坊用途</div>
        {sourceTrace.workshopSinks.map((source) => (
          <div key={source.recipeId} className="space-y-1">
            <span className="inline-flex rounded border border-amber-900/40 bg-amber-950/30 px-2 py-1 text-[11px] leading-4 text-amber-300">
              可用於 {source.recipeName}
            </span>
            {source.sourceHint && (
              <p className="text-xs leading-relaxed text-stone-500">
                {source.sourceHint}
              </p>
            )}
          </div>
        ))}
      </section>
    )}

    {sourceTrace.encounterRoutes.length > 0 &&
      renderSourceGroup(
        "奇遇路線",
        sourceTrace.encounterRoutes.map((source) => (
          <span
            key={`${source.eventId}-${source.choiceId}`}
            className="rounded border border-violet-900/40 bg-violet-950/30 px-2 py-1 text-[11px] leading-4 text-violet-300"
            title={source.memoryCue}
          >
            {dedupeSourceLabels([
              source.routeLabel,
              source.sectLabel,
              source.categoryLabel,
              source.eventTitle,
            ]).join(" / ")}
          </span>
        )),
        "compendium-source-group-encounters"
      )}
  </div>
);

const groupSkillsByRealm = (skills: Skill[]) =>
  Object.values(MajorRealm)
    .filter((realm): realm is MajorRealm => typeof realm === "number")
    .map((realm) => ({
      realm,
      skills: skills.filter((skill) => skill.minRealm === realm),
    }))
    .filter((group) => group.skills.length > 0);

const skillProfessionTabs = [
  { id: ProfessionType.None, label: "通用" },
  { id: ProfessionType.Sword, label: "凌霄劍宗" },
  { id: ProfessionType.Body, label: "萬獸山莊" },
  { id: ProfessionType.Mage, label: "縹緲仙宮" },
];

const equipmentPathProfessionMap: Record<EquipmentPathId, ProfessionType> = {
  general: ProfessionType.None,
  sword: ProfessionType.Sword,
  body: ProfessionType.Body,
  mage: ProfessionType.Mage,
};

const equipmentProfessionByItemId = new Map<string, ProfessionType>(
  EQUIPMENT_REALM_AUDIT.flatMap((realmAudit) =>
    Object.entries(realmAudit.paths).flatMap(([path, audit]) => {
      if (!audit) return [];
      const profession = equipmentPathProfessionMap[path as EquipmentPathId];
      return audit.itemIds.map((itemId) => [itemId, profession] as const);
    })
  )
);

const getEquipmentProfession = (item: EquipmentItem) =>
  equipmentProfessionByItemId.get(item.id) ?? ProfessionType.None;

const groupItemsByRealm = (items: Item[]) =>
  Object.values(MajorRealm)
    .filter((realm): realm is MajorRealm => typeof realm === "number")
    .map((realm) => ({
      realm,
      items: items.filter((item) => getItemDisplayRealm(item) === realm),
    }))
    .filter((group) => group.items.length > 0);

const getItemDisplayRealm = (item: Item): MajorRealm => {
  if (item.minRealm !== undefined) return item.minRealm;

  if (
    (item.category === ItemCategory.Consumable ||
      item.category === ItemCategory.Breakthrough) &&
    "requiredRealm" in item &&
    item.requiredRealm !== undefined
  ) {
    return item.requiredRealm;
  }

  return MajorRealm.Mortal;
};

const getConsumableEffectDetailLabels = (item: ConsumableItem) =>
  item.effects
    .map((effect: ConsumableEffect) => formatConsumableEffectLabel(effect))
    .filter(Boolean);

const formatPercent = (value: number) => {
  const percent = Math.round(value * 100);
  return `${percent}%`;
};

const getSkillTargetLabel = (targetType?: Skill["targetType"]) => {
  switch (targetType) {
    case "all":
      return "全體目標";
    case "self":
      return "自身";
    case "single":
      return "單體目標";
    default:
      return "依技能規則";
  }
};

const getSkillEffectDetails = (skill: Skill) => {
  if (skill.type === "Passive") {
    const bonuses = getPassiveSkillBonuses([skill]);
    const bonusLabels = [
      bonuses.hpPercent ? `氣血 +${bonuses.hpPercent}%` : null,
      bonuses.mpPercent ? `真元 +${bonuses.mpPercent}%` : null,
      bonuses.attackPercent ? `攻擊 +${bonuses.attackPercent}%` : null,
      bonuses.magicPercent ? `法術 +${bonuses.magicPercent}%` : null,
      bonuses.defensePercent ? `防禦 +${bonuses.defensePercent}%` : null,
      bonuses.resPercent ? `靈抗 +${bonuses.resPercent}%` : null,
      bonuses.critBonus ? `暴擊 +${bonuses.critBonus}%` : null,
      bonuses.critDamageBonus ? `暴傷 +${bonuses.critDamageBonus}%` : null,
      bonuses.dodgeBonus ? `閃避 +${bonuses.dodgeBonus}%` : null,
      bonuses.damageReductionBonus
        ? `減傷 +${bonuses.damageReductionBonus}%`
        : null,
      bonuses.regenHpBonus ? `氣血回復 +${bonuses.regenHpBonus}` : null,
    ].filter((label): label is string => Boolean(label));

    return [
      "被動生效",
      ...bonusLabels,
      "無需裝備，學會後會依戰鬥規則自動套用。",
    ];
  }

  const details: string[] = [];

  if (skill.damageMultiplier !== undefined) {
    details.push(`造成 ${formatPercent(skill.damageMultiplier)} 傷害`);
  }

  if (skill.healMultiplier !== undefined) {
    details.push(`恢復 ${formatPercent(skill.healMultiplier)} 效果`);
  }

  details.push(`目標：${getSkillTargetLabel(skill.targetType)}`);

  const cooldownSeconds = skill.cooldownSeconds ?? skill.cooldown;
  if (cooldownSeconds > 0) {
    details.push(`冷卻 ${cooldownSeconds} 秒`);
  }

  if (skill.cost !== undefined && skill.cost > 0) {
    details.push(`消耗真元 ${skill.cost}`);
  }

  if (skill.statusEffect) {
    const chance = Math.round(skill.statusEffect.chance * 100);
    details.push(
      `${chance}% 附加${getStatusLabel(skill.statusEffect.id)} ${skill.statusEffect.duration} 秒`
    );
  }

  return details;
};

const isSettlementMap = (map: (typeof MAPS)[number]) =>
  (map.npcs?.length ?? 0) > 0 && map.enemies.length === 0;

const sectConfigs: Array<{
  id: SectId;
  profession: ProfessionType;
  name: string;
  desc: string;
  mapId: string;
  chapterCues: string[];
  routeSourceSummary: {
    material: string;
    worldMemoryTag: string;
    endgameMemoryTag: string;
    usage: string;
    endgameUsage: string;
  };
}> = [
  {
    id: "sword",
    profession: ProfessionType.Sword,
    name: "凌霄劍宗",
    desc: "修煉劍道，以攻代守。追求極致的攻擊力與暴擊。",
    mapId: "4",
    chapterCues: [
      "三界戰場與時光長河承接 task_04 後的劍令章節。",
      "萬法聖城到無盡海延伸後段世界章節。",
      "終盤帝劍路線可接續凌霄劍星鋼與仙帝 encounter。",
    ],
    routeSourceSummary: {
      material: "凌霄劍星鋼",
      worldMemoryTag: "sect:sword:world-chapter-03",
      endgameMemoryTag: "sect:sword:endgame-loop-v4",
      usage: "v3 aftermath 反覆供應星鋼，Workshop 帝劍與輪迴仙誓劍胎會讀取這條路線記憶。",
      endgameUsage:
        "v4 終盤閉環會讀取斬天輪迴劍印與歸墟三道帝冕，確認劍修仙帝路線完成。",
    },
  },
  {
    id: "body",
    profession: ProfessionType.Body,
    name: "萬獸山莊",
    desc: "修煉肉身，力大無窮。擁有超高的防禦與生命回復能力。",
    mapId: "13",
    chapterCues: [
      "三界戰場與時光長河承接 task_04 後的血旗章節。",
      "萬法聖城到無盡海延伸後段世界章節。",
      "終盤帝血路線可接續萬獸血骨殘材與仙帝 encounter。",
    ],
    routeSourceSummary: {
      material: "萬獸血骨殘材",
      worldMemoryTag: "sect:beast:world-chapter-03",
      endgameMemoryTag: "sect:beast:endgame-loop-v4",
      usage: "v3 aftermath 反覆供應血骨殘材，Workshop 體修帝兵與輪迴不滅血印會讀取這條路線記憶。",
      endgameUsage:
        "v4 終盤閉環會讀取萬獸不滅血印與歸墟三道帝冕，確認體修仙帝路線完成。",
    },
  },
  {
    id: "mage",
    profession: ProfessionType.Mage,
    name: "縹緲仙宮",
    desc: "修煉法術，掌控天地。擅長群體傷害與控制法術。",
    mapId: "23",
    chapterCues: [
      "三界戰場與時光長河承接 task_04 後的星牒章節。",
      "萬法聖城到無盡海延伸後段世界章節。",
      "終盤星詔路線可接續縹緲星魂蓮與仙帝 encounter。",
    ],
    routeSourceSummary: {
      material: "縹緲星魂蓮",
      worldMemoryTag: "sect:mystic:world-chapter-03",
      endgameMemoryTag: "sect:mystic:endgame-loop-v4",
      usage: "v3 aftermath 反覆凝出星魂蓮，Workshop 法修丹器與輪迴仙宮星命會讀取這條路線記憶。",
      endgameUsage:
        "v4 終盤閉環會讀取仙宮星命輪與歸墟三道帝冕，確認法修仙帝路線完成。",
    },
  },
];

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  isOpen,
  onClose,
  embedded = false,
  initialTab = "realm",
  initialEquipmentProfession = ProfessionType.None,
  initialSkillProfession = ProfessionType.None,
  initialSectId = "sword",
  initialMapId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTab === "map" ? initialMapId ?? null : null
  ); // For detailed view
  const [activeSkillProfession, setActiveSkillProfession] =
    useState<ProfessionType>(initialSkillProfession);
  const [activeEquipmentProfession, setActiveEquipmentProfession] =
    useState<ProfessionType>(initialEquipmentProfession);
  const [activeSectId, setActiveSectId] = useState<SectId>(initialSectId);
  const [activeItemCategory, setActiveItemCategory] = useState<
    GeneralItemCategoryId | "all"
  >("all");

  // Tooltip state for Item Drop Source
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title?: React.ReactNode;
    footer?: React.ReactNode;
    content: React.ReactNode;
  } | null>(null);
  const tooltipHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTooltipHide = () => {
    if (!tooltipHideTimerRef.current) return;
    clearTimeout(tooltipHideTimerRef.current);
    tooltipHideTimerRef.current = null;
  };

  const scheduleTooltipHide = () => {
    cancelTooltipHide();
    tooltipHideTimerRef.current = setTimeout(() => {
      setTooltip(null);
      tooltipHideTimerRef.current = null;
    }, 220);
  };

  // Aggregate Data
  const allEnemies: Record<string, Enemy> = useMemo(
    () => ({ ...COMMON_ENEMIES, ...ELITE_ENEMIES, ...BOSS_ENEMIES }),
    []
  );

  const allItems: Record<string, Item> = useMemo(() => ITEMS, []);
  const itemList = useMemo(() => Object.values(allItems), [allItems]);
  const generalItemList = useMemo(
    () => itemList.filter(isCompendiumGeneralItem),
    [itemList]
  );
  const equipmentItems = useMemo(
    () => itemList.filter(isCompendiumEquipmentItem),
    [itemList]
  );
  const activeEquipmentItems = useMemo(
    () =>
      equipmentItems.filter(
        (item) => getEquipmentProfession(item) === activeEquipmentProfession
      ),
    [activeEquipmentProfession, equipmentItems]
  );
  const activeEquipmentGroups = useMemo(
    () => groupItemsByRealm(activeEquipmentItems),
    [activeEquipmentItems]
  );
  const activeEquipmentCount = activeEquipmentItems.length;
  const villageMaps = useMemo(
    () => MAPS.filter(isSettlementMap),
    []
  );
  const mapsByRealm = useMemo(
    () =>
      Object.values(MajorRealm)
        .filter((realm): realm is MajorRealm => typeof realm === "number")
        .map((realm) => ({
          realm,
          maps: MAPS.filter(
            (map) => map.minRealm === realm && !isSettlementMap(map)
          ),
        }))
        .filter((group) => group.maps.length > 0),
    []
  );
  const visibleItems = useMemo(
    () =>
      activeItemCategory === "all"
        ? generalItemList
        : generalItemList.filter(
            (item) => getCompendiumItemCategory(item).id === activeItemCategory
          ),
    [activeItemCategory, generalItemList]
  );
  const activeItemGroups = useMemo(
    () => groupItemsByRealm(visibleItems),
    [visibleItems]
  );
  const itemCategoryCounts = useMemo(() => {
    const counts: Record<GeneralItemCategoryId, number> = {
      pill: 0,
      alchemy_material: 0,
      smithing_material: 0,
      quest_item: 0,
      region_specialty: 0,
      currency_token: 0,
      talisman: 0,
      array: 0,
      artifact_spirit: 0,
      breakthrough: 0,
      other: 0,
    };

    generalItemList.forEach((item) => {
      counts[getCompendiumItemCategory(item).id] += 1;
    });

    return counts;
  }, [generalItemList]);
  const activeItemCategoryLabel =
    activeItemCategory === "all"
      ? "全部分類"
      : COMPENDIUM_GENERAL_ITEM_CATEGORIES.find(
          (category) => category.id === activeItemCategory
        )?.label ?? "全部分類";

  const allSkills: Skill[] = useMemo(() => [...FORMAL_CORE_SKILLS_SORTED], []);
  const activeSkillGroups = useMemo(() => {
    if (activeSkillProfession === ProfessionType.None) {
      return groupSkillsByRealm(
        allSkills.filter(
          (skill) =>
            !skill.profession || skill.profession === ProfessionType.None
        )
      );
    }

    return groupSkillsByRealm(
      allSkills.filter((skill) => skill.profession === activeSkillProfession)
    );
  }, [activeSkillProfession, allSkills]);

  const activeSect =
    sectConfigs.find((sect) => sect.id === activeSectId) ?? sectConfigs[0];
  const activeSectSkills = FORMAL_CORE_SKILLS_BY_PROFESSION[activeSect.profession];
  const activeSectSkillGroups = groupSkillsByRealm(activeSectSkills);
  const activeSectNpcs = MAPS.find((map) => map.id === activeSect.mapId)?.npcs || [];
  const activeSkillCount = activeSkillGroups.reduce(
    (total, group) => total + group.skills.length,
    0
  );

  // Helper: Get Drops for Enemy
  const getEnemyDrops = (enemyId: string): Item[] => {
    const enemy = allEnemies[enemyId];
    if (!enemy || !enemy.drops) return [];
    return enemy.drops
      .map((id) => allItems[id])
      .filter((item): item is Item => !!item);
  };

  // Helper: Get Dropped By for Item
  const getDroppedBy = (itemId: string): Enemy[] => {
    return Object.values(allEnemies).filter((e) => e.drops?.includes(itemId));
  };

  const renderItemCard = (item: Item, testIdPrefix: string) => {
    const sourceTrace = buildCompendiumItemSourceTrace(item.id);
    const category = getCompendiumItemCategory(item);
    const consumable =
      item.category === ItemCategory.Consumable ||
      item.category === ItemCategory.Breakthrough
        ? (item as ConsumableItem)
        : null;
    const consumableEffectLabels = consumable
      ? getConsumableEffectDetailLabels(consumable)
      : [];
    const overflowCount = Math.max(
      0,
      sourceTrace.sources.length -
        getVisibleSourceChips(sourceTrace.sources).length
    );

    return (
      <div
        key={item.id}
        className="bg-stone-800 p-3 rounded border border-stone-700 group hover:border-amber-500/30 transition-colors"
        data-testid={`${testIdPrefix}-card-${item.id}`}
      >
        <div className="flex justify-between">
          <span className="font-bold text-stone-200">{item.name}</span>
          <div className="ml-2">
            {item.category === ItemCategory.Equipment ? (
              <div className="flex gap-1">
                {[
                  {
                    l: "下",
                    q: 0,
                    c: "text-stone-500 border-stone-800 bg-stone-900/50",
                  },
                  {
                    l: "中",
                    q: 1,
                    c: "text-emerald-500 border-emerald-900/30 bg-emerald-950/20",
                  },
                  {
                    l: "上",
                    q: 2,
                    c: "text-sky-500 border-sky-900/30 bg-sky-950/20",
                  },
                  {
                    l: "仙",
                    q: 3,
                    c: "text-amber-500 border-amber-900/30 bg-amber-950/20",
                  },
                ].map((badge) => (
                  <span key={badge.q} className="relative group/tier inline-flex">
                    <span
                      className={clsx("text-[10px] px-1 rounded border", badge.c)}
                    >
                      {badge.l}
                    </span>
                    <GameHintBubble
                      eyebrow="DROP TIER"
                      className="bottom-full left-1/2 mb-2 -translate-x-1/2"
                      trigger="tier"
                    >
                      可掉落{badge.l}品
                    </GameHintBubble>
                  </span>
                ))}
              </div>
            ) : (
              <span
                className={clsx(
                  "text-[10px] px-1.5 rounded border h-fit",
                  item.quality === ItemQuality.Immortal
                    ? "text-amber-500 border-amber-900/50 bg-amber-950/30"
                    : item.quality === ItemQuality.High
                      ? "text-sky-400 border-sky-900/50 bg-sky-950/30"
                      : item.quality === ItemQuality.Medium
                        ? "text-emerald-400 border-emerald-900/50 bg-emerald-950/30"
                        : "text-stone-400 border-stone-700"
                )}
              >
                {item.quality === ItemQuality.Immortal
                  ? "仙"
                  : item.quality === ItemQuality.High
                    ? "上"
                    : item.quality === ItemQuality.Medium
                      ? "中"
                      : "下"}
              </span>
            )}
          </div>
        </div>
        <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-stone-500">
          <span
            className="rounded border border-amber-900/30 bg-amber-950/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200"
            data-testid={`${testIdPrefix}-category-${item.id}`}
          >
            {category.label}
          </span>
          <span>{getItemSubtypeLabel(item)}</span>
        </div>

        <p className="text-xs text-stone-400 mt-1 line-clamp-2 min-h-[2.5em]">
          {item.description}
        </p>

        {consumableEffectLabels.length > 0 && (
          <div
            className="mt-3 space-y-1 rounded border border-stone-700/50 bg-stone-900/40 p-2"
            data-testid={`${testIdPrefix}-effects-${item.id}`}
          >
            <div className="text-[10px] font-semibold text-amber-200">功效</div>
            <div className="flex flex-wrap gap-1.5">
              {consumableEffectLabels.map((label) => (
                <span
                  key={label}
                  className="rounded border border-amber-900/40 bg-amber-950/20 px-1.5 py-0.5 text-[10px] leading-4 text-amber-100"
                >
                  {label}
                </span>
              ))}
            </div>
            {hasRecoveryEffect(consumable.effects) && (
              <div className="text-[10px] text-stone-500">
                戰鬥補給共用冷卻：{RECOVERY_CONSUMABLE_COOLDOWN_MS / 1000} 秒
              </div>
            )}
          </div>
        )}

        <div
          className="mt-3 pt-2 border-t border-stone-700/50"
          data-testid={`${testIdPrefix}-source-${item.id}`}
        >
          <span className="text-[10px] text-stone-600 block mb-1">
            來源追蹤:
          </span>
          <div className="flex flex-wrap gap-1">
            {renderSourceChips(sourceTrace.sources)}
            {overflowCount > 0 && (
              <span
                className="text-[10px] text-stone-500 cursor-help hover:text-stone-300 decoration-dotted underline"
                onMouseEnter={(event) => {
                  cancelTooltipHide();
                  setTooltip({
                    visible: true,
                    x: event.clientX,
                    y: event.clientY,
                    title: "完整來源追蹤",
                    footer: `${sourceTrace.sources.length} 個來源`,
                    content: renderGroupedSourcePopover(sourceTrace),
                  });
                }}
                onMouseLeave={scheduleTooltipHide}
              >
                +{overflowCount} 更多
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSkillCard = (skill: Skill) => {
    const sourceTrace = buildCompendiumSkillSourceTrace(skill);
    const effectDetails = getSkillEffectDetails(skill);

    return (
      <div
        key={skill.id}
        className="bg-stone-800 p-3 rounded border border-stone-700 group hover:border-amber-500/30 transition-colors"
        data-testid={`compendium-skill-card-${skill.id}`}
      >
        <div className="flex justify-between">
          <span className="font-bold text-stone-200">{skill.name}</span>
          <span className="ml-2 h-fit shrink-0 rounded border border-amber-900/40 bg-amber-950/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
            {getSkillTypeLabel(skill.type)}
          </span>
        </div>

        <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-stone-500">
          <span className="rounded border border-amber-900/30 bg-amber-950/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
            功法
          </span>
          <span>{getProfessionLabel(skill.profession)}</span>
          <span>{MajorRealmCN[skill.minRealm]}期</span>
          <span>來源：{sourceTrace.formalSourceLabel}</span>
        </div>

        <p className="text-xs text-stone-400 mt-1 line-clamp-2 min-h-[2.5em]">
          {skill.description}
        </p>

        <div
          className="mt-3 space-y-1 rounded border border-stone-700/50 bg-stone-900/40 p-2"
          data-testid={`compendium-skill-effects-${skill.id}`}
        >
          <div className="text-[10px] font-semibold text-amber-200">技能效果</div>
          <div className="flex flex-wrap gap-1.5">
            {effectDetails.map((detail) => (
              <span
                key={detail}
                className="rounded border border-amber-900/40 bg-amber-950/20 px-1.5 py-0.5 text-[10px] leading-4 text-amber-100"
              >
                {detail}
              </span>
            ))}
          </div>
        </div>

        <div
          className="mt-3 pt-2 border-t border-stone-700/50"
          data-testid={`compendium-skill-source-${skill.id}`}
        >
          <span className="text-[10px] text-stone-600 block mb-1">
            來源追蹤:
          </span>
          <div className="flex flex-wrap gap-1">
            {renderSourceChips(sourceTrace.sources, "未標記")}
          </div>
        </div>
      </div>
    );
  };

  const renderMapIndexCard = (map: (typeof MAPS)[number]) => (
    <div
      key={map.id}
      onClick={() => setSelectedId(selectedId === map.id ? null : map.id)}
      className={clsx(
        "cursor-pointer rounded border p-3 transition-colors",
        selectedId === map.id
          ? "border-amber-600/50 bg-amber-900/20 text-amber-400"
          : "border-stone-700 bg-stone-800 text-stone-400 hover:bg-stone-700"
      )}
    >
      <div className="font-bold">{map.name}</div>
      <div className="mt-1 line-clamp-2 text-xs opacity-60">
        {map.description}
      </div>
    </div>
  );

  if (!isOpen) return null;

  const content = (
      <div
        className={clsx(
          "relative flex h-full min-h-0 w-full overflow-hidden flex-col md:flex-row",
          embedded
            ? "bg-transparent"
            : "rounded-[24px] border border-stone-700 bg-stone-900 shadow-2xl"
        )}
        data-testid="compendium-panel"
      >
        {/* Tooltip Portal (Quick implementation inside) */}
        {tooltip && tooltip.visible && (
          <GameTooltip
            eyebrow="DROP INTEL"
            title={tooltip.title}
            footer={tooltip.footer}
            widthClassName="w-[min(520px,calc(100vw-2rem))]"
            className="z-[70] text-xs"
            style={{ left: tooltip.x, top: tooltip.y }}
            interactive
            onMouseEnter={cancelTooltipHide}
            onMouseLeave={scheduleTooltipHide}
          >
            {tooltip.content}
          </GameTooltip>
        )}

        {/* Sidebar Tabs */}
        <div
          className={clsx(
            "flex shrink-0 overflow-x-auto border-r border-stone-800 md:flex-col md:overflow-y-auto",
            embedded ? "bg-stone-950/60 md:w-56" : "bg-stone-950/90 md:w-64"
          )}
        >
          {!embedded && (
            <div
              className={clsx(
                "sticky left-0 top-0 z-10 flex items-center justify-between border-b border-stone-800 p-4 md:static",
                "bg-stone-950/95"
              )}
            >
              <div className="flex items-center gap-2">
                <Book className="text-amber-500" />
                <span className="text-xl font-bold text-stone-200">萬界圖鑑</span>
              </div>
              <Button onClick={onClose} className="md:hidden p-1 text-stone-400" variant="ghost" size="icon">
                <X />
              </Button>
            </div>
          )}

          <nav className={clsx("flex gap-1 p-2", embedded ? "pt-4 md:pt-5" : "", "md:flex-col")}>
            {[
              { id: "realm", label: "境界總覽", icon: Database },
              { id: "map", label: "九域輿圖", icon: MapIcon },
              { id: "item", label: "萬物圖鑑", icon: Book },
              { id: "equipment", label: "裝備法寶", icon: Sword },
              { id: "skill", label: "功法神通", icon: Scroll },
              { id: "sect", label: "宗門傳承", icon: Shield },
            ].map((tab) => (
              <Button
                key={tab.id}
                data-testid={`compendium-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSelectedId(null);
                }}
                variant="tab"
                size="sm"
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-amber-900/30 text-amber-500 border border-amber-900/50"
                    : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                )}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className={clsx("flex min-h-0 min-w-0 flex-1 flex-col", embedded ? "bg-transparent" : "bg-stone-900/50")}>
          {/* Header */}
          {!embedded && (
          <div className="flex justify-end border-b border-stone-800 p-4">
            <Button
              onClick={onClose}
              className={clsx(
                "p-2 text-stone-400 hover:text-stone-100",
                embedded ? "hidden" : "hidden md:block"
              )}
              variant="ghost"
              size="icon"
            >
              <X />
            </Button>
          </div>
          )}

          <div
            className={clsx(
              "scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent",
              embedded ? "min-h-0 flex-1 overflow-auto p-4 md:p-8" : "min-h-0 flex-1 overflow-auto p-6"
            )}
          >
            {/* --- Realm Tab --- */}
            {activeTab === "realm" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-amber-500 mb-4 border-b border-stone-700 pb-2">
                  修仙境界一覽
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(MajorRealm)
                    .filter((realm): realm is MajorRealm => typeof realm === "number")
                    .map((realmId) => {
                      const detail = realmCompendiumDetails[realmId];
                      return (
                        <div
                          key={realmId}
                          className="bg-stone-800 p-3 rounded border border-stone-700 group hover:border-amber-500/30 transition-colors"
                          data-testid={`compendium-realm-card-${realmId}`}
                        >
                          <div className="flex justify-between gap-3">
                            <h3 className="font-bold text-stone-200">
                              {MajorRealmCN[realmId]}
                            </h3>
                            <span className="h-fit shrink-0 rounded border border-amber-900/40 bg-amber-950/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                              境界
                            </span>
                          </div>
                          <div className="mb-1 mt-1 flex flex-wrap items-center gap-1 text-xs text-stone-500">
                            <span className="rounded border border-amber-900/30 bg-amber-950/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                              修行定位
                            </span>
                            <span>{detail.role}</span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1 line-clamp-3 min-h-[3.75em]">
                            {detail.description}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* --- Map & Monster Tab --- */}
            {activeTab === "map" && (
              <div
                className="flex min-h-[420px] flex-col gap-4 lg:h-full lg:flex-row"
                data-testid="compendium-map-layout"
              >
                {/* List */}
                <div
                  className="max-h-64 overflow-y-auto border-b border-stone-800 pb-4 lg:max-h-none lg:w-1/3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4"
                  data-testid="compendium-map-list"
                >
                  <h3 className="sticky top-0 z-10 mb-4 bg-stone-950/95 py-2 text-lg font-bold text-stone-300">
                    地圖索引
                  </h3>
                  {villageMaps.length > 0 && (
                    <section className="mb-4 space-y-2">
                      <h4
                        className="border-l-4 border-amber-700 bg-stone-900/70 py-1.5 pl-2 text-sm font-bold text-amber-300"
                        data-testid="compendium-map-village-heading"
                      >
                        村莊聚落
                      </h4>
                      {villageMaps.map((map) => renderMapIndexCard(map))}
                    </section>
                  )}
                  {mapsByRealm.map((group) => (
                    <section key={group.realm} className="mb-4 space-y-2">
                      <h4
                        className="border-l-4 border-amber-700 bg-stone-900/70 py-1.5 pl-2 text-sm font-bold text-amber-300"
                        data-testid={`compendium-map-realm-heading-${group.realm}`}
                      >
                        {MajorRealmCN[group.realm]}地圖
                      </h4>
                      {group.maps.map((map) => renderMapIndexCard(map))}
                    </section>
                  ))}
                </div>
                {/* Detail */}
                <div
                  className="min-h-[240px] flex-1 overflow-y-auto"
                  data-testid="compendium-map-detail"
                >
                  {selectedId ? (
                    <div>
                      {(() => {
                        const map = MAPS.find((m) => m.id === selectedId);
                        if (!map) return <div>地圖未找到</div>;

                        const monsters = map.enemies;
                        const hasNPCs = map.npcs && map.npcs.length > 0;

                        return (
                          <>
                            <div className="mb-6 rounded-lg border border-amber-900/40 bg-amber-950/20 p-4">
                              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-stone-500">
                                地圖資訊
                              </div>
                              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                  <h2 className="text-2xl font-bold text-amber-500">
                                    {map.name}
                                  </h2>
                                  <p className="mt-1 text-sm text-stone-400">
                                    {map.description}
                                  </p>
                                </div>
                                <span className="h-fit shrink-0 rounded border border-amber-900/40 bg-amber-950/20 px-3 py-1 text-xs text-amber-200">
                                  {MajorRealmCN[map.minRealm]}地圖
                                </span>
                              </div>
                            </div>

                            {/* NPC Section (For Villages/Sects) */}
                            {hasNPCs && (
                              <div className="mb-8">
                                <h3 className="text-xl font-bold text-stone-300 mb-4 flex items-center gap-2">
                                  <User size={20} /> 區域人物
                                </h3>
                                <div className="grid gap-3">
                                  {map.npcs.map((npc) => (
                                    <div
                                      key={npc.id}
                                      className="bg-stone-800 p-3 rounded border border-stone-700 flex justify-between items-center px-4"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-amber-500 font-bold text-lg">
                                            {npc.name}
                                          </span>
                                          <span className="text-xs px-1.5 py-0.5 rounded bg-stone-700 text-stone-400 border border-stone-600">
                                            {npc.type === NPCType.Shop
                                              ? "商舖"
                                              : npc.type === NPCType.Quest
                                                ? "任務"
                                                : "人物"}
                                          </span>
                                        </div>
                                        <p className="text-stone-500 text-sm mt-1">
                                          {npc.description}
                                        </p>
                                      </div>
                                      {/* Function hint */}
                                      <div className="text-xs text-stone-600 italic">
                                        {npc.type === NPCType.Shop &&
                                          "販賣物品"}
                                        {npc.type === NPCType.Quest &&
                                          "提供指引"}
                                        {npc.type === NPCType.Crafting &&
                                          "鍛造裝備"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Monsters Section (Only if not purely safe/village or has monsters) */}
                            {(!hasNPCs || monsters.length > 0) && (
                              <>
                                <h3 className="text-xl font-bold text-stone-300 mb-4 flex items-center gap-2">
                                  <Skull size={20} /> 區域妖獸
                                </h3>
                                {monsters.length === 0 ? (
                                  <p className="text-stone-500 italic">
                                    此區域無妖獸出沒。
                                  </p>
                                ) : (
                                  <div className="grid gap-4">
                                    {monsters.map((monster) => (
                                      <div
                                        key={monster.id}
                                        className="bg-stone-800 p-4 rounded border border-stone-700"
                                        data-testid={`compendium-enemy-card-${monster.id}`}
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div>
                                            <span
                                              className={clsx(
                                                "px-2 py-0.5 rounded text-xs font-bold mr-2",
                                                monster.rank === EnemyRank.Boss
                                                  ? "bg-red-900/30 text-red-500 border border-red-900/50"
                                                  : monster.rank ===
                                                      EnemyRank.Elite
                                                    ? "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                                                    : "bg-stone-700 text-stone-400 border border-stone-600"
                                              )}
                                            >
                                              {getEnemyRankLabel(monster.rank)}
                                            </span>
                                            <span className="font-bold text-stone-200 text-lg">
                                              {monster.name}
                                            </span>
                                          </div>
                                          <span className="text-stone-500 text-sm">
                                            境界: {MajorRealmCN[monster.realm]}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                          <div
                                            className="rounded border border-amber-900/40 bg-stone-950/70 p-2"
                                            data-testid={`compendium-enemy-power-${monster.id}`}
                                          >
                                            <div className="text-[10px] uppercase tracking-wider text-stone-500">
                                              戰力
                                            </div>
                                            <div className="text-sm font-bold text-amber-300">
                                              {formatCombatPower(calculateEnemyCombatPower(monster))}
                                            </div>
                                          </div>
                                          <div className="rounded border border-stone-700 bg-stone-950/70 p-2">
                                            <div className="text-[10px] uppercase tracking-wider text-stone-500">
                                              氣血
                                            </div>
                                            <div className="text-sm font-bold text-stone-200">
                                              氣血 {monster.maxHp}
                                            </div>
                                          </div>
                                          <div className="rounded border border-stone-700 bg-stone-950/70 p-2">
                                            <div className="text-[10px] uppercase tracking-wider text-stone-500">
                                              攻防
                                            </div>
                                            <div className="text-sm font-bold text-stone-200">
                                              攻擊 {monster.attack} / 防禦 {monster.defense}
                                            </div>
                                          </div>
                                          <div className="rounded border border-stone-700 bg-stone-950/70 p-2">
                                            <div className="text-[10px] uppercase tracking-wider text-stone-500">
                                              元素
                                            </div>
                                            <div className="text-sm font-bold text-stone-200">
                                              {getElementLabel(monster.element)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-xs text-stone-400 md:grid-cols-2">
                                          <div className="rounded border border-stone-700 bg-stone-950/50 p-2">
                                            AI：{getEnemyAiLabel(monster.aiStyle)}
                                          </div>
                                          <div className="rounded border border-stone-700 bg-stone-950/50 p-2">
                                            弱點：{formatEnemyElements(monster.weaknesses)}
                                          </div>
                                          <div className="rounded border border-stone-700 bg-stone-950/50 p-2">
                                            抗性：{formatEnemyElements(monster.resistances)}
                                          </div>
                                          <div className="rounded border border-stone-700 bg-stone-950/50 p-2">
                                            特殊攻擊：
                                            {monster.specialAttack
                                              ? `${monster.specialAttack.name} / ${monster.specialAttack.cooldownSeconds}s`
                                              : "無特殊攻擊"}
                                          </div>
                                        </div>

                                        {/* Drops */}
                                        <div className="mt-3 bg-stone-900/50 p-3 rounded">
                                          <span className="text-xs text-stone-500 uppercase font-bold tracking-wider">
                                            可能掉落
                                          </span>
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {getEnemyDrops(monster.id).length >
                                            0 ? (
                                              getEnemyDrops(monster.id).map(
                                                (item) => (
                                                  <div
                                                    key={item.id}
                                                    className={clsx(
                                                      "flex items-center gap-1 px-2 py-1 rounded text-xs border bg-stone-800/50",
                                                      /* Item Colors based on Quality */
                                                      /* Keeping simple colored text for quality indication */
                                                      item.quality === 3
                                                        ? "border-amber-900/50 text-amber-500"
                                                        : item.quality === 2
                                                          ? "border-sky-900/50 text-sky-400"
                                                          : "border-stone-700 text-stone-400"
                                                    )}
                                                  >
                                                    <span>{item.name}</span>
                                                  </div>
                                                )
                                              )
                                            ) : (
                                              <span className="text-stone-600 text-sm italic"></span>
                                            )}
                                            {/* Spirit Stones - Using distinct Cyan color */}
                                            <div className="px-2 py-1 text-xs text-cyan-400 font-bold border border-cyan-900/30 rounded bg-cyan-950/20">
                                              靈石
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-stone-600">
                      請選擇左側地圖查看詳情
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- Item Tab (Grouped by Realm) --- */}
            {activeTab === "item" && (
              <div className="space-y-8" data-testid="compendium-item-grid">
                <div
                  className="rounded-lg border border-stone-800 bg-stone-950/60 p-4"
                  data-testid="compendium-item-header"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-amber-400">
                        萬物圖鑑
                      </h2>
                      <p className="mt-1 text-sm text-stone-500">
                        依物品線與境界檢視正式物品、來源追蹤與工坊用途，不使用 sticky 標題遮住卡片。
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className="rounded border border-amber-900/40 bg-amber-950/20 px-3 py-1 text-xs text-amber-200">
                        {visibleItems.length} / {generalItemList.length} 件物品
                      </span>
                      <span className="text-xs text-stone-600">
                        {activeItemCategoryLabel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      data-testid="compendium-item-category-filter-all"
                      onClick={() => setActiveItemCategory("all")}
                      variant={activeItemCategory === "all" ? "amber" : "outline"}
                      size="sm"
                      className="h-8 rounded-md px-2.5 text-xs"
                    >
                      全部
                      <span className="ml-1 text-[10px] opacity-70">
                        {generalItemList.length}
                      </span>
                    </Button>
                    {COMPENDIUM_GENERAL_ITEM_CATEGORIES.map((category) => (
                      <Button
                        key={category.id}
                        data-testid={`compendium-item-category-filter-${category.id}`}
                        onClick={() => setActiveItemCategory(category.id)}
                        variant={
                          activeItemCategory === category.id
                            ? "amber"
                            : "outline"
                        }
                        size="sm"
                        className="h-8 rounded-md px-2.5 text-xs"
                        title={category.description}
                      >
                        {category.label}
                        <span className="ml-1 text-[10px] opacity-70">
                          {itemCategoryCounts[category.id]}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
                {activeItemGroups.map((group) => {
                    return (
                      <div key={group.realm} className="space-y-4">
                        <h3
                          className="border-l-4 border-amber-600 bg-stone-900/70 py-2 pl-3 text-xl font-bold text-amber-500"
                          data-testid={`compendium-item-realm-heading-${group.realm}`}
                        >
                          {MajorRealmCN[group.realm]}期
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.items.map((item) =>
                            renderItemCard(item, "compendium-item")
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {activeTab === "equipment" && (
              <div className="space-y-6" data-testid="compendium-equipment-grid">
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/70 p-1">
                  {skillProfessionTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      data-testid={`compendium-equipment-profession-${tab.id.toLowerCase()}`}
                      onClick={() => setActiveEquipmentProfession(tab.id)}
                      variant="tab"
                      size="sm"
                      className={clsx(
                        "shrink-0",
                        activeEquipmentProfession === tab.id
                          ? "border-amber-600/60 bg-amber-500/15 text-amber-100"
                          : "text-stone-400"
                      )}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                <div
                  className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4"
                  data-testid="compendium-equipment-header"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-amber-400">
                        {getProfessionRouteLabel(activeEquipmentProfession)}
                        裝備
                      </h2>
                      <p className="mt-1 text-sm text-stone-500">
                        獨立檢視武器、防具、飾品與法寶裝備，依通用與職業路線保留品質、子類與來源追蹤。
                      </p>
                    </div>
                    <span className="rounded border border-amber-900/40 bg-amber-950/20 px-3 py-1 text-xs text-amber-200">
                      {activeEquipmentCount} 件裝備
                    </span>
                  </div>
                </div>

                {activeEquipmentGroups.length === 0 ? (
                  <div className="rounded border border-stone-800 bg-stone-900/60 p-4 text-sm text-stone-500">
                    目前沒有此分類的正式裝備。
                  </div>
                ) : (
                  <div className="space-y-8">
                    {activeEquipmentGroups.map((group) => (
                      <div key={group.realm} className="space-y-4">
                        <h3
                          className="border-l-4 border-amber-600 bg-stone-900/70 py-2 pl-3 text-xl font-bold text-amber-500"
                          data-testid={`compendium-equipment-realm-heading-${group.realm}`}
                        >
                          {MajorRealmCN[group.realm]}期
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.items.map((item) =>
                            renderItemCard(item, "compendium-equipment")
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- Skill Tab --- */}
            {activeTab === "skill" && (
              <div className="space-y-6" data-testid="compendium-skill-layout">
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/70 p-1">
                  {skillProfessionTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      data-testid={`compendium-skill-profession-${tab.id.toLowerCase()}`}
                      onClick={() => setActiveSkillProfession(tab.id)}
                      variant="tab"
                      size="sm"
                      className={clsx(
                        "shrink-0",
                        activeSkillProfession === tab.id
                          ? "border-amber-600/60 bg-amber-500/15 text-amber-100"
                          : "text-stone-400"
                      )}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                <div
                  className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4"
                  data-testid="compendium-skill-summary"
                >
                  <div className="text-sm font-bold text-amber-100">
                    {getProfessionRouteLabel(activeSkillProfession)}功法
                  </div>
                  <div className="mt-1 text-xs text-stone-400">
                    {activeSkillCount} 本正式功法，依 {activeSkillGroups.length} 個境界分段顯示，並保留藏經閣、精英、首領與古修傳承來源 cue。
                  </div>
                </div>

                {activeSkillGroups.length === 0 ? (
                  <div className="rounded border border-stone-800 bg-stone-900/60 p-4 text-sm text-stone-500">
                    目前沒有此分類的正式功法。
                  </div>
                ) : (
                  <div className="space-y-8">
                    {activeSkillGroups.map((group) => (
                      <section key={group.realm} className="space-y-3">
                        <h3
                          className="border-l-4 border-amber-600 bg-stone-900/70 py-2 pl-3 text-lg font-bold text-amber-500"
                          data-testid={`compendium-skill-realm-${group.realm}`}
                        >
                          {MajorRealmCN[group.realm]}期
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {group.skills.map((skill) => renderSkillCard(skill))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- Sect Tab --- */}
            {activeTab === "sect" && (
              <div className="space-y-6" data-testid="compendium-sect-layout">
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/70 p-1">
                  {sectConfigs.map((sect) => (
                    <Button
                      key={sect.id}
                      data-testid={`compendium-sect-tab-${sect.id}`}
                      onClick={() => setActiveSectId(sect.id)}
                      variant="tab"
                      size="sm"
                      className={clsx(
                        "shrink-0",
                        activeSectId === sect.id
                          ? "border-amber-600/60 bg-amber-500/15 text-amber-100"
                          : "text-stone-400"
                      )}
                    >
                      {sect.name}
                    </Button>
                  ))}
                </div>

                <div
                  className="rounded-lg border border-stone-700 bg-stone-800/50 p-5 md:p-6"
                  data-testid={`compendium-sect-panel-${activeSect.id}`}
                >
                  <div className="mb-6">
                    <h2 className="mb-2 text-2xl font-bold text-amber-500 md:text-3xl">
                      {activeSect.name}
                    </h2>
                    <p className="text-base text-stone-400 md:text-lg">
                      {activeSect.desc}
                    </p>
                  </div>

                  <div className="mb-8 rounded border border-stone-800 bg-stone-900/50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-stone-300">
                      <User size={18} /> 宗門人物
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {activeSectNpcs.map((npc) => (
                        <div key={npc.id} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-stone-700 bg-stone-800 text-xs font-bold text-stone-500">
                            {npc.symbol}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-stone-200">
                              {npc.name}
                              <span className="ml-2 rounded border border-stone-800 bg-stone-900 px-1 text-[10px] text-stone-500">
                                {npc.type === NPCType.Shop
                                  ? "商舖"
                                  : npc.type === NPCType.Quest
                                    ? "任務"
                                    : "人物"}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500">
                              {npc.description}
                            </div>
                          </div>
                        </div>
                      ))}
                      {activeSectNpcs.length === 0 && (
                        <span className="text-xs text-stone-600">
                          暫無人物資訊
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="mb-4 flex items-center gap-2 font-bold text-stone-300">
                      <Scroll size={18} /> 傳承功法
                    </h4>
                    <div className="space-y-5">
                      {activeSectSkillGroups.map((group) => (
                        <section key={group.realm} className="space-y-3">
                          <h5 className="border-l-4 border-amber-700 bg-stone-900/70 py-2 pl-3 text-sm font-bold text-amber-300">
                            {MajorRealmCN[group.realm]}期
                          </h5>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {group.skills.map((skill) => {
                              const sourceTrace = buildCompendiumSkillSourceTrace(skill);
                              return (
                                <div
                                  key={skill.id}
                                  className="rounded border border-stone-800 bg-stone-900 p-3"
                                >
                                <div className="flex justify-between gap-3">
                                  <span className="font-bold text-stone-200">
                                    {skill.name}
                                  </span>
                                  <span className="shrink-0 text-xs text-stone-500">
                                    {getSkillTypeLabel(skill.type)}
                                  </span>
                                </div>
                                <div className="mt-1 text-[11px] text-stone-600">
                                  來源：{sourceTrace.formalSourceLabel}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {renderSourceChips(sourceTrace.sources, "未標記")}
                                </div>
                                <p className="mt-1 text-xs text-stone-500">
                                  {skill.description}
                                </p>
                              </div>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                  </div>

                  <div className="rounded border border-stone-800 bg-stone-950/50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-bold text-stone-300">
                      <MapIcon size={18} /> 章節線索
                    </h4>
                    <div className="grid gap-2">
                      <div
                        className="rounded border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-200"
                        data-testid={`compendium-sect-route-source-${activeSect.id}`}
                      >
                        <div className="font-bold text-amber-100">
                          {activeSect.routeSourceSummary.material}
                        </div>
                        <div className="mt-1 text-amber-300/80">
                          {activeSect.routeSourceSummary.worldMemoryTag}
                        </div>
                        <div className="mt-1 text-stone-400">
                          {activeSect.routeSourceSummary.usage}
                        </div>
                      </div>
                      <div
                        className="rounded border border-violet-900/40 bg-violet-950/20 px-3 py-2 text-xs text-violet-200"
                        data-testid={`compendium-sect-endgame-source-${activeSect.id}`}
                      >
                        <div className="font-bold text-violet-100">
                          終盤閉環
                        </div>
                        <div className="mt-1 text-violet-300/80">
                          {activeSect.routeSourceSummary.endgameMemoryTag}
                        </div>
                        <div className="mt-1 text-stone-400">
                          {activeSect.routeSourceSummary.endgameUsage}
                        </div>
                      </div>
                      {activeSect.chapterCues.map((cue) => (
                        <div
                          key={cue}
                          className="rounded border border-stone-800 bg-stone-900/70 px-3 py-2 text-xs text-stone-400"
                        >
                          {cue}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-6xl h-[90vh]">{content}</div>
    </div>
  );
};
