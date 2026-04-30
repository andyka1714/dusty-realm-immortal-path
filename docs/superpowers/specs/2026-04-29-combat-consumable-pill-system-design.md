# 戰鬥丹藥與晉階丹系統設計

## 核心規則

- 回血丹、回靈丹與混合恢復丹都是戰鬥補給。
- 所有戰鬥補給丹共用 5 秒冷卻。
- 本階段不發布 `full_restore` 丹藥，避免單顆丹藥直接回滿氣血與靈力。
- 冷卻只屬於 runtime，不寫進 LocalStorage。
- 自動服丹設定屬於玩家操作偏好，需要持久化。

## 丹藥分類

- 修為丹：`gain_exp`，用於閉關 / 任務 / 煉丹補速。
- 回血丹：`heal_hp`，戰鬥中恢復氣血。
- 回靈丹：`heal_mp`，戰鬥中恢復靈力。
- 混合恢復丹：同時帶有 `heal_hp` 與 `heal_mp`，但只恢復固定數值。
- 破境輔助丹：`breakthrough_chance`，提高突破成功率，不替代必備晉階物。
- 戰鬥增益丹：`buff_stat`，短時間提高體魄、悟性或神識等屬性。
- 壽元 / 特殊丹：`lifespan` 或後續特殊效果。

## 晉階丹 / 晉階物

每個大境界突破仍使用 `BREAKTHROUGH_CONFIG.requiredItemId`。設計上，這些物品是「晉階丹或晉階靈物」，來源以同境界圓滿 Boss 為主：

- 凡人 -> 練氣：凡人 Boss 掉落 `bt_mortal_qi`
- 練氣 -> 築基：練氣 Boss 掉落 `bt_qi_foundation`
- 築基 -> 金丹：築基 Boss 掉落 `bt_foundation_gold`
- 金丹 -> 元嬰：金丹 Boss 掉落 `bt_gold_nascent`
- 元嬰 -> 化神：元嬰 Boss 掉落 `bt_nascent_spirit`
- 化神 -> 煉虛：化神 Boss 掉落 `bt_spirit_void`
- 煉虛 -> 合體：煉虛 Boss 掉落 `bt_void_fusion`
- 合體 -> 大乘：合體 Boss 掉落 `bt_fusion_maha`
- 大乘 -> 渡劫：大乘 Boss 掉落 `bt_maha_trib`
- 渡劫 -> 仙人：渡劫 Boss 掉落 `bt_trib_immortal`
- 仙人 -> 仙帝：仙人 Boss 掉落 `bt_immortal_emperor`

Boss 掉落系統已有「Boss drop table 中突破物必定掉落」規則，本 change 會補 regression 讓這個規則不再只是程式註解。

## 自動服丹

預設設定：

- HP 自動服丹：開啟，低於 45% 觸發。
- MP 自動服丹：關閉，低於 25% 觸發。

選藥規則：

1. HP 與 MP 同時低時，優先使用同時帶有 `heal_hp` 與 `heal_mp` 的混合恢復丹。
2. HP 低時，找回血丹。
3. MP 低時，找回靈丹。
4. 同類丹藥優先使用恢復量最接近缺口的丹藥。

## Persistence

新增 `adventure.autoConsumableSettings`：

```ts
{
  hp: { enabled: boolean; thresholdPercent: number },
  mp: { enabled: boolean; thresholdPercent: number }
}
```

閾值限定在 10 到 90。舊存檔缺欄位時補預設值，非法 shape 清回預設。
