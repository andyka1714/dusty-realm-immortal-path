import { NPC, NPCType } from '../types';

// Map 0 Definition: 40x40. Center is (20, 20).
const SPAWN_X = 20;
const SPAWN_Y = 20;
const OFFSET = 5;

export const INITIAL_VILLAGE_NPCS: NPC[] = [
    {
        id: 'shop_general',
        name: '珍寶閣分號',
        symbol: '商',
        type: NPCType.Shop, // General Store
        x: SPAWN_X - OFFSET, // 15
        y: SPAWN_Y - OFFSET, // 15 (Up is negative)
        description: '王掌櫃經營的雜貨舖，童叟無欺。',
        shopId: 'general_store_mortal'
    },
    {
        id: 'shop_blacksmith',
        name: '鐵匠鋪',
        symbol: '匠',
        type: NPCType.Shop, // Equipment
        x: SPAWN_X + OFFSET, // 25
        y: SPAWN_Y - OFFSET, // 15
        description: '傳來陣陣打鐵聲，鐵匠張正揮汗如雨。',
        shopId: 'blacksmith_mortal'
    },
    {
        id: 'village_chief',
        name: '村長家',
        symbol: '長',
        type: NPCType.Quest, // Quest Giver
        x: SPAWN_X + OFFSET, // 25
        y: SPAWN_Y + OFFSET, // 25
        description: '李村長的居所，門口總是聚集著求助的村民。',
        questIds: ['tutorial_01']
    },
    {
        id: 'skill_pavilion',
        name: '藏經閣',
        symbol: '經', // Scripture
        type: NPCType.Shop, // Skill Shop
        x: SPAWN_X - OFFSET, // 15
        y: SPAWN_Y + OFFSET, // 25
        description: '村中收藏武學典籍之地。',
        shopId: 'skill_shop_mortal'
    }
];
