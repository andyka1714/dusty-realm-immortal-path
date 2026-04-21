import { type PlayerPassiveFlags } from "./battlePassives";

const INITIAL_PASSIVE_OPENING_MESSAGE_ENTRIES = [
  { flag: "hasReflectPassive", message: "【荊棘皮層】已覆上體表，只待近身來敵反震自傷。" },
  { flag: "hasInitialShieldPassive", message: "戰鬥開始時，你獲得了【元素護盾】。" },
  { flag: "hasSwordGoldenPassive", message: "【劍心通明】劍心澄澈待發，暴擊時將牽動流光劍影再次出鞘。" },
  { flag: "hasSwordDeathWardPassive", message: "【護體劍罡】劍罡已護住命門，一次致命來襲將被強行截斷。" },
  { flag: "hasSwordEchoPassive", message: "【劍意化形】劍意凝影待發，普攻將化作雙段追斬。" },
  { flag: "hasSwordQiPassive", message: "【劍脈初成】劍勢已然循環，暴擊將牽動破甲追擊。" },
  { flag: "hasBodyQiPassive", message: "【銅皮鐵骨】筋骨已提前繃緊，凡俗重擊將被層層卸去。" },
  { flag: "hasBodyFoundationPassive", message: "【蠻荒血脈】荒血已在體內鼓盪，負傷越深，血勢越兇。" },
  { flag: "hasBodyRebirthPassive", message: "【滴血重生】血氣已盤踞命宮，重傷時將自行回生續戰。" },
  { flag: "hasSwordHeartPassive", message: "【養劍術】劍勢已在心湖沉澱，敵招受阻時將持續蓄起更深殺機。" },
  { flag: "hasBodySaintPassive", message: "【肉身成聖】聖軀已穩，重擊將被大幅化去。" },
  { flag: "hasMageQiPassive", message: "【靈潮循環】靈潮已在經脈間往復，普攻空窗也會持續回潮。" },
  { flag: "hasManaSpringPassive", message: "【法力源泉】靈海滿溢時，術式威能將再向上拔高。" },
  { flag: "hasMageFoundationPassive", message: "【靈力湧動】靈元已在經脈間翻騰，施法時將順勢拔高術式威能。" },
  { flag: "hasMageSpiritSeveringPassive", message: "【道法自然】術式流轉圓融，萬法冷卻將提早歸位。" },
  { flag: "hasMageFusionPassive", message: "【五氣朝元】五氣已在丹府間周天輪轉，術式回補與免耗隨時可被喚醒。" },
  { flag: "hasBodyAncientPassive", message: "【荒古戰體】荒古血肉盤踞周身，負面侵蝕將被持續震散。" },
  { flag: "hasBodyFusionPassive", message: "【金剛法相】法相已在筋骨間待命，來襲重擊將被再次硬生生卸去。" },
  { flag: "hasSwordImmortalPassive", message: "【仙元護體】劍元護體已待命，將定時凝成一次絕對護盾。" },
  { flag: "hasBodyImmortalPassive", message: "【仙體無垢】仙血流轉無垢，灼毒與流血將被直接抹除。" },
  { flag: "hasMageVoidPassive", message: "【空間法則】虛空褶皺護住法身，部分來襲將被挪入虛空。" },
  { flag: "hasSwordEmperorPassive", message: "【萬法皆空】劍意已斷萬法因果，負面侵蝕將被直接抹去。" },
  { flag: "hasBodyEmperorPassive", message: "【不死不滅】霸體鎮住命門，最後一線生機尚未斷絕。" },
  { flag: "hasMageImmortalPassive", message: "【仙法通神】仙元灌注靈海，術式回響已待命啟動。" },
  { flag: "hasMageEmperorPassive", message: "【萬法歸宗】萬法歸一鎮住靈臺，敵方特招節奏將被持續遲滯。" },
  { flag: "hasSwordFusionPassive", message: "【人劍合神】劍魂已與識海相融，控制侵蝕將被強行縮短。" },
  { flag: "hasBodyTribulationPassive", message: "【萬劫不滅】劫火護體待發，每次承傷都將反煉肉身。" },
  { flag: "hasMageTribulationPassive", message: "【雷劫煉心】雷痕纏身護識，控制侵蝕將被天雷反煉。" },
  { flag: "hasSwordMahayanaPassive", message: "【劍道獨尊】劍勢已鎖定全場，敵勢越盛越助你凝出殺機。" },
  { flag: "hasMageMahayanaPassive", message: "【言出法隨】法言既出即成天條，主動術式威能已被抬升。" },
] as const satisfies ReadonlyArray<{
  flag: keyof PlayerPassiveFlags;
  message: string;
}>;

type EncounterOpeningPassiveFlag =
  (typeof INITIAL_PASSIVE_OPENING_MESSAGE_ENTRIES)[number]["flag"];

export type EncounterOpeningPassiveFlags = Pick<
  PlayerPassiveFlags,
  EncounterOpeningPassiveFlag
>;

export const getInitialPassiveBattleLogMessages = (
  passiveFlags: EncounterOpeningPassiveFlags
) =>
  INITIAL_PASSIVE_OPENING_MESSAGE_ENTRIES.flatMap(({ flag, message }) =>
    passiveFlags[flag] ? [message] : []
  );
