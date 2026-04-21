import { AppDispatch } from '../store/store';
import { addVisualEffect } from '../store/slices/adventureSlice';
import { ProfessionType } from '../types';
import { WorldStrikeVisualPlan } from './battleSystem';
import { getWorldProjectileTravelDurationMs } from './worldCombatPresentation';

type AdventureBattleVisualBridgeParams = {
  dispatch: AppDispatch;
};

export const createAdventureBattleVisualBridge = ({
  dispatch,
}: AdventureBattleVisualBridgeParams) => {
  const dispatchWorldStrikeProjectileEffect = ({
    color,
    colorInt,
    sourceX,
    sourceY,
    targetX,
    targetY,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    durationMs: number;
  }) => {
    dispatch(
      addVisualEffect({
        type: 'projectile',
        text: '',
        color,
        x: sourceX,
        y: sourceY,
        targetX,
        targetY,
        colorInt,
        durationMs,
      })
    );
  };

  const dispatchWorldStrikeAreaEffect = ({
    color,
    colorInt,
    targetX,
    targetY,
    radius,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    durationMs: number;
  }) => {
    dispatch(
      addVisualEffect({
        type: 'area',
        text: '',
        color,
        targetX,
        targetY,
        radius,
        colorInt,
        durationMs,
      })
    );
  };

  const dispatchWorldStrikeImpactEffect = ({
    color,
    colorInt,
    targetX,
    targetY,
    radius,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    durationMs: number;
  }) => {
    dispatch(
      addVisualEffect({
        type: 'impact',
        text: '',
        color,
        targetX,
        targetY,
        radius,
        colorInt,
        durationMs,
      })
    );
  };

  const dispatchWorldStrikeTextEffect = ({
    text,
    color,
    colorInt,
    x,
    y,
    durationMs = 1200,
  }: {
    text: string;
    color: string;
    colorInt: number;
    x: number;
    y: number;
    durationMs?: number;
  }) => {
    dispatch(
      addVisualEffect({
        type: 'text',
        text,
        color,
        x,
        y,
        colorInt,
        durationMs,
      })
    );
  };

  const dispatchWorldStrikeCastEffect = ({
    color,
    colorInt,
    targetX,
    targetY,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    durationMs: number;
  }) => {
    dispatch(
      addVisualEffect({
        type: 'cast',
        text: '',
        color,
        colorInt,
        targetX,
        targetY,
        radius: 0.7,
        durationMs,
      })
    );
  };

  const dispatchPlayerWorldStrikeCastEffect = ({
    profession,
    castTimeMs,
    executionTimeMs,
    isProjectile,
    sourceX,
    sourceY,
    targetX,
    targetY,
  }: {
    profession?: ProfessionType;
    castTimeMs?: number;
    executionTimeMs?: number;
    isProjectile?: boolean;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }) => {
    if ((!executionTimeMs && !castTimeMs) || !profession) {
      return;
    }

    dispatchWorldStrikeCastEffect({
      color: profession === ProfessionType.Mage ? '#60a5fa' : '#f59e0b',
      colorInt: profession === ProfessionType.Mage ? 0x60a5fa : 0xf59e0b,
      targetX: sourceX,
      targetY: sourceY,
      durationMs: Math.max(180, castTimeMs ?? 220),
    });

    if (!isProjectile) {
      return;
    }

    dispatchWorldStrikeProjectileEffect({
      color: profession === ProfessionType.Mage ? '#60a5fa' : '#f59e0b',
      colorInt: profession === ProfessionType.Mage ? 0x60a5fa : 0xf59e0b,
      sourceX,
      sourceY,
      targetX,
      targetY,
      durationMs: getWorldProjectileTravelDurationMs({
        source: { x: sourceX, y: sourceY },
        target: { x: targetX, y: targetY },
        executionTimeMs,
      }),
    });
  };

  const dispatchEnemyWorldStrikeCastEffect = ({
    hasSkillName,
    executionTimeMs,
    isProjectile,
    sourceX,
    sourceY,
    targetX,
    targetY,
    warningRadius,
    isBossThreat,
  }: {
    hasSkillName: boolean;
    executionTimeMs?: number;
    isProjectile?: boolean;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    warningRadius?: number;
    isBossThreat?: boolean;
  }) => {
    if (!hasSkillName) {
      return;
    }

    dispatchWorldStrikeCastEffect({
      color: '#f87171',
      colorInt: 0xf87171,
      targetX: sourceX,
      targetY: sourceY,
      durationMs: Math.max(220, Math.min(900, executionTimeMs ?? 220)),
    });

    if (isProjectile) {
      dispatchWorldStrikeProjectileEffect({
        color: '#f87171',
        colorInt: 0xf87171,
        sourceX,
        sourceY,
        targetX,
        targetY,
        durationMs: getWorldProjectileTravelDurationMs({
          source: { x: sourceX, y: sourceY },
          target: { x: targetX, y: targetY },
          executionTimeMs,
        }),
      });
    }

    if (warningRadius) {
      dispatchWorldStrikeAreaEffect({
        color: isBossThreat ? '#fb7185' : '#f87171',
        colorInt: isBossThreat ? 0xfb7185 : 0xf87171,
        targetX,
        targetY,
        radius: warningRadius,
        durationMs: Math.max(360, Math.min(1200, executionTimeMs ?? 420)),
      });
    }
  };

  const applyWorldStrikeImpactBundle = ({
    color,
    colorInt,
    targetX,
    targetY,
    damageText,
    damageTextColor,
    damageTextColorInt,
    radius,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    damageText: string;
    damageTextColor: string;
    damageTextColorInt: number;
    radius: number;
  }) => {
    dispatchWorldStrikeImpactEffect({
      color,
      colorInt,
      targetX,
      targetY,
      radius,
      durationMs: 220,
    });
    dispatchWorldStrikeTextEffect({
      text: damageText,
      color: damageTextColor,
      colorInt: damageTextColorInt,
      x: targetX,
      y: targetY,
    });
  };

  const dispatchWorldStrikeVisualPlan = ({
    projectile,
    area,
    impact,
  }: WorldStrikeVisualPlan) => {
    if (projectile) {
      dispatchWorldStrikeProjectileEffect(projectile);
    }

    if (area) {
      dispatchWorldStrikeAreaEffect(area);
    }

    if (impact) {
      applyWorldStrikeImpactBundle(impact);
    }
  };

  return {
    dispatchWorldStrikeVisualPlan,
    dispatchPlayerWorldStrikeCastEffect,
    dispatchEnemyWorldStrikeCastEffect,
  };
};
