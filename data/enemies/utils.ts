
import { MajorRealm, ElementType, Enemy, EnemyRank, MinorRealmType } from '../../types';

export const createEnemy = (
    id: string, name: string, realm: MajorRealm, rank: EnemyRank, 
    hp: number, atk: number, def: number, ele: ElementType, 
    drops: string[], exp: number, minorRealm?: MinorRealmType,
    symbol: string = '?'
): Enemy => ({
    id, name, realm, minorRealm, symbol, rank, hp, maxHp: hp, attack: atk, defense: def, element: ele, drops, exp
});
