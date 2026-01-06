# 遊戲數值公式 (Game Mechanics & Formulas)

## 1. 角色屬性 (Attributes)
六維屬性決定角色的基礎能力：
- **體魄 (Physique)** -> 影響 HP 上限、防禦力。
- **根骨 (RootBone)** -> 影響 基礎攻擊力、修煉基礎值。
- **神識 (Insight)** -> 影響 MP 上限、暴擊率。
- **悟性 (Comprehension)** -> 影響 突破成功率、領悟功法速度。
- **福緣 (Fortune)** -> 影響 掉寶率、閃避率、奇遇機率。
- **魅力 (Charm)** -> 影響 NPC 互動、商店折扣。

生成範圍：初始值為 10-20 (不同靈根擁有不同屬性總值)。

- **基礎值**: 六項屬性皆為 10 (總和 60)。
- **靈根加成**:
  - **雜靈根**: 總和 70 (額外分配 10 點)
  - **真靈根**: 總和 80 (額外分配 20 點)
  - **天/變異靈根**: 總和 90 (額外分配 30 點)
- **分配規則**:額外點數隨機分配至六項屬性，單項上限為 20。

## 2. 修煉系統 (Cultivation)

### 2.1 修為獲取 (Exp Gain)
每秒獲得經驗值 (Tick):
```javascript
ExpPerTick = BaseRate * RealmMult * SpiritRootMult * (1 + AttributeBonus)
```

- **BaseRate (基礎速率)**: 1.0 (受聚靈陣等級加成)
- **RealmMult (境界倍率)**:
  - 凡人: 1x
  - 練氣: 3x
  - 築基: 8x
  - 金丹: 25x
  ... (詳見 constants.ts: REALM_MODIFIERS)
- **SpiritRootMult (靈根倍率)**:
  - 天靈根: 2.5x
  - 變異靈根: 2.0x
  - 真靈根: 1.5x
  - 雜靈根: 1.0x
- **AttributeBonus**: `根骨 * 0.01` (每點根骨 +1%)

### 2.2 境界成長 (Realm Cap)
下一層所需經驗值：
```javascript
MaxExp = Base * (Growth ^ MinorRealm)
```
- **練氣期**: Base=1000, Growth=1.25
- **築基期**: Base=15000, Growth=1.15

### 2.3 突破成功率 (Breakthrough Rate)
```javascript
SuccessRate = (BaseRate * Decay) + (Comprehension * 0.002) + (Fortune * 0.001) + ItemBonus
```
- **BaseRate**: 
  - 凡人->練氣: 1.0
  - 練氣->築基: 0.9
  - 築基->金丹: 0.8 ... (每大境界 -10%)
- **Decay**: 小境界衰減 `0.95 ^ MinorRealm`
- **失敗懲罰 (Failure Penalty)**: 
  - **小境界**: 扣除 **30%** 當前經驗，有機率掉落小境界。
  - **大境界 (安全)**: 扣除 **30%** 當前經驗。
  - **大境界 (雷劫)**: 扣除 **100%** 當前經驗 (修為歸零)，但不死亡。雷系異靈根可減免風險。

## 3. 戰鬥系統 (Combat)

### 3.1 基礎公式
- **HP**: `RealmBaseHP + (Physique * 10)`
- **MP**: `RealmBaseMP + (Insight * 10)`
- **Attack (攻擊)**: `RealmBaseAtk + (RootBone * 2) + WeaponAtk`
- **Defense (防禦)**: `RealmBaseDef + (Physique * 1) + ArmorDef`

### 3.2 傷害計算
```javascript
Damage = (Attacker.Atk * Random(0.9, 1.1)) - (Defender.Def * 0.5)
```
- 最小傷害為 1。
- **暴擊 (Crit)**: 若 `Random() < Insight * 0.001`，造成 1.5x 傷害。
- **閃避 (Dodge)**: 若 `Random() < Fortune * 0.001`，免疫傷害。
