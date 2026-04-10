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
  Info,
} from "lucide-react";
import {
  MajorRealm,
  MajorRealmCN,
  ProfessionType,
  ElementType,
  EnemyRank,
  MapData,
  Item,
  Enemy,
  Skill,
  NPC,
  NPCType,
  ItemCategory,
  ItemQuality,
} from "../../types";
import { EQUIPMENT_ITEMS } from "../../data/items/equipment";
import { CONSUMABLE_ITEMS } from "../../data/items/consumables"; // Added Consumables
import { SKILLS } from "../../data/skills";
import { COMMON_ENEMIES } from "../../data/enemies/common";
import { ELITE_ENEMIES } from "../../data/enemies/elite";
import { BOSS_ENEMIES } from "../../data/enemies/boss";
import { MAPS } from "../../data/maps";
import clsx from "clsx";

interface CompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

type TabType = "realm" | "map" | "item" | "skill" | "sect";

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

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  isOpen,
  onClose,
  embedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("realm");
  const [selectedId, setSelectedId] = useState<string | null>(null); // For detailed view

  // Tooltip state for Item Drop Source
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
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

  const allSkills: Record<string, Skill> = useMemo(
    () => ({ ...SKILLS }) as unknown as Record<string, Skill>,
    []
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

  if (!isOpen) return null;

  const content = (
      <div
        className={clsx(
          "relative flex h-full w-full overflow-hidden flex-col md:flex-row",
          embedded
            ? "bg-transparent"
            : "rounded-[24px] border border-stone-700 bg-stone-900 shadow-2xl"
        )}
      >
        {/* Tooltip Portal (Quick implementation inside) */}
        {tooltip && tooltip.visible && (
          <div
            className="fixed z-[70] bg-black/90 border border-stone-600 text-stone-200 text-xs p-2 rounded pointer-events-none whitespace-pre-wrap max-w-xs shadow-xl"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
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
              <button onClick={onClose} className="md:hidden p-1 text-stone-400">
                <X />
              </button>
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
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSelectedId(null);
                }}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-amber-900/30 text-amber-500 border border-amber-900/50"
                    : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                )}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className={clsx("min-w-0 flex-1", embedded ? "bg-transparent" : "flex flex-col bg-stone-900/50")}>
          {/* Header */}
          {!embedded && (
          <div className="flex justify-end border-b border-stone-800 p-4">
            <button
              onClick={onClose}
              className={clsx(
                "p-2 text-stone-400 hover:text-stone-100",
                embedded ? "hidden" : "hidden md:block"
              )}
            >
              <X />
            </button>
          </div>
          )}

          <div
            className={clsx(
              "scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent",
              embedded ? "h-full overflow-auto p-6 md:p-8" : "flex-1 overflow-auto p-6"
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
              <div className="flex h-full gap-4">
                {/* List */}
                <div className="w-1/3 border-r border-stone-800 pr-4 overflow-y-auto">
                  <h3 className="text-lg font-bold text-stone-300 mb-4 sticky top-0 bg-stone-900/90 py-2">
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
                <div className="flex-1 overflow-y-auto">
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
              <div className="space-y-12">
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
                        <h3 className="text-xl font-bold text-amber-500 border-l-4 border-amber-600 pl-3 sticky top-0 bg-stone-900/95 py-2 z-10">
                          {MajorRealmCN[rId]}期
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {itemsInRealm.map((item) => (
                            <div
                              key={item.id}
                              className="bg-stone-800 p-3 rounded border border-stone-700 group hover:border-amber-500/30 transition-colors"
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
                                        <span
                                          key={badge.q}
                                          className={clsx(
                                            "text-[10px] px-1 rounded border",
                                            badge.c
                                          )}
                                          title={`可掉落${badge.l}品`}
                                        >
                                          {badge.l}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(allSkills).map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-stone-800 p-4 rounded border border-stone-700"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-indigo-400">
                        {skill.name}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-stone-700 text-stone-300">
                        {getSkillTypeLabel(skill.type)}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1 mb-2">
                      {getProfessionLabel(skill.profession)} |{" "}
                      {MajorRealmCN[skill.minRealm]}
                    </div>
                    <p className="text-sm text-stone-300">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* --- Sect Tab --- */}
            {activeTab === "sect" && (
              <div className="space-y-8">
                {[
                  {
                    id: "sword",
                    name: "凌霄劍宗",
                    desc: "修煉劍道，以攻代守。追求極致的攻擊力與暴擊。",
                    skills: Object.values(allSkills).filter(
                      (s) => s.profession === ProfessionType.Sword
                    ),
                    npcs: MAPS.find((m) => m.id === "4")?.npcs || [],
                  },
                  {
                    id: "body",
                    name: "萬壽山莊",
                    desc: "修煉肉身，力大無窮。擁有超高的防禦與生命回復能力。",
                    skills: Object.values(allSkills).filter(
                      (s) => s.profession === ProfessionType.Body
                    ),
                    npcs: MAPS.find((m) => m.id === "13")?.npcs || [],
                  },
                  {
                    id: "mage",
                    name: "縹緲星宮",
                    desc: "修煉法術，掌控天地。擅長群體傷害與控制法術。",
                    skills: Object.values(allSkills).filter(
                      (s) => s.profession === ProfessionType.Mage
                    ),
                    npcs: MAPS.find((m) => m.id === "23")?.npcs || [],
                  },
                ].map((sect) => (
                  <div
                    key={sect.id}
                    className="bg-stone-800/50 p-6 rounded-lg border border-stone-700"
                  >
                    <div className="md:flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-amber-500 mb-2">
                          {sect.name}
                        </h2>
                        <p className="text-stone-400 text-lg">{sect.desc}</p>
                      </div>
                    </div>

                    {/* Sect NPCs */}
                    <div className="mb-8 p-4 bg-stone-900/50 rounded border border-stone-800">
                      <h4 className="font-bold text-stone-300 mb-3 flex items-center gap-2">
                        <User size={18} /> 宗門人物
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sect.npcs.map((npc) => (
                          <div key={npc.id} className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center border border-stone-700 text-stone-500 font-bold text-xs">
                              {npc.symbol}
                            </div>
                            <div>
                              <div className="text-stone-200 font-bold text-sm">
                                {npc.name}
                                <span className="ml-2 text-[10px] text-stone-500 bg-stone-900 px-1 rounded border border-stone-800">
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
                        {sect.npcs.length === 0 && (
                          <span className="text-stone-600 text-xs">
                            暫無人物資訊
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-stone-300 mb-4 flex items-center gap-2">
                      <Scroll size={18} /> 傳承功法
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sect.skills
                        .sort((a, b) => a.minRealm - b.minRealm)
                        .map((skill) => (
                          <div
                            key={skill.id}
                            className="bg-stone-900 p-3 rounded border border-stone-800"
                          >
                            <div className="flex justify-between">
                              <span className="font-bold text-stone-200">
                                {skill.name}
                              </span>
                              <span className="text-xs text-stone-500">
                                {MajorRealmCN[skill.minRealm]}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                              {skill.description}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
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
