import { getSkillManualId } from "./items/manuals";
import { MajorRealm, ProfessionType } from "../types";
import { getFormalCoreSkills } from "./skills";

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

const getManualIds = (
  skills: ReadonlyArray<{
    id: string;
    minRealm: MajorRealm;
  }>
) =>
  skills.map((skill) => getSkillManualId(skill.id));

const filterByRealm = <T extends { minRealm: MajorRealm }>(
  skills: ReadonlyArray<T>,
  predicate: (realm: MajorRealm) => boolean
) => skills.filter((skill) => predicate(skill.minRealm));

const SHOP_CORE_SKILLS = getFormalCoreSkills({ formalSourceTier: "shop" });

const QI_SKILL_MANUALS = getManualIds(
  filterByRealm(SHOP_CORE_SKILLS, (realm) => realm <= MajorRealm.QiRefining)
);

const getSectManuals = (profession: ProfessionType) =>
  getManualIds(
    SHOP_CORE_SKILLS.filter(
      (skill) =>
        skill.profession === profession || skill.profession === ProfessionType.None
    )
  );

const SWORD_SECT_MANUALS = getSectManuals(ProfessionType.Sword);
const BODY_SECT_MANUALS = getSectManuals(ProfessionType.Body);
const MAGE_SECT_MANUALS = getSectManuals(ProfessionType.Mage);

const INHERITANCE_MANUALS = getManualIds(
  getFormalCoreSkills({ formalSourceTier: "inheritance" })
);

export const SHOPS: Record<string, ShopData> = {
    // 1. General Store
    'general_store_mortal': {
        id: 'general_store_mortal',
        name: '珍寶閣分號',
        description: '王掌櫃經營的雜貨舖，童叟無欺。',
        items: [
            { itemId: 'qi_pill' },
            { itemId: 'heal_pill' },
            { itemId: 'foundation_pill', stock: 1 }
        ]
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
        description: '收藏著凡界能接觸到的入門功法，可先購得秘卷，待符合條件後再參悟。',
        items: QI_SKILL_MANUALS.map((itemId) => ({ itemId }))
    },

    // 5. Sect Skill Shops
    'sect_skill_sword': {
        id: 'sect_skill_sword',
        name: '藏經閣 (劍)',
        description: '凌霄劍宗收藏的劍典。外門可先修基礎心法，高階殺招需歷練求取。',
        items: SWORD_SECT_MANUALS.map((itemId) => ({ itemId }))
    },

    'sect_skill_beast': {
        id: 'sect_skill_beast',
        name: '藏經閣 (體)',
        description: '萬獸山莊的煉體秘術，外門可先修護體法門，強橫秘術仍需以戰養戰。',
        items: BODY_SECT_MANUALS.map((itemId) => ({ itemId }))
    },

    'sect_skill_mystic': {
        id: 'sect_skill_mystic',
        name: '藏經閣 (法)',
        description: '縹緲仙宮的五行法術，先授基礎心法，深奧術法須在歷練中尋得。',
        items: MAGE_SECT_MANUALS.map((itemId) => ({ itemId }))
    },

    'inheritance_pavilion': {
        id: 'inheritance_pavilion',
        name: '古修傳承殿',
        description: '收束本輪已正式保留的傳承秘卷，高境界殘篇不再混入一般掉落。',
        items: INHERITANCE_MANUALS.map((itemId) => ({ itemId }))
    }
};
