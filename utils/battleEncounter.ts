import { ELEMENT_NAMES } from "../constants";
import { CombatLog, ElementType, Enemy, EnemyRank, ProfessionType, Skill } from "../types";
import { pushCombatLog, setCombatLogSnapshotProvider } from "./battleLog";
import { type PlayerPassiveFlags, getPlayerPassiveFlags } from "./battlePassives";
import {
  createCombatSnapshotProvider,
  createStatusTickProcessor,
  isNegativeStatusKind,
} from "./battleStatuses";
import {
  getEnemyAttackIntervalMs,
  getPlayerAttackIntervalMs,
  getResolvedSkillCooldownSeconds,
} from "./battleProfiles";

type CombatStatusLike = {
  id: string;
  name: string;
  kind:
    | "incapacitate"
    | "burn"
    | "poison"
    | "bleed"
    | "armorBreak"
    | "critBoost"
    | "shield"
    | "reflect"
    | "drain";
  value: number;
  expiresAtMs: number;
  nextTickAtMs?: number;
};

type PlayerCombatStatsLike = {
  profession: ProfessionType;
  learnedSkills: Skill[];
  element: ElementType;
  speed: number;
  maxHp: number;
  maxMp: number;
  regenHp: number;
};

export type CombatRuntimeContext = {
  activeSkill?: Skill;
  playerAttackIntervalMs: number;
  enemyAttackIntervalMs: number;
  pVsE: { isEffective: boolean; isResisted: boolean };
  enemyElementalAffinity: { multiplier: number; reason?: "resistance" | "weakness" };
  passiveFlags: PlayerPassiveFlags;
};

export type CombatLoopFeatureFlags = Pick<
  PlayerPassiveFlags,
  | "hasBodyRebirthPassive"
  | "hasManaSpringPassive"
  | "hasMageFusionPassive"
  | "hasBodyImmortalPassive"
  | "hasBodyAncientPassive"
  | "hasSwordImmortalPassive"
  | "hasSwordHeartPassive"
>;

export const getEnemyElementalModifier = (
  attackerElement: ElementType,
  enemy: Enemy
): { multiplier: number; reason?: "resistance" | "weakness" } => {
  if (attackerElement === ElementType.None) {
    return { multiplier: 1 };
  }
  if (enemy.weaknesses?.includes(attackerElement)) {
    return { multiplier: 1.18, reason: "weakness" };
  }
  if (enemy.resistances?.includes(attackerElement)) {
    return { multiplier: 0.84, reason: "resistance" };
  }
  return { multiplier: 1 };
};

export const getRestriction = (
  attacker: ElementType,
  defender: ElementType
): { isEffective: boolean; isResisted: boolean } => {
  if (attacker === ElementType.None || defender === ElementType.None) {
    return { isEffective: false, isResisted: false };
  }

  if (attacker === ElementType.Metal && defender === ElementType.Wood) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Wood && defender === ElementType.Earth) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Earth && defender === ElementType.Water) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Water && defender === ElementType.Fire) {
    return { isEffective: true, isResisted: false };
  }
  if (attacker === ElementType.Fire && defender === ElementType.Metal) {
    return { isEffective: true, isResisted: false };
  }

  if (defender === ElementType.Metal && attacker === ElementType.Wood) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Wood && attacker === ElementType.Earth) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Earth && attacker === ElementType.Water) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Water && attacker === ElementType.Fire) {
    return { isEffective: false, isResisted: true };
  }
  if (defender === ElementType.Fire && attacker === ElementType.Metal) {
    return { isEffective: false, isResisted: true };
  }

  return { isEffective: false, isResisted: false };
};

const getHighestActiveSkill = (
  profession: ProfessionType,
  learnedSkills: Skill[]
): Skill | undefined =>
  learnedSkills.find(
    (skill) => skill.profession === profession && skill.type === "Active"
  );

const getInitialEnemySpecialReadyAtMs = (hasMageEmperorPassive: boolean) =>
  hasMageEmperorPassive ? 2000 : 0;

const getInitialPassiveStatuses = ({
  hasReflectPassive,
  hasInitialShieldPassive,
}: {
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
}) => {
  const statuses: CombatStatusLike[] = [];

  if (hasReflectPassive) {
    statuses.push({
      id: "thorn_reflect",
      name: "荊棘反震",
      kind: "reflect",
      value: 0.15,
      expiresAtMs: Number.MAX_SAFE_INTEGER,
    });
  }

  if (hasInitialShieldPassive) {
    statuses.push({
      id: "elemental_barrier",
      name: "元素護盾",
      kind: "shield",
      value: 1,
      expiresAtMs: Number.MAX_SAFE_INTEGER,
    });
  }

  return statuses;
};

const getInitialPassiveBattleLogMessages = ({
  hasReflectPassive,
  hasInitialShieldPassive,
  hasSwordGoldenPassive,
  hasSwordDeathWardPassive,
  hasSwordQiPassive,
  hasBodyQiPassive,
  hasBodyFoundationPassive,
  hasBodyRebirthPassive,
  hasSwordEchoPassive,
  hasBodySaintPassive,
  hasMageQiPassive,
  hasManaSpringPassive,
  hasMageFoundationPassive,
  hasMageSpiritSeveringPassive,
  hasBodyAncientPassive,
  hasSwordImmortalPassive,
  hasBodyImmortalPassive,
  hasMageVoidPassive,
  hasSwordEmperorPassive,
  hasBodyEmperorPassive,
  hasSwordHeartPassive,
  hasBodyFusionPassive,
  hasMageFusionPassive,
  hasSwordFusionPassive,
  hasBodyTribulationPassive,
  hasMageTribulationPassive,
  hasSwordMahayanaPassive,
  hasMageMahayanaPassive,
  hasMageImmortalPassive,
  hasMageEmperorPassive,
}: {
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
  hasSwordGoldenPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  hasSwordQiPassive: boolean;
  hasBodyQiPassive: boolean;
  hasBodyFoundationPassive: boolean;
  hasBodyRebirthPassive: boolean;
  hasSwordEchoPassive: boolean;
  hasBodySaintPassive: boolean;
  hasMageQiPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFoundationPassive: boolean;
  hasMageSpiritSeveringPassive: boolean;
  hasBodyAncientPassive: boolean;
  hasSwordImmortalPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasMageVoidPassive: boolean;
  hasSwordEmperorPassive: boolean;
  hasBodyEmperorPassive: boolean;
  hasSwordHeartPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasMageFusionPassive: boolean;
  hasSwordFusionPassive: boolean;
  hasBodyTribulationPassive: boolean;
  hasMageTribulationPassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageMahayanaPassive: boolean;
  hasMageImmortalPassive: boolean;
  hasMageEmperorPassive: boolean;
}) => {
  const messages: string[] = [];

  if (hasReflectPassive) {
    messages.push("【荊棘皮層】已覆上體表，只待近身來敵反震自傷。");
  }

  if (hasInitialShieldPassive) {
    messages.push("戰鬥開始時，你獲得了【元素護盾】。");
  }

  if (hasSwordGoldenPassive) {
    messages.push("【劍心通明】劍心澄澈待發，暴擊時將牽動流光劍影再次出鞘。");
  }

  if (hasSwordDeathWardPassive) {
    messages.push("【護體劍罡】劍罡已護住命門，一次致命來襲將被強行截斷。");
  }

  if (hasSwordEchoPassive) {
    messages.push("【劍意化形】劍意凝影待發，普攻將化作雙段追斬。");
  }

  if (hasSwordQiPassive) {
    messages.push("【劍脈初成】劍勢已然循環，暴擊將牽動破甲追擊。");
  }

  if (hasBodyQiPassive) {
    messages.push("【銅皮鐵骨】筋骨已提前繃緊，凡俗重擊將被層層卸去。");
  }

  if (hasBodyFoundationPassive) {
    messages.push("【蠻荒血脈】荒血已在體內鼓盪，負傷越深，血勢越兇。");
  }

  if (hasBodyRebirthPassive) {
    messages.push("【滴血重生】血氣已盤踞命宮，重傷時將自行回生續戰。");
  }

  if (hasSwordHeartPassive) {
    messages.push("【養劍術】劍勢已在心湖沉澱，敵招受阻時將持續蓄起更深殺機。");
  }

  if (hasBodySaintPassive) {
    messages.push("【肉身成聖】聖軀已穩，重擊將被大幅化去。");
  }

  if (hasMageQiPassive) {
    messages.push("【靈潮循環】靈潮已在經脈間往復，普攻空窗也會持續回潮。");
  }

  if (hasManaSpringPassive) {
    messages.push("【法力源泉】靈海滿溢時，術式威能將再向上拔高。");
  }

  if (hasMageFoundationPassive) {
    messages.push("【靈力湧動】靈元已在經脈間翻騰，施法時將順勢拔高術式威能。");
  }

  if (hasMageSpiritSeveringPassive) {
    messages.push("【道法自然】術式流轉圓融，萬法冷卻將提早歸位。");
  }

  if (hasMageFusionPassive) {
    messages.push("【五氣朝元】五氣已在丹府間周天輪轉，術式回補與免耗隨時可被喚醒。");
  }

  if (hasBodyAncientPassive) {
    messages.push("【荒古戰體】荒古血肉盤踞周身，負面侵蝕將被持續震散。");
  }

  if (hasBodyFusionPassive) {
    messages.push("【金剛法相】法相已在筋骨間待命，來襲重擊將被再次硬生生卸去。");
  }

  if (hasSwordImmortalPassive) {
    messages.push("【仙元護體】劍元護體已待命，將定時凝成一次絕對護盾。");
  }

  if (hasBodyImmortalPassive) {
    messages.push("【仙體無垢】仙血流轉無垢，灼毒與流血將被直接抹除。");
  }

  if (hasMageVoidPassive) {
    messages.push("【空間法則】虛空褶皺護住法身，部分來襲將被挪入虛空。");
  }

  if (hasSwordEmperorPassive) {
    messages.push("【萬法皆空】劍意已斷萬法因果，負面侵蝕將被直接抹去。");
  }

  if (hasBodyEmperorPassive) {
    messages.push("【不死不滅】霸體鎮住命門，最後一線生機尚未斷絕。");
  }

  if (hasMageImmortalPassive) {
    messages.push("【仙法通神】仙元灌注靈海，術式回響已待命啟動。");
  }

  if (hasMageEmperorPassive) {
    messages.push("【萬法歸宗】萬法歸一鎮住靈臺，敵方特招節奏將被持續遲滯。");
  }

  if (hasSwordFusionPassive) {
    messages.push("【人劍合神】劍魂已與識海相融，控制侵蝕將被強行縮短。");
  }

  if (hasBodyTribulationPassive) {
    messages.push("【萬劫不滅】劫火護體待發，每次承傷都將反煉肉身。");
  }

  if (hasMageTribulationPassive) {
    messages.push("【雷劫煉心】雷痕纏身護識，控制侵蝕將被天雷反煉。");
  }

  if (hasSwordMahayanaPassive) {
    messages.push("【劍道獨尊】劍勢已鎖定全場，敵勢越盛越助你凝出殺機。");
  }

  if (hasMageMahayanaPassive) {
    messages.push("【言出法隨】法言既出即成天條，主動術式威能已被抬升。");
  }

  return messages;
};

const resolveInitialPassiveStateBundle = (
  passiveFlags: Pick<
    PlayerPassiveFlags,
    | "hasReflectPassive"
    | "hasInitialShieldPassive"
    | "hasSwordGoldenPassive"
    | "hasSwordDeathWardPassive"
    | "hasSwordQiPassive"
    | "hasBodyQiPassive"
    | "hasBodyFoundationPassive"
    | "hasBodyRebirthPassive"
    | "hasSwordEchoPassive"
    | "hasBodySaintPassive"
    | "hasMageQiPassive"
    | "hasManaSpringPassive"
    | "hasMageFoundationPassive"
    | "hasMageSpiritSeveringPassive"
    | "hasBodyAncientPassive"
    | "hasSwordImmortalPassive"
    | "hasBodyImmortalPassive"
    | "hasMageVoidPassive"
    | "hasSwordEmperorPassive"
    | "hasBodyEmperorPassive"
    | "hasSwordHeartPassive"
    | "hasBodyFusionPassive"
    | "hasMageFusionPassive"
    | "hasSwordFusionPassive"
    | "hasBodyTribulationPassive"
    | "hasMageTribulationPassive"
    | "hasSwordMahayanaPassive"
    | "hasMageMahayanaPassive"
    | "hasMageImmortalPassive"
    | "hasMageEmperorPassive"
  >
) => ({
  initialPassiveStatuses: getInitialPassiveStatuses({
    hasReflectPassive: passiveFlags.hasReflectPassive,
    hasInitialShieldPassive: passiveFlags.hasInitialShieldPassive,
  }),
  openingMessages: getInitialPassiveBattleLogMessages({
    hasReflectPassive: passiveFlags.hasReflectPassive,
    hasInitialShieldPassive: passiveFlags.hasInitialShieldPassive,
    hasSwordGoldenPassive: passiveFlags.hasSwordGoldenPassive,
    hasSwordDeathWardPassive: passiveFlags.hasSwordDeathWardPassive,
    hasSwordQiPassive: passiveFlags.hasSwordQiPassive,
    hasBodyQiPassive: passiveFlags.hasBodyQiPassive,
    hasBodyFoundationPassive: passiveFlags.hasBodyFoundationPassive,
    hasBodyRebirthPassive: passiveFlags.hasBodyRebirthPassive,
    hasSwordEchoPassive: passiveFlags.hasSwordEchoPassive,
    hasBodySaintPassive: passiveFlags.hasBodySaintPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    hasManaSpringPassive: passiveFlags.hasManaSpringPassive,
    hasMageFoundationPassive: passiveFlags.hasMageFoundationPassive,
    hasMageSpiritSeveringPassive: passiveFlags.hasMageSpiritSeveringPassive,
    hasBodyAncientPassive: passiveFlags.hasBodyAncientPassive,
    hasSwordImmortalPassive: passiveFlags.hasSwordImmortalPassive,
    hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
    hasMageVoidPassive: passiveFlags.hasMageVoidPassive,
    hasSwordEmperorPassive: passiveFlags.hasSwordEmperorPassive,
    hasBodyEmperorPassive: passiveFlags.hasBodyEmperorPassive,
    hasSwordHeartPassive: passiveFlags.hasSwordHeartPassive,
    hasBodyFusionPassive: passiveFlags.hasBodyFusionPassive,
    hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
    hasSwordFusionPassive: passiveFlags.hasSwordFusionPassive,
    hasBodyTribulationPassive: passiveFlags.hasBodyTribulationPassive,
    hasMageTribulationPassive: passiveFlags.hasMageTribulationPassive,
    hasSwordMahayanaPassive: passiveFlags.hasSwordMahayanaPassive,
    hasMageMahayanaPassive: passiveFlags.hasMageMahayanaPassive,
    hasMageImmortalPassive: passiveFlags.hasMageImmortalPassive,
    hasMageEmperorPassive: passiveFlags.hasMageEmperorPassive,
  }),
  initialEnemySpecialReadyAtMs: getInitialEnemySpecialReadyAtMs(
    passiveFlags.hasMageEmperorPassive
  ),
});

const getCombatOpeningMessages = (options: {
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  restriction: { isEffective: boolean; isResisted: boolean };
  elementalAffinity: { multiplier: number; reason?: "resistance" | "weakness" };
  hasReflectPassive: boolean;
  hasInitialShieldPassive: boolean;
  hasSwordGoldenPassive: boolean;
  hasSwordDeathWardPassive: boolean;
  hasSwordQiPassive: boolean;
  hasBodyQiPassive: boolean;
  hasBodyFoundationPassive: boolean;
  hasBodyRebirthPassive: boolean;
  hasSwordEchoPassive: boolean;
  hasBodySaintPassive: boolean;
  hasMageQiPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFoundationPassive: boolean;
  hasMageSpiritSeveringPassive: boolean;
  hasBodyAncientPassive: boolean;
  hasSwordImmortalPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasMageVoidPassive: boolean;
  hasSwordEmperorPassive: boolean;
  hasBodyEmperorPassive: boolean;
  hasSwordHeartPassive: boolean;
  hasBodyFusionPassive: boolean;
  hasMageFusionPassive: boolean;
  hasSwordFusionPassive: boolean;
  hasBodyTribulationPassive: boolean;
  hasMageTribulationPassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageMahayanaPassive: boolean;
  hasMageImmortalPassive: boolean;
  hasMageEmperorPassive: boolean;
}) => {
  const {
    player,
    enemy,
    restriction,
    elementalAffinity,
    hasReflectPassive,
    hasInitialShieldPassive,
    hasSwordGoldenPassive,
    hasSwordDeathWardPassive,
    hasSwordQiPassive,
    hasBodyQiPassive,
    hasBodyFoundationPassive,
    hasBodyRebirthPassive,
    hasSwordEchoPassive,
    hasBodySaintPassive,
    hasMageQiPassive,
    hasManaSpringPassive,
    hasMageFoundationPassive,
    hasMageSpiritSeveringPassive,
    hasBodyAncientPassive,
    hasSwordImmortalPassive,
    hasBodyImmortalPassive,
    hasMageVoidPassive,
    hasSwordEmperorPassive,
    hasBodyEmperorPassive,
    hasSwordHeartPassive,
    hasBodyFusionPassive,
    hasMageFusionPassive,
    hasSwordFusionPassive,
    hasBodyTribulationPassive,
    hasMageTribulationPassive,
    hasSwordMahayanaPassive,
    hasMageMahayanaPassive,
    hasMageImmortalPassive,
    hasMageEmperorPassive,
  } = options;
  const messages: string[] = [];

  if (player.element !== ElementType.None && enemy.element !== ElementType.None) {
    if (restriction.isEffective) {
      messages.push(
        `屬性克制：你的【${ELEMENT_NAMES[player.element]}】克制了敵方的【${ELEMENT_NAMES[enemy.element]}】！攻擊更易穿透對方護體。`
      );
    }
    if (restriction.isResisted) {
      messages.push(
        `屬性受制：你的【${ELEMENT_NAMES[player.element]}】受到敵方【${ELEMENT_NAMES[enemy.element]}】壓制，輸出略有削弱。`
      );
    }
    if (elementalAffinity.reason === "weakness") {
      messages.push(
        `弱點洞察：敵方對【${ELEMENT_NAMES[player.element]}】存在明顯弱點，造成的直接傷害將額外提升。`
      );
    } else if (elementalAffinity.reason === "resistance") {
      messages.push(
        `元素抗性：敵方對【${ELEMENT_NAMES[player.element]}】具備抗性，造成的直接傷害會被部分削減。`
      );
    }
  }

  messages.push(
    ...getInitialPassiveBattleLogMessages({
      hasReflectPassive,
      hasInitialShieldPassive,
      hasSwordGoldenPassive,
      hasSwordDeathWardPassive,
      hasSwordQiPassive,
      hasBodyQiPassive,
      hasBodyFoundationPassive,
      hasBodyRebirthPassive,
      hasSwordEchoPassive,
      hasBodySaintPassive,
      hasMageQiPassive,
      hasManaSpringPassive,
      hasMageFoundationPassive,
      hasMageSpiritSeveringPassive,
      hasBodyAncientPassive,
      hasSwordImmortalPassive,
      hasBodyImmortalPassive,
      hasMageVoidPassive,
      hasSwordEmperorPassive,
      hasBodyEmperorPassive,
      hasSwordHeartPassive,
      hasBodyFusionPassive,
      hasMageFusionPassive,
      hasMageImmortalPassive,
      hasMageEmperorPassive,
      hasSwordFusionPassive,
      hasBodyTribulationPassive,
      hasMageTribulationPassive,
      hasSwordMahayanaPassive,
      hasMageMahayanaPassive,
    })
  );

  return messages;
};

const initializeCombatEncounter = ({
  player,
  enemy,
  logs,
  passiveFlags,
  restriction,
  elementalAffinity,
  playerHp,
  enemyHp,
}: {
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  restriction: { isEffective: boolean; isResisted: boolean };
  elementalAffinity: { multiplier: number; reason?: "resistance" | "weakness" };
  playerHp: number;
  enemyHp: number;
}) => {
  const {
    initialPassiveStatuses,
    openingMessages,
    initialEnemySpecialReadyAtMs,
  } = resolveInitialPassiveStateBundle(passiveFlags);

  getCombatOpeningMessages({
    player,
    enemy,
    restriction,
    elementalAffinity,
    hasReflectPassive: passiveFlags.hasReflectPassive,
    hasInitialShieldPassive: passiveFlags.hasInitialShieldPassive,
    hasSwordGoldenPassive: passiveFlags.hasSwordGoldenPassive,
    hasSwordDeathWardPassive: passiveFlags.hasSwordDeathWardPassive,
    hasSwordQiPassive: passiveFlags.hasSwordQiPassive,
    hasBodyQiPassive: passiveFlags.hasBodyQiPassive,
    hasBodyFoundationPassive: passiveFlags.hasBodyFoundationPassive,
    hasBodyRebirthPassive: passiveFlags.hasBodyRebirthPassive,
    hasSwordEchoPassive: passiveFlags.hasSwordEchoPassive,
    hasBodySaintPassive: passiveFlags.hasBodySaintPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    hasManaSpringPassive: passiveFlags.hasManaSpringPassive,
    hasMageFoundationPassive: passiveFlags.hasMageFoundationPassive,
    hasMageSpiritSeveringPassive: passiveFlags.hasMageSpiritSeveringPassive,
    hasBodyAncientPassive: passiveFlags.hasBodyAncientPassive,
    hasSwordImmortalPassive: passiveFlags.hasSwordImmortalPassive,
    hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
    hasMageVoidPassive: passiveFlags.hasMageVoidPassive,
    hasSwordEmperorPassive: passiveFlags.hasSwordEmperorPassive,
    hasBodyEmperorPassive: passiveFlags.hasBodyEmperorPassive,
    hasSwordHeartPassive: passiveFlags.hasSwordHeartPassive,
    hasBodyFusionPassive: passiveFlags.hasBodyFusionPassive,
    hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
    hasSwordFusionPassive: passiveFlags.hasSwordFusionPassive,
    hasBodyTribulationPassive: passiveFlags.hasBodyTribulationPassive,
    hasMageTribulationPassive: passiveFlags.hasMageTribulationPassive,
    hasSwordMahayanaPassive: passiveFlags.hasSwordMahayanaPassive,
    hasMageMahayanaPassive: passiveFlags.hasMageMahayanaPassive,
    hasMageImmortalPassive: passiveFlags.hasMageImmortalPassive,
    hasMageEmperorPassive: passiveFlags.hasMageEmperorPassive,
  })
    .concat(openingMessages)
    .forEach((message) => {
      pushCombatLog(logs, {
        turn: 0,
        timeMs: 0,
        isPlayer: true,
        message,
        damage: 0,
        playerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    });

  return {
    initialPassiveStatuses,
    initialEnemySpecialReadyAtMs,
  };
};

export const rollBossBreakOpportunity = ({
  enemy,
  restriction,
  bossBroken,
  currentTimeMs,
  turn,
  logs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  enemy: Enemy;
  restriction: { isEffective: boolean; isResisted: boolean };
  bossBroken: boolean;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (
    enemy.rank !== EnemyRank.Boss ||
    !restriction.isEffective ||
    bossBroken ||
    Math.random() >= 0.12
  ) {
    return bossBroken;
  }

  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    message: `【破綻】你抓住了 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 的氣機破綻，下一擊傷害大幅提升！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  return true;
};

const getPassiveRegenMessages = (options: {
  healAmount: number;
  manaAmount: number;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
}) => {
  const {
    healAmount,
    manaAmount,
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
  } = options;

  return {
    healMessage:
      healAmount > 0
        ? hasBodyRebirthPassive
          ? `【滴血重生】血肉自衍，你回復了 ${healAmount} 點氣血。`
          : hasMageFusionPassive
            ? `【五氣朝元】五氣回流護住周身，你回復了 ${healAmount} 點氣血。`
            : `氣血流轉，你回復了 ${healAmount} 點氣血。`
        : "",
    manaMessage:
      manaAmount > 0
        ? hasManaSpringPassive
          ? `【法力源泉】靈海回湧，你回復了 ${manaAmount} 點靈力。`
          : hasMageFusionPassive
            ? `【五氣朝元】五氣朝元不息，你回復了 ${manaAmount} 點靈力。`
            : `法力源泉湧動，你回復了 ${manaAmount} 點靈力。`
        : "",
  };
};

export const applyPassiveRegenAndCleanse = ({
  player,
  logs,
  turn,
  timeMs,
  playerHp,
  playerMp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  lastRegenTimeMs,
  hasBodyRebirthPassive,
  hasManaSpringPassive,
  hasMageFusionPassive,
  hasBodyImmortalPassive,
  hasBodyAncientPassive,
}: {
  player: PlayerCombatStatsLike;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatusLike[];
  lastRegenTimeMs: number;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyAncientPassive: boolean;
}) => {
  if (
    !(player.regenHp > 0 || hasBodyRebirthPassive || hasManaSpringPassive || hasMageFusionPassive) ||
    (playerHp >= player.maxHp && playerMp >= player.maxMp)
  ) {
    return { playerHp, playerMp, playerStatuses, lastRegenTimeMs };
  }

  const regenIntervals = Math.floor((timeMs - lastRegenTimeMs) / 1000);
  if (regenIntervals <= 0) {
    return { playerHp, playerMp, playerStatuses, lastRegenTimeMs };
  }

  let nextPlayerHp = playerHp;
  let nextPlayerMp = playerMp;
  const nextPlayerStatuses = playerStatuses;
  let healPerSecond = Math.floor(player.maxHp * (player.regenHp / 100));

  if (hasBodyRebirthPassive) {
    const missingHp = Math.max(0, player.maxHp - nextPlayerHp);
    healPerSecond +=
      Math.floor(player.maxHp * 0.02) + Math.floor(missingHp * 0.05);
  }

  if (hasMageFusionPassive) {
    healPerSecond += Math.floor(player.maxHp * 0.05);
  }

  const healAmount = Math.floor(
    healPerSecond * regenIntervals * (hasBodyImmortalPassive ? 1.5 : 1)
  );
  if (healAmount > 0) {
    nextPlayerHp = Math.min(player.maxHp, nextPlayerHp + healAmount);
    const { healMessage } = getPassiveRegenMessages({
      healAmount,
      manaAmount: 0,
      hasBodyRebirthPassive,
      hasManaSpringPassive,
      hasMageFusionPassive,
    });
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: healMessage,
      damage: -healAmount,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if ((hasManaSpringPassive || hasMageFusionPassive) && nextPlayerMp < player.maxMp) {
    const manaPerSecond =
      (hasManaSpringPassive ? Math.floor(player.maxMp * 0.1) : 0) +
      (hasMageFusionPassive ? Math.floor(player.maxMp * 0.05) : 0);
    const manaAmount = manaPerSecond * regenIntervals;
    if (manaAmount > 0) {
      nextPlayerMp = Math.min(player.maxMp, nextPlayerMp + manaAmount);
      const { manaMessage } = getPassiveRegenMessages({
        healAmount: 0,
        manaAmount,
        hasBodyRebirthPassive,
        hasManaSpringPassive,
        hasMageFusionPassive,
      });
      pushCombatLog(logs, {
        turn,
        timeMs,
        isPlayer: true,
        message: manaMessage,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp,
      });
    }
  }

  if (hasBodyAncientPassive) {
    const removableIndex = nextPlayerStatuses.findIndex(
      (status) => status.expiresAtMs > timeMs && isNegativeStatusKind(status.kind)
    );
    if (removableIndex >= 0) {
      const [removedStatus] = nextPlayerStatuses.splice(removableIndex, 1);
      pushCombatLog(logs, {
        turn,
        timeMs,
        isPlayer: true,
        message: `【荒古戰體】震散了【${removedStatus.name}】。`,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp,
      });
    }
  }

  return {
    playerHp: nextPlayerHp,
    playerMp: nextPlayerMp,
    playerStatuses: nextPlayerStatuses,
    lastRegenTimeMs: lastRegenTimeMs + regenIntervals * 1000,
  };
};

export const applyPeriodicPassiveStatuses = ({
  logs,
  turn,
  timeMs,
  player,
  playerHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  hasSwordImmortalPassive,
  nextSwordImmortalGuardAtMs,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  player: Pick<PlayerCombatStatsLike, "maxHp">;
  playerHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatusLike[];
  hasSwordImmortalPassive: boolean;
  nextSwordImmortalGuardAtMs: number;
}) => {
  let nextGuardAtMs = nextSwordImmortalGuardAtMs;
  if (hasSwordImmortalPassive && timeMs >= nextGuardAtMs) {
    playerStatuses.push({
      id: "immortal_sword_guard",
      name: "仙元護體",
      kind: "shield",
      value: 999999,
      expiresAtMs: timeMs + 1000,
    });
    nextGuardAtMs += 5000;
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: `【仙元護體】再次凝成，可抵擋一次任意傷害。`,
      damage: 0,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return { playerStatuses, nextSwordImmortalGuardAtMs: nextGuardAtMs };
};

export const resolveEnemyIncapacitatedTurn = ({
  currentTimeMs,
  enemy,
  enemyAttackIntervalMs,
  hasSwordHeartPassive,
  playerDamagedSinceSwordHeartWindow,
  swordHeartStacks,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  currentTimeMs: number;
  enemy: Enemy;
  enemyAttackIntervalMs: number;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: false,
    message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被控制中，無法出手！`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  if (hasSwordHeartPassive && !playerDamagedSinceSwordHeartWindow) {
    swordHeartStacks = Math.min(8, swordHeartStacks + 1);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message:
        swordHeartStacks >= 8
          ? "【養劍術】劍勢已滿，當前回合的停滯不再繼續積蓄殺機。"
          : `【養劍術】敵勢受阻，劍勢提升至第 ${swordHeartStacks} 層。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return {
    enemyNextActionMs: currentTimeMs + enemyAttackIntervalMs,
    swordHeartStacks,
    playerDamagedSinceSwordHeartWindow: false,
  };
};

const getEnemySpecialDelayFromStatuses = (
  statuses: CombatStatusLike[],
  currentTimeMs: number
) =>
  statuses.some(
    (status) => status.id === "spirit_sever" && status.expiresAtMs > currentTimeMs
  )
    ? 1000
    : 0;

export const applyEnemySpecialTimingDelay = ({
  logs,
  turn,
  timeMs,
  enemy,
  enemyStatuses,
  enemySpecialReadyAtMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  enemyStatuses: CombatStatusLike[];
  enemySpecialReadyAtMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  const enemySpecialDelayMs = getEnemySpecialDelayFromStatuses(
    enemyStatuses,
    timeMs
  );
  if (
    !enemy.specialAttack ||
    timeMs < enemySpecialReadyAtMs ||
    enemySpecialDelayMs <= 0
  ) {
    return enemySpecialReadyAtMs;
  }

  const delayedReadyAtMs = timeMs + enemySpecialDelayMs;
  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: `【絕仙劍】斬斷敵方靈機流轉，將其術式節奏再壓後 ${(enemySpecialDelayMs / 1000).toFixed(0)} 秒。`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  return delayedReadyAtMs;
};

export const resolveTurnStartMaintenance = ({
  currentTimeMs,
  turn,
  processStatusTicks,
  player,
  enemy,
  logs,
  getPlayerHp,
  getPlayerMp,
  setPlayerHp,
  setPlayerMp,
  getEnemyHp,
  getPlayerStatuses,
  setPlayerStatuses,
  getLastRegenTimeMs,
  setLastRegenTimeMs,
  hasBodyRebirthPassive,
  hasManaSpringPassive,
  hasMageFusionPassive,
  hasBodyImmortalPassive,
  hasBodyAncientPassive,
}: {
  currentTimeMs: number;
  turn: number;
  processStatusTicks: (currentMs: number) => void;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  getPlayerHp: () => number;
  getPlayerMp: () => number;
  setPlayerHp: (value: number) => void;
  setPlayerMp: (value: number) => void;
  getEnemyHp: () => number;
  getPlayerStatuses: () => CombatStatusLike[];
  setPlayerStatuses: (value: CombatStatusLike[]) => void;
  getLastRegenTimeMs: () => number;
  setLastRegenTimeMs: (value: number) => void;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyAncientPassive: boolean;
}) => {
  processStatusTicks(currentTimeMs);
  if (getPlayerHp() <= 0 || getEnemyHp() <= 0) {
    return { combatEnded: true };
  }

  const upkeepResult = applyPassiveRegenAndCleanse({
    player,
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp: getPlayerHp(),
    playerMp: getPlayerMp(),
    enemyHp: getEnemyHp(),
    enemyMaxHp: enemy.maxHp,
    playerStatuses: getPlayerStatuses(),
    lastRegenTimeMs: getLastRegenTimeMs(),
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
    hasBodyImmortalPassive,
    hasBodyAncientPassive,
  });

  setPlayerHp(upkeepResult.playerHp);
  setPlayerMp(upkeepResult.playerMp);
  setPlayerStatuses(upkeepResult.playerStatuses);
  setLastRegenTimeMs(upkeepResult.lastRegenTimeMs);

  return { combatEnded: false };
};

const seedCombatEncounter = ({
  player,
  enemy,
  logs,
  passiveFlags,
  restriction,
  elementalAffinity,
  playerHp,
  enemyHp,
  playerStatuses,
}: {
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  restriction: { isEffective: boolean; isResisted: boolean };
  elementalAffinity: ReturnType<typeof getEnemyElementalModifier>;
  playerHp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
}) => {
  const { initialPassiveStatuses, initialEnemySpecialReadyAtMs } =
    initializeCombatEncounter({
      player,
      enemy,
      logs,
      passiveFlags,
      restriction,
      elementalAffinity,
      playerHp,
      enemyHp,
    });

  return {
    playerStatuses:
      initialPassiveStatuses.length > 0
        ? [...playerStatuses, ...initialPassiveStatuses]
        : playerStatuses,
    enemySpecialReadyAtMs: initialEnemySpecialReadyAtMs,
  };
};

const createCombatInfrastructure = ({
  player,
  enemy,
  logs,
  passiveFlags,
  activeSkill,
  learnedSkills,
  getTurn,
  playerStatusesRef,
  enemyStatusesRef,
  activeSkillReadyAtMsRef,
  getPlayerHp,
  getEnemyHp,
  setPlayerHp,
  setEnemyHp,
  setPlayerStatuses,
  setEnemyStatuses,
  getLastStatusTickMs,
  setLastStatusTickMs,
  getPlayerDamagedSinceSwordHeartWindow,
  setPlayerDamagedSinceSwordHeartWindow,
}: {
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  activeSkill?: Skill;
  learnedSkills: Skill[];
  getTurn: () => number;
  playerStatusesRef: () => CombatStatusLike[];
  enemyStatusesRef: () => CombatStatusLike[];
  activeSkillReadyAtMsRef: () => number;
  getPlayerHp: () => number;
  getEnemyHp: () => number;
  setPlayerHp: (value: number) => void;
  setEnemyHp: (value: number) => void;
  setPlayerStatuses: (value: CombatStatusLike[]) => void;
  setEnemyStatuses: (value: CombatStatusLike[]) => void;
  getLastStatusTickMs: () => number;
  setLastStatusTickMs: (value: number) => void;
  getPlayerDamagedSinceSwordHeartWindow: () => boolean;
  setPlayerDamagedSinceSwordHeartWindow: (value: boolean) => void;
}) => {
  setCombatLogSnapshotProvider(
    createCombatSnapshotProvider({
      activeSkill,
      playerStatusesRef,
      enemyStatusesRef,
      activeSkillReadyAtMsRef,
      learnedSkills,
      resolveSkillCooldownSeconds: getResolvedSkillCooldownSeconds,
    })
  );

  const processStatusTicks = createStatusTickProcessor({
    getTurn,
    logs,
    player,
    enemy,
    passiveFlags,
    getPlayerHp,
    getEnemyHp,
    setPlayerHp,
    setEnemyHp,
    getPlayerStatuses: playerStatusesRef,
    setPlayerStatuses,
    getEnemyStatuses: enemyStatusesRef,
    setEnemyStatuses,
    getLastStatusTickMs,
    setLastStatusTickMs,
    getPlayerDamagedSinceSwordHeartWindow,
    setPlayerDamagedSinceSwordHeartWindow,
  });

  return {
    processStatusTicks,
  };
};

export const prepareCombatLoopEnvironment = ({
  player,
  enemy,
  logs,
  runtimeContext,
  getTurn,
  playerStatusesRef,
  enemyStatusesRef,
  activeSkillReadyAtMsRef,
  getPlayerHp,
  getEnemyHp,
  setPlayerHp,
  setEnemyHp,
  setPlayerStatuses,
  setEnemyStatuses,
  getLastStatusTickMs,
  setLastStatusTickMs,
  getPlayerDamagedSinceSwordHeartWindow,
  setPlayerDamagedSinceSwordHeartWindow,
  playerHp,
  enemyHp,
  playerStatuses,
}: {
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  runtimeContext: CombatRuntimeContext;
  getTurn: () => number;
  playerStatusesRef: () => CombatStatusLike[];
  enemyStatusesRef: () => CombatStatusLike[];
  activeSkillReadyAtMsRef: () => number;
  getPlayerHp: () => number;
  getEnemyHp: () => number;
  setPlayerHp: (value: number) => void;
  setEnemyHp: (value: number) => void;
  setPlayerStatuses: (value: CombatStatusLike[]) => void;
  setEnemyStatuses: (value: CombatStatusLike[]) => void;
  getLastStatusTickMs: () => number;
  setLastStatusTickMs: (value: number) => void;
  getPlayerDamagedSinceSwordHeartWindow: () => boolean;
  setPlayerDamagedSinceSwordHeartWindow: (value: boolean) => void;
  playerHp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
}) => {
  const { activeSkill, passiveFlags, pVsE, enemyElementalAffinity } = runtimeContext;
  const { processStatusTicks } = createCombatInfrastructure({
    player,
    enemy,
    logs,
    passiveFlags,
    activeSkill,
    learnedSkills: player.learnedSkills,
    getTurn,
    playerStatusesRef,
    enemyStatusesRef,
    activeSkillReadyAtMsRef,
    getPlayerHp,
    getEnemyHp,
    setPlayerHp,
    setEnemyHp,
    setPlayerStatuses,
    setEnemyStatuses,
    getLastStatusTickMs,
    setLastStatusTickMs,
    getPlayerDamagedSinceSwordHeartWindow,
    setPlayerDamagedSinceSwordHeartWindow,
  });

  const seededEncounter = seedCombatEncounter({
    player,
    enemy,
    logs,
    passiveFlags,
    restriction: pVsE,
    elementalAffinity: enemyElementalAffinity,
    playerHp,
    enemyHp,
    playerStatuses,
  });

  return {
    processStatusTicks,
    ...seededEncounter,
  };
};

export const createCombatRuntimeContext = (
  player: PlayerCombatStatsLike,
  enemy: Enemy
): CombatRuntimeContext => {
  const activeSkill = getHighestActiveSkill(player.profession, player.learnedSkills);
  return {
    activeSkill: activeSkill ?? undefined,
    playerAttackIntervalMs: getPlayerAttackIntervalMs(player),
    enemyAttackIntervalMs: getEnemyAttackIntervalMs(enemy),
    pVsE: getRestriction(player.element, enemy.element),
    enemyElementalAffinity: getEnemyElementalModifier(player.element, enemy),
    passiveFlags: getPlayerPassiveFlags(player.learnedSkills),
  };
};

export const createCombatLoopFeatureFlags = (
  passiveFlags: PlayerPassiveFlags
): CombatLoopFeatureFlags => ({
  hasBodyRebirthPassive: passiveFlags.hasBodyRebirthPassive,
  hasManaSpringPassive: passiveFlags.hasManaSpringPassive,
  hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
  hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
  hasBodyAncientPassive: passiveFlags.hasBodyAncientPassive,
  hasSwordImmortalPassive: passiveFlags.hasSwordImmortalPassive,
  hasSwordHeartPassive: passiveFlags.hasSwordHeartPassive,
});
