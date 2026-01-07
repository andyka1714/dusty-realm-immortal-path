# 物品與行囊系統設計總覽

本文件定義了修仙遊戲中的物品系統架構。物品主要分為四大類：裝備、消耗品（丹藥）、材料、功法玉簡。

## 1. 物品類別 (ItemCategory)

所有物品皆繼承自基礎介面 `BaseItem`，並根據 `category` 欄位區分：

*   **Equipment (裝備)**: 可穿戴，提供屬性加成。
*   **Consumable (消耗品/丹藥)**: 可使用，提供一次性效果或永久屬性提升。
*   **Material (材料)**: 用於煉丹、煉器。
*   **SkillBook (功法玉簡)**: 使用後學習新技能或被動功法。

---

## 2. 基礎資料結構 (BaseItem)

所有物品共有的屬性：

```typescript
interface BaseItem {
  id: string;           // 唯一標識符
  name: string;         // 顯示名稱
  description: string;  // 物品描述
  icon?: string;        // 圖示資源路徑
  
  category: ItemCategory; // 物品大類
  quality: ItemQuality;   // 物品品質/稀有度
  tier: number;           // 物品階級 (對應修仙境界 1-12)
  
  price: number;        // 基礎售價
  maxStack: number;     // 最大堆疊數 (裝備通常為 1)
}
```

## 3. 品質分級 (ItemQuality)

品質決定物品的顏色與數值潛力：

1.  **下品 (Low)** - 灰色
2.  **中品 (Medium)** - 綠色
3.  **上品 (High)** - 藍色
4.  **仙品 (Immortal)** - 金色

## 4. 屬性定義 (ItemStats)

主要用於裝備與丹藥效果：

*   **Attack Attributes**: 攻擊力, 暴擊率, 暴擊傷害, 屬性傷害加成 (金木水火土)
*   **Defense Attributes**: 生命值 (HP), 護甲 (Def), 閃避率, 減傷率, 回血速度
*   **Special Attributes**: 幸運, 悟性, 神識, 速度, 採集效率
