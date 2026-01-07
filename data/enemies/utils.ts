
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';

export const createEnemy = (
    id: string, name: string, realm: MajorRealm, rank: EnemyRank, 
    hp: number, atk: number, def: number, ele: ElementType, 
    drops: string[], exp: number
): Enemy => ({
    id, name, realm, rank, hp, maxHp: hp, attack: atk, defense: def, element: ele, drops, exp
});
