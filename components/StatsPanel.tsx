import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Heart, Brain, Zap, Shield, Sparkles, User, Dna, Activity, Sword, Wind, Crosshair, Target, ShieldAlert, Hammer, FlaskConical, ArrowUpCircle, Coins, Flame, Move, Skull } from 'lucide-react';
import { SPIRIT_ROOT_DETAILS, REALM_BASE_STATS } from '../constants';
import { formatSpiritStone } from '../utils/currency';
import { calculatePlayerStats } from '../utils/battleSystem';
import clsx from 'clsx';

export const StatsPanel: React.FC = () => {
  const { attributes, spiritStones, spiritRootId, isInitialized, majorRealm } = useSelector((state: RootState) => state.character);
  const { equipmentStats } = useSelector((state: RootState) => state.inventory);
  const [activeTab, setActiveTab] = useState<'basic' | 'combat'>('basic');
  
  // Tooltip State
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; desc: string; subDesc?: string; highlightColor?: string } | null>(null);

  if (!isInitialized) return null;

  // Derived Stats Calculations for Display
  const combatStats = calculatePlayerStats(attributes, majorRealm, spiritRootId, equipmentStats);
  const hp = combatStats.hp;
  const mp = combatStats.mp;
  
  const rootDetails = SPIRIT_ROOT_DETAILS[spiritRootId];
  const baseRealmStats = REALM_BASE_STATS[majorRealm];

  // Tooltip Handlers
  const handleMouseEnter = (e: React.MouseEvent, data: { label: string, desc: string, subDesc?: string, highlightColor?: string }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Position tooltip to the right of the element, or below if space is tight
    // Default: Bottom-Center of element
    // Fixed position relative to viewport
    setTooltip({
      x: rect.left + (rect.width / 2),
      y: rect.bottom + 5,
      ...data
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const StatRow = ({ icon: Icon, label, value, desc, subDesc, highlightColor }: any) => (
    <div 
      className="flex items-center justify-between p-2 hover:bg-stone-800 rounded transition-colors cursor-help"
      onMouseEnter={(e) => handleMouseEnter(e, { label, desc, subDesc, highlightColor })}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 md:p-2 bg-stone-950 rounded border border-stone-700 text-stone-400">
          <Icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
        </div>
        <span className="text-stone-300 text-sm md:text-base">{label}</span>
      </div>
      <span className={clsx("font-mono font-bold text-sm md:text-base", highlightColor || "text-stone-200")}>{value}</span>
    </div>
  );

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg h-full flex flex-col overflow-hidden relative">
      {/* Header & Tabs */}
      <div className="p-4 pb-0 border-b border-stone-800 bg-stone-900 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-stone-300 font-bold tracking-widest text-base md:text-lg">人物屬性</h3>
          <span className="text-amber-500 text-sm md:text-base font-normal flex items-center gap-1 bg-stone-950 px-2 py-1 rounded border border-stone-800">
            <span className="text-xs md:text-sm text-stone-500">靈石</span> {formatSpiritStone(spiritStones)}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => setActiveTab('basic')}
            className={clsx(
              "flex-1 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors border-b-2",
              activeTab === 'basic' 
                ? "text-amber-500 border-amber-500 bg-stone-800/50" 
                : "text-stone-500 border-transparent hover:text-stone-300 hover:bg-stone-800/30"
            )}
          >
            基礎屬性
          </button>
          <button 
            onClick={() => setActiveTab('combat')}
            className={clsx(
              "flex-1 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors border-b-2",
              activeTab === 'combat' 
                ? "text-amber-500 border-amber-500 bg-stone-800/50" 
                : "text-stone-500 border-transparent hover:text-stone-300 hover:bg-stone-800/30"
            )}
          >
            戰鬥屬性
          </button>
        </div>
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {/* === TAB: BASIC === */}
        {activeTab === 'basic' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             {/* Resource Bars */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-800/50">
                <div 
                  className="text-center bg-stone-950/50 p-2 rounded cursor-help border border-stone-800/50 hover:border-emerald-900/50 transition-colors"
                  onMouseEnter={(e) => handleMouseEnter(e, { 
                    label: "氣血 (HP)", 
                    desc: `肉身承載上限。回復：${combatStats.regenHp}%/回合。`, 
                    subDesc: `基礎: 體魄${attributes.physique}×15 + 境界${baseRealmStats.hp} | 裝備: +${(equipmentStats.hp||0)}`, 
                    highlightColor: "text-emerald-400" 
                  })}
                  onMouseLeave={handleMouseLeave}
                >
                    <div className="text-xs md:text-sm text-stone-500 mb-1 flex items-center justify-center gap-1"><Heart className="w-2.5 h-2.5 md:w-3 md:h-3" /> 氣血 (HP)</div>
                    <div className="text-emerald-500 font-mono font-bold text-sm md:text-lg">{hp}</div>
                </div>
                <div 
                  className="text-center bg-stone-950/50 p-2 rounded cursor-help border border-stone-800/50 hover:border-blue-900/50 transition-colors"
                  onMouseEnter={(e) => handleMouseEnter(e, { 
                    label: "靈力 (MP)", 
                    desc: "施展功法與術法的能量來源，受靈根深度影響。", 
                    subDesc: `基礎: 神識${attributes.insight}×10 + 境界${baseRealmStats.mp} | 裝備: +${(equipmentStats.mp||0)}`, 
                    highlightColor: "text-blue-400" 
                  })}
                  onMouseLeave={handleMouseLeave}
                >
                    <div className="text-xs md:text-sm text-stone-500 mb-1 flex items-center justify-center gap-1"><Activity className="w-2.5 h-2.5 md:w-3 md:h-3" /> 靈力 (MP)</div>
                    <div className="text-blue-500 font-mono font-bold text-sm md:text-lg">{mp}</div>
                </div>
            </div>

            <div className="space-y-1">
              <StatRow icon={Dna} label="靈根" value={rootDetails.name} highlightColor={rootDetails.colorClass}
                desc={`【${rootDetails.destiny}】${rootDetails.description}`} subDesc={`加成：${rootDetails.statsDescription}`} />
              
              <StatRow icon={User} label="體魄" value={attributes.physique} 
                desc="影響「初始壽元上限」、「氣血上限」與「物理防禦」。" subDesc={`基礎值 + 裝備(${equipmentStats.physique||0})`} />
              <StatRow icon={User} label="根骨" value={attributes.rootBone} 
                desc="修仙之基。影響「物理攻擊力」、「修煉速度」與「回血速度」。" subDesc={`基礎值 + 裝備(${equipmentStats.rootBone||0})`} />
              <StatRow icon={Brain} label="神識" value={attributes.insight} 
                desc="靈魂強度。影響「命中率」、「法術強度」、「煉丹」與「暴擊傷害」。" subDesc={`基礎值 + 裝備(${equipmentStats.insight||0})`} />
              <StatRow icon={Brain} label="悟性" value={attributes.comprehension} 
                desc="領悟能力。影響「速度」、「修煉速度」與「突破成功率」。" subDesc={`基礎值 + 裝備(${equipmentStats.comprehension||0})`} />
              <StatRow icon={Sparkles} label="福緣" value={attributes.fortune} 
                desc="氣運。影響「暴擊率」、「閃避率」與「掉落品質」。" subDesc={`基礎值 + 裝備(${equipmentStats.fortune||0})`} />
              <StatRow icon={Heart} label="魅力" value={attributes.charm} 
                desc="個人魅力。影響「NPC好感度」與「特殊事件觸發」。" subDesc={`基礎值 + 裝備(${equipmentStats.charm||0})`} />
            </div>
          </div>
        )}

        {/* === TAB: COMBAT & DETAILS === */}
        {activeTab === 'combat' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Combat Stats */}
            <div>
              <h4 className="text-stone-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 border-l-2 border-stone-700 pl-2">戰鬥能力</h4>
              <div className="grid grid-cols-2 gap-2">
                 <StatRow icon={Sword} label="攻擊" value={combatStats.attack} 
                   desc="物理攻擊力，影響普通攻擊與物理技能傷害。" highlightColor="text-amber-200" 
                   subDesc={`根骨(${attributes.rootBone})×2 = ${attributes.rootBone*2} | 裝備: +${equipmentStats.attack||0}`} 
                 />
                 <StatRow icon={Shield} label="防禦" value={combatStats.defense} 
                   desc="物理防禦力，直接抵扣受到的物理傷害。" highlightColor="text-stone-300" 
                   subDesc={`體魄(${attributes.physique})×1.5 = ${(attributes.physique*1.5).toFixed(1)} | 裝備: +${equipmentStats.defense||0}`} 
                 />
                 <StatRow icon={Zap} label="法攻" value={combatStats.magic} 
                   desc="法術攻擊力，影響五行法術的基礎傷害。" highlightColor="text-blue-300" 
                   subDesc={`神識(${attributes.insight})×2 = ${attributes.insight*2} | 裝備: +${equipmentStats.magic||0}`} 
                 />
                 <StatRow icon={ShieldAlert} label="法防" value={combatStats.res} 
                   desc="法術抗性，抵扣受到的法術與屬性傷害。" highlightColor="text-indigo-300" 
                   subDesc={`神識(${attributes.insight})×1.5 = ${(attributes.insight*1.5).toFixed(1)} | 裝備: +${equipmentStats.res||0}`} 
                 />
                 <StatRow icon={Wind} label="速度" value={combatStats.speed} 
                   desc="身法速度，決定出手順序與逃跑成功率。" highlightColor="text-cyan-200" 
                   subDesc={`悟性(${attributes.comprehension})×1 = ${attributes.comprehension} | 裝備: +${equipmentStats.speed||0}`} 
                 />
                 <StatRow icon={Crosshair} label="暴擊" value={`${combatStats.crit.toFixed(1)}%`} 
                   desc="攻擊造成額外傷害的機率。" highlightColor="text-red-300" 
                   subDesc={`神識(${attributes.insight})×0.1% = ${(attributes.insight*0.1).toFixed(1)}% | 裝備: +${(equipmentStats.crit||0).toFixed(1)}%`} 
                 />
                 <StatRow icon={Move} label="閃避" value={`${combatStats.dodge.toFixed(1)}%`} 
                   desc="完全規避受到攻擊的機率。" highlightColor="text-green-300" 
                   subDesc={`福緣(${attributes.fortune})×0.1% = ${(attributes.fortune*0.1).toFixed(1)}% | 裝備: +${(equipmentStats.dodge||0).toFixed(1)}%`} 
                 />
                 <StatRow icon={Shield} label="格擋" value={`${combatStats.blockRate.toFixed(1)}%`} 
                   desc="減少受到傷害的機率與比例。" highlightColor="text-stone-400" 
                   subDesc={`體魄(${attributes.physique})×0.1% = ${(attributes.physique*0.1).toFixed(1)}% | 裝備: +${(equipmentStats.blockRate||0).toFixed(1)}%`} 
                 />
                 <StatRow icon={Skull} label="爆傷" value={`${combatStats.critDamage.toFixed(0)}%`} 
                   desc="發動暴擊時造成的傷害倍率。" highlightColor="text-red-500" subDesc={`基礎: 150% + 神識(${attributes.insight})×0.2% = ${(150 + attributes.insight*0.2).toFixed(1)}% | 裝備: +${(equipmentStats.critDamage||0).toFixed(1)}%`} />
                 
                 {combatStats.damageReduction > 0 && (
                   <StatRow icon={Shield} label="減傷" value={`${combatStats.damageReduction}%`} 
                     desc="直接減少受到的最終傷害比例。" highlightColor="text-yellow-600" subDesc="加成來源：靈根 / 裝備 / 功法" />
                 )}
                 {combatStats.regenHp > 0 && (
                   <StatRow icon={Heart} label="回血" value={`${combatStats.regenHp}%`} 
                     desc="每回合戰鬥結束後回復的最大生命值比例。" highlightColor="text-emerald-500" subDesc="加成來源：木系靈根 / 裝備 / 功法" />
                 )}
                 
                 {/* Spirit Stone Bonus */}
                 {(rootDetails.bonuses.spiritStoneGainPercent || 0) > 0 && (
                    <StatRow icon={Coins} label="靈石加成" value={`+${rootDetails.bonuses.spiritStoneGainPercent}%`}
                      desc="戰鬥獲取靈石的額外加成。" highlightColor="text-amber-400" subDesc="加成來源：木火真靈根 / 裝備" />
                 )}
              </div>
            </div>

            {/* Utility Stats */}
            <div>
              <h4 className="text-stone-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 border-l-2 border-stone-700 pl-2">特殊加成</h4>
              <div className="grid grid-cols-2 gap-2">
                <StatRow icon={FlaskConical} label="煉丹" value={`+${combatStats.alchemyBonus.toFixed(1)}%`} 
                   desc="煉製丹藥時的額外成功率。" subDesc={`公式：${combatStats.alchemyBonus > 0 ? "特殊靈根(+10%)" : "基礎(0%)"} + 裝備加成`} />
                <StatRow icon={Hammer} label="煉器" value={`+${combatStats.craftingBonus.toFixed(1)}%`} 
                   desc="鍛造法寶時的額外成功率。" subDesc={`公式：${combatStats.craftingBonus > 0 ? "特殊靈根(+10%)" : "基礎(0%)"} + 裝備加成`} />
                <StatRow icon={ArrowUpCircle} label="突破" value={`+${combatStats.breakthroughBonus.toFixed(1)}%`} 
                   desc="境界突破時的額外成功率加成。" highlightColor="text-purple-300" subDesc="公式：基礎(0%) + 裝備加成" />
                <StatRow icon={Coins} label="掉落" value={`+${combatStats.dropRateBonus.toFixed(1)}%`} 
                   desc="擊殺妖獸時獲取戰利品的額外機率。" highlightColor="text-yellow-300" subDesc="公式：福緣 × 0.1% + 裝備加成" />
                <StatRow icon={Flame} label="修煉" value={`+${combatStats.cultivationSpeedBonus.toFixed(0)}%`} 
                   desc="運轉功法時獲取修為的額外速度。" highlightColor="text-orange-400" subDesc="公式：裝備效率加成" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FIXED TOOLTIP RENDERER */}
      {tooltip && (
        <div 
          className="fixed z-[9999] px-4 py-3 bg-stone-950 border border-stone-700 text-xs md:text-sm text-stone-300 rounded shadow-xl pointer-events-none w-64 md:w-80 animate-in fade-in duration-200 zoom-in-95"
          style={{ 
            top: tooltip.y, 
            left: Math.min(tooltip.x - 128, window.innerWidth - 300), // Adjusted collision for wider tooltip
          }}
        >
          <div className={clsx("font-bold mb-1 md:text-base", tooltip.highlightColor || "text-amber-500")}>{tooltip.label}</div>
          <div className="mb-2 leading-relaxed">{tooltip.desc}</div>
          {tooltip.subDesc && <div className="text-stone-500 text-[10px] md:text-xs border-t border-stone-800 pt-1 italic">{tooltip.subDesc}</div>}
        </div>
      )}
    </div>
  );
}; 