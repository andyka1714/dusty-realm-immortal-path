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

export const TRI_REALM_BATTLEFIELD_NPCS: NPC[] = [
    {
        id: 'world_sword_battlefield_envoy',
        name: '劍宗界令使',
        symbol: '令',
        type: NPCType.Quest,
        x: 70,
        y: 64,
        description: '凌霄劍宗派駐三界戰場的界令使，負責確認劍修是否能越過化神戰線。',
        questIds: ['sect_sword_world_chapter_01'],
        dialogue: [
            '三界戰場（120）只是一道門，真正的劍路要穿過隕仙深淵（121）再去時光長河（130）。',
            '完成劍宗元嬰任務後，帶著你的劍意往北走，別讓戰場把你困成守門人。'
        ]
    },
    {
        id: 'world_beast_battlefield_envoy',
        name: '獸莊血旗使',
        symbol: '旗',
        type: NPCType.Quest,
        x: 75,
        y: 72,
        description: '萬獸山莊的血旗使，守在三界戰場邊線替體修標出深淵血路。',
        questIds: ['sect_beast_world_chapter_01'],
        dialogue: [
            '三界戰場（120）的血味還不夠深，隕仙深淵（121）才會驗出你的肉身底盤。',
            '若你已走完獸莊元嬰試煉，就把血旗帶到時光長河（130），讓煉虛路知道你不是過客。'
        ]
    },
    {
        id: 'world_mystic_battlefield_envoy',
        name: '仙宮星牒使',
        symbol: '牒',
        type: NPCType.Quest,
        x: 80,
        y: 64,
        description: '縹緲仙宮派出的星牒使，記錄三界戰場到煉虛節點的靈機流向。',
        questIds: ['sect_mystic_world_chapter_01'],
        dialogue: [
            '三界戰場（120）的星牒已開，下一頁落在隕仙深淵（121）的霧線之下。',
            '完成仙宮元嬰任務後，順著星牒去時光長河（130），那裡才有煉虛前的第一個答案。'
        ]
    }
];

export const FALLEN_ABYSS_NPCS: NPC[] = [
    {
        id: 'world_sword_abyss_witness',
        name: '深淵劍痕客',
        symbol: '痕',
        type: NPCType.Info,
        x: 72,
        y: 78,
        description: '守著隕仙深淵劍痕的散修，能辨識凌霄劍意是否仍然筆直。',
        dialogue: [
            '隕仙深淵（121）的黑霧會折斷猶豫的劍，凌霄劍宗的人若要過去，劍心不能停在戰場。',
            '往北去時光長河（130）前，先記住這裡的裂痕，它會提醒你煉虛不是逃離，而是定住虛空。'
        ]
    },
    {
        id: 'world_beast_abyss_witness',
        name: '深淵骨鼓客',
        symbol: '鼓',
        type: NPCType.Info,
        x: 78,
        y: 78,
        description: '在隕仙深淵敲骨鼓的萬獸山莊舊識，用鼓聲測試體修氣血。',
        dialogue: [
            '隕仙深淵（121）吃的是怯意，萬獸山莊弟子若氣血散了，還沒到煉虛就會被黑霧拖空。',
            '扛住這面骨鼓，再往時光長河（130）去，把肉身節奏帶進煉虛。'
        ]
    },
    {
        id: 'world_mystic_abyss_witness',
        name: '深淵觀星客',
        symbol: '星',
        type: NPCType.Info,
        x: 84,
        y: 78,
        description: '在隕仙深淵霧線下觀星的仙宮修士，替法修校準神識路標。',
        dialogue: [
            '隕仙深淵（121）的霧會遮住神識，縹緲仙宮弟子要用星位記路，不能只靠靈力硬探。',
            '星線北折便是時光長河（130），到那裡再把化神所得推成煉虛章法。'
        ]
    }
];

export const VOID_RIVER_NPCS: NPC[] = [
    {
        id: 'world_sword_void_river_witness',
        name: '長河劍碑守',
        symbol: '碑',
        type: NPCType.Quest,
        x: 78,
        y: 84,
        description: '守著時光長河劍碑的老修士，替凌霄劍宗確認煉虛前的劍路是否接上。',
        dialogue: [
            '你從三界戰場（120）穿過隕仙深淵（121），還能把凌霄劍宗的劍意帶到時光長河（130），這條世界章節才算接上。',
            '往後煉虛節點會反覆撕開舊劍痕，記得用它們校準你的本命劍。'
        ]
    },
    {
        id: 'world_beast_void_river_witness',
        name: '長河血骨守',
        symbol: '骨',
        type: NPCType.Quest,
        x: 84,
        y: 84,
        description: '守在時光長河血骨樁旁的體修，替萬獸山莊確認肉身路是否能踏入煉虛。',
        dialogue: [
            '你把萬獸山莊的血旗從三界戰場（120）扛過隕仙深淵（121），又送到時光長河（130），肉身路沒有斷。',
            '煉虛會拆散氣血與時間，你要用骨樁把每一次呼吸重新釘回身體。'
        ]
    },
    {
        id: 'world_mystic_void_river_witness',
        name: '長河星牒守',
        symbol: '河',
        type: NPCType.Quest,
        x: 90,
        y: 84,
        description: '守著時光長河星牒的仙宮修士，替法修把化神路標整理成煉虛章法。',
        dialogue: [
            '你讓縹緲仙宮的星牒穿過三界戰場（120）與隕仙深淵（121），最後落在時光長河（130），神識路標已成。',
            '煉虛不是把術法變大，而是讓每道術式都能在虛空裡找到回聲。'
        ]
    }
];

export const SACRED_CITY_NPCS: NPC[] = [
    {
        id: 'world_sword_sacred_city_envoy',
        name: '聖城劍令使',
        symbol: '劍',
        type: NPCType.Quest,
        x: 72,
        y: 70,
        description: '凌霄劍宗派到萬法聖城的劍令使，替劍修確認合體後的宗門路線。',
        questIds: ['sect_sword_world_chapter_02'],
        dialogue: [
            '凌霄劍宗在萬法聖城（140）的劍令已成，但後段世界章節要走到無盡海（150）才算接上。',
            '若你已完成第一段世界章節，就帶著聖城劍令北上，讓宗門路線被海潮記住。'
        ]
    },
    {
        id: 'world_beast_sacred_city_envoy',
        name: '聖城血潮使',
        symbol: '血',
        type: NPCType.Quest,
        x: 80,
        y: 74,
        description: '萬獸山莊留在萬法聖城的血潮使，替體修標出前往界海的肉身路。',
        questIds: ['sect_beast_world_chapter_02'],
        dialogue: [
            '萬獸山莊的宗門路線在萬法聖城（140）只完成一半，後段世界章節要進無盡海（150）受壓。',
            '完成第一段世界章節後，把血潮印扛出去，別讓城規把你的氣血磨平。'
        ]
    },
    {
        id: 'world_mystic_sacred_city_envoy',
        name: '聖城星潮使',
        symbol: '星',
        type: NPCType.Quest,
        x: 88,
        y: 70,
        description: '縹緲仙宮駐守萬法聖城的星潮使，替法修校準通往海天的神識路標。',
        questIds: ['sect_mystic_world_chapter_02'],
        dialogue: [
            '縹緲仙宮在萬法聖城（140）重排星位，但後段世界章節必須送到無盡海（150）才能穩住。',
            '若你的第一段世界章節已完成，就帶星潮牒北上，讓宗門路線跟上海霧的節奏。'
        ]
    }
];

export const ENDLESS_SEA_NPCS: NPC[] = [
    {
        id: 'world_sword_endless_sea_witness',
        name: '界海劍潮守',
        symbol: '潮',
        type: NPCType.Quest,
        x: 86,
        y: 94,
        description: '立在無盡海潮線上的劍修，替凌霄劍宗確認聖城劍令是否抵達界海。',
        dialogue: [
            '凌霄劍宗的聖城劍令已從萬法聖城（140）抵達無盡海（150），後段世界章節終於聽見潮聲。',
            '宗門路線到這裡不再只是劍痕，而是能被海天反覆淬鍊的鋒線。'
        ]
    },
    {
        id: 'world_beast_endless_sea_witness',
        name: '界海血骨守',
        symbol: '骨',
        type: NPCType.Quest,
        x: 94,
        y: 100,
        description: '守在無盡海礁骨旁的體修，替萬獸山莊確認血潮印是否承住海壓。',
        dialogue: [
            '萬獸山莊的血潮印從萬法聖城（140）壓到無盡海（150），後段世界章節已把氣血釘進潮線。',
            '宗門路線走到這裡，就要讓每一次鍛體都能承受界海的回撞。'
        ]
    },
    {
        id: 'world_mystic_endless_sea_witness',
        name: '界海星蓮守',
        symbol: '蓮',
        type: NPCType.Quest,
        x: 102,
        y: 94,
        description: '在無盡海霧中守星蓮的仙宮修士，替縹緲仙宮確認星潮牒是否成章。',
        dialogue: [
            '縹緲仙宮的星潮牒自萬法聖城（140）落到無盡海（150），後段世界章節已經映出海天星位。',
            '宗門路線到此才會知道，神識不是離開潮霧，而是在潮霧中找到可重複的星軌。'
        ]
    }
];

export const TRIBULATION_PLAINS_NPCS: NPC[] = [
    {
        id: 'local_tribulation_cloud_scout',
        name: '劫雲巡候',
        symbol: '候',
        type: NPCType.Quest,
        x: 74,
        y: 108,
        description: '在劫雲荒原（160）巡記雷紋的散修，提醒各路宗門不要只盯著 Boss 忽略雷路變化。',
        questIds: ['local_tribulation_cloud_watch'],
        dialogue: [
            '劫雲荒原（160）每天都在移位，通用修士先看雲脊，再決定要不要穿過天刑迴廊。',
            '凌霄劍宗、萬獸山莊、縹緲仙宮都會借這片荒原測 route 後段，但雷雲本身不偏任何一宗。'
        ]
    },
    {
        id: 'world_sword_tribulation_envoy',
        name: '劫雲劍盟使',
        symbol: '盟',
        type: NPCType.Quest,
        x: 88,
        y: 92,
        description: '凌霄劍宗派駐劫雲荒原的劍盟使，替劍修把無盡海後續推向接引仙殿。',
        questIds: ['sect_sword_world_chapter_03'],
        dialogue: [
            '凌霄劍宗的界海劍潮已過，v3 後段世界章要從劫雲荒原（160）往接引仙殿（170）送帝劍殘痕。',
            '若你已完成無盡海章節，就把劍盟殘痕帶上雷路，讓宗門路線能被仙殿認出。'
        ]
    },
    {
        id: 'world_beast_tribulation_envoy',
        name: '劫雲帝血使',
        symbol: '血',
        type: NPCType.Quest,
        x: 98,
        y: 100,
        description: '萬獸山莊派駐劫雲荒原的帝血使，測量體修能否把海壓推進仙階。',
        questIds: ['sect_beast_world_chapter_03'],
        dialogue: [
            '萬獸山莊的血潮印已被無盡海壓住，v3 後段世界章要在劫雲荒原（160）重新點燃帝血獸脈。',
            '帶著帝血骨印去接引仙殿（170），讓仙殿知道這條肉身路不是靠運氣撐上來的。'
        ]
    },
    {
        id: 'world_mystic_tribulation_envoy',
        name: '劫雲星詔使',
        symbol: '詔',
        type: NPCType.Quest,
        x: 108,
        y: 92,
        description: '縹緲仙宮派駐劫雲荒原的星詔使，替法修把無盡海星潮推入仙殿觀測。',
        questIds: ['sect_mystic_world_chapter_03'],
        dialogue: [
            '縹緲仙宮的星潮牒已映過無盡海，v3 後段世界章要從劫雲荒原（160）把星詔送上接引仙殿（170）。',
            '若你已完成界海星潮，就順著劫雲星線北上，別讓海霧之後的星位斷掉。'
        ]
    },
    {
        id: 'local_tribulation_material_diviner',
        name: '雷爐辨材師',
        symbol: '材',
        type: NPCType.Quest,
        x: 118,
        y: 116,
        description: '在劫雲荒原（160）辨識 Workshop 材料線索的工坊修士，能說明雷火如何牽出宗門 route 材料。',
        questIds: ['local_tribulation_material_clue'],
        dialogue: [
            '雷火打下來時，凌霄劍星鋼會先亮，萬獸血骨殘材會滲血，縹緲星魂蓮則會在雲隙裡收光。',
            '這三種材料不是裝飾；後續 Workshop 高階丹方與器方會把它們全部吃回去。'
        ]
    }
];

export const IMMORTAL_ASCENSION_NPCS: NPC[] = [
    {
        id: 'local_immortal_registry_keeper',
        name: '仙籍錄事',
        symbol: '錄',
        type: NPCType.Quest,
        x: 72,
        y: 92,
        description: '在接引仙殿（170）登錄飛昇者來源的錄事，負責把通用仙籍與宗門 route 記錄分開。',
        questIds: ['local_immortal_registry_check'],
        dialogue: [
            '接引仙殿（170）不是終點，只是把凡界、宗門與仙階身份重新登記。',
            '若你帶著凌霄劍宗、萬獸山莊或縹緲仙宮的 route 記憶上來，仙籍會把它標在不同欄位。'
        ]
    },
    {
        id: 'world_sword_immortal_witness',
        name: '接引帝劍守',
        symbol: '帝',
        type: NPCType.Quest,
        x: 88,
        y: 102,
        description: '守在接引仙殿劍柱旁的凌霄劍修，替宗門確認帝劍殘痕是否進入仙階。',
        dialogue: [
            '凌霄劍宗的帝劍殘痕已從劫雲荒原（160）送到接引仙殿（170），v3 後段世界章終於跨過雷路。',
            '往後仙人境的劍盟回聲會讀取這段宗門路線，不再只靠通用仙詔推進。'
        ]
    },
    {
        id: 'world_beast_immortal_witness',
        name: '接引帝血守',
        symbol: '脈',
        type: NPCType.Quest,
        x: 100,
        y: 110,
        description: '守在接引仙殿血脈台旁的萬獸山莊體修，替肉身路線確認帝血獸脈。',
        dialogue: [
            '萬獸山莊的帝血骨印已從劫雲荒原（160）抵達接引仙殿（170），v3 後段世界章把海壓推成仙階血脈。',
            '後續仙人境獸脈回聲會記住這條路，體修不必再只靠通用軍庫補進度。'
        ]
    },
    {
        id: 'world_mystic_immortal_witness',
        name: '接引星詔守',
        symbol: '星',
        type: NPCType.Quest,
        x: 112,
        y: 102,
        description: '守在接引仙殿星臺上的縹緲仙宮修士，替法修確認星詔是否成章。',
        dialogue: [
            '縹緲仙宮的星詔已從劫雲荒原（160）落到接引仙殿（170），v3 後段世界章能被仙階觀測。',
            '往後仙人境星庭回聲會沿著這段宗門路線展開，神識材料來源也會更清楚。'
        ]
    },
    {
        id: 'local_immortal_material_archivist',
        name: '仙材案牘師',
        symbol: '案',
        type: NPCType.Quest,
        x: 126,
        y: 116,
        description: '整理接引仙殿（170）仙材案牘的工坊書吏，標出帝劍、帝血與星詔材料如何進入高階丹方與帝兵。',
        questIds: ['local_immortal_material_clue'],
        dialogue: [
            '帝劍殘痕、帝血骨印與星詔牒都會在接引仙殿（170）留下案底，工坊看的是能不能入高階丹方與帝兵火候。',
            '若只把它們當章節獎勵，後面的 Workshop sink 就會斷；把案牘記清，才知道材料從哪裡來、往哪裡去。'
        ]
    }
];

export const GUIXU_RIFT_NPCS: NPC[] = [
    {
        id: 'local_guixu_rift_cartographer',
        name: '歸墟界圖師',
        symbol: '圖',
        type: NPCType.Quest,
        x: 76,
        y: 96,
        description: '在歸墟裂界（182）描摹裂界邊界的界圖師，替仙帝前夕玩家標出通用終盤路徑。',
        questIds: ['local_guixu_rift_chart'],
        dialogue: [
            '歸墟裂界（182）不是只給你刷怪的裂縫，它會把前面所有宗門 route 的殘響壓成終盤線索。',
            '先看裂界風向，再決定要去太初外環還是鴻蒙道宮；別讓終盤只剩一條直線。'
        ]
    },
    {
        id: 'local_guixu_sword_echo',
        name: '歸墟劍星回聲',
        symbol: '劍',
        type: NPCType.Info,
        x: 96,
        y: 88,
        description: '歸墟裂界（182）中殘留的凌霄劍宗回聲，提示凌霄劍星鋼仍會被終盤帝兵追溯。',
        dialogue: [
            '凌霄劍星鋼在歸墟裂界（182）會被壓成更硬的劍骨，劍修終盤器方會反覆追溯這條 route。'
        ]
    },
    {
        id: 'local_guixu_beast_echo',
        name: '歸墟血骨回聲',
        symbol: '骨',
        type: NPCType.Info,
        x: 104,
        y: 104,
        description: '歸墟裂界（182）中殘留的萬獸山莊回聲，提示萬獸血骨殘材可承受終盤肉身火候。',
        dialogue: [
            '萬獸血骨殘材在歸墟裂界（182）會被反覆壓實，體修終盤器方要的不是名字，是能承壓的骨相。'
        ]
    },
    {
        id: 'local_guixu_mystic_echo',
        name: '歸墟星蓮回聲',
        symbol: '蓮',
        type: NPCType.Info,
        x: 112,
        y: 88,
        description: '歸墟裂界（182）中殘留的縹緲仙宮回聲，提示縹緲星魂蓮可穩住終盤丹火。',
        dialogue: [
            '縹緲星魂蓮在歸墟裂界（182）會吸住碎界星砂，法修終盤丹方需要它把火候收回神識。'
        ]
    },
    {
        id: 'local_guixu_material_forgemaster',
        name: '歸墟終盤爐師',
        symbol: '爐',
        type: NPCType.Quest,
        x: 124,
        y: 112,
        description: '守著歸墟裂界（182）終盤爐口的 Workshop 爐師，說明凌霄劍星鋼、萬獸血骨殘材與縹緲星魂蓮如何合成終盤 sink。',
        questIds: ['local_guixu_material_clue'],
        dialogue: [
            '終盤爐口不吃空話，只吃凌霄劍星鋼、萬獸血骨殘材與縹緲星魂蓮。',
            '到了歸墟裂界（182），這三路宗門材料會被壓成終盤 Workshop sink；缺一味，帝兵和仙品丹都會失衡。'
        ]
    }
];

export const WORLD_STORY_NPCS: NPC[] = [
    ...TRI_REALM_BATTLEFIELD_NPCS,
    ...FALLEN_ABYSS_NPCS,
    ...VOID_RIVER_NPCS,
    ...SACRED_CITY_NPCS,
    ...ENDLESS_SEA_NPCS,
    ...TRIBULATION_PLAINS_NPCS,
    ...IMMORTAL_ASCENSION_NPCS,
    ...GUIXU_RIFT_NPCS
];
