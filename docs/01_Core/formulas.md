# 核心數值公式 (Core Formulas)

## 1. 修煉系統 (Cultivation)

### 1.1 修為獲取公式 (Exp Gain)
角色每秒 (Tick) 獲得的修為值計算如下：

```javascript
ExpPerTick = BaseRate * RealmMult * SpiritRootMult * (1 + AttributeBonus)
```

- **BaseRate (基礎速率)**: 預設為 `1.0` (可受聚靈陣等級加成)。
- **RealmMult (境界倍率)**: 隨大境界提升。
  - 凡人: 1x
  - 練氣: 3x
  - 築基: 8x
  - 金丹: 25x (詳見 `constants.ts` 完整列表)
- **SpiritRootMult (靈根倍率)**:
  - 天靈根: 2.5x
  - 變異靈根: 2.0x
  - 真靈根: 1.5x
  - 雜靈根: 1.0x
- **AttributeBonus (屬性加成)**: `根骨 (RootBone) * 0.01` (即每點根骨 +1%)。

### 1.2 境界成長 (Realm Cap)
升級至下一層小境界所需的經驗值：

```javascript
MaxExp = Base * (Growth ^ MinorRealm)
```
- **練氣期**: Base=1000, Growth=1.25
- **築基期**: Base=15000, Growth=1.15

### 1.3 突破成功率 (Breakthrough Rate)
嘗試突破境界時的成功率計算：

```javascript
SuccessRate = (BaseRate * Decay) + (Comprehension * 0.002) + (Fortune * 0.001) + ItemBonus
```

- **BaseRate**: 基礎機率，隨大境界提升遞減 (練氣100% -> 築基90% -> 金丹80%...)。
- **Decay**: 小境界衰減係數 `0.95 ^ MinorRealm` (層數越高越難)。
- **屬性加成**: 
  - 悟性 (Comprehension): 每點 +0.2%
  - 福緣 (Fortune): 每點 +0.1%
- **ItemBonus**: 使用破境丹藥提供的額外機率。

### 1.4 突破失敗懲罰 (Breakthrough Penalty)
若突破失敗，根據類型執行以下懲罰：
- **小境界**: 扣除 **30%** 當前修為，有機率掉落一層小境界。
- **大境界 (安全)**: 扣除 **30%** 當前修為。
- **大境界 (雷劫)**: 扣除 **100%** 當前修為 (修為歸零)，但不觸發死亡。雷系異靈根可減免部分風險。

## 2. 戰鬥系統 (Combat)

### 2.1 衍生屬性公式
- **HP (氣血)**: `RealmBaseHP + (Physique * 10)`
- **MP (靈力)**: `RealmBaseMP + (Insight * 10)`
- **Attack (攻擊)**: `RealmBaseAtk + (RootBone * 2) + WeaponAtk`
- **Defense (防禦)**: `RealmBaseDef + (Physique * 1) + ArmorDef`

### 2.2 傷害計算公式
```javascript
Damage = (Attacker.Atk * Random(0.9, 1.1)) - (Defender.Def * 0.5)
```
- **最小傷害**: 1 點。
- **暴擊 (Crit)**: 機率 `Insight * 0.1%`，造成 1.5x 傷害。
- **閃避 (Dodge)**: 機率 `Fortune * 0.1%`，完全免疫該次傷害。
