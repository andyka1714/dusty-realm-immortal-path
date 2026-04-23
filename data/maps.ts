import { MapData, MajorRealm, ElementType, Enemy, EnemyRank } from '../types';
import { BESTIARY } from './enemies';
import {
    BEAST_SECT_NPCS,
    FALLEN_ABYSS_NPCS,
    MYSTIC_SECT_NPCS,
    SWORD_SECT_NPCS,
    TRI_REALM_BATTLEFIELD_NPCS,
    VILLAGE_NPCS,
    VOID_RIVER_NPCS
} from './npcs';

// Raw Map Data Interface
interface RawPortal {
    target_id: number;
    dir: string;
    pos: [number, number];
}

interface RawMap {
    id: number;
    name: string;
    realm: string;
    size: [number, number];
    pos: [number, number];
    theme: string;
    description: string;
    portals: RawPortal[];
    boss: { name: string, pos: [number, number] } | null;
}

// Realm Chinese to Enum Mapping
const REALM_MAPPING: Record<string, MajorRealm> = {
    "凡人": MajorRealm.Mortal,
    "練氣": MajorRealm.QiRefining,
    "築基": MajorRealm.Foundation,
    "金丹": MajorRealm.GoldenCore,
    "元嬰": MajorRealm.NascentSoul,
    "化神": MajorRealm.SpiritSevering,
    "煉虛": MajorRealm.VoidRefining,
    "合體": MajorRealm.Fusion,
    "大乘": MajorRealm.Mahayana,
    "渡劫": MajorRealm.Tribulation,
    "仙人": MajorRealm.Immortal,
    "仙帝": MajorRealm.ImmortalEmperor
};

// Full Map Configuration (62 Maps)
// Layout: Center(0), West(-2), East(2).
// Y-Levels: Town(0), Mortal(1-3), Sect(4), Qi(5-7), Fdn(8-10), GC(11-13), NS(14-16), SS(17-18)...
const RAW_MAPS_V60: RawMap[] = [
    // --- Starting Area ---
    {
        id: 0,
        name: "仙緣鎮",
        realm: "凡人",
        size: [40, 40],
        pos: [0, 0],
        theme: "Center",
        description: "紅塵滾滾，人聲鼎沸。這裡是所有修仙者夢想開始的地方。",
        portals: [
            { target_id: 1, dir: "North", pos: [20, 0] },
            { target_id: 10, dir: "West", pos: [0, 20] },
            { target_id: 20, dir: "East", pos: [40, 20] }
        ],
        boss: null
    },

    // --- North Path (Sword) x=0 ---
    // Mortal Phase (y=1-3)
    {
        id: 1, name: "北郊荒徑", realm: "凡人", size: [80, 80], pos: [0, 1], theme: "North",
        description: "離開城鎮向北的荒涼小徑，寒風漸起。",
        portals: [{ target_id: 0, dir: "South", pos: [40, 80] }, { target_id: 2, dir: "North", pos: [40, 0] }], boss: null
    },
    {
        id: 2, name: "劍門古道", realm: "凡人", size: [80, 80], pos: [0, 2], theme: "North",
        description: "兩側石壁如削，傳說曾有仙人試劍於此。",
        portals: [{ target_id: 1, dir: "South", pos: [40, 80] }, { target_id: 3, dir: "North", pos: [40, 0] }], boss: null
    },
    {
        id: 3, name: "凌霄山腳", realm: "凡人", size: [80, 80], pos: [0, 3], theme: "North",
        description: "抬頭仰望，可見雲端之上的宏偉宗門。",
        portals: [{ target_id: 2, dir: "South", pos: [40, 80] }, { target_id: 4, dir: "North", pos: [40, 0] }],
        boss: { name: "守山靈虎", pos: [40, 40] }
    },
    // Sect (y=4)
    {
        id: 4, name: "凌霄劍宗", realm: "練氣", size: [40, 40], pos: [0, 4], theme: "Sect",
        description: "群峰如劍直插雲霄，無數飛劍化作流光環繞主峰。宗門大殿懸浮於九天之上，凜冽的劍意令方圓百里妖邪退避。",
        portals: [
            { target_id: 3, dir: "South", pos: [20, 40] }, 
            { target_id: 5, dir: "West", pos: [0, 20] },
            { target_id: 6, dir: "East", pos: [40, 20] },
            { target_id: 7, dir: "North", pos: [20, 0] }
        ], 
        boss: null
    },
    // Qi Phase (y=5-7)
    {
        id: 5, name: "試劍台", realm: "練氣", size: [100, 100], pos: [-1, 5], theme: "North",
        description: "宗門弟子切磋之地，石台染血。",
        portals: [
            { target_id: 4, dir: "South", pos: [50, 100] }, 
            { target_id: 7, dir: "East", pos: [100, 50] },
            { target_id: 31, dir: "North", pos: [50, 0] }
        ], 
        boss: null
    },
    {
        id: 6, name: "藏劍谷", realm: "練氣", size: [100, 100], pos: [1, 5], theme: "North",
        description: "谷中插滿了廢棄的兵刃，每一把劍都有它的故事。",
        portals: [
            { target_id: 4, dir: "South", pos: [50, 100] }, 
            { target_id: 7, dir: "West", pos: [0, 50] },
            { target_id: 30, dir: "North", pos: [50, 0] }
        ], 
        boss: null
    },
    {
        id: 7, name: "萬劍塚", realm: "練氣", size: [100, 100], pos: [0, 5], theme: "North",
        description: "劍意最盛之地，也是最凶險之地。",
        portals: [
            { target_id: 4, dir: "South", pos: [50, 100] }, 
            { target_id: 5, dir: "West", pos: [0, 50] },
            { target_id: 6, dir: "East", pos: [100, 50] },
            { target_id: 32, dir: "North", pos: [50, 0] }
        ], 
        boss: { name: "萬劍劍意", pos: [50, 50] }
    },

    // --- West Path (Body) x=-2 ---
    // Mortal Phase (y=1-3)
    {
        id: 10, name: "西郊密林", realm: "凡人", size: [80, 80], pos: [-1, 0], theme: "West",
        description: "城鎮西側的茂密樹林，已能聽到遠處的獸吼。",
        portals: [{ target_id: 0, dir: "East", pos: [80, 40] }, { target_id: 11, dir: "West", pos: [0, 40] }], boss: null
    },
    {
        id: 11, name: "蠻荒徑", realm: "凡人", size: [80, 80], pos: [-2, 0], theme: "West",
        description: "雜草叢生，這是獵人們通往深處的小道。",
        portals: [{ target_id: 10, dir: "East", pos: [80, 40] }, { target_id: 12, dir: "West", pos: [0, 40] }], boss: null
    },
    {
        id: 12, name: "獸王谷口", realm: "凡人", size: [80, 80], pos: [-3, 0], theme: "West",
        description: "崖壁上的爪痕，預示著前方的危險。",
        portals: [{ target_id: 11, dir: "East", pos: [80, 40] }, { target_id: 13, dir: "West", pos: [0, 40] }], 
        boss: { name: "赤火猿", pos: [40, 40] }
    },
    // Sect (y=4)
    {
        id: 13, name: "萬獸山莊", realm: "練氣", size: [40, 40], pos: [-4, 0], theme: "Sect",
        description: "依憑上古蠻荒巨獸的骸骨而建，巨大的圖騰柱上燃燒著不滅的獸火。鼓聲如雷，獸吼震天，空氣中瀰漫著原始狂野的氣息。",
        portals: [
            { target_id: 12, dir: "East", pos: [40, 20] }, 
            { target_id: 14, dir: "West", pos: [0, 20] },
            { target_id: 16, dir: "North", pos: [20, 0] }
        ], 
        boss: null
    },
    // Qi Phase (y=5-7)
    {
        id: 14, name: "淬體潭", realm: "練氣", size: [100, 100], pos: [-5, 0], theme: "West",
        description: "一潭赤紅的藥液，弟子們在此打磨肉身。",
        portals: [
            { target_id: 13, dir: "East", pos: [100, 50] }, 
            { target_id: 15, dir: "North", pos: [50, 0] }
        ], 
        boss: null
    },
    {
        id: 15, name: "百獸林", realm: "練氣", size: [100, 100], pos: [-5, 1], theme: "West",
        description: "真正的獵場，每一棵樹後都藏著危險。",
        portals: [
            { target_id: 14, dir: "South", pos: [50, 100] }, 
            { target_id: 16, dir: "East", pos: [100, 50] } 
        ], 
        boss: null
    },
    {
        id: 16, name: "獸王谷", realm: "練氣", size: [100, 100], pos: [-4, 1], theme: "West",
        description: "谷底沉睡著獸王，挑戰它證明你的力量。",
        portals: [
            { target_id: 15, dir: "West", pos: [0, 50] }, 
            { target_id: 13, dir: "South", pos: [50, 100] },
            { target_id: 41, dir: "North", pos: [50, 0] }
        ], 
        boss: { name: "萬獸獸王", pos: [50, 50] } 
    },

    // --- East Path (Magic) x=2 ---
    // Mortal Phase (y=1-3)
    {
        id: 20, name: "東郊靈田", realm: "凡人", size: [80, 80], pos: [1, 0], theme: "East",
        description: "荒廢的靈田，生長著微弱靈氣的草藥。",
        portals: [{ target_id: 0, dir: "West", pos: [0, 40] }, { target_id: 21, dir: "East", pos: [80, 40] }], boss: null
    },
    {
        id: 21, name: "迷霧澤", realm: "凡人", size: [80, 80], pos: [2, 0], theme: "East",
        description: "終年不散的白霧，容易讓人迷失。",
        portals: [{ target_id: 20, dir: "West", pos: [0, 40] }, { target_id: 22, dir: "East", pos: [80, 40] }], boss: null
    },
    {
        id: 22, name: "靈湖草甸", realm: "凡人", size: [80, 80], pos: [3, 0], theme: "East",
        description: "碧草如茵，遠處湖泊波光粼粼。",
        portals: [{ target_id: 21, dir: "West", pos: [0, 40] }, { target_id: 23, dir: "East", pos: [80, 40] }],
        boss: { name: "靈湖巨蟹", pos: [40, 40] }
    },
    // Sect (y=4)
    {
        id: 23, name: "縹緲仙宮", realm: "練氣", size: [40, 40], pos: [4, 0], theme: "Sect",
        description: "終年雲霧繚繞，亦真亦幻。湖心島上瓊樓玉宇若隱若現，護宗大陣流轉著五彩琉璃之光，如入鏡花水月之境。",
        portals: [
            { target_id: 22, dir: "West", pos: [0, 20] }, 
            { target_id: 24, dir: "East", pos: [40, 20] },
            { target_id: 26, dir: "North", pos: [20, 0] }
        ], 
        boss: null
    },
    // Qi Phase (y=5-7)
    {
        id: 24, name: "試煉迷宮", realm: "練氣", size: [100, 100], pos: [5, 0], theme: "East",
        description: "由幻陣構成的迷宮，考驗心智。",
        portals: [
            { target_id: 23, dir: "West", pos: [0, 50] }, 
            { target_id: 25, dir: "North", pos: [50, 0] }
        ], 
        boss: null
    },
    {
        id: 25, name: "藥王谷", realm: "練氣", size: [100, 100], pos: [5, 1], theme: "East",
        description: "靈氣充沛，是煉丹師的後花園。",
        portals: [
            { target_id: 24, dir: "South", pos: [50, 100] }, 
            { target_id: 26, dir: "West", pos: [0, 50] },
            { target_id: 50, dir: "North", pos: [50, 0] }
        ], 
        boss: null
    },
    {
        id: 26, name: "靈源仙湖", realm: "練氣", size: [100, 100], pos: [4, 1], theme: "East",
        description: "湖水蘊含精純靈氣，潛伏著水生妖獸。",
        portals: [
            { target_id: 25, dir: "East", pos: [100, 50] }, 
            { target_id: 23, dir: "South", pos: [50, 100] },
            { target_id: 51, dir: "North", pos: [50, 0] }
        ], 
        boss: { name: "靈湖水蛟", pos: [50, 50] }
    },

    // --- Foundation Establishment ---
    // North (y=8-10)
    {
        id: 30, name: "雪線古道", realm: "築基", size: [120, 120], pos: [1, 6], theme: "North",
        description: "凡俗與極寒禁區的界線，氣溫驟降。",
        portals: [
            { target_id: 32, dir: "West", pos: [0, 60] },
            { target_id: 61, dir: "North", pos: [60, 0] },
            { target_id: 6, dir: "South", pos: [60, 120] }
        ], 
        boss: null
    },
    {
        id: 31, name: "冰封峽谷", realm: "築基", size: [120, 120], pos: [-1, 6], theme: "North",
        description: "冰壁如鏡，封印著遠古生靈。",
        portals: [
            { target_id: 5, dir: "South", pos: [60, 120] }, 
            { target_id: 32, dir: "East", pos: [120, 60] },
            { target_id: 60, dir: "North", pos: [60, 0] }
        ], 
        boss: null
    },
    {
        id: 32, name: "落雷懸崖", realm: "築基", size: [120, 120], pos: [0, 6], theme: "North",
        description: "雷雲低垂，銀蛇狂舞。",
        portals: [
            { target_id: 31, dir: "West", pos: [0, 60] }, 
            { target_id: 30, dir: "East", pos: [120, 60] },
            { target_id: 7, dir: "South", pos: [60, 120] }, 
            { target_id: 62, dir: "North", pos: [60, 0] }
        ], 
        boss: { name: "極地劍靈", pos: [60, 60] }
    },
    // West
    {
        id: 40, name: "狂獸巢穴", realm: "築基", size: [120, 120], pos: [-5, 2], theme: "West",
        description: "遍地白骨，腥氣沖天。",
        portals: [
            { target_id: 15, dir: "South", pos: [60, 120] }, 
            { target_id: 41, dir: "East", pos: [120, 60] }
        ], 
        boss: null
    },
    {
        id: 41, name: "食人叢林", realm: "築基", size: [120, 120], pos: [-4, 2], theme: "West",
        description: "植物似乎有了意識，渴望血肉滋養。",
        portals: [
            { target_id: 40, dir: "West", pos: [0, 60] }, 
            { target_id: 42, dir: "East", pos: [120, 60] },
            { target_id: 16, dir: "South", pos: [60, 120] }
        ], 
        boss: null
    },
    {
        id: 42, name: "烈焰荒原", realm: "築基", size: [120, 120], pos: [-3, 2], theme: "West",
        description: "熱浪扭曲空間，地火噴湧。",
        portals: [
            { target_id: 41, dir: "West", pos: [0, 60] }, 
            { target_id: 71, dir: "North", pos: [60, 0] }
        ],
        boss: { name: "烈焰妖王", pos: [60, 60] }
    },
    // East
    {
        id: 50, name: "幽暗密林", realm: "築基", size: [120, 120], pos: [5, 2], theme: "East",
        description: "古木參天，遮雲蔽日。",
        portals: [
            { target_id: 25, dir: "South", pos: [60, 120] }, 
            { target_id: 51, dir: "West", pos: [0, 60] }
        ], 
        boss: null
    },
    {
        id: 51, name: "瘴氣沼澤", realm: "築基", size: [120, 120], pos: [4, 2], theme: "East",
        description: "五彩斑斕的致命霧氣。",
        portals: [
            { target_id: 50, dir: "East", pos: [120, 60] }, 
            { target_id: 52, dir: "West", pos: [0, 60] },
            { target_id: 26, dir: "South", pos: [60, 120] },
            { target_id: 80, dir: "North", pos: [60, 0] }
        ], 
        boss: null
    },
    {
        id: 52, name: "寂滅雷澤", realm: "築基", size: [120, 120], pos: [3, 2], theme: "East",
        description: "雷水交加，感悟雷霆法則。",
        portals: [
            { target_id: 51, dir: "East", pos: [120, 60] }, 
            { target_id: 81, dir: "North", pos: [60, 0] }
        ],
        boss: { name: "雷澤領主", pos: [60, 60] }
    },

    // --- Golden Core ---
    // North (y=11-13)
    {
        id: 60, name: "罡風層", realm: "金丹", size: [130, 130], pos: [-1, 7], theme: "North",
        description: "高空之域，罡風如刃。",
        portals: [
            { target_id: 31, dir: "South", pos: [65, 130] }, 
            { target_id: 62, dir: "East", pos: [130, 65] }
        ], 
        boss: null
    },
    {
        id: 61, name: "懸空浮島", realm: "金丹", size: [130, 130], pos: [1, 7], theme: "North",
        description: "違背重力漂浮的島嶼群。",
        portals: [
            { target_id: 30, dir: "South", pos: [65, 130] }, 
            { target_id: 62, dir: "West", pos: [0, 65] }
        ], 
        boss: null
    },
    {
        id: 62, name: "通天鎖鏈", realm: "金丹", size: [130, 130], pos: [0, 7], theme: "North",
        description: "巨大鐵索橫亙天際，腳下是萬丈深淵。",
        portals: [
            { target_id: 60, dir: "West", pos: [0, 65] }, 
            { target_id: 61, dir: "East", pos: [130, 65] },
            { target_id: 32, dir: "South", pos: [65, 130] }, 
            { target_id: 90, dir: "North", pos: [65, 0] }
        ], 
        boss: { name: "金翅大鵬", pos: [65, 65] }
    },
    // West
    {
        id: 70, name: "重力黑山", realm: "金丹", size: [130, 130], pos: [-4, 3], theme: "West",
        description: "超倍重力場，每一步都艱難無比。",
        portals: [
            { target_id: 41, dir: "South", pos: [65, 130] }, 
            { target_id: 71, dir: "East", pos: [130, 65] }
        ], 
        boss: null
    },
    {
        id: 71, name: "熔岩煉獄", realm: "金丹", size: [130, 130], pos: [-3, 3], theme: "West",
        description: "地底核心，岩漿流淌。",
        portals: [
            { target_id: 70, dir: "West", pos: [0, 65] }, 
            { target_id: 72, dir: "North", pos: [65, 0] },
            { target_id: 42, dir: "South", pos: [65, 130] }
        ], 
        boss: null
    },
    {
        id: 72, name: "萬毒坑", realm: "金丹", size: [130, 130], pos: [-3, 4], theme: "West",
        description: "匯聚天下奇毒的深坑。",
        portals: [
            { target_id: 71, dir: "South", pos: [65, 130] }, 
            { target_id: 100, dir: "North", pos: [65, 0] }
        ], 
        boss: { name: "厄難毒體", pos: [65, 65] }
    },
    // East
    {
        id: 80, name: "風暴洋", realm: "金丹", size: [130, 130], pos: [4, 3], theme: "East",
        description: "狂風巨浪，海獸出沒。",
        portals: [
            { target_id: 81, dir: "West", pos: [0, 65] },
            { target_id: 51, dir: "South", pos: [65, 130] },
            
        ], 
        boss: null
    },
    {
        id: 81, name: "蓬萊仙島", realm: "金丹", size: [130, 130], pos: [3, 3], theme: "East",
        description: "傳說中的仙島，靈藥遍地。",
        portals: [
            { target_id: 80, dir: "East", pos: [130, 65] }, 
            { target_id: 82, dir: "North", pos: [65, 0] },
            { target_id: 52, dir: "South", pos: [65, 130] }
        ], 
        boss: null
    },
    {
        id: 82, name: "幻海古境", realm: "金丹", size: [130, 130], pos: [3, 4], theme: "East",
        description: "鏡花水月，考驗道心。",
        portals: [
            { target_id: 81, dir: "South", pos: [65, 130] }, 
            { target_id: 110, dir: "North", pos: [65, 0] }
        ], 
        boss: { name: "覆海蛟龍", pos: [65, 65] }
    },

    // --- Nascent Soul ---
    // North (y=14-16)
    {
        id: 90, name: "萬載玄冰窟", realm: "元嬰", size: [140, 140], pos: [0, 8], theme: "North",
        description: "寒氣化為實質，連靈魂都能凍結。",
        portals: [{ target_id: 62, dir: "South", pos: [70, 140] }, { target_id: 91, dir: "North", pos: [70, 0] }], boss: null
    },
    {
        id: 91, name: "極光天境", realm: "元嬰", size: [140, 140], pos: [0, 9], theme: "North",
        description: "絢麗極光中隱藏著空間裂痕。",
        portals: [{ target_id: 90, dir: "South", pos: [70, 140] }, { target_id: 92, dir: "North", pos: [70, 0] }], boss: null
    },
    {
        id: 92, name: "碎星劍垣", realm: "元嬰", size: [140, 140], pos: [0, 10], theme: "North",
        description: "上古劍仙斬落星辰之地，劍意永存。",
        portals: [{ target_id: 91, dir: "South", pos: [70, 140] }, { target_id: 120, dir: "North", pos: [70, 0] }],
        boss: { name: "北寒劍尊", pos: [70, 70] }
    },
    // West
    {
        id: 100, name: "盤古脊", realm: "元嬰", size: [140, 140], pos: [-3, 5], theme: "West",
        description: "如巨人脊骨般的山脈。",
        portals: [{ target_id: 72, dir: "South", pos: [70, 140] }, { target_id: 101, dir: "North", pos: [70, 0] }], boss: null
    },
    {
        id: 101, name: "龍血池", realm: "元嬰", size: [140, 140], pos: [-3, 6], theme: "West",
        description: "沸騰血池，蘊含真龍之力。",
        portals: [{ target_id: 100, dir: "South", pos: [70, 140] }, { target_id: 102, dir: "North", pos: [70, 0] }], boss: null
    },
    {
        id: 102, name: "蠻荒祖廟", realm: "元嬰", size: [140, 140], pos: [-3, 7], theme: "West",
        description: "供奉遠古巫神，記載肉身成聖之秘。",
        portals: [{ target_id: 101, dir: "South", pos: [70, 140] }, { target_id: 120, dir: "North", pos: [70, 0] }],
        boss: { name: "刑天殘軀", pos: [70, 70] }
    },
    // East
    {
        id: 110, name: "靈魂之海", realm: "元嬰", size: [140, 140], pos: [3, 5], theme: "East",
        description: "純粹精神能量構成的海洋。",
        portals: [{ target_id: 82, dir: "South", pos: [70, 140] }, { target_id: 111, dir: "North", pos: [70, 0] }], boss: null
    },
    {
        id: 111, name: "幽冥鬼域", realm: "元嬰", size: [140, 140], pos: [3, 6], theme: "East",
        description: "生死交界，參悟輪迴。",
        portals: [{ target_id: 110, dir: "South", pos: [70, 140] }, { target_id: 112, dir: "North", pos: [70, 0] }], boss: null
    },
    {
        id: 112, name: "虛空裂隙", realm: "元嬰", size: [140, 140], pos: [3, 7], theme: "East",
        description: "空間極不穩定，域外天魔入侵。",
        portals: [{ target_id: 111, dir: "South", pos: [70, 140] }, { target_id: 120, dir: "North", pos: [70, 0] }],
        boss: { name: "九幽鬼帝", pos: [70, 70] }
    },

    // --- Spirit Severing (Convergence) ---
    {
        id: 120, name: "三界戰場", realm: "化神", size: [150, 150], pos: [0, 11], theme: "Center",
        description: "三方勢力匯聚，爭奪上層資格。",
        portals: [
            { target_id: 92, dir: "South", pos: [75, 150] },       // From North Path
            { target_id: 102, dir: "SouthWest", pos: [0, 150] },   // From West Path
            { target_id: 112, dir: "SouthEast", pos: [150, 150] }, // From East Path
            { target_id: 121, dir: "North", pos: [75, 0] },
            { target_id: 122, dir: "East", pos: [150, 75] }
        ],
        boss: null
    },
    {
        id: 122, name: "殞星界橋", realm: "化神", size: [150, 150], pos: [2, 11], theme: "Center",
        description: "殞落星橋橫跨界縫，是飛昇殘軍與妖魔反覆衝殺的狹橋。",
        portals: [{ target_id: 120, dir: "West", pos: [0, 75] }, { target_id: 121, dir: "North", pos: [75, 0] }],
        boss: null
    },
    {
        id: 121, name: "隕仙深淵", realm: "化神", size: [150, 150], pos: [0, 12], theme: "Center",
        description: "深淵怨氣化作黑霧，傳說有仙人隕落。",
        portals: [{ target_id: 120, dir: "South", pos: [75, 150] }, { target_id: 130, dir: "North", pos: [75, 0] }],
        boss: { name: "修羅魔尊", pos: [75, 75] }
    },

    // --- Void Refining ---
    {
        id: 130, name: "時光長河", realm: "煉虛", size: [160, 160], pos: [0, 13], theme: "Void",
        description: "過去未來交織，稍有不慎便老死其中。",
        portals: [{ target_id: 121, dir: "South", pos: [80, 160] }, { target_id: 131, dir: "North", pos: [80, 0] }, { target_id: 132, dir: "East", pos: [160, 80] }], boss: null
    },
    {
        id: 132, name: "虛淵迴廊", realm: "煉虛", size: [160, 160], pos: [2, 13], theme: "Void",
        description: "迴廊飄浮在虛淵邊緣，時間亂流與碎界殘片在此交錯。",
        portals: [{ target_id: 130, dir: "West", pos: [0, 80] }, { target_id: 131, dir: "North", pos: [80, 0] }],
        boss: null
    },
    {
        id: 131, name: "破碎虛空", realm: "煉虛", size: [160, 160], pos: [0, 14], theme: "Void",
        description: "世界碎片漂浮，前往靈界的必經路。",
        portals: [{ target_id: 130, dir: "South", pos: [80, 160] }, { target_id: 140, dir: "North", pos: [80, 0] }],
        boss: { name: "時空之主", pos: [80, 80] }
    },

    // --- Fusion ---
    {
        id: 140, name: "萬法聖城", realm: "合體", size: [160, 160], pos: [0, 15], theme: "Spirit",
        description: "靈界最繁華都市，萬族共存。",
        portals: [{ target_id: 131, dir: "South", pos: [80, 160] }, { target_id: 141, dir: "North", pos: [80, 0] }, { target_id: 142, dir: "East", pos: [160, 80] }], boss: null
    },
    {
        id: 142, name: "萬靈法壇", realm: "合體", size: [160, 160], pos: [2, 15], theme: "Spirit",
        description: "萬靈法壇匯聚諸族靈脈，是進入中樞前的真正壓力試煉。",
        portals: [{ target_id: 140, dir: "West", pos: [0, 80] }, { target_id: 141, dir: "North", pos: [80, 0] }],
        boss: null
    },
    {
        id: 141, name: "靈界中樞", realm: "合體", size: [160, 160], pos: [0, 16], theme: "Spirit",
        description: "靈氣濃厚，維持靈界運轉的核心。",
        portals: [{ target_id: 140, dir: "South", pos: [80, 160] }, { target_id: 150, dir: "North", pos: [80, 0] }],
        boss: { name: "靈皇", pos: [80, 80] }
    },

    // --- Mahayana ---
    {
        id: 150, name: "無盡海", realm: "大乘", size: [180, 180], pos: [0, 17], theme: "Sea",
        description: "分隔靈界與登仙路的浩瀚海洋。",
        portals: [{ target_id: 141, dir: "South", pos: [90, 180] }, { target_id: 151, dir: "North", pos: [90, 0] }, { target_id: 152, dir: "East", pos: [180, 90] }], boss: null
    },
    {
        id: 152, name: "界海孤烽", realm: "大乘", size: [180, 180], pos: [2, 17], theme: "Sea",
        description: "孤烽漂浮於界海裂潮之上，專為阻截闖關者而立。",
        portals: [{ target_id: 150, dir: "West", pos: [0, 90] }, { target_id: 151, dir: "North", pos: [90, 0] }],
        boss: null
    },
    {
        id: 151, name: "登仙天梯", realm: "大乘", size: [180, 180], pos: [0, 18], theme: "Sky",
        description: "通往天界的巨大石階，承受天地威壓。",
        portals: [{ target_id: 150, dir: "South", pos: [90, 180] }, { target_id: 160, dir: "North", pos: [90, 0] }],
        boss: { name: "守界者", pos: [90, 90] }
    },

    // --- Tribulation ---
    {
        id: 160, name: "劫雲荒原", realm: "渡劫", size: [200, 200], pos: [0, 19], theme: "Dark",
        description: "烏雲壓頂，毀滅氣息。",
        portals: [{ target_id: 151, dir: "South", pos: [100, 200] }, { target_id: 161, dir: "North", pos: [100, 0] }, { target_id: 162, dir: "East", pos: [200, 100] }], boss: null
    },
    {
        id: 162, name: "天刑迴廊", realm: "渡劫", size: [200, 200], pos: [2, 19], theme: "Thunder",
        description: "天刑雷柱沿迴廊輪轉，是踏入雷池前必經的審判地帶。",
        portals: [{ target_id: 160, dir: "West", pos: [0, 100] }, { target_id: 161, dir: "North", pos: [100, 0] }],
        boss: null
    },
    {
        id: 161, name: "九天雷池", realm: "渡劫", size: [200, 200], pos: [0, 20], theme: "Thunder",
        description: "雷霆化液，脫胎換骨之地。",
        portals: [{ target_id: 160, dir: "South", pos: [100, 200] }, { target_id: 170, dir: "North", pos: [100, 0] }],
        boss: { name: "天道化身", pos: [100, 100] }
    },

    // --- Immortal ---
    {
        id: 170, name: "接引仙殿", realm: "仙人", size: [200, 200], pos: [0, 21], theme: "Immortal",
        description: "飛昇者抵達仙界的第一站，金碧輝煌。",
        portals: [{ target_id: 161, dir: "South", pos: [100, 200] }, { target_id: 171, dir: "North", pos: [100, 0] }, { target_id: 172, dir: "East", pos: [200, 100] }], boss: null
    },
    {
        id: 172, name: "玉詔仙獄", realm: "仙人", size: [200, 200], pos: [2, 21], theme: "Immortal",
        description: "玉詔仙獄專門囚禁違命飛昇者，仙庭鎮壓力量最為濃烈。",
        portals: [{ target_id: 170, dir: "West", pos: [0, 100] }, { target_id: 171, dir: "North", pos: [100, 0] }],
        boss: null
    },
    {
        id: 171, name: "九重天闕", realm: "仙人", size: [200, 200], pos: [0, 22], theme: "Immortal",
        description: "仙界權力核心，宮殿懸浮雲端。",
        portals: [{ target_id: 170, dir: "South", pos: [100, 200] }, { target_id: 180, dir: "North", pos: [100, 0] }, { target_id: 181, dir: "East", pos: [200, 100] }],
        boss: { name: "九天仙尊", pos: [100, 100] }
    },
    {
        id: 181, name: "太初外環", realm: "仙帝", size: [200, 200], pos: [2, 22], theme: "Ultimate",
        description: "鴻蒙道宮外環盤旋著本源碎界，是踏入終極道場前的最後緩衝。",
        portals: [{ target_id: 171, dir: "West", pos: [0, 100] }, { target_id: 180, dir: "North", pos: [100, 0] }, { target_id: 182, dir: "East", pos: [200, 100] }],
        boss: null
    },
    {
        id: 182, name: "歸墟裂界", realm: "仙帝", size: [200, 200], pos: [2, 23], theme: "Ultimate",
        description: "歸墟裂界將萬道殘響與滅界碎潮壓成狹長戰場，是終盤路線專屬掉落最集中的壓力支線。",
        portals: [{ target_id: 181, dir: "West", pos: [0, 100] }, { target_id: 180, dir: "North", pos: [100, 0] }],
        boss: null
    },
    {
        id: 180, name: "鴻蒙道宮", realm: "仙帝", size: [200, 200], pos: [0, 23], theme: "Ultimate",
        description: "宇宙終極，大道起源。",
        portals: [{ target_id: 171, dir: "South", pos: [100, 200] }, { target_id: 182, dir: "East", pos: [200, 100] }],
        boss: { name: "鴻蒙道祖", pos: [100, 100] }
    }
];

// Generate Map Data
export const MAPS: MapData[] = RAW_MAPS_V60.map((raw, index) => {
    // Explicitly resolve realm using the mapping, default to QiRefining
    const realm: MajorRealm = REALM_MAPPING[raw.realm] ?? MajorRealm.QiRefining;
    
    const width = raw.size[0];
    const height = raw.size[1];
    const id = raw.id;
    const worldX = raw.pos[0];
    const worldY = raw.pos[1];
    
    // Populate Enemies
    const enemies: Enemy[] = [];
    const SAFE_MAP_IDS = [0, 4, 13, 23];

    // Skip enemy generation for safe maps
    if (!SAFE_MAP_IDS.includes(id)) {
        // Fetch common monsters for this map: m{id}_c1, m{id}_c2, ...
        for (let i = 1; i <= 4; i++) {
            const enemyId = `m${id}_c${i}`;
            if (BESTIARY[enemyId]) {
                enemies.push(BESTIARY[enemyId]);
            }
        }

        // Fetch elite monsters for this map: m{id}_e1, m{id}_e2, ...
        for (let i = 1; i <= 2; i++) {
            const enemyId = `m${id}_e${i}`;
            if (BESTIARY[enemyId]) {
                enemies.push(BESTIARY[enemyId]);
            }
        }

        // Fallback: If no monsters found for this specific map, use realm-wide defaults
        if (enemies.length === 0) {
            const allEnemies = Object.values(BESTIARY);
            const commonForRealm = allEnemies.filter(e => e.realm === realm && e.rank === EnemyRank.Common);
            if (commonForRealm.length > 0) {
                enemies.push(commonForRealm[Math.floor(Math.random() * commonForRealm.length)]);
            }
        }
    }


    // Add Boss if defined (Use fixed position)
    let bossSpawn = undefined;
    // Boss handling: Check for m{id}_b1
    const bossId = `m${id}_b1`;
    if (BESTIARY[bossId] && raw.boss) {
        enemies.push(BESTIARY[bossId]);
        bossSpawn = {
             x: Math.max(0, Math.min(raw.boss.pos[0], width - 1)),
             y: Math.max(0, Math.min(raw.boss.pos[1], height - 1)),
             enemyId: bossId
         };
    }

    // Default Fallback (Skip Safe Zones)
    if (enemies.length === 0 && !SAFE_MAP_IDS.includes(id)) {
        if (BESTIARY['m1_c1']) {
            enemies.push(BESTIARY['m1_c1']);
        }
    }

    // Generate Portals from explicit positions
    const portals = raw.portals.map(p => {
        const targetIdNum = p.target_id;
        const targetMapRaw = RAW_MAPS_V60.find(m => m.id === targetIdNum);
        
        let targetX = 10;
        let targetY = 10;
        
        if (targetMapRaw) {
             // Find portal in target that points back to current map to determine spawn point
             const returnPortal = targetMapRaw.portals.find(rp => rp.target_id === raw.id);
             if (returnPortal) {
                 const tx = returnPortal.pos[0];
                 const ty = returnPortal.pos[1];
                 // Directly use the target's portal position as spawn
                 // Clamp to be safe
                 targetX = Math.max(0, Math.min(tx, targetMapRaw.size[0] - 1));
                 targetY = Math.max(0, Math.min(ty, targetMapRaw.size[1] - 1));
             } else {
                 // Default center fallback (Should not happen with complete data)
                 targetX = Math.floor(targetMapRaw.size[0] / 2);
                 targetY = Math.floor(targetMapRaw.size[1] / 2);
             }
        }

        // Clamp local portal position
        const px = Math.max(0, Math.min(p.pos[0], width - 1));
        const py = Math.max(0, Math.min(p.pos[1], height - 1));

        return {
            x: px,
            y: py,
            targetMapId: targetIdNum.toString(),
            targetX: targetX,
            targetY: targetY,
            label: targetMapRaw ? `前往 [${targetMapRaw.name}]` : '未知區域',
            dir: p.dir
        };
    });

    return {
        id: id.toString(),
        name: raw.name,
        theme: raw.theme,
        minRealm: realm,
        description: raw.description || '...', 
        introText: `踏入${raw.name}，${raw.description || '靈氣流動似乎有些不同...'}`,
        width: width,
        height: height,
        worldX: worldX,
        worldY: worldY,
        portals: portals,
        npcs: id === 0 ? VILLAGE_NPCS :
             id === 4 ? SWORD_SECT_NPCS :
             id === 13 ? BEAST_SECT_NPCS :
             id === 23 ? MYSTIC_SECT_NPCS :
             id === 120 ? TRI_REALM_BATTLEFIELD_NPCS :
             id === 121 ? FALLEN_ABYSS_NPCS :
             id === 130 ? VOID_RIVER_NPCS : [],
        bossSpawn: bossSpawn,
        enemies: enemies,
        dropRateMultiplier: 1 + (index * 0.05)
    };
});
