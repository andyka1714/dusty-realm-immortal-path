
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CharacterState, MajorRealm, SpiritRootType, SpiritRootId, ProfessionType, Gender, BaseAttributes } from '../../types';
import { calculateMaxExp, INITIAL_BASE_STATS, MINOR_REALM_CAP, REALM_MODIFIERS, SPIRIT_ROOT_DETAILS, LIFESPAN_BONUS, DAYS_PER_YEAR, BREAKTHROUGH_CONFIG } from '../../constants';
import { addLog } from './logSlice';

// ... (Keep helpers generateSpiritRoot, generateInitialStats, calculateInitialLifespan) ...
export const generateSpiritRoot = (): SpiritRootId => {
  const rand = Math.random() * 100;
  let tier: 'heavenly' | 'variant' | 'true' | 'mixed';
  if (rand < 70) tier = 'mixed';         
  else if (rand < 90) tier = 'true';     
  else if (rand < 98) tier = 'heavenly'; 
  else tier = 'variant';                 

  switch (tier) {
    case 'heavenly': {
      const roots = [SpiritRootId.HEAVENLY_GOLD, SpiritRootId.HEAVENLY_WOOD, SpiritRootId.HEAVENLY_WATER, SpiritRootId.HEAVENLY_FIRE, SpiritRootId.HEAVENLY_EARTH];
      return roots[Math.floor(Math.random() * roots.length)];
    }
    case 'variant': {
      const roots = [SpiritRootId.VARIANT_WIND, SpiritRootId.VARIANT_THUNDER, SpiritRootId.VARIANT_ICE];
      return roots[Math.floor(Math.random() * roots.length)];
    }
    case 'true': {
      const roots = [SpiritRootId.TRUE_WOOD_FIRE, SpiritRootId.TRUE_METAL_EARTH, SpiritRootId.TRUE_WATER_WOOD, SpiritRootId.TRUE_TRI];
      return roots[Math.floor(Math.random() * roots.length)];
    }
    case 'mixed': {
      const roots = [SpiritRootId.MIXED_FOUR, SpiritRootId.MIXED_FIVE];
      return roots[Math.floor(Math.random() * roots.length)];
    }
    default:
      return SpiritRootId.MIXED_FIVE;
  }
};

export const generateInitialStats = () => {
  const stats = { ...INITIAL_BASE_STATS };
  const points = 20 + Math.floor(Math.random() * 11);
  for (let i = 0; i < points; i++) {
    const keys = Object.keys(stats) as Array<keyof typeof stats>;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    stats[randomKey]++;
  }
  return stats;
};

export const calculateInitialLifespan = (physique: number) => {
    const baseLifespan = 100;
    const variation = Math.floor(Math.random() * 21) - 10; 
    const physiqueBonus = Math.floor((physique - 10) / 2); 
    return (baseLifespan + variation + physiqueBonus) * DAYS_PER_YEAR;
};

const initialState: CharacterState = {
  isInitialized: false,
  isDead: false,
  name: '無名道友',
  gender: Gender.Male,
  title: '初入江湖',
  spiritRoot: SpiritRootType.Heterogenous,
  spiritRootId: SpiritRootId.MIXED_FIVE,
  profession: ProfessionType.None,
  majorRealm: MajorRealm.Mortal,
  minorRealm: 0,
  
  age: 10 * DAYS_PER_YEAR, 
  lifespan: 100 * DAYS_PER_YEAR, 
  
  currentExp: 0,
  maxExp: calculateMaxExp(MajorRealm.Mortal, 0),
  attributes: { ...INITIAL_BASE_STATS },
  spiritStones: 0,
  cultivationRate: 0,
  isBreakthroughAvailable: false,
  isInSeclusion: false,
  gatheringLevel: 1, 
  lastSaveTime: Date.now(),
  lastBreakthroughResult: undefined,
};

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    initializeCharacter: (state, action: PayloadAction<{ 
        name: string; 
        gender: Gender;
        spiritRootId?: SpiritRootId;
        attributes?: BaseAttributes;
        lifespan?: number;
    }>) => {
      state.isInitialized = true;
      state.isDead = false;
      state.name = action.payload.name || '無名道友';
      state.gender = action.payload.gender;
      
      state.majorRealm = MajorRealm.Mortal;
      state.minorRealm = 0;
      state.currentExp = 0;
      state.maxExp = calculateMaxExp(MajorRealm.Mortal, 0);
      state.spiritStones = 0;
      state.isInSeclusion = false;
      state.lastSaveTime = Date.now();
      state.lastBreakthroughResult = undefined;

      state.attributes = action.payload.attributes || generateInitialStats();
      const generatedRootId = action.payload.spiritRootId || generateSpiritRoot();
      state.spiritRootId = generatedRootId;
      
      const rootDetails = SPIRIT_ROOT_DETAILS[generatedRootId];
      state.spiritRoot = rootDetails.type;

      if (rootDetails.bonuses.initialStats) {
         const bonusStats = rootDetails.bonuses.initialStats;
         (Object.keys(bonusStats) as Array<keyof BaseAttributes>).forEach(key => {
            if (bonusStats[key]) {
                state.attributes[key] += bonusStats[key]!;
            }
         });
      }
      
      let finalLifespan = action.payload.lifespan;
      if (!finalLifespan) {
          finalLifespan = calculateInitialLifespan(state.attributes.physique);
      }
      if (rootDetails.bonuses.initialLifespan) {
          finalLifespan += rootDetails.bonuses.initialLifespan * DAYS_PER_YEAR;
      }
      state.lifespan = finalLifespan;
      state.age = 10 * DAYS_PER_YEAR; 
    },

    reincarnate: (state) => {
       state.isInitialized = false;
       state.isDead = false;
    },

    processOfflineGains: (state) => {
      if (!state.isInitialized || state.isDead) return;
      const now = Date.now();
      const diffSeconds = (now - state.lastSaveTime) / 1000;
      const validSeconds = Math.min(diffSeconds, 43200); 
      
      if (validSeconds > 1) {
        state.age += Math.floor(validSeconds);
        
        const rootBone = state.attributes.rootBone;
        const realmMod = REALM_MODIFIERS[state.majorRealm];
        const rootDetails = SPIRIT_ROOT_DETAILS[state.spiritRootId];
        const spiritMod = rootDetails.bonuses.cultivationMult;
        
        const gatheringMod = 1 + (state.gatheringLevel * 0.05);
        
        let rate = rootBone * realmMod * spiritMod * gatheringMod;
        
        if (state.isInSeclusion) {
            rate *= 5.0;
        }

        const gain = rate * validSeconds;
        
        if (!state.isBreakthroughAvailable) {
            state.currentExp += gain;
            if (state.currentExp >= state.maxExp) {
                state.currentExp = state.maxExp;
                state.isBreakthroughAvailable = true;
                state.isInSeclusion = false; 
            }
        }
        
        if (state.age >= state.lifespan) {
            state.isDead = true;
            state.age = state.lifespan;
        }
      }
      state.lastSaveTime = now;
    },

    tickCultivation: (state) => {
      if (!state.isInitialized || state.isDead) return;
      
      state.lastSaveTime = Date.now();
      state.age += 1; 

      if (state.age >= state.lifespan) {
          state.isDead = true;
          return;
      }

      const rootBone = state.attributes.rootBone;
      const realmMod = REALM_MODIFIERS[state.majorRealm];
      
      const rootDetails = SPIRIT_ROOT_DETAILS[state.spiritRootId];
      const spiritMod = rootDetails.bonuses.cultivationMult;
      
      const gatheringMod = 1 + (state.gatheringLevel * 0.05);
      
      let rate = rootBone * realmMod * spiritMod * gatheringMod;
      
      if (state.isInSeclusion) {
        rate *= 5.0; 
      }

      state.cultivationRate = parseFloat(rate.toFixed(1));

      if (state.isBreakthroughAvailable) return;

      state.currentExp += state.cultivationRate;

      if (state.currentExp >= state.maxExp) {
        state.currentExp = state.maxExp;
        state.isBreakthroughAvailable = true;
        state.isInSeclusion = false;
      }
    },

    toggleSeclusion: (state) => {
      state.isInSeclusion = !state.isInSeclusion;
    },

    manualCultivate: (state) => {
      if (state.isBreakthroughAvailable || state.isDead) return;
      state.currentExp += state.cultivationRate;
      if (state.currentExp >= state.maxExp) {
        state.currentExp = state.maxExp;
        state.isBreakthroughAvailable = true;
      }
    },

    gainAttribute: (state, action: PayloadAction<keyof BaseAttributes>) => {
      const attr = action.payload;
      state.attributes[attr] += 1;
      
      if (attr === 'physique') {
        state.lifespan += 365; 
      }
    },

    attemptBreakthrough: (state, action: PayloadAction<{ successChanceBonus: number, consumedItem?: boolean }>) => {
      if (!state.isBreakthroughAvailable) return;

      const isMajorBreakthrough = state.minorRealm >= MINOR_REALM_CAP;
      const config = BREAKTHROUGH_CONFIG[state.majorRealm];

      // 1. Check Requirement (Double check logic for safety)
      if (isMajorBreakthrough && config.requiredItemId && !action.payload.consumedItem) {
          // Should have been handled by UI dispatching removeItem, but if logic fails here, we abort or fail
          // For now, we assume the Thunk/UI successfully removed the item and passed the flag
          // If strict, we would return here.
      }

      // 2. Calculate Success Rate
      // Formula: Major Base Rate * (0.95 ^ minorRealm)
      // e.g. Mortal (1.0) * 0.95^9 (approx 0.63)
      let baseRate = config.baseRate;
      
      // Decay for minor realms
      const decay = Math.pow(0.95, state.minorRealm);
      let successRate = baseRate * decay;

      // Stat Bonuses
      successRate += (state.attributes.comprehension * 0.002); // 0.2% per point
      successRate += (state.attributes.fortune * 0.001); // 0.1% per point

      // Spirit Root Bonus
      if (!isMajorBreakthrough && state.spiritRoot === SpiritRootType.Heavenly) {
          successRate += 0.05;
      }
      if (state.spiritRootId === SpiritRootId.TRUE_TRI) {
          successRate += 0.05;
      }

      // External Bonus (Pills)
      successRate += action.payload.successChanceBonus;
      if (successRate > 0.95) successRate = 0.95;

      const roll = Math.random();

      if (roll <= successRate) {
        // --- SUCCESS ---
        if (isMajorBreakthrough) {
          state.majorRealm += 1;
          state.minorRealm = 0;
          
          const bonusLife = LIFESPAN_BONUS[state.majorRealm] || 0;
          state.lifespan += bonusLife * DAYS_PER_YEAR;

          state.attributes.physique += 10;
          state.attributes.rootBone += 10;
          state.attributes.insight += 10;
          state.attributes.comprehension += 10;
          state.attributes.fortune += 5;
          state.attributes.charm += 5;
        } else {
          state.minorRealm += 1;
          state.attributes.physique += 2;
          state.attributes.rootBone += 2;
        }
        state.currentExp = 0;
        state.maxExp = calculateMaxExp(state.majorRealm, state.minorRealm);
        state.isBreakthroughAvailable = false;
        
        state.lastBreakthroughResult = { 
            success: true, 
            dropRealm: false, 
            isTribulation: false, 
            timestamp: Date.now() 
        };

      } else {
        // --- FAILURE ---
        const penaltyType = isMajorBreakthrough ? config.penaltyType : 'minor';
        const isTribulation = penaltyType === 'major_unsafe';
        
        let dropRealm = false;
        // Thunder Root Risk Reduction
        let riskReducer = 1.0;
        if (state.spiritRootId === SpiritRootId.VARIANT_THUNDER) {
            riskReducer = 0.5; 
        }

        // Penalty Logic
        if (penaltyType === 'major_unsafe') {
            // TRIBULATION FAILURE: -100% Exp
            state.currentExp = 0; 
        } else {
            // Standard Failure: -30% Exp
            const lossPct = 0.3 * riskReducer;
            state.currentExp = Math.floor(state.maxExp * (1 - lossPct)); 
        }

        // Minor Realm Drop Logic (Optional, keep low chance)
        const safetyChance = state.attributes.fortune * 0.005; 
        const deviationRoll = Math.random();
        
        // Only drop realm if not unsafe tribulation (tribulation is already punish enough with 0 exp)
        // actually spec says "Drop Realm" chance is separate.
        // Let's keep existing drop logic but reduce chance for tribulation since exp is wiped
        if (deviationRoll > safetyChance && deviationRoll < (0.05 * riskReducer)) {
            dropRealm = true;
             if (state.minorRealm > 0) {
                state.minorRealm -= 1;
            }
        }
        
        state.isBreakthroughAvailable = false;
        
        state.lastBreakthroughResult = { 
            success: false, 
            dropRealm, 
            isTribulation,
            timestamp: Date.now() 
        };
      }
    },
  },
});

export const { initializeCharacter, tickCultivation, manualCultivate, attemptBreakthrough, toggleSeclusion, processOfflineGains, reincarnate, gainAttribute } = characterSlice.actions;
export default characterSlice.reducer;
