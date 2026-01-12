export interface ShopItem {
    itemId: string;
    price?: number; // Override base price if set
    stock?: number; // Infinite if undefined
}

export interface ShopData {
    id: string;
    name: string;
    description?: string;
    items: ShopItem[];
}

export const SHOPS: Record<string, ShopData> = {
    // 1. General Store
    'general_store_mortal': {
        id: 'general_store_mortal',
        name: '珍寶閣分號',
        description: '王掌櫃經營的雜貨舖，童叟無欺。',
        items: []
    },

    // 2. Village Blacksmith (Mortal Only)
    'blacksmith_village': {
        id: 'blacksmith_village',
        name: '鐵匠鋪',
        description: '只賣最基礎的裝備，但也足夠防身了。',
        items: [
            { itemId: 'novice_sword' },
            { itemId: 'novice_robe' },
            { itemId: 'wooden_shield' }, 
            { itemId: 'straw_hat' },
            { itemId: 'straw_sandals' },
            { itemId: 'wooden_charm' }
        ]
    },

    // 3. Sect Shops (Qi Refining)
    'sect_shop_sword': {
        id: 'sect_shop_sword',
        name: '靈寶閣 (劍)',
        description: '凌霄劍宗特供裝備，鋒芒畢露。',
        items: [
            { itemId: 'spirit_iron_sword' },
            { itemId: 'sword_tassel' },
            { itemId: 'focus_headband' },
            { itemId: 'azure_robe' },
            { itemId: 'light_boots' },
            { itemId: 'whetstone_ring' }
        ]
    },

    'sect_shop_beast': {
        id: 'sect_shop_beast',
        name: '靈寶閣 (體)',
        description: '萬獸山莊特供裝備，堅不可摧。',
        items: [
            { itemId: 'bear_paw_gauntlet' },
            { itemId: 'heavy_iron_shield' },
            { itemId: 'wolf_skull_helm' },
            { itemId: 'boar_skin_armor' },
            { itemId: 'battle_boots' },
            { itemId: 'vitality_beads' }
        ]
    },

    'sect_shop_mystic': {
        id: 'sect_shop_mystic',
        name: '靈寶閣 (法)',
        description: '縹緲仙宮特供裝備，靈氣盎然。',
        items: [
            { itemId: 'spirit_wood_staff' },
            { itemId: 'spirit_orb' },
            { itemId: 'mystic_crown' },
            { itemId: 'taoist_vestment' },
            { itemId: 'cloud_step_shoes' },
            { itemId: 'elemental_ring' }
        ]
    },

    // 4. Scripture Pavilion (Skill Shop)
    'skill_shop_mortal': {
        id: 'skill_shop_mortal',
        name: '藏經閣',
        description: '收藏著一些基礎的修煉法門。',
        items: [
            { itemId: 'manual_basic_breath' },
            { itemId: 'manual_iron_skin' },
            { itemId: 'manual_swift_step' },
            { itemId: 'manual_spirit_strike' }
        ]
    },

    // 5. Sect Skill Shops (Placeholders)
    'sect_skill_sword': {
        id: 'sect_skill_sword',
        name: '藏經閣 (劍)',
        description: '凌霄劍宗的高深劍典，待有緣人習之。',
        items: [
            // TODO: Add Sword Sect specific skills
        ]
    },

    'sect_skill_beast': {
        id: 'sect_skill_beast',
        name: '藏經閣 (體)',
        description: '萬獸山莊的煉體秘術，記載於獸骨之上。',
        items: [
            // TODO: Add Beast Sect specific skills
        ]
    },

    'sect_skill_mystic': {
        id: 'sect_skill_mystic',
        name: '藏經閣 (法)',
        description: '縹緲仙宮的五行法術，包羅萬象。',
        items: [
            // TODO: Add Mystic Sect specific skills
        ]
    }
};
