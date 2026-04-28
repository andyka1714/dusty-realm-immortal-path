# 裝備與功法圖鑑體驗一致化設計

## 背景

`功法神通` 已經依 `通用 / 劍修 / 體修 / 法修` 分頁，`裝備法寶` 仍只依境界列出全部裝備。兩個 tab 都是在查詢角色養成資料，但目前資訊架構與配色不一致，使用者在裝備與功法之間切換時需要重新理解版面。

## 目標

1. `裝備法寶` 增加 `通用 / 劍修 / 體修 / 法修` 分頁，和 `功法神通` 一致。
2. `功法神通` 改用和 `裝備法寶` 相同的 amber header、summary 與 realm heading 色系。
3. 兩個 tab 保留相同的卡片節奏：分類列、描述、來源追蹤與境界分段。

## 設計

裝備分類使用既有 `EQUIPMENT_REALM_AUDIT` 推導，不新增 item schema。凡人期裝備歸為 `通用`；練氣期以上依 audit 中的路線分成劍修、體修、法修。若未來新增通用裝備，只要進入 audit 的 `general` path 即可被同一套 UI 顯示。

`CompendiumModal` 新增 `activeEquipmentProfession` state 與 `initialEquipmentProfession` 測試入口。裝備 tab 上方顯示和功法相同的 segmented buttons，summary 顯示目前分類與件數。功法 tab 不改資料邏輯，只把 indigo 色系改成 amber，讓兩者視覺語言一致。

## Persisted State

此 change 只調整圖鑑 UI 與從既有 catalog/audit 推導分類，不新增 persisted state，不需要 migration。

