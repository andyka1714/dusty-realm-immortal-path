
import { Enemy } from '../../types';
import { COMMON_ENEMIES } from './common';
import { ELITE_ENEMIES } from './elite';
import { BOSS_ENEMIES, BOSS_MAPPING } from './boss';

export const BESTIARY: Record<string, Enemy> = {
    ...COMMON_ENEMIES,
    ...ELITE_ENEMIES,
    ...BOSS_ENEMIES
};

export { BOSS_MAPPING };
