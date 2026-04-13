import { MajorRealm, MajorRealmCN, ProfessionType } from "../../types";

export type CombatProfession =
  | ProfessionType.Sword
  | ProfessionType.Body
  | ProfessionType.Mage;

export interface TtkRange {
  minSeconds: number;
  maxSeconds: number;
}

export interface RealmTtkProfile {
  normal: TtkRange;
  elite: TtkRange;
  boss: TtkRange;
}

export interface HighRealmCultivationMultiplierSpec {
  pillMultiplier: number;
  dwellingMultiplier: number;
  encounterMultiplier: number;
  eventMultiplier: number;
  targetTotalMultiplier: number;
  summary: string;
}

export interface HighRealmCatchUpSpec {
  firstKillExpBonus: number;
  eliteDropBonus: number;
  seclusionCostReduction: number;
  underTargetRealmBonus: number;
  summary: string;
}

const combatProfessions: CombatProfession[] = [
  ProfessionType.Sword,
  ProfessionType.Body,
  ProfessionType.Mage,
];

const orderedRealms: MajorRealm[] = [
  MajorRealm.Mortal,
  MajorRealm.QiRefining,
  MajorRealm.Foundation,
  MajorRealm.GoldenCore,
  MajorRealm.NascentSoul,
  MajorRealm.SpiritSevering,
  MajorRealm.VoidRefining,
  MajorRealm.Fusion,
  MajorRealm.Mahayana,
  MajorRealm.Tribulation,
  MajorRealm.Immortal,
  MajorRealm.ImmortalEmperor,
];

const REALM_TTK_TARGET_ROWS: Array<{
  realm: MajorRealm;
  sword: RealmTtkProfile;
  body: RealmTtkProfile;
  mage: RealmTtkProfile;
}> = [
  {
    realm: MajorRealm.Mortal,
    sword: {
      normal: { minSeconds: 1.5, maxSeconds: 2.5 },
      elite: { minSeconds: 4, maxSeconds: 6 },
      boss: { minSeconds: 12, maxSeconds: 18 },
    },
    body: {
      normal: { minSeconds: 2, maxSeconds: 3.2 },
      elite: { minSeconds: 5, maxSeconds: 7.5 },
      boss: { minSeconds: 14, maxSeconds: 22 },
    },
    mage: {
      normal: { minSeconds: 1.8, maxSeconds: 2.8 },
      elite: { minSeconds: 4.5, maxSeconds: 6.5 },
      boss: { minSeconds: 13, maxSeconds: 20 },
    },
  },
  {
    realm: MajorRealm.QiRefining,
    sword: {
      normal: { minSeconds: 2, maxSeconds: 3.2 },
      elite: { minSeconds: 5, maxSeconds: 7.5 },
      boss: { minSeconds: 14, maxSeconds: 22 },
    },
    body: {
      normal: { minSeconds: 2.4, maxSeconds: 3.8 },
      elite: { minSeconds: 6, maxSeconds: 8.5 },
      boss: { minSeconds: 16, maxSeconds: 25 },
    },
    mage: {
      normal: { minSeconds: 2.1, maxSeconds: 3.4 },
      elite: { minSeconds: 5.5, maxSeconds: 8 },
      boss: { minSeconds: 15, maxSeconds: 23 },
    },
  },
  {
    realm: MajorRealm.Foundation,
    sword: {
      normal: { minSeconds: 2.2, maxSeconds: 3.5 },
      elite: { minSeconds: 5.5, maxSeconds: 8.5 },
      boss: { minSeconds: 16, maxSeconds: 24 },
    },
    body: {
      normal: { minSeconds: 2.8, maxSeconds: 4.2 },
      elite: { minSeconds: 6.5, maxSeconds: 9.5 },
      boss: { minSeconds: 18, maxSeconds: 28 },
    },
    mage: {
      normal: { minSeconds: 2.4, maxSeconds: 3.8 },
      elite: { minSeconds: 6, maxSeconds: 8.8 },
      boss: { minSeconds: 17, maxSeconds: 25 },
    },
  },
  {
    realm: MajorRealm.GoldenCore,
    sword: {
      normal: { minSeconds: 2.4, maxSeconds: 3.8 },
      elite: { minSeconds: 6, maxSeconds: 9 },
      boss: { minSeconds: 17, maxSeconds: 27 },
    },
    body: {
      normal: { minSeconds: 3, maxSeconds: 4.5 },
      elite: { minSeconds: 7, maxSeconds: 10.5 },
      boss: { minSeconds: 20, maxSeconds: 31 },
    },
    mage: {
      normal: { minSeconds: 2.7, maxSeconds: 4.1 },
      elite: { minSeconds: 6.4, maxSeconds: 9.8 },
      boss: { minSeconds: 18, maxSeconds: 28 },
    },
  },
  {
    realm: MajorRealm.NascentSoul,
    sword: {
      normal: { minSeconds: 2.6, maxSeconds: 4.1 },
      elite: { minSeconds: 6.5, maxSeconds: 9.5 },
      boss: { minSeconds: 18, maxSeconds: 29 },
    },
    body: {
      normal: { minSeconds: 3.2, maxSeconds: 4.8 },
      elite: { minSeconds: 7.4, maxSeconds: 11 },
      boss: { minSeconds: 21, maxSeconds: 33 },
    },
    mage: {
      normal: { minSeconds: 2.9, maxSeconds: 4.3 },
      elite: { minSeconds: 6.8, maxSeconds: 10.2 },
      boss: { minSeconds: 19, maxSeconds: 30 },
    },
  },
  {
    realm: MajorRealm.SpiritSevering,
    sword: {
      normal: { minSeconds: 2.8, maxSeconds: 4.3 },
      elite: { minSeconds: 7, maxSeconds: 10.2 },
      boss: { minSeconds: 19, maxSeconds: 30 },
    },
    body: {
      normal: { minSeconds: 3.4, maxSeconds: 5.1 },
      elite: { minSeconds: 8, maxSeconds: 11.5 },
      boss: { minSeconds: 22, maxSeconds: 34 },
    },
    mage: {
      normal: { minSeconds: 3, maxSeconds: 4.5 },
      elite: { minSeconds: 7.3, maxSeconds: 10.5 },
      boss: { minSeconds: 20, maxSeconds: 31 },
    },
  },
  {
    realm: MajorRealm.VoidRefining,
    sword: {
      normal: { minSeconds: 3, maxSeconds: 4.6 },
      elite: { minSeconds: 7.4, maxSeconds: 10.8 },
      boss: { minSeconds: 20, maxSeconds: 31 },
    },
    body: {
      normal: { minSeconds: 3.6, maxSeconds: 5.4 },
      elite: { minSeconds: 8.3, maxSeconds: 12 },
      boss: { minSeconds: 23, maxSeconds: 35 },
    },
    mage: {
      normal: { minSeconds: 3.2, maxSeconds: 4.8 },
      elite: { minSeconds: 7.8, maxSeconds: 11 },
      boss: { minSeconds: 21, maxSeconds: 32 },
    },
  },
  {
    realm: MajorRealm.Fusion,
    sword: {
      normal: { minSeconds: 3.1, maxSeconds: 4.8 },
      elite: { minSeconds: 7.8, maxSeconds: 11.2 },
      boss: { minSeconds: 21, maxSeconds: 32 },
    },
    body: {
      normal: { minSeconds: 3.8, maxSeconds: 5.6 },
      elite: { minSeconds: 8.8, maxSeconds: 12.4 },
      boss: { minSeconds: 24, maxSeconds: 36 },
    },
    mage: {
      normal: { minSeconds: 3.3, maxSeconds: 5 },
      elite: { minSeconds: 8, maxSeconds: 11.4 },
      boss: { minSeconds: 22, maxSeconds: 33 },
    },
  },
  {
    realm: MajorRealm.Mahayana,
    sword: {
      normal: { minSeconds: 3.3, maxSeconds: 5 },
      elite: { minSeconds: 8.2, maxSeconds: 11.5 },
      boss: { minSeconds: 22, maxSeconds: 33 },
    },
    body: {
      normal: { minSeconds: 4, maxSeconds: 5.8 },
      elite: { minSeconds: 9, maxSeconds: 12.8 },
      boss: { minSeconds: 25, maxSeconds: 37 },
    },
    mage: {
      normal: { minSeconds: 3.5, maxSeconds: 5.2 },
      elite: { minSeconds: 8.4, maxSeconds: 11.8 },
      boss: { minSeconds: 23, maxSeconds: 34 },
    },
  },
  {
    realm: MajorRealm.Tribulation,
    sword: {
      normal: { minSeconds: 3.4, maxSeconds: 5.1 },
      elite: { minSeconds: 8.5, maxSeconds: 11.8 },
      boss: { minSeconds: 23, maxSeconds: 34 },
    },
    body: {
      normal: { minSeconds: 4.1, maxSeconds: 6 },
      elite: { minSeconds: 9.3, maxSeconds: 13 },
      boss: { minSeconds: 26, maxSeconds: 38 },
    },
    mage: {
      normal: { minSeconds: 3.6, maxSeconds: 5.3 },
      elite: { minSeconds: 8.8, maxSeconds: 12 },
      boss: { minSeconds: 24, maxSeconds: 35 },
    },
  },
  {
    realm: MajorRealm.Immortal,
    sword: {
      normal: { minSeconds: 3.6, maxSeconds: 5.3 },
      elite: { minSeconds: 8.8, maxSeconds: 12 },
      boss: { minSeconds: 24, maxSeconds: 35 },
    },
    body: {
      normal: { minSeconds: 4.3, maxSeconds: 6.2 },
      elite: { minSeconds: 9.6, maxSeconds: 13.3 },
      boss: { minSeconds: 27, maxSeconds: 39 },
    },
    mage: {
      normal: { minSeconds: 3.8, maxSeconds: 5.5 },
      elite: { minSeconds: 9, maxSeconds: 12.3 },
      boss: { minSeconds: 25, maxSeconds: 36 },
    },
  },
  {
    realm: MajorRealm.ImmortalEmperor,
    sword: {
      normal: { minSeconds: 3.8, maxSeconds: 5.5 },
      elite: { minSeconds: 9, maxSeconds: 12.5 },
      boss: { minSeconds: 25, maxSeconds: 36 },
    },
    body: {
      normal: { minSeconds: 4.5, maxSeconds: 6.5 },
      elite: { minSeconds: 10, maxSeconds: 13.8 },
      boss: { minSeconds: 28, maxSeconds: 40 },
    },
    mage: {
      normal: { minSeconds: 4, maxSeconds: 5.7 },
      elite: { minSeconds: 9.3, maxSeconds: 12.8 },
      boss: { minSeconds: 26, maxSeconds: 37 },
    },
  },
];

export const REALM_TTK_TARGETS: Record<
  MajorRealm,
  Record<CombatProfession, RealmTtkProfile>
> = REALM_TTK_TARGET_ROWS.reduce((acc, row) => {
  acc[row.realm] = {
    [ProfessionType.Sword]: row.sword,
    [ProfessionType.Body]: row.body,
    [ProfessionType.Mage]: row.mage,
  };
  return acc;
}, {} as Record<MajorRealm, Record<CombatProfession, RealmTtkProfile>>);

const HIGH_REALM_ROWS: Array<{
  realm: MajorRealm;
  cultivation: HighRealmCultivationMultiplierSpec;
  catchUp: HighRealmCatchUpSpec;
}> = [
  {
    realm: MajorRealm.SpiritSevering,
    cultivation: {
      pillMultiplier: 1.12,
      dwellingMultiplier: 1.1,
      encounterMultiplier: 1.15,
      eventMultiplier: 1.18,
      targetTotalMultiplier: 1.68,
      summary: "化神開始由丹藥與洞府接手主修為缺口，奇遇與事件只做第一段抬升。",
    },
    catchUp: {
      firstKillExpBonus: 0.12,
      eliteDropBonus: 0.08,
      seclusionCostReduction: 0.08,
      underTargetRealmBonus: 0.1,
      summary: "化神開始給第一段追趕補貼，確保玩家不會只剩純閉關。",
    },
  },
  {
    realm: MajorRealm.VoidRefining,
    cultivation: {
      pillMultiplier: 1.15,
      dwellingMultiplier: 1.12,
      encounterMultiplier: 1.18,
      eventMultiplier: 1.22,
      targetTotalMultiplier: 1.82,
      summary: "煉虛把奇遇與事件比重拉高，避免單靠洞府堆時長。",
    },
    catchUp: {
      firstKillExpBonus: 0.15,
      eliteDropBonus: 0.1,
      seclusionCostReduction: 0.1,
      underTargetRealmBonus: 0.12,
      summary: "煉虛開始對落後 build 額外補精英掉落與閉關成本折扣。",
    },
  },
  {
    realm: MajorRealm.Fusion,
    cultivation: {
      pillMultiplier: 1.18,
      dwellingMultiplier: 1.15,
      encounterMultiplier: 1.22,
      eventMultiplier: 1.25,
      targetTotalMultiplier: 1.98,
      summary: "合體期正式要求丹藥、洞府、首殺、奇遇同步發力。",
    },
    catchUp: {
      firstKillExpBonus: 0.18,
      eliteDropBonus: 0.12,
      seclusionCostReduction: 0.12,
      underTargetRealmBonus: 0.14,
      summary: "合體期落後者會開始拿到更高首殺修為與掃圖補正。",
    },
  },
  {
    realm: MajorRealm.Mahayana,
    cultivation: {
      pillMultiplier: 1.22,
      dwellingMultiplier: 1.18,
      encounterMultiplier: 1.25,
      eventMultiplier: 1.28,
      targetTotalMultiplier: 2.14,
      summary: "大乘期預期由洞府與高階丹藥接住主修為時間牆。",
    },
    catchUp: {
      firstKillExpBonus: 0.2,
      eliteDropBonus: 0.14,
      seclusionCostReduction: 0.14,
      underTargetRealmBonus: 0.16,
      summary: "大乘期開始明確限制卡關者的閉關成本與首殺回報落差。",
    },
  },
  {
    realm: MajorRealm.Tribulation,
    cultivation: {
      pillMultiplier: 1.25,
      dwellingMultiplier: 1.2,
      encounterMultiplier: 1.28,
      eventMultiplier: 1.32,
      targetTotalMultiplier: 2.28,
      summary: "渡劫把事件與挑戰首通拉成主乘區之一，避免純線性拖長。",
    },
    catchUp: {
      firstKillExpBonus: 0.22,
      eliteDropBonus: 0.16,
      seclusionCostReduction: 0.16,
      underTargetRealmBonus: 0.18,
      summary: "渡劫期追趕機制進一步強化，避免單一境界牆把 build 卡死。",
    },
  },
  {
    realm: MajorRealm.Immortal,
    cultivation: {
      pillMultiplier: 1.28,
      dwellingMultiplier: 1.24,
      encounterMultiplier: 1.32,
      eventMultiplier: 1.36,
      targetTotalMultiplier: 2.43,
      summary: "仙人期要求洞府、丹藥、事件與高階首殺形成完整乘區閉環。",
    },
    catchUp: {
      firstKillExpBonus: 0.25,
      eliteDropBonus: 0.18,
      seclusionCostReduction: 0.18,
      underTargetRealmBonus: 0.2,
      summary: "仙人期落後者會拿到更高首殺與精英修為補貼，縮短追趕週期。",
    },
  },
  {
    realm: MajorRealm.ImmortalEmperor,
    cultivation: {
      pillMultiplier: 1.32,
      dwellingMultiplier: 1.28,
      encounterMultiplier: 1.36,
      eventMultiplier: 1.4,
      targetTotalMultiplier: 2.58,
      summary: "帝境主修為不再允許只靠閉關，四類乘區必須同時成立。",
    },
    catchUp: {
      firstKillExpBonus: 0.28,
      eliteDropBonus: 0.2,
      seclusionCostReduction: 0.2,
      underTargetRealmBonus: 0.22,
      summary: "帝境追趕補貼拉到最高，避免最後兩境界總時長失控膨脹。",
    },
  },
];

export const HIGH_REALM_CULTIVATION_MULTIPLIERS: Record<
  MajorRealm,
  HighRealmCultivationMultiplierSpec
> = HIGH_REALM_ROWS.reduce((acc, row) => {
  acc[row.realm] = row.cultivation;
  return acc;
}, {} as Record<MajorRealm, HighRealmCultivationMultiplierSpec>);

export const HIGH_REALM_CATCH_UP_SPECS: Record<MajorRealm, HighRealmCatchUpSpec> =
  HIGH_REALM_ROWS.reduce((acc, row) => {
    acc[row.realm] = row.catchUp;
    return acc;
  }, {} as Record<MajorRealm, HighRealmCatchUpSpec>);

export const HIGH_REALM_PROGRESSION_REALMS = HIGH_REALM_ROWS.map((row) => row.realm);

export const getRealmTtkTargets = (realm: MajorRealm) => REALM_TTK_TARGETS[realm];

export const getHighRealmCultivationSpec = (realm: MajorRealm) =>
  HIGH_REALM_CULTIVATION_MULTIPLIERS[realm];

export const getHighRealmCatchUpSpec = (realm: MajorRealm) =>
  HIGH_REALM_CATCH_UP_SPECS[realm];

export const getRealmTtkSummaryRows = () =>
  orderedRealms.map((realm) => ({
    realm,
    realmName: MajorRealmCN[realm],
    targets: REALM_TTK_TARGETS[realm],
  }));

export const getHighRealmProgressionSummaryRows = () =>
  HIGH_REALM_PROGRESSION_REALMS.map((realm) => ({
    realm,
    realmName: MajorRealmCN[realm],
    cultivation: HIGH_REALM_CULTIVATION_MULTIPLIERS[realm],
    catchUp: HIGH_REALM_CATCH_UP_SPECS[realm],
  }));

export const getCombatProfessions = () => [...combatProfessions];
export const getOrderedRealms = () => [...orderedRealms];
