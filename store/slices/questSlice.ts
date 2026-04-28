import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QUESTS } from '../../data/quests';
import {
    BEAST_SECT_NPCS,
    GUIXU_RIFT_NPCS,
    IMMORTAL_ASCENSION_NPCS,
    MYSTIC_SECT_NPCS,
    SWORD_SECT_NPCS,
    TRI_REALM_BATTLEFIELD_NPCS,
    VILLAGE_NPCS,
    VOID_RIVER_NPCS,
    WORLD_STORY_NPCS,
} from '../../data/npcs';
import {
    AffinityChangeRecord,
    AffinityRecord,
    AffinityTargetType,
} from '../../types';

export interface ActiveQuestState {
    progress: number;
    isReadyToComplete: boolean;
}

export interface QuestState {
    activeQuests: Record<string, ActiveQuestState>;
    completedQuests: string[];
    npcAffinity: Record<string, AffinityRecord>;
    sectAffinity: Record<string, AffinityRecord>;
    recentAffinityChanges: AffinityChangeRecord[];
}

export const createInitialQuestState = (): QuestState => ({
    activeQuests: {},
    completedQuests: [],
    npcAffinity: {},
    sectAffinity: {},
    recentAffinityChanges: [],
});

const initialState: QuestState = createInitialQuestState();

const clampAffinity = (value: number) => Math.max(-100, Math.min(100, value));

const getQuestSectId = (questId: string): string | null => {
    if (questId.startsWith('sect_sword')) return 'sect_sword';
    if (questId.startsWith('sect_beast')) return 'sect_beast';
    if (questId.startsWith('sect_mystic')) return 'sect_mystic';
    return null;
};

const NPC_NAME_BY_ID = [
    ...VILLAGE_NPCS,
    ...SWORD_SECT_NPCS,
    ...BEAST_SECT_NPCS,
    ...MYSTIC_SECT_NPCS,
    ...TRI_REALM_BATTLEFIELD_NPCS,
    ...VOID_RIVER_NPCS,
    ...IMMORTAL_ASCENSION_NPCS,
    ...GUIXU_RIFT_NPCS,
    ...WORLD_STORY_NPCS,
].reduce<Record<string, string>>((names, npc) => {
    names[npc.id] = npc.name;
    return names;
}, {});

const ensureAffinityState = (state: QuestState) => {
    state.npcAffinity ??= {};
    state.sectAffinity ??= {};
    state.recentAffinityChanges ??= [];
};

const applyAffinityChange = (
    state: QuestState,
    {
        targetType,
        targetId,
        delta,
        reason,
    }: {
        targetType: AffinityTargetType;
        targetId: string;
        delta: number;
        reason: string;
    }
) => {
    if (!targetId || !Number.isFinite(delta)) return;

    ensureAffinityState(state);

    const collection = targetType === 'npc' ? state.npcAffinity : state.sectAffinity;
    const previous = collection[targetId]?.value ?? 0;
    const nextValue = clampAffinity(previous + delta);
    const timestamp = Date.now();

    collection[targetId] = {
        value: nextValue,
        lastReason: reason,
        updatedAt: timestamp,
    };
    state.recentAffinityChanges.unshift({
        targetType,
        targetId,
        delta,
        nextValue,
        reason,
        timestamp,
    });
    state.recentAffinityChanges = state.recentAffinityChanges.slice(0, 5);
};

const questSlice = createSlice({
    name: 'quest',
    initialState,
    reducers: {
        acceptQuest: (state, action: PayloadAction<{ questId: string }>) => {
            const { questId } = action.payload;
            if (!state.activeQuests[questId] && !state.completedQuests.includes(questId)) {
                state.activeQuests[questId] = {
                    progress: 0,
                    isReadyToComplete: false
                };
            }
        },
        updateQuestProgress: (state, action: PayloadAction<{ questId: string, progress?: number, isReady?: boolean }>) => {
            const { questId, progress, isReady } = action.payload;
            if (state.activeQuests[questId]) {
                if (progress !== undefined) state.activeQuests[questId].progress = progress;
                if (isReady !== undefined) state.activeQuests[questId].isReadyToComplete = isReady;
            }
        },
        completeQuest: (state, action: PayloadAction<{ questId: string }>) => {
            const { questId } = action.payload;
            if (state.activeQuests[questId]) {
                delete state.activeQuests[questId];
                if (!state.completedQuests.includes(questId)) {
                    state.completedQuests.push(questId);
                }
                const quest = QUESTS[questId];
                if (quest) {
                    const sectId = getQuestSectId(questId);
                    if (sectId) {
                        applyAffinityChange(state, {
                            targetType: 'sect',
                            targetId: sectId,
                            delta: 5,
                            reason: '完成宗門任務',
                        });
                    }

                    const submitNpcId = quest.submitNpcId ?? quest.giverId;
                    applyAffinityChange(state, {
                        targetType: 'npc',
                        targetId: submitNpcId,
                        delta: 8,
                        reason: `完成任務：${NPC_NAME_BY_ID[submitNpcId] ?? quest.title}`,
                    });
                }
            }
        },
        adjustAffinity: (
            state,
            action: PayloadAction<{
                targetType: AffinityTargetType;
                targetId: string;
                delta: number;
                reason: string;
            }>
        ) => {
            applyAffinityChange(state, action.payload);
        },
        resetQuest: () => createInitialQuestState(),
    }
});

export const { acceptQuest, updateQuestProgress, completeQuest, adjustAffinity, resetQuest } = questSlice.actions;
export default questSlice.reducer;
