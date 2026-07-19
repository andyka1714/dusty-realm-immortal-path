import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BESTIARY } from "../data/enemies";
import { MAPS } from "../data/maps";
import { EQUIPMENT_ITEMS } from "../data/items/equipment";
import { MATERIAL_ITEMS } from "../data/items/materials";
import { CONSUMABLE_ITEMS } from "../data/items/consumables";
import { MANUAL_ITEMS } from "../data/items/manuals";
import { SKILLS } from "../data/skills";
import type { EquipmentItem } from "../types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const checklistDir = join(root, "docs", "assets");
mkdirSync(checklistDir, { recursive: true });

type ChecklistEntry = {
  id: string;
  name: string;
  detail: string;
  path: string;
};

const relativeAssetPath = (group: string, id: string) =>
  `public/assets/generated/${group}/${id}.webp`;

const hasAsset = (entry: ChecklistEntry) => existsSync(join(root, entry.path));

const renderChecklist = (title: string, entries: readonly ChecklistEntry[]) => {
  const completed = entries.filter(hasAsset).length;
  const rows = entries.map((entry) =>
    `- [${hasAsset(entry) ? "x" : " "}] \`${entry.id}\`｜${entry.name}｜${entry.detail}｜\`${entry.path}\``
  );

  return [
    `# ${title}`,
    "",
    `- 資料定義總數：${entries.length}`,
    `- 已有唯一素材：${completed}`,
    `- 尚缺素材：${entries.length - completed}`,
    `- 完成率：${entries.length === 0 ? "100.00" : ((completed / entries.length) * 100).toFixed(2)}%`,
    "",
    ...rows,
    "",
  ].join("\n");
};

const mapEntries: ChecklistEntry[] = MAPS.map((map) => ({
  id: map.id,
  name: map.name,
  detail: `${map.theme}｜${map.width}×${map.height}｜${map.minRealm}`,
  path: relativeAssetPath("maps/paper-cut-v3", map.id),
}));

const monsterEntries: ChecklistEntry[] = Object.values(BESTIARY).map((enemy) => ({
  id: enemy.id,
  name: enemy.name,
  detail: `${enemy.rank}｜${enemy.realm}｜${enemy.element}`,
  path: relativeAssetPath("characters/monsters/paper-cut-v3", enemy.id),
}));

const equipmentEntries: ChecklistEntry[] = Object.values(EQUIPMENT_ITEMS).map((rawItem) => {
  const item = rawItem as EquipmentItem;
  return {
    id: item.id,
    name: item.name,
    detail: `${item.slot}｜${item.subType}｜${item.minRealm ?? item.reqRealm ?? "不限"}`,
    path: relativeAssetPath("icons/equipment-paper-v3", item.id),
  };
});

const otherItemEntries = [
  ...Object.values(MATERIAL_ITEMS),
  ...Object.values(CONSUMABLE_ITEMS),
  ...Object.values(MANUAL_ITEMS),
].map<ChecklistEntry>((item) => ({
  id: item.id,
  name: item.name,
  detail: `${item.category}｜${item.minRealm ?? "不限"}`,
  path: relativeAssetPath("icons/items-paper-v3", item.id),
}));

const skillEntries: ChecklistEntry[] = Object.values(SKILLS).map((skill) => ({
  id: skill.id,
  name: skill.name,
  detail: `${skill.type}｜${skill.effectType ?? "被動"}｜${skill.minRealm}`,
  path: relativeAssetPath("icons/skills-paper-v3", skill.id),
}));

const checklists = [
  ["all-maps.md", "所有地圖素材 Checklist", mapEntries],
  ["all-monsters.md", "所有怪物素材 Checklist", monsterEntries],
  ["all-equipment.md", "所有武器裝備素材 Checklist", equipmentEntries],
  ["all-items-and-skills.md", "所有道具與技能素材 Checklist", [...otherItemEntries, ...skillEntries]],
] as const;

for (const [fileName, title, entries] of checklists) {
  writeFileSync(join(checklistDir, fileName), renderChecklist(title, entries));
}

const groups = {
  maps: mapEntries,
  monsters: monsterEntries,
  equipment: equipmentEntries,
  items: otherItemEntries,
  skills: skillEntries,
};

const report = Object.fromEntries(
  Object.entries(groups).map(([group, entries]) => {
    const completed = entries.filter(hasAsset).length;
    return [group, { total: entries.length, completed, missing: entries.length - completed }];
  })
);

writeFileSync(
  join(checklistDir, "coverage-report.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), groups: report }, null, 2)}\n`
);

console.log(JSON.stringify(report, null, 2));
