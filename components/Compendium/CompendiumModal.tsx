import React, { useState, useMemo } from "react";
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
  Enemy,
  Skill,
  NPCType,
  ItemCategory,
  ItemQuality,
} from "../../types";
import { EQUIPMENT_ITEMS } from "../../data/items/equipment";
import { CONSUMABLE_ITEMS } from "../../data/items/consumables"; // Added Consumables
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

interface CompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  initialTab?: TabType;
  initialSkillProfession?: ProfessionType;
  initialSectId?: SectId;
}

type TabType = "realm" | "map" | "item" | "skill" | "sect";
type SectId = "sword" | "body" | "mage";

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
  { id: ProfessionType.Sword, label: "劍修" },
  { id: ProfessionType.Body, label: "體修" },
  { id: ProfessionType.Mage, label: "法修" },
];

const sectConfigs: Array<{
  id: SectId;
  profession: ProfessionType;
  name: string;
  desc: string;
  mapId: string;
  chapterCues: string[];
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
  },
];

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  isOpen,
  onClose,
  embedded = false,
  initialTab = "realm",
  initialSkillProfession = ProfessionType.Sword,
  initialSectId = "sword",
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedId, setSelectedId] = useState<string | null>(null); // For detailed view
  const [activeSkillProfession, setActiveSkillProfession] =
    useState<ProfessionType>(initialSkillProfession);
  const [activeSectId, setActiveSectId] = useState<SectId>(initialSectId);

  // Tooltip state for Item Drop Source
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title?: React.ReactNode;
    footer?: React.ReactNode;
    content: React.ReactNode;
  } | null>(null);

  // Aggregate Data
  const allEnemies: Record<string, Enemy> = useMemo(
    () => ({ ...COMMON_ENEMIES, ...ELITE_ENEMIES, ...BOSS_ENEMIES }),
    []
  );

  // Include Consumables to show Boss Breakthrough Drops
  const allItems: Record<string, Item> = useMemo(
    () =>
      ({ ...EQUIPMENT_ITEMS, ...CONSUMABLE_ITEMS }) as unknown as Record<
        string,
        Item
      >,
    []
  );

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
            widthClassName="max-w-xs"
            className="z-[70] whitespace-pre-wrap text-xs"
            style={{ left: tooltip.x, top: tooltip.y }}
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
              { id: "map", label: "山川妖獸", icon: MapIcon },
              { id: "item", label: "神兵法寶", icon: Sword },
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
                  {Object.keys(MajorRealm)
                    .filter((k) => isNaN(Number(k)))
                    .map((key) => {
                      const realmId =
                        MajorRealm[key as keyof typeof MajorRealm];
                      return (
                        <div
                          key={key}
                          className="p-4 bg-stone-800 rounded border border-stone-700 hover:border-amber-500/50 transition-colors"
                        >
                          <h3 className="text-lg font-bold text-amber-400">
                            {MajorRealmCN[realmId]}
                          </h3>
                          <p className="text-sm text-stone-500 mt-1">
                            境界 ID: {realmId}
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
                  <h3 className="sticky top-0 mb-4 bg-stone-950/95 py-2 text-lg font-bold text-stone-300">
                    地圖列表
                  </h3>
                  {MAPS.sort((a, b) => a.minRealm - b.minRealm).map((map) => (
                    <div
                      key={map.id}
                      onClick={() =>
                        setSelectedId(selectedId === map.id ? null : map.id)
                      }
                      className={clsx(
                        "p-3 mb-2 rounded cursor-pointer transition-colors border",
                        selectedId === map.id
                          ? "bg-amber-900/20 border-amber-600/50 text-amber-400"
                          : "bg-stone-800 border-stone-700 text-stone-400 hover:bg-stone-700"
                      )}
                    >
                      <div className="font-bold">{map.name}</div>
                      <div className="text-xs opacity-60">
                        建議境界: {MajorRealmCN[map.minRealm]}
                      </div>
                    </div>
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
                            <h2 className="text-2xl font-bold text-amber-500 mb-2">
                              {map.name}
                            </h2>
                            <p className="text-stone-400 mb-6">
                              {map.description}
                            </p>

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
                                              {monster.rank === EnemyRank.Boss
                                                ? "首領"
                                                : monster.rank ===
                                                    EnemyRank.Elite
                                                  ? "精英"
                                                  : "普通"}
                                            </span>
                                            <span className="font-bold text-stone-200 text-lg">
                                              {monster.name}
                                            </span>
                                          </div>
                                          <span className="text-stone-500 text-sm">
                                            境界: {MajorRealmCN[monster.realm]}
                                          </span>
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
              <div className="space-y-12" data-testid="compendium-item-grid">
                {Object.values(MajorRealm)
                  .filter((r) => typeof r === "number")
                  .map((realmId) => {
                    const rId = realmId as MajorRealm;
                    const itemsInRealm = Object.values(allItems).filter((i) => {
                      // Include base realm items. Some might be undefined (Mortal default)
                      if (i.minRealm === undefined && rId === MajorRealm.Mortal)
                        return true;
                      return i.minRealm === rId;
                    });

                    if (itemsInRealm.length === 0) return null;

                    return (
                      <div key={rId} className="space-y-4">
                        <h3
                          className="border-l-4 border-amber-600 bg-stone-900/70 py-2 pl-3 text-xl font-bold text-amber-500"
                          data-testid={`compendium-item-realm-heading-${rId}`}
                        >
                          {MajorRealmCN[rId]}期
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {itemsInRealm.map((item) => (
                            <div
                              key={item.id}
                              className="bg-stone-800 p-3 rounded border border-stone-700 group hover:border-amber-500/30 transition-colors"
                              data-testid={`compendium-item-card-${item.id}`}
                            >
                              <div className="flex justify-between">
                                <span className="font-bold text-stone-200">
                                  {item.name}
                                </span>
                                {/* Quality Badges */}
                                <div className="ml-2">
                                  {item.category === ItemCategory.Equipment ? (
                                    /* Equipment: Show All Qualities */
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
                                        <span key={badge.q} className="relative group inline-flex">
                                          <span
                                            className={clsx(
                                              "text-[10px] px-1 rounded border",
                                              badge.c
                                            )}
                                          >
                                            {badge.l}
                                          </span>
                                          <GameHintBubble eyebrow="DROP TIER" className="bottom-full left-1/2 mb-2 -translate-x-1/2">
                                            可掉落{badge.l}品
                                          </GameHintBubble>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    /* Non-Equipment (Breakthrough/Consumable): Show Single Quality */
                                    <span
                                      className={clsx(
                                        "text-[10px] px-1.5 rounded border h-fit",
                                        item.quality === ItemQuality.Immortal
                                          ? "text-amber-500 border-amber-900/50 bg-amber-950/30"
                                          : item.quality === ItemQuality.High
                                            ? "text-sky-400 border-sky-900/50 bg-sky-950/30"
                                            : item.quality ===
                                                ItemQuality.Medium
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
                              <div className="text-xs text-stone-500 mb-1">
                                {getItemSubtypeLabel(item)}
                              </div>

                              <p className="text-xs text-stone-400 mt-1 line-clamp-2 min-h-[2.5em]">
                                {item.description}
                              </p>

                              <div className="mt-3 pt-2 border-t border-stone-700/50">
                                <span className="text-[10px] text-stone-600 block mb-1">
                                  掉落來源:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {getDroppedBy(item.id).length > 0 ? (
                                    <>
                                      {getDroppedBy(item.id)
                                        .slice(0, 3)
                                        .map((e) => (
                                          <span
                                            key={e.id}
                                            className={clsx(
                                              "text-[10px] px-1.5 py-0.5 rounded border",
                                              e.rank === EnemyRank.Boss
                                                ? "bg-red-950/40 text-red-400 border-red-900/50"
                                                : e.rank === EnemyRank.Elite
                                                  ? "bg-blue-950/40 text-blue-400 border-blue-900/50"
                                                  : "bg-stone-800 text-stone-400 border-stone-700"
                                            )}
                                          >
                                            {e.name}
                                          </span>
                                        ))}
                                      {getDroppedBy(item.id).length > 3 && (
                                        <span
                                          className="text-[10px] text-stone-500 cursor-help hover:text-stone-300 decoration-dotted underline"
                                          onMouseEnter={(event) => {
                                            const content = (
                                              <div className="flex flex-col gap-1 min-w-[120px]">
                                                {getDroppedBy(item.id).map(
                                                  (e) => (
                                                    <div
                                                      key={e.id}
                                                      className="flex items-center gap-2"
                                                    >
                                                      <span
                                                        className={clsx(
                                                          "text-[10px] px-1.5 py-0.5 rounded border min-w-[32px] text-center shrink-0",
                                                          e.rank ===
                                                            EnemyRank.Boss
                                                            ? "bg-red-950/40 text-red-400 border-red-900/50"
                                                            : e.rank ===
                                                                EnemyRank.Elite
                                                              ? "bg-blue-950/40 text-blue-400 border-blue-900/50"
                                                              : "bg-stone-800 text-stone-400 border-stone-700"
                                                        )}
                                                      >
                                                        {e.rank ===
                                                        EnemyRank.Boss
                                                          ? "首領"
                                                          : e.rank ===
                                                              EnemyRank.Elite
                                                            ? "精英"
                                                            : "普通"}
                                                      </span>
                                                      <span className="text-stone-200">
                                                        {e.name}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            );
                                            setTooltip({
                                              visible: true,
                                              x: event.clientX,
                                              y: event.clientY,
                                              title: "額外掉落來源",
                                              footer: `${getDroppedBy(item.id).length} 個來源`,
                                              content: content,
                                            });
                                          }}
                                          onMouseLeave={() => setTooltip(null)}
                                        >
                                          +{getDroppedBy(item.id).length - 3}{" "}
                                          更多
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-stone-700 italic">
                                      無紀錄
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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

                {activeSkillGroups.length === 0 ? (
                  <div className="rounded border border-stone-800 bg-stone-900/60 p-4 text-sm text-stone-500">
                    目前沒有此分類的正式功法。
                  </div>
                ) : (
                  <div className="space-y-8">
                    {activeSkillGroups.map((group) => (
                      <section key={group.realm} className="space-y-3">
                        <h3
                          className="border-l-4 border-indigo-600 bg-stone-900/70 py-2 pl-3 text-lg font-bold text-indigo-300"
                          data-testid={`compendium-skill-realm-${group.realm}`}
                        >
                          {MajorRealmCN[group.realm]}期
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {group.skills.map((skill) => (
                            <div
                              key={skill.id}
                              className="rounded border border-stone-700 bg-stone-800 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="font-bold text-indigo-400">
                                  {skill.name}
                                </h4>
                                <span className="shrink-0 rounded bg-stone-700 px-2 py-0.5 text-xs text-stone-300">
                                  {getSkillTypeLabel(skill.type)}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-stone-500">
                                {getProfessionLabel(skill.profession)} |{" "}
                                {MajorRealmCN[skill.minRealm]} | 來源：
                                {getSkillSourceLabel(skill.formalSourceTier)}
                              </div>
                              <p className="mt-2 text-sm text-stone-300">
                                {skill.description}
                              </p>
                            </div>
                          ))}
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
                            {group.skills.map((skill) => (
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
                                  來源：{getSkillSourceLabel(skill.formalSourceTier)}
                                </div>
                                <p className="mt-1 text-xs text-stone-500">
                                  {skill.description}
                                </p>
                              </div>
                            ))}
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
