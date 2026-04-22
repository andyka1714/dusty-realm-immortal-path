import { Quest, QuestType, MajorRealm, ItemQuality, ProfessionType } from '../types';
import { getSkillManualId } from './items/manuals';
import { getFormalCoreSkills } from './skills';

const getSectTrialManualId = (profession: ProfessionType) => {
    const skill = getFormalCoreSkills({
        profession,
        minRealm: MajorRealm.QiRefining,
        type: 'Active',
        formalSourceTier: 'shop',
    })[0];

    if (!skill) {
        throw new Error(`缺少 ${profession} 的宗門試煉入門技能書`);
    }

    return getSkillManualId(skill.id);
};

const SECT_TRIAL_MANUALS: Record<ProfessionType, string> = {
    [ProfessionType.None]: '',
    [ProfessionType.Sword]: getSectTrialManualId(ProfessionType.Sword),
    [ProfessionType.Body]: getSectTrialManualId(ProfessionType.Body),
    [ProfessionType.Mage]: getSectTrialManualId(ProfessionType.Mage),
};

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
            { items: [{ itemId: SECT_TRIAL_MANUALS[ProfessionType.Sword], count: 1, quality: ItemQuality.Medium }] }
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
                "這卷《流光初斬》秘卷乃是我宗入門殺招，今日便傳授於你。",
                "勤加修煉，莫要墮了劍宗威名。"
            ]
        }
    },
    'sect_sword_task_02': {
        id: 'sect_sword_task_02',
        type: QuestType.Side,
        title: '劍宗歷練：鎮劍靈',
        description: '巡山統領命你前往築基地界，鎮壓極地劍靈，穩住劍塚外溢的鋒芒。',
        giverId: 'sect_sword_patrol_captain',
        submitNpcId: 'sect_sword_patrol_captain',
        prerequisiteQuestId: 'sect_sword_task_01',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Foundation },
            { type: 'kill', targetId: 'm32_b1', count: 1 }
        ],
        rewards: [
            { exp: 2400, spiritStones: 1200 },
            { items: [{ itemId: 'flow_light_sword', count: 1 }, { itemId: 'sword_scabbard', count: 1 }] }
        ],
        dialogue: {
            start: [
                '萬劍塚的餘勢已不足以磨你，接下來去築基地界斬那頭極地劍靈。',
                '取其劍核回來，讓我看看你是不是只會在宗門裡耍花架子。'
            ],
            progress: [
                '極地劍靈鋒芒極盛，若心志不穩，劍未出鞘便先亂了。'
            ],
            complete: [
                '很好，劍核尚溫，說明你是正面斬下來的。',
                '這對流光劍與養劍鞘歸你，往後巡山便帶著它們。'
            ]
        }
    },
    'sect_sword_task_03': {
        id: 'sect_sword_task_03',
        type: QuestType.Side,
        title: '劍宗真傳：斬大鵬',
        description: '巡山統領命你追入金丹天域，斬下金翅大鵬，為外門立威。',
        giverId: 'sect_sword_patrol_captain',
        submitNpcId: 'sect_sword_patrol_captain',
        prerequisiteQuestId: 'sect_sword_task_02',
        requirements: [
            { type: 'level', minRealm: MajorRealm.GoldenCore },
            { type: 'kill', targetId: 'm62_b1', count: 1 }
        ],
        rewards: [
            { exp: 8200, spiritStones: 4200 },
            { items: [{ itemId: 'azure_frost_sword', count: 1 }, { itemId: 'sword_spirit_stone', count: 1 }] }
        ],
        dialogue: {
            start: [
                '金翅大鵬橫掠雲海，已連斷我宗三條飛劍傳訊。',
                '去，把它的金羽斬下來，你就算真正踏進劍宗真傳的門檻。'
            ],
            progress: [
                '大鵬擅裂空疾襲，若只追它的影子，你永遠斬不中本體。'
            ],
            complete: [
                '這根金羽夠鋒，也夠重，看來你沒辱沒凌霄劍宗。',
                '青霜劍與劍靈石收下，往後你的劍要更快，也要更準。'
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

    'sect_beast_task_01': {
        id: 'sect_beast_task_01',
        type: QuestType.Side,
        title: '獸莊試煉：裂猿',
        description: '獸王谷口的赤火猿王近來不斷襲擊入門弟子。長老命你前去鎮壓，以驗肉身與膽魄。',
        giverId: 'sect_beast_elder',
        prerequisiteQuestId: 'sect_beast_join',
        submitNpcId: 'sect_beast_elder',
        requirements: [
            { type: 'kill', targetId: 'm12_b1', count: 1 }
        ],
        rewards: [
            { exp: 800, spiritStones: 500 },
            { items: [{ itemId: SECT_TRIAL_MANUALS[ProfessionType.Body], count: 1, quality: ItemQuality.Medium }] }
        ],
        dialogue: {
            start: [
                "蠻力不是亂拳，真正的體修要敢衝、敢扛、敢一拳打碎敵膽。",
                "谷口那頭赤火猿王暴躁難馴，你去把它壓下來，讓我看看你的筋骨。"
            ],
            progress: [
                "赤火猿王氣血旺盛，莫要只知硬拼，要學會在出拳時壓住它的節奏。"
            ],
            complete: [
                "不錯，拳勢厚重，已能震懾兇獸。",
                "這卷《震岳拳》秘卷便賜予你，往後出拳當如山崩。"
            ]
        }
    },
    'sect_beast_task_02': {
        id: 'sect_beast_task_02',
        type: QuestType.Side,
        title: '獸莊歷練：焚王骨',
        description: '獵場監軍命你擊倒烈焰妖王，奪其妖骨，補上山莊下一批鍛體藥引。',
        giverId: 'sect_beast_huntmaster',
        submitNpcId: 'sect_beast_huntmaster',
        prerequisiteQuestId: 'sect_beast_task_01',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Foundation },
            { type: 'kill', targetId: 'm42_b1', count: 1 }
        ],
        rewards: [
            { exp: 2400, spiritStones: 1200 },
            { items: [{ itemId: 'tiger_king_gauntlet', count: 1 }, { itemId: 'scale_shield', count: 1 }] }
        ],
        dialogue: {
            start: [
                '築基之後，光靠蠻勁沒用，你得學會怎麼把兇獸拆成自己的筋骨。',
                '去把烈焰妖王的妖骨帶回來，我要看你夠不夠狠。'
            ],
            progress: [
                '烈焰妖王火性太燥，若只會硬扛，你的骨頭會先熬不住。'
            ],
            complete: [
                '妖骨焦黑卻沒碎，手法不錯。',
                '虎王拳套和龍鱗盾拿去，下一次獵場衝陣由你開路。'
            ]
        }
    },
    'sect_beast_task_03': {
        id: 'sect_beast_task_03',
        type: QuestType.Side,
        title: '獸莊真傳：壓毒體',
        description: '獵場監軍命你鎮壓厄難毒體，驗證你是否已能以金丹之軀扛住萬厄反噬。',
        giverId: 'sect_beast_huntmaster',
        submitNpcId: 'sect_beast_huntmaster',
        prerequisiteQuestId: 'sect_beast_task_02',
        requirements: [
            { type: 'level', minRealm: MajorRealm.GoldenCore },
            { type: 'kill', targetId: 'm72_b1', count: 1 }
        ],
        rewards: [
            { exp: 8200, spiritStones: 4200 },
            { items: [{ itemId: 'dragon_claw', count: 1 }, { itemId: 'black_tortoise_shield', count: 1 }] }
        ],
        dialogue: {
            start: [
                '厄難毒體不是一般妖獸，它本身就是一口會擴散的災。',
                '你若能把它壓住，才算撐得起萬獸山莊的金丹招牌。'
            ],
            progress: [
                '毒域鋪開時別退，你越退，它越會把你整個人拖進去。'
            ],
            complete: [
                '很好，毒血還沒滲進你的骨頭裡，表示你撐住了。',
                '裂地龍爪和玄武盾收下，這才像山莊的真傳。'
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
    },

    'sect_mystic_task_01': {
        id: 'sect_mystic_task_01',
        type: QuestType.Side,
        title: '仙宮試煉：鎮蟹',
        description: '靈湖草甸的靈湖巨蟹吞納水靈過盛，已干擾周遭靈脈。長老命你前去鎮壓，藉此磨鍊術法。',
        giverId: 'sect_mystic_elder',
        prerequisiteQuestId: 'sect_mystic_join',
        submitNpcId: 'sect_mystic_elder',
        requirements: [
            { type: 'kill', targetId: 'm22_b1', count: 1 }
        ],
        rewards: [
            { exp: 800, spiritStones: 500 },
            { items: [{ itemId: SECT_TRIAL_MANUALS[ProfessionType.Mage], count: 1, quality: ItemQuality.Medium }] }
        ],
        dialogue: {
            start: [
                "術法之道，不在單純堆疊靈力，而在於精準與節制。",
                "靈湖巨蟹盤踞草甸，水靈翻湧失衡。你去平息此亂，也順勢磨礪自己的術法。"
            ],
            progress: [
                "靈湖巨蟹甲殼堅厚，但水火流轉之間自有破綻，記得以術破勢。"
            ],
            complete: [
                "很好，靈力收放已有章法。",
                "這卷《火羽術》秘卷你拿去參悟，往後施法當更有鋒芒。"
            ]
        }
    },
    'sect_mystic_task_02': {
        id: 'sect_mystic_task_02',
        type: QuestType.Side,
        title: '仙宮歷練：平雷澤',
        description: '外務使命你前往雷澤封區，平定雷澤領主對周遭靈脈的侵蝕。',
        giverId: 'sect_mystic_envoy',
        submitNpcId: 'sect_mystic_envoy',
        prerequisiteQuestId: 'sect_mystic_task_01',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Foundation },
            { type: 'kill', targetId: 'm52_b1', count: 1 }
        ],
        rewards: [
            { exp: 2400, spiritStones: 1200 },
            { items: [{ itemId: 'jade_bamboo_staff', count: 1 }, { itemId: 'elemental_fan', count: 1 }] }
        ],
        dialogue: {
            start: [
                '靈湖只是入門，真正麻煩的是雷澤領主對外圍靈脈的反覆抽擊。',
                '去把那股雷潮壓平，順便證明你不只會在丹房裡念法訣。'
            ],
            progress: [
                '雷澤領主術速極快，若只想和它對轟，神識會先亂掉。'
            ],
            complete: [
                '靈脈的躁動已經平下來了，做得很好。',
                '玉竹杖與五羽扇歸你，往後外務巡查便由你接手。'
            ]
        }
    },
    'sect_mystic_task_03': {
        id: 'sect_mystic_task_03',
        type: QuestType.Side,
        title: '仙宮真傳：覆海息潮',
        description: '外務使命你擊潰覆海蛟龍，封回外海靈潮，驗證你是否已能獨當一面。',
        giverId: 'sect_mystic_envoy',
        submitNpcId: 'sect_mystic_envoy',
        prerequisiteQuestId: 'sect_mystic_task_02',
        requirements: [
            { type: 'level', minRealm: MajorRealm.GoldenCore },
            { type: 'kill', targetId: 'm82_b1', count: 1 }
        ],
        rewards: [
            { exp: 8200, spiritStones: 4200 },
            { items: [{ itemId: 'phoenix_feather_staff', count: 1 }, { itemId: 'yin_yang_mirror', count: 1 }] }
        ],
        dialogue: {
            start: [
                '覆海蛟龍引潮翻海，仙宮外圍的護陣已被它撞了三次。',
                '去把潮勢息掉，你回來時，我就按真傳標準重新看你。'
            ],
            progress: [
                '龍潮一層疊一層，別只看表面的浪，你要截的是底下的靈脈走向。'
            ],
            complete: [
                '潮勢已息，外海的霧線也退了。',
                '鳳羽杖和陰陽鏡收好，往後你出去，別再自稱外門弟子。'
            ]
        }
    }
};
