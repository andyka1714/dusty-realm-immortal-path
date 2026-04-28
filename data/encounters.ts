import {
  MajorRealm,
  MajorRealmCN,
  ProfessionType,
  type EncounterPresentationCue,
  type PendingEncounter,
} from "../types";

export type EncounterRepeatPolicy = "repeatable" | "once_per_run";

export interface EncounterSelectorContext {
  majorRealm: MajorRealm;
  profession: ProfessionType;
  completedQuestIds: string[];
  resolvedEventIds: string[];
  worldMemoryTags?: string[];
}

export interface EncounterEventSelector {
  weight?: number;
  repeatPolicy?: EncounterRepeatPolicy;
  eligibleProfessions?: ProfessionType[];
  requiredCompletedQuestIds?: string[];
  requiredResolvedEventIds?: string[];
  requiredWorldMemoryTags?: string[];
}

export interface EncounterEventPresentation {
  categoryLabel?: string;
  routeLabel?: string;
  chainLabel?: string;
  memoryCue?: string;
  sectLabel?: string;
}

export interface EncounterChainMetadata {
  chainId: string;
  step: number;
  worldMemoryTags?: string[];
}

export interface EncounterChoiceReward {
  experience?: number;
  spiritStones?: number;
  items?: Array<{
    itemId: string;
    count: number;
  }>;
  logMessage: string;
}

export interface EncounterChoiceCue {
  tone?: "steady" | "risky" | "costly";
  tags?: Array<{
    kind: "resource" | "cost" | "benefit" | "risk";
    label: string;
  }>;
}

export interface EncounterChoice {
  id: string;
  label: string;
  description: string;
  reward: EncounterChoiceReward;
  cue?: EncounterChoiceCue;
}

export interface EncounterEvent {
  id: string;
  title: string;
  description: string;
  minRealm: MajorRealm;
  maxRealm: MajorRealm;
  choices: EncounterChoice[];
  selector?: EncounterEventSelector;
  presentation?: EncounterEventPresentation;
  chain?: EncounterChainMetadata;
}

const PROFESSION_LABELS: Record<ProfessionType, string> = {
  [ProfessionType.None]: "通用",
  [ProfessionType.Sword]: "劍修",
  [ProfessionType.Body]: "體修",
  [ProfessionType.Mage]: "法修",
};

const createSingleRealmEncounterEvent = (
  event: Omit<EncounterEvent, "minRealm" | "maxRealm"> & { realm: MajorRealm }
): EncounterEvent => {
  const { realm, ...encounterEvent } = event;

  return {
    ...encounterEvent,
    minRealm: realm,
    maxRealm: realm,
  };
};

const ENCOUNTER_ITEM_CUE_LABELS: Record<string, string> = {
  spirit_herb: "聚靈草",
  iron_ore: "玄鐵礦",
  wolf_fang: "妖狼牙",
  bt_spirit_void: "太虛破障丹",
  bt_void_fusion: "萬法歸一髓",
  bt_fusion_maha: "天道感悟果",
  bt_maha_trib: "九轉渡劫丹",
  bt_trib_immortal: "飛昇仙引",
  bt_immortal_emperor: "鴻蒙本源",
  sword_path_starsteel: "凌霄劍星鋼",
  beast_path_bloodbone: "萬獸血骨殘材",
  mystic_path_starlotus: "縹緲星魂蓮",
  emperor_crown: "帝冠",
};

const HIGH_REALM_EVENT_CUE_FLOOR = MajorRealm.SpiritSevering;

const resolveDefaultHighRealmPresentation = (
  event: EncounterEvent
): EncounterEventPresentation | undefined => {
  if (event.maxRealm < HIGH_REALM_EVENT_CUE_FLOOR) {
    return event.presentation;
  }

  const realmLabel =
    event.minRealm === event.maxRealm
      ? MajorRealmCN[event.minRealm]
      : `${MajorRealmCN[event.minRealm]}-${MajorRealmCN[event.maxRealm]}`;

  return {
    categoryLabel: event.presentation?.categoryLabel ?? `${realmLabel}通用機緣`,
    routeLabel: event.presentation?.routeLabel ?? event.title,
    chainLabel: event.presentation?.chainLabel,
    memoryCue: event.presentation?.memoryCue,
    sectLabel: event.presentation?.sectLabel,
  };
};

const resolveDefaultChoiceCue = (
  event: EncounterEvent,
  choice: EncounterChoice
): EncounterChoiceCue | undefined => {
  if (choice.cue || event.maxRealm < HIGH_REALM_EVENT_CUE_FLOOR) {
    return choice.cue;
  }

  const tags: EncounterChoiceCue["tags"] = [];

  choice.reward.items?.forEach((item) => {
    tags.push({
      kind: "resource",
      label: `${ENCOUNTER_ITEM_CUE_LABELS[item.itemId] ?? item.itemId} x${item.count}`,
    });
  });

  if (choice.reward.spiritStones !== undefined) {
    tags.push({
      kind: choice.reward.spiritStones < 0 ? "cost" : "resource",
      label:
        choice.reward.spiritStones < 0
          ? `耗費靈石 ${Math.abs(choice.reward.spiritStones)}`
          : `靈石 +${choice.reward.spiritStones}`,
    });
  }

  if (choice.reward.experience !== undefined) {
    tags.push({ kind: "benefit", label: "修為收益" });
  }

  if (tags.length === 0) {
    tags.push({ kind: "benefit", label: "事件收益" });
  }

  const riskyText = `${choice.label}${choice.description}${choice.reward.logMessage}`;
  const tone: EncounterChoiceCue["tone"] =
    choice.reward.spiritStones !== undefined && choice.reward.spiritStones < 0
      ? "costly"
      : /高壓|殘雷|雷|硬|劫|搶|裂界/.test(riskyText)
        ? "risky"
        : "steady";

  return { tone, tags };
};

const normalizeEncounterEvent = (event: EncounterEvent): EncounterEvent => ({
  ...event,
  presentation: resolveDefaultHighRealmPresentation(event),
  choices: event.choices.map((choice) => ({
    ...choice,
    cue: resolveDefaultChoiceCue(event, choice),
  })),
});

const normalizeEncounterEvents = (
  events: Record<string, EncounterEvent>
): Record<string, EncounterEvent> =>
  Object.fromEntries(
    Object.entries(events).map(([eventId, event]) => [eventId, normalizeEncounterEvent(event)])
  );

export const getEncounterPreviewCue = (
  event: EncounterEvent
): EncounterPresentationCue => ({
  chainLabel: event.presentation?.chainLabel,
  memoryCue: event.presentation?.memoryCue,
  routeLabel: event.presentation?.routeLabel,
  professionLabel:
    event.selector?.eligibleProfessions?.length === 1
      ? PROFESSION_LABELS[event.selector.eligibleProfessions[0]]
      : undefined,
  sectLabel:
    event.presentation?.sectLabel ??
    (event.selector?.requiredCompletedQuestIds?.length ? "宗門前置已完成" : undefined),
});

const RAW_ENCOUNTER_EVENTS: Record<string, EncounterEvent> = {
  herb_garden: {
    id: "herb_garden",
    title: "荒山藥圃",
    description: "你在山霧間發現一片被陣紋遮掩的荒廢藥圃，藥香仍未完全散去。",
    minRealm: MajorRealm.Mortal,
    maxRealm: MajorRealm.GoldenCore,
    selector: {
      repeatPolicy: "once_per_run",
    },
    presentation: {
      categoryLabel: "山野機緣",
      routeLabel: "荒山藥圃",
    },
    choices: [
      {
        id: "gather_herbs",
        label: "採摘靈草",
        description: "趁藥圃尚未崩壞前，搶收可用靈草。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "聚靈草 x2" },
            { kind: "benefit", label: "煉丹材料" },
          ],
        },
        reward: {
          items: [{ itemId: "spirit_herb", count: 2 }],
          logMessage: "你趁亂採下兩株聚靈草，正好能補進丹爐。",
        },
      },
      {
        id: "meditate",
        label: "凝神觀想",
        description: "不動其物，只觀察殘留靈機，化作一段短暫感悟。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "穩定修為" },
            { kind: "risk", label: "低風險" },
          ],
        },
        reward: {
          experience: 80,
          logMessage: "你在殘破藥圃中靜坐片刻，藥香化作一段溫和修為。",
        },
      },
    ],
  },
  wandering_smith: {
    id: "wandering_smith",
    title: "流火匠影",
    description: "一名背著破爐的流浪匠人暫歇路旁，願意用低價替你點出礦材中的雜質。",
    minRealm: MajorRealm.Mortal,
    maxRealm: MajorRealm.Foundation,
    choices: [
      {
        id: "buy_ore",
        label: "購下礦材",
        description: "拿出靈石，換取他手中尚未完全冷卻的玄鐵礦。",
        cue: {
          tone: "costly",
          tags: [
            { kind: "cost", label: "耗費靈石" },
            { kind: "resource", label: "玄鐵礦 x2" },
          ],
        },
        reward: {
          items: [{ itemId: "iron_ore", count: 2 }],
          spiritStones: -20,
          logMessage: "你花了些靈石，換到兩份仍帶火氣的玄鐵礦。",
        },
      },
      {
        id: "seek_advice",
        label: "請教鍛法",
        description: "不買礦，單純請他指點如何避開凡鐵脆裂。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "妖狼牙 x1" },
            { kind: "benefit", label: "煉器起手" },
          ],
        },
        reward: {
          items: [{ itemId: "wolf_fang", count: 1 }],
          logMessage: "匠人隨手丟來一枚妖狼牙，示意你拿去試手。",
        },
      },
    ],
  },
  sword_edge_resonance: {
    id: "sword_edge_resonance",
    title: "劍痕共鳴",
    description: "一截古劍殘痕在山風中自鳴，只有習慣以劍意校正呼吸的修士能聽懂其中節奏。",
    minRealm: MajorRealm.Foundation,
    maxRealm: MajorRealm.GoldenCore,
    selector: {
      eligibleProfessions: [ProfessionType.Sword],
    },
    presentation: {
      categoryLabel: "職業機緣",
      routeLabel: "劍修",
    },
    choices: [
      {
        id: "temper_edge",
        label: "借痕養鋒",
        description: "讓殘痕中的鋒意替你校正劍勢，補一段穩定修為。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "穩定修為" },
            { kind: "benefit", label: "劍勢校正" },
          ],
        },
        reward: {
          experience: 2600,
          logMessage: "你順著古劍殘痕調整呼吸，讓本來浮躁的劍勢重新沉了下來。",
        },
      },
      {
        id: "strip_shards",
        label: "拆取劍晶",
        description: "不求參悟，只把殘痕裡最實用的劍晶拆下帶走。",
        cue: {
          tone: "costly",
          tags: [
            { kind: "cost", label: "靈石周轉" },
            { kind: "resource", label: "劍晶資材" },
          ],
        },
        reward: {
          spiritStones: 420,
          logMessage: "你從殘痕中拆下幾枚劍晶，至少補了一輪養劍與洞府周轉。",
        },
      },
    ],
  },
  body_bone_cache: {
    id: "body_bone_cache",
    title: "荒骨藏竅",
    description: "一處蠻荒獸骨堆裡藏著鍛體前輩留下的骨竅標記，只有敢扛傷的體修才看得出價值。",
    minRealm: MajorRealm.Foundation,
    maxRealm: MajorRealm.GoldenCore,
    selector: {
      eligibleProfessions: [ProfessionType.Body],
    },
    presentation: {
      categoryLabel: "職業機緣",
      routeLabel: "體修",
    },
    choices: [
      {
        id: "temper_bones",
        label: "就地鍛骨",
        description: "借荒骨殘威鍛一次筋骨，換更扎實的肉身底盤。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓鍛體" },
            { kind: "benefit", label: "體修修為" },
          ],
        },
        reward: {
          experience: 2550,
          logMessage: "你頂著荒骨殘威鍛體一輪，筋骨雖痛，氣血卻更沉更穩了。",
        },
      },
      {
        id: "salvage_marrow",
        label: "刮取骨髓",
        description: "不扛鍛體風險，改收走堆裡還能用的蠻荒骨髓。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "骨髓資材" },
            { kind: "benefit", label: "後續鍛體" },
          ],
        },
        reward: {
          spiritStones: 380,
          logMessage: "你小心刮取荒骨中的殘髓，替後續鍛體與周轉留下一筆底子。",
        },
      },
    ],
  },
  mage_ink_resonance: {
    id: "mage_ink_resonance",
    title: "靈墨鳴紋",
    description: "半空浮現一片靈墨鳴紋，只有擅長推演術式的法修能在字跡散去前讀完其中脈絡。",
    minRealm: MajorRealm.Foundation,
    maxRealm: MajorRealm.GoldenCore,
    selector: {
      eligibleProfessions: [ProfessionType.Mage],
    },
    presentation: {
      categoryLabel: "職業機緣",
      routeLabel: "法修",
    },
    choices: [
      {
        id: "copy_runes",
        label: "拓下靈紋",
        description: "把最關鍵的靈紋拓入玉簡，留作往後推演術式的底稿。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "術式底稿" },
            { kind: "benefit", label: "法修修為" },
          ],
        },
        reward: {
          experience: 2720,
          logMessage: "你及時拓下靈墨鳴紋的主脈，讓法修前中段的術式推演順了一截。",
        },
      },
      {
        id: "sell_ink",
        label: "收走靈墨",
        description: "不耗時間參悟，改把靈墨殘華全部收走換成周轉資源。",
        cue: {
          tone: "costly",
          tags: [
            { kind: "resource", label: "靈墨殘華" },
            { kind: "cost", label: "資源周轉" },
          ],
        },
        reward: {
          spiritStones: 460,
          logMessage: "你把未散的靈墨殘華盡數收走，替洞府與術式消耗多補了一口氣。",
        },
      },
    ],
  },
  beast_sect_blood_pit: {
    id: "beast_sect_blood_pit",
    title: "獸莊血池",
    description: "萬獸山莊在外域留下一口封起來的血池，只給真正經過莊內洗禮的弟子開封。",
    minRealm: MajorRealm.Foundation,
    maxRealm: MajorRealm.GoldenCore,
    selector: {
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_join"],
    },
    presentation: {
      categoryLabel: "宗門暗線",
      routeLabel: "萬獸山莊",
    },
    choices: [
      {
        id: "bathe_in_blood",
        label: "引血淬體",
        description: "直接承下血池殘威，把體魄往上再推一段。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高風險鍛體" },
            { kind: "benefit", label: "肉身修為" },
          ],
        },
        reward: {
          experience: 3200,
          logMessage: "你頂著血池殘威強行淬體，疼痛幾乎撕裂筋骨，卻也換來更硬的肉身底盤。",
        },
      },
      {
        id: "seal_vials",
        label: "封存血髓",
        description: "不在現場淬體，改把血池中最穩定的血髓封進玉瓶帶走。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "血髓資材" },
            { kind: "benefit", label: "宗門周轉" },
          ],
        },
        reward: {
          spiritStones: 760,
          logMessage: "你封起幾瓶穩定血髓，讓後續鍛體與洞府周轉多了一條更穩的路。",
        },
      },
    ],
  },
  mystic_sect_star_cache: {
    id: "mystic_sect_star_cache",
    title: "星儀秘匣",
    description: "縹緲仙宮的外務使在邊境藏了一只星儀秘匣，只讓真正進過仙宮門牆的弟子開封。",
    minRealm: MajorRealm.Foundation,
    maxRealm: MajorRealm.GoldenCore,
    selector: {
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_join"],
    },
    presentation: {
      categoryLabel: "宗門暗線",
      routeLabel: "縹緲仙宮",
    },
    choices: [
      {
        id: "read_star_chart",
        label: "參讀星圖",
        description: "現場解讀星儀秘匣中的推演星圖，把它化成更扎實的術式節奏。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "星圖推演" },
            { kind: "benefit", label: "法修修為" },
          ],
        },
        reward: {
          experience: 3340,
          logMessage: "你在星儀秘匣前推演星圖，讓法修中期的術式節奏和洞府規劃更容易接起來。",
        },
      },
      {
        id: "take_astral_ink",
        label: "收起星墨",
        description: "不在原地耗時推演，改把秘匣內的星墨與靈資全部帶走。",
        cue: {
          tone: "costly",
          tags: [
            { kind: "resource", label: "星墨資材" },
            { kind: "cost", label: "法寶周轉" },
          ],
        },
        reward: {
          spiritStones: 820,
          logMessage: "你把秘匣裡封存的星墨與靈資一併帶走，讓後續法寶與洞府周轉寬鬆了不少。",
        },
      },
    ],
  },
  nascent_world_gate_survey: createSingleRealmEncounterEvent({
    id: "nascent_world_gate_survey",
    title: "嬰火界門測繪",
    description: "元嬰邊境的界門偶爾吐出殘破星砂，正好能讓修士第一次看見後段世界線的輪廓。",
    realm: MajorRealm.NascentSoul,
    presentation: {
      categoryLabel: "元嬰世界里程碑",
      routeLabel: "三界邊門",
    },
    choices: [
      {
        id: "survey_gate",
        label: "測繪界門",
        description: "穩住嬰火，記下界門吐納的節點，替後續化神與煉虛路線預留方向。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "世界線測繪" },
            { kind: "benefit", label: "元嬰修為" },
          ],
        },
        reward: {
          experience: 64000,
          logMessage: "你測完三界邊門的吐納節點，元嬰後段的路線不再只剩閉關硬磨。",
        },
      },
      {
        id: "collect_gate_sand",
        label: "收集界砂",
        description: "不深究界門，只收走附近可換成洞府周轉的界砂。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "界門星砂" },
            { kind: "benefit", label: "洞府周轉" },
          ],
        },
        reward: {
          spiritStones: 980,
          logMessage: "你收走界門周邊的殘砂，替元嬰後段的洞府與丹火多補了一筆周轉。",
        },
      },
    ],
  }),
  nascent_sword_soul_sheath: createSingleRealmEncounterEvent({
    id: "nascent_sword_soul_sheath",
    title: "元嬰劍鞘",
    description: "一口空鞘懸在嬰火旁，只回應能以本命劍意校準神魂的劍修。",
    realm: MajorRealm.NascentSoul,
    selector: {
      eligibleProfessions: [ProfessionType.Sword],
    },
    presentation: {
      categoryLabel: "元嬰職業機緣",
      routeLabel: "劍修",
      chainLabel: "劍脈回聲",
      memoryCue: "劍鞘共鳴會在未來留下可追蹤的路線記憶。",
      sectLabel: "劍宗前置回響",
    },
    chain: {
      chainId: "route-memory-sword",
      step: 1,
      worldMemoryTags: ["route:sword:soul-sheath"],
    },
    choices: [
      {
        id: "temper_soul_edge",
        label: "以鞘養嬰劍",
        description: "把劍意收入空鞘，讓嬰火與劍勢先學會同一個節拍。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "劍意校準" },
            { kind: "benefit", label: "劍修修為" },
          ],
        },
        reward: {
          experience: 72000,
          logMessage: "你借元嬰劍鞘校準劍意，本命嬰火與劍勢終於不再互相拉扯。",
        },
      },
      {
        id: "trade_sheath_mark",
        label: "拓下鞘紋",
        description: "拓走鞘上的劍紋，留給後續養劍與百業鍛材周轉。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "元嬰劍紋" },
            { kind: "benefit", label: "煉器路線" },
          ],
        },
        reward: {
          spiritStones: 1180,
          logMessage: "你拓下元嬰劍鞘上的劍紋，換回一筆足以支撐養劍與鍛台的靈資。",
        },
      },
    ],
  }),
  nascent_body_blooddrum: createSingleRealmEncounterEvent({
    id: "nascent_body_blooddrum",
    title: "嬰骨血鼓",
    description: "荒原地底傳出血鼓聲，只有體修能把那股震盪導入元嬰筋骨。",
    realm: MajorRealm.NascentSoul,
    selector: {
      eligibleProfessions: [ProfessionType.Body],
    },
    presentation: {
      categoryLabel: "元嬰職業機緣",
      routeLabel: "體修",
      chainLabel: "獸骨回聲",
      memoryCue: "血鼓鍛出的肉身印記，會在後續保留下來。",
      sectLabel: "獸莊前置回響",
    },
    chain: {
      chainId: "route-memory-body",
      step: 1,
      worldMemoryTags: ["route:body:blooddrum"],
    },
    choices: [
      {
        id: "match_blooddrum",
        label: "合拍血鼓",
        description: "讓氣血跟著鼓聲起伏，借震盪把元嬰筋骨重新壓實。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓鍛體" },
            { kind: "benefit", label: "體修修為" },
          ],
        },
        reward: {
          experience: 70000,
          logMessage: "你咬牙承下嬰骨血鼓的震盪，元嬰筋骨被打得更沉更穩。",
        },
      },
      {
        id: "collect_bone_powder",
        label: "收走骨粉",
        description: "避開最重的鼓震，只收走血鼓邊緣散落的骨粉與靈材。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "血鼓骨粉" },
            { kind: "benefit", label: "鍛體周轉" },
          ],
        },
        reward: {
          spiritStones: 1120,
          logMessage: "你收走血鼓旁的骨粉與靈材，體修後段的鍛體消耗多了一道緩衝。",
        },
      },
    ],
  }),
  nascent_mage_soul_lantern: createSingleRealmEncounterEvent({
    id: "nascent_mage_soul_lantern",
    title: "嬰魂星燈",
    description: "一盞星燈在識海邊緣忽明忽暗，只有法修能把燈焰拆成可用術式節點。",
    realm: MajorRealm.NascentSoul,
    selector: {
      eligibleProfessions: [ProfessionType.Mage],
    },
    presentation: {
      categoryLabel: "元嬰職業機緣",
      routeLabel: "法修",
      chainLabel: "星燈回聲",
      memoryCue: "星燈拆解後留下的識海印記，會持續影響後續路線。",
      sectLabel: "仙宮前置回響",
    },
    chain: {
      chainId: "route-memory-mage",
      step: 1,
      worldMemoryTags: ["route:mage:lantern"],
    },
    choices: [
      {
        id: "read_lantern_nodes",
        label: "讀取燈焰節點",
        description: "以神識順著燈焰推演，把元嬰術式的節點重新排好。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "術式節點" },
            { kind: "benefit", label: "法修修為" },
          ],
        },
        reward: {
          experience: 74000,
          logMessage: "你讀完嬰魂星燈的節點，元嬰後段的術式推演明顯順了一截。",
        },
      },
      {
        id: "bottle_lantern_ash",
        label: "封存燈灰",
        description: "把星燈燒落的燈灰封進玉瓶，留作洞府與丹火推演底料。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "星燈灰燼" },
            { kind: "benefit", label: "煉丹推演" },
          ],
        },
        reward: {
          spiritStones: 1220,
          logMessage: "你封起嬰魂星燈的灰燼，換回一批足以支撐術式與丹火的周轉靈資。",
        },
      },
    ],
  }),
  fusion_sword_skyforge_oath: createSingleRealmEncounterEvent({
    id: "fusion_sword_skyforge_oath",
    title: "合體劍爐誓",
    description: "前一世留下的劍鞘回聲，在合體初期化作一座能重新校準劍勢的心爐。",
    realm: MajorRealm.Fusion,
    selector: {
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_task_04"],
      requiredResolvedEventIds: ["nascent_sword_soul_sheath"],
      requiredWorldMemoryTags: ["route:sword:soul-sheath"],
    },
    presentation: {
      categoryLabel: "合體宗門回響",
      routeLabel: "凌霄劍宗",
      chainLabel: "劍脈續響",
      memoryCue: "合體劍爐會延續前一段元嬰劍鞘留下的路線記憶。",
      sectLabel: "凌霄劍宗後段承接",
    },
    chain: {
      chainId: "route-memory-sword",
      step: 2,
      worldMemoryTags: ["route:sword:skyforge"],
    },
    choices: [
      {
        id: "temper_skyforge",
        label: "鍛成劍爐",
        description: "把劍勢壓進心爐，讓合體後的劍修節奏更穩。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "劍脈續響" },
            { kind: "benefit", label: "劍修修為" },
          ],
        },
        reward: {
          experience: 212000,
          logMessage: "你讓劍鞘回聲沉入心爐，合體後的劍勢從此不再散亂。",
        },
      },
      {
        id: "seal_skyforge",
        label: "封印劍火",
        description: "不立即鍛勢，改把爐中劍火封存成後續鍛材。",
        cue: {
          tone: "costly",
          tags: [
            { kind: "resource", label: "劍爐殘火" },
            { kind: "benefit", label: "後續鍛材" },
          ],
        },
        reward: {
          spiritStones: 1680,
          logMessage: "你封起劍爐殘火，讓後續的鍛材與洞府周轉多了一筆穩定底氣。",
        },
      },
    ],
  }),
  fusion_beast_lawbody_trial: createSingleRealmEncounterEvent({
    id: "fusion_beast_lawbody_trial",
    title: "合體獸身法試",
    description: "前一世的血鼓震盪化作新的肉身試煉，讓體修在合體初期重新定住骨血。",
    realm: MajorRealm.Fusion,
    selector: {
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_task_04"],
      requiredResolvedEventIds: ["nascent_body_blooddrum"],
      requiredWorldMemoryTags: ["route:body:blooddrum"],
    },
    presentation: {
      categoryLabel: "合體宗門回響",
      routeLabel: "萬獸山莊",
      chainLabel: "獸骨續響",
      memoryCue: "血鼓鍛出的肉身記憶會在合體階段延續成新的鍛體節奏。",
      sectLabel: "萬獸山莊後段承接",
    },
    chain: {
      chainId: "route-memory-body",
      step: 2,
      worldMemoryTags: ["route:body:lawbody"],
    },
    choices: [
      {
        id: "stabilize_fusion_body",
        label: "壓實獸身",
        description: "承接血鼓殘響，讓合體期肉身先穩下來。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓鍛體" },
            { kind: "benefit", label: "體修修為" },
          ],
        },
        reward: {
          experience: 208000,
          logMessage: "你以血鼓殘響壓實獸身，合體期的肉身節奏終於穩住。",
        },
      },
      {
        id: "harvest_beast_bone",
        label: "收起獸骨",
        description: "不在原地硬扛，先把試煉留下的獸骨封存起來。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "獸骨殘材" },
            { kind: "benefit", label: "鍛體周轉" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 2 }],
          logMessage: "你封起試煉後的獸骨殘材，讓後續鍛體與器材周轉多了憑依。",
        },
      },
    ],
  }),
  fusion_mystic_constellation_court: createSingleRealmEncounterEvent({
    id: "fusion_mystic_constellation_court",
    title: "合體星庭裁",
    description: "前一世的星燈記憶在合體期凝成星庭，法修若能回應，便能把神識與術式重新並軌。",
    realm: MajorRealm.Fusion,
    selector: {
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_task_04"],
      requiredResolvedEventIds: ["nascent_mage_soul_lantern"],
      requiredWorldMemoryTags: ["route:mage:lantern"],
    },
    presentation: {
      categoryLabel: "合體宗門回響",
      routeLabel: "縹緲仙宮",
      chainLabel: "星圖續響",
      memoryCue: "星燈記憶會在合體階段化作星庭裁定的基底。",
      sectLabel: "縹緲仙宮後段承接",
    },
    chain: {
      chainId: "route-memory-mage",
      step: 2,
      worldMemoryTags: ["route:mage:constellation"],
    },
    choices: [
      {
        id: "align_constellation",
        label: "對齊星庭",
        description: "讓合體神識順著星庭裁定重新排布。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "星圖續響" },
            { kind: "benefit", label: "法修修為" },
          ],
        },
        reward: {
          experience: 220000,
          logMessage: "你對齊星庭裁定，合體期的神識與術式終於順成一線。",
        },
      },
      {
        id: "archive_starlight",
        label: "封存星光",
        description: "不在原地推演，改把星庭碎光封入玉匣。",
        cue: {
          tone: "costly",
          tags: [
            { kind: "resource", label: "星庭碎光" },
            { kind: "benefit", label: "後續推演" },
          ],
        },
        reward: {
          spiritStones: 1740,
          logMessage: "你封存星庭碎光，替後續推演與洞府周轉保下一層餘裕。",
        },
      },
    ],
  }),
  mahayana_sword_heaven_pillar_duel: createSingleRealmEncounterEvent({
    id: "mahayana_sword_heaven_pillar_duel",
    title: "大乘天柱劍決",
    description: "合體劍爐留下的路線記憶，會在大乘天柱前化成一場更高階的劍決。",
    realm: MajorRealm.Mahayana,
    selector: {
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_task_04"],
      requiredResolvedEventIds: ["fusion_sword_skyforge_oath"],
      requiredWorldMemoryTags: ["route:sword:skyforge"],
    },
    presentation: {
      categoryLabel: "大乘宗門記憶",
      routeLabel: "凌霄劍宗",
      chainLabel: "劍脈定勢",
      memoryCue: "合體期留下的劍脈記憶，在這裡定成天柱劍決。",
      sectLabel: "凌霄劍宗大乘承接",
    },
    chain: {
      chainId: "route-memory-sword",
      step: 3,
      worldMemoryTags: ["route:sword:heaven-pillar"],
    },
    choices: [
      {
        id: "win_heaven_pillar",
        label: "破柱定劍",
        description: "一劍破開天柱，把大乘劍勢定成更高一層的輪廓。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓劍決" },
            { kind: "benefit", label: "大乘劍修" },
          ],
        },
        reward: {
          experience: 305000,
          logMessage: "你以天柱劍決破開最後一層劍勢瓶頸，大乘後段更難動搖。",
        },
      },
      {
        id: "store_heaven_pillar",
        label: "封存天柱",
        description: "不急著破柱，先把天柱餘韻封存下來。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "天柱劍韻" },
            { kind: "benefit", label: "後續鍛材" },
          ],
        },
        reward: {
          spiritStones: 2420,
          logMessage: "你把天柱劍韻封入劍匣，替後續鍛材與洞府周轉留下一筆厚底。",
        },
      },
    ],
  }),
  mahayana_beast_worldspine_procession: createSingleRealmEncounterEvent({
    id: "mahayana_beast_worldspine_procession",
    title: "大乘獸脊巡行",
    description: "合體獸身留下的記憶，會在大乘階段化作一場沿著世界脊骨前行的巡行。",
    realm: MajorRealm.Mahayana,
    selector: {
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_task_04"],
      requiredResolvedEventIds: ["fusion_beast_lawbody_trial"],
      requiredWorldMemoryTags: ["route:body:lawbody"],
    },
    presentation: {
      categoryLabel: "大乘宗門記憶",
      routeLabel: "萬獸山莊",
      chainLabel: "獸骨定勢",
      memoryCue: "合體期鍛出的肉身記憶，在大乘巡行中轉成更厚的脊骨節奏。",
      sectLabel: "萬獸山莊大乘承接",
    },
    chain: {
      chainId: "route-memory-body",
      step: 3,
      worldMemoryTags: ["route:body:worldspine"],
    },
    choices: [
      {
        id: "march_worldspine",
        label: "踏脊前行",
        description: "順著世界脊骨前行，讓肉身與大乘節奏再次合拍。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓巡行" },
            { kind: "benefit", label: "大乘體修" },
          ],
        },
        reward: {
          experience: 298000,
          logMessage: "你沿著世界脊骨完成巡行，大乘後段的肉身底盤更沉更穩。",
        },
      },
      {
        id: "seal_worldspine_bone",
        label: "封骨留脊",
        description: "不再硬扛巡行，改把世界脊骨的殘響封存成鍛材。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "世界脊骨殘響" },
            { kind: "benefit", label: "鍛體周轉" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 3 }],
          logMessage: "你把世界脊骨殘響封存成可用鍛材，後續百業與鍛體都多了一條路。",
        },
      },
    ],
  }),
  mahayana_mystic_star_court_verdict: createSingleRealmEncounterEvent({
    id: "mahayana_mystic_star_court_verdict",
    title: "大乘星庭裁決",
    description: "合體星庭留下的記憶，在大乘階段化作一場需要神識親自回應的裁決。",
    realm: MajorRealm.Mahayana,
    selector: {
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_task_04"],
      requiredResolvedEventIds: ["fusion_mystic_constellation_court"],
      requiredWorldMemoryTags: ["route:mage:constellation"],
    },
    presentation: {
      categoryLabel: "大乘宗門記憶",
      routeLabel: "縹緲仙宮",
      chainLabel: "星圖定勢",
      memoryCue: "合體星庭留下的神識節奏，在大乘裁決中正式定型。",
      sectLabel: "縹緲仙宮大乘承接",
    },
    chain: {
      chainId: "route-memory-mage",
      step: 3,
      worldMemoryTags: ["route:mage:star-court"],
    },
    choices: [
      {
        id: "judge_stars",
        label: "定案星圖",
        description: "以神識裁定星圖走向，讓大乘後段的推演更穩。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "星圖定勢" },
            { kind: "benefit", label: "大乘法修" },
          ],
        },
        reward: {
          experience: 312000,
          logMessage: "你定下星圖裁決，大乘後段的術式推演不再只靠直覺。",
        },
      },
      {
        id: "archive_court_light",
        label: "封存星光",
        description: "不在星庭中久留，先把裁決後的餘光封入匣中。",
        cue: {
          tone: "costly",
          tags: [
            { kind: "resource", label: "星庭餘光" },
            { kind: "benefit", label: "後續推演" },
          ],
        },
        reward: {
          spiritStones: 2500,
          logMessage: "你收束星庭餘光，讓後續洞府與術式周轉有了更寬的空間。",
        },
      },
    ],
  }),
  spirit_severing_herb_tide: createSingleRealmEncounterEvent({
    id: "spirit_severing_herb_tide",
    title: "裂神藥潮",
    description: "化神地脈滲出一波裂神藥潮，若出手夠快，足以補起下一段丹火底盤。",
    realm: MajorRealm.SpiritSevering,
    selector: {
      weight: 1,
    },
    presentation: {
      categoryLabel: "化神通用",
      routeLabel: "裂神藥潮",
    },
    choices: [
      {
        id: "refine_now",
        label: "即刻收藥",
        description: "趁藥潮未散，先把可入爐的靈材收入囊中。",
        reward: {
          items: [{ itemId: "bt_spirit_void", count: 1 }],
          logMessage: "你強收一縷裂神藥潮，煉成了足以承接下一境的太虛破障丹。",
        },
      },
      {
        id: "steady_breath",
        label: "穩住心神",
        description: "不急著搶材，轉而順著藥潮吐納，化成一段穩定修為。",
        reward: {
          experience: 125000,
          logMessage: "你借藥潮調息，讓化神後段的靈息穩穩沉了下來。",
        },
      },
    ],
  }),
  spirit_severing_edict: createSingleRealmEncounterEvent({
    id: "spirit_severing_edict",
    title: "神遊法旨",
    description: "一頁古老法旨自虛空落下，記著前輩如何以洞府與丹火補平化神期的修為裂口。",
    realm: MajorRealm.SpiritSevering,
    presentation: {
      categoryLabel: "化神機緣",
      routeLabel: "神遊法旨",
    },
    choices: [
      {
        id: "copy_formula",
        label: "抄錄法旨",
        description: "將法旨內容完整抄下，留待之後照方補齊修行節奏。",
        reward: {
          spiritStones: 1200,
          logMessage: "你抄下整篇法旨，順手還在法頁夾層中找到一袋靈石。",
        },
      },
      {
        id: "insight_flow",
        label: "當場參悟",
        description: "現場體會其中的洞府佈局，化成更直接的修行收穫。",
        reward: {
          experience: 150000,
          logMessage: "你在法旨前靜坐良久，對化神洞府與丹火並進的節奏有了更清楚把握。",
        },
      },
    ],
  }),
  sword_sect_huashen_bastion: createSingleRealmEncounterEvent({
    id: "sword_sect_huashen_bastion",
    title: "劍宗三界前哨",
    description: "化神三界戰場開啟前，凌霄劍宗在外域留下的劍台仍能替真正走完任務鏈的劍修補上一段承接。",
    realm: MajorRealm.SpiritSevering,
    selector: {
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_task_04"],
    },
    presentation: {
      categoryLabel: "化神三界戰場里程碑",
      routeLabel: "凌霄劍宗",
    },
    choices: [
      {
        id: "claim_sword_bastion_core",
        label: "取走劍台殘核",
        description: "把前哨劍台上封存的殘核收下，補進劍宗後段的修行與鍛材周轉。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍宗前哨殘核" },
            { kind: "benefit", label: "化神承接" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 2 }],
          logMessage: "你從凌霄劍宗的化神前哨取下劍心星鋼，讓三界戰場前的劍宗鍛材承接更扎實。",
        },
      },
      {
        id: "study_sword_bastion",
        label: "參悟劍台餘勢",
        description: "不急著搬走資材，先把劍台殘留的鋒勢化成更穩的修為。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "凌霄劍宗鋒勢" },
            { kind: "benefit", label: "劍修修為" },
          ],
        },
        reward: {
          experience: 182000,
          logMessage: "你在劍台前靜坐，將化神三界戰場前的劍勢餘波轉成一段穩定修為。",
        },
      },
    ],
  }),
  beast_sect_huashen_bastion: createSingleRealmEncounterEvent({
    id: "beast_sect_huashen_bastion",
    title: "獸莊三界前哨",
    description: "萬獸山莊在化神戰場邊線埋下的血骨前哨仍在運轉，只有完成最後任務的體修才能把它接上。",
    realm: MajorRealm.SpiritSevering,
    selector: {
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_task_04"],
    },
    presentation: {
      categoryLabel: "化神三界戰場里程碑",
      routeLabel: "萬獸山莊",
    },
    choices: [
      {
        id: "claim_beast_bastion_cache",
        label: "收走獸骨殘材",
        description: "把前哨裡剩下的獸骨與血髓帶走，替體修後段補足可用材料。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "萬獸山莊血骨殘材" },
            { kind: "benefit", label: "肉身承接" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 2 }],
          logMessage: "你從萬獸山莊的化神前哨帶走血骨殘材，讓體修前往三界戰場時不再空手。",
        },
      },
      {
        id: "temper_beast_body",
        label: "以血骨鍛體",
        description: "直接承接前哨殘威，把肉身磨成更耐打的三界戰場底盤。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "萬獸山莊高壓鍛體" },
            { kind: "benefit", label: "體修修為" },
          ],
        },
        reward: {
          experience: 176000,
          logMessage: "你借萬獸山莊前哨殘威鍛體，將化神前的肉身底盤推得更穩更硬。",
        },
      },
    ],
  }),
  mystic_sect_huashen_bastion: createSingleRealmEncounterEvent({
    id: "mystic_sect_huashen_bastion",
    title: "仙宮三界前哨",
    description: "縹緲仙宮把一座星砂前哨留在化神戰場外圍，能否啟用只看你是否完成最後一段宗門任務。",
    realm: MajorRealm.SpiritSevering,
    selector: {
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_task_04"],
    },
    presentation: {
      categoryLabel: "化神三界戰場里程碑",
      routeLabel: "縹緲仙宮",
    },
    choices: [
      {
        id: "claim_mystic_bastion_cache",
        label: "取走星砂秘材",
        description: "將前哨封存的星砂與草料收起來，讓法修在三界戰場前仍有可用素材。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲仙宮星砂秘材" },
            { kind: "benefit", label: "化神承接" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 2 }],
          logMessage: "你從縹緲仙宮的化神前哨收下星魂靈蓮，替法修接上三界戰場的節奏。",
        },
      },
      {
        id: "read_mystic_bastion_star_map",
        label: "讀取星砂圖卷",
        description: "不先搬走素材，改把圖卷中的星砂推演成更直接的術式節奏。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "縹緲仙宮星圖" },
            { kind: "benefit", label: "法修修為" },
          ],
        },
        reward: {
          experience: 188000,
          logMessage: "你讀完星砂圖卷，將化神三界戰場前的推演節奏直接化為修為。",
        },
      },
    ],
  }),
  sword_void_starsteel_vein: createSingleRealmEncounterEvent({
    id: "sword_void_starsteel_vein",
    title: "裂虛劍星礦脈",
    description: "煉虛亂流偶爾會沖開凌霄劍宗舊礦脈，只有真正走完後段劍宗任務的劍修能辨識其中星鋼。",
    realm: MajorRealm.VoidRefining,
    selector: {
      weight: 5,
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_task_04"],
    },
    presentation: {
      categoryLabel: "煉虛百業材料",
      routeLabel: "凌霄劍宗",
    },
    choices: [
      {
        id: "extract_starsteel",
        label: "鑿取星鋼",
        description: "以劍意定住礦脈裂口，鑿下一小段可回爐的劍心星鋼。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x1" },
            { kind: "benefit", label: "煉器專精材料" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 1 }],
          logMessage: "你從裂虛礦脈中鑿出一段凌霄劍星鋼，足以支撐下一輪高階器方。",
        },
      },
      {
        id: "temper_void_edge",
        label: "借礦脈淬鋒",
        description: "不取礦材，改讓礦脈裂隙磨去劍意中的雜質。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "劍意淬鍊" },
            { kind: "benefit", label: "煉虛修為" },
          ],
        },
        reward: {
          experience: 320000,
          logMessage: "你借裂虛礦脈淬鍊劍意，煉虛期的鋒勢更穩了幾分。",
        },
      },
    ],
  }),
  beast_tribulation_bloodbone_den: createSingleRealmEncounterEvent({
    id: "beast_tribulation_bloodbone_den",
    title: "劫骨獸巢",
    description: "渡劫雷火劈開一座萬獸山莊舊獸巢，巢底殘留的血骨仍帶著可入爐的鍛體壓力。",
    realm: MajorRealm.Tribulation,
    selector: {
      weight: 5,
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_task_04"],
    },
    presentation: {
      categoryLabel: "渡劫百業材料",
      routeLabel: "萬獸山莊",
    },
    choices: [
      {
        id: "collect_bloodbone",
        label: "剝取血骨",
        description: "頂著殘雷深入巢底，剝取仍能承受帝兵火候的血骨殘材。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x1" },
            { kind: "risk", label: "殘雷獸巢" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 1 }],
          logMessage: "你從劫骨獸巢中取回一份萬獸血骨殘材，體修器方終於有了後續來源。",
        },
      },
      {
        id: "endure_bone_thunder",
        label: "借殘雷鍛體",
        description: "不取材料，改讓巢底殘雷反覆打磨肉身底盤。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓鍛體" },
            { kind: "benefit", label: "渡劫修為" },
          ],
        },
        reward: {
          experience: 1480000,
          logMessage: "你在獸巢殘雷中硬撐許久，肉身對渡劫雷火的適應更深了一層。",
        },
      },
    ],
  }),
  mystic_immortal_starlotus_tide: createSingleRealmEncounterEvent({
    id: "mystic_immortal_starlotus_tide",
    title: "仙潮星蓮灘",
    description: "仙人邊境的潮汐偶爾會把縹緲仙宮星砂推上岸，只有法修能在退潮前辨出可入丹的星魂蓮。",
    realm: MajorRealm.Immortal,
    selector: {
      weight: 5,
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_task_04"],
    },
    presentation: {
      categoryLabel: "仙人百業材料",
      routeLabel: "縹緲仙宮",
    },
    choices: [
      {
        id: "gather_starlotus",
        label: "採集星魂蓮",
        description: "以神識鎖住退潮節點，採下一株仍保有星砂靈機的星魂蓮。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲星魂蓮 x1" },
            { kind: "benefit", label: "煉丹專精材料" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 1 }],
          logMessage: "你趁仙潮退去前採下一株縹緲星魂蓮，讓高階丹方不再只靠一次性前哨供料。",
        },
      },
      {
        id: "read_tide_pattern",
        label: "推演仙潮",
        description: "不急著採蓮，先把仙潮星圖推演成後續術式節奏。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "仙潮推演" },
            { kind: "benefit", label: "仙人修為" },
          ],
        },
        reward: {
          experience: 2180000,
          logMessage: "你以神識推演仙潮星圖，仙人期的法修節奏因此更穩。",
        },
      },
    ],
  }),
  sword_immortal_skyforge_tribute: createSingleRealmEncounterEvent({
    id: "sword_immortal_skyforge_tribute",
    title: "仙闕劍爐貢",
    description: "仙闕外的劍爐只在凌霄劍宗門人抵達仙人境後短暫開火，爐中星鋼可回補終盤器方。",
    realm: MajorRealm.Immortal,
    selector: {
      weight: 4,
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_task_04"],
    },
    presentation: {
      categoryLabel: "仙人路線材料",
      routeLabel: "凌霄劍宗",
    },
    choices: [
      {
        id: "claim_skyforge_starsteel",
        label: "接下劍爐貢",
        description: "以本命劍意穩住仙闕劍爐，取出可回爐的星鋼。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x1" },
            { kind: "benefit", label: "仙人器方材料" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 1 }],
          logMessage: "你接下仙闕劍爐貢，凌霄劍星鋼的終盤來源又穩了一條。",
        },
      },
      {
        id: "temper_immortal_edge",
        label: "借爐淬鋒",
        description: "不取材料，讓劍爐仙火替你的劍勢削去浮躁。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "仙人劍勢" },
            { kind: "benefit", label: "修為收益" },
          ],
        },
        reward: {
          experience: 2240000,
          logMessage: "你借仙闕劍爐淬鋒，仙人境的劍勢與洞府節奏更容易合拍。",
        },
      },
    ],
  }),
  beast_immortal_bloodbone_altar: createSingleRealmEncounterEvent({
    id: "beast_immortal_bloodbone_altar",
    title: "仙獸血骨壇",
    description: "萬獸山莊在仙人邊境留下血骨壇，只有體修能把壇中壓力轉成可用鍛材。",
    realm: MajorRealm.Immortal,
    selector: {
      weight: 4,
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_task_04"],
    },
    presentation: {
      categoryLabel: "仙人路線材料",
      routeLabel: "萬獸山莊",
    },
    choices: [
      {
        id: "open_bloodbone_altar",
        label: "開壇取骨",
        description: "頂住血骨壇的反噬，把能入爐的殘材剝出來。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x1" },
            { kind: "risk", label: "仙獸壇反噬" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 1 }],
          logMessage: "你從仙獸血骨壇取回殘材，體修終盤器方又多了一處可追蹤來源。",
        },
      },
      {
        id: "endure_altar_pressure",
        label: "以壇壓身",
        description: "暫不取材，改把血骨壇壓力導入肉身。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓鍛體" },
            { kind: "benefit", label: "仙人體修" },
          ],
        },
        reward: {
          experience: 2140000,
          logMessage: "你承下血骨壇壓力，仙人境肉身不再只靠閉關硬磨。",
        },
      },
    ],
  }),
  sword_sect_patrol_cache: createSingleRealmEncounterEvent({
    id: "sword_sect_patrol_cache",
    title: "巡山暗匣",
    description: "凌霄劍宗巡山統領在化神外域留下了一只暗匣，只讓真正扛過外門歷練的劍修開啟。",
    realm: MajorRealm.SpiritSevering,
    selector: {
      weight: 9,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_join"],
    },
    presentation: {
      categoryLabel: "劍宗進階",
      routeLabel: "凌霄劍宗",
    },
    choices: [
      {
        id: "claim_cache",
        label: "取走匣中劍紋",
        description: "直接帶走暗匣裡的劍紋與宗門靈資，補齊下一段養劍節奏。",
        reward: {
          spiritStones: 1800,
          logMessage: "你打開巡山暗匣，取走其中封存的劍紋與靈資，讓化神期的養劍節奏順了不少。",
        },
      },
      {
        id: "study_inscription",
        label: "參悟巡山劍訣",
        description: "不急著搬走資材，先把暗匣內壁留下的巡山劍訣刻入識海。",
        reward: {
          experience: 168000,
          logMessage: "你在巡山暗匣前靜坐參悟，把凌霄劍宗的巡山劍訣化成了一段紮實修為。",
        },
      },
    ],
  }),
  void_refining_void_barter: createSingleRealmEncounterEvent({
    id: "void_refining_void_barter",
    title: "虛市殘攤",
    description: "煉虛亂流中殘留一處短暫虛市，攤主願以極低代價換走你手中多餘靈石。",
    realm: MajorRealm.VoidRefining,
    choices: [
      {
        id: "buy_void_marrow",
        label: "買下虛髓",
        description: "直接換走攤上的萬法歸一髓，補起合體前的最後缺口。",
        reward: {
          items: [{ itemId: "bt_void_fusion", count: 1 }],
          spiritStones: -800,
          logMessage: "你以靈石換到一份萬法歸一髓，足以讓煉虛後段的進度不再乾耗。",
        },
      },
      {
        id: "harvest_residue",
        label: "掃空殘攤",
        description: "不求完整寶物，只把攤上散落的虛市殘財全部帶走。",
        reward: {
          spiritStones: 2200,
          logMessage: "你把虛市殘財盡數收入囊中，至少替後續煉虛資源周轉補了口氣。",
        },
      },
    ],
  }),
  void_refining_star_chart: createSingleRealmEncounterEvent({
    id: "void_refining_star_chart",
    title: "裂空星圖",
    description: "殘缺星圖標出了幾處最容易催動聚靈陣的節點，像是在提醒你別只靠閉關硬磨。",
    realm: MajorRealm.VoidRefining,
    choices: [
      {
        id: "trace_nodes",
        label: "記下節點",
        description: "將星圖節點逐一記下，回去重整洞府節奏。",
        reward: {
          experience: 280000,
          logMessage: "你依著星圖推演洞府節點，讓煉虛期的聚靈效率明顯上了一段。",
        },
      },
      {
        id: "salvage_chart",
        label: "拆取星砂",
        description: "不留圖紙，直接拆下凝成星圖的虛砂精華。",
        reward: {
          spiritStones: 2600,
          logMessage: "你拆走星圖上的虛砂殘晶，替洞府與丹爐多添了一筆高境界周轉。",
        },
      },
    ],
  }),
  sword_world_void_river_oath: createSingleRealmEncounterEvent({
    id: "sword_world_void_river_oath",
    title: "長河劍令回聲",
    description: "你送入時光長河的劍令在煉虛亂流中回響，替凌霄劍宗路線補上一段世界章節後續。",
    realm: MajorRealm.VoidRefining,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_world_chapter_01"],
    },
    presentation: {
      categoryLabel: "煉虛世界章節里程碑",
      routeLabel: "凌霄劍宗",
    },
    choices: [
      {
        id: "answer_sword_writ",
        label: "應和劍令",
        description: "以本命劍意應和長河中的界令回聲，讓煉虛路線不再只是材料散點。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "凌霄劍宗世界章節" },
            { kind: "benefit", label: "煉虛劍修修為" },
          ],
        },
        reward: {
          experience: 335000,
          logMessage: "你應和長河劍令，凌霄劍宗的三界戰場後續在煉虛亂流中清晰了一段。",
        },
      },
      {
        id: "collect_sword_echo",
        label: "收束劍令殘響",
        description: "把殘響凝成可回爐的劍心星鋼，留作後續百業材料。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍宗劍令星鋼 x1" },
            { kind: "benefit", label: "世界章節材料" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 1 }],
          logMessage: "你把長河劍令殘響收成劍心星鋼，讓世界章節與宗門百業接到同一條路。",
        },
      },
    ],
  }),
  beast_world_void_river_oath: createSingleRealmEncounterEvent({
    id: "beast_world_void_river_oath",
    title: "長河血旗回聲",
    description: "釘入時光長河的血旗在煉虛亂流中鼓動，替萬獸山莊路線留下可追蹤的世界章節後續。",
    realm: MajorRealm.VoidRefining,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_world_chapter_01"],
    },
    presentation: {
      categoryLabel: "煉虛世界章節里程碑",
      routeLabel: "萬獸山莊",
    },
    choices: [
      {
        id: "raise_blood_banner",
        label: "再舉血旗",
        description: "頂住時光亂流再舉血旗，把萬獸山莊的肉身節奏壓入煉虛。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "萬獸山莊世界章節" },
            { kind: "benefit", label: "煉虛體修修為" },
          ],
        },
        reward: {
          experience: 326000,
          logMessage: "你在長河亂流中再舉血旗，萬獸山莊的三界戰場後續被肉身節奏重新釘住。",
        },
      },
      {
        id: "claim_blood_banner_bone",
        label: "剝取血旗骨片",
        description: "從血旗底座剝下一片被長河沖刷過的血骨，作為後續鍛材。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸山莊血旗骨片 x1" },
            { kind: "risk", label: "世界章節材料" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 1 }],
          logMessage: "你取下長河血旗骨片，讓世界章節與體修鍛材來源接在一起。",
        },
      },
    ],
  }),
  mystic_world_void_river_oath: createSingleRealmEncounterEvent({
    id: "mystic_world_void_river_oath",
    title: "長河星牒回聲",
    description: "送入時光長河的星牒在煉虛亂流中重排星位，替縹緲仙宮路線補上世界章節後續。",
    realm: MajorRealm.VoidRefining,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_world_chapter_01"],
    },
    presentation: {
      categoryLabel: "煉虛世界章節里程碑",
      routeLabel: "縹緲仙宮",
    },
    choices: [
      {
        id: "read_star_writ",
        label: "讀取星牒回聲",
        description: "順著長河中重排的星位推演術式，讓煉虛節點成為可辨識的章節出口。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "縹緲仙宮世界章節" },
            { kind: "benefit", label: "煉虛法修修為" },
          ],
        },
        reward: {
          experience: 342000,
          logMessage: "你讀完長河星牒回聲，縹緲仙宮的三界戰場後續終於推入煉虛章法。",
        },
      },
      {
        id: "gather_star_writ_sand",
        label: "凝取星牒砂",
        description: "把星牒外溢的星砂凝成靈蓮藥引，留給後續丹方。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲仙宮星牒砂 x1" },
            { kind: "benefit", label: "世界章節材料" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 1 }],
          logMessage: "你凝下長河星牒砂，讓世界章節與法修丹方來源接成同一段路。",
        },
      },
    ],
  }),
  sword_world_endless_sea_oath: createSingleRealmEncounterEvent({
    id: "sword_world_endless_sea_oath",
    title: "界海劍潮回聲",
    description: "聖城劍令抵達無盡海後，海潮開始反覆沖刷凌霄劍宗的後段劍痕，替宗門路線留下合體後續。",
    realm: MajorRealm.Fusion,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_world_chapter_02"],
    },
    presentation: {
      categoryLabel: "合體後段世界章節里程碑",
      routeLabel: "凌霄劍宗",
      chainLabel: "劍令入海",
      memoryCue: "無盡海會記住聖城劍令，後續劍宗事件可讀取這段宗門路線記憶。",
      sectLabel: "凌霄劍宗後段承接",
    },
    chain: {
      chainId: "sect-world-sword-route",
      step: 2,
      worldMemoryTags: ["sect:sword:world-chapter-02"],
    },
    choices: [
      {
        id: "answer_sea_edge",
        label: "應和劍潮",
        description: "以本命劍意應和無盡海潮，讓合體後段的劍宗路線不再只是任務交付。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "凌霄劍宗世界章節" },
            { kind: "benefit", label: "合體劍修修為" },
          ],
        },
        reward: {
          experience: 585000,
          logMessage: "你應和界海劍潮，聖城劍令在無盡海裡留下可追蹤的凌霄劍宗後段記憶。",
        },
      },
      {
        id: "collect_sea_starsteel",
        label: "凝取界海星鋼",
        description: "把被海潮淬過的劍痕凝成星鋼，留作後續百業材料來源。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x1" },
            { kind: "benefit", label: "世界章節材料" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 1 }],
          logMessage: "你凝下界海星鋼，讓凌霄劍宗的後段世界章節能繼續反向供料給百業。",
        },
      },
    ],
  }),
  beast_world_endless_sea_oath: createSingleRealmEncounterEvent({
    id: "beast_world_endless_sea_oath",
    title: "界海血潮回聲",
    description: "血潮印沉入無盡海後，萬獸山莊的肉身路線開始被海壓反覆校準，留下合體後續。",
    realm: MajorRealm.Fusion,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_world_chapter_02"],
    },
    presentation: {
      categoryLabel: "合體後段世界章節里程碑",
      routeLabel: "萬獸山莊",
      chainLabel: "血印入海",
      memoryCue: "無盡海會記住血潮印，後續體修事件可讀取這段宗門路線記憶。",
      sectLabel: "萬獸山莊後段承接",
    },
    chain: {
      chainId: "sect-world-beast-route",
      step: 2,
      worldMemoryTags: ["sect:beast:world-chapter-02"],
    },
    choices: [
      {
        id: "withstand_sea_pressure",
        label: "承受海壓",
        description: "以肉身硬抗界海回撞，把血潮印的壓力轉成合體後段修為。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "萬獸山莊世界章節" },
            { kind: "benefit", label: "合體體修修為" },
          ],
        },
        reward: {
          experience: 570000,
          logMessage: "你在界海血潮中硬撐到血印沉穩，萬獸山莊後段路線被海壓重新釘牢。",
        },
      },
      {
        id: "claim_sea_bloodbone",
        label: "剝取界海血骨",
        description: "從血潮印下剝取被海壓淬過的血骨，作為後續器方材料。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x1" },
            { kind: "risk", label: "世界章節材料" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 1 }],
          logMessage: "你取回界海血骨，讓萬獸山莊的後段世界章節能繼續支撐體修鍛材。",
        },
      },
    ],
  }),
  mystic_world_endless_sea_oath: createSingleRealmEncounterEvent({
    id: "mystic_world_endless_sea_oath",
    title: "界海星潮回聲",
    description: "星潮牒落入無盡海後，縹緲仙宮的神識路線在海霧中重排，替法修留下合體後續。",
    realm: MajorRealm.Fusion,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_world_chapter_02"],
    },
    presentation: {
      categoryLabel: "合體後段世界章節里程碑",
      routeLabel: "縹緲仙宮",
      chainLabel: "星牒入海",
      memoryCue: "無盡海會記住星潮牒，後續法修事件可讀取這段宗門路線記憶。",
      sectLabel: "縹緲仙宮後段承接",
    },
    chain: {
      chainId: "sect-world-mystic-route",
      step: 2,
      worldMemoryTags: ["sect:mystic:world-chapter-02"],
    },
    choices: [
      {
        id: "read_sea_star_chart",
        label: "讀取海天星位",
        description: "順著星潮牒在海霧中重排的星位，把合體後段術式推成可追蹤章節。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "縹緲仙宮世界章節" },
            { kind: "benefit", label: "合體法修修為" },
          ],
        },
        reward: {
          experience: 598000,
          logMessage: "你讀完界海星潮，縹緲仙宮的後段宗門路線在海霧中留下穩定記憶。",
        },
      },
      {
        id: "gather_sea_starlotus",
        label: "凝取界海星蓮",
        description: "把星潮牒外溢的海霧星砂凝成星魂蓮，留給後續丹方。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲星魂蓮 x1" },
            { kind: "benefit", label: "世界章節材料" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 1 }],
          logMessage: "你凝下界海星蓮，讓縹緲仙宮的後段世界章節能接回高階丹方來源。",
        },
      },
    ],
  }),
  fusion_law_forge: createSingleRealmEncounterEvent({
    id: "fusion_law_forge",
    title: "法相熔坊",
    description: "合體邊境出現一座暫時顯化的法相熔坊，像是專門替高境界修士補齊丹火與鍛體的短板。",
    realm: MajorRealm.Fusion,
    choices: [
      {
        id: "claim_fruit",
        label: "收下道果",
        description: "以法相承接熔坊中央的道果殘光。",
        reward: {
          items: [{ itemId: "bt_fusion_maha", count: 1 }],
          logMessage: "你從法相熔坊中央摘下一枚天道感悟果，讓合體後段的節奏不再被卡死。",
        },
      },
      {
        id: "temper_body",
        label: "借爐煉體",
        description: "放棄直接取寶，改用熔坊殘火洗鍊自身法相。",
        reward: {
          experience: 520000,
          logMessage: "你借熔坊殘火煉體，使合體期的法相與修為同步穩了下來。",
        },
      },
    ],
  }),
  fusion_resonance_record: createSingleRealmEncounterEvent({
    id: "fusion_resonance_record",
    title: "萬法合鳴錄",
    description: "一卷舊錄詳記合體修士如何把洞府、丹藥與掃圖首殺接成一條真正有感的追趕線。",
    realm: MajorRealm.Fusion,
    choices: [
      {
        id: "preserve_record",
        label: "抄錄全卷",
        description: "把關鍵段落完整抄下，往後慢慢化進自己的修行節奏。",
        reward: {
          spiritStones: 3200,
          logMessage: "你抄錄了合鳴錄的完整節奏，還在卷末找到一袋留給後人的靈石。",
        },
      },
      {
        id: "digest_record",
        label: "當場消化",
        description: "現場參悟卷中節奏，直接轉成一段紮實修為。",
        reward: {
          experience: 610000,
          logMessage: "你當場消化了合鳴錄，把合體期該如何並進多條乘區看得更透。",
        },
      },
    ],
  }),
  mahayana_pillar_blessing: createSingleRealmEncounterEvent({
    id: "mahayana_pillar_blessing",
    title: "天柱餘照",
    description: "大乘天柱灑下短暫餘照，能把平日累積的丹火與洞府成果一口氣放大。",
    realm: MajorRealm.Mahayana,
    choices: [
      {
        id: "draw_tribulation_pill",
        label: "引照入丹",
        description: "把天柱餘照直接灌入丹火，為渡劫做最後預備。",
        reward: {
          items: [{ itemId: "bt_maha_trib", count: 1 }],
          logMessage: "你將天柱餘照納入丹火，煉出一枚足以護住心脈的九轉渡劫丹。",
        },
      },
      {
        id: "steady_mind",
        label: "收束道心",
        description: "不求丹成，只借餘照穩住即將迎劫的道心。",
        reward: {
          experience: 980000,
          logMessage: "你借天柱餘照收束道心，大乘期後段的修為節奏因此穩了不少。",
        },
      },
    ],
  }),
  mahayana_ancestral_feast: createSingleRealmEncounterEvent({
    id: "mahayana_ancestral_feast",
    title: "古宗遺宴",
    description: "一場古宗遺宴只剩最後一桌，但桌上留下的靈膳與紀錄正好能接上大乘末段的修行耗時。",
    realm: MajorRealm.Mahayana,
    choices: [
      {
        id: "take_spirit_stones",
        label: "收下遺宴靈資",
        description: "優先把能立即轉成洞府與丹爐週轉的資源帶走。",
        reward: {
          spiritStones: 5400,
          logMessage: "你把遺宴靈資悉數帶走，讓大乘後段的洞府與丹火不用再硬撐。",
        },
      },
      {
        id: "share_inheritance",
        label: "啟讀遺錄",
        description: "閱讀遺宴留下的修行紀錄，直接消化成修為收益。",
        reward: {
          experience: 1050000,
          logMessage: "你讀完遺宴遺錄，對大乘期該怎麼把多條成長線串成閉環有了更直觀的體會。",
        },
      },
    ],
  }),
  tribulation_lightning_cache: createSingleRealmEncounterEvent({
    id: "tribulation_lightning_cache",
    title: "劫雷秘庫",
    description: "渡劫殘雷在山脊下震開一處秘庫，裡頭只留下最適合迎接下一步飛昇的資源。",
    realm: MajorRealm.Tribulation,
    choices: [
      {
        id: "take_ascent_token",
        label: "取飛昇引",
        description: "直取最關鍵的飛昇仙引，不再把渡劫後段耗在無止盡等待。",
        reward: {
          items: [{ itemId: "bt_trib_immortal", count: 1 }],
          logMessage: "你從劫雷秘庫中取走飛昇仙引，將渡劫末段最兇的瓶頸直接往前推進了一截。",
        },
      },
      {
        id: "gather_lightning_sand",
        label: "掃走雷砂",
        description: "放棄最核心的寶物，改把秘庫內雷砂與靈資全部收走。",
        reward: {
          spiritStones: 7600,
          logMessage: "你收走秘庫中剩餘的雷砂與靈資，替渡劫後段多換回一次安全周轉。",
        },
      },
    ],
  }),
  tribulation_celestial_notice: createSingleRealmEncounterEvent({
    id: "tribulation_celestial_notice",
    title: "天劫前告",
    description: "一道前告落在你面前，提醒你真正能縮短渡劫總時長的不是硬磨，而是事件與首通挑戰的堆疊。",
    realm: MajorRealm.Tribulation,
    choices: [
      {
        id: "heed_warning",
        label: "記下前告",
        description: "將前告化成往後掃圖與洞府調度的準則。",
        reward: {
          experience: 1420000,
          logMessage: "你把前告中的節奏記進心裡，對渡劫該如何靠事件與挑戰補速度看得更清楚。",
        },
      },
      {
        id: "salvage_talisman",
        label: "拆取天符",
        description: "把前告附著的護身天符拆下，換成更直接的資源。",
        reward: {
          spiritStones: 8200,
          logMessage: "你拆下前告附著的天符殘片，將其換成了足以再撐一輪洞府與丹火的靈資。",
        },
      },
    ],
  }),
  immortal_command_cache: createSingleRealmEncounterEvent({
    id: "immortal_command_cache",
    title: "仙詔軍庫",
    description: "仙人邊疆的軍庫被前朝封印，裡面殘留的資源正好能補齊仙人期最怕失速的那一段。",
    realm: MajorRealm.Immortal,
    choices: [
      {
        id: "secure_origin",
        label: "取本源",
        description: "先奪下最核心的鴻蒙本源，不讓仙人末段再拖成純時間牆。",
        reward: {
          items: [{ itemId: "bt_immortal_emperor", count: 1 }],
          logMessage: "你從仙詔軍庫中奪得一縷鴻蒙本源，將證道仙帝前最核心的材料先握在了手裡。",
        },
      },
      {
        id: "take_supply",
        label: "搬空靈資",
        description: "不賭核心重寶，改把整庫能轉化成洞府與事件周轉的資源全數帶走。",
        reward: {
          spiritStones: 12000,
          logMessage: "你把仙詔軍庫剩餘靈資幾乎搬空，讓仙人後段的多線培養不再那麼拮据。",
        },
      },
    ],
  }),
  immortal_flying_decree: createSingleRealmEncounterEvent({
    id: "immortal_flying_decree",
    title: "飛昇殘詔",
    description: "一紙飛昇殘詔記著仙人期如何靠洞府、丹藥、事件與首殺真正閉環，而不是只靠時間硬熬。",
    realm: MajorRealm.Immortal,
    choices: [
      {
        id: "study_decree",
        label: "細讀殘詔",
        description: "把殘詔中的節奏全部讀透，化成更直接的修為收益。",
        reward: {
          experience: 2050000,
          logMessage: "你細讀飛昇殘詔後，終於把仙人期多條乘區如何閉環這件事看得通透。",
        },
      },
      {
        id: "sell_decree",
        label: "換成靈資",
        description: "不耗時間參悟，直接把殘詔交給識貨之人換取周轉資源。",
        reward: {
          spiritStones: 13600,
          logMessage: "你將飛昇殘詔換成一大筆靈資，讓仙人期後段的洞府與丹火有了更穩的供應。",
        },
      },
    ],
  }),
  emperor_rift_harvest: createSingleRealmEncounterEvent({
    id: "emperor_rift_harvest",
    title: "帝境裂界寶潮",
    description: "仙帝裂界在短時間內吐出一波本源寶潮，足以決定終盤 build 是繼續拖時長，還是直接跨過最後斷層。",
    realm: MajorRealm.ImmortalEmperor,
    choices: [
      {
        id: "claim_crown",
        label: "搶下帝冠",
        description: "在寶潮收束前奪下最具辨識度的帝境戰利品。",
        reward: {
          items: [{ itemId: "emperor_crown", count: 1 }],
          logMessage: "你從裂界寶潮中搶下一頂帝冠，終盤路線的專屬感終於不只剩抽象數值。",
        },
      },
      {
        id: "condense_tide",
        label: "凝鍊寶潮",
        description: "不搶單件重寶，改把整波寶潮煉成更穩定的修為與周轉。",
        reward: {
          experience: 3100000,
          spiritStones: 16000,
          logMessage: "你把帝境寶潮煉成了可直接支撐終盤節奏的修為與靈資，不再只是被動等待閉關結算。",
        },
      },
    ],
  }),
  emperor_hongmeng_mandate: createSingleRealmEncounterEvent({
    id: "emperor_hongmeng_mandate",
    title: "鴻蒙帝旨",
    description: "一道鴻蒙帝旨直接點明，帝境修行若少了事件與遭遇的高額乘區，再高的洞府也只會變成更長的乾耗。",
    realm: MajorRealm.ImmortalEmperor,
    choices: [
      {
        id: "engrave_mandate",
        label: "銘刻帝旨",
        description: "將帝旨的節奏刻進神魂，留作往後終盤調度的準則。",
        reward: {
          experience: 3560000,
          logMessage: "你將鴻蒙帝旨銘刻進神魂，對終盤該如何同時靠洞府、丹藥、事件與遭遇提速有了定論。",
        },
      },
      {
        id: "exchange_edict",
        label: "換取本源",
        description: "將帝旨殘頁換成本源靈資，直接填補終盤最昂貴的養成開銷。",
        reward: {
          spiritStones: 18800,
          items: [{ itemId: "bt_immortal_emperor", count: 1 }],
          logMessage: "你以帝旨殘頁換回一縷鴻蒙本源與大量靈資，終盤節奏終於不再只靠乾熬。",
        },
      },
    ],
  }),
  sword_world_immortal_sword_oath: createSingleRealmEncounterEvent({
    id: "sword_world_immortal_sword_oath",
    title: "接引帝劍回聲",
    description: "帝劍殘痕抵達接引仙殿後，凌霄劍宗的仙階劍路在仙人境正式留下 v3 宗門回聲。",
    realm: MajorRealm.Immortal,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_world_chapter_03"],
    },
    presentation: {
      categoryLabel: "仙人 v3 世界章節里程碑",
      routeLabel: "凌霄劍宗",
      chainLabel: "帝劍入殿",
      memoryCue: "接引仙殿會記住帝劍殘痕，後續劍宗事件可讀取這段 v3 宗門路線記憶。",
      sectLabel: "凌霄劍宗仙階承接",
    },
    chain: {
      chainId: "sect-world-sword-route",
      step: 3,
      worldMemoryTags: ["sect:sword:world-chapter-03"],
    },
    choices: [
      {
        id: "answer_immortal_sword_echo",
        label: "應和帝劍回聲",
        description: "以本命劍意回應接引仙殿的帝劍殘痕，把仙人境劍路定成可追蹤章節。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "凌霄劍宗世界章節" },
            { kind: "benefit", label: "仙人劍修" },
          ],
        },
        reward: {
          experience: 1260000,
          logMessage: "你應和接引帝劍回聲，凌霄劍宗的 v3 仙階路線在仙殿中留下穩定記憶。",
        },
      },
      {
        id: "collect_immortal_starsteel",
        label: "凝取接引星鋼",
        description: "把帝劍殘痕外溢的劍光凝成星鋼，回補仙人與終盤器方材料。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x2" },
            { kind: "benefit", label: "凌霄劍宗" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 2 }],
          logMessage: "你凝下接引星鋼，讓凌霄劍宗 v3 世界章節能繼續供應高階器方。",
        },
      },
    ],
  }),
  beast_world_immortal_blood_oath: createSingleRealmEncounterEvent({
    id: "beast_world_immortal_blood_oath",
    title: "接引帝血回聲",
    description: "帝血骨印在接引仙殿中被仙階血臺壓實，萬獸山莊的肉身路線留下 v3 宗門回聲。",
    realm: MajorRealm.Immortal,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_world_chapter_03"],
    },
    presentation: {
      categoryLabel: "仙人 v3 世界章節里程碑",
      routeLabel: "萬獸山莊",
      chainLabel: "帝血入殿",
      memoryCue: "接引仙殿會記住帝血骨印，後續體修事件可讀取這段 v3 宗門路線記憶。",
      sectLabel: "萬獸山莊仙階承接",
    },
    chain: {
      chainId: "sect-world-beast-route",
      step: 3,
      worldMemoryTags: ["sect:beast:world-chapter-03"],
    },
    choices: [
      {
        id: "withstand_immortal_blood_echo",
        label: "承受帝血回聲",
        description: "以肉身承受仙殿血臺回壓，把帝血骨印的節奏推成仙人境底盤。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "萬獸山莊世界章節" },
            { kind: "benefit", label: "仙人體修" },
          ],
        },
        reward: {
          experience: 1210000,
          logMessage: "你硬撐接引帝血回聲，萬獸山莊的 v3 仙階肉身路線被血臺重新釘牢。",
        },
      },
      {
        id: "claim_immortal_bloodbone",
        label: "剝取接引血骨",
        description: "從帝血骨印下剝取被仙階血臺壓實的血骨，留給後續鍛體與器方。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x2" },
            { kind: "risk", label: "萬獸山莊" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 2 }],
          logMessage: "你取回接引血骨，讓萬獸山莊 v3 世界章節接回高階鍛材來源。",
        },
      },
    ],
  }),
  mystic_world_immortal_star_oath: createSingleRealmEncounterEvent({
    id: "mystic_world_immortal_star_oath",
    title: "接引星詔回聲",
    description: "星詔牒在接引仙殿星臺展開，縹緲仙宮的神識路線留下 v3 仙階宗門回聲。",
    realm: MajorRealm.Immortal,
    selector: {
      weight: 4,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_world_chapter_03"],
    },
    presentation: {
      categoryLabel: "仙人 v3 世界章節里程碑",
      routeLabel: "縹緲仙宮",
      chainLabel: "星詔入殿",
      memoryCue: "接引仙殿會記住星詔牒，後續法修事件可讀取這段 v3 宗門路線記憶。",
      sectLabel: "縹緲仙宮仙階承接",
    },
    chain: {
      chainId: "sect-world-mystic-route",
      step: 3,
      worldMemoryTags: ["sect:mystic:world-chapter-03"],
    },
    choices: [
      {
        id: "read_immortal_star_decree",
        label: "讀取星詔回聲",
        description: "順著星詔牒在仙殿星臺中展開的星位，把仙人境術式推成可追蹤章節。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "縹緲仙宮世界章節" },
            { kind: "benefit", label: "仙人法修" },
          ],
        },
        reward: {
          experience: 1320000,
          logMessage: "你讀完接引星詔回聲，縹緲仙宮的 v3 仙階神識路線在星臺上定型。",
        },
      },
      {
        id: "gather_immortal_starlotus",
        label: "凝取接引星蓮",
        description: "把星詔牒外溢的仙階星砂凝成星魂蓮，留給後續丹方與術式推演。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲星魂蓮 x2" },
            { kind: "benefit", label: "縹緲仙宮" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 2 }],
          logMessage: "你凝下接引星蓮，讓縹緲仙宮 v3 世界章節能反向支撐高階丹方。",
        },
      },
    ],
  }),
  sword_immortal_afterglow_starsteel: {
    id: "sword_immortal_afterglow_starsteel",
    title: "帝劍餘燼星鋼",
    description: "接引仙殿記住帝劍殘痕後，凌霄劍宗弟子仍能在餘燼劍縫裡反覆尋回可用星鋼。",
    minRealm: MajorRealm.Immortal,
    maxRealm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 4,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Sword],
      requiredWorldMemoryTags: ["sect:sword:world-chapter-03"],
    },
    presentation: {
      categoryLabel: "仙人 v3 路線餘波",
      routeLabel: "凌霄劍宗",
      chainLabel: "帝劍餘波",
      memoryCue: "帝劍餘燼會讀取 v3 凌霄劍宗世界章節記憶，作為後續仙階與帝境材料來源。",
      sectLabel: "凌霄劍宗 v3 餘波",
    },
    choices: [
      {
        id: "salvage_afterglow_starsteel",
        label: "尋回餘燼星鋼",
        description: "沿著帝劍殘痕冷卻後留下的劍縫，取回一段仍可入爐的星鋼。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x1" },
            { kind: "resource", label: "材料來源" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 1 }],
          logMessage: "你從帝劍餘燼中尋回一段凌霄劍星鋼，v3 劍宗路線多了一條可重複材料來源。",
        },
      },
      {
        id: "temper_afterglow_edge",
        label: "借餘燼淬鋒",
        description: "不取星鋼，改把餘燼劍意壓進本命劍勢，換成更穩的仙階修行節奏。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "穩定收益" },
            { kind: "benefit", label: "仙階劍勢" },
          ],
        },
        reward: {
          experience: 2360000,
          logMessage: "你借帝劍餘燼淬鋒，凌霄劍宗 v3 餘波轉成穩定修為。",
        },
      },
    ],
  },
  beast_immortal_afterglow_bloodbone: {
    id: "beast_immortal_afterglow_bloodbone",
    title: "帝血餘獵骨潮",
    description: "帝血骨印被接引仙殿壓實後，萬獸山莊仍能循著血潮殘跡反覆追獵血骨。",
    minRealm: MajorRealm.Immortal,
    maxRealm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 4,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Body],
      requiredWorldMemoryTags: ["sect:beast:world-chapter-03"],
    },
    presentation: {
      categoryLabel: "仙人 v3 路線餘波",
      routeLabel: "萬獸山莊",
      chainLabel: "帝血餘波",
      memoryCue: "帝血餘獵會讀取 v3 萬獸山莊世界章節記憶，讓肉身路線保留高風險材料回路。",
      sectLabel: "萬獸山莊 v3 餘波",
    },
    choices: [
      {
        id: "hunt_afterglow_bloodbone",
        label: "追剝餘獵血骨",
        description: "趁血潮尚未完全散去，硬闖餘獵場剝下一段被帝血壓實的血骨。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x1" },
            { kind: "risk", label: "高風險收益" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 1 }],
          logMessage: "你硬闖帝血餘獵場，剝回一份萬獸血骨殘材，也讓 v3 體修路線保留高壓來源。",
        },
      },
      {
        id: "endure_afterglow_bloodpulse",
        label: "承受餘血脈壓",
        description: "放棄剝材，讓餘獵血壓反覆打磨肉身底盤。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高風險收益" },
            { kind: "benefit", label: "肉身底盤" },
          ],
        },
        reward: {
          experience: 2280000,
          logMessage: "你承下帝血餘波，萬獸山莊 v3 餘獵轉成肉身修為。",
        },
      },
    ],
  },
  mystic_immortal_afterglow_starlotus: {
    id: "mystic_immortal_afterglow_starlotus",
    title: "星詔餘光蓮池",
    description: "星詔牒在接引仙殿展開後，縹緲仙宮仍可從餘光星池中反覆凝出星魂蓮。",
    minRealm: MajorRealm.Immortal,
    maxRealm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 4,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Mage],
      requiredWorldMemoryTags: ["sect:mystic:world-chapter-03"],
    },
    presentation: {
      categoryLabel: "仙人 v3 路線餘波",
      routeLabel: "縹緲仙宮",
      chainLabel: "星詔餘波",
      memoryCue: "星詔餘光會讀取 v3 縹緲仙宮世界章節記憶，讓神識路線延續成穩定材料來源。",
      sectLabel: "縹緲仙宮 v3 餘波",
    },
    choices: [
      {
        id: "gather_afterglow_starlotus",
        label: "凝採餘光星蓮",
        description: "以神識穩住星詔餘光，在星池邊凝出一株可入丹方的星魂蓮。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲星魂蓮 x1" },
            { kind: "resource", label: "材料來源" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 1 }],
          logMessage: "你從星詔餘光裡凝出一株縹緲星魂蓮，v3 法修路線多了一條可重複材料來源。",
        },
      },
      {
        id: "read_afterglow_star_pattern",
        label: "解讀餘光星紋",
        description: "不採星蓮，改把星池排列轉成神識推演。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "穩定收益" },
            { kind: "benefit", label: "神識推演" },
          ],
        },
        reward: {
          experience: 2420000,
          logMessage: "你讀完星詔餘光星紋，縹緲仙宮 v3 餘波轉成穩定神識收益。",
        },
      },
    ],
  },
  sword_emperor_heaven_sunder_oath: createSingleRealmEncounterEvent({
    id: "sword_emperor_heaven_sunder_oath",
    title: "斬天帝劍盟",
    description: "凌霄劍宗的終盤劍盟在帝境裂界邊緣重開，劍修可選擇搶資材或立下更高階的帝劍節奏。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 5,
      eligibleProfessions: [ProfessionType.Sword],
      requiredCompletedQuestIds: ["sect_sword_task_04"],
    },
    presentation: {
      categoryLabel: "仙帝終盤路線",
      routeLabel: "凌霄劍宗",
      sectLabel: "凌霄劍宗帝境承接",
    },
    choices: [
      {
        id: "claim_heaven_sunder_starsteel",
        label: "奪取斬天星鋼",
        description: "趁帝劍盟尚未散去，取走最適合終盤器方的星鋼。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "凌霄劍宗帝境" },
            { kind: "resource", label: "凌霄劍星鋼 x2" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 2 }],
          logMessage: "你從斬天帝劍盟中奪回兩段凌霄劍星鋼，終盤器方不再只靠通用寶潮。",
        },
      },
      {
        id: "engrave_heaven_sunder_oath",
        label: "刻下帝劍盟誓",
        description: "不取材料，改把帝劍盟的節奏刻進神魂。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "帝劍節奏" },
            { kind: "benefit", label: "仙帝劍修" },
          ],
        },
        reward: {
          experience: 3840000,
          logMessage: "你刻下斬天帝劍盟誓，凌霄劍宗的仙帝路線變得更有辨識度。",
        },
      },
    ],
  }),
  beast_emperor_worldblood_hunt: createSingleRealmEncounterEvent({
    id: "beast_emperor_worldblood_hunt",
    title: "萬獸帝血獵",
    description: "萬獸山莊的帝血獵場在裂界深處展開，體修必須在高壓追獵與資材回收間取捨。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 5,
      eligibleProfessions: [ProfessionType.Body],
      requiredCompletedQuestIds: ["sect_beast_task_04"],
    },
    presentation: {
      categoryLabel: "仙帝終盤路線",
      routeLabel: "萬獸山莊",
      sectLabel: "萬獸山莊帝境承接",
    },
    choices: [
      {
        id: "harvest_worldblood_bones",
        label: "剝取帝血骨",
        description: "追上裂界中墜落的帝血獸骨，剝下最適合終盤鍛體的殘材。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "萬獸山莊帝境" },
            { kind: "resource", label: "萬獸血骨殘材 x2" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 2 }],
          logMessage: "你在帝血獵場剝下兩份萬獸血骨殘材，體修終盤材料來源終於不再抽象。",
        },
      },
      {
        id: "survive_worldblood_hunt",
        label: "硬撐帝血獵",
        description: "放棄剝材，專心承受帝血獵場的追壓，把它化成肉身底盤。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高壓鍛體" },
            { kind: "benefit", label: "仙帝體修" },
          ],
        },
        reward: {
          experience: 3720000,
          logMessage: "你硬撐完帝血獵場，萬獸山莊的仙帝肉身路線有了真正的高壓節點。",
        },
      },
    ],
  }),
  mystic_emperor_star_throne_decree: createSingleRealmEncounterEvent({
    id: "mystic_emperor_star_throne_decree",
    title: "星座帝詔庭",
    description: "縹緲仙宮的星座帝詔庭在鴻蒙邊界浮現，法修可從詔庭裡取星蓮，也可直接推演帝境術式。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 5,
      eligibleProfessions: [ProfessionType.Mage],
      requiredCompletedQuestIds: ["sect_mystic_task_04"],
    },
    presentation: {
      categoryLabel: "仙帝終盤路線",
      routeLabel: "縹緲仙宮",
      sectLabel: "縹緲仙宮帝境承接",
    },
    choices: [
      {
        id: "gather_star_throne_lotus",
        label: "採下帝詔星蓮",
        description: "以神識穩住帝詔庭的星位，採下仍帶鴻蒙氣的星魂蓮。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "縹緲仙宮帝境" },
            { kind: "resource", label: "縹緲星魂蓮 x2" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 2 }],
          logMessage: "你從星座帝詔庭採下兩株縹緲星魂蓮，法修終盤丹方終於有了穩定回路。",
        },
      },
      {
        id: "read_star_throne_decree",
        label: "解讀帝詔星位",
        description: "不採蓮，直接解讀帝詔庭的星位排列。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "帝境術式" },
            { kind: "benefit", label: "仙帝法修" },
          ],
        },
        reward: {
          experience: 3920000,
          logMessage: "你解讀帝詔星位，縹緲仙宮的仙帝法修路線不再只靠通用帝旨支撐。",
        },
      },
    ],
  }),
  sword_emperor_v4_heaven_sunder_convergence: createSingleRealmEncounterEvent({
    id: "sword_emperor_v4_heaven_sunder_convergence",
    title: "歸墟斬天終局",
    description: "斬天帝劍盟的餘誓在歸墟裂界收束，凌霄劍宗弟子可把本世劍路刻成下一世仍能讀取的終盤記憶。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 3,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Sword],
      requiredResolvedEventIds: ["sword_emperor_heaven_sunder_oath"],
      requiredWorldMemoryTags: ["sect:sword:world-chapter-03"],
    },
    presentation: {
      categoryLabel: "仙帝 v4 終盤收束",
      routeLabel: "凌霄劍宗",
      chainLabel: "斬天終局",
      memoryCue: "完成後會留下 sect:sword:endgame-loop-v4，供終盤 Workshop sink 與輪迴魂印讀取。",
      sectLabel: "凌霄劍宗 v4 收束",
    },
    chain: {
      chainId: "endgame-loop-v4-sword",
      step: 1,
      worldMemoryTags: ["sect:sword:endgame-loop-v4"],
    },
    choices: [
      {
        id: "seal_heaven_sunder_memory",
        label: "刻下斬天終局",
        description: "把帝劍盟、接引仙殿與歸墟裂界的劍痕壓成可輪迴讀取的終盤印記。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "v4 終盤記憶" },
            { kind: "benefit", label: "凌霄劍宗輪迴" },
          ],
        },
        reward: {
          experience: 5200000,
          logMessage: "你將斬天終局刻進神魂，凌霄劍宗 v4 終盤記憶已可供下一世承接。",
        },
      },
      {
        id: "collect_heaven_sunder_convergence_starsteel",
        label: "收束斬天星鋼",
        description: "從終局劍痕裡取回最後一批可用星鋼，供三路線終盤爐火收束。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x2" },
            { kind: "benefit", label: "終盤 Workshop sink" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 2 }],
          logMessage: "你收束斬天星鋼，讓凌霄劍宗 v4 終局可回接終盤 Workshop 爐火。",
        },
      },
    ],
  }),
  beast_emperor_v4_worldblood_convergence: createSingleRealmEncounterEvent({
    id: "beast_emperor_v4_worldblood_convergence",
    title: "歸墟帝血終局",
    description: "萬獸帝血獵的血壓在歸墟裂界聚成終局骨潮，體修可把這條高壓肉身路線留給下一世。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 3,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Body],
      requiredResolvedEventIds: ["beast_emperor_worldblood_hunt"],
      requiredWorldMemoryTags: ["sect:beast:world-chapter-03"],
    },
    presentation: {
      categoryLabel: "仙帝 v4 終盤收束",
      routeLabel: "萬獸山莊",
      chainLabel: "帝血終局",
      memoryCue: "完成後會留下 sect:beast:endgame-loop-v4，供終盤 Workshop sink 與輪迴魂印讀取。",
      sectLabel: "萬獸山莊 v4 收束",
    },
    chain: {
      chainId: "endgame-loop-v4-beast",
      step: 1,
      worldMemoryTags: ["sect:beast:endgame-loop-v4"],
    },
    choices: [
      {
        id: "seal_worldblood_memory",
        label: "封存帝血終局",
        description: "把帝血獵場的血壓與歸墟骨潮封成下一世仍能承接的肉身記憶。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "v4 終盤記憶" },
            { kind: "benefit", label: "萬獸山莊輪迴" },
          ],
        },
        reward: {
          experience: 5060000,
          logMessage: "你封住帝血終局，萬獸山莊 v4 終盤記憶已成為下一世肉身底盤。",
        },
      },
      {
        id: "harvest_worldblood_convergence_bone",
        label: "剝取終局血骨",
        description: "從歸墟骨潮裡剝下可入終盤爐火的血骨殘材。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x2" },
            { kind: "risk", label: "終盤 Workshop sink" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 2 }],
          logMessage: "你剝取終局血骨，萬獸山莊 v4 終局材料能回到終盤爐火。",
        },
      },
    ],
  }),
  mystic_emperor_v4_star_throne_convergence: createSingleRealmEncounterEvent({
    id: "mystic_emperor_v4_star_throne_convergence",
    title: "歸墟星詔終局",
    description: "星座帝詔庭的星位在歸墟裂界合成最後一張命盤，縹緲仙宮可把本世神識路線留入輪迴。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 3,
      repeatPolicy: "once_per_run",
      eligibleProfessions: [ProfessionType.Mage],
      requiredResolvedEventIds: ["mystic_emperor_star_throne_decree"],
      requiredWorldMemoryTags: ["sect:mystic:world-chapter-03"],
    },
    presentation: {
      categoryLabel: "仙帝 v4 終盤收束",
      routeLabel: "縹緲仙宮",
      chainLabel: "星詔終局",
      memoryCue: "完成後會留下 sect:mystic:endgame-loop-v4，供終盤 Workshop sink 與輪迴魂印讀取。",
      sectLabel: "縹緲仙宮 v4 收束",
    },
    chain: {
      chainId: "endgame-loop-v4-mystic",
      step: 1,
      worldMemoryTags: ["sect:mystic:endgame-loop-v4"],
    },
    choices: [
      {
        id: "seal_star_throne_memory",
        label: "銘定星詔終局",
        description: "把帝詔庭星位與歸墟命盤合成下一世仍可讀取的神識記憶。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "v4 終盤記憶" },
            { kind: "benefit", label: "縹緲仙宮輪迴" },
          ],
        },
        reward: {
          experience: 5340000,
          logMessage: "你銘定星詔終局，縹緲仙宮 v4 終盤記憶已可照入下一世命盤。",
        },
      },
      {
        id: "gather_star_throne_convergence_lotus",
        label: "凝採終局星蓮",
        description: "從歸墟命盤裡凝出最後一批能壓住終盤爐火的星魂蓮。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲星魂蓮 x2" },
            { kind: "benefit", label: "終盤 Workshop sink" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 2 }],
          logMessage: "你凝採終局星蓮，縹緲仙宮 v4 終局材料已能回接終盤 Workshop 爐火。",
        },
      },
    ],
  }),
  sword_emperor_v5_heaven_sunder_afterpath: createSingleRealmEncounterEvent({
    id: "sword_emperor_v5_heaven_sunder_afterpath",
    title: "斬天餘路星鋼潮",
    description: "斬天終局被輪迴記住後，凌霄劍宗仍能在歸墟餘路中反覆取回劍冕星鋼。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 4,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Sword],
      requiredWorldMemoryTags: ["sect:sword:endgame-loop-v4"],
    },
    presentation: {
      categoryLabel: "仙帝 v5 路線餘波",
      routeLabel: "凌霄劍宗",
      chainLabel: "斬天餘路",
      memoryCue: "v5 斬天餘路讀取 sect:sword:endgame-loop-v4，延續帝冕後的劍修材料與下一世 build hook。",
      sectLabel: "凌霄劍宗 v5 餘波",
    },
    choices: [
      {
        id: "salvage_v5_heaven_sunder_starsteel",
        label: "收回劍冕星鋼",
        description: "沿著帝冕裂痕取回一段仍能重鍛本命帝劍的星鋼。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x1" },
            { kind: "resource", label: "材料來源" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 1 }],
          logMessage: "你從斬天餘路取回凌霄劍星鋼，v5 劍宗終盤有了可重複材料回路。",
        },
      },
      {
        id: "temper_v5_heaven_sunder_oath",
        label: "重溫斬天誓",
        description: "不取材料，將餘路劍痕壓成下一輪出劍節奏。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "穩定收益" },
            { kind: "benefit", label: "v5 劍修 build" },
          ],
        },
        reward: {
          experience: 5680000,
          logMessage: "你重溫斬天誓，凌霄劍宗 v5 餘波轉成穩定修為與下一世劍路提示。",
        },
      },
    ],
  }),
  beast_emperor_v5_worldblood_afterpath: createSingleRealmEncounterEvent({
    id: "beast_emperor_v5_worldblood_afterpath",
    title: "帝血餘路骨潮",
    description: "帝血終局沉入輪迴後，萬獸山莊仍能在歸墟骨潮中反覆壓出可用血骨。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 4,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Body],
      requiredWorldMemoryTags: ["sect:beast:endgame-loop-v4"],
    },
    presentation: {
      categoryLabel: "仙帝 v5 路線餘波",
      routeLabel: "萬獸山莊",
      chainLabel: "帝血餘路",
      memoryCue: "v5 帝血餘路讀取 sect:beast:endgame-loop-v4，延續帝冕後的體修材料與下一世 build hook。",
      sectLabel: "萬獸山莊 v5 餘波",
    },
    choices: [
      {
        id: "harvest_v5_worldblood_bloodbone",
        label: "剝下餘路血骨",
        description: "硬闖歸墟骨潮，剝下一段足以回爐大道真身的血骨殘材。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x1" },
            { kind: "risk", label: "高風險收益" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 1 }],
          logMessage: "你剝下餘路血骨，萬獸山莊 v5 終盤保留高壓材料來源。",
        },
      },
      {
        id: "endure_v5_worldblood_pressure",
        label: "承受餘路血壓",
        description: "讓帝血餘路反覆壓身，把終盤骨潮化作肉身底盤。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "risk", label: "高風險收益" },
            { kind: "benefit", label: "v5 體修 build" },
          ],
        },
        reward: {
          experience: 5520000,
          logMessage: "你承受帝血餘路血壓，萬獸山莊 v5 餘波轉成體修底盤。",
        },
      },
    ],
  }),
  mystic_emperor_v5_star_throne_afterpath: createSingleRealmEncounterEvent({
    id: "mystic_emperor_v5_star_throne_afterpath",
    title: "星詔餘路蓮命",
    description: "星詔終局照入輪迴後，縹緲仙宮仍能從歸墟命盤中反覆凝出終局星蓮。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 4,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Mage],
      requiredWorldMemoryTags: ["sect:mystic:endgame-loop-v4"],
    },
    presentation: {
      categoryLabel: "仙帝 v5 路線餘波",
      routeLabel: "縹緲仙宮",
      chainLabel: "星詔餘路",
      memoryCue: "v5 星詔餘路讀取 sect:mystic:endgame-loop-v4，延續帝冕後的法修材料與下一世 build hook。",
      sectLabel: "縹緲仙宮 v5 餘波",
    },
    choices: [
      {
        id: "gather_v5_star_throne_starlotus",
        label: "凝採餘路星蓮",
        description: "以神識穩住歸墟命盤，凝出一株能重鍛法杖的星魂蓮。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲星魂蓮 x1" },
            { kind: "resource", label: "材料來源" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 1 }],
          logMessage: "你凝出餘路星蓮，縹緲仙宮 v5 終盤保留穩定材料來源。",
        },
      },
      {
        id: "read_v5_star_throne_chart",
        label: "推演餘路星盤",
        description: "不採星蓮，改把餘路星盤轉為下一世神識開局提示。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "benefit", label: "穩定收益" },
            { kind: "benefit", label: "v5 法修 build" },
          ],
        },
        reward: {
          experience: 5840000,
          logMessage: "你推演餘路星盤，縹緲仙宮 v5 餘波轉成神識修為與下一世命盤提示。",
        },
      },
    ],
  }),
  sword_emperor_v6_heaven_sunder_echo: createSingleRealmEncounterEvent({
    id: "sword_emperor_v6_heaven_sunder_echo",
    title: "斬天迴響劍冕潮",
    description: "斬天終局與 v5 餘路穩定後，凌霄劍宗可在歸墟裂界反覆辨認劍冕迴響。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 3,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Sword],
      requiredWorldMemoryTags: ["sect:sword:endgame-loop-v4"],
    },
    presentation: {
      categoryLabel: "仙帝 v6 路線餘波",
      routeLabel: "凌霄劍宗",
      chainLabel: "斬天迴響",
      memoryCue: "v6 斬天迴響讀取 sect:sword:endgame-loop-v4，補足劍修終盤 repeatable aftermath、Workshop 與輪迴 cue。",
      sectLabel: "凌霄劍宗 v6 迴響",
    },
    choices: [
      {
        id: "salvage_v6_heaven_sunder_starsteel",
        label: "辨回劍冕星鋼",
        description: "把劍冕迴響中的星鋼碎脈收回，保留給終盤帝劍回爐。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "凌霄劍星鋼 x1" },
            { kind: "benefit", label: "v6 Workshop clue" },
          ],
        },
        reward: {
          items: [{ itemId: "sword_path_starsteel", count: 1 }],
          logMessage: "你辨回劍冕星鋼，凌霄劍宗 v6 迴響接上終盤 Workshop 與下一世劍路。",
        },
      },
    ],
  }),
  beast_emperor_v6_worldblood_echo: createSingleRealmEncounterEvent({
    id: "beast_emperor_v6_worldblood_echo",
    title: "帝血迴響骨脈潮",
    description: "帝血終局沉入骨潮後，萬獸山莊可反覆取回能承受歸墟壓力的骨脈。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 3,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Body],
      requiredWorldMemoryTags: ["sect:beast:endgame-loop-v4"],
    },
    presentation: {
      categoryLabel: "仙帝 v6 路線餘波",
      routeLabel: "萬獸山莊",
      chainLabel: "帝血迴響",
      memoryCue: "v6 帝血迴響讀取 sect:beast:endgame-loop-v4，補足體修終盤 repeatable aftermath、Workshop 與輪迴 cue。",
      sectLabel: "萬獸山莊 v6 迴響",
    },
    choices: [
      {
        id: "harvest_v6_worldblood_bloodbone",
        label: "壓出帝血骨脈",
        description: "承受骨潮反壓，取回一段可回爐大道真身的血骨殘材。",
        cue: {
          tone: "risky",
          tags: [
            { kind: "resource", label: "萬獸血骨殘材 x1" },
            { kind: "risk", label: "v6 高壓收益" },
          ],
        },
        reward: {
          items: [{ itemId: "beast_path_bloodbone", count: 1 }],
          logMessage: "你壓出帝血骨脈，萬獸山莊 v6 迴響接上體修終盤 Workshop。",
        },
      },
    ],
  }),
  mystic_emperor_v6_star_throne_echo: createSingleRealmEncounterEvent({
    id: "mystic_emperor_v6_star_throne_echo",
    title: "星詔迴響蓮命潮",
    description: "星詔終局照入歸墟後，縹緲仙宮可反覆凝回穩住法杖與丹火的星蓮命盤。",
    realm: MajorRealm.ImmortalEmperor,
    selector: {
      weight: 3,
      repeatPolicy: "repeatable",
      eligibleProfessions: [ProfessionType.Mage],
      requiredWorldMemoryTags: ["sect:mystic:endgame-loop-v4"],
    },
    presentation: {
      categoryLabel: "仙帝 v6 路線餘波",
      routeLabel: "縹緲仙宮",
      chainLabel: "星詔迴響",
      memoryCue: "v6 星詔迴響讀取 sect:mystic:endgame-loop-v4，補足法修終盤 repeatable aftermath、Workshop 與輪迴 cue。",
      sectLabel: "縹緲仙宮 v6 迴響",
    },
    choices: [
      {
        id: "gather_v6_star_throne_starlotus",
        label: "凝回星詔蓮命",
        description: "從星詔迴響中凝回星魂蓮，讓終盤法杖與丹火仍有可追溯來源。",
        cue: {
          tone: "steady",
          tags: [
            { kind: "resource", label: "縹緲星魂蓮 x1" },
            { kind: "benefit", label: "v6 法修 build" },
          ],
        },
        reward: {
          items: [{ itemId: "mystic_path_starlotus", count: 1 }],
          logMessage: "你凝回星詔蓮命，縹緲仙宮 v6 迴響接上法修終盤 Workshop 與輪迴提示。",
        },
      },
    ],
  }),
};

export const ENCOUNTER_EVENTS: Record<string, EncounterEvent> =
  normalizeEncounterEvents(RAW_ENCOUNTER_EVENTS);

export const getEncounterEventById = (eventId: string) => ENCOUNTER_EVENTS[eventId];

export interface EncounterMaterialSourceCue {
  eventId: string;
  title: string;
  categoryLabel?: string;
  routeLabel?: string;
  minRealm: MajorRealm;
  maxRealm: MajorRealm;
}

export const getEncounterMaterialSourceCues = (itemId: string): EncounterMaterialSourceCue[] =>
  Object.values(ENCOUNTER_EVENTS)
    .filter((event) =>
      event.choices.some((choice) =>
        choice.reward.items?.some((rewardItem) => rewardItem.itemId === itemId)
      )
    )
    .map((event) => ({
      eventId: event.id,
      title: event.title,
      categoryLabel: event.presentation?.categoryLabel,
      routeLabel: event.presentation?.routeLabel,
      minRealm: event.minRealm,
      maxRealm: event.maxRealm,
    }));

const isEncounterEligible = (
  event: EncounterEvent,
  context: EncounterSelectorContext
) => {
  if (context.majorRealm < event.minRealm || context.majorRealm > event.maxRealm) {
    return false;
  }

  if (
    event.selector?.repeatPolicy === "once_per_run" &&
    context.resolvedEventIds.includes(event.id)
  ) {
    return false;
  }

  if (
    event.selector?.eligibleProfessions &&
    event.selector.eligibleProfessions.length > 0 &&
    !event.selector.eligibleProfessions.includes(context.profession)
  ) {
    return false;
  }

  if (
    event.selector?.requiredCompletedQuestIds &&
    !event.selector.requiredCompletedQuestIds.every((questId) =>
      context.completedQuestIds.includes(questId)
    )
  ) {
    return false;
  }

  if (
    event.selector?.requiredResolvedEventIds &&
    !event.selector.requiredResolvedEventIds.every((eventId) =>
      context.resolvedEventIds.includes(eventId)
    )
  ) {
    return false;
  }

  if (
    event.selector?.requiredWorldMemoryTags &&
    !event.selector.requiredWorldMemoryTags.every((tag) =>
      (context.worldMemoryTags ?? []).includes(tag)
    )
  ) {
    return false;
  }

  return true;
};

export const getAvailableEncounterEvents = (context: EncounterSelectorContext) =>
  Object.values(ENCOUNTER_EVENTS).filter((event) => isEncounterEligible(event, context));

export const pickEncounterEvent = (
  context: EncounterSelectorContext,
  roll = Math.random()
): EncounterEvent | null => {
  const available = getAvailableEncounterEvents(context);
  if (available.length === 0) {
    return null;
  }

  const totalWeight = available.reduce(
    (sum, event) => sum + Math.max(0, event.selector?.weight ?? 1),
    0
  );

  if (totalWeight <= 0) {
    const normalizedRoll = Math.min(Math.max(roll, 0), 0.9999999999999999);
    return available[Math.floor(normalizedRoll * available.length)];
  }

  let threshold = Math.min(Math.max(roll, 0), 0.9999999999999999) * totalWeight;

  for (const event of available) {
    threshold -= Math.max(0, event.selector?.weight ?? 1);
    if (threshold < 0) {
      return event;
    }
  }

  return available[available.length - 1];
};

export const getEncounterChoice = (
  pending: PendingEncounter,
  choiceId: string
) => getEncounterEventById(pending.eventId)?.choices.find((choice) => choice.id === choiceId);
