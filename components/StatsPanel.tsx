import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Heart, Brain, Zap, Shield, Sparkles, User, Dna, Activity, Gem } from 'lucide-react';
import { SPIRIT_ROOT_DETAILS, REALM_BASE_STATS } from '../constants';
import clsx from 'clsx';

export const StatsPanel: React.FC = () => {
  const { attributes, spiritStones, spiritRootId, isInitialized, majorRealm } = useSelector((state: RootState) => state.character);

  if (!isInitialized) return null;

  // Derived Stats Calculations for Display
  const base = REALM_BASE_STATS[majorRealm];
  const hp = attributes.physique * 15 + base.hp;
  const mp = attributes.insight * 10 + base.mp;
  
  const rootDetails = SPIRIT_ROOT_DETAILS[spiritRootId];
  
  const StatRow = ({ icon: Icon, label, value, desc, subDesc, highlightColor }: any) => (
    <div className="flex items-center justify-between p-2 hover:bg-stone-800 rounded transition-colors group relative cursor-help">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-stone-950 rounded border border-stone-700 text-stone-400">
          <Icon size={14} />
        </div>
        <span className="text-stone-300 text-sm">{label}</span>
      </div>
      <span className={clsx("font-mono font-bold", highlightColor || "text-stone-200")}>{value}</span>
      
      {/* Tooltip */}
      <div className="absolute right-0 top-full mt-1 w-64 px-4 py-3 bg-stone-950 border border-stone-700 text-xs text-stone-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
        <div className="font-bold text-amber-500 mb-1">{label}</div>
        <div className="mb-2 leading-relaxed">{desc}</div>
        {subDesc && <div className="text-stone-500 text-[10px] border-t border-stone-800 pt-1 italic">{subDesc}</div>}
      </div>
    </div>
  );

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 h-full">
      <h3 className="text-stone-300 font-bold mb-4 border-b border-stone-800 pb-2 tracking-widest flex justify-between">
        <span>人物屬性</span>
        <span className="text-amber-500 text-sm font-normal flex items-center gap-1">
          <span className="text-xs">靈石</span> {spiritStones}
        </span>
      </h3>
      
      <div className="space-y-1">
        {/* Dynamic Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-stone-800/50">
            <div className="text-center bg-stone-950/50 p-2 rounded group relative cursor-help">
                <div className="text-xs text-stone-500 mb-1 flex items-center justify-center gap-1"><Heart size={10} /> 氣血 (HP)</div>
                <div className="text-emerald-500 font-mono font-bold">{hp}</div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-4 py-3 bg-stone-950 border border-stone-700 text-xs text-stone-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-[100]">
                  <div className="font-bold mb-1 text-emerald-400">氣血 (HP)</div>
                  <div className="font-mono mb-2 text-stone-400 text-[10px]">公式：體魄 × 15 + 境界基礎值</div>
                  <div className="text-stone-300 leading-tight">代表肉身承載上限，歸零則神魂俱滅。</div>
                </div>
            </div>
            <div className="text-center bg-stone-950/50 p-2 rounded group relative cursor-help">
                <div className="text-xs text-stone-500 mb-1 flex items-center justify-center gap-1"><Activity size={10} /> 靈力 (MP)</div>
                <div className="text-blue-500 font-mono font-bold">{mp}</div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-4 py-3 bg-stone-950 border border-stone-700 text-xs text-stone-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-[100]">
                   <div className="font-bold mb-1 text-blue-400">靈力 (MP)</div>
                   <div className="font-mono mb-2 text-stone-400 text-[10px]">公式：神識 × 10 + 境界基礎值</div>
                   <div className="text-stone-300 leading-tight">施展功法與術法的能量來源，受靈根深度影響。</div>
                </div>
            </div>
        </div>

        {/* Spirit Root Info */}
        <StatRow 
          icon={Dna} 
          label="靈根" 
          value={rootDetails.name} 
          highlightColor={rootDetails.colorClass}
          desc={`【${rootDetails.destiny}】${rootDetails.description}`}
          subDesc={`加成：${rootDetails.statsDescription}`}
        />
        <StatRow 
          icon={Shield} 
          label="體魄" 
          value={attributes.physique} 
          desc="影響「初始壽元上限」與「氣血(HP)上限」。"
        />
        <StatRow 
          icon={User} 
          label="根骨" 
          value={attributes.rootBone} 
          desc="修仙之基。直接影響「物理攻擊力」與「基礎修煉效率」。"
        />
        <StatRow 
          icon={Brain} 
          label="神識" 
          value={attributes.insight} 
          desc="靈魂強度。影響「命中率」、「法術防禦」與「煉丹成功率」。"
        />
        <StatRow 
          icon={Zap} 
          label="悟性" 
          value={attributes.comprehension} 
          desc="天資聰穎。提高「境界突破成功率」與「戰鬥暴擊率」。"
        />
        <StatRow 
          icon={Sparkles} 
          label="福緣" 
          value={attributes.fortune} 
          desc="冥冥天意。影響「掉落率」、「避劫機率」與「閃避率」。"
        />
        <StatRow 
          icon={Gem} 
          label="魅力" 
          value={attributes.charm} 
          desc="處世之道。影響商店折扣 與 宗門任務獎勵。"
        />
      </div>
    </div>
  );
};