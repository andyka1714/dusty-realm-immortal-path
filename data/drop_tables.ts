
import { MajorRealm, EnemyRank, Enemy } from '../types';

export const SPIRIT_STONE_RANGES: Record<MajorRealm, Record<EnemyRank, [number, number]>> = {
    [MajorRealm.Mortal]: { // Low Grade
        [EnemyRank.Common]: [1, 5],
        [EnemyRank.Elite]: [10, 20],
        [EnemyRank.Boss]: [50, 100],
    },
    [MajorRealm.QiRefining]: { // Low Grade (High end)
        [EnemyRank.Common]: [10, 20],
        [EnemyRank.Elite]: [50, 80],
        [EnemyRank.Boss]: [200, 500],
    },
    [MajorRealm.Foundation]: { // Transition to Medium (1000+)
        [EnemyRank.Common]: [50, 100],
        [EnemyRank.Elite]: [200, 400],
        [EnemyRank.Boss]: [1000, 2000], // 1-2 Medium
    },
    [MajorRealm.GoldenCore]: { // Pure Medium
        [EnemyRank.Common]: [1000, 2000], // 1-2 Medium
        [EnemyRank.Elite]: [3000, 5000], // 3-5 Medium
        [EnemyRank.Boss]: [15000, 25000], // 15-25 Medium
    },
    [MajorRealm.NascentSoul]: { // Medium (High end)
        [EnemyRank.Common]: [3000, 5000], // 3-5 Medium
        [EnemyRank.Elite]: [10000, 20000], // 10-20 Medium
        [EnemyRank.Boss]: [100000, 200000], // 100-200 Medium
    },
    [MajorRealm.SpiritSevering]: { // Transition to High (1M+)
        [EnemyRank.Common]: [50000, 80000], // 50-80 Medium
        [EnemyRank.Elite]: [200000, 300000], // 200-300 Medium
        [EnemyRank.Boss]: [1000000, 2000000], // 1-2 High
    },
    [MajorRealm.VoidRefining]: { // High
        [EnemyRank.Common]: [200000, 400000], // 200-400 Medium 
        [EnemyRank.Elite]: [800000, 1500000], // 0.8-1.5 High
        [EnemyRank.Boss]: [5000000, 10000000], // 5-10 High
    },
    [MajorRealm.Fusion]: { // High
        [EnemyRank.Common]: [1000000, 2000000], // 1-2 High
        [EnemyRank.Elite]: [5000000, 8000000], // 5-8 High
        [EnemyRank.Boss]: [30000000, 50000000], // 30-50 High
    },
    [MajorRealm.Mahayana]: { // High (End)
        [EnemyRank.Common]: [5000000, 8000000], // 5-8 High
        [EnemyRank.Elite]: [20000000, 30000000], // 20-30 High
        [EnemyRank.Boss]: [100000000, 200000000], // 100-200 High
    },
    [MajorRealm.Tribulation]: { // Transition to Ultimate (1B+)
        [EnemyRank.Common]: [20000000, 40000000], // 20-40 High
        [EnemyRank.Elite]: [100000000, 200000000], // 100-200 High
        [EnemyRank.Boss]: [1000000000, 2000000000], // 1-2 Ultimate
    },
    [MajorRealm.Immortal]: { // Ultimate
        [EnemyRank.Common]: [500000000, 1000000000], // 0.5-1 Ult
        [EnemyRank.Elite]: [3000000000, 5000000000], // 3-5 Ult
        [EnemyRank.Boss]: [20000000000, 50000000000], // 20-50 Ult
    },
    [MajorRealm.ImmortalEmperor]: { // Ultimate (End)
        [EnemyRank.Common]: [10000000000, 20000000000], // 10-20 Ult
        [EnemyRank.Elite]: [50000000000, 100000000000], // 50-100 Ult
        [EnemyRank.Boss]: [500000000000, 1000000000000], // 500-1000 Ult
    },
};

export interface DropItem {
    itemId: string;
    rate: number; // 0-1
    min: number;
    max: number;
}

export const getSpiritStoneDrop = (realm: MajorRealm, rank: EnemyRank): number => {
    const range = SPIRIT_STONE_RANGES[realm]?.[rank];
    if (!range) return 0;
    const [min, max] = range;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getDropRewards = (enemy: Enemy): { spiritStones: number } => {
    const spiritStones = getSpiritStoneDrop(enemy.realm, enemy.rank);
    return { spiritStones };
};
