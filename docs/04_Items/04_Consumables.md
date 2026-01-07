# 消耗品與丹藥 (Consumables)

消耗品包括丹藥、符咒、與特殊使用物品。

## 1. 丹藥分類 (PillType)

*   **Cultivation (修為類)**: 增加修為值 (如聚氣丹)。
*   **Recovery (回復類)**: 回復 HP/MP (如回春丹)。
*   **Attribute (屬性類)**: 永久提升屬性 (如大力丸 -> 體魄+1)。
*   **Breakthrough (突破類)**: 增加突破成功率或提供護盾 (如築基丹)。
*   **Buff (戰鬥藥)**: 短時間提升戰鬥屬性 (如狂暴丹)。

## 2. 限制機制

*   **藥毒值 (Toxicity)**: 每次服藥累積毒性，過高會降低藥效或無法服用。
*   **耐藥性 (Resistance)**: 同種丹藥吃多後效果遞減。
*   **使用次數上限**: 如長生丹 (一生只能吃 5 次)。

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
