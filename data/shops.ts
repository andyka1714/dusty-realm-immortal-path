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

    // 2. Blacksmith
    'blacksmith_mortal': {
        id: 'blacksmith_mortal',
        name: '鐵匠鋪',
        description: '只賣最基礎的裝備，但也足夠防身了。',
        items: [
            { itemId: 'novice_sword' },
            { itemId: 'novice_robe' },
            { itemId: 'wooden_shield' }, 
            { itemId: 'straw_hat' },
            { itemId: 'straw_sandals' },
            { itemId: 'wooden_charm' },
            
            // Qi Refining - Sword Set
            { itemId: 'spirit_iron_sword' },
            { itemId: 'sword_tassel' },
            { itemId: 'focus_headband' },
            { itemId: 'azure_robe' },
            { itemId: 'light_boots' },
            { itemId: 'whetstone_ring' },

            // Qi Refining - Body Forging Set
            { itemId: 'bear_paw_gauntlet' },
            { itemId: 'heavy_iron_shield' },
            { itemId: 'wolf_skull_helm' },
            { itemId: 'boar_skin_armor' },
            { itemId: 'battle_boots' },
            { itemId: 'vitality_beads' },

            // Qi Refining - Elemental Set
            { itemId: 'spirit_wood_staff' },
            { itemId: 'spirit_orb' },
            { itemId: 'mystic_crown' },
            { itemId: 'taoist_vestment' },
            { itemId: 'cloud_step_shoes' },
            { itemId: 'elemental_ring' }
        ]
    },

    // 3. Scripture Pavilion (Skill Shop)
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
    }
};
