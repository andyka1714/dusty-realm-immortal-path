# 01. 凡人與練氣期 (Mortal & Qi Refining)

本階段包含遊戲起點、三大門派以及初期的修煉地圖。

## 起點 (Starting Point)

### 0. 仙緣鎮 (Xianyuan Town)
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [0, 0]
- **Theme**: Center - Town
- **Description**: 紅塵滾滾，人聲鼎沸。這裡是所有修仙者夢想開始的地方，南來北往的商旅與尋仙者在此匯聚。
- **Connections**:
    - North -> 1 (北郊荒徑 - 劍修路)
    - West -> 10 (西郊密林 - 體修路)
    - East -> 20 (東郊靈田 - 法修路)
- **NPCs**:
    - 村長 (引導)
    - 雜貨商 (基礎物資)

---

## 北方：凌霄劍宗 (Sword Path)
*風格：凜冽寒風，殘劍古道。*

### 1. 北郊荒徑
- **Realm**: 凡人
- **Position**: [0, 1]
- **Theme**: North - Wasteland
- **Description**: 離開城鎮向北的荒涼小徑，寒風漸起，路邊偶有凍死骨。
- **Connections**:
    - South -> 0 (仙緣鎮)
    - North -> 2 (劍門古道)

### 2. 劍門古道
- **Realm**: 凡人
- **Position**: [0, 2]
- **Theme**: North - Mountain Path
- **Description**: 兩側石壁如削，傳說曾有仙人試劍於此。甚至能感覺到岩石中殘留的劍意。
- **Connections**:
    - South -> 1 (北郊荒徑)
    - North -> 3 (凌霄山腳)

### 3. 凌霄山腳
- **Realm**: 凡人
- **Position**: [0, 3]
- **Theme**: North - Mountain Base
- **Description**: 抬頭仰望，可見雲端之上的宏偉宗門。想要入門，需先登上這萬級石階。
- **Connections**:
    - South -> 2 (劍門古道)
    - North -> 4 (凌霄劍宗)

### 4. 凌霄劍宗 (Sect)
- **Realm**: 練氣 (轉職點)
- **Position**: [0, 4]
- **Theme**: North - Sect
- **Description**: 群峰如劍直插雲霄，無數飛劍化作流光環繞主峰。宗門大殿懸浮於九天之上，凜冽的劍意令方圓百里妖邪退避。
- **Connections**:
    - South -> 3 (凌霄山腳)
    - North -> 5 (試劍台)
- **Features**: 劍修轉職、宗門商店、藏經閣。

### 5. 試劍台
- **Realm**: 練氣
- **Position**: [0, 5]
- **Theme**: North - Arena
- **Description**: 宗門弟子切磋之地，石台染血，見證了無數天驕的崛起。
- **Connections**:
    - South -> 4 (凌霄劍宗)
    - North -> 6 (藏劍谷)

### 6. 藏劍谷
- **Realm**: 練氣
- **Position**: [0, 6]
- **Theme**: North - Valley
- **Description**: 谷中插滿了廢棄的兵刃，每一把劍都有它的故事，等待有緣人喚醒。
- **Connections**:
    - South -> 5 (試劍台)
    - North -> 7 (萬劍塚)

### 7. 萬劍塚
- **Realm**: 練氣
- **Position**: [0, 7]
- **Theme**: North - Graveyard
- **Description**: 劍意最盛之地，也是最凶險之地。只有真正的劍修才能在此存活。
- **Connections**:
    - South -> 6 (藏劍谷)
    - North -> 30 (雪線古道 - 築基)

---

## 西方：萬獸山莊 (Body Path)
*風格：原始蠻荒，巨木叢林。*

### 10. 西郊密林
- **Realm**: 凡人
- **Position**: [-10, 1]
- **Theme**: West - Forest
- **Description**: 城鎮西側的茂密樹林，雖然不算危險，但已能聽到遠處的獸吼。
- **Connections**:
    - East -> 0 (仙緣鎮)
    - West -> 11 (蠻荒徑)

### 11. 蠻荒徑
- **Realm**: 凡人
- **Position**: [-10, 2]
- **Theme**: West - Jungle Path
- **Description**: 雜草叢生，幾乎掩蓋了路徑。這是獵人們踩出來的小道，通往危險的深處。
- **Connections**:
    - East -> 10 (西郊密林)
    - West -> 12 (獸王谷口)

### 12. 獸王谷口
- **Realm**: 凡人
- **Position**: [-10, 3]
- **Theme**: West - Valley Entrance
- **Description**: 兩側崖壁上有巨大的爪痕，空氣中瀰漫著野性的氣息。
- **Connections**:
    - East -> 11 (蠻荒徑)
    - West -> 13 (萬獸山莊)

### 13. 萬獸山莊 (Sect)
- **Realm**: 練氣 (轉職點)
- **Position**: [-10, 4]
- **Theme**: West - Sect
- **Description**: 依憑上古蠻荒巨獸的骸骨而建，巨大的圖騰柱上燃燒著不滅的獸火。鼓聲如雷，獸吼震天，空氣中瀰漫著原始狂野的氣息。
- **Connections**:
    - East -> 12 (獸王谷口)
    - West -> 14 (淬體潭)
- **Features**: 體修轉職、宗門商店 (氣血)。

### 14. 淬體潭
- **Realm**: 練氣
- **Position**: [-10, 5]
- **Theme**: West - Pool
- **Description**: 一潭赤紅的藥液，散發著刺鼻的氣味。弟子們在此浸泡，打磨肉身。
- **Connections**:
    - East -> 13 (萬獸山莊)
    - West -> 15 (百獸林)

### 15. 百獸林
- **Realm**: 練氣
- **Position**: [-10, 6]
- **Theme**: West - Deep Forest
- **Description**: 真正的獵場，每一棵樹後都可能藏著致命的捕食者。
- **Connections**:
    - East -> 14 (淬體潭)
    - West -> 16 (獸王谷)

### 16. 獸王谷
- **Realm**: 練氣
- **Position**: [-10, 7]
- **Theme**: West - Boss Area
- **Description**: 谷底據說沉睡著練氣期的獸王，挑戰它證明你的力量。
- **Connections**:
    - East -> 15 (百獸林)
    - West -> 40 (狂獸巢穴 - 築基)

---

## 東方：縹緲仙宮 (Magic Path)
*風格：迷霧沼澤，靈氣氤氳。*

### 20. 東郊靈田
- **Realm**: 凡人
- **Position**: [10, 1]
- **Theme**: East - Field
- **Description**: 曾經的靈田，如今已荒廢，但仍生長著不少具有微弱靈氣的草藥。
- **Connections**:
    - West -> 0 (仙緣鎮)
    - East -> 21 (迷霧澤)

### 21. 迷霧澤
- **Realm**: 凡人
- **Position**: [10, 2]
- **Theme**: East - Swamp
- **Description**: 終年不散的白霧，容易讓人迷失方向。腳下的泥沼深不可測。
- **Connections**:
    - West -> 20 (東郊靈田)
    - East -> 22 (靈湖草甸)

### 22. 靈湖草甸
- **Realm**: 凡人
- **Position**: [10, 3]
- **Theme**: East - Lake Side
- **Description**: 碧草如茵，遠處的湖泊波光粼粼，景色優美卻暗藏玄機。
- **Connections**:
    - West -> 21 (迷霧澤)
    - East -> 23 (縹緲仙宮)

### 23. 縹緲仙宮 (Sect)
- **Realm**: 練氣 (轉職點)
- **Position**: [10, 4]
- **Theme**: East - Sect
- **Description**: 終年雲霧繚繞，亦真亦幻。湖心島上瓊樓玉宇若隱若現，護宗大陣流轉著五彩琉璃之光，如入鏡花水月之境。
- **Connections**:
    - West -> 22 (靈湖草甸)
    - East -> 24 (試煉迷宮)
- **Features**: 法修轉職、宗門商店 (神識/法術)。

### 24. 試煉迷宮
- **Realm**: 練氣
- **Position**: [10, 5]
- **Theme**: East - Maze
- **Description**: 由幻陣構成的迷宮，考驗著弟子的神識與定力。
- **Connections**:
    - West -> 23 (縹緲仙宮)
    - East -> 25 (藥王谷)

### 25. 藥王谷
- **Realm**: 練氣
- **Position**: [10, 6]
- **Theme**: East - Valley
- **Description**: 靈氣充沛，生長著珍稀的練氣期靈草，是煉丹師的後花園。
- **Connections**:
    - West -> 24 (試煉迷宮)
    - East -> 26 (靈源仙湖)

### 26. 靈源仙湖
- **Realm**: 練氣
- **Position**: [10, 7]
- **Theme**: East - Lake
- **Description**: 湖水深處蘊含著精純的水靈氣，但也潛伏著強大的水生妖獸。
- **Connections**:
    - West -> 25 (藥王谷)
    - East -> 50 (幽暗密林 - 築基)
