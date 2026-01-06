
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { manualCultivate, attemptBreakthrough, toggleSeclusion, reincarnate } from '../store/slices/characterSlice';
import { removeItem } from '../store/slices/inventorySlice';
import { addLog } from '../store/slices/logSlice';
import { REALM_NAMES, SPIRIT_ROOT_MULTIPLIERS, REALM_MODIFIERS, MINOR_REALM_CAP, DAYS_PER_YEAR, BREAKTHROUGH_CONFIG } from '../constants';
import { ITEMS } from '../data/items';
import { ProgressBar } from '../components/ProgressBar';
import { LogPanel } from '../components/LogPanel';
import { StatsPanel } from '../components/StatsPanel';
import { Modal } from '../components/Modal';
import { IntroSequence } from '../components/IntroSequence';
import { Play, ChevronsUp, Moon, Info, Skull, AlertTriangle, Zap, Lock } from 'lucide-react';
import { SpiritRootType } from '../types';

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const { 
    isInitialized, isDead, name, gender, majorRealm, minorRealm, currentExp, maxExp, 
    cultivationRate, isBreakthroughAvailable, isInSeclusion, attributes, spiritRoot,
    lastBreakthroughResult, age, lifespan, gatheringLevel
  } = character;

  const [isBreakthroughModalOpen, setIsBreakthroughModalOpen] = useState(false);
  const processedBreakthroughRef = useRef<number>(0);

  // Monitor breakthrough result
  useEffect(() => {
    if (lastBreakthroughResult && lastBreakthroughResult.timestamp > processedBreakthroughRef.current) {
        processedBreakthroughRef.current = lastBreakthroughResult.timestamp;
        
        if (lastBreakthroughResult.success) {
             dispatch(addLog({ message: "金光乍現，瓶頸轟然破碎！壽元大增，修為更進一步！", type: 'success' }));
        } else {
             if (lastBreakthroughResult.isTribulation) {
                 dispatch(addLog({ message: "天劫降臨！雷霆貫體，你雖勉強保住性命，但修為盡失...", type: 'tribulation' }));
             } else if (lastBreakthroughResult.dropRealm) {
                 dispatch(addLog({ message: "突破失敗，氣血逆行，走火入魔！境界跌落...", type: 'danger' }));
             } else {
                 dispatch(addLog({ message: "突破失敗，經脈受損，需修養時日。", type: 'danger' }));
             }
        }
    }
  }, [lastBreakthroughResult, dispatch]);

  const handleReincarnate = () => {
      dispatch(reincarnate());
  };

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

  const handleSeclusion = () => {
      dispatch(toggleSeclusion());
      if (!isInSeclusion) {
          dispatch(addLog({ message: "進入閉關狀態，心無旁騖，修煉速度倍增(5.0x)。", type: 'success' }));
      } else {
          dispatch(addLog({ message: "結束閉關，準備入世歷練。", type: 'info' }));
      }
  };

  const calculateSuccessRate = () => {
      // Replicate logic for display
      let baseRate = config.baseRate;
      const decay = Math.pow(0.95, minorRealm);
      let rate = baseRate * decay;
      
      rate += attributes.comprehension * 0.002;
      rate += attributes.fortune * 0.001;
      if (!isMajorBreakthrough && spiritRoot === SpiritRootType.Heavenly) {
          rate += 0.05;
      }
      return Math.min(0.95, rate) * 100;
  };

  const successRate = calculateSuccessRate();

  // Calculations for tooltips
  const currentAgeYearStr = (age / DAYS_PER_YEAR).toFixed(2);
  const maxAgeYearStr = (lifespan / DAYS_PER_YEAR).toFixed(0);
  
  const baseRate = attributes.rootBone * 0.1;
  const spiritMult = SPIRIT_ROOT_MULTIPLIERS[spiritRoot];
  const realmMult = REALM_MODIFIERS[majorRealm];
  const gatherMult = 1 + (gatheringLevel * 0.05);
  const stateMult = isInSeclusion ? 5.0 : 1.0;
  const finalDisplayRate = (baseRate * spiritMult * realmMult * gatherMult * stateMult).toFixed(1);

  const isCriticalLifespan = (lifespan - age) <= 365 && !isDead;

  if (!isInitialized || isDead) {
      if (isDead) {
          return (
              <div className="flex items-center justify-center h-full w-full p-6 relative overflow-hidden">
                  <div className="bg-stone-900 border border-stone-800 p-8 rounded-xl max-w-md w-full text-center space-y-6 relative z-10 shadow-2xl">
                      <h1 className="text-3xl font-bold text-amber-500 tracking-widest">身死道消</h1>
                      <div className="space-y-4">
                          <Skull size={48} className="mx-auto text-stone-600" />
                          <p className="text-stone-400">
                              壽元已盡，輪迴路遠。<br/>
                              道友享年 {Math.floor(age/DAYS_PER_YEAR)} 歲，境界止步於 {REALM_NAMES[majorRealm]}。
                          </p>
                          <button 
                            onClick={handleReincarnate}
                            className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 py-3 rounded border border-stone-600 transition-all"
                          >
                              重入輪迴
                          </button>
                      </div>
                  </div>
              </div>
          );
      }
      return <IntroSequence />;
  }

  return (
    <div className="flex flex-col md:flex-row h-full p-4 md:p-6 gap-6 overflow-hidden relative">
      
      {isCriticalLifespan && (
         <div className="absolute inset-0 z-[90] pointer-events-none overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-stone-500/10 grayscale mix-blend-multiply"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] animate-pulse"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(220,38,38,0.15)] animate-pulse"></div>
         </div>
      )}

      {/* LEFT COLUMN: Status & Actions */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        
        {/* 1. Character Status Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl relative shadow-lg z-20 hover:z-50 transition-all duration-200">
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
          
          <div className="relative z-10 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="group relative cursor-help">
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
                <div className="absolute top-full left-0 mt-2 px-4 py-3 bg-stone-950 border border-stone-700 text-sm text-stone-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] w-72">
                   <div className="font-bold text-stone-200 mb-2">{name} (道號)</div>
                   <div className="mb-2 leading-relaxed">
                      當前骨齡：<span className="text-amber-500 font-mono">{currentAgeYearStr}</span> 歲<br/>
                      壽元上限：<span className="text-stone-400 font-mono">{maxAgeYearStr}</span> 歲
                   </div>
                   <div className="text-xs text-stone-500 italic border-t border-stone-800 pt-2">
                      歲月不居，時節如流，若不破境增加壽元，終將身死道消。
                   </div>
                </div>
              </div>

              <div className="text-right">
                 <div className="text-2xl text-amber-500 tracking-widest font-serif font-bold">
                    {REALM_NAMES[majorRealm]} 
                 </div>
                 <div className="text-stone-500 text-sm">
                    第 {minorRealm} 層
                 </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-stone-400 text-xs">修為進度</span>
                <div className="group relative cursor-help">
                   <span className={`text-lg font-mono font-bold ${isInSeclusion ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                     +{Number(cultivationRate.toFixed(1))} /秒
                   </span>
                   {isInSeclusion && <span className="text-[10px] ml-1 text-amber-500 border border-amber-900 px-1 rounded">閉關 x5</span>}
                   <div className="absolute bottom-full right-0 mb-2 px-4 py-3 bg-stone-950 border border-stone-700 text-xs text-stone-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] w-72">
                      <div className="mb-2 font-bold text-stone-200">修煉效率</div>
                      <div className="font-mono text-xs space-y-1">
                        <div>基礎吸收 ({baseRate.toFixed(2)}) × 靈根加成 ({spiritMult.toFixed(1)}x) × 狀態倍率 ({stateMult.toFixed(1)}x)</div>
                        <div className="border-t border-stone-700 mt-1 pt-1 text-right text-emerald-400 font-bold">
                          = {finalDisplayRate} /秒
                        </div>
                      </div>
                   </div>
                </div>
              </div>
              <ProgressBar 
                current={currentExp} 
                max={maxExp} 
                colorClass={isBreakthroughAvailable ? "bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" : "bg-gradient-to-r from-emerald-800 to-emerald-500"}
              />
            </div>
          </div>
        </div>

        {/* 2. Action Buttons Area */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 relative z-20 hover:z-50 transition-all duration-200">
           <h3 className="text-stone-500 text-xs font-bold mb-4 uppercase tracking-widest">Actions</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                 <button
                   onClick={handleManualCultivate}
                   disabled={isBreakthroughAvailable || isInSeclusion}
                   className="flex-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-stone-200 py-4 rounded-lg border border-stone-700 transition-all flex flex-col items-center justify-center gap-2 group relative"
                 >
                   <Play size={20} className={isInSeclusion ? "text-stone-600" : "text-emerald-500"} />
                   <span className="font-bold tracking-widest">運功</span>
                   <span className="text-[10px] text-stone-500 font-normal">日常修煉 (1.0x)</span>
                 </button>

                 <button
                   onClick={handleSeclusion}
                   className={`flex-1 py-4 rounded-lg border transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group
                     ${isInSeclusion 
                       ? "bg-amber-900/30 border-amber-500/50 text-amber-200 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]" 
                       : "bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300"
                     }`}
                 >
                   <Moon size={20} className={isInSeclusion ? "text-amber-400 animate-pulse" : "text-indigo-400"} />
                   <span className="font-bold tracking-widest">{isInSeclusion ? "出關" : "閉關"}</span>
                   <span className="text-[10px] text-stone-500 font-normal">心無旁騖 (5.0x)</span>
                   {isInSeclusion && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 animate-pulse"></div>}
                 </button>
              </div>

              <button
                onClick={handleBreakthroughClick}
                disabled={!isBreakthroughAvailable}
                className={`col-span-1 group relative outline-none w-full
                  ${isBreakthroughAvailable ? "cursor-pointer" : "cursor-not-allowed"}
                `}
              >
                <div className={`
                    w-full py-4 rounded-lg border transition-all flex flex-col items-center justify-center gap-2
                    ${isBreakthroughAvailable 
                        ? "bg-gradient-to-br from-amber-700 to-amber-900 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse hover:scale-[1.02]" 
                        : "bg-stone-950 border-stone-800 text-stone-700 opacity-60"
                    }
                `}>
                    <ChevronsUp size={24} className={isBreakthroughAvailable ? "text-white" : "text-stone-700"} />
                    <span className="font-bold tracking-widest text-lg">境界突破</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {isBreakthroughAvailable ? "瓶頸已至，點擊破境" : "積累修為中..."}
                    </span>
                </div>
              </button>
           </div>
        </div>

        <div className="bg-stone-900/50 border border-stone-800/50 rounded-lg p-4 flex items-start gap-3">
          <Info size={16} className="text-stone-500 mt-1 flex-shrink-0" />
          <p className="text-stone-500 text-xs leading-relaxed">
             <span className="text-stone-400 font-bold">修煉指南：</span> 
             閉關雖能大幅提升修為，但無法進行歷練或戰鬥。壽元有限，道友需在天人五衰之前突破桎梏，方能證道長生。
          </p>
        </div>
      </div>

      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-6 relative z-30">
         <div className="flex-none">
            <StatsPanel />
         </div>
         <div className="flex-1 min-h-[300px]">
            <LogPanel />
         </div>
      </div>

      {/* Breakthrough Confirmation Modal */}
      <Modal
        isOpen={isBreakthroughModalOpen}
        onClose={() => setIsBreakthroughModalOpen(false)}
        title={isMajorBreakthrough ? "衝擊大境界" : "突破小境界"}
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
               <button 
                 onClick={() => setIsBreakthroughModalOpen(false)}
                 className="flex-1 py-3 rounded border border-stone-600 text-stone-400 hover:bg-stone-800 transition-colors"
               >
                 暫緩
               </button>
               <button 
                 onClick={confirmBreakthrough}
                 disabled={isMajorBreakthrough && requiredItemId && !hasItem}
                 className={`flex-1 py-3 rounded font-bold shadow-lg transition-all
                    ${isMajorBreakthrough && requiredItemId && !hasItem 
                        ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                        : 'bg-amber-700 hover:bg-amber-600 text-stone-100'
                    }
                 `}
               >
                 開始突破
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
