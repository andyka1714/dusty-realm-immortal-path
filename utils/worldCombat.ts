import { ActiveMonster, Coordinate, Enemy, EnemyRank, ProfessionType, Skill } from "../types";

export type WorldCombatEnemyRoleId =
  | "melee-pressure"
  | "ranged-skirmisher"
  | "caster-channeler"
  | "boss-hazard";

export interface WorldCombatEnemyRoleProfile {
  id: WorldCombatEnemyRoleId;
  label: string;
  summary: string;
  detail: string;
  accentColor: number;
}

export const getGridDistance = (
  from: { x: number; y: number },
  to: { x: number; y: number }
) => Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

export const getPlayerEngagementRange = (profession: ProfessionType) => {
  switch (profession) {
    case ProfessionType.Mage:
      return 3;
    case ProfessionType.Sword:
    case ProfessionType.Body:
    default:
      return 1;
  }
};

export const getEnemyEngagementRange = (enemy: Enemy) => {
  if (enemy.attackRange !== undefined) {
    return enemy.attackRange;
  }

  switch (enemy.rank) {
    case EnemyRank.Boss:
      return 2;
    case EnemyRank.Elite:
      return 1;
    default:
      return 1;
  }
};

export const getEnemyAggroRange = (enemy: Enemy) => {
  const baseRange = getEnemyEngagementRange(enemy);

  switch (enemy.rank) {
    case EnemyRank.Boss:
      return Math.max(10, baseRange + 6);
    case EnemyRank.Elite:
      return Math.max(6, baseRange + 4);
    default:
      return Math.max(3, baseRange + 2);
  }
};

export const getEnemyPreferredDistance = (enemy: Enemy) => {
  if (enemy.aiStyle === "caster") {
    return Math.max(3, (enemy.attackRange ?? 1) + 2);
  }

  if (enemy.aiStyle === "ranged") {
    return Math.max(2, (enemy.attackRange ?? 1) + 1);
  }

  return 1;
};

export const getEnemyCombatRoleProfile = (
  enemy: Enemy
): WorldCombatEnemyRoleProfile => {
  if (enemy.rank === EnemyRank.Boss) {
    return {
      id: "boss-hazard",
      label: "Boss 危險節奏",
      summary: enemy.specialAttack ? "特招與危險區壓迫" : "高壓近戰壓迫",
      detail: enemy.specialAttack
        ? "會以蓄力與落點危險區改變站位節奏"
        : "會持續維持高壓接戰距離",
      accentColor: 0xfb7185,
    };
  }

  if (enemy.aiStyle === "caster") {
    return {
      id: "caster-channeler",
      label: "蓄力施法",
      summary: "拉距蓄力",
      detail: "傾向維持施法距離，並在特招前提供更長前搖",
      accentColor: 0x60a5fa,
    };
  }

  if (enemy.aiStyle === "ranged") {
    return {
      id: "ranged-skirmisher",
      label: "游擊射手",
      summary: "風箏射擊",
      detail: "傾向維持火線，距離過近時會優先後撤拉距",
      accentColor: 0xf59e0b,
    };
  }

  return {
    id: "melee-pressure",
    label: "近戰壓迫",
    summary: "貼身突進",
    detail: "會持續縮短距離並把壓力集中在近身危險區",
    accentColor: 0xef4444,
  };
};

export const shouldEnemyHoldPreferredRange = (
  enemy: Enemy,
  distance: number
) => {
  if (enemy.aiStyle !== "caster" && enemy.aiStyle !== "ranged") return false;

  const engagementRange = getEnemyEngagementRange(enemy);
  const preferredDistance = getEnemyPreferredDistance(enemy);

  return distance > engagementRange && distance <= preferredDistance;
};

export const shouldEnemyRetreatFromCloseRange = (
  enemy: Enemy,
  distance: number
) => {
  if (enemy.aiStyle !== "caster" && enemy.aiStyle !== "ranged") return false;

  return distance < getEnemyEngagementRange(enemy);
};

export const shouldEnemyStrafeNearRange = (enemy: Enemy, distance: number) => {
  if (enemy.aiStyle !== "caster" && enemy.aiStyle !== "ranged") return false;

  return (
    distance > getEnemyEngagementRange(enemy) &&
    distance <= getEnemyPreferredDistance(enemy) + 1
  );
};

const getEuclideanDistance = (from: Coordinate, to: Coordinate) =>
  Math.hypot(to.x - from.x, to.y - from.y);

const getProjectedDistanceToLine = (
  origin: Coordinate,
  target: Coordinate,
  point: Coordinate
) => {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const lineLength = Math.hypot(dx, dy);
  if (lineLength === 0) return { forwardDistance: 0, lateralDistance: 0 };

  const ux = dx / lineLength;
  const uy = dy / lineLength;
  const px = point.x - origin.x;
  const py = point.y - origin.y;
  const projection = px * ux + py * uy;
  const lateralX = px - projection * ux;
  const lateralY = py - projection * uy;

  return {
    forwardDistance: projection,
    lateralDistance: Math.hypot(lateralX, lateralY),
  };
};

export const getWorldSkillAreaTargets = ({
  origin,
  primaryTarget,
  monsters,
  primaryTargetId,
  areaShape,
  areaRadius,
  maxTargets,
}: {
  origin: Coordinate;
  primaryTarget: Coordinate;
  monsters: ActiveMonster[];
  primaryTargetId: string;
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
  maxTargets?: number;
}) => {
  const primary = monsters.find((monster) => monster.instanceId === primaryTargetId);
  if (!primary) return [];

  const shape = areaShape ?? "single";
  const resolvedRadius = Math.max(0, areaRadius ?? 0);
  const resolvedMaxTargets = Math.max(1, maxTargets ?? 1);
  const directDistance = Math.max(1, getEuclideanDistance(origin, primaryTarget));
  const coneHalfAngle = Math.PI / 4;

  const hits = monsters.filter((monster) => {
    if (monster.instanceId === primaryTargetId) return true;
    if (shape === "single" || shape === "self") return false;

    const point = { x: monster.x, y: monster.y };
    if (shape === "circle") {
      return getEuclideanDistance(primaryTarget, point) <= Math.max(1, resolvedRadius);
    }

    const { forwardDistance, lateralDistance } = getProjectedDistanceToLine(
      origin,
      primaryTarget,
      point
    );

    if (shape === "line") {
      return (
        forwardDistance >= 0 &&
        forwardDistance <= directDistance + Math.max(1, resolvedRadius) * 2 &&
        lateralDistance <= Math.max(0.75, resolvedRadius)
      );
    }

    if (shape === "cone") {
      const distance = getEuclideanDistance(origin, point);
      if (distance === 0 || distance > directDistance + Math.max(1, resolvedRadius)) {
        return false;
      }
      const angle = Math.acos(
        Math.max(-1, Math.min(1, forwardDistance / Math.max(distance, 0.001)))
      );
      return forwardDistance >= 0 && angle <= coneHalfAngle;
    }

    return false;
  });

  return hits
    .sort((left, right) => {
      if (left.instanceId === primaryTargetId) return -1;
      if (right.instanceId === primaryTargetId) return 1;

      const leftDistance = getEuclideanDistance(primaryTarget, left);
      const rightDistance = getEuclideanDistance(primaryTarget, right);
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      return left.instanceId.localeCompare(right.instanceId);
    })
    .slice(0, resolvedMaxTargets);
};
