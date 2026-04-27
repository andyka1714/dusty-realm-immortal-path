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
    'sect_sword_task_04': {
        id: 'sect_sword_task_04',
        type: QuestType.Side,
        title: '劍宗元嬰：赴三界',
        description: '巡山統領命你斬落元嬰劍墟的守界妖劍，證明你已能踏向三界戰場，為化神做準備。',
        giverId: 'sect_sword_patrol_captain',
        submitNpcId: 'sect_sword_patrol_captain',
        prerequisiteQuestId: 'sect_sword_task_03',
        requirements: [
            { type: 'level', minRealm: MajorRealm.NascentSoul },
            { type: 'kill', targetId: 'm92_b1', count: 1 }
        ],
        rewards: [
            { exp: 16200, spiritStones: 8400 },
            { items: [{ itemId: 'seven_star_sword', count: 1 }, { itemId: 'void_sword_box', count: 1 }, { itemId: 'sword_intent_crystal', count: 1 }] }
        ],
        dialogue: {
            start: [
                '元嬰既成，劍氣便不能只停在山門內。',
                '去斬碎碎星劍垣的守界妖劍，把你的劍意真正推進元嬰層次。'
            ],
            progress: [
                '守界妖劍最擅借界氣反撲，別讓它把你拖回自己的劍路裡。'
            ],
            complete: [
                '很好，這一劍夠穩，也夠狠。',
                '七星龍淵、虛空劍匣與劍元結晶都收下，然後直接去三界戰場（120）。',
                '那裡才是化神修士的門口，別再把元嬰當成終點。'
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
    'sect_beast_task_04': {
        id: 'sect_beast_task_04',
        type: QuestType.Side,
        title: '獸莊元嬰：踏界門',
        description: '獵場監軍命你鎮壓元嬰祖廟的守界獸靈，將肉身鍛到足以踏入三界戰場。',
        giverId: 'sect_beast_huntmaster',
        submitNpcId: 'sect_beast_huntmaster',
        prerequisiteQuestId: 'sect_beast_task_03',
        requirements: [
            { type: 'level', minRealm: MajorRealm.NascentSoul },
            { type: 'kill', targetId: 'm102_b1', count: 1 }
        ],
        rewards: [
            { exp: 16200, spiritStones: 8400 },
            { items: [{ itemId: 'god_fiend_gauntlet', count: 1 }, { itemId: 'immortal_king_shield', count: 1 }, { itemId: 'bood_soul_bead', count: 1 }] }
        ],
        dialogue: {
            start: [
                '元嬰不是讓你收斂拳意，而是讓你把肉身的邊界再往外推一層。',
                '去把蠻荒祖廟那頭守界獸靈壓下來，證明你已經能扛住元嬰層次的反震。'
            ],
            progress: [
                '守界獸靈吃的是祖廟氣血，別被它拖進蠻力對撞裡，先壓住它的節奏。'
            ],
            complete: [
                '很好，這具肉身已經有了壓界的味道。',
                '神魔滅世拳、仙王盾與血魂珠你拿著，然後直接去三界戰場（120）。',
                '化神之路就在那裡，別再把元嬰當成終點。'
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
    },
    'sect_mystic_task_04': {
        id: 'sect_mystic_task_04',
        type: QuestType.Side,
        title: '仙宮元嬰：入戰場',
        description: '外務使命你擊潰虛空裂隙的守界法身，讓神識能真正跨入三界戰場。',
        giverId: 'sect_mystic_envoy',
        submitNpcId: 'sect_mystic_envoy',
        prerequisiteQuestId: 'sect_mystic_task_03',
        requirements: [
            { type: 'level', minRealm: MajorRealm.NascentSoul },
            { type: 'kill', targetId: 'm112_b1', count: 1 }
        ],
        rewards: [
            { exp: 16200, spiritStones: 8400 },
            { items: [{ itemId: 'elemental_chaos_staff', count: 1 }, { itemId: 'heaven_earth_mirror', count: 1 }, { itemId: 'bodhi_seed', count: 1 }] }
        ],
        dialogue: {
            start: [
                '元嬰之後，神識不該只拿來守丹房，而該學會撕開虛空。',
                '去把虛空裂隙裡的守界法身斬了，證明你能承受元嬰層次的天外壓力。'
            ],
            progress: [
                '那道法身借的是虛空餘波，別只看它的法訣，先截住它的靈機。'
            ],
            complete: [
                '不錯，神識已經能穩穩鎮住虛空餘波了。',
                '五行混元杖、乾坤鏡與菩提子都收好，然後直接去三界戰場（120）。',
                '化神的門檻就在那裡，別再把元嬰當成終點。'
            ]
        }
    },

    'sect_sword_world_chapter_01': {
        id: 'sect_sword_world_chapter_01',
        type: QuestType.Main,
        title: '世界章：劍令渡河',
        description: '凌霄劍宗界令使要你從三界戰場（120）穿過隕仙深淵（121），把劍令送到時光長河（130），接上煉虛前的世界章節。',
        giverId: 'world_sword_battlefield_envoy',
        submitNpcId: 'world_sword_void_river_witness',
        prerequisiteQuestId: 'sect_sword_task_04',
        requirements: [
            { type: 'level', minRealm: MajorRealm.SpiritSevering },
            { type: 'dialogue', targetNpcId: 'world_sword_void_river_witness' }
        ],
        rewards: [
            { exp: 238000, spiritStones: 9600 }
        ],
        dialogue: {
            start: [
                '凌霄劍宗的劍不該在三界戰場（120）停住。',
                '帶著這枚界令穿過隕仙深淵（121），去時光長河（130）找長河劍碑守，讓煉虛節點認得你的劍意。'
            ],
            progress: [
                '隕仙深淵會把劍光折成黑霧，若你還能沿著劍痕往北走，時光長河便會回應你。'
            ],
            complete: [
                '劍令到了，凌霄劍宗從 task_04 到三界戰場、隕仙深淵與煉虛節點的路終於接上。',
                '往後時光長河裡若有舊劍痕共鳴，你便知道那不是散落材料，而是世界章節留下的路標。'
            ]
        }
    },
    'sect_beast_world_chapter_01': {
        id: 'sect_beast_world_chapter_01',
        type: QuestType.Main,
        title: '世界章：血旗踏河',
        description: '萬獸山莊血旗使要你從三界戰場（120）扛旗越過隕仙深淵（121），把血旗釘在時光長河（130）的煉虛節點。',
        giverId: 'world_beast_battlefield_envoy',
        submitNpcId: 'world_beast_void_river_witness',
        prerequisiteQuestId: 'sect_beast_task_04',
        requirements: [
            { type: 'level', minRealm: MajorRealm.SpiritSevering },
            { type: 'dialogue', targetNpcId: 'world_beast_void_river_witness' }
        ],
        rewards: [
            { exp: 232000, spiritStones: 9800 }
        ],
        dialogue: {
            start: [
                '萬獸山莊的血旗不能只插在三界戰場（120）的邊線。',
                '扛著它穿過隕仙深淵（121），到時光長河（130）找長河血骨守，讓煉虛亂流記住你的肉身節奏。'
            ],
            progress: [
                '隕仙深淵的黑霧會抽空氣血，別退，退了血旗就會倒。'
            ],
            complete: [
                '血旗釘穩了，萬獸山莊從 task_04 到三界戰場、隕仙深淵與煉虛節點的路沒有斷。',
                '往後時光長河若沖出血骨殘材，你要知道那是山莊世界章節留下的骨標。'
            ]
        }
    },
    'sect_mystic_world_chapter_01': {
        id: 'sect_mystic_world_chapter_01',
        type: QuestType.Main,
        title: '世界章：星牒入河',
        description: '縹緲仙宮星牒使要你從三界戰場（120）校準星牒，經隕仙深淵（121）送到時光長河（130），把化神路標推入煉虛。',
        giverId: 'world_mystic_battlefield_envoy',
        submitNpcId: 'world_mystic_void_river_witness',
        prerequisiteQuestId: 'sect_mystic_task_04',
        requirements: [
            { type: 'level', minRealm: MajorRealm.SpiritSevering },
            { type: 'dialogue', targetNpcId: 'world_mystic_void_river_witness' }
        ],
        rewards: [
            { exp: 244000, spiritStones: 9400 }
        ],
        dialogue: {
            start: [
                '縹緲仙宮的星牒在三界戰場（120）已經亮起，但它還缺隕仙深淵（121）與時光長河（130）的兩段星位。',
                '帶它去找長河星牒守，讓煉虛節點承認你的神識路標。'
            ],
            progress: [
                '隕仙深淵會遮住神識，你要用星牒記住霧線，別讓術式只剩蠻力。'
            ],
            complete: [
                '星牒歸位了，縹緲仙宮從 task_04 到三界戰場、隕仙深淵與煉虛節點的章節終於成形。',
                '往後時光長河若浮起星砂圖卷，那便是仙宮世界章節留給你的回聲。'
            ]
        }
    },
    'sect_sword_world_chapter_02': {
        id: 'sect_sword_world_chapter_02',
        type: QuestType.Main,
        title: '後段世界章節：聖城鑄劍潮',
        description: '凌霄劍宗在萬法聖城（140）重整宗門路線，要你把聖城劍令送往無盡海（150），接續合體後的後段世界章節。',
        giverId: 'world_sword_sacred_city_envoy',
        submitNpcId: 'world_sword_endless_sea_witness',
        prerequisiteQuestId: 'sect_sword_world_chapter_01',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Fusion },
            { type: 'dialogue', targetNpcId: 'world_sword_endless_sea_witness' }
        ],
        rewards: [
            { exp: 368000, spiritStones: 15200 },
            { items: [{ itemId: 'sword_path_starsteel', count: 2 }] }
        ],
        dialogue: {
            start: [
                '凌霄劍宗的宗門路線已從時光長河推到萬法聖城（140），但聖城只是後段世界章節的門檻。',
                '帶著這枚聖城劍令北上無盡海（150），讓海潮替你的劍意刻出下一段世界路標。'
            ],
            progress: [
                '萬法聖城（140）的法度會收束劍光，無盡海（150）的潮線會試出劍脊是否仍直。'
            ],
            complete: [
                '劍令入海，凌霄劍宗的後段世界章節已從萬法聖城（140）接到無盡海（150）。',
                '這批星鋼不是散材，而是宗門路線留給你往更深海域鑄劍的憑證。'
            ]
        }
    },
    'sect_beast_world_chapter_02': {
        id: 'sect_beast_world_chapter_02',
        type: QuestType.Main,
        title: '後段世界章節：聖城血潮印',
        description: '萬獸山莊在萬法聖城（140）校準宗門路線，要你扛著血潮印抵達無盡海（150），把肉身章節推入大乘前線。',
        giverId: 'world_beast_sacred_city_envoy',
        submitNpcId: 'world_beast_endless_sea_witness',
        prerequisiteQuestId: 'sect_beast_world_chapter_01',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Fusion },
            { type: 'dialogue', targetNpcId: 'world_beast_endless_sea_witness' }
        ],
        rewards: [
            { exp: 360000, spiritStones: 15600 },
            { items: [{ itemId: 'beast_path_bloodbone', count: 2 }] }
        ],
        dialogue: {
            start: [
                '萬獸山莊的宗門路線到了萬法聖城（140）不能停，城規只會驗出你的氣血是否夠穩。',
                '扛著血潮印去無盡海（150），讓海壓把後段世界章節壓進你的骨節。'
            ],
            progress: [
                '萬法聖城（140）會量你的肉身根基，無盡海（150）會用浪峰逼你把血脈重新釘牢。'
            ],
            complete: [
                '血潮印落在無盡海（150），萬獸山莊從萬法聖城（140）延出的後段世界章節沒有斷。',
                '這些血骨是宗門路線的海壓記號，往後每一次鍛體都要記住這股潮聲。'
            ]
        }
    },
    'sect_mystic_world_chapter_02': {
        id: 'sect_mystic_world_chapter_02',
        type: QuestType.Main,
        title: '後段世界章節：聖城星潮牒',
        description: '縹緲仙宮在萬法聖城（140）重排宗門路線，要你把星潮牒送到無盡海（150），讓神識章節接上更後段世界。',
        giverId: 'world_mystic_sacred_city_envoy',
        submitNpcId: 'world_mystic_endless_sea_witness',
        prerequisiteQuestId: 'sect_mystic_world_chapter_01',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Fusion },
            { type: 'dialogue', targetNpcId: 'world_mystic_endless_sea_witness' }
        ],
        rewards: [
            { exp: 376000, spiritStones: 14800 },
            { items: [{ itemId: 'mystic_path_starlotus', count: 2 }] }
        ],
        dialogue: {
            start: [
                '縹緲仙宮的宗門路線已在萬法聖城（140）重新排星，但後段世界章節需要海天同證。',
                '把星潮牒帶到無盡海（150），用潮汐替你的神識刻下下一層星位。'
            ],
            progress: [
                '萬法聖城（140）的萬靈法度會校準星牒，無盡海（150）的海霧會驗出神識是否散亂。'
            ],
            complete: [
                '星潮牒在無盡海（150）展開，縹緲仙宮自萬法聖城（140）延伸的後段世界章節已經成形。',
                '這些星蓮是宗門路線的潮汐回聲，往後推演術式時別把海霧當成雜訊。'
            ]
        }
    },
    'sect_sword_world_chapter_03': {
        id: 'sect_sword_world_chapter_03',
        type: QuestType.Main,
        title: 'v3 後段世界章：劫雲帝劍痕',
        description: '凌霄劍宗在劫雲荒原（160）重開劍盟殘痕，要你把帝劍殘痕送到接引仙殿（170），讓宗門世界章正式跨入仙階。',
        giverId: 'world_sword_tribulation_envoy',
        submitNpcId: 'world_sword_immortal_witness',
        prerequisiteQuestId: 'sect_sword_world_chapter_02',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Tribulation },
            { type: 'dialogue', targetNpcId: 'world_sword_immortal_witness' }
        ],
        rewards: [
            { exp: 720000, spiritStones: 28800 },
            { items: [{ itemId: 'sword_path_starsteel', count: 3 }] }
        ],
        dialogue: {
            start: [
                '凌霄劍宗的無盡海劍潮已經成形，但 v3 後段世界章不能停在大乘海線。',
                '從劫雲荒原（160）帶走帝劍殘痕，送往接引仙殿（170），讓仙階也認得這條宗門路線。'
            ],
            progress: [
                '劫雲荒原（160）的雷會逼你放慢劍勢；接引仙殿（170）只承認能穿過雷路仍不偏斜的劍。'
            ],
            complete: [
                '帝劍殘痕入殿，凌霄劍宗的 v3 後段世界章已從劫雲荒原（160）接到接引仙殿（170）。',
                '這批星鋼是仙階劍路的可追蹤憑證，後續仙人境劍盟回聲會讀取這段記憶。'
            ]
        }
    },
    'sect_beast_world_chapter_03': {
        id: 'sect_beast_world_chapter_03',
        type: QuestType.Main,
        title: 'v3 後段世界章：劫雲帝血脈',
        description: '萬獸山莊在劫雲荒原（160）重燃帝血獸脈，要你把帝血骨印送到接引仙殿（170），讓肉身章節進入仙階承接。',
        giverId: 'world_beast_tribulation_envoy',
        submitNpcId: 'world_beast_immortal_witness',
        prerequisiteQuestId: 'sect_beast_world_chapter_02',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Tribulation },
            { type: 'dialogue', targetNpcId: 'world_beast_immortal_witness' }
        ],
        rewards: [
            { exp: 704000, spiritStones: 29600 },
            { items: [{ itemId: 'beast_path_bloodbone', count: 3 }] }
        ],
        dialogue: {
            start: [
                '萬獸山莊的血潮印已承過無盡海，但 v3 後段世界章要把海壓推入仙階血脈。',
                '扛著帝血骨印穿過劫雲荒原（160），到接引仙殿（170）讓仙階血臺驗你的肉身路線。'
            ],
            progress: [
                '劫雲荒原（160）會把氣血劈散，接引仙殿（170）會把剩下的骨印壓成仙階路標。'
            ],
            complete: [
                '帝血骨印落在接引仙殿（170），萬獸山莊的 v3 後段世界章已從劫雲荒原（160）跨入仙階。',
                '這些血骨殘材是宗門肉身路線留下的高壓記號，後續仙人境獸脈回聲會繼續讀取。'
            ]
        }
    },
    'sect_mystic_world_chapter_03': {
        id: 'sect_mystic_world_chapter_03',
        type: QuestType.Main,
        title: 'v3 後段世界章：劫雲星詔牒',
        description: '縹緲仙宮在劫雲荒原（160）校準星詔，要你把星詔牒送到接引仙殿（170），讓法修章節可被仙階觀測。',
        giverId: 'world_mystic_tribulation_envoy',
        submitNpcId: 'world_mystic_immortal_witness',
        prerequisiteQuestId: 'sect_mystic_world_chapter_02',
        requirements: [
            { type: 'level', minRealm: MajorRealm.Tribulation },
            { type: 'dialogue', targetNpcId: 'world_mystic_immortal_witness' }
        ],
        rewards: [
            { exp: 736000, spiritStones: 28000 },
            { items: [{ itemId: 'mystic_path_starlotus', count: 3 }] }
        ],
        dialogue: {
            start: [
                '縹緲仙宮的界海星潮已定，但 v3 後段世界章必須把星位推過雷路。',
                '從劫雲荒原（160）帶走星詔牒，送到接引仙殿（170），讓仙階觀測臺承認這條宗門路線。'
            ],
            progress: [
                '劫雲荒原（160）的雷光會打亂星位，接引仙殿（170）的星臺會驗出你的神識是否能重新排星。'
            ],
            complete: [
                '星詔牒在接引仙殿（170）展開，縹緲仙宮的 v3 後段世界章已從劫雲荒原（160）進入仙階。',
                '這些星魂蓮是宗門星詔留下的材料憑證，後續仙人境星庭回聲會沿著它們展開。'
            ]
        }
    },
    'local_tribulation_cloud_watch': {
        id: 'local_tribulation_cloud_watch',
        type: QuestType.Side,
        title: '劫雲巡候：荒原雲脊',
        description: '劫雲巡候請你在劫雲荒原（160）確認雷雲走向，理解通用渡劫路線與三宗 route 後段如何共用同一片荒原。',
        giverId: 'local_tribulation_cloud_scout',
        submitNpcId: 'local_tribulation_cloud_scout',
        requirements: [
            { type: 'dialogue', targetNpcId: 'local_tribulation_cloud_scout' }
        ],
        rewards: [
            { exp: 96000, spiritStones: 3600 }
        ],
        dialogue: {
            start: [
                '你來得正好。劫雲荒原（160）不是只給宗門使者站崗的地方，通用渡劫修士也得先看懂雲脊。',
                '凌霄劍宗、萬獸山莊、縹緲仙宮都會從這裡把 route 推向接引仙殿，但雷雲本身會先考所有人。'
            ],
            progress: [
                '看雲脊，不要只看雷光。雲脊偏北時才是通往接引仙殿（170）的穩路。'
            ],
            complete: [
                '你已記住劫雲荒原（160）的雲脊走向。往後不論走哪條宗門 route，都不會只靠地圖名稱猜下一步。',
                '這片荒原會把通用渡劫壓力與三宗後段章節壓在一起，接下來才輪到材料和 Workshop。'
            ]
        }
    },
    'local_tribulation_material_clue': {
        id: 'local_tribulation_material_clue',
        type: QuestType.Side,
        title: '雷爐辨材：三路材料',
        description: '雷爐辨材師請你辨識劫雲荒原（160）的三路宗門材料線索：凌霄劍星鋼、萬獸血骨殘材與縹緲星魂蓮如何進入 Workshop。',
        giverId: 'local_tribulation_material_diviner',
        submitNpcId: 'local_tribulation_material_diviner',
        requirements: [
            { type: 'dialogue', targetNpcId: 'local_tribulation_material_diviner' }
        ],
        rewards: [
            { exp: 112000, spiritStones: 4200 }
        ],
        dialogue: {
            start: [
                '劫雲荒原（160）的雷火會把三路材料照亮：凌霄劍星鋼看火星，萬獸血骨殘材看血紋，縹緲星魂蓮看雲隙星砂。',
                '記住它們不是收藏品。Workshop 高階丹方與器方會反過來消耗這些宗門材料。'
            ],
            progress: [
                '若只知道材料名字，到了爐前還是會斷線；你要知道來源、route 與 Workshop sink 是同一條鏈。'
            ],
            complete: [
                '很好。凌霄劍星鋼、萬獸血骨殘材、縹緲星魂蓮都能在劫雲荒原（160）找到線索。',
                '往後看見 Workshop recipe 要求這些材料時，你就知道不是憑空消耗，而是從宗門 route 接回來。'
            ]
        }
    },
    'local_immortal_registry_check': {
        id: 'local_immortal_registry_check',
        type: QuestType.Side,
        title: '仙籍錄事：接引分欄',
        description: '仙籍錄事請你在接引仙殿（170）確認飛昇身份分欄，理解通用仙籍與宗門 route 記錄如何分開承接。',
        giverId: 'local_immortal_registry_keeper',
        submitNpcId: 'local_immortal_registry_keeper',
        requirements: [
            { type: 'dialogue', targetNpcId: 'local_immortal_registry_keeper' }
        ],
        rewards: [
            { exp: 144000, spiritStones: 5200 }
        ],
        dialogue: {
            start: [
                '接引仙殿（170）會先登通用仙籍，再把凌霄劍宗、萬獸山莊、縹緲仙宮的 route 記憶分欄記錄。',
                '若不分欄，後面的仙人境回聲就會把帝劍、帝血、星詔混成同一個模糊獎勵。'
            ],
            progress: [
                '看案卷上的欄名：通用仙籍管身份，宗門 route 管來源，兩者不能互相替代。'
            ],
            complete: [
                '接引仙殿（170）的分欄已核對。往後帝劍、帝血、星詔都能按各自 route 被 UI 與內容追蹤。',
                '這樣玩家看到仙殿 NPC 時，不會只知道自己到了仙界，還能知道哪條宗門路線被接上。'
            ]
        }
    },
    'local_immortal_material_clue': {
        id: 'local_immortal_material_clue',
        type: QuestType.Side,
        title: '仙材案牘：丹方與帝兵',
        description: '仙材案牘師請你核對接引仙殿（170）的材料案底，確認帝劍、帝血與星詔如何進入高階丹方與帝兵。',
        giverId: 'local_immortal_material_archivist',
        submitNpcId: 'local_immortal_material_archivist',
        requirements: [
            { type: 'dialogue', targetNpcId: 'local_immortal_material_archivist' }
        ],
        rewards: [
            { exp: 156000, spiritStones: 5800 }
        ],
        dialogue: {
            start: [
                '帝劍殘痕能入帝兵，帝血骨印能壓肉身器方，星詔牒能穩高階丹方。',
                '接引仙殿（170）只負責把案底記清，真正的消耗會回到 Workshop。'
            ],
            progress: [
                '高階丹方與帝兵都怕來源不清。案底一亂，材料就會像外掛掉落一樣沒有脈絡。'
            ],
            complete: [
                '案牘已核：帝劍、帝血、星詔各自對上高階丹方與帝兵火候。',
                '往後看 Workshop sink 時，接引仙殿（170）的材料案底會讓來源與用途保持可讀。'
            ]
        }
    },
    'local_guixu_rift_chart': {
        id: 'local_guixu_rift_chart',
        type: QuestType.Side,
        title: '歸墟界圖：裂界終盤',
        description: '歸墟界圖師請你在歸墟裂界（182）標記通用終盤路徑，避免仙帝前夕只剩怪物與 Boss。',
        giverId: 'local_guixu_rift_cartographer',
        submitNpcId: 'local_guixu_rift_cartographer',
        requirements: [
            { type: 'dialogue', targetNpcId: 'local_guixu_rift_cartographer' }
        ],
        rewards: [
            { exp: 188000, spiritStones: 7600 }
        ],
        dialogue: {
            start: [
                '歸墟裂界（182）會把凌霄劍宗、萬獸山莊、縹緲仙宮的 route 回聲全壓進終盤裂縫。',
                '但你先畫通用界圖。沒有地圖骨架，後續終盤內容只會變成到處刷怪。'
            ],
            progress: [
                '裂界風向會在太初外環與鴻蒙道宮之間折返，先記路，再談宗門回聲。'
            ],
            complete: [
                '歸墟裂界（182）的終盤界圖已成。通用路徑、宗門 route 與 Workshop 材料不再各說各話。',
                '下一步可以把仙帝終盤 loop 接在這張圖上，而不是再開一套新 runtime。'
            ]
        }
    },
    'local_guixu_material_clue': {
        id: 'local_guixu_material_clue',
        type: QuestType.Side,
        title: '歸墟終盤爐：三材合流',
        description: '歸墟終盤爐師請你確認歸墟裂界（182）的三材合流：凌霄劍星鋼、萬獸血骨殘材與縹緲星魂蓮如何形成終盤 Workshop sink。',
        giverId: 'local_guixu_material_forgemaster',
        submitNpcId: 'local_guixu_material_forgemaster',
        requirements: [
            { type: 'dialogue', targetNpcId: 'local_guixu_material_forgemaster' }
        ],
        rewards: [
            { exp: 208000, spiritStones: 8400 }
        ],
        dialogue: {
            start: [
                '歸墟裂界（182）的終盤爐口會把凌霄劍星鋼、萬獸血骨殘材、縹緲星魂蓮壓在同一個火候裡。',
                '這不是新材料，而是把三宗 route 的來源與終盤 Workshop sink 接起來。'
            ],
            progress: [
                '缺星鋼，帝兵無骨；缺血骨，肉身器方無壓；缺星魂蓮，仙品丹火收不住。'
            ],
            complete: [
                '三材合流已記入歸墟裂界（182）的終盤爐口：凌霄劍星鋼、萬獸血骨殘材、縹緲星魂蓮各有來源也各有消耗。',
                '往後擴仙帝 v4 loop 時，Workshop 不必再猜這些材料從哪裡來。'
            ]
        }
    }
};
