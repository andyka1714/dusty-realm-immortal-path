import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { NPC, Quest, QuestStatus, ItemQuality, Item, ProfessionType } from '../../types';
import { QUESTS } from '../../data/quests';
import { ITEMS } from '../../data/items';
import { acceptQuest, updateQuestProgress, completeQuest } from '../../store/slices/questSlice';
import { addSpiritStones, gainExperience, setProfession } from '../../store/slices/characterSlice';
import { addItem } from '../../store/slices/inventorySlice';
import { addLog } from '../../store/slices/logSlice';
import { addVisualEffect } from '../../store/slices/adventureSlice'; // Import addVisualEffect
import { Modal } from '../Modal';
import { MessageCircle, Gift, CheckCircle, Circle } from 'lucide-react';

interface QuestModalProps {
    npc: NPC;
    onClose: () => void;
}

const rankName = (quality: ItemQuality) => {
    switch (quality) {
        case ItemQuality.Low: return '凡品';
        case ItemQuality.Medium: return '良品';
        case ItemQuality.High: return '上品';
        case ItemQuality.Immortal: return '仙品';
        default: return '未知';
    }
};

export const QuestModal: React.FC<QuestModalProps> = ({ npc, onClose }) => {
    const dispatch = useDispatch();
    const { activeQuests, completedQuests } = useSelector((state: RootState) => state.quest);
    const { majorRealm } = useSelector((state: RootState) => state.character);

    // Determines the current interaction state
    const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
    const [questStatus, setQuestStatus] = useState<QuestStatus | null>(null);
    const [dialogueLines, setDialogueLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    // Initialization Logic
    useEffect(() => {
        // 1. Check for Quests to Submit (Priority High)
        // Find any active quest that needs to be submitted to THIS NPC
        const submitQuestId = Object.keys(activeQuests).find(qid => {
            const q = QUESTS[qid];
            if (!q) return false;
            // EITHER: This NPC is the specific submit target
            // OR: No submit target specified, but this NPC is the giver
            return (q.submitNpcId === npc.id) || (!q.submitNpcId && q.giverId === npc.id);
        });

        if (submitQuestId) {
            const quest = QUESTS[submitQuestId];
            setCurrentQuest(quest);
            setQuestStatus(QuestStatus.Active);
            
            // Check readiness logic
            const activeState = activeQuests[submitQuestId];
            
            // Auto-complete 'dialogue' requirements interacting with this NPC
            const dialogueReq = quest.requirements.find(r => 
                r.type === 'dialogue' && 
                (
                    r.targetNpcId === npc.id || 
                    (!r.targetNpcId && (quest.submitNpcId === npc.id || quest.giverId === npc.id))
                )
            );

            // Check 'level' requirements
            const levelReq = quest.requirements.find(r => r.type === 'level');
            let levelMet = true;
            if (levelReq && levelReq.minRealm !== undefined) {
                levelMet = majorRealm >= levelReq.minRealm;
            }
            
            let isReady = activeState.isReadyToComplete;
            
            // If prerequisites for this interaction are met, mark as ready
            // Note: If there are multiple requirements (e.g. Kill + Talk + Level), this simple logic might be insufficient. 
            // But for now, assuming these quests are simple single-stage or disjoint.
            // Actually, we should check if ALL non-dialogue requirements are met? 
            // For 'sect_sword_join', only 'level' exists.
            
            if ((dialogueReq || (levelReq && levelMet)) && !isReady) {
                 // Double check if ALL requirements are met?
                 // For now, lenient dispatch.
                 if (levelMet) {
                     isReady = true;
                     dispatch(updateQuestProgress({ questId: submitQuestId, isReady: true }));
                 }
            }

            if (isReady) {
                setDialogueLines(quest.dialogue.complete);
            } else {
                setDialogueLines(quest.dialogue.progress);
            }
            return;
        }

        // 2. Check for New Quests (Priority Medium)
        // Only if this NPC offers quests
        if (npc.questIds) {
            const availableQuestId = npc.questIds.find(qid => {
                 // Not active, Not completed
                 if (activeQuests[qid] || completedQuests.includes(qid)) return false;
                 
                 const q = QUESTS[qid];
                 if (!q) return false;

                 // Check Prerequisites
                 if (q.prerequisiteQuestId && !completedQuests.includes(q.prerequisiteQuestId)) return false;

                 // SECT EXCLUSIVITY LOGIC
                 const SECT_JOIN_QUESTS = ['sect_sword_join', 'sect_beast_join', 'sect_mystic_join'];
                 if (SECT_JOIN_QUESTS.includes(qid)) {
                     const alreadyJoinedOtherSect = SECT_JOIN_QUESTS.some(sectId => 
                         sectId !== qid && (activeQuests[sectId] || completedQuests.includes(sectId))
                     );
                     if (alreadyJoinedOtherSect) return false;
                 }
                 
                 // Check Min Realm
                 const realmReq = q.requirements.find(r => r.type === 'level');
                 if (realmReq && realmReq.minRealm !== undefined && majorRealm < realmReq.minRealm) return false;

                 return true;
            });

            if (availableQuestId) {
                const quest = QUESTS[availableQuestId];
                setCurrentQuest(quest);
                setQuestStatus(QuestStatus.Available);
                setDialogueLines(quest.dialogue.start);
                return;
                setDialogueLines(quest.dialogue.start);
                return;
            }
        }

        // 3. Fallback: Default Dialogue (No Quests available)
        setCurrentQuest(null);
        setQuestStatus(null);
        
        if (npc.dialogue && npc.dialogue.length > 0) {
            setDialogueLines(npc.dialogue);
        } else if (npc.description) {
            setDialogueLines([npc.description]);
        } else {
            setDialogueLines(["..."]);
        }

        // 3. No Quests - Default Dialogue
        setCurrentQuest(null);
        setQuestStatus(null);
        setDialogueLines(npc.dialogue || ["今天天氣不錯。"]);

    }, [npc, activeQuests, completedQuests, majorRealm, dispatch]);

    // Reset line index when dialogue lines change effectively (by tracking Lines reference or Quest ID)
    // Using a separate effect to ensure reset happens when the primary effect updates state
    useEffect(() => {
        setCurrentLineIndex(0);
    }, [currentQuest?.id, questStatus]);

    const handleNextLine = () => {
        if (currentLineIndex < dialogueLines.length - 1) {
            setCurrentLineIndex(prev => prev + 1);
        }
    };

    const handleAction = () => {
        if (!currentQuest) {
            onClose();
            return;
        }

        if (questStatus === QuestStatus.Available) {
            // Accept Quest
            dispatch(acceptQuest({ questId: currentQuest.id }));
            
            // Allow the user to see the status change (Icon update) by closing the modal
            // They will see the Green ? inside the game and click again to complete.
            onClose();

        } else if (questStatus === QuestStatus.Active) {
            const activeState = activeQuests[currentQuest.id];
            if (activeState.isReadyToComplete) {
                // Complete Quest
                dispatch(completeQuest({ questId: currentQuest.id }));
                
                // Handle Sect Joining
                if (currentQuest.id === 'sect_sword_join') dispatch(setProfession(ProfessionType.Sword));
                if (currentQuest.id === 'sect_beast_join') dispatch(setProfession(ProfessionType.Body));
                if (currentQuest.id === 'sect_mystic_join') dispatch(setProfession(ProfessionType.Mage));

                // Rewards
                const rewards = currentQuest.rewards;
                const rewardLogParts: string[] = [];

                rewards.forEach(r => {
                    if (r.exp) {
                        dispatch(gainExperience(r.exp));
                        rewardLogParts.push(`<exp>修為 ${r.exp}</exp>`);
                        dispatch(addVisualEffect({ type: 'text', text: `修為 +${r.exp}`, colorInt: 0xa78bfa, color: '#a78bfa' })); // Purple-400
                    }
                    if (r.spiritStones) {
                        dispatch(addSpiritStones({ amount: r.spiritStones, source: 'quest' }));
                        rewardLogParts.push(`<stones q="2">靈石 ${r.spiritStones}</stones>`); // Using q=2 for generic high visibility or custom color
                        dispatch(addVisualEffect({ type: 'text', text: `靈石 +${r.spiritStones}`, colorInt: 0xfacc15, color: '#facc15' })); // Yellow-400
                    }
                    if (r.items) {
                        r.items.forEach(item => {
                            dispatch(addItem({ itemId: item.itemId, count: item.count, quality: item.quality }));
                            const itemDef = ITEMS[item.itemId];
                            if (itemDef) {
                                // Use override quality for display if available
                                const displayQuality = item.quality ?? itemDef.quality;
                                const qualityName = rankName(displayQuality);
                                // Format: <item q="0">ItemName</item>
                                rewardLogParts.push(`<item q="${displayQuality}">${itemDef.name}(${qualityName}) x${item.count}</item>`);
                                
                                // Color Map
                                const colors: Record<number, number> = {
                                    [ItemQuality.Low]: 0xa8a29e, // Stone-400
                                    [ItemQuality.Medium]: 0x4ade80, // Green-400
                                    [ItemQuality.High]: 0x60a5fa, // Blue-400
                                    [ItemQuality.Immortal]: 0xfacc15 // Yellow-400
                                };
                                const colorInt = colors[displayQuality] || 0xffffff;
                                
                                dispatch(addVisualEffect({ 
                                    type: 'text', 
                                    text: `獲得 ${itemDef.name} x${item.count}`, 
                                    colorInt: colorInt, 
                                    color: '#' + colorInt.toString(16) 
                                }));
                            } else {
                                rewardLogParts.push(`${item.itemId} x${item.count}`); 
                            }
                        });
                    }
                });

                dispatch(addLog({ 
                    message: `完成任務【${currentQuest.title}】，獲得：${rewardLogParts.join('，')}`, 
                    type: 'success' 
                }));
                
                onClose();
            } else {
                // Just close
                onClose();
            }
        }
    };

    const isLastLine = currentLineIndex === dialogueLines.length - 1;
    let actionLabel = "離開";
    let actionClass = "bg-stone-800 text-stone-400 border-stone-700";

    if (currentQuest && isLastLine) {
        if (questStatus === QuestStatus.Available) {
            actionLabel = "接受任務";
            actionClass = "bg-amber-900 border-amber-600 text-amber-100 hover:bg-amber-800 animate-pulse";
        } else if (questStatus === QuestStatus.Active) {
            const isReady = activeQuests[currentQuest.id]?.isReadyToComplete;
            if (isReady) {
                actionLabel = "完成任務";
                actionClass = "bg-green-900 border-green-600 text-green-100 hover:bg-green-800 animate-pulse";
            } else {
                actionLabel = "我會繼續努力";
                actionClass = "bg-stone-800 text-stone-300 border-stone-600";
            }
        }
    } else if (!isLastLine) {
        actionLabel = "繼續";
        actionClass = "bg-stone-800 text-stone-200 border-stone-600";
    }

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={npc.name}
            size="small"
            actions={
                <button 
                    onClick={isLastLine ? handleAction : handleNextLine} 
                    className={`px-6 py-2 rounded border transition-all ${actionClass}`}
                >
                    {actionLabel}
                </button>
            }
        >
            <div className="flex flex-col gap-4">
                {/* Dialogue Area */}
                <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-800 min-h-[120px] relative">
                    <p className="text-stone-300 text-lg leading-relaxed italic relative z-10">
                        "{dialogueLines[currentLineIndex]}"
                    </p>
                    <div className="absolute bottom-2 right-2 text-xs text-stone-600 font-mono">
                        {currentLineIndex + 1} / {dialogueLines.length}
                    </div>
                </div>

                {/* Quest Info Area (If Applicable) */}
                {currentQuest && (
                    <div className="border border-stone-800 bg-stone-950/80 p-3 rounded">
                        <div className="text-amber-500 font-bold text-sm mb-1 flex items-center gap-2">
                           <CheckCircle size={14} /> {currentQuest.type === 'main' ? '[主線]' : '[支線]'} {currentQuest.title}
                        </div>
                        <p className="text-xs text-stone-500 mb-2">{currentQuest.description}</p>
                        
                            <div className="text-xs text-stone-400 flex flex-wrap gap-2 mt-2 pt-2 border-t border-stone-900">
                                <span>獎勵：</span>
                                {currentQuest.rewards.map((r, i) => (
                                    <React.Fragment key={i}>
                                        {r.exp && <span className="text-purple-400">修為 {r.exp}</span>}
                                        {r.spiritStones && <span className="text-yellow-400">靈石 {r.spiritStones}</span>}
                                        {r.items && r.items.map((rewardItem, idx) => {
                                            const itemDef = ITEMS[rewardItem.itemId];
                                            const rankColors: Record<number, string> = {
                                                [ItemQuality.Low]: 'text-stone-400',
                                                [ItemQuality.Medium]: 'text-green-400',
                                                [ItemQuality.High]: 'text-blue-400',
                                                [ItemQuality.Immortal]: 'text-yellow-400'
                                            };
                                            const quality = rewardItem.quality ?? itemDef?.quality ?? ItemQuality.Low;
                                            const colorClass = itemDef ? (rankColors[quality] || 'text-stone-300') : 'text-stone-300';
                                            const itemName = itemDef ? `[${rankName(quality)}] ${itemDef.name}` : rewardItem.itemId;
                                            return (
                                                <span key={`${i}-${idx}`} className={colorClass}>
                                                    {itemName} x{rewardItem.count}
                                                </span>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
