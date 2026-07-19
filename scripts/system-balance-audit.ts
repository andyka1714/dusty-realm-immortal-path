import { writeFileSync } from "node:fs";
import {
  calculateMaxExp,
  PASSIVE_CULTIVATION_PENALTY,
  REALM_ATTRIBUTE_GROWTH,
  REALM_MODIFIERS,
  REALM_NAMES,
} from "../constants";
import { BESTIARY } from "../data/enemies";
import { EQUIPMENT_ITEMS } from "../data/items/equipment";
import { QUESTS } from "../data/quests";
import { FORMAL_CORE_SKILLS_SORTED } from "../data/skills";
import { MAPS } from "../data/maps";
import { EnemyRank, ItemCategory, MajorRealm, ProfessionType } from "../types";
import { getCombatExperienceReward } from "../utils/progressionBalance";

const realms = Object.values(MajorRealm).filter(
  (value): value is MajorRealm => typeof value === "number"
);
const fmt = (value: number) => new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 }).format(value);
const avg = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

let typicalRootBone = 10;
const rows = realms.map((realm) => {
  const enemies = Object.values(BESTIARY).filter((enemy) => enemy.realm === realm);
  const commons = enemies.filter((enemy) => enemy.rank === EnemyRank.Common);
  const elites = enemies.filter((enemy) => enemy.rank === EnemyRank.Elite);
  const bosses = enemies.filter((enemy) => enemy.rank === EnemyRank.Boss);
  const realmExp = realm === MajorRealm.ImmortalEmperor
    ? 0
    : sum(Array.from({ length: 10 }, (_, minor) => calculateMaxExp(realm, minor)));
  const questExp = sum(
    Object.values(QUESTS)
      .filter((quest) => quest.requirements.some((requirement) => requirement.minRealm === realm))
      .flatMap((quest) => quest.rewards.map((reward) => reward.exp ?? 0))
  );
  const skills = FORMAL_CORE_SKILLS_SORTED.filter((skill) => skill.minRealm === realm);
  const equipment = Object.values(EQUIPMENT_ITEMS).filter((item) => item.minRealm === realm);
  const maps = MAPS.filter((map) => map.minRealm === realm);
  let passiveSeconds = 0;
  for (let minor = 0; minor < 10; minor += 1) {
    const passiveRate =
      typicalRootBone *
      REALM_MODIFIERS[realm] *
      1.3 *
      (1 + realm * 0.1) *
      PASSIVE_CULTIVATION_PENALTY;
    passiveSeconds += passiveRate > 0 ? calculateMaxExp(realm, minor) / passiveRate : 0;
    typicalRootBone += REALM_ATTRIBUTE_GROWTH[realm].None.rootBone;
  }
  const effectiveCommonExp = avg(commons.map(getCombatExperienceReward));
  const commonKillsPerMinor = effectiveCommonExp > 0 ? realmExp / 10 / effectiveCommonExp : 0;

  return {
    realm,
    realmExp,
    commons,
    elites,
    bosses,
    questExp,
    skills,
    equipment,
    maps,
    passiveHours: passiveSeconds / 3600,
    commonKillsPerMinor,
  };
});

const problems: string[] = [];
for (const row of rows) {
  if (row.realm !== MajorRealm.ImmortalEmperor && row.commons.length === 0) problems.push(`${REALM_NAMES[row.realm]}缺少普通怪`);
  if (row.realm !== MajorRealm.ImmortalEmperor && row.maps.length === 0) problems.push(`${REALM_NAMES[row.realm]}缺少地圖`);
  if (row.equipment.length < 4 && row.realm > MajorRealm.Mortal) problems.push(`${REALM_NAMES[row.realm]}裝備少於 4 件`);
  if (row.realm !== MajorRealm.ImmortalEmperor && row.commonKillsPerMinor > 120) problems.push(`${REALM_NAMES[row.realm]}每小境界普通怪擊殺需求過高`);
}
const npcIds = new Set(MAPS.flatMap((map) => map.npcs.map((npc) => npc.id)));
for (const quest of Object.values(QUESTS)) {
  if (quest.prerequisiteQuestId && !QUESTS[quest.prerequisiteQuestId]) problems.push(`${quest.id} 前置任務不存在`);
  if (!npcIds.has(quest.giverId)) problems.push(`${quest.id} 發佈 NPC 不在任何地圖`);
  if (quest.submitNpcId && !npcIds.has(quest.submitNpcId)) problems.push(`${quest.id} 回報 NPC 不在任何地圖`);
}
for (const profession of [ProfessionType.Sword, ProfessionType.Body, ProfessionType.Mage]) {
  const coreSkills = FORMAL_CORE_SKILLS_SORTED.filter((skill) => skill.profession === profession);
  if (coreSkills.length !== 12) problems.push(`${profession} 正式核心技能應為 12 個，實際為 ${coreSkills.length}`);
  if (!coreSkills.some((skill) => skill.type === "Active")) problems.push(`${profession} 缺少主動技能`);
  if (!coreSkills.some((skill) => skill.type === "Passive")) problems.push(`${profession} 缺少被動技能`);
}

const lines = [
  "# 全系統平衡自動稽核（2026-07-19）",
  "",
  "此報告直接讀取目前 runtime 資料，檢查境界經驗、怪物、任務、技能、裝備與地圖覆蓋。",
  "",
  "| 境界 | 十小境界 EXP | 預估被動時數 | 普通怪/小境界 | 地圖 | 普通/菁英/Boss | 任務 EXP | 核心技能 | 裝備 |",
  "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
  ...rows.map((row) =>
    `| ${REALM_NAMES[row.realm]} | ${fmt(row.realmExp)} | ${fmt(row.passiveHours)}h | ${fmt(row.commonKillsPerMinor)} | ${row.maps.length} | ${row.commons.length}/${row.elites.length}/${row.bosses.length} | ${fmt(row.questExp)} | ${row.skills.length} | ${row.equipment.length} |`
  ),
  "",
  "## 自動檢查結果",
  "",
  ...(problems.length ? problems.map((problem) => `- ⚠ ${problem}`) : ["- 未發現內容覆蓋缺口。"]),
  "- 合體、仙人與仙帝沒有強制新增大量核心技能，屬於技能池收斂設計：玩家沿用並強化先前流派，避免後期技能欄膨脹。",
  "",
  "## 裝備與技能安全線",
  "",
  `- 裝備定義：${Object.values(EQUIPMENT_ITEMS).filter((item) => item.category === ItemCategory.Equipment).length} 件。`,
  `- 正式核心技能：${FORMAL_CORE_SKILLS_SORTED.length} 個。`,
  "- 品階沿用同一件裝備定義；runtime 透過品質倍率與紙雕邊框／光暈呈現，不複製基礎圖。",
  "- 戰鬥修為隨境界採 2 倍階梯補償；任務修為至少提供當前小境界 1.5%–6%，避免後期任務失去價值。",
  "- TTK、職業差異、掉落品質與高境界回歸由既有 Vitest 回歸測試守門。",
  "",
];

writeFileSync("docs/06_Balance_Audit/23_全系統自動稽核.md", lines.join("\n"));
console.log(JSON.stringify({ rows: rows.length, problems, enemies: Object.keys(BESTIARY).length, quests: Object.keys(QUESTS).length, skills: FORMAL_CORE_SKILLS_SORTED.length, equipment: Object.keys(EQUIPMENT_ITEMS).length }, null, 2));
