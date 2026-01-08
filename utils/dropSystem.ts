import { Enemy, EnemyRank, ItemInstance, ItemQuality, ItemCategory, EquipmentSlot, BaseAttributes } from '../types';
import { ITEMS } from '../data/items';

// Quality Weights by Rank
const QUALITY_WEIGHTS = {
    [EnemyRank.Common]: { [ItemQuality.Low]: 85, [ItemQuality.Medium]: 14, [ItemQuality.High]: 1, [ItemQuality.Immortal]: 0 },
    [EnemyRank.Elite]:  { [ItemQuality.Low]: 50, [ItemQuality.Medium]: 40, [ItemQuality.High]: 9, [ItemQuality.Immortal]: 1 },
    [EnemyRank.Boss]:   { [ItemQuality.Low]: 0,  [ItemQuality.Medium]: 30, [ItemQuality.High]: 60, [ItemQuality.Immortal]: 10 },
};

const QUALITY_MULTIPLIERS = {
    [ItemQuality.Low]: 1.0,
    [ItemQuality.Medium]: 1.2,
    [ItemQuality.High]: 1.4,
    [ItemQuality.Immortal]: 1.7,
};

// Simple UUID generator
const generateUUID = () => `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to pick quality based on weights
const rollQuality = (rank: EnemyRank): ItemQuality => {
    const weights = QUALITY_WEIGHTS[rank] || QUALITY_WEIGHTS[EnemyRank.Common];
    const rand = Math.random() * 100;
    
    let cumulative = 0;
    if (rand < (cumulative += weights[ItemQuality.Low])) return ItemQuality.Low;
    if (rand < (cumulative += weights[ItemQuality.Medium])) return ItemQuality.Medium;
    if (rand < (cumulative += weights[ItemQuality.High])) return ItemQuality.High;
    return ItemQuality.Immortal;
};

// Generate Affixes (Placeholder for now)
// Affix Definitions
const AFFIX_DATA = [
    { prefix: '鋒利', attr: 'attack', val: 3 },
    { prefix: '堅固', attr: 'defense', val: 2 },
    { prefix: '輕靈', attr: 'speed', val: 1 },
    { prefix: '厚重', attr: 'maxHp', val: 30 },
    { prefix: '嗜血', attr: 'attack', val: 2 },
    { prefix: '寒冰', attr: 'defense', val: 1 },
];

// Generate Affixes with Stat Bonuses
const generateAffixes = (quality: ItemQuality): { name: string, description: string, stats: Record<string, number> }[] => {
    const affixes: { name: string, description: string, stats: Record<string, number> }[] = [];
    
    let count = 0;
    if (quality === ItemQuality.Medium && Math.random() < 0.2) count = 1;
    if (quality === ItemQuality.High) count = 1;
    if (quality === ItemQuality.Immortal) count = 2;

    for(let i=0; i<count; i++) {
        const data = AFFIX_DATA[Math.floor(Math.random() * AFFIX_DATA.length)];
        
        // Scale affix value by quality slightly?
        let val = data.val;
        if (quality >= ItemQuality.High) val = Math.ceil(val * 1.5);
        if (quality === ItemQuality.Immortal) val = Math.ceil(val * 2);

        affixes.push({ 
            name: data.prefix, 
            description: `隨機詞條: ${data.prefix} (${data.attr} +${val})`,
            stats: { [data.attr]: val }
        });
    }
    return affixes;
};

export const generateDrops = (enemy: Enemy): { itemId: string, count: number, instance?: ItemInstance }[] => {
    const drops: { itemId: string, count: number, instance?: ItemInstance }[] = [];
    
    // Determine drop count
    let count = 1;
    if (enemy.rank === EnemyRank.Elite) count = Math.floor(Math.random() * 3) + 1; // 1-3
    if (enemy.rank === EnemyRank.Boss) count = Math.floor(Math.random() * 2) + 3; // 3-4

    const possibleDrops = enemy.drops;
    if (possibleDrops.length === 0) return [];

    for (let i = 0; i < count; i++) {
        // Roll for item
        const itemId = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
        const template = ITEMS[itemId];
        if (!template) continue;

        if (template.category === ItemCategory.Equipment) {
            const quality = rollQuality(enemy.rank);
            const multiplier = QUALITY_MULTIPLIERS[quality];
            
            // Generate Affixes
            const generatedAffixes = generateAffixes(quality);
            
            // Calculate Stats
            const baseStats = (template as any).stats || {};
            const finalStats: any = {};
            
            // Apply Multiplier
            for (const key in baseStats) {
                finalStats[key] = Math.ceil(baseStats[key] * multiplier);
            }

            // Apply Affix Stats
            generatedAffixes.forEach(affix => {
                Object.entries(affix.stats).forEach(([key, val]) => {
                    // @ts-ignore
                    finalStats[key] = (finalStats[key] || 0) + val;
                });
            });

            // Apply High Quality Bonus (Native)
            if (quality >= ItemQuality.High) {
               if (finalStats.attack) finalStats.attack += 1; 
               if (finalStats.defense) finalStats.defense += 1;
            }

            drops.push({
                itemId,
                count: 1,
                instance: {
                    instanceId: generateUUID(),
                    templateId: itemId,
                    quality,
                    stats: finalStats,
                    affixes: generatedAffixes.map(a => ({ name: a.name, description: a.description }))
                }
            });
        } else {
            // Consumables / Materials -> Stackable
            drops.push({ itemId, count: 1 });
        }
    }

    return drops;
};
