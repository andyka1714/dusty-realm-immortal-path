
import React, { useCallback, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { getRealmLabel } from '../utils/realm';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { manualCultivate, attemptBreakthrough, startSeclusion } from '../store/slices/characterSlice';
import {
  completeRebirthFromHall,
  startLifeReviewFromCurrentRun,
} from '../store/actions/reincarnationActions';
import { removeItem } from '../store/slices/inventorySlice';
import { addLog } from '../store/slices/logSlice';
import {
  enterReincarnationHall,
  setRebirthBuildIdentity,
  setRebirthSoulSeal,
  setRebirthSpiritRootOverride,
  toggleRebirthPerk,
  toggleSelectedHeirloom,
} from '../store/slices/soulSlice';
import { REALM_NAMES, REALM_MODIFIERS, MINOR_REALM_CAP, DAYS_PER_YEAR, BREAKTHROUGH_CONFIG, MANUAL_CULTIVATE_COOLDOWN, SECLUSION_DURATION_MS, SPIRIT_ROOT_DETAILS } from '../constants';
import { ITEMS } from '../data/items';
import { ProgressBar } from '../components/ProgressBar';
import { BREAKTHROUGH_TEXTS, GENERIC_BREAKTHROUGH_TEXT } from '../data/game_text';
import { LogPanel } from '../components/LogPanel';
import { StatsPanel } from '../components/StatsPanel';
import { Modal } from '../components/Modal';
import { IntroSequence } from '../components/IntroSequence';
import { GameHintBubble } from '../components/game/GameHintBubble';
import { ReincarnationFlow } from '../components/game/ReincarnationFlow';
import { GameSection } from '../components/game/GameSection';
import { GameTooltip } from '../components/game/GameTooltip';
import { Button } from '../components/ui/button';
import { Play, ChevronsUp, Moon, Info, AlertTriangle, Zap, Lock, RefreshCw } from 'lucide-react';
import { MajorRealm, SpiritRootId, SpiritRootType } from '../types';
import { calculateSeclusionCost, getBaseCultivationRate, getGatheringMultiplier, getManualCultivateCooldown, getPassiveCultivationRate } from '../utils/cultivation';
import { DEFAULT_REINCARNATION_PERKS } from '../utils/reincarnation';


// Custom Animation Style
const floatUpStyle = `
@keyframes floatUpFade {
  0% { transform: translate(-50%, 0); opacity: 0; }
  10% { transform: translate(-50%, -10px); opacity: 1; }
  100% { transform: translate(-50%, -30px); opacity: 0; }
}
`;

interface DashboardProps {
  embedded?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ embedded = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const character = useSelector((state: RootState) => state.character);
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const soul = useSelector((state: RootState) => state.soul);
  const { 
    isInitialized, isDead, name, gender, majorRealm, minorRealm, currentExp, maxExp, spiritStones, 
    cultivationRate, isBreakthroughAvailable, isInSeclusion, seclusionEndTime, attributes, spiritRootId,
    lastBreakthroughResult, age, lifespan, gatheringLevel, lastManualCultivateTime, lastDeathCause
  } = character;
  
  const spiritRoot = spiritRootId;

  const [isBreakthroughModalOpen, setIsBreakthroughModalOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    title?: React.ReactNode;
    content: React.ReactNode;
    widthClassName?: string;
  } | null>(null);
  const processedBreakthroughRef = useRef<number>(lastBreakthroughResult?.timestamp || 0);

  const showTooltip = useCallback(
    (
      event: React.MouseEvent,
      config: {
        title?: React.ReactNode;
        content: React.ReactNode;
        widthClassName?: string;
      }
    ) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({
        x: Math.min(rect.left, window.innerWidth - 320),
        y: rect.bottom + 8,
        title: config.title,
        content: config.content,
        widthClassName: config.widthClassName ?? "w-72",
      });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  useEffect(() => {
    if (isInitialized && isDead && soul.flowStep === "inactive") {
      dispatch(startLifeReviewFromCurrentRun(lastDeathCause));
    }
  }, [dispatch, isInitialized, isDead, soul.flowStep, lastDeathCause]);

  // Monitor breakthrough result
  useEffect(() => {
    if (lastBreakthroughResult && lastBreakthroughResult.timestamp > processedBreakthroughRef.current) {
        processedBreakthroughRef.current = lastBreakthroughResult.timestamp;
        
        if (lastBreakthroughResult.success) {
             if (lastBreakthroughResult.isMajor) {
                // Use refined story text for major realm breakthrough
                const text = BREAKTHROUGH_TEXTS[majorRealm]?.success || "金光乍現，瓶頸轟然破碎！壽元大增，修為更進一步！";
                dispatch(addLog({ message: text, type: 'gold' }));
             } else {
                dispatch(addLog({ message: GENERIC_BREAKTHROUGH_TEXT.minorSuccess, type: 'success' }));
             }
        } else {
             if (lastBreakthroughResult.isMajor) {
                 // Use refined story text for major realm failure
                 const text = BREAKTHROUGH_TEXTS[majorRealm]?.failure || (lastBreakthroughResult.isTribulation ? GENERIC_BREAKTHROUGH_TEXT.tribulationFailure : "突破失敗，心魔干擾...");
                 
                 // If tribulation specifically failed (and text includes generic warning), maybe append?
                 // But refined text covers it.
                 const logType = lastBreakthroughResult.isTribulation ? 'tribulation' : 'danger';
                 dispatch(addLog({ message: text, type: logType }));
             } else {
                 // Minor failure
                 if (lastBreakthroughResult.dropRealm) {
                     dispatch(addLog({ message: GENERIC_BREAKTHROUGH_TEXT.realmDropFailure, type: 'danger' }));
                 } else {
                     dispatch(addLog({ message: GENERIC_BREAKTHROUGH_TEXT.minorFailure, type: 'danger' }));
                 }
             }
        }
    }
  }, [lastBreakthroughResult, dispatch, majorRealm]);

  const [manualCooldown, setManualCooldown] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        const lastTime = lastManualCultivateTime || 0;
        const diff = now - lastTime;
        const cooldown = getManualCultivateCooldown();
        if (diff < cooldown) {
            setManualCooldown(cooldown - diff);
        } else {
            setManualCooldown(0);
        }
    }, 100);
    return () => clearInterval(interval);
  }, [lastManualCultivateTime]);

  const handleManualCultivate = useCallback(() => {
    if (isInSeclusion) {
       dispatch(addLog({ message: "正在閉關中，無需手動引氣。", type: 'info' }));
       return;
    }
    if (isBreakthroughAvailable) {
      dispatch(addLog({ message: "瓶頸已至，修為無法寸進，請速速突破！", type: 'danger' }));
      return;
    }
    dispatch(manualCultivate());
  }, [dispatch, isBreakthroughAvailable, isInSeclusion]);

  const handleBreakthroughClick = () => {
    setIsBreakthroughModalOpen(true);
  };

  // Breakthrough Logic Calculation
  const isMajorBreakthrough = minorRealm >= MINOR_REALM_CAP;
  const config = BREAKTHROUGH_CONFIG[majorRealm];
  const requiredItemId = isMajorBreakthrough ? config.requiredItemId : null;
  const requiredItem = requiredItemId ? ITEMS[requiredItemId] : null;
  
  // Check if player has item
  const hasItem = requiredItemId 
    ? inventory.some(i => i.itemId === requiredItemId && i.count > 0)
    : true;

  const confirmBreakthrough = () => {
    if (isMajorBreakthrough && requiredItemId) {
        if (!hasItem) {
            dispatch(addLog({ message: `缺少關鍵道具【${requiredItem?.name}】，無法突破！`, type: 'danger' }));
            return;
        }
        // Consume Item
        dispatch(removeItem({ itemId: requiredItemId, count: 1 }));
        // Dispatch Attempt with consumed flag
        dispatch(attemptBreakthrough({ successChanceBonus: 0, consumedItem: true }));
        dispatch(addLog({ message: `服下【${requiredItem?.name}】，運轉全身靈力衝擊瓶頸...`, type: 'info' }));
    } else {
        dispatch(attemptBreakthrough({ successChanceBonus: 0 }));
        dispatch(addLog({ message: "運轉全身靈力衝擊瓶頸...", type: 'info' }));
    }
    setIsBreakthroughModalOpen(false);
  };

  // Seclusion Logic
  const seclusionCost = calculateSeclusionCost(majorRealm, minorRealm);
  const canAffordSeclusion = spiritStones >= seclusionCost;

  const handleSeclusion = () => {
      if (isInSeclusion) return;
      if (!canAffordSeclusion) {
          dispatch(addLog({ message: "靈石不足，無法開啟閉關陣法。", type: 'danger' }));
          return;
      }
      dispatch(startSeclusion());
      dispatch(addLog({ message: `消耗 ${seclusionCost} 靈石，開啟閉關陣法(30秒)，修煉速度倍增！`, type: 'success' }));
  };

  const timeLeft = seclusionEndTime ? Math.max(0, Math.ceil((seclusionEndTime - Date.now()) / 1000)) : 0;

  const calculateSuccessRate = () => {
      // Replicate logic for display
      let baseRate = config.baseRate;
      const decay = Math.pow(0.95, minorRealm);
      let rate = baseRate * decay;
      
      rate += attributes.comprehension * 0.002;
      rate += attributes.fortune * 0.001;
      if (!isMajorBreakthrough && SPIRIT_ROOT_DETAILS[spiritRoot]?.type === SpiritRootType.Heavenly) {
          rate += 0.05;
      }
      return Math.min(0.95, rate) * 100;
  };

  const successRate = calculateSuccessRate();
  
  // Floating Gain Animation Logic
  const prevExpRef = React.useRef(currentExp);
  const [showGain, setShowGain] = React.useState(false);
  const [gainKey, setGainKey] = React.useState(0);
  const [gainedAmount, setGainedAmount] = React.useState(0);

  React.useEffect(() => {
    if (currentExp > prevExpRef.current) {
         setGainedAmount(currentExp - prevExpRef.current);
         setShowGain(true);
         setGainKey(k => k + 1); 
    }
    prevExpRef.current = currentExp;
  }, [currentExp]);

  // Calculate Exp Percentage for display
  const expPercentage = Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

  // Calculations for tooltips
  const currentAgeYearStr = (age / DAYS_PER_YEAR).toFixed(2);
  const maxAgeYearStr = (lifespan / DAYS_PER_YEAR).toFixed(0);
  const actionButtonClass = "relative h-24 w-full flex-col overflow-hidden rounded-lg py-3 text-center";
  const actionItemClass = "relative flex min-w-0 flex-1 items-stretch group";
  
  // Correct Calculation matching Redux Store
  const cultivationInput = {
    rootBone: attributes.rootBone,
    majorRealm,
    spiritRootId: spiritRoot,
    gatheringLevel,
  };
  const baseRate = getBaseCultivationRate(cultivationInput);
  const spiritMultiplier = SPIRIT_ROOT_DETAILS[spiritRoot]?.bonuses.cultivationMult || 1;
  const realmMultiplier = REALM_MODIFIERS[majorRealm] || 1;
  const gatherMultiplier = getGatheringMultiplier(gatheringLevel);
  const stateMultiplier = isInSeclusion ? 2 : 0.1;
  const finalDisplayRate = getPassiveCultivationRate(
    cultivationInput,
    isInSeclusion
  ).toFixed(1);

  const isCriticalLifespan = (lifespan - age) <= 365 && !isDead;
  const unlockedRebirthPerks = DEFAULT_REINCARNATION_PERKS.filter((perk) =>
    soul.unlockedPerkIds.includes(perk.id)
  );
  const isReincarnationFlowActive =
    Boolean(soul.pendingLifeReview) &&
    (soul.flowStep === "life_review" || soul.flowStep === "hall");
  const canVoluntarilyReincarnate =
    !isDead &&
    majorRealm >= MajorRealm.Foundation &&
    soul.flowStep === "inactive";

  const handleVoluntaryReincarnation = () => {
    if (!canVoluntarilyReincarnate) {
      return;
    }

    dispatch(startLifeReviewFromCurrentRun("voluntary"));
  };

  if (isReincarnationFlowActive && soul.pendingLifeReview) {
    return (
      <ReincarnationFlow
        flowStep={soul.flowStep}
        summary={soul.pendingLifeReview}
        totalMerit={soul.totalMerit}
        lifetimeStats={soul.lifetimeStats}
        worldMemoryTags={soul.worldMemoryTags}
        unlockedPerks={unlockedRebirthPerks}
        config={soul.rebirthConfig}
        onEnterHall={() => dispatch(enterReincarnationHall())}
        onSelectBuildIdentity={(identity) =>
          dispatch(setRebirthBuildIdentity(identity))
        }
        onSelectSoulSeal={(sealId) => dispatch(setRebirthSoulSeal(sealId))}
        onTogglePerk={(perkId) => dispatch(toggleRebirthPerk(perkId))}
        onToggleHeirloom={(heirloomId) =>
          dispatch(toggleSelectedHeirloom(heirloomId))
        }
        onSelectSpiritRoot={(nextSpiritRootId) =>
          dispatch(
            setRebirthSpiritRootOverride(
              nextSpiritRootId as SpiritRootId | undefined
            )
          )
        }
        onConfirm={() => dispatch(completeRebirthFromHall())}
      />
    );
  }

  if (!isInitialized || isDead) {
      if (isDead) {
          return (
              <div className="flex h-full w-full items-center justify-center p-6">
                <div className="rounded-2xl border border-stone-800 bg-stone-900/85 px-8 py-6 text-center shadow-xl">
                  <p className="text-sm uppercase tracking-[0.45em] text-stone-500">
                    Reincarnation
                  </p>
                  <h1 className="mt-3 text-2xl font-bold text-stone-100">
                    因果回溯中
                  </h1>
                  <p className="mt-3 text-sm text-stone-400">
                    正在整理本世功德與遺珍，稍候即將進入輪迴結算。
                  </p>
                </div>
              </div>
          );
      }
      return <IntroSequence />;
  }

  return (
    <div
      className={clsx(
        "relative h-full min-h-0",
        embedded
          ? "grid grid-cols-1 gap-5 overflow-hidden p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1.45fr)_380px]"
          : "flex flex-col gap-6 overflow-y-auto p-4 md:flex-row md:overflow-hidden md:p-6"
      )}
      data-testid={embedded ? "dashboard-character-panel" : undefined}
    >
      
      {isCriticalLifespan && (
         <div className="absolute inset-0 z-[90] pointer-events-none overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-stone-500/10 grayscale mix-blend-multiply"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] animate-pulse"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(220,38,38,0.15)] animate-pulse"></div>
         </div>
      )}

      {/* LEFT COLUMN: Status & Actions */}
      <div
        className={clsx(
          "flex min-h-0 flex-col gap-6",
          embedded ? "overflow-y-auto pr-1" : "w-full md:flex-1 md:overflow-y-auto"
        )}
        data-testid={embedded ? "dashboard-left-column" : undefined}
      >
        <div className={clsx(embedded ? "flex min-h-max flex-col gap-5" : "space-y-6")}>
            <div className={clsx(embedded ? "shrink-0 rounded-[20px] border border-stone-800/80 bg-stone-900/82 p-5 md:p-6" : "")}>
            <div className="flex justify-between items-start">
              <div
                className="cursor-help"
                onMouseEnter={(event) =>
                  showTooltip(event, {
                    title: `${name} (道號)`,
                    content: (
                      <>
                        <div className="mb-2 leading-relaxed">
                          當前骨齡：<span className="text-amber-500 font-mono">{currentAgeYearStr}</span> 歲<br/>
                          壽元上限：<span className="text-stone-400 font-mono">{maxAgeYearStr}</span> 歲
                        </div>
                        <div className="text-xs text-stone-500 italic border-t border-stone-800 pt-2">
                          歲月不居，時節如流，若不破境增加壽元，終將身死道消。
                        </div>
                      </>
                    ),
                  })
                }
                onMouseLeave={hideTooltip}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold text-stone-100">{name}</h2>
                  <span className={`text-xl ${gender === 'Male' ? 'text-blue-400' : 'text-pink-400'}`}>
                    {gender === 'Male' ? '♂' : '♀'}
                  </span>
                </div>
                <div className="mt-1">
                   <span className="text-stone-500 text-sm border border-stone-700 px-2 py-0.5 rounded-full bg-stone-950">
                    {character.title}
                  </span>
                </div>
              </div>

              <div className="text-right">
                 <div className="text-2xl text-amber-500 tracking-widest font-serif font-bold">
                    {getRealmLabel(majorRealm, minorRealm)}
                 </div>
                 {majorRealm !== MajorRealm.Immortal && majorRealm !== MajorRealm.ImmortalEmperor && (
                     <div className="text-stone-500 text-sm">
                        第 {minorRealm + 1} 層
                     </div>
                 )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <span className="text-stone-400 text-xs">修為進度</span>
                    <span className="text-emerald-400 font-bold font-mono text-lg tracking-wider">
                        {expPercentage.toFixed(1)}%
                    </span>
                </div>
                <div
                  className="cursor-help flex items-center gap-3"
                  onMouseEnter={(event) =>
                    showTooltip(event, {
                      title: "修煉效率",
                      widthClassName: "w-72",
                      content: (
                        <div className="font-mono text-xs space-y-1">
                          <div>根骨({attributes.rootBone}) × 境界({realmMultiplier.toFixed(2)}) × 靈根({spiritMultiplier.toFixed(1)}) × 聚靈({gatherMultiplier.toFixed(2)})</div>
                          <div className="text-stone-400">基礎速率：{baseRate.toFixed(1)}</div>
                          <div className="text-stone-400">狀態倍率：{stateMultiplier.toFixed(1)} ({isInSeclusion ? '閉關' : '自然運轉'})</div>
                          <div className="border-t border-stone-700 mt-1 pt-1 text-right text-emerald-400 font-bold">
                            = {finalDisplayRate}
                          </div>
                        </div>
                      ),
                    })
                  }
                  onMouseLeave={hideTooltip}
                >
                    <span className="text-stone-400 text-xs">修練速度</span>
                    {isBreakthroughAvailable ? (
                        <span className="text-lg font-bold text-amber-500 animate-pulse tracking-widest">
                            修為已滿
                        </span>
                    ) : (
                        <>
                           <span className={`text-lg font-mono font-bold ${isInSeclusion ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                             {Number(cultivationRate.toFixed(1))}
                           </span>
                           {isInSeclusion && <span className="text-[10px] ml-1 text-amber-500 border border-amber-900 px-1 rounded">閉關 x2.0</span>}
                        </>
                    )}
                </div>
              </div>
              <div className="relative">
                <style>{floatUpStyle}</style>
                <ProgressBar 
                   current={currentExp} 
                   max={maxExp} 
                   colorClass={isBreakthroughAvailable ? "bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" : "bg-gradient-to-r from-emerald-800 to-emerald-500"}
                />
                {!isBreakthroughAvailable && showGain && (
                   <div 
                     key={gainKey} 
                     className="absolute bottom-full left-1/2 mb-1 text-emerald-400 font-bold font-mono text-lg pointer-events-none z-20"
                     style={{ animation: 'floatUpFade 1.5s ease-out forwards' }}
                   >
                     +{Number(gainedAmount.toFixed(1))}
                   </div>
      )}

              </div>
              <div className="flex justify-end mt-1 px-1">
                 <span className="text-[10px] text-stone-500 font-mono tracking-wide">
                    {Math.floor(currentExp).toLocaleString()} <span className="text-stone-600">/</span> {Math.floor(maxExp).toLocaleString()}
                 </span>
              </div>
            </div>
            </div>

            <GameSection
              title="修行抉擇"
              eyebrow="CULTIVATION ACTIONS"
              className={clsx(embedded ? "shrink-0" : "relative z-20 hover:z-50 transition-all duration-200")}
              bodyClassName="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4"
            >

                 {/* 1. Manual Cultivate */}
                 <div className={actionItemClass}>
                     <Button
                       onClick={handleManualCultivate}
                       disabled={isBreakthroughAvailable || isInSeclusion || manualCooldown > 0}
                       variant="stone"
                       className={actionButtonClass}
                       data-testid="dashboard-manual-cultivate"
                     >
                       {manualCooldown > 0 && (
                           <div 
                             className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-100 ease-linear"
                             style={{ width: `${(1 - manualCooldown / MANUAL_CULTIVATE_COOLDOWN) * 100}%` }}
                           ></div>
                       )}
                       <Play size={20} className={`${isInSeclusion ? "text-stone-600" : "text-emerald-500"} ${manualCooldown > 0 ? "opacity-50" : ""}`} />
                       <span className="font-bold tracking-widest">{manualCooldown > 0 ? "回氣中..." : "運功"}</span>
                       <span className="text-[10px] text-stone-500 font-normal">
                           {manualCooldown > 0 ? `${(manualCooldown/1000).toFixed(1)}s` : "日常修煉 (1.0x)"}
                       </span>
                     </Button>
                     
                     {/* Tooltip - Shows when disabled */}
                     {(isBreakthroughAvailable || isInSeclusion) && (
                         <GameHintBubble eyebrow="CULTIVATION" className="bottom-full left-1/2 mb-2 -translate-x-1/2">
                             {isBreakthroughAvailable ? "修為已滿，請先突破" : "閉關中無法運功"}
                         </GameHintBubble>
                     )}
                 </div>

                 {/* 2. Seclusion */}
                 <div className={actionItemClass}>
                     <Button
                       onClick={handleSeclusion}
                       disabled={isBreakthroughAvailable || isInSeclusion || (!isInSeclusion && !canAffordSeclusion)}
                       variant="stone"
                       data-testid="dashboard-start-seclusion"
                       className={clsx(
                         actionButtonClass,
                         isInSeclusion
                           ? "border-amber-500/50 bg-amber-900/30 text-amber-200 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]"
                           : "border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700"
                       )}
                     >
                       <Moon size={20} className={isInSeclusion ? "text-amber-400 animate-pulse" : "text-indigo-400"} />
                       <span className="font-bold tracking-widest">{isInSeclusion ? "閉關中" : "閉關修煉"}</span>
                       <span className="text-[10px] text-stone-500 font-normal">
                           {isInSeclusion ? `剩餘 ${timeLeft} 秒 (2.0x)` : `需 ${seclusionCost} 靈石`}
                       </span>
                       {isInSeclusion && !isBreakthroughAvailable && (
                           <div 
                             className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-100 ease-linear"
                             style={{ width: `${(timeLeft / (SECLUSION_DURATION_MS/1000)) * 100}%` }}
                           ></div>
                       )}
                     </Button>

                     {/* Tooltip - Shows when disabled */}
                     {(isBreakthroughAvailable || isInSeclusion || !canAffordSeclusion) && (
                         <GameHintBubble eyebrow="SECLUSION" className="bottom-full left-1/2 mb-2 -translate-x-1/2">
                             {isBreakthroughAvailable ? "修為已滿，請先突破" : isInSeclusion ? "閉關修煉進行中" : "靈石不足"}
                         </GameHintBubble>
                     )}
                 </div>
              <div className={actionItemClass}>
                <Button
                  onClick={handleBreakthroughClick}
                  disabled={!isBreakthroughAvailable}
                  variant={isBreakthroughAvailable ? "amber" : "stone"}
                  data-testid="dashboard-breakthrough"
                  className={clsx(
                    actionButtonClass,
                    "outline-none",
                    isBreakthroughAvailable
                      ? "cursor-pointer border-amber-500/70 bg-amber-700/35 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.28)] hover:scale-[1.01]"
                      : "cursor-not-allowed border-stone-800 bg-stone-950 text-stone-600"
                  )}
                >
                  <ChevronsUp size={20} className={isBreakthroughAvailable ? "text-amber-100" : "text-stone-600"} />
                  <span className="font-bold tracking-widest">境界突破</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {isBreakthroughAvailable ? "瓶頸已至，點擊破境" : "積累修為中..."}
                  </span>
                </Button>
                <GameHintBubble eyebrow="BREAKTHROUGH" className="bottom-full left-1/2 mb-2 -translate-x-1/2">
                  {isMajorBreakthrough ? "衝擊大境界" : "突破小境界"}
                </GameHintBubble>
              </div>
              <div className={actionItemClass}>
                <Button
                  onClick={handleVoluntaryReincarnation}
                  disabled={!canVoluntarilyReincarnate}
                  variant="stone"
                  className={actionButtonClass}
                  data-testid="dashboard-voluntary-reincarnation"
                >
                  <RefreshCw
                    size={20}
                    className={
                      canVoluntarilyReincarnate ? "text-violet-400" : "text-stone-600"
                    }
                  />
                  <span className="text-xs font-semibold tracking-[0.18em] text-violet-300">
                    本世收束
                  </span>
                  <span className="font-bold tracking-widest">主動坐化</span>
                  <span className="max-w-[9rem] text-center text-[10px] font-normal leading-4 text-stone-500">
                    {canVoluntarilyReincarnate
                      ? "飛升/結局回顧後主動重開"
                      : "築基後開放"}
                  </span>
                </Button>
                {!canVoluntarilyReincarnate && (
                  <GameHintBubble
                    eyebrow="REINCARNATION"
                    className="bottom-full left-1/2 mb-2 -translate-x-1/2"
                  >
                    需達築基且未處於輪迴流程中
                  </GameHintBubble>
                )}
              </div>
            </GameSection>

            <GameSection
              title="修煉指南"
              eyebrow="WAYFARING NOTES"
              titleIcon={<Info size={16} className="text-stone-400" />}
              className={clsx(
                embedded ? "shrink-0 border-stone-800/80 bg-black/18" : "border-stone-800/50 bg-stone-900/50"
              )}
              bodyClassName={embedded ? "p-3" : undefined}
            >
              <p className="text-xs leading-relaxed text-stone-500">
                <span className="font-bold text-stone-300">修煉指南：</span>
                {" "}閉關雖能大幅提升修為，但無法進行歷練或戰鬥。壽元有限，道友需在天人五衰之前突破桎梏，方能證道長生。
              </p>
            </GameSection>

            {embedded && (
              <div
                className="min-h-[220px] shrink-0 overflow-hidden rounded-[20px] border border-stone-800/80 bg-stone-900/70"
                data-testid="dashboard-log-panel"
              >
                <LogPanel embedded />
              </div>
            )}
        </div>
      </div>

      <div
        className={clsx(
          "relative z-30 flex min-h-0 flex-col gap-6",
          embedded ? "overflow-hidden pr-1" : "w-full md:w-80 lg:w-96"
        )}
        data-testid={embedded ? "dashboard-stats-column" : undefined}
      >
         {embedded ? (
           <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[20px] border border-stone-800/80 bg-stone-900/68">
             <StatsPanel embedded />
           </div>
         ) : (
           <>
             <div className="flex-none">
               <StatsPanel />
             </div>
             <div className="flex-1 min-h-[300px]">
               <LogPanel />
             </div>
           </>
         )}
      </div>

      {tooltip && (
        <GameTooltip
          eyebrow="CULTIVATION NOTES"
          title={tooltip.title}
          widthClassName={tooltip.widthClassName}
          className="animate-in fade-in duration-150 zoom-in-95"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </GameTooltip>
      )}

      {/* Breakthrough Confirmation Modal */}
      <Modal
        isOpen={isBreakthroughModalOpen}
        onClose={() => setIsBreakthroughModalOpen(false)}
        title={isMajorBreakthrough ? "衝擊大境界" : "突破小境界"}
        eyebrow="BREAKTHROUGH RITE"
        icon={config.tribulationName ? <Zap size={18} className="text-red-500" /> : <ChevronsUp size={18} className="text-amber-500" />}
      >
         <div className="space-y-6 text-center py-2">
            <div className="flex justify-center">
               <div className={`w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center border-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse
                   ${config.penaltyType === 'major_unsafe' ? 'border-red-500' : 'border-amber-500'}
               `}>
                  {config.tribulationName ? <Zap size={40} className="text-red-500" /> : <ChevronsUp size={40} className="text-amber-500" />}
               </div>
            </div>
            
            {/* Tribulation Warning */}
            {config.tribulationName && isMajorBreakthrough && (
                <div className="bg-red-950/50 border border-red-900 p-2 rounded text-red-200 font-bold text-sm">
                    ⚠️ {config.tribulationName} 將至！
                </div>
            )}

            <div>
               <p className="text-stone-400 mb-2">當前境界圓滿，是否嘗試衝擊瓶頸？</p>
               <div className="text-3xl font-bold text-emerald-400 font-mono">
                  {successRate.toFixed(1)}% <span className="text-sm text-stone-500">成功率</span>
               </div>
               <p className="text-xs text-stone-600 mt-1">成功率受悟性、福緣與靈根影響</p>
            </div>

            {/* Major Breakthrough Requirement */}
            {isMajorBreakthrough && requiredItem && (
                <div className={`p-4 rounded border text-left flex items-center gap-3 ${hasItem ? 'bg-stone-800 border-stone-600' : 'bg-red-950/30 border-red-900'}`}>
                    <div className="p-2 bg-stone-900 rounded border border-stone-700">
                        {hasItem ? <ChevronsUp className="text-amber-500" /> : <Lock className="text-red-500" />}
                    </div>
                    <div className="flex-1">
                        <div className={hasItem ? "text-amber-500 font-bold" : "text-red-400 font-bold"}>
                            需要：{requiredItem.name}
                        </div>
                        <div className="text-xs text-stone-500">
                            {hasItem ? "已持有，點擊突破後消耗" : `未持有 (掉落：${config.bossHint})`}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-stone-900/50 border border-stone-800 rounded p-4 text-left flex gap-3">
               <AlertTriangle className={config.penaltyType === 'major_unsafe' ? "text-red-600" : "text-orange-500"} />
               <div className="text-sm">
                  <span className="font-bold block mb-1 text-stone-300">失敗懲罰</span>
                  <ul className="text-stone-400/80 list-disc list-inside space-y-1 text-xs">
                     {config.penaltyType === 'major_unsafe' ? (
                        <>
                           <li className="text-red-400 font-bold">天劫失敗：修為盡失 (-100%)</li>
                           <li className="text-red-400">核心道具損毀</li>
                        </>
                     ) : (
                        <li>修為倒退 30%</li>
                     )}
                     {isMajorBreakthrough && config.penaltyType !== 'major_unsafe' && (
                        <li className="text-orange-400">道具損毀</li>
                     )}
                  </ul>
               </div>
            </div>

            <div className="flex gap-3 pt-2">
               <Button
                 onClick={() => setIsBreakthroughModalOpen(false)}
                 variant="outline"
                 className="flex-1"
                 data-testid="dashboard-breakthrough-cancel"
               >
                 暫緩
               </Button>
               <Button
                 onClick={confirmBreakthrough}
                 disabled={isMajorBreakthrough && requiredItemId && !hasItem}
                 variant={isMajorBreakthrough && requiredItemId && !hasItem ? "stone" : "primary"}
                 className="flex-1 font-bold shadow-lg"
                 data-testid="dashboard-breakthrough-confirm"
               >
                 開始突破
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
