import { Quest, QuestType, MajorRealm, ItemQuality } from '../types';

export const QUESTS: Record<string, Quest> = {
    // --- Tutorial Quests ---

    // 1. Newcomer Guide (Dialogue Only)
    'tutorial_01': {
        id: 'tutorial_01',
        type: QuestType.Main,
        title: '初入仙途',
        description: '聽聽村長的教誨，了解這個世界的規則。',
        giverId: 'village_chief',
        submitNpcId: 'village_chief',
        requirements: [{ type: 'dialogue', targetNpcId: 'village_chief' }],
        rewards: [
            { exp: 100, spiritStones: 50 },
        ],
        dialogue: {
            start: [
                "孩子，你既然覺醒了靈根，便不再是凡人了。",
                "三大門派雖然求賢若渴，但也不養閒人。他們立下規矩，凡欲入門者，需先證明自己有跨入「練氣期」的潛力。",
                "你若有意，可依此指引前行：\n\n【劍修之路 (北)】\n向北穿過北郊荒徑，前往凌霄山腳。傳聞那裡有守山靈虎守護著「引氣洗髓丹」，得之可入凌霄劍宗。\n\n【體修之路 (西)】\n向西深入西郊密林，前往獸王谷口。擊敗那裡的赤火猿，奪取「引氣洗髓丹」，便有資格拜入萬獸山莊。\n\n【法修之路 (東)】\n向東跨越東郊靈田，前往靈湖草甸。若能從靈湖巨蟹手中取得「引氣洗髓丹」，縹緲仙宮的大門將為你敞開。",
                "切記，修仙之路本就是逆天而行，充滿兇險。去吧，孩子，去爭那一線機緣！"
            ],
            progress: [
                "還在猶豫什麼？時不我待，去吧！"
            ],
            complete: [
                "很好，看來你已經準備好了。這是村裡給你的一點盤纏，路上小心。"
            ]
        }
    },

    // 2. Get a Weapon (Cross-NPC: Chief -> Blacksmith)
    'tutorial_02_get_sword': {
        id: 'tutorial_02_get_sword',
        type: QuestType.Main,
        title: '防身利器',
        description: '村長建議你去鐵匠鋪領取一把防身兵器。',
        giverId: 'village_chief',
        prerequisiteQuestId: 'tutorial_01',
        submitNpcId: 'village_blacksmith', // Deliver to Blacksmith
        requirements: [
            { type: 'dialogue', targetNpcId: 'village_blacksmith' }
        ],
        rewards: [
            { exp: 50 },
            { items: [{ itemId: 'novice_sword', count: 1, quality: ItemQuality.Low }] }
        ],
        dialogue: {
            start: [
                "外面的世界妖獸橫行，赤手空拳可不行。",
                "去村裡的鐵匠鋪找張正，就說是我讓你去的，他會給你一把趁手的兵器。"
            ],
            progress: [
                "鐵匠鋪就在村子東邊，快去吧。"
            ],
            complete: [
                "哦？是村長讓你來的？",
                "俺叫張正，既然是村長交代的，這把剛打好的鐵劍就送給你了。出門在外，自己小心！"
            ]
        }
    },

    // --- Sect Join Quests ---

    // Sword Sect
    'sect_sword_join': {
        id: 'sect_sword_join',
        type: QuestType.Sect,
        title: '拜入劍宗',
        description: '證明你的實力，突破至練氣期，加入凌霄劍宗。',
        giverId: 'sect_sword_elder',
        requirements: [
            { type: 'level', minRealm: MajorRealm.QiRefining }
        ],
        rewards: [
            { exp: 500, spiritStones: 200 },
            { items: [{ itemId: 'spirit_iron_sword', count: 1 }] }
        ],
        dialogue: {
            start: [
                "劍者，寧折不彎。唯有大毅力者，方能登臨絕頂。",
                "若你已突破至練氣期，便是我宗門弟子。"
            ],
            progress: [
                "凡人修仙，逆天而行。你修為尚淺，速去修煉。"
            ],
            complete: [
                "不錯，氣息凝練，已入練氣之境。",
                "今日起，你便是我凌霄劍宗外門弟子。此乃宗門制式靈劍，賜予你防身。",
                "除此之外，你可去藏經閣挑選功法，或去靈寶閣購置裝備。"
            ]
        }
    },

    // Sword Sect Task: Kill Spirit Tiger
    'sect_sword_task_01': {
        id: 'sect_sword_task_01',
        type: QuestType.Side,
        title: '劍宗試煉：斬虎',
        description: '凌霄山腳的守山靈虎雖是瑞獸，但近日狂躁傷人。長老命你去將其斬殺，順便取回妖丹，以證劍道。',
        giverId: 'sect_sword_elder',
        prerequisiteQuestId: 'sect_sword_join',
        submitNpcId: 'sect_sword_elder',
        requirements: [
            { type: 'kill', targetId: 'm3_b1', count: 1 } // Spirit Tiger
        ],
        rewards: [
            { exp: 800, spiritStones: 500 },
            { items: [{ itemId: 'manual_spirit_strike', count: 1, quality: ItemQuality.Medium }] }
        ],
        dialogue: {
            start: [
                "既已入我劍宗，便要懂得劍出無悔。",
                "山腳下的守山靈虎近日不知何故性情大變，傷我也外門弟子。",
                "你去將其斬殺，這也是對你劍術的一次磨練。"
            ],
            progress: [
                "守山靈虎皮糙肉厚，需尋其弱點，一招制敵。"
            ],
            complete: [
                "不錯，劍氣凌厲，已有幾分火候。",
                "這本《靈力一擊》乃是當年我在築基期時所創，今日便傳授於你。",
                "勤加修煉，莫要墮了劍宗威名。"
            ]
        }
    },

    // Beast Sect
    'sect_beast_join': {
        id: 'sect_beast_join',
        type: QuestType.Sect,
        title: '拜入獸莊',
        description: '證明你的實力，突破至練氣期，加入萬獸山莊。',
        giverId: 'sect_beast_elder',
        requirements: [
            { type: 'level', minRealm: MajorRealm.QiRefining }
        ],
        rewards: [
            { exp: 500, spiritStones: 200 },
            { items: [{ itemId: 'bear_paw_gauntlet', count: 1 }] }
        ],
        dialogue: {
            start: [
                "肉身是渡世寶筏，唯有千錘百煉，方能肉身成聖。",
                "汲取萬獸精血，鑄就無堅不摧之軀，方為我輩修士之本。"
            ],
            progress: [
                "你的肉身還不夠強大，無法承受獸血洗禮。去突破吧！"
            ],
            complete: [
                "好！氣血翻湧，如蠻荒巨獸。",
                "今日起，你便是我萬獸山莊的戰士。收下這副拳套，用它撕裂你的敵人！"
            ]
        }
    },

    // Mystic Sect
    'sect_mystic_join': {
        id: 'sect_mystic_join',
        type: QuestType.Sect,
        title: '拜入仙宮',
        description: '證明你的實力，突破至練氣期，加入縹緲仙宮。',
        giverId: 'sect_mystic_elder',
        requirements: [
            { type: 'level', minRealm: MajorRealm.QiRefining }
        ],
        rewards: [
            { exp: 500, spiritStones: 200 },
            { items: [{ itemId: 'spirit_wood_staff', count: 1 }] }
        ],
        dialogue: {
            start: [
                "道法自然，萬物皆有靈。感悟天地，方能御使五行。",
                "修仙修心，心若冰清，天塌不驚。"
            ],
            progress: [
                "你的心境尚未圓滿，無法引動天地靈氣。去突破練氣期吧。"
            ],
            complete: [
                "善，你已感悟到了天地靈氣的流動。",
                "今日起，你便是我縹緲仙宮的門徒。這根靈木杖，可助你更好地操控五行。"
            ]
        }
    }
};
