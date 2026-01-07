# 裝備系統 (Equipment)

裝備是提升角色戰鬥能力的核心途徑。

## 1. 部位 (EquipmentSlot)

每個角色擁有以下裝備欄位：

*   **Weapon (武器)**: 主手武器，主要提供攻擊力。
*   **Offhand (副手)**: (可選) 盾牌、法器等。
*   **Helmet (頭盔)**: 提供生命值、神識。
*   **Body (衣服/鎧甲)**: 提供護甲、生命值。
*   **Legs (護腿/鞋子)**: 提供速度、閃避。
*   **Accessory (飾品)**: 戒指、項鍊、手鐲等 (可有多個欄位)，提供特殊屬性 (如暴擊、五行加成)。

## 2. 裝備類型 (EquipmentType)

每種職業有其專屬或擅長的武器類型：

### 專屬武器 (Class Weapons)

*   **Sword (劍) - [劍修專屬]**
    *   特點：能力均衡，兼顧攻擊與防禦，自帶少量暴擊與連擊。
    *   主屬性：根骨 (RootBone) / 悟性 (Comprehension)

*   **Gauntlet (拳套) - [體修專屬]**
    *   特點：攻擊距離短但拳拳到肉，附帶高額防禦或震懾效果。
    *   主屬性：體魄 (Physique) / 力量

*   **Staff (法杖) - [法修專屬]**
    *   特點：極高的五行傷害加成，能強化法術效果，但物理攻擊極低。
    *   主屬性：神識 (Insight) / 靈力

### 防禦類 (Defense)
*   **Helmet (頭盔)**: 提供生命與抗性。
*   **Armor (鎧甲)**: 提供高額實體護甲。
*   **Bracers (護腕)**: 提供格擋或命中。
*   **Belt (腰帶)**: 提供負重(擴充背包)或生命回復。
*   **Boots (鞋子)**: 提供速度與閃避。
*   **Necklace (項鍊)**: 提供靈力上限或特殊防護。
*   **Accessory (戒指/手鐲)**: 提供暴擊、元素傷等攻擊輔助屬性。

## 3. 資料結構

```typescript
interface Equipment extends BaseItem {
  category: 'Equipment';
  slot: EquipmentSlot;
  subType: EquipmentType;
  
  // 基礎屬性 (固定詞條)
  baseStats: Partial<Record<StatType, number>>;
  
  // 隨機詞條 (根據品質決定數量)
  randomStats?: Array<{
    stat: StatType;
    value: number;
    tier: number; // 詞條品質
  }>;
  
  // 套裝效果 (可選)
  setId?: string;
  
  // 耐久度 (可選，若不打算實作可移除)
  durability: number;
  maxDurability: number;
}
```
