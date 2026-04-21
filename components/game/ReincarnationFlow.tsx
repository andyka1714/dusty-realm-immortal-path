import React from "react";
import clsx from "clsx";
import {
  Sparkles,
  Skull,
  ScrollText,
  Gem,
  Shield,
  RefreshCw,
} from "lucide-react";
import { REALM_NAMES, SPIRIT_ROOT_DETAILS } from "../../constants";
import {
  LifeReviewSummary,
  ReincarnationPerk,
  RebirthConfig,
  SoulLifetimeStats,
  SpiritRootId,
} from "../../types";
import {
  getRebirthConfigCost,
  getRebirthConfigSpiritStoneBonus,
  getRebirthConfigStatBonuses,
} from "../../utils/reincarnation";

const getCauseLabel = (cause: LifeReviewSummary["cause"]) => {
  switch (cause) {
    case "battle":
      return "戰死道途";
    case "voluntary":
      return "主動坐化";
    case "lifespan":
    default:
      return "壽元已盡";
  }
};

const formatAttributeBonuses = (bonuses: Record<string, number>) => {
  const labels: Record<string, string> = {
    physique: "體魄",
    rootBone: "根骨",
    insight: "神識",
    comprehension: "悟性",
    fortune: "福緣",
    charm: "魅力",
  };

  return Object.entries(bonuses)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${labels[key] ?? key} +${value}`);
};

interface LifeReviewScreenProps {
  summary: LifeReviewSummary;
  totalMerit: number;
  lifetimeStats: SoulLifetimeStats;
  onEnterHall: () => void;
}

const LifeReviewScreen: React.FC<LifeReviewScreenProps> = ({
  summary,
  totalMerit,
  lifetimeStats,
  onEnterHall,
}) => (
  <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center p-6">
    <div className="w-full rounded-[28px] border border-stone-800 bg-stone-950/95 p-8 shadow-2xl md:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_320px]">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
              <ScrollText size={28} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-stone-500">
                Life Review
              </p>
              <h1 className="text-3xl font-bold text-stone-100">本世結算</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 text-stone-300">
            <p className="text-sm leading-7 text-stone-300">
              <span className="font-semibold text-amber-400">
                {getCauseLabel(summary.cause)}
              </span>
              ，享年 {summary.ageYears} 歲，最高境界抵達{" "}
              <span className="font-semibold text-stone-100">
                {REALM_NAMES[summary.highestRealm]}
              </span>
              。
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4">
                <div className="text-xs text-stone-500">境界功德</div>
                <div className="mt-2 text-2xl font-semibold text-amber-400">
                  {summary.realmMerit}
                </div>
              </div>
              <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4">
                <div className="text-xs text-stone-500">歲月功德</div>
                <div className="mt-2 text-2xl font-semibold text-amber-400">
                  {summary.ageMerit}
                </div>
              </div>
              <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4">
                <div className="text-xs text-stone-500">本世新增</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-400">
                  +{summary.totalMeritGained}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Gem className="text-cyan-400" size={18} />
              <h2 className="text-lg font-semibold text-stone-100">可繼承遺珍</h2>
            </div>
            {summary.eligibleHeirlooms.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {summary.eligibleHeirlooms.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-xl border border-stone-800 bg-stone-950/75 p-4"
                  >
                    <div className="text-sm font-medium text-stone-100">
                      {candidate.label}
                    </div>
                    <div className="mt-1 text-xs text-stone-500">
                      {candidate.sourceType === "equipment" ? "裝備遺珍" : "功法手札"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">
                本世沒有可帶入下一輪的遺珍，進入輪迴後只能依靠功德重新塑基。
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-5 rounded-2xl border border-stone-800 bg-stone-900/70 p-5">
          <div className="flex items-center gap-3">
            <Shield className="text-violet-400" size={18} />
            <h2 className="text-lg font-semibold text-stone-100">魂印紀錄</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-stone-800 bg-stone-950/75 p-4">
              <div className="text-stone-500">累積功德</div>
              <div className="mt-2 text-2xl font-semibold text-amber-400">
                {totalMerit}
              </div>
            </div>
            <div className="rounded-xl border border-stone-800 bg-stone-950/75 p-4 text-stone-300">
              <div>歷劫次數：{lifetimeStats.totalDeaths}</div>
              <div className="mt-2">
                輪迴次數：{lifetimeStats.totalReincarnations}
              </div>
              <div className="mt-2">
                最高境界：{REALM_NAMES[lifetimeStats.highestRealmEver]}
              </div>
              <div className="mt-2">
                最高壽數：{lifetimeStats.highestAgeYears} 歲
              </div>
            </div>
          </div>

          <button
            onClick={onEnterHall}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 font-medium text-amber-200 transition hover:bg-amber-500/25"
          >
            <Sparkles size={18} />
            進入輪迴大殿
          </button>
        </aside>
      </div>
    </div>
  </div>
);

interface ReincarnationHallScreenProps {
  summary: LifeReviewSummary;
  totalMerit: number;
  unlockedPerks: ReincarnationPerk[];
  config: RebirthConfig;
  onTogglePerk: (perkId: string) => void;
  onToggleHeirloom: (heirloomId: string) => void;
  onSelectSpiritRoot: (spiritRootId?: SpiritRootId) => void;
  onConfirm: () => void;
}

const ReincarnationHallScreen: React.FC<ReincarnationHallScreenProps> = ({
  summary,
  totalMerit,
  unlockedPerks,
  config,
  onTogglePerk,
  onToggleHeirloom,
  onSelectSpiritRoot,
  onConfirm,
}) => {
  const totalCost = getRebirthConfigCost(config);
  const statBonuses = formatAttributeBonuses(getRebirthConfigStatBonuses(config));
  const spiritStoneBonus = getRebirthConfigSpiritStoneBonus(config);
  const canAfford = totalCost <= totalMerit;

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center p-6">
      <div className="w-full rounded-[28px] border border-stone-800 bg-stone-950/95 p-8 shadow-2xl md:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_340px]">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3 text-violet-300">
                <RefreshCw size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-stone-500">
                  Reincarnation Hall
                </p>
                <h1 className="text-3xl font-bold text-stone-100">輪迴大殿</h1>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5">
                <div className="mb-3 text-sm font-medium text-stone-200">魂印加護</div>
                <div className="grid gap-3">
                  {unlockedPerks.map((perk) => {
                    const active = config.selectedPerkIds.includes(perk.id);
                    return (
                      <button
                        key={perk.id}
                        onClick={() => onTogglePerk(perk.id)}
                        className={clsx(
                          "rounded-xl border p-4 text-left transition",
                          active
                            ? "border-amber-500/50 bg-amber-500/10"
                            : "border-stone-800 bg-stone-950/80 hover:border-stone-700"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-stone-100">{perk.name}</span>
                          <span className="text-sm text-amber-400">{perk.cost} 功德</span>
                        </div>
                        <p className="mt-2 text-sm text-stone-400">{perk.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5">
                <div className="mb-3 text-sm font-medium text-stone-200">
                  遺珍與命格
                </div>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="spirit-root-override"
                      className="mb-2 block text-sm text-stone-400"
                    >
                      先天根骨
                    </label>
                    <select
                      id="spirit-root-override"
                      value={config.spiritRootOverride ?? ""}
                      onChange={(event) =>
                        onSelectSpiritRoot(
                          event.target.value
                            ? (event.target.value as SpiritRootId)
                            : undefined
                        )
                      }
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-500"
                    >
                      <option value="">承接前世靈根</option>
                      {Object.entries(SPIRIT_ROOT_DETAILS).map(([spiritRootId, detail]) => (
                        <option key={spiritRootId} value={spiritRootId}>
                          {detail.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-stone-500">
                      改寫靈根需額外消耗 100 功德。
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-stone-400">可攜遺珍（限 1 件）</div>
                    {summary.eligibleHeirlooms.length > 0 ? (
                      <div className="grid gap-2">
                        {summary.eligibleHeirlooms.map((candidate) => {
                          const active = config.selectedHeirloomIds.includes(candidate.id);
                          return (
                            <button
                              key={candidate.id}
                              onClick={() => onToggleHeirloom(candidate.id)}
                              className={clsx(
                                "rounded-xl border p-3 text-left transition",
                                active
                                  ? "border-cyan-500/50 bg-cyan-500/10"
                                  : "border-stone-800 bg-stone-950/80 hover:border-stone-700"
                              )}
                            >
                              <div className="text-sm font-medium text-stone-100">
                                {candidate.label}
                              </div>
                              <div className="mt-1 text-xs text-stone-500">
                                {candidate.sourceType === "equipment"
                                  ? "裝備遺珍"
                                  : "功法手札"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-500">本世沒有可攜遺珍。</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5 rounded-2xl border border-stone-800 bg-stone-900/70 p-5">
            <div className="flex items-center gap-3">
              <Skull className="text-stone-500" size={18} />
              <h2 className="text-lg font-semibold text-stone-100">下一世配置</h2>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
              <div className="flex items-center justify-between">
                <span>現有功德</span>
                <span className="font-semibold text-amber-400">{totalMerit}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>本次花費</span>
                <span className={clsx("font-semibold", canAfford ? "text-stone-100" : "text-rose-300")}>
                  {totalCost}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>剩餘功德</span>
                <span className="font-semibold text-emerald-400">
                  {Math.max(0, totalMerit - totalCost)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
              <div className="text-stone-500">本世基底</div>
              <div className="mt-2">死因：{getCauseLabel(summary.cause)}</div>
              <div className="mt-2">最高境界：{REALM_NAMES[summary.highestRealm]}</div>
              <div className="mt-2">壽數：{summary.ageYears} 歲</div>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
              <div className="text-stone-500">加成預覽</div>
              {statBonuses.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {statBonuses.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-stone-500">尚未選擇屬性類魂印。</div>
              )}
              <div className="mt-3">
                初始靈石 +{spiritStoneBonus}
              </div>
            </div>

            <button
              onClick={onConfirm}
              disabled={!canAfford}
              className={clsx(
                "w-full rounded-xl border px-4 py-3 font-medium transition",
                canAfford
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
                  : "cursor-not-allowed border-stone-800 bg-stone-900 text-stone-500"
              )}
            >
              投胎轉世
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

interface ReincarnationFlowProps {
  flowStep: "life_review" | "hall";
  summary: LifeReviewSummary;
  totalMerit: number;
  lifetimeStats: SoulLifetimeStats;
  unlockedPerks: ReincarnationPerk[];
  config: RebirthConfig;
  onEnterHall: () => void;
  onTogglePerk: (perkId: string) => void;
  onToggleHeirloom: (heirloomId: string) => void;
  onSelectSpiritRoot: (spiritRootId?: SpiritRootId) => void;
  onConfirm: () => void;
}

export const ReincarnationFlow: React.FC<ReincarnationFlowProps> = ({
  flowStep,
  summary,
  totalMerit,
  lifetimeStats,
  unlockedPerks,
  config,
  onEnterHall,
  onTogglePerk,
  onToggleHeirloom,
  onSelectSpiritRoot,
  onConfirm,
}) => {
  if (flowStep === "life_review") {
    return (
      <LifeReviewScreen
        summary={summary}
        totalMerit={totalMerit}
        lifetimeStats={lifetimeStats}
        onEnterHall={onEnterHall}
      />
    );
  }

  return (
    <ReincarnationHallScreen
      summary={summary}
      totalMerit={totalMerit}
      unlockedPerks={unlockedPerks}
      config={config}
      onTogglePerk={onTogglePerk}
      onToggleHeirloom={onToggleHeirloom}
      onSelectSpiritRoot={onSelectSpiritRoot}
      onConfirm={onConfirm}
    />
  );
};
