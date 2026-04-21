import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveQuestState {
    progress: number;
    isReadyToComplete: boolean;
}

interface QuestState {
    activeQuests: Record<string, ActiveQuestState>;
    completedQuests: string[];
}

const initialState: QuestState = {
    activeQuests: {},
    completedQuests: []
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
            }
        },
        resetQuest: () => initialState,
    }
});

export const { acceptQuest, updateQuestProgress, completeQuest, resetQuest } = questSlice.actions;
export default questSlice.reducer;
