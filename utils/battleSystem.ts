
import { BaseAttributes, Enemy, CombatLog, MajorRealm, SpiritRootId, ElementType, EnemyRank, ItemInstance, ItemQuality } from '../types';
import { REALM_BASE_STATS, SPIRIT_ROOT_DETAILS, SPIRIT_ROOT_TO_ELEMENT, ELEMENT_NAMES } from '../constants';
import { getItem } from '../data/items';
import { getDropRewards } from '../data/drop_tables';
import { generateDrops } from './dropSystem';

// Helper for Spirit Stone Formatting (1000 conversion)
const formatSpiritStones = (amount: number): string => {
    if (amount <= 0) return '';
    
    const high = Math.floor(amount / 1000000);
    const medium = Math.floor((amount % 1000000) / 1000);
    const low = amount % 1000;
    
    let parts: string[] = [];
    if (high > 0) parts.push(`<stones q="2">${high} 上品 靈石</stones>`);
    if (medium > 0) parts.push(`<stones q="1">${medium} 中品 靈石</stones>`);
    if (low > 0) parts.push(`<stones q="0">${low} 下品 靈石</stones>`);
    
    return parts.join('，');
};

interface PlayerCombatStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number; // Physical Atk
  magic: number;  // Magic Atk
  defense: number; // Phys Def
  res: number;     // Magic Def
  speed: number;
  crit: number; // %
  critDamage: number; // % (Base 150%)
  dodge: number; // %
  blockRate: number; // %
  damageReduction: number; // %
  
  // Utility Stats
  alchemyBonus: number; // %
  craftingBonus: number; // %
  breakthroughBonus: number; // %
  dropRateBonus: number; // %
  cultivationSpeedBonus: number; // %
  
  name: string;
  element: ElementType;
  regenHp: number; // % MaxHP per turn
}

// Elemental Restriction Logic (Attacker > Defender)
const getRestriction = (attacker: ElementType, defender: ElementType): { isEffective: boolean, isResisted: boolean } => {
    if (attacker === ElementType.None || defender === ElementType.None) return { isEffective: false, isResisted: false };

    // Metal > Wood > Earth > Water > Fire > Metal (Standard Wuxia Cycle)
    if (attacker === ElementType.Metal && defender === ElementType.Wood) return { isEffective: true, isResisted: false };
    if (attacker === ElementType.Wood && defender === ElementType.Earth) return { isEffective: true, isResisted: false };
    if (attacker === ElementType.Earth && defender === ElementType.Water) return { isEffective: true, isResisted: false };
    if (attacker === ElementType.Water && defender === ElementType.Fire) return { isEffective: true, isResisted: false };
    if (attacker === ElementType.Fire && defender === ElementType.Metal) return { isEffective: true, isResisted: false };

    // Reverse (Resisted)
    if (defender === ElementType.Metal && attacker === ElementType.Wood) return { isEffective: false, isResisted: true };
    if (defender === ElementType.Wood && attacker === ElementType.Earth) return { isEffective: false, isResisted: true };
    if (defender === ElementType.Earth && attacker === ElementType.Water) return { isEffective: false, isResisted: true };
    if (defender === ElementType.Water && attacker === ElementType.Fire) return { isEffective: false, isResisted: true };
    if (defender === ElementType.Fire && attacker === ElementType.Metal) return { isEffective: false, isResisted: true };

    return { isEffective: false, isResisted: false };
};

export const calculatePlayerStats = (
    attributes: BaseAttributes, 
    majorRealm: MajorRealm, 
    spiritRootId: SpiritRootId,
    equipmentStats: Partial<BaseAttributes & { attack: number, defense: number, speed: number, hp: number, mp: number, crit: number, dodge: number, magic: number, blockRate: number, regenHp: number }> = {},
    name: string = '道友'
): PlayerCombatStats => {
  const base = REALM_BASE_STATS[majorRealm];

  const rootDetails = SPIRIT_ROOT_DETAILS[spiritRootId];
  const rootBonuses = rootDetails.bonuses.battle || {};

  // 1. Calculate Effective Base Attributes (Base + Equipment)
  const effectivePhysique = attributes.physique + (equipmentStats.physique || 0);
  const effectiveRootBone = attributes.rootBone + (equipmentStats.rootBone || 0);
  const effectiveInsight = attributes.insight + (equipmentStats.insight || 0);
  const effectiveComprehension = attributes.comprehension + (equipmentStats.comprehension || 0);
  const effectiveFortune = attributes.fortune + (equipmentStats.fortune || 0);
  // charm usually doesn't affect combat directly

  // 2. Base Calculations from Effective Attributes
  let maxHp = effectivePhysique * 15 + base.hp;
  let maxMp = effectiveInsight * 10 + base.mp;
  let attack = effectiveRootBone * 2;
  let magic = effectiveInsight * 2;
  let defense = effectivePhysique * 1.5;
  let res = effectiveInsight * 1.5;

  // 3. Add Flat Bonuses from Equipment
  maxHp += (equipmentStats.hp || 0); 
  maxMp += (equipmentStats.mp || 0);
  attack += (equipmentStats.attack || 0);
  defense += (equipmentStats.defense || 0);
  magic += (equipmentStats.magic || 0);

  // 4. Percentage Multipliers (Spirit Root, etc.)
  if (rootBonuses.hpPercent) maxHp *= (1 + rootBonuses.hpPercent / 100);
  if (rootBonuses.mpPercent) maxMp *= (1 + rootBonuses.mpPercent / 100);
  if (rootBonuses.atkPercent) attack *= (1 + rootBonuses.atkPercent / 100);
  if (rootBonuses.defPercent) defense *= (1 + rootBonuses.defPercent / 100);
  
  // Res uses resPercent if available, otherwise shares defPercent (for backward compatibility if any)
  if (rootBonuses.resPercent) {
      res *= (1 + rootBonuses.resPercent / 100);
  } else if (rootBonuses.defPercent) {
      res *= (1 + rootBonuses.defPercent / 100);
  }

  // Floor final values
  maxHp = Math.floor(maxHp);
  maxMp = Math.floor(maxMp);
  attack = Math.floor(attack);
  magic = Math.floor(magic);
  defense = Math.floor(defense);

  // Speed
  const speed = effectiveComprehension + (equipmentStats.speed || 0);
  
  // Crit
  let crit = effectiveInsight * 0.1 + (equipmentStats.crit || 0);
  if (rootBonuses.critRate) crit += rootBonuses.critRate;
  
  // Dodge
  let dodge = effectiveFortune * 0.1 + (equipmentStats.dodge || 0);
  if (rootBonuses.dodgeRate) dodge += rootBonuses.dodgeRate;

  // New Derived Stats
  const critDamage = 150 + (effectiveInsight * 0.2); // Base 150%, +0.2% per Insight
  const blockRate = (effectivePhysique * 0.1) + (equipmentStats.blockRate || 0); // 0.1% per Physique + Equipment
  
  // Alchemy & Crafting (Defined in Spirit Root Bonuses)
  const alchemyBonus = rootDetails.bonuses.alchemyBonus || 0;
  const craftingBonus = rootDetails.bonuses.craftingBonus || 0;
  
  const breakthroughBonus = 0; // Removed Attribute dependency
  const dropRateBonus = effectiveFortune * 0.1; // Keep Fortune dependency
  
  // Cultivation Speed
  const cultivationSpeedBonus = 0;

  const damageReduction = rootBonuses.damageReduction || 0;
  const regenHp = (rootBonuses.hpRegen || 0) + (equipmentStats.regenHp || 0);
  const element = SPIRIT_ROOT_TO_ELEMENT[spiritRootId] || ElementType.None;

  return {
    hp: maxHp, maxHp, mp: maxMp, maxMp, attack, magic, defense, res, speed, 
    crit, critDamage, dodge, blockRate, damageReduction, 
    alchemyBonus, craftingBonus, breakthroughBonus, dropRateBonus, cultivationSpeedBonus,
    name, element, regenHp
  };
};

export const runAutoBattle = (player: PlayerCombatStats, enemy: Enemy): { won: boolean; logs: CombatLog[], rewards?: { spiritStones: number, exp: number, drops: { itemId: string, count: number, instance?: ItemInstance }[] } } => {
  let playerHp = player.hp;
  let enemyHp = enemy.hp;
  const logs: CombatLog[] = [];
  let turn = 1;

  // Boss Skill States
  let bossStunned = false;
  let bossBroken = false;
  let playerDebuffed = false; // Simplified debuff state

  // Pre-calculate Element Interactions
  const pVsE = getRestriction(player.element, enemy.element); // Player attacking Enemy
  const eVsP = getRestriction(enemy.element, player.element); // Enemy attacking Player

  // Initial Log
  if (player.element !== ElementType.None && enemy.element !== ElementType.None) {
      if (pVsE.isEffective) {
          logs.push({ turn: 0, isPlayer: true, message: `屬性克制：你的【${ELEMENT_NAMES[player.element]}】克制了敵方的【${ELEMENT_NAMES[enemy.element]}】！傷害+30%，承傷-20%`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
      }
      if (pVsE.isResisted) {
          logs.push({ turn: 0, isPlayer: true, message: `屬性被克：你的【${ELEMENT_NAMES[player.element]}】被敵方的【${ELEMENT_NAMES[enemy.element]}】克制！傷害-30%，承傷+20%`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
      }
  }

  while (playerHp > 0 && enemyHp > 0) {
    
    // --- Special: Break Check (Player hits Boss) ---
    // If player counters boss, small chance to "Break"
    if (enemy.rank === EnemyRank.Boss && pVsE.isEffective && !bossBroken && !bossStunned) {
        if (Math.random() < 0.15) { // 15% chance per turn to break
            bossBroken = true;
            logs.push({ turn, isPlayer: true, message: `【破招】你抓住 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 的破綻，一擊破防！Boss 進入虛弱狀態！`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
        }
    }

    // --- Player Turn ---
    // If Entangled (Python vs Earth), skip turn logic simplified
    let skipPlayer = false;

    if (!skipPlayer) {
        // Regen Logic
        if (player.regenHp > 0 && playerHp < player.maxHp) {
            const healAmount = Math.floor(player.maxHp * (player.regenHp / 100));
            playerHp = Math.min(player.maxHp, playerHp + healAmount);
             // Optional: Log regen? Might clutter. Let's log only if significant? 
             // Actually, for turn-based log, it's better to show it.
             if (healAmount > 0) {
                 logs.push({ turn, isPlayer: true, message: `生機盎然！你的長青之體自動回復了 ${healAmount} 點氣血。`, damage: -healAmount, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
             }
        }

        const isCrit = Math.random() * 100 < player.crit;
        // Raw Damage Calculation
        let rawDmg = player.attack - enemy.defense;
        
        // Critical Hit (Before Base reduction or Logic)
        if (isCrit) rawDmg = Math.floor(rawDmg * 1.5);
        
        // Modifiers
        if (pVsE.isEffective) rawDmg = Math.floor(rawDmg * 1.3); 
        if (pVsE.isResisted) rawDmg = Math.floor(rawDmg * 0.7); 
        if (bossBroken) rawDmg = Math.floor(rawDmg * 1.5); 
        if (playerDebuffed) rawDmg = Math.floor(rawDmg * 0.8); 
        
        // Ensure Minimum Damage of 1 FINAL check
        rawDmg = Math.max(1, Math.floor(rawDmg));

        enemyHp = Math.max(0, enemyHp - rawDmg);
        logs.push({
            turn,
            isPlayer: true,
            message: `<player>${player.name}</player> 發動攻擊，${isCrit ? '暴擊！' : ''}造成 <dmg>${rawDmg}</dmg> 點傷害！`,
            damage: rawDmg,
            playerHp,
            playerMaxHp: player.maxHp,
            enemyHp,
            enemyMaxHp: enemy.maxHp
        });
    }

    if (enemyHp <= 0) break;

    // --- Enemy Turn ---
    if (!bossStunned) {
        let enemyDmg = enemy.attack - player.defense;
        
        if (eVsP.isEffective) enemyDmg = Math.floor(enemyDmg * 1.2); 
        if (eVsP.isResisted) enemyDmg = Math.floor(enemyDmg * 0.8); 

        if (player.damageReduction > 0) {
            enemyDmg = Math.floor(enemyDmg * (1 - player.damageReduction / 100));
        }
        
        enemyDmg = Math.max(1, Math.floor(enemyDmg));

        const isDodge = Math.random() * 100 < player.dodge;
        const isBlock = Math.random() * 100 < player.blockRate;

        if (isDodge) {
            logs.push({ turn, isPlayer: false, message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 發動攻擊，但被你靈巧地閃過了！`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
        } else {
             if (isBlock) {
                 enemyDmg = Math.floor(enemyDmg * 0.5); // Block reduces damage by 50%
                 logs.push({ turn, isPlayer: false, message: `【格擋】你舉盾擋下了部分攻擊！傷害減半。`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp }); // Log block separately or combine? Prefer combine in next log.
                 // Actually let's just modify the damage and append "(Blocked)" to the message below or log it distinctively.
                 // Let's log a block message FIRST, then the damage log.
             }

             playerHp = Math.max(0, playerHp - enemyDmg);
             logs.push({
                turn,
                isPlayer: false,
                message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 反擊，${isBlock ? '被你格擋，' : ''}造成 <dmg>${enemyDmg}</dmg> 點傷害！`,
                damage: enemyDmg,
                playerHp,
                playerMaxHp: player.maxHp,
                enemyHp,
                enemyMaxHp: enemy.maxHp
            });
        }
    } else {
        logs.push({ turn, isPlayer: false, message: `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 處於暈眩狀態，無法行動！`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
        bossStunned = false; // Recover next turn
    }
    
    // Reset temporary flags
    bossBroken = false;
    
    turn++;
  }

    const won = playerHp > 0 && enemyHp <= 0;
  if (won) {
    const exp = enemy.exp || 0;
    logs.push({ turn, isPlayer: true, message: `<acc>擊敗了</acc> <enemy rank="${enemy.rank}">${enemy.name}</enemy>，獲得 <exp>${exp} 修為</exp>`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
    
    // Drop Logic
    let { spiritStones } = getDropRewards(enemy);
    const drops = generateDrops(enemy);
    
    // Merge Spirit Stone Items into Currency
    const finalDrops: { itemId: string, count: number, instance?: ItemInstance }[] = [];
    drops.forEach(d => {
        if (d.itemId === 'spirit_stone') {
            spiritStones += d.count;
        } else {
            finalDrops.push(d);
        }
    });

    if (spiritStones > 0 || finalDrops.length > 0) {
        let lootMsg = '';

        if (spiritStones > 0) {
            lootMsg += formatSpiritStones(spiritStones);
        }
        
        if (finalDrops.length > 0) {
            if (lootMsg) lootMsg += '，';
            const dropNames = finalDrops.map(d => {
                const item = getItem(d.itemId);
                const name = item ? item.name : d.itemId;
                let qStr = '';
                let qVal = 0;
                
                if (d.instance) {
                    qVal = d.instance.quality;
                } else if (item) {
                     qVal = item.quality || 0;
                }
                
                if (qVal === ItemQuality.Low) qStr = '(下品)'; // Force Low display
                if (qVal === ItemQuality.Medium) qStr = '(中品)';
                if (qVal === ItemQuality.High) qStr = '(上品)';
                if (qVal === ItemQuality.Immortal) qStr = '(仙品)';

                return `<item q="${qVal}">${name}${qStr}</item>`;
            });
            lootMsg += dropNames.join('，');
        }
        logs.push({ turn, isPlayer: true, message: `獲得戰利品：${lootMsg}`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
    }
    
    return { won, logs, rewards: { spiritStones, exp, drops } };
  } else {
    logs.push({ turn, isPlayer: false, message: `不敵 [${enemy.name}]，身受重傷...`, damage: 0, playerHp, playerMaxHp: player.maxHp, enemyHp, enemyMaxHp: enemy.maxHp });
  }

  return { won, logs };
};
