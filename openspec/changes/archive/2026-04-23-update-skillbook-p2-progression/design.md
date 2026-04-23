## Context

目前技能書系統已經從「自動送技能」改成「消耗秘卷學技能」，但 acquisition 規則仍過於粗糙：

- `formalSourceTier` 只夠表達主要投放渠道，不夠表達 progression layer
- `manuals.ts` 雖然能生成技能書，但 UI / 任務 / 測試仍各自推斷來源
- 商店文案已寫成「可先購得秘卷，待符合條件後再參悟」，但實際列表仍先把高境界技能書隱藏

## Goals

- 讓正式技能池能導出更細的 acquisition tier
- 讓技能書 item / registry 攜帶一致的來源與限制 metadata
- 讓技能書相關 UI 顯示與測試都吃同一套資料

## Non-Goals

- 不在這次變更中處理即時戰鬥的同場攻擊播放
- 不在這次變更中大改高境界技能數值或效果描述
- 不重做整個任務系統或商店系統

## Decisions

- 不新增第二套手寫技能書表；仍以正式 `core` 技能池自動生成
- acquisition tier 由既有 `formalSourceTier + minRealm` 導出，而不是再為每招技能多存一組獨立欄位
- 技能書 item 直接攜帶 `manualSkillId / manualAcquisitionTier / manualSourceTypes / prerequisiteSkillIds`
- 宗門試煉獎勵改成由正式技能池查出「練氣主動核心技能」對應的秘卷
- 商店允許先顯示並購買未達境界的技能書，但參悟仍由 `consumeItem -> learn_skill` 檢查職業 / 境界 / 前置

## Risks / Trade-offs

- `ShopPanel` 顯示更多未達境界技能書後，資訊量會增加
  - Mitigation: 補 acquisition tier / 前置條件文案，讓玩家知道是「可先買、不能先學」
- acquisition tier 是推導值，不是手填欄位
  - Mitigation: 在測試中明確驗證 tier index 與 registry 對齊

## Migration Plan

1. 先補型別與技能池 acquisition helper
2. 再把 manuals / quests / UI 改成吃同一份 metadata
3. 最後補測試與文件
