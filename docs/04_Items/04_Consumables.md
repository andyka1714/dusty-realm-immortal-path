# 消耗品與丹藥 (Consumables)

消耗品包括丹藥、符咒、與特殊使用物品。

## 1. 丹藥分類 (PillType)

*   **Cultivation (修為類)**: 增加修為值 (如聚氣丹)。
*   **Recovery (回復類)**: 回復 HP/MP (如回春丹)。
*   **Attribute (屬性類)**: 永久提升屬性 (如大力丸 -> 體魄+1)。
*   **Breakthrough (突破類)**: 增加突破成功率或提供護盾 (如築基丹)。
*   **Buff (戰鬥藥)**: 短時間提升戰鬥屬性 (如狂暴丹)。

## 2. 限制機制

*   **使用次數上限**: 如長生丹 (一生只能吃 5 次)。
*   **資源可用性**: `heal_hp / heal_mp / full_restore` 只有在目前 runtime 有對應可見資源時才能消耗。
*   **未落地限制**: 藥毒值與耐藥性仍是未來設計方向，本版不實作。

## 3. 資料結構

```typescript
interface Consumable extends BaseItem {
  category: 'Consumable';
  subType: ConsumableType;
  
  // 效果定義
  effects: Array<{
    type: EffectType; // HEAL, EXP, BUFF, PERMANENT_STAT
    value: number;
    duration?: number; // 持續時間 (秒)，0 為立即生效
  }>;
  
  // 限制
  cooldown?: number; // 使用冷卻
  toxicity?: number; // 增加藥毒
  maxUsage?: number; // 最大使用次數 (如長生丹)
}
```

## 4. 目前正式補給品

| ID | 名稱 | 階段 | 主要效果 | 主要來源 |
| :--- | :--- | :--- | :--- | :--- |
| `qi_pill` | 聚氣丹 | 凡人 / 練氣前期 | `gain_exp +50` | 凡人雜貨店、煉丹 |
| `heal_pill` | 回春丹 | 凡人 / 練氣前期 | `heal_hp +50` | 凡人雜貨店、低階掉落規劃 |
| `greater_heal_pill` | 玉髓回春丹 | 築基後 | `heal_hp +180` | 中期商店 / Workshop / route reward 規劃 |
| `revitalizing_pill` | 歸元丹 | 金丹後 | `full_restore` | 中後期 Workshop / route reward 規劃 |
| `foundation_pill` | 築基輔助丹 | 練氣後期 | `breakthrough_chance +10%` | 凡人雜貨店少量、煉丹 |

## 5. 使用語意

- `gain_exp / lifespan / learn_skill / buff_stat` 仍由 `characterSlice.consumeItem` 處理，成功套用後才增加 `itemConsumption`。
- `heal_hp / heal_mp / full_restore` 走 `utils/consumableEffects.ts` 的 runtime bridge。
- `heal_hp` 與 `full_restore` 目前可套用到 Adventure 即時戰鬥面板的可見 `worldPlayerHp`。
- `heal_mp` 目前沒有正式 MP runtime resource；Inventory 會顯示「目前沒有可恢復的真元資源」，不得扣道具。
- 玩家氣血已滿時，恢復品會顯示「氣血已滿」，不得扣道具。
