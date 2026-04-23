import { NPC, NPCType } from '../types';

// Standard 40x40 Map Layout
// Center: 20, 20
// North: 20, 15
// West: 15, 20
// East: 25, 20
// South: 20, 25

// --- Map 0: Xianyuan Town (仙緣鎮) ---
export const VILLAGE_NPCS: NPC[] = [
    {
        id: 'village_chief',
        name: '村長',
        symbol: '長',
        type: NPCType.Quest,
        x: 20,
        y: 15,
        description: '仙緣鎮的村長，負責引導新人。',
        questIds: ['tutorial_01', 'tutorial_02_get_sword'],
        dialogue: [
            "（村長撫鬚長嘆，目光深邃地望著遠方雲霧繚繞的山巔）",
            "又一個被天道選中的孩子嗎... 仙緣鎮已經很久沒有像你這般資質的年輕人了。",
            "修仙，修的是長生，求的是大道，但這一路上的腥風血雨，你可做好了準備？",
            "若心意已決，便去吧。莫回頭，仙路漫漫，唯有道心永恆。"
        ]
    },
    {
        id: 'village_wanbao',
        name: '萬寶閣',
        symbol: '商',
        type: NPCType.Shop, // General
        x: 15,
        y: 20,
        description: '王掌櫃經營的雜貨舖，童叟無欺。',
        shopId: 'general_store_mortal'
    },
    {
        id: 'village_blacksmith',
        name: '鐵匠鋪',
        symbol: '匠',
        type: NPCType.Shop, // Equipment
        x: 25,
        y: 20,
        description: '傳來陣陣打鐵聲，鐵匠張正揮汗如雨。',
        shopId: 'blacksmith_village'
    }
];

// --- Map 4: Northern Sword Sect (凌霄劍宗) ---
export const SWORD_SECT_NPCS: NPC[] = [
    {
        id: 'sect_sword_elder',
        name: '劍宗長老',
        symbol: '老',
        type: NPCType.Quest,
        x: 20, 
        y: 15,
        description: '劍氣內斂，不怒自威的長老。',
        questIds: ['sect_sword_join', 'sect_sword_task_01'],
        dialogue: [
            "劍者，寧折不彎。唯有大毅力者，方能登臨絕頂。",
            "若你已突破至練氣期，便是我宗門弟子。"
        ]
    },
    {
        id: 'sect_sword_patrol_captain',
        name: '巡山統領',
        symbol: '巡',
        type: NPCType.Quest,
        x: 28,
        y: 15,
        description: '負責外門巡山與劍塚歷練調度。',
        questIds: ['sect_sword_task_02', 'sect_sword_task_03', 'sect_sword_task_04'],
        dialogue: [
            '想在劍宗往上走，就別只在山門口轉圈。',
            '能不能扛事，看你拿回來的是劍核還是藉口。',
            '等你斬落元嬰守界妖劍，再去三界戰場（120）看真正的化神門檻。'
        ]
    },
    {
        id: 'sect_sword_wanbao',
        name: '萬寶閣',
        symbol: '商',
        type: NPCType.Shop, // General
        x: 15,
        y: 20,
        description: '宗門補給之處，丹藥靈材應有盡有。',
        shopId: 'general_store_mortal'
    },
    {
        id: 'sect_sword_lingbao',
        name: '靈寶閣',
        symbol: '劍',
        type: NPCType.Shop, // Equipment
        x: 25,
        y: 20,
        description: '宗門打造靈劍之地，爐火終年不熄。',
        shopId: 'sect_shop_sword'
    },
    {
        id: 'sect_sword_skills',
        name: '藏經閣',
        symbol: '經',
        type: NPCType.Shop, // Skills
        x: 20,
        y: 25,
        description: '收藏無數劍譜，是劍修的知識寶庫。',
        shopId: 'sect_skill_sword'
    }
];

// --- Map 13: Western Beast Sect (萬獸山莊) ---
export const BEAST_SECT_NPCS: NPC[] = [
    {
        id: 'sect_beast_elder',
        name: '煉體長老',
        symbol: '獸',
        type: NPCType.Quest,
        x: 20,
        y: 15,
        description: '身披獸皮，肌肉虯結，渾身散發著狂野的氣血之力。',
        questIds: ['sect_beast_join', 'sect_beast_task_01'],
        dialogue: [
            "肉身是渡世寶筏，唯有千錘百煉，方能肉身成聖。",
            "汲取萬獸精血，鑄就無堅不摧之軀，方為我輩修士之本。"
        ]
    },
    {
        id: 'sect_beast_huntmaster',
        name: '獵場監軍',
        symbol: '獵',
        type: NPCType.Quest,
        x: 28,
        y: 15,
        description: '統管山莊獵場與血戰試煉。',
        questIds: ['sect_beast_task_02', 'sect_beast_task_03', 'sect_beast_task_04'],
        dialogue: [
            '山莊不要只會吼的弟子，要的是敢進獵場的狠人。',
            '你若能把獵物拖回來，我就當你有資格再往前。',
            '元嬰妖力壓得住了，就去三界戰場（120），那裡才開始算化神。'
        ]
    },
    {
        id: 'sect_beast_wanbao',
        name: '萬寶閣',
        symbol: '商',
        type: NPCType.Shop, // General
        x: 15,
        y: 20,
        description: '交易蠻荒特產與補給丹藥。',
        shopId: 'general_store_mortal'
    },
    {
        id: 'sect_beast_lingbao',
        name: '靈寶閣',
        symbol: '寨',
        type: NPCType.Shop, // Equipment
        x: 25,
        y: 20,
        description: '懸掛著各種獸骨與獸皮打造的兵刃防具。',
        shopId: 'sect_shop_beast'
    },
    {
        id: 'sect_beast_skills',
        name: '藏經閣',
        symbol: '殿',
        type: NPCType.Shop, // Skills
        x: 20,
        y: 25,
        description: '供奉獸神圖騰，傳承煉體秘術。',
        shopId: 'sect_skill_beast'
    }
];

// --- Map 23: Eastern Mystic Sect (縹緲仙宮) ---
export const MYSTIC_SECT_NPCS: NPC[] = [
    {
        id: 'sect_mystic_elder',
        name: '傳法長老',
        symbol: '法',
        type: NPCType.Quest,
        x: 20,
        y: 15,
        description: '仙風道骨，周身靈氣繚繞。',
        questIds: ['sect_mystic_join', 'sect_mystic_task_01'],
        dialogue: [
            "道法自然，萬物皆有靈。感悟天地，方能御使五行。",
            "修仙修心，心若冰清，天塌不驚。"
        ]
    },
    {
        id: 'sect_mystic_envoy',
        name: '外務使',
        symbol: '使',
        type: NPCType.Quest,
        x: 28,
        y: 15,
        description: '負責仙宮外務巡查與靈脈回報。',
        questIds: ['sect_mystic_task_02', 'sect_mystic_task_03', 'sect_mystic_task_04'],
        dialogue: [
            '仙宮弟子若只會閉門清修，外頭的靈潮遲早會壓回山門。',
            '出去走一趟，把該平的事平掉，再來和我談真傳。',
            '元嬰既穩，就往三界戰場（120）去，化神那道門在那裡。'
        ]
    },
    {
        id: 'sect_mystic_wanbao',
        name: '萬寶閣',
        symbol: '商',
        type: NPCType.Shop, // General
        x: 15,
        y: 20,
        description: '藥香撲鼻，是煉丹師的聖地。',
        shopId: 'general_store_mortal'
    },
    {
        id: 'sect_mystic_lingbao',
        name: '靈寶閣',
        symbol: '劍',
        type: NPCType.Shop, // Equipment
        x: 25,
        y: 20,
        description: '收藏著各式法寶法器。',
        shopId: 'sect_shop_mystic'
    },
    {
        id: 'sect_mystic_skills',
        name: '藏經閣',
        symbol: '閣',
        type: NPCType.Shop, // Skills
        x: 20,
        y: 25,
        description: '雲霧中的藏書閣，記載著玄妙法術。',
        shopId: 'sect_skill_mystic'
    }
];
