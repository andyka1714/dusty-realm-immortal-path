import { Action, ThunkAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { updateLastProcessedYear, updateLastWarningAge, gainAttribute } from '../slices/characterSlice';
import { addLog } from '../slices/logSlice';
import { AGE_FLAVOR_TEXTS, EPIPHANY_LOGS, STAT_NAMES, LIFESPAN_WARNINGS } from '../../data/age_content';
import { BaseAttributes, MajorRealm } from '../../types';
import { DAYS_PER_YEAR } from '../../constants';

// Thunk action to check for time-based events (Yearly + Lifespan Warnings)
export const checkTimeEvents = (): ThunkAction<void, RootState, unknown, Action<string>> => 
  (dispatch, getState) => {
    const { age, lastProcessedYear, lastWarningAge, majorRealm, lifespan, isDead, isInitialized } = getState().character;

    if (!isInitialized || isDead) return;

    // --- 1. Lifespan Warning Logic (Ported from App.tsx) ---
    const daysRemaining = lifespan - age;
    const yearsRemaining = Math.ceil(daysRemaining / DAYS_PER_YEAR);
    const lastWarning = lastWarningAge || 0;
    
    let shouldWarn = false;
    let warningType: 'warning-low' | 'warning-med' | 'warning-critical' | null = null;
    let warningMsg = "";

    // Stage 3: < 1 Year (Critical) - Every 30 days
    if (daysRemaining <= 365 && daysRemaining > 0) {
       if (age - lastWarning >= 30) {
           shouldWarn = true;
           warningType = 'warning-critical';
           const msgs = LIFESPAN_WARNINGS.critical;
           warningMsg = msgs[Math.floor(Math.random() * msgs.length)]
              .replace('${days}', Math.floor(daysRemaining).toString());
       }
    } 
    // Stage 2: <= 3 Years - Every 6 months (approx 182 days)
    else if (daysRemaining <= 3 * 365) {
       if (age - lastWarning >= 182) {
           shouldWarn = true;
           warningType = 'warning-med';
           const msgs = LIFESPAN_WARNINGS.med;
           warningMsg = msgs[Math.floor(Math.random() * msgs.length)];
       }
    }
    // Stage 1: <= 5 Years - Every 1 year (365 days)
    else if (daysRemaining <= 5 * 365) {
       if (age - lastWarning >= 365) {
           shouldWarn = true;
           warningType = 'warning-low';
           const msgs = LIFESPAN_WARNINGS.low;
           warningMsg = msgs[Math.floor(Math.random() * msgs.length)]
              .replace('${years}', yearsRemaining.toString());
       }
    }

    if (shouldWarn && warningType) {
        dispatch(addLog({ message: warningMsg, type: warningType }));
        dispatch(updateLastWarningAge(age));
    }


    // --- 2. Yearly Progression Logic ---
    const currentYear = Math.floor(age / DAYS_PER_YEAR);

    if (currentYear > lastProcessedYear) {
        
        let processed = lastProcessedYear;
        const MAX_YEARS_PROCESS = 50; // Cap to prevent offline spam
        const yearsToProcess = Math.min(currentYear - lastProcessedYear, MAX_YEARS_PROCESS);
        
        // Fast forward if gap is too huge
        if (currentYear - lastProcessedYear > MAX_YEARS_PROCESS) {
             processed = currentYear - MAX_YEARS_PROCESS;
        }

        for (let i = 0; i < yearsToProcess; i++) {
             processed++;
             const processingYear = processed;
             processSingleYear(dispatch, processingYear, majorRealm);
        }

        // Update state
        dispatch(updateLastProcessedYear(currentYear));
    }
};

const processSingleYear = (dispatch: any, year: number, realm: MajorRealm) => {
    // 1% Chance for Epiphany
    const roll = Math.random();
    
    if (roll < 0.01) {
        // --- Epiphany Event ---
        const keys = Object.keys(STAT_NAMES) as Array<keyof BaseAttributes>;
        const randomStatKey = keys[Math.floor(Math.random() * keys.length)];
        const statName = STAT_NAMES[randomStatKey];
        
        // Get Flavor Text
        const logs = EPIPHANY_LOGS[randomStatKey];
        const logText = logs[Math.floor(Math.random() * logs.length)];
        
        // Dispatch Gain
        dispatch(gainAttribute(randomStatKey));
        
        // Dispatch Log (Purple)
        dispatch(addLog({
           message: `【${year}歲】${logText} 【${statName}+1】`,
           type: 'epiphany'
        }));

    } else {
        // --- Normal Year Log ---
        const realmLogs = AGE_FLAVOR_TEXTS[realm] || AGE_FLAVOR_TEXTS[MajorRealm.Mortal];
        
        if (realmLogs && realmLogs.length > 0) {
            let text = realmLogs[Math.floor(Math.random() * realmLogs.length)];
            
            // Format Template Strings
            text = text.replace('${year}', year.toString());
            text = text.replace('${age}', year.toString());

            dispatch(addLog({
                message: `【${year}歲】${text}`,
                type: 'age'
            }));
        }
    }
};
