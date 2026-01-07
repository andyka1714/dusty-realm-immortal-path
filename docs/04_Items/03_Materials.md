# 材料系統 (Materials)

材料主要用於「煉丹」與「煉器」兩大生活職業系統。

## 1. 材料分類 (MaterialType)

### 煉丹材料 (Alchemy Materials)
*   **Herb (藥材/靈草)**: 煉丹主材。
    *   屬性: 五行屬性 (金木水火土)，藥性 (寒/熱/溫/平)。
*   **Monster Core (妖丹)**: 來自妖獸掉落，提供強大靈力與特殊誓詞。
    *   屬性: 妖獸階級，五行屬性。

### 煉器材料 (Crafting Materials)
*   **Ore (礦石)**: 武器與防具的主材 (如玄鐵、祕銀)。
    *   屬性: 硬度，靈導率。
*   **Monster Part (妖獸素材)**: 如狼牙、龜殼、龍鱗。
    *   用途: 賦予裝備特殊屬性 (如暴擊、反傷)。

## 2. 資料結構

```typescript
interface Material extends BaseItem {
  category: 'Material';
  subType: MaterialType;
  
  element?: ElementType; // 五行屬性
  
  // 煉丹屬性 (可選)
  alchemyPotency?: number; //藥力值
  
  // 煉器屬性 (可選)
  hardness?: number; // 硬度
  conductivity?: number; // 靈導率
}
```
