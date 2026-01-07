# 01. 凡人與練氣期 (Mortal & Qi Refining)

本區域包含地圖 ID 0-19，是修仙之路的起點。

## 0. 青雲仙宗
- **Realm**: 凡人
- **Size**: 40x40
- **Position**: [0, 0]
- **Theme**: Center
- **Description**: 仙門巍峨，紫氣東來。千年護宗大陣流轉不息，隱隱傳來大道梵音，令人心神嚮往。
- **Connections**:
    - North -> 1 (宗門後山)
    - South -> 2 (仙緣鎮)
    - East -> 3 (靈湖草甸)
    - West -> 4 (外門試煉場)

## 1. 宗門後山
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [0, 1]
- **Theme**: North
- **Description**: 林深徑幽，靈藥遍地。這裡是弟子們初識草木、吞吐朝霞的靜謐之地。
- **Connections**:
    - South -> 0 (青雲仙宗)
    - North -> 5 (北郊碎石坡)
    - SouthEast -> 3 (靈湖草甸)

## 2. 仙緣鎮
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [0, -1]
- **Theme**: South
- **Description**: 紅塵滾滾，人聲鼎沸。凡人在此處仰望仙門，只求那一絲渺茫的仙緣。
- **Connections**:
    - North -> 0 (青雲仙宗)
    - South -> 6 (南郊蘆葦蕩)
    - NorthWest -> 4 (外門試煉場)

## 3. 靈湖草甸
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [1, 0]
- **Theme**: East
- **Description**: 煙波浩渺，碧草連天。微風拂過，靈湖泛起層層漣漪，似有靈鯉躍出水面。
- **Connections**:
    - West -> 0 (青雲仙宗)
    - NorthWest -> 1 (宗門後山)
    - SouthWest -> 2 (仙緣鎮)
    - South -> 7 (東郊荒塚)

## 4. 外門試煉場
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [-1, 0]
- **Theme**: West
- **Description**: 黃沙漫天，殺聲震野。石柱林立間，依稀可見無數弟子揮灑的汗水與熱血。
- **Connections**:
    - East -> 0 (青雲仙宗)
    - SouthEast -> 2 (仙緣鎮)
    - West -> 8 (萬獸林入口)

## 5. 北郊碎石坡
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [1, 1]
- **Theme**: North
- **Description**: 怪石嶙峋，荊棘叢生。此處山勢陡峭，常有猛獸出沒於亂石之間。
- **Connections**:
    - West -> 1 (宗門後山)
    - North -> 9 (猿鳴雪峰底)

## 6. 南郊蘆葦蕩
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [-1, -1]
- **Theme**: South
- **Description**: 蘆花飛雪，水澤迷離。看似平靜的盪漾深處，隱藏著致命的殺機。
- **Connections**:
    - East -> 2 (仙緣鎮)
    - South -> 12 (蘆葦腐澤區)

## 7. 東郊荒塚
- **Realm**: 凡人
- **Size**: 60x60
- **Position**: [1, -1]
- **Theme**: East
- **Description**: 斷碑殘垣，鬼火森森。昔日的戰場已被歲月掩埋，只餘下無盡的淒涼與怨念。
- **Connections**:
    - North -> 3 (靈湖草甸)
    - East -> 15 (東郊廢墟)
- **Boss**: 守塚老屍 (凡人巔峰 / 陰) @ [30, 30]

## 8. 萬獸林入口
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [-2, 0]
- **Theme**: West
- **Description**: 古木參天，遮雲蔽日。深處傳來的陣陣獸吼，彷彿在警告著所有踏入者。
- **Connections**:
    - East -> 4 (外門試煉場)
    - South -> 18 (迷影叢林)
- **Boss**: 裂風狼王 (練氣初期 / 風) @ [20, 50]

## 9. 猿鳴雪峰底
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [0, 2]
- **Theme**: North
- **Description**: 寒氣逼人，雪峰入雲。淒厲的猿聲迴盪在空谷之中，更添幾分肅殺。
- **Connections**:
    - South -> 5 (北郊碎石坡)
    - West -> 10 (雲海棧道)

## 10. 雲海棧道
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [-1, 2]
- **Theme**: North
- **Description**: 懸空棧道，步步驚心。腳下是萬丈深淵，身周是翻湧雲海。
- **Connections**:
    - East -> 9 (猿鳴雪峰底)
    - North -> 11 (北天門關)

## 11. 北天門關
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [-1, 3]
- **Theme**: North
- **Description**: 極北門戶，風雪交加。巨大的關隘聳立在風雪中，守護著通往極寒之地的道路。
- **Connections**:
    - South -> 10 (雲海棧道)
    - North -> 20 (雪線古道)
- **Boss**: 寒霜白猿 (練氣圓滿 / 冰) @ [50, 20]

## 12. 蘆葦腐澤區
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [0, -2]
- **Theme**: South
- **Description**: 淤泥遍地，毒瘴瀰漫。腐爛的氣息令人作嘔，每一步都可能驚動潛伏的毒蟲。
- **Connections**:
    - North -> 6 (南郊蘆葦蕩)
    - East -> 13 (陰風谷口)

## 13. 陰風谷口
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [1, -2]
- **Theme**: South
- **Description**: 陰風呼嘯，直刺神魂。谷口彷彿一張吞噬光明的巨口，令人不寒而慄。
- **Connections**:
    - West -> 12 (蘆葦腐澤區)
    - South -> 14 (寒潭入口)

## 14. 寒潭入口
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [0, -3]
- **Theme**: South
- **Description**: 潭水幽黑，深不可測。刺骨的寒氣撲面而來，傳說潭底有巨獸潛伏。
- **Connections**:
    - North -> 13 (陰風谷口)
    - West -> 27 (焦土小徑)
- **Boss**: 墨色水怪 (練氣圓滿 / 水/毒) @ [50, 80]

## 15. 東郊廢墟
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [2, 0]
- **Theme**: East
- **Description**: 殘桓斷壁，荒草淒淒。昔日的繁華已隨風而逝，只剩下死一般的寂靜。
- **Connections**:
    - West -> 7 (東郊荒塚)
    - North -> 16 (雷暴荒原)

## 16. 雷暴荒原
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [2, 1]
- **Theme**: East
- **Description**: 烏雲壓頂，雷蛇狂舞。狂暴的雷屬性靈氣充斥著每一寸空間，寸草不生。
- **Connections**:
    - South -> 15 (東郊廢墟)
    - East -> 17 (寂滅雷澤口)

## 17. 寂滅雷澤口
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [3, 1]
- **Theme**: East
- **Description**: 雷鳴電閃，步步驚心。這裡是雷修的修煉聖地，也是凡人的死亡禁區。
- **Connections**:
    - West -> 16 (雷暴荒原)
    - North -> 30 (陰風窟深處)
- **Boss**: 雷翼大隼 (練氣圓滿 / 雷) @ [80, 50]

## 18. 迷影叢林
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [-2, -1]
- **Theme**: West
- **Description**: 樹影婆娑，迷霧重重。光線在這裡被扭曲，極易讓人迷失方向。
- **Connections**:
    - North -> 8 (萬獸林入口)
    - West -> 19 (萬獸林外圍)

## 19. 萬獸林外圍
- **Realm**: 練氣
- **Size**: 100x100
- **Position**: [-3, -1]
- **Theme**: West
- **Description**: 妖氣瀰漫，危機四伏。強大的妖獸在此徘徊，宣誓著它們的領地主權。
- **Connections**:
    - East -> 18 (迷影叢林)
    - South -> 33 (虎嘯深林)
- **Boss**: 金睛虎王 (練氣圓滿 / 物理) @ [20, 50]
