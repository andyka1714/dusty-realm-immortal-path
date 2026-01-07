# 世界觀與地圖設計 (World Design)

塵寰仙途 (Dusty Realm Immortal Path) 的世界極為遼闊，分為多個修煉境界區域。為了方便管理，地圖詳細資料已拆分為以下文檔：

## 地圖詳細資料 (Detailed Map Data)

請點擊下方鏈接查看各境界的地圖詳情、連接關係與 Boss 資訊：

- **01. [凡人與練氣期 (Mortal & Qi Refining)](./maps/01_mortal_qi.md)**
  - Maps 0-19: 青雲仙宗、仙緣鎮、萬獸林、北天門關等。

- **02. [築基期 (Foundation Establishment)](./maps/02_foundation.md)**
  - Maps 20-34: 雪線古道、熔岩流道、沉沒石塔、狂獸巢穴等。

- **03. [金丹期 (Golden Core)](./maps/03_golden_core.md)**
  - Maps 35-42: 迷霧幻海、腐蝕灘塗、古禁制廢墟、萬妖石窟等。

- **04. [元嬰期 (Nascent Soul)](./maps/04_nascent_soul.md)**
  - Maps 43-48: 荒古遺地、萬法枯竭荒漠、不朽帝尊陵等。

- **05. [化神期 (Spirit Severing)](./maps/05_spirit_severing.md)**
  - Maps 49-51: 碎星浮空島、乾坤倒置界、九天劫海。

- **06. [煉虛期 (Void Refining)](./maps/06_void_refining.md)**
  - Maps 52-54: 虛無裂隙、元神試煉場、太虛幻境。

- **07. [合體期 (Fusion)](./maps/07_fusion.md)**
  - Maps 55-57: 空間崩壞裂縫、天罰之巔、虛空樞紐。

- **08. [大乘期 (Mahayana)](./maps/08_mahayana.md)**
  - Maps 58-59: 墜星之地、星辰盡頭。

- **09. [渡劫期 (Tribulation)](./maps/09_tribulation.md)**
  - Maps 60-61: 劫雲深處、天道祭壇。

- **10. [仙界 (Immortal & Beyond)](./maps/10_immortal.md)**
  - Maps 62-67: 飛昇台、長生仙域、九重天闕、混沌源頭、彼岸終點。

## 怪物分佈邏輯 (Enemy Distribution)

怪物根據地圖名稱自動生成 (Auto-populate) 以保持多樣性與合理性：

- **林/木**: 對應 `wind_wolf` (疾風野狼), `flower_spirit` (採花小妖)。
- **谷/崖/土**: 對應 `poison_bee` (吸血毒蜂), `stone_spirit` (巡山石精)。
- **湖/水**: 對應 `water_ghost` (水鬼), `koi` (錦鯉)。
- **火/熔**: 對應 `fire_ant` (火蟻), `fire_charm` (火魅)。
- **塚/屍**: 對應 `corpse` (腐屍), `ghost` (冤魂)。
- **星/空**: 對應 `void_ripper` (撕裂者), `star_fragment` (碎星靈)。
