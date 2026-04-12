
import { MajorRealm, ElementType, Enemy, EnemyRank, MinorRealmType } from '../../types';

const getCounterElement = (element: ElementType): ElementType | undefined => {
  switch (element) {
    case ElementType.Fire:
      return ElementType.Water;
    case ElementType.Water:
      return ElementType.Earth;
    case ElementType.Earth:
      return ElementType.Wood;
    case ElementType.Wood:
      return ElementType.Metal;
    case ElementType.Metal:
      return ElementType.Fire;
    default:
      return undefined;
  }
};

const getDefaultEnemyAiStyle = (
  rank: EnemyRank,
  element: ElementType
): Enemy["aiStyle"] => {
  if (element === ElementType.Fire || element === ElementType.Water || element === ElementType.Wood) {
    return rank === EnemyRank.Common ? "ranged" : "caster";
  }
  return "melee";
};

const getDefaultEnemyAttackRange = (
  rank: EnemyRank,
  element: ElementType
) => {
  if (element === ElementType.Fire || element === ElementType.Water || element === ElementType.Wood) {
    return rank === EnemyRank.Common ? 3 : rank === EnemyRank.Elite ? 4 : 5;
  }
  return rank === EnemyRank.Boss ? 2 : 1;
};

const getDefaultEnemyStatus = (element: ElementType) => {
  switch (element) {
    case ElementType.Fire:
      return { id: "burn", duration: 2, chance: 0.35, value: 0.02 };
    case ElementType.Water:
      return { id: "freeze", duration: 1, chance: 0.25 };
    case ElementType.Wood:
      return { id: "poison", duration: 2, chance: 0.3, value: 0.018 };
    case ElementType.Earth:
      return { id: "armorBreak", duration: 2, chance: 0.3, value: 0.12 };
    case ElementType.Metal:
      return { id: "bleed", duration: 2, chance: 0.32, value: 0.015 };
    default:
      return undefined;
  }
};

const getDefaultEnemySpecialAttack = (
  name: string,
  rank: EnemyRank,
  realm: MajorRealm,
  element: ElementType
): Enemy["specialAttack"] | undefined => {
  if (rank === EnemyRank.Common) return undefined;

  const statusEffect = getDefaultEnemyStatus(element);
  const isCaster = element === ElementType.Fire || element === ElementType.Water || element === ElementType.Wood;
  const isBoss = rank === EnemyRank.Boss;
  const cooldownSeconds = isBoss ? 8 + Math.min(3, Math.floor(realm / 4)) : 7 + Math.min(2, Math.floor(realm / 5));
  const damageMultiplier = isBoss ? 1.42 + realm * 0.025 : 1.16 + realm * 0.018;
  const areaShape = isCaster
    ? (isBoss ? "circle" : "cone")
    : (element === ElementType.Earth ? "cone" : "line");
  const areaRadius = isBoss ? Math.max(2, 2 + Math.floor(realm / 3)) : Math.max(1, 1 + Math.floor(realm / 4));
  const maxTargets = isBoss ? Math.min(5, 3 + Math.floor(realm / 4)) : Math.min(4, 2 + Math.floor(realm / 5));

  return {
    name: `${name}式殺招`,
    cooldownSeconds,
    damageMultiplier,
    statusEffect,
    areaShape,
    areaRadius,
    maxTargets,
    castRange: isCaster ? getDefaultEnemyAttackRange(rank, element) + 1 : undefined,
    castTimeMs: isCaster ? 480 + realm * 10 : 260 + realm * 8,
    projectileSpeed: isCaster ? 10 + Math.min(6, realm) : undefined,
  };
};

export const createEnemy = (
    id: string, name: string, realm: MajorRealm, rank: EnemyRank, 
    hp: number, atk: number, def: number, ele: ElementType, 
    drops: string[], exp: number, minorRealm?: MinorRealmType,
    symbol: string = '?',
    extras: Partial<Enemy> = {}
): Enemy => {
    const defaultAiStyle = extras.aiStyle ?? getDefaultEnemyAiStyle(rank, ele);
    const defaultAttackRange = extras.attackRange ?? getDefaultEnemyAttackRange(rank, ele);
    const defaultSpecialAttack = extras.specialAttack ?? getDefaultEnemySpecialAttack(name, rank, realm, ele);

    return {
        id,
        name,
        realm,
        minorRealm,
        symbol,
        rank,
        hp,
        maxHp: hp,
        attack: atk,
        defense: def,
        element: ele,
        resistances: extras.resistances ?? [ele].filter((value) => value !== ElementType.None),
        weaknesses: extras.weaknesses ?? [getCounterElement(ele)].filter((value): value is ElementType => value !== undefined),
        affixes:
          extras.affixes ??
          (rank === EnemyRank.Boss && realm >= MajorRealm.SpiritSevering
            ? ["霸體", "統御"]
            : rank === EnemyRank.Elite && realm >= MajorRealm.NascentSoul
              ? ["強襲"]
              : []),
        drops,
        exp,
        aiStyle: defaultAiStyle,
        attackRange: defaultAttackRange,
        specialAttack: defaultSpecialAttack,
        ...extras,
    };
};
