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
  MajorRealm,
  ReincarnationBuildIdentity,
  ReincarnationPerk,
  ReincarnationSoulSeal,
  RebirthConfig,
  SoulLifetimeStats,
  SpiritRootId,
} from "../../types";
import {
  DEFAULT_REINCARNATION_PERKS,
  DEFAULT_REINCARNATION_SOUL_SEALS,
} from "../../data/reincarnationPerks";
import {
  getAvailableReincarnationSoulSeals,
  getRebirthBuildPreview,
  getRebirthConfigCost,
  getRebirthConfigHeirloomSlotCount,
  getRebirthConfigSpiritStoneBonus,
  getRebirthConfigStatBonuses,
  getRebirthHeirloomBlockedReason,
  getRebirthPerkBlockedReason,
  REINCARNATION_BUILD_IDENTITY_LABELS,
} from "../../utils/reincarnation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

const SCREEN_SHELL_CLASS =
  "reincarnation-screen min-h-dvh w-full overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6";
const PANEL_SHELL_CLASS =
  "paper-panel reincarnation-panel mx-auto w-full max-w-[1180px] rounded-[28px] p-4 sm:p-5 md:p-6";
const SECTION_SURFACE_CLASS =
  "paper-cut-section rounded-2xl p-4 sm:p-5";
const INHERIT_PREVIOUS_SPIRIT_ROOT_VALUE = "__inherit_previous_spirit_root__";

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

const getUnlockLabel = ({
  minHighestRealm,
  minReincarnations,
  requiredWorldMemoryTags,
  currentWorldMemoryTags = [],
}: {
  minHighestRealm?: number;
  minReincarnations?: number;
  requiredWorldMemoryTags?: string[];
  currentWorldMemoryTags?: string[];
}) => {
  const labels: string[] = [];
  if (minHighestRealm !== undefined) {
    labels.push(`抵達${REALM_NAMES[minHighestRealm]}後解鎖`);
  }
  if (minReincarnations !== undefined) {
    labels.push(`完成${minReincarnations}次輪迴後解鎖`);
  }
  if (requiredWorldMemoryTags?.length) {
    const missingTags = requiredWorldMemoryTags.filter(
      (tag) => !currentWorldMemoryTags.includes(tag)
    );
    labels.push(
      missingTags.length > 0
        ? `缺少 route memory：${missingTags.join("、")}`
        : `route memory：${requiredWorldMemoryTags.join("、")}`
    );
  }

  return labels.length > 0 ? labels.join(" / ") : "已可參悟";
};

const getRouteMemorySourceLabel = (requiredWorldMemoryTags?: string[]) =>
  requiredWorldMemoryTags?.length
    ? `route memory：${requiredWorldMemoryTags.join("、")}`
    : undefined;

const getSoulSealBenefitLabel = (seal: ReincarnationSoulSeal) => {
  const bonuses = formatAttributeBonuses(seal.statBonuses ?? {});
  if (seal.spiritStoneBonus) {
    bonuses.push(`初始靈石 +${seal.spiritStoneBonus}`);
  }

  return bonuses.length > 0 ? `預期收益：${bonuses.join("、")}` : undefined;
};

const getLifeReviewClosureCue = (summary: LifeReviewSummary) => {
  if (summary.cause !== "voluntary") {
    return null;
  }

  if (summary.highestRealm >= MajorRealm.ImmortalEmperor) {
    return "本世收束：飛升/結局回顧後，主動重開下一世。";
  }

  return "本世收束：保留本世功德，主動重開下一世。";
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
}) => {
  const closureCue = getLifeReviewClosureCue(summary);

  return (
  <div className={SCREEN_SHELL_CLASS}>
    <div className={PANEL_SHELL_CLASS}>
      <div className="space-y-4 sm:space-y-5">
        <section className={SECTION_SURFACE_CLASS}>
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
          <p className="mt-4 text-sm leading-7 text-stone-300">
            <span className="font-semibold text-amber-400">
              {getCauseLabel(summary.cause)}
            </span>
            ，享年 {summary.ageYears} 歲，最高境界抵達{" "}
            <span className="font-semibold text-stone-100">
              {REALM_NAMES[summary.highestRealm]}
            </span>
            。
          </p>
          {closureCue && (
            <p className="mt-3 rounded-xl border border-violet-900/40 bg-violet-950/30 px-3 py-2 text-sm leading-6 text-violet-100">
              {closureCue}
            </p>
          )}
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
        </section>

        <section className={SECTION_SURFACE_CLASS}>
          <div className="flex items-center gap-3">
            <Shield className="text-violet-400" size={18} />
            <h2 className="text-lg font-semibold text-stone-100">魂印紀錄</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-800 bg-stone-950/75 p-4">
              <div className="text-stone-500">累積功德</div>
              <div className="mt-2 text-2xl font-semibold text-amber-400">
                {totalMerit}
              </div>
            </div>
            <div className="rounded-xl border border-stone-800 bg-stone-950/75 p-4 text-sm text-stone-300">
              <div>歷劫次數：{lifetimeStats.totalDeaths}</div>
              <div className="mt-2">輪迴次數：{lifetimeStats.totalReincarnations}</div>
              <div className="mt-2">
                最高境界：{REALM_NAMES[lifetimeStats.highestRealmEver]}
              </div>
              <div className="mt-2">最高壽數：{lifetimeStats.highestAgeYears} 歲</div>
            </div>
          </div>
        </section>

        <section className={SECTION_SURFACE_CLASS}>
          <div className="mb-4 flex items-center gap-3">
            <Gem className="text-cyan-400" size={18} />
            <h2 className="text-lg font-semibold text-stone-100">可繼承遺珍</h2>
          </div>
          {summary.eligibleHeirlooms.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
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
        </section>

        <Button
          onClick={onEnterHall}
          variant="amber"
          size="lg"
          className="w-full"
        >
          <Sparkles size={18} />
          進入輪迴大殿
        </Button>
      </div>
    </div>
  </div>
  );
};

interface ReincarnationHallScreenProps {
  summary: LifeReviewSummary;
  totalMerit: number;
  lifetimeStats: SoulLifetimeStats;
  worldMemoryTags?: string[];
  unlockedPerks: ReincarnationPerk[];
  config: RebirthConfig;
  onSelectBuildIdentity?: (identity: ReincarnationBuildIdentity) => void;
  onSelectSoulSeal?: (sealId?: string) => void;
  onTogglePerk: (perkId: string) => void;
  onToggleHeirloom: (heirloomId: string) => void;
  onSelectSpiritRoot: (spiritRootId?: SpiritRootId) => void;
  onConfirm: () => void;
}

const ReincarnationHallScreen: React.FC<ReincarnationHallScreenProps> = ({
  summary,
  totalMerit,
  lifetimeStats,
  worldMemoryTags = [],
  unlockedPerks,
  config,
  onSelectBuildIdentity,
  onSelectSoulSeal,
  onTogglePerk,
  onToggleHeirloom,
  onSelectSpiritRoot,
  onConfirm,
}) => {
  const totalCost = getRebirthConfigCost(config);
  const heirloomSlotCount = getRebirthConfigHeirloomSlotCount(config);
  const statBonuses = formatAttributeBonuses(getRebirthConfigStatBonuses(config));
  const spiritStoneBonus = getRebirthConfigSpiritStoneBonus(config);
  const canAfford = totalCost <= totalMerit;
  const preview = getRebirthBuildPreview({
    config,
    totalMerit,
    plannerContext: {
      lifetimeStats,
      worldMemoryTags,
    },
    summary,
  });
  const availableSoulSeals = getAvailableReincarnationSoulSeals({
    lifetimeStats,
    worldMemoryTags,
  });
  const lockedPerks = DEFAULT_REINCARNATION_PERKS.filter(
    (perk) => !unlockedPerks.some((unlockedPerk) => unlockedPerk.id === perk.id)
  );
  const lockedSoulSeals = DEFAULT_REINCARNATION_SOUL_SEALS.filter(
    (seal) => !availableSoulSeals.some((availableSeal) => availableSeal.id === seal.id)
  );
  const buildIdentityOptions: ReincarnationBuildIdentity[] = [
    "balanced",
    "sword",
    "body",
    "mage",
  ];

  return (
    <div className={SCREEN_SHELL_CLASS}>
      <div className={PANEL_SHELL_CLASS}>
        <div className="reincarnation-flow-grid grid gap-4 sm:gap-5 lg:grid-cols-2">
          <section className={SECTION_SURFACE_CLASS}>
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
            <p className="mt-4 text-sm leading-7 text-stone-400">
              先定下一世的修途傾向，再配置魂印、加護、遺珍與先天靈根。這裡調整的是開局偏好與可承接資源，
              <span className="font-medium text-stone-200">不會直接把下一世職業鎖死</span>；
              你重生後仍然會從村莊起步，再依正式流程決定要走哪條路。手機維持單欄直向閱讀，桌機則展開為雙欄命格卷軸。
            </p>
          </section>

          <section className={SECTION_SURFACE_CLASS}>
            <div className="flex items-center gap-3">
              <Skull className="text-stone-500" size={18} />
              <h2 className="text-lg font-semibold text-stone-100">下一世配置</h2>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
                <div className="text-stone-500">現有功德</div>
                <div className="mt-2 text-2xl font-semibold text-amber-400">{totalMerit}</div>
              </div>
              <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
                <div className="text-stone-500">本次花費</div>
                <div
                  className={clsx(
                    "mt-2 text-2xl font-semibold",
                    canAfford ? "text-stone-100" : "text-rose-300"
                  )}
                >
                  {totalCost}
                </div>
              </div>
              <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
                <div className="text-stone-500">剩餘功德</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-400">
                  {Math.max(0, totalMerit - totalCost)}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
              <div className="text-stone-500">轉世傾向</div>
              <div className="mt-2 text-lg font-semibold text-cyan-200">
                {preview.identityTitle}
              </div>
              <div className="mt-2 text-sm text-stone-400">{preview.identityCue}</div>
              {preview.issueLines.map((line) => (
                <div
                  key={line}
                  className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                >
                  {line}
                </div>
              ))}
            </div>
          </section>

          <section className={SECTION_SURFACE_CLASS}>
            <div className="mb-2 text-sm font-medium text-stone-200">轉世傾向</div>
            <p className="mb-4 text-xs leading-6 text-stone-500">
              選這裡是在決定下一世優先承接哪一條 build 的遺珍、魂印與屬性加成。
              不選專精就維持均衡開局；選了劍修 / 體修 / 法修，也只是讓開局偏向那一系，之後仍可在村莊與任務流程中重新決定正式職業路徑。
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {buildIdentityOptions.map((identity) => {
                const active = config.selectedBuildIdentity === identity;
                return (
                  <Button
                    data-testid={`rebirth-build-${identity}`}
                    key={identity}
                    onClick={() => onSelectBuildIdentity?.(identity)}
                    variant="selection"
                    size="default"
                    className={clsx(
                      "h-auto w-full flex-col items-start justify-start whitespace-normal p-4 text-left transition",
                      active
                        ? "border-cyan-500/50 bg-cyan-500/10"
                        : "border-stone-800 bg-stone-950/80 hover:border-stone-700"
                    )}
                  >
                    <div className="text-sm font-medium text-stone-100">
                      {REINCARNATION_BUILD_IDENTITY_LABELS[identity]}
                    </div>
                    <div className="mt-2 text-xs leading-6 text-stone-500">
                      {identity === "balanced"
                        ? "不限制職業向遺珍，但無法啟動專精魂印。"
                        : "會限制不相符的職業武器與心法遺珍。"}
                    </div>
                  </Button>
                );
              })}
            </div>
          </section>

          <section className={SECTION_SURFACE_CLASS}>
            <div className="mb-3 text-sm font-medium text-stone-200">本命魂印</div>
            <div className="grid gap-3">
              {availableSoulSeals.map((seal) => {
                const active = config.selectedSealId === seal.id;
                const routeMemorySource = getRouteMemorySourceLabel(
                  seal.requiredWorldMemoryTags
                );
                const benefitLabel = getSoulSealBenefitLabel(seal);
                return (
                  <Button
                    data-testid={`rebirth-seal-${seal.id}`}
                    key={seal.id}
                    onClick={() => onSelectSoulSeal?.(seal.id)}
                    variant="selection"
                    className={clsx(
                      "h-auto w-full flex-col items-start justify-start whitespace-normal p-4 text-left transition",
                      active
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-stone-800 bg-stone-950/80 hover:border-stone-700"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="font-medium text-stone-100">{seal.name}</span>
                      <span className="text-sm text-amber-400">{seal.cost} 功德</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-400">{seal.description}</p>
                    {routeMemorySource && (
                      <p className="mt-3 text-xs text-cyan-300/80">
                        {routeMemorySource}
                      </p>
                    )}
                    <p className="mt-2 text-xs leading-5 text-stone-400">
                      {seal.identityCue}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-stone-500">
                      {seal.heirloomHint}
                    </p>
                    {benefitLabel && (
                      <p className="mt-2 text-xs text-emerald-300/80">
                        {benefitLabel}
                      </p>
                    )}
                  </Button>
                );
              })}
            </div>
            {lockedSoulSeals.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="text-sm font-medium text-stone-500">尚未成形的魂印</div>
                <div className="grid gap-3">
                  {lockedSoulSeals.map((seal) => {
                    const routeMemorySource = getRouteMemorySourceLabel(
                      seal.requiredWorldMemoryTags
                    );
                    const benefitLabel = getSoulSealBenefitLabel(seal);
                    return (
                      <div
                        key={seal.id}
                        className="rounded-xl border border-stone-800 bg-stone-950/45 p-4 opacity-75"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-stone-300">{seal.name}</span>
                          <span className="text-sm text-stone-600">{seal.cost} 功德</span>
                        </div>
                        <p className="mt-2 text-sm text-stone-500">{seal.description}</p>
                        {routeMemorySource && (
                          <p className="mt-3 text-xs text-cyan-300/70">
                            {routeMemorySource}
                          </p>
                        )}
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          {seal.identityCue}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-600">
                          {seal.heirloomHint}
                        </p>
                        {benefitLabel && (
                          <p className="mt-2 text-xs text-emerald-300/70">
                            {benefitLabel}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-amber-300/80">
                          {getUnlockLabel({
                            ...seal.unlockRequirement,
                            requiredWorldMemoryTags: seal.requiredWorldMemoryTags,
                            currentWorldMemoryTags: worldMemoryTags,
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className={SECTION_SURFACE_CLASS}>
            <div className="mb-3 text-sm font-medium text-stone-200">魂印加護</div>
            <div className="grid gap-3">
              {unlockedPerks.map((perk) => {
                const active = config.selectedPerkIds.includes(perk.id);
                const blockedReason = !active
                  ? getRebirthPerkBlockedReason(perk, config)
                  : undefined;
                return (
                  <Button
                    data-testid={`rebirth-perk-${perk.id}`}
                    key={perk.id}
                    onClick={() => onTogglePerk(perk.id)}
                    disabled={Boolean(blockedReason)}
                    variant="selection"
                    className={clsx(
                      "h-auto w-full flex-col items-start justify-start whitespace-normal p-4 text-left transition",
                      active
                        ? "border-amber-500/50 bg-amber-500/10"
                        : blockedReason
                          ? "cursor-not-allowed border-stone-800 bg-stone-950/60"
                          : "border-stone-800 bg-stone-950/80 hover:border-stone-700"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-stone-100">{perk.name}</span>
                      <span className="text-sm text-amber-400">{perk.cost} 功德</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-400">{perk.description}</p>
                    {blockedReason && (
                      <p className="mt-3 text-xs text-rose-300/80">{blockedReason}</p>
                    )}
                  </Button>
                );
              })}
            </div>
            {lockedPerks.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="text-sm font-medium text-stone-500">尚未悟透</div>
                <div className="grid gap-3">
                  {lockedPerks.map((perk) => (
                    <div
                      key={perk.id}
                      className="rounded-xl border border-stone-800 bg-stone-950/45 p-4 opacity-75"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-stone-300">{perk.name}</span>
                        <span className="text-sm text-stone-600">{perk.cost} 功德</span>
                      </div>
                      <p className="mt-2 text-sm text-stone-500">{perk.description}</p>
                      <p className="mt-3 text-xs text-amber-300/80">
                        {getUnlockLabel({
                          ...perk.unlockRequirement,
                          requiredWorldMemoryTags: perk.requiredWorldMemoryTags,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className={SECTION_SURFACE_CLASS}>
            <div className="mb-3 text-sm font-medium text-stone-200">遺珍與命格</div>
            <div>
              <label
                htmlFor="spirit-root-override"
                className="mb-2 block text-sm text-stone-400"
              >
                先天靈根
              </label>
              <Select
                value={
                  config.spiritRootOverride ?? INHERIT_PREVIOUS_SPIRIT_ROOT_VALUE
                }
                onValueChange={(value) =>
                  onSelectSpiritRoot(
                    value === INHERIT_PREVIOUS_SPIRIT_ROOT_VALUE
                      ? undefined
                      : (value as SpiritRootId)
                  )
                }
              >
                <SelectTrigger id="spirit-root-override" aria-label="先天靈根">
                  <SelectValue placeholder="承接前世靈根" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={INHERIT_PREVIOUS_SPIRIT_ROOT_VALUE}>
                    承接前世靈根
                  </SelectItem>
                  {Object.entries(SPIRIT_ROOT_DETAILS).map(([spiritRootId, detail]) => (
                    <SelectItem key={spiritRootId} value={spiritRootId}>
                      {detail.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs leading-6 text-stone-500">
                預設會
                <span className="text-stone-300">承接前世靈根</span>，不會重新抽取。
                若你想直接指定下一世的先天靈根，可以在這裡改寫，會額外消耗 100 功德。
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <div className="text-sm text-stone-400">可攜遺珍（限 {heirloomSlotCount} 件）</div>
              {summary.eligibleHeirlooms.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {summary.eligibleHeirlooms.map((candidate) => {
                    const active = config.selectedHeirloomIds.includes(candidate.id);
                    const blockedReason = !active
                      ? getRebirthHeirloomBlockedReason(candidate, config)
                      : undefined;
                    return (
                      <Button
                        data-testid={`rebirth-heirloom-${candidate.id}`}
                        key={candidate.id}
                        onClick={() => onToggleHeirloom(candidate.id)}
                        disabled={Boolean(blockedReason)}
                        variant="selection"
                        className={clsx(
                          "h-auto w-full flex-col items-start justify-start whitespace-normal p-3 text-left transition",
                          active
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : blockedReason
                              ? "cursor-not-allowed border-stone-800 bg-stone-950/60"
                              : "border-stone-800 bg-stone-950/80 hover:border-stone-700"
                        )}
                      >
                        <div className="text-sm font-medium text-stone-100">
                          {candidate.label}
                        </div>
                        <div className="mt-1 text-xs text-stone-500">
                          {candidate.sourceType === "equipment" ? "裝備遺珍" : "功法手札"}
                        </div>
                        {blockedReason && (
                          <div className="mt-2 text-xs text-rose-300/80">
                            {blockedReason}
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-stone-500">本世沒有可攜遺珍。</p>
              )}
            </div>
          </section>

          <section className={SECTION_SURFACE_CLASS}>
            <div className="text-sm font-medium text-stone-200">本世基底與加成預覽</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
                <div className="text-stone-500">本世基底</div>
                <div className="mt-2">死因：{getCauseLabel(summary.cause)}</div>
                <div className="mt-2">最高境界：{REALM_NAMES[summary.highestRealm]}</div>
                <div className="mt-2">壽數：{summary.ageYears} 歲</div>
                <div className="mt-2">輪迴次數：{lifetimeStats.totalReincarnations}</div>
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
                <div className="mt-3">初始靈石 +{spiritStoneBonus}</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300">
              <div className="text-stone-500">限制與提示</div>
              <div className="mt-2 space-y-2">
                {preview.constraintLines.map((line) => (
                  <div key={line} className="text-sm text-stone-400">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Button
            onClick={onConfirm}
            disabled={!canAfford || preview.issueLines.length > 0}
            variant={
              canAfford && preview.issueLines.length === 0 ? "emerald" : "stone"
            }
            size="lg"
            className="w-full"
            data-testid="rebirth-confirm"
          >
            投胎轉世
          </Button>
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
  worldMemoryTags?: string[];
  unlockedPerks: ReincarnationPerk[];
  config: RebirthConfig;
  onEnterHall: () => void;
  onSelectBuildIdentity?: (identity: ReincarnationBuildIdentity) => void;
  onSelectSoulSeal?: (sealId?: string) => void;
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
  worldMemoryTags = [],
  unlockedPerks,
  config,
  onEnterHall,
  onSelectBuildIdentity,
  onSelectSoulSeal,
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
      lifetimeStats={lifetimeStats}
      worldMemoryTags={worldMemoryTags}
      unlockedPerks={unlockedPerks}
      config={config}
      onSelectBuildIdentity={onSelectBuildIdentity}
      onSelectSoulSeal={onSelectSoulSeal}
      onTogglePerk={onTogglePerk}
      onToggleHeirloom={onToggleHeirloom}
      onSelectSpiritRoot={onSelectSpiritRoot}
      onConfirm={onConfirm}
    />
  );
};
