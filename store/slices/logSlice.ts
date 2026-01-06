import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LogEntry } from '../../types';

interface LogState {
  logs: LogEntry[];
}

const initialState: LogState = {
  logs: [],
};

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<{ message: string; type?: LogEntry['type'] }>) => {
      const newLog: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
      
      // Keep only last 50 logs to prevent memory issues
      state.logs = [newLog, ...state.logs].slice(0, 50);
    },
    clearLogs: (state) => {
      state.logs = [];
    },
  },
});

export const { addLog, clearLogs } = logSlice.actions;
export default logSlice.reducer;