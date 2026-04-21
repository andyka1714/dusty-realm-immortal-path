import { MajorRealm, MajorRealmCN } from "../../types";
import { getHighRealmCultivationSpec } from "./balanceAudit";

export interface HighRealmLoopSupportChannel {
  multiplier: number;
  summary: string;
  itemIds?: string[];
  featureIds?: string[];
  eventIds?: string[];
}

export interface HighRealmLoopSupportProfile {
  realm: MajorRealm;
  realmName: string;
  pill: HighRealmLoopSupportChannel;
  dwelling: HighRealmLoopSupportChannel;
  encounter: HighRealmLoopSupportChannel;
  event: HighRealmLoopSupportChannel;
}

const HIGH_REALM_LOOP_CHANNELS: Partial<
  Record<
    MajorRealm,
    {
      pillItemIds: string[];
      encounterEventIds: string[];
      eventEventIds: string[];
      pillSummary: string;
      dwellingSummary: string;
      encounterSummary: string;
      eventSummary: string;
    }
  >
> = {
  [MajorRealm.SpiritSevering]: {
    pillItemIds: ["bt_spirit_void"],
    encounterEventIds: ["spirit_severing_herb_tide"],
    eventEventIds: ["spirit_severing_edict"],
    pillSummary: "化神把丹火補強先落在太虛破障丹，避免只剩閉關堆時長。",
    dwellingSummary: "化神洞府仍以聚靈陣為主，但開始要求它與丹藥共同補底盤。",
    encounterSummary: "化神遭遇用裂神藥潮補第一段實際修為缺口，不讓主線節奏乾掉。",
    eventSummary: "化神事件偏向節奏啟蒙，讓玩家開始理解洞府與丹火並進的必要性。",
  },
  [MajorRealm.VoidRefining]: {
    pillItemIds: ["bt_void_fusion"],
    encounterEventIds: ["void_refining_void_barter"],
    eventEventIds: ["void_refining_star_chart"],
    pillSummary: "煉虛把萬法歸一髓視為正式補速點，開始承接後段主修為需求。",
    dwellingSummary: "煉虛洞府需要更高密度的聚靈節點，不再只是固定被動加成。",
    encounterSummary: "煉虛遭遇用虛市殘攤補掉資源周轉，避免材料線與閉關互相拖累。",
    eventSummary: "煉虛事件明確指向節點調度，讓洞府 multiplier 有對應的實際玩法來源。",
  },
  [MajorRealm.Fusion]: {
    pillItemIds: ["bt_fusion_maha"],
    encounterEventIds: ["fusion_law_forge"],
    eventEventIds: ["fusion_resonance_record"],
    pillSummary: "合體期以天道感悟果作為高階丹火與突破補速的代表素材。",
    dwellingSummary: "合體洞府要和法相鍛鍊同步運作，否則 multiplier 只是紙上數字。",
    encounterSummary: "合體遭遇偏向法相熔坊與材料回收，承接掃圖與 build progression。",
    eventSummary: "合體事件會直接提示首殺、洞府與丹火並進，讓 audit 預期有具體對照。",
  },
  [MajorRealm.Mahayana]: {
    pillItemIds: ["bt_maha_trib"],
    encounterEventIds: ["mahayana_pillar_blessing"],
    eventEventIds: ["mahayana_ancestral_feast"],
    pillSummary: "大乘以九轉渡劫丹這類高階丹藥穩住心脈與時間牆。",
    dwellingSummary: "大乘洞府定位成穩定底盤，不再允許只靠一次性事件推過整境界。",
    encounterSummary: "大乘遭遇提供天柱餘照這種高強度補速點，避免後段修為節奏塌陷。",
    eventSummary: "大乘事件轉而提供大量靈資與修為，讓多線循環真正形成閉環。",
  },
  [MajorRealm.Tribulation]: {
    pillItemIds: ["bt_trib_immortal"],
    encounterEventIds: ["tribulation_lightning_cache"],
    eventEventIds: ["tribulation_celestial_notice"],
    pillSummary: "渡劫把飛昇仙引前置到正式支撐線，不再是單純的終局門票。",
    dwellingSummary: "渡劫洞府是壓住總時長的主底盤之一，必須和事件乘區一起成立。",
    encounterSummary: "渡劫遭遇主打高風險高回報秘庫，對齊 audit 裡更高的 encounter 權重。",
    eventSummary: "渡劫事件偏向前告與節奏指引，讓玩家知道該靠事件與挑戰拉起總倍率。",
  },
  [MajorRealm.Immortal]: {
    pillItemIds: ["bt_immortal_emperor"],
    encounterEventIds: ["immortal_command_cache"],
    eventEventIds: ["immortal_flying_decree"],
    pillSummary: "仙人期把鴻蒙本源正式納入丹藥與突破支撐線，避免終盤只剩閉關乾耗。",
    dwellingSummary: "仙人洞府乘區必須持續供應靈氣與資源，支撐更高昂的多線培養。",
    encounterSummary: "仙人遭遇直接補本源與軍庫周轉，讓高境界 multiplier 有真實材料承接。",
    eventSummary: "仙人事件會把多線閉環說清楚，避免玩家把後段節奏誤解成單線數值牆。",
  },
  [MajorRealm.ImmortalEmperor]: {
    pillItemIds: ["bt_immortal_emperor", "emperor_crown"],
    encounterEventIds: ["emperor_rift_harvest"],
    eventEventIds: ["emperor_hongmeng_mandate"],
    pillSummary: "帝境以鴻蒙本源與帝級戰利品共同撐住終盤 build，不允許只靠時間硬磨。",
    dwellingSummary: "帝境洞府 multiplier 是終盤底盤，必須和 route-specific 掉落與事件同步生效。",
    encounterSummary: "帝境遭遇直接對應裂界寶潮與終盤專屬掉落，確保路線辨識和進度提速都成立。",
    eventSummary: "帝境事件明確聲明四類乘區必須並進，讓終盤 audit 有可驗證的實際入口。",
  },
};

const BASE_DWELLING_FEATURE_IDS = ["gathering_array"];

export const HIGH_REALM_LOOP_SUPPORT: Partial<Record<MajorRealm, HighRealmLoopSupportProfile>> =
  Object.entries(HIGH_REALM_LOOP_CHANNELS).reduce((acc, [realmKey, channelConfig]) => {
    const realm = Number(realmKey) as MajorRealm;
    const cultivationSpec = getHighRealmCultivationSpec(realm);
    if (!cultivationSpec || !channelConfig) {
      return acc;
    }

    acc[realm] = {
      realm,
      realmName: MajorRealmCN[realm],
      pill: {
        multiplier: cultivationSpec.pillMultiplier,
        itemIds: channelConfig.pillItemIds,
        summary: channelConfig.pillSummary,
      },
      dwelling: {
        multiplier: cultivationSpec.dwellingMultiplier,
        featureIds: BASE_DWELLING_FEATURE_IDS,
        summary: channelConfig.dwellingSummary,
      },
      encounter: {
        multiplier: cultivationSpec.encounterMultiplier,
        eventIds: channelConfig.encounterEventIds,
        summary: channelConfig.encounterSummary,
      },
      event: {
        multiplier: cultivationSpec.eventMultiplier,
        eventIds: channelConfig.eventEventIds,
        summary: channelConfig.eventSummary,
      },
    };

    return acc;
  }, {} as Partial<Record<MajorRealm, HighRealmLoopSupportProfile>>);

export const getHighRealmLoopSupportProfile = (realm: MajorRealm) =>
  HIGH_REALM_LOOP_SUPPORT[realm];
