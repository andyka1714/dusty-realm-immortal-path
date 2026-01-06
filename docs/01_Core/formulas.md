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

### 2.1 戰鬥轉化公式 (Derived Stats)
- **生命值 (HP)**: `RealmBaseHP + (Physique * 15)`
- **靈力值 (MP)**: `RealmBaseMP + (Insight * 10)`
- **物理攻擊 (ATK)**: `RealmBaseAtk + (RootBone * 2) + WeaponAtk`
- **靈力攻擊 (MAG)**: `RealmBaseMgk + (Insight * 2) + WeaponMag`
- **物理防禦 (DEF)**: `RealmBaseDef + (Physique * 1.5) + ArmorDef`
- **靈力防禦 (RES)**: `RealmBaseRes + (Insight * 1.5) + ArmorRes`

### 2.2 傷害計算公式
```javascript
Damage = (Attacker.Atk * Random(0.9, 1.1)) - (Defender.Def * 0.5)
```
- **最小傷害**: 1 點。
- **暴擊 (Crit)**: 機率 `Comprehension * 0.1%`，造成 1.5x 傷害。
- **閃避 (Dodge)**: 機率 `Fortune * 0.1%`，完全免疫該次傷害。

## 3. 壽元與時間系統 (Time & Lifespan)

### 3.1 時間流逝 (Global Ticker)
- **比例**: 現實 1 秒 = 遊戲 1 天 (約 6分鐘 = 1年)。
- **機制**: 無論玩家處於何種狀態 (Move, Combat, Idle)，時間皆恆定流逝。

### 3.2 壽元獲取 (Longevity)
角色初始壽命為 `100 ± 5` 歲。延長壽命的途徑如下：

#### A. 境界突破 (Breakthrough Bonus)
突破大境界時獲得 **永久壽命上限** 加成：
- **練氣 (Qi Refining)**: +50 歲
- **築基 (Foundation)**: +150 歲
- **金丹 (Golden Core)**: +300 歲
- **元嬰 (Nascent Soul)**: +600 歲
- **化神 (Spirit Severing)**: +1,200 歲
- **合體 (Fusion)**: +2,500 歲
- **大乘 (Mahayana)**: +5,000 歲
- **金仙 (Golden Immortal)**: +10,000 歲
- **仙帝 (Immortal Emperor)**: +100,000 歲 (長生久視)

#### B. 增壽丹藥 (Longevity Pills)
- **來源**: 煉丹或 Boss 掉落。
- **限制**: 角色一生僅限服用 **10 顆**。
- **機制**: 使用後直接增加當前壽元上限。
