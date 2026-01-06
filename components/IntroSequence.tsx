import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeCharacter, generateInitialStats, generateSpiritRoot, calculateInitialLifespan } from '../store/slices/characterSlice';
import { addLog, clearLogs } from '../store/slices/logSlice';
import { Gender, SpiritRootId, BaseAttributes } from '../types';
import { SPIRIT_ROOT_DETAILS, DAYS_PER_YEAR } from '../constants';
import clsx from 'clsx';
import { Sparkles, ArrowRight, Activity, Sword, Dna } from 'lucide-react';

const PROLOGUE_TEXT = [
    "大荒曆一〇二六年，春。",
    "你今年剛滿十歲，出生在青雲山腳下的一個小村莊。",
    "今日，是北方大宗『青雲宗』下山選拔弟子的日子。村裡的孩童們早早就聚集在古樹下，懷著忐忑的心情等待那一刻的到來。",
    "負責檢測的仙人居高臨下，冷漠地掃視著眾人，緩緩開口道：",
    "『下一個，過來報上名來。』"
];

const PROLOGUE_DELAY = 1500; // ms between lines

export const IntroSequence: React.FC = () => {
    const dispatch = useDispatch();
    
    // Stages: 0:Prologue, 1:Identity, 2:Awakening(Stone), 3:Destiny(Result)
    const [stage, setStage] = useState(0);
    const [visibleLines, setVisibleLines] = useState<number>(0);
    
    // Identity State
    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.Male);
    
    // Awakening State
    const [isShaking, setIsShaking] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    
    // Destiny State (Pre-generated results)
    const [generatedStats, setGeneratedStats] = useState<{
        spiritRootId: SpiritRootId;
        attributes: BaseAttributes;
        lifespan: number;
    } | null>(null);

    // --- Stage 0: Prologue Animation ---
    useEffect(() => {
        if (stage === 0) {
            if (visibleLines < PROLOGUE_TEXT.length) {
                const timer = setTimeout(() => {
                    setVisibleLines(prev => prev + 1);
                }, PROLOGUE_DELAY);
                return () => clearTimeout(timer);
            } else {
                // All text shown, wait a bit then show form (transition handled in render)
                const timer = setTimeout(() => {
                    setStage(1);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [stage, visibleLines]);

    // --- Actions ---

    const handleIdentitySubmit = () => {
        if (!name.trim()) return;
        setStage(2);
    };

    const handleStoneClick = () => {
        if (isShaking) return;
        
        // Generate stats immediately on click so we can match the effect color
        const attributes = generateInitialStats();
        const spiritRootId = generateSpiritRoot();
        const lifespan = calculateInitialLifespan(attributes.physique);
        setGeneratedStats({ attributes, spiritRootId, lifespan });
        
        setIsShaking(true);

        // Sequence: Shake -> Flash -> Result
        setTimeout(() => {
            setShowFlash(true); // Flash white
            setTimeout(() => {
                setIsShaking(false);
                setShowFlash(false);
                setStage(3); // Show results
            }, 500); // Flash duration
        }, 2000); // Shake duration
    };

    const handleEmbark = () => {
        if (!generatedStats) return;
        
        dispatch(clearLogs());
        dispatch(initializeCharacter({
            name,
            gender,
            spiritRootId: generatedStats.spiritRootId,
            attributes: generatedStats.attributes,
            lifespan: generatedStats.lifespan
        }));
        
        const rootData = SPIRIT_ROOT_DETAILS[generatedStats.spiritRootId];
        
        // Add initial flavor logs
        dispatch(addLog({ message: `大荒曆一〇二六年，${name} 通過青雲宗試煉，正式踏入仙途。`, type: 'info' }));
        dispatch(addLog({ message: `經檢測，你身具【${rootData.name}】。${rootData.destiny}：${rootData.description}`, type: 'gain' }));
    };

    // --- Renderers ---

    const renderPrologue = () => (
        <div className="space-y-4 text-center max-w-lg mx-auto leading-relaxed text-stone-300">
            {PROLOGUE_TEXT.slice(0, visibleLines).map((line, idx) => (
                <p key={idx} className="fade-in-text">{line}</p>
            ))}
        </div>
    );

    const renderIdentity = () => (
        <div className="space-y-6 animate-fade-in text-center max-w-md mx-auto">
            <div className="text-stone-400 space-y-2 mb-8">
                 <p className="fade-in-text">{PROLOGUE_TEXT[PROLOGUE_TEXT.length - 1]}</p>
            </div>
            
            <div className="bg-stone-900/50 p-6 rounded-xl border border-stone-800 space-y-6">
                <input 
                    type="text" 
                    placeholder="請道友留下名諱"
                    className="w-full bg-stone-950 border-b border-stone-700 p-3 text-center text-xl text-stone-100 placeholder-stone-600 focus:border-amber-500 outline-none transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
                
                <div className="flex justify-center gap-4">
                     <button 
                        onClick={() => setGender(Gender.Male)}
                        className={clsx(
                            "px-6 py-2 rounded-full border transition-all font-serif",
                            gender === Gender.Male 
                                ? "bg-stone-800 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
                                : "border-stone-700 text-stone-600 hover:border-stone-500"
                        )}
                     >
                        男兒身
                     </button>
                     <button 
                        onClick={() => setGender(Gender.Female)}
                        className={clsx(
                            "px-6 py-2 rounded-full border transition-all font-serif",
                            gender === Gender.Female 
                                ? "bg-stone-800 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]" 
                                : "border-stone-700 text-stone-600 hover:border-stone-500"
                        )}
                     >
                        女兒身
                     </button>
                </div>

                <button 
                    onClick={handleIdentitySubmit}
                    disabled={!name.trim()}
                    className="w-full mt-4 bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 py-3 rounded border border-amber-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    確認
                </button>
            </div>
        </div>
    );

    const renderAwakening = () => {
        // Determine current glow color based on generated stats (if shaking) or default
        let glowStyle = "w-40 h-40 bg-stone-700/10 blur-lg group-hover:bg-amber-500/10";
        let stoneColor = "bg-gradient-to-br from-stone-600 to-stone-800 border-stone-900";
        let particleColor = "text-amber-200";

        if (isShaking && generatedStats) {
            const rootData = SPIRIT_ROOT_DETAILS[generatedStats.spiritRootId];
            // During shake, use the target color but intense blur
            glowStyle = `w-64 h-64 blur-xl ${rootData.glowClass.split(' ')[1]}/30`; 
        }

        return (
            <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in h-[60vh]">
                <p className="text-stone-300 text-lg">仙人微微點頭：『{name}... 很好。過來，將手放在這塊感靈石上。』</p>
                
                <div className="relative cursor-pointer group" onClick={handleStoneClick}>
                    {/* Glow Effect */}
                    <div className={clsx(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000",
                        glowStyle
                    )}></div>

                    {/* The Stone */}
                    <div className={clsx(
                        "w-32 h-32 rounded-full border-4 shadow-2xl relative z-10 flex items-center justify-center transition-transform",
                        stoneColor,
                        isShaking && "animate-shake",
                        !isShaking && "animate-stone-pulse group-hover:scale-105"
                    )}>
                        {isShaking && <Sparkles className={clsx("animate-spin", particleColor)} size={32} />}
                    </div>

                    {/* Particles Instruction */}
                    {!isShaking && (
                        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 text-stone-500 text-sm whitespace-nowrap animate-bounce">
                            點擊感靈石
                        </div>
                    )}
                </div>

                {/* White Flash Overlay */}
                {showFlash && (
                    <div className="fixed inset-0 bg-white z-50 animate-flash pointer-events-none"></div>
                )}
            </div>
        );
    };

    const renderDestiny = () => {
        if (!generatedStats) return null;
        
        const rootData = SPIRIT_ROOT_DETAILS[generatedStats.spiritRootId];
        
        return (
            <div className="animate-fade-in max-w-2xl mx-auto w-full py-6 md:py-10">
                <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 md:p-8 relative shadow-2xl space-y-6">
                    {/* Header with Title and Dialogue */}
                    <div className="text-center space-y-4 border-b border-stone-800 pb-6">
                        <div className="flex items-center justify-center gap-2 text-stone-500 text-xs md:text-sm uppercase tracking-widest">
                           <Sparkles size={14} /> 天命覺醒 <Sparkles size={14} />
                        </div>
                        
                        <h2 className={clsx("text-3xl md:text-4xl font-bold tracking-wider leading-relaxed", rootData.colorClass)}>
                            {rootData.name}
                        </h2>
                        
                        {/* Dynamic Dialogue - Prominent */}
                        <div className="relative inline-block mt-4 max-w-lg mx-auto">
                           <p className="text-base md:text-lg font-normal text-stone-300 italic leading-relaxed relative z-10 px-4 md:px-6">
                                「{rootData.comment}」
                           </p>
                           <div className="absolute -top-2 -left-1 text-4xl md:text-6xl text-stone-800 opacity-50 font-serif leading-none">“</div>
                           <div className="absolute -bottom-4 -right-1 text-4xl md:text-6xl text-stone-800 opacity-50 font-serif leading-none">”</div>
                        </div>

                        {/* Destiny Title Badge */}
                        <div className="mt-2">
                             <span className={clsx("px-3 py-1 rounded-full bg-stone-950/80 border text-xs tracking-wider", rootData.colorClass, "border-current opacity-80")}>
                                {rootData.destiny} &middot; {rootData.description}
                             </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Left: Stats Grid */}
                        <div className="space-y-4">
                            <h4 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-2 border-b border-stone-800 pb-1">先天屬性</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <StatBox label="體魄" value={generatedStats.attributes.physique} 
                                bonus={rootData.bonuses.initialStats?.physique} />
                                <StatBox label="根骨" value={generatedStats.attributes.rootBone} 
                                bonus={rootData.bonuses.initialStats?.rootBone}/>
                                <StatBox label="神識" value={generatedStats.attributes.insight} 
                                bonus={rootData.bonuses.initialStats?.insight}/>
                                <StatBox label="悟性" value={generatedStats.attributes.comprehension} 
                                bonus={rootData.bonuses.initialStats?.comprehension}/>
                                <StatBox label="福緣" value={generatedStats.attributes.fortune} 
                                bonus={rootData.bonuses.initialStats?.fortune}/>
                                <StatBox label="魅力" value={generatedStats.attributes.charm} 
                                bonus={rootData.bonuses.initialStats?.charm}/>
                            </div>
                            <div className="text-center bg-stone-950 p-2 rounded border border-stone-800 text-stone-400 text-xs font-mono mt-2">
                                骨齡 10 / 壽元 {Math.floor((generatedStats.lifespan + (rootData.bonuses.initialLifespan || 0) * DAYS_PER_YEAR) / DAYS_PER_YEAR)}
                                {rootData.bonuses.initialLifespan && <span className="text-emerald-500"> (+{rootData.bonuses.initialLifespan})</span>}
                            </div>
                        </div>

                        {/* Right: Visual Chart & Tags */}
                        <div className="space-y-4 flex flex-col">
                            <h4 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-2 border-b border-stone-800 pb-1">資質潛力</h4>
                            
                            {/* Bar Chart */}
                            <div className="space-y-4 flex-1">
                                <BarChartRow label="修煉效率" value={rootData.weights.cultivation} color="bg-amber-500" icon={Dna} />
                                <BarChartRow label="戰鬥能力" value={rootData.weights.battle} color="bg-red-500" icon={Sword} />
                                <BarChartRow label="機緣氣運" value={rootData.weights.utility} color="bg-blue-500" icon={Activity} />
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-4 content-end">
                                {rootData.tags.map((tag, i) => (
                                    <span key={i} className={clsx(
                                        "px-2 py-1 rounded text-xs border font-bold", 
                                        rootData.colorClass.replace('text-', 'bg-').replace('500', '900/30'), // bg-color-900/30
                                        rootData.colorClass.replace('text-', 'border-').replace('500', '800'), // border-color-800
                                        rootData.colorClass
                                    )}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Final Button - Epic Style */}
                    <div className="pt-4">
                        <button 
                            onClick={handleEmbark}
                            className={clsx(
                                "w-full py-5 relative group overflow-hidden rounded border transition-transform active:scale-[0.98]",
                                // Background base
                                "bg-stone-900 border-stone-600",
                                // Text
                                "text-stone-100 font-bold tracking-[0.3em] md:tracking-[0.5em] text-lg md:text-xl",
                                // Flex layout
                                "flex items-center justify-center gap-4"
                            )}
                        >
                            {/* Animated Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 opacity-80 animate-bg-slide z-0"></div>
                            
                            {/* Hover Glow (Element Color) */}
                            <div className={clsx(
                                "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500", 
                                rootData.glowClass.split(' ')[1] // Gets the bg-color-500 part roughly
                            )}></div>
                            
                            {/* Pulse Ring Effect */}
                            <div className="absolute inset-0 border-2 border-white/10 rounded group-hover:border-white/30 transition-colors z-10"></div>
                            
                            {/* Content */}
                            <span className="relative z-20 group-hover:text-white transition-colors drop-shadow-md">逆天而行，開啟仙途</span>
                            <ArrowRight className="relative z-20 group-hover:translate-x-2 transition-transform duration-300" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Layout ---
    // Changed to min-h-full (or handled by parent) but allowing content to dictate height, parent handles scroll
    return (
        <div className="flex items-center justify-center w-full p-4 md:p-6 min-h-full">
            <div className="relative z-10 w-full flex justify-center">
                {stage === 0 && renderPrologue()}
                {stage === 1 && renderIdentity()}
                {stage === 2 && renderAwakening()}
                {stage === 3 && renderDestiny()}
            </div>
        </div>
    );
};

const StatBox = ({ label, value, bonus }: { label: string, value: number, bonus?: number }) => (
    <div className="flex justify-between items-center p-2 bg-stone-950/50 rounded border border-stone-800">
        <span className="text-stone-500">{label}</span>
        <div className="font-mono">
            <span className={clsx("font-bold", value > 10 ? "text-amber-400" : "text-stone-300")}>{value}</span>
            {bonus && <span className="text-emerald-500 ml-1 text-xs">+{bonus}</span>}
        </div>
    </div>
);

const BarChartRow = ({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: any }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1"><Icon size={12}/> {label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 w-full bg-stone-950 rounded-full border border-stone-800 overflow-hidden">
            <div className={clsx("h-full transition-all duration-1000 ease-out", color)} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);