# Design: 圖鑑分類與瀏覽版面

## Context

`CompendiumModal` 是正式 `GameShell` 內的資料查詢入口，目前以單一大型 modal 承接多個 tab。既有資料已具備足夠 metadata：物品有 `category / subType / minRealm / quality`，技能有 `profession / minRealm / type / formalSourceTier`，宗門資料可由三宗對應的 formal core skills 與 map-local NPC 組出。這條 change 的重點是重組瀏覽方式，不是新增資料來源。

## Goals

- 讓 `神兵法寶` 不再被 sticky section title 蓋住卡片。
- 讓 `功法神通` 可以先按職業，再按境界掃描。
- 讓 `宗門傳承` 以三宗 tabs 聚焦單一宗門，減少 mobile 長頁負擔。
- 沿用 shared UI primitive 與現有 `Button / Tabs` 風格。

## Non-Goals

- 不新增技能、物品、宗門任務或 NPC。
- 不更動 `FORMAL_CORE_SKILLS_BY_PROFESSION`、skill pool registry 或 item catalog。
- 不新增 LocalStorage 欄位或 persisted UI preference。

## UI Structure

### 神兵法寶

- 保留「按境界分組」的資訊，但 section heading 不使用 `sticky top-0`。
- 可採用上方 realm filter 或一般 section header；mobile 下必須不遮住第一張卡。
- item card 保留品質、類型、描述與掉落來源 cue。

### 功法神通

- 新增本 tab 內的 profession tabs：`通用 / 劍修 / 體修 / 法修`。
- 每個 profession view 內按 `minRealm` 由低到高分組。
- 每張 skill card 顯示主動/被動、境界、來源層級與描述。來源層級由 `formalSourceTier` 轉為中文 label。
- 若某 profession 無資料，顯示空狀態，不回退到全量平鋪。

### 宗門傳承

- 新增 sect tabs：`凌霄劍宗 / 萬獸山莊 / 縹緲仙宮`。
- 單一 sect view 分成三段：`宗門人物`、`傳承功法`、`章節線索`。
- `傳承功法` 按境界分組，來源資料仍使用對應 profession 的 formal core skills。
- `章節線索` 初版可從既有 map / quest / docs 對應到 route chapter 文案；若實作時沒有穩定 selector，可先顯示靜態已落地章節摘要，不新增 quest engine。

## Testing

- React render test：切到 `item` tab 時，第一個 item card 不應在 section title 之前被遮蔽或缺失。
- React render test：切到 `skill` tab 後可看到 profession tabs，且劍修 view 不顯示體修技能。
- React render test：切到 `sect` tab 後預設只顯示一宗內容，切換 tab 後內容替換。
- Playwright smoke：desktop 與 mobile 開啟圖鑑，依序切換 item / skill / sect，確認沒有水平溢出、主要標題與第一張卡可見。

## Release Notes

- Base spec update: 完成後把 `client-interface` 的圖鑑可讀性要求吸收進正式 spec，再 archive。
- Validation: `openspec validate update-compendium-taxonomy-and-layout --strict`、targeted component tests、Compendium Playwright smoke、`npm run typecheck`、`npm run build`、`git diff --check`。
