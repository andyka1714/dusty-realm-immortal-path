# Design: 圖鑑來源追蹤 v2

## Context

目前 `CompendiumModal` 已具備三個重要基礎：

- `神兵法寶` 依境界分組，item card 已能列出敵人掉落。
- `功法神通` 依 profession 與 realm 分組，skill card 已顯示 `formalSourceTier` 的中文摘要。
- `宗門傳承` 以三宗 tabs 聚焦單一宗門，並能列出對應 formal core skills 與章節線索。

資料層也已經具備可推導來源：

- `Enemy.drops` 可推導 item / manual drop source。
- `SHOPS` 可推導商店來源。
- `WORKSHOP_RECIPES` 的 `ingredients / outputs / sourceHint / routeTags` 可推導 Workshop 產物與 sink。
- `ENCOUNTER_EVENTS` 的 reward cue、route label、selector world memory 可推導 route-specific material source。
- `getSkillManualSources`、`manualSourceTypes` 與 `formalSourceTier` 可推導功法秘卷來源。

因此這輪不新增 content runtime，只在圖鑑組裝一層 deterministic source view model。

## Goals

- 讓 item card 有統一的 `來源追蹤` 區塊，而不是只顯示敵人掉落。
- 讓 route-specific material 顯示人讀來源、machine-readable `sect:*:world-chapter-03` 與 Workshop sink。
- 讓 skill card 顯示 formal tier 之外的秘卷來源 labels。
- 維持現有 taxonomy layout，不重做 tab 架構。
- 不新增 persisted state 或 migration。

## Non-Goals

- 不新增新物品、技能、敵人、商店、quest 或 encounter。
- 不把圖鑑做成可互動資料庫搜尋器。
- 不新增第二套 source registry persisted model。
- 不調整 skill acquisition / consumeItem / Workshop crafting 行為。

## Source View Model

### Item source chips

每張 item card 可從以下資料組出 source chips：

- `drop`：由 `getDroppedBy(item.id)` 取得，保留最多數個敵人 chip 與 overflow tooltip。
- `shop`：掃描 `SHOPS[*].items`，顯示商店名稱。
- `workshop_output`：掃描 `WORKSHOP_RECIPES[*].outputs`，顯示 recipe name 與 discipline。
- `workshop_sink`：掃描 `WORKSHOP_RECIPES[*].ingredients`，顯示 high-tier sink / routeTags / sourceHint 摘要。
- `encounter_route`：掃描 `ENCOUNTER_EVENTS` choice rewards / cue labels，顯示 route label、category label、event title 或 `requiredWorldMemoryTags`。

Route-specific materials 應至少呈現：

- 人讀材料名與來源事件 cue。
- 對應宗門或 route label。
- 對應 `sect:*:world-chapter-03`。
- 至少一條 Workshop sink。

### Skill source chips

Skill card 仍保留 profession / realm / active-passive，但額外顯示：

- formal source tier 中文 label。
- 對應秘卷的 source labels，例如凡界商店、宗門商店、宗門試煉、精英掉落、Boss 掉落、傳承。
- 若 skill 有 prerequisite，保持現有資料語意，不在圖鑑內新增 learnability 判斷。

### Sect source section

宗門 tab 的 `章節線索` 可補一段 route source summary：

- v3 world memory tag。
- route material。
- aftermath / Workshop / Reincarnation hook 的用途摘要。

這只作為可讀路線索引，不新增 quest runtime。

## Testing

- Component tests：
  - route-specific material card 顯示 `sect:*:world-chapter-03`、repeatable aftermath / encounter cue 與 Workshop sink。
  - skill card 顯示 formal source tier 與秘卷來源 labels。
  - sect panel 顯示對應宗門 route material 與 world memory tag。
- Playwright smoke：
  - desktop / mobile 開啟 Compendium，切換 item / skill / sect，確認 source chips 不造成水平溢出。
- Static gates：
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `openspec validate --all --strict`
  - `git diff --check`

## Release Notes

完成後回寫 `client-interface`、`game-mechanics` 與 `client-persistence` base specs。Archive 時若 base specs 已在 implementation commit 回寫，使用 `--skip-specs --yes` 並在 tracking docs 保留理由。
