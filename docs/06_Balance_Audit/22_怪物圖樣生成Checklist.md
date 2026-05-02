# 怪物圖樣生成 Checklist

本文件追蹤 `BESTIARY` 內每隻怪物的獨立 `$generate2dsprite` 圖樣完成度。每隻怪物都必須各自完成 movement 與 combat 兩套圖檔，不能共用另一隻怪物的 production-ready asset。

## 判定規則

- `未生成`：asset registry 僅保留 `pending_generate2dsprite` slot，尚未完成 built-in `image_gen` raw sheet 與 processor QC。
- `待檔案檢查`：registry 已標為 `generated`，但 checklist 尚未看到完整輸出檔。
- `QC failed`：已生成但 frame containment、比例、footline、透明背景或方向動畫 QC 未通過。
- `完成`：`source=generated`、`qcStatus=passed`，且輸出資料夾包含 `raw-sheet.png`、`raw-sheet-clean.png`、`sheet-transparent.png`、`frames/`、`animation.gif`、`prompt-used.txt`、`pipeline-meta.json`、`asset.json`。
- `Pair Style QC`：movement 與 combat 都完成後，檢查兩套圖的 silhouette、palette、outline、scale、view angle、footline 與 normalized frame size 是否一致。
- `Frame size mismatch`：movement / combat 的 processor `cell_size` 不同，例如 96px 與 128px 混用。
- `Scale mismatch`：movement / combat 平均輸出高度差距超過 4%。
- `Footline mismatch`：movement / combat 平均腳底線差距超過 1px。
- `Movement duplicate frames`：movement 同一方向列的 4 格缺少足夠差異，沒有呈現左右腳或姿態交替。
- `Production-ready`：movement 與 combat 都完成，且 visual profile 明確標記為 production-ready。

## 目前摘要

- 怪物總數：265
- Movement 完成：26 / 265
- Combat 完成：26 / 265
- Production-ready：26 / 265
- 普通：174 隻，movement 完成 26，combat 完成 26，production-ready 26
- 精英：69 隻，movement 完成 0，combat 完成 0，production-ready 0
- 首領：22 隻，movement 完成 0，combat 完成 0，production-ready 0

## 逐隻清單

| ID | 名稱 | 境界 | Rank | 元素 | Archetype | Body | 尺寸 | Movement | Combat | Pair Style QC | Production-ready |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| m1_c1 | 荒徑野狗 | 凡人 | 普通 | 無 | dog | quadruped | 2x1 | 完成 | 完成 | 通過 | 是 |
| m1_c2 | 攔路劫匪 | 凡人 | 普通 | 無 | humanoid_bandit | humanoid | 1x2 | 完成 | 完成 | 通過 | 是 |
| m2_c1 | 古道劍客 | 凡人 | 普通 | 金 | swordsman | humanoid | 1x2 | 完成 | 完成 | 通過 | 是 |
| m2_c2 | 石壁壁虎 | 凡人 | 普通 | 土 | beast | quadruped | 2x1 | 完成 | 完成 | 通過 | 是 |
| m3_c1 | 巡山道童 | 凡人 | 普通 | 木 | humanoid_guard | humanoid | 1x2 | 完成 | 完成 | 通過 | 是 |
| m3_c2 | 山腳巨熊 | 凡人 | 普通 | 土 | bear | quadruped | 2x2 | 完成 | 完成 | 通過 | 是 |
| m10_c1 | 密林野豬 | 凡人 | 普通 | 土 | boar | quadruped | 2x1 | 完成 | 完成 | 通過 | 是 |
| m10_c2 | 樹梢毒蛇 | 凡人 | 普通 | 木 | serpent | serpentine | 2x1 | 完成 | 完成 | 通過 | 是 |
| m11_c1 | 蠻荒獵手 | 凡人 | 普通 | 無 | humanoid_guard | humanoid | 1x2 | 完成 | 完成 | 通過 | 是 |
| m11_c2 | 硬皮犀牛 | 凡人 | 普通 | 土 | beast | quadruped | 2x2 | 完成 | 完成 | 通過 | 是 |
| m12_c1 | 谷口守衛 | 凡人 | 普通 | 無 | humanoid_guard | humanoid | 1x2 | 完成 | 完成 | 通過 | 是 |
| m12_c2 | 嗜血蝙蝠 | 凡人 | 普通 | 火 | beast | winged | 2x1 | 完成 | 完成 | 通過 | 是 |
| m20_c1 | 田間稻草人 | 凡人 | 普通 | 木 | plant | plant | 1x2 | 完成 | 完成 | 通過 | 是 |
| m20_c2 | 偷糧碩鼠 | 凡人 | 普通 | 土 | beast | quadruped | 1x1 | 完成 | 完成 | 通過 | 是 |
| m21_c1 | 迷霧幻影 | 凡人 | 普通 | 水 | spirit | spirit | 1x2 | 完成 | 完成 | 通過 | 是 |
| m21_c2 | 沼澤水蛭 | 凡人 | 普通 | 水 | insect | low_crawler | 2x1 | 完成 | 完成 | 通過 | 是 |
| m22_c1 | 湖畔水怪 | 凡人 | 普通 | 水 | elemental | spirit | 1x2 | 完成 | 完成 | 通過 | 是 |
| m22_c2 | 草甸餓狼 | 凡人 | 普通 | 木 | wolf | quadruped | 2x1 | 完成 | 完成 | 通過 | 是 |
| m5_c1 | 劍木樁妖 | 練氣 | 普通 | 木 | plant | plant | 1x2 | 完成 | 完成 | 通過 | 是 |
| m5_c2 | 遊蕩劍魂 | 練氣 | 普通 | 金 | sword_spirit | spirit | 1x2 | 完成 | 完成 | 通過 | 是 |
| m6_c1 | 鏽劍甲蟲 | 練氣 | 普通 | 土 | insect | low_crawler | 2x1 | 完成 | 完成 | 通過 | 是 |
| m6_c2 | 斷刃狼 | 練氣 | 普通 | 金 | wolf | quadruped | 2x1 | 完成 | 完成 | 通過 | 是 |
| m7_c1 | 劍煞邪靈 | 練氣 | 普通 | 金 | sword_spirit | spirit | 1x2 | 完成 | 完成 | 通過 | 是 |
| m7_c2 | 劍塚守衛 | 練氣 | 普通 | 金 | humanoid_guard | humanoid | 1x2 | 完成 | 完成 | 通過 | 是 |
| m14_c1 | 赤血水怪 | 練氣 | 普通 | 水 | elemental | spirit | 1x2 | 完成 | 完成 | 通過 | 是 |
| m14_c2 | 蠻力巨猿 | 練氣 | 普通 | 土 | beast | quadruped | 2x2 | 完成 | 完成 | 通過 | 是 |
| m15_c1 | 鐵皮野豬 | 練氣 | 普通 | 土 | boar | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m15_c2 | 疾風豹 | 練氣 | 普通 | 木 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m16_c1 | 獅蠍獸 | 練氣 | 普通 | 火 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m16_c2 | 狂暴棕熊 | 練氣 | 普通 | 土 | bear | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m24_c1 | 幻影靈貓 | 練氣 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m24_c2 | 符紙人 | 練氣 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m25_c1 | 食藥鼠 | 練氣 | 普通 | 土 | beast | quadruped | 1x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m25_c2 | 毒荊棘妖 | 練氣 | 普通 | 木 | plant | plant | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m26_c1 | 靈水蟒 | 練氣 | 普通 | 水 | serpent | serpentine | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m26_c2 | 水靈龜 | 練氣 | 普通 | 水 | turtle | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m30_c1 | 雪原白狼 | 築基 | 普通 | 水 | wolf | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m30_c2 | 冰晶蟲 | 築基 | 普通 | 水 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m31_c1 | 冰封屍傀 | 築基 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m31_c2 | 寒冰骷髏 | 築基 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m32_c1 | 紫電靈鷲 | 築基 | 普通 | 金 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m32_c2 | 引雷石像 | 築基 | 普通 | 土 | construct | construct | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m40_c1 | 腐化鬣狗 | 築基 | 普通 | 土 | dog | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m40_c2 | 嗜血蝠群 | 築基 | 普通 | 火 | beast | winged | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m41_c1 | 鬼面蜘蛛 | 築基 | 普通 | 木 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m41_c2 | 嗜血妖花 | 築基 | 普通 | 木 | plant | plant | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m42_c1 | 火蜥蜴 | 築基 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m42_c2 | 熔岩石頭人 | 築基 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m50_c1 | 影豹 | 築基 | 普通 | 木 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m50_c2 | 奪靈毒蚊 | 築基 | 普通 | 木 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m51_c1 | 劇毒蟾蜍 | 築基 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m51_c2 | 毒液飛蛾 | 築基 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m52_c1 | 雷澤水妖 | 築基 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m52_c2 | 紫電銀鰻 | 築基 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m60_c1 | 罡風鷹 | 金丹 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m60_c2 | 風元素 | 金丹 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m61_c1 | 羽族斥候 | 金丹 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m61_c2 | 浮島翼人 | 金丹 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m62_c1 | 鎖鏈怨靈 | 金丹 | 普通 | 金 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m62_c2 | 斷罪獄卒 | 金丹 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m70_c1 | 岩石傀儡 | 金丹 | 普通 | 土 | construct | construct | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m70_c2 | 黑山甲獸 | 金丹 | 普通 | 土 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m71_c1 | 熔岩魔人 | 金丹 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m71_c2 | 炎甲蟲 | 金丹 | 普通 | 火 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m72_c1 | 五毒獸 | 金丹 | 普通 | 木 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m72_c2 | 噬毒蜈蚣 | 金丹 | 普通 | 木 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m80_c1 | 巡海夜叉 | 金丹 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m80_c2 | 風暴水母 | 金丹 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m81_c1 | 仙島靈猴 | 金丹 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m81_c2 | 靈島鹿靈 | 金丹 | 普通 | 木 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m82_c1 | 蜃氣妖 | 金丹 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m82_c2 | 迷霧海葵 | 金丹 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m90_c1 | 冰魄幽靈 | 元嬰 | 普通 | 水 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m90_c2 | 冰霜女妖 | 元嬰 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m91_c1 | 極光飛魚 | 元嬰 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m91_c2 | 天光靈 | 元嬰 | 普通 | 金 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m92_c1 | 劍意殘魂 | 元嬰 | 普通 | 金 | sword_spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m92_c2 | 鎮劍石靈 | 元嬰 | 普通 | 土 | sword_spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m100_c1 | 荒原巨人 | 元嬰 | 普通 | 土 | construct | construct | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m100_c2 | 荒地暴龍 | 元嬰 | 普通 | 土 | dragon | serpentine | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m101_c1 | 血池孽獸 | 元嬰 | 普通 | 火 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m101_c2 | 龍血蚊 | 元嬰 | 普通 | 火 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m102_c1 | 蠻荒巫衛 | 元嬰 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m102_c2 | 荒古咒柱 | 元嬰 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m110_c1 | 噬魂怪 | 元嬰 | 普通 | 水 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m110_c2 | 精神體 | 元嬰 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m111_c1 | 幽冥戰鬼 | 元嬰 | 普通 | 火 | ghost | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m111_c2 | 地煞陰卒 | 元嬰 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m112_c1 | 虛空蟲族 | 元嬰 | 普通 | 木 | insect | low_crawler | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m112_c2 | 虛空掠食者 | 元嬰 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m120_c1 | 異界魔兵 | 化神 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m120_c2 | 天界巡邏者 | 化神 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m120_c3 | 斷魂焰靈 | 化神 | 普通 | 火 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m120_c4 | 鎖界妖僧 | 化神 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m122_c1 | 斷界戍卒 | 化神 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m122_c2 | 殞橋戰傀 | 化神 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m122_c3 | 星烽殘將 | 化神 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m122_c4 | 鎮橋血衛 | 化神 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m121_c1 | 怨念集合體 | 化神 | 普通 | 水 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m121_c2 | 殘念魔刃 | 化神 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m121_c3 | 噬念鬼母 | 化神 | 普通 | 木 | ghost | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m121_c4 | 葬界骨龍 | 化神 | 普通 | 土 | dragon | serpentine | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m130_c1 | 光陰蜉蝣 | 煉虛 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m130_c2 | 溯時靈魚 | 煉虛 | 普通 | 水 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m130_c3 | 鏡界殘像 | 煉虛 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m130_c4 | 裂隙追魂獸 | 煉虛 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m132_c1 | 虛淵巡衛 | 煉虛 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m132_c2 | 界縫殘兵 | 煉虛 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m132_c3 | 虛潮法靈 | 煉虛 | 普通 | 水 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m132_c4 | 斷界牽魂使 | 煉虛 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m131_c1 | 空間吞噬者 | 煉虛 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m131_c2 | 裂空魔雲 | 煉虛 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m131_c3 | 虛空牧星者 | 煉虛 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m131_c4 | 時淵殘骸 | 煉虛 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m140_c1 | 聖城執法隊 | 合體 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m140_c2 | 玄機戰獸 | 合體 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m140_c3 | 聖城審判官 | 合體 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m140_c4 | 靈紋鎮獸 | 合體 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m142_c1 | 壇前鎮衛 | 合體 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m142_c2 | 萬靈司誥使 | 合體 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m142_c3 | 法壇靈衛 | 合體 | 普通 | 火 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m142_c4 | 靈契縛獸 | 合體 | 普通 | 水 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m141_c1 | 靈元戰體 | 合體 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m141_c2 | 暴亂靈渦 | 合體 | 普通 | 水 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m141_c3 | 混元拘魂使 | 合體 | 普通 | 火 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m141_c4 | 天穹裂殖體 | 合體 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m150_c1 | 鯤鵬幼體 | 大乘 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m150_c2 | 深海巨魷 | 大乘 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m150_c3 | 吞日海鵬 | 大乘 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m150_c4 | 深淵潮妖 | 大乘 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m152_c1 | 界海烽卒 | 大乘 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m152_c2 | 裂潮戍衛 | 大乘 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m152_c3 | 界烽戰魂 | 大乘 | 普通 | 火 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m152_c4 | 鎮潮古像 | 大乘 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m151_c1 | 天梯守門人 | 大乘 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m151_c2 | 登仙執法者 | 大乘 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m151_c3 | 登天囚徒 | 大乘 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m151_c4 | 天關鎮獸 | 大乘 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m160_c1 | 劫雷獸 | 渡劫 | 普通 | 火 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m160_c2 | 劫火鴉 | 渡劫 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m160_c3 | 劫雲巡狩者 | 渡劫 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m160_c4 | 天罰雷傀 | 渡劫 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m162_c1 | 天刑雷卒 | 渡劫 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m162_c2 | 罰獄雷鎖 | 渡劫 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m162_c3 | 天刑雷將 | 渡劫 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m162_c4 | 雷獄誅魂使 | 渡劫 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m161_c1 | 雷池金龍 | 渡劫 | 普通 | 金 | dragon | serpentine | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m161_c2 | 雷光電蛇 | 渡劫 | 普通 | 金 | serpent | serpentine | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m161_c3 | 天譴雷侍 | 渡劫 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m161_c4 | 萬劫殘龍 | 渡劫 | 普通 | 金 | dragon | serpentine | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m170_c1 | 仙界仙鶴 | 仙人 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m170_c2 | 仙宮力士 | 仙人 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m170_c3 | 巡界仙靈 | 仙人 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m170_c4 | 鎮界金人 | 仙人 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m172_c1 | 玉詔鎮卒 | 仙人 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m172_c2 | 仙獄錄魂使 | 仙人 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m172_c3 | 玉獄天鎖 | 仙人 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m172_c4 | 仙庭禁將 | 仙人 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m171_c1 | 金甲天衛 | 仙人 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m171_c2 | 天界戰鷹 | 仙人 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m171_c3 | 玉京監察使 | 仙人 | 普通 | 火 | humanoid_guard | humanoid | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m171_c4 | 天庭誅邪令 | 仙人 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m181_c1 | 太初巡環衛 | 仙帝 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m181_c2 | 本源蝕獸 | 仙帝 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m181_c3 | 太初法相 | 仙帝 | 普通 | 水 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m181_c4 | 歸源執印官 | 仙帝 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m182_c1 | 歸墟裂界卒 | 仙帝 | 普通 | 土 | dao_avatar | colossus | 2x6 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m182_c2 | 萬象鎖魂使 | 仙帝 | 普通 | 木 | spirit | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m182_c3 | 滅界熔兵 | 仙帝 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m182_c4 | 歸墟吞星獸 | 仙帝 | 普通 | 水 | dao_avatar | colossus | 2x6 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m180_c1 | 大道顯化 | 仙帝 | 普通 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m180_c2 | 混沌獸 | 仙帝 | 普通 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m180_c3 | 法則殘碑 | 仙帝 | 普通 | 木 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m180_c4 | 混元噬界體 | 仙帝 | 普通 | 火 | elemental | spirit | 1x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m3_e1 | 流浪劍師 | 凡人 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m12_e1 | 鐵甲犀牛王 | 凡人 | 精英 | 土 | beast | quadruped | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m22_e1 | 迷霧之靈 | 凡人 | 精英 | 水 | spirit | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m5_e1 | 劍氣魁儡 | 練氣 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m7_e1 | 嗜血劍魔 | 練氣 | 精英 | 火 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m15_e1 | 狂暴棕熊 | 練氣 | 精英 | 土 | bear | quadruped | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m16_e1 | 雙頭狼王 | 練氣 | 精英 | 金 | wolf | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m25_e1 | 丹爐精 | 練氣 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m26_e1 | 寒冰龜 | 練氣 | 精英 | 水 | turtle | low_crawler | 3x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m31_e1 | 寒冰巨人 | 築基 | 精英 | 水 | construct | construct | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m32_e1 | 奔雷古獸 | 築基 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m41_e1 | 樹妖姥姥 | 築基 | 精英 | 木 | plant | plant | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m42_e1 | 煉獄炎魔 | 築基 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m51_e1 | 沼澤巨鱷 | 築基 | 精英 | 水 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m52_e1 | 雷霆蜥蜴 | 築基 | 精英 | 金 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m61_e1 | 羽族戰士 | 金丹 | 精英 | 金 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m62_e1 | 鐵翼鳥王 | 金丹 | 精英 | 金 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m71_e1 | 地火龍蜥 | 金丹 | 精英 | 火 | dragon | serpentine | 3x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m72_e1 | 萬毒蛛后 | 金丹 | 精英 | 木 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m81_e1 | 護島神獸 | 金丹 | 精英 | 水 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m82_e1 | 幻海魔鯨 | 金丹 | 精英 | 水 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m91_e1 | 虛空獵手 | 元嬰 | 精英 | 金 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m92_e1 | 守劍長老魂 | 元嬰 | 精英 | 金 | sword_spirit | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m101_e1 | 龍血戰士 | 元嬰 | 精英 | 火 | dragon | serpentine | 3x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m102_e1 | 祭司亡魂 | 元嬰 | 精英 | 土 | spirit | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m111_e1 | 幽冥羅剎 | 元嬰 | 精英 | 火 | spirit | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m112_e1 | 虛空領主 | 元嬰 | 精英 | 金 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m120_e1 | 百戰魔傀 | 化神 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m120_e2 | 界墟焚天使 | 化神 | 精英 | 火 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m121_e1 | 墮落仙人 | 化神 | 精英 | 木 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m121_e2 | 怨天祭司 | 化神 | 精英 | 水 | spirit | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m122_e1 | 界橋督戰官 | 化神 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m122_e2 | 墜星焚令使 | 化神 | 精英 | 火 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m130_e1 | 歲月守衛 | 煉虛 | 精英 | 金 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m130_e2 | 時獄觀測者 | 煉虛 | 精英 | 水 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m132_e1 | 虛淵裂守 | 煉虛 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m132_e2 | 時迴觀測官 | 煉虛 | 精英 | 水 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m131_e1 | 虛空行者 | 煉虛 | 精英 | 金 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m131_e2 | 界碑吞星魔 | 煉虛 | 精英 | 土 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m140_e1 | 執法統領 | 合體 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m140_e2 | 聖壇監軍 | 合體 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m142_e1 | 法壇鎮印官 | 合體 | 精英 | 土 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m142_e2 | 靈脈誦令使 | 合體 | 精英 | 木 | spirit | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m141_e1 | 樞紐守護獸 | 合體 | 精英 | 木 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m141_e2 | 渦心鎮衛 | 合體 | 精英 | 水 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m150_e1 | 深海魔龍 | 大乘 | 精英 | 水 | dragon | serpentine | 3x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m150_e2 | 潮汐司命 | 大乘 | 精英 | 水 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m152_e1 | 界海鎮烽將 | 大乘 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m152_e2 | 孤烽斷航使 | 大乘 | 精英 | 火 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m151_e1 | 天將虛影 | 大乘 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m151_e2 | 升仙鎮碑將 | 大乘 | 精英 | 土 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m160_e1 | 滅世魔雷 | 渡劫 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m160_e2 | 劫域司雷官 | 渡劫 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m162_e1 | 天刑鎮獄官 | 渡劫 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m162_e2 | 誅命司劫使 | 渡劫 | 精英 | 火 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m161_e1 | 雷道天尊 | 渡劫 | 精英 | 金 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m161_e2 | 天劫巡界尊 | 渡劫 | 精英 | 金 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m170_e1 | 巡天仙吏 | 仙人 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m170_e2 | 巡天錄事 | 仙人 | 精英 | 木 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m172_e1 | 仙獄鎮刑將 | 仙人 | 精英 | 土 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m172_e2 | 玉京禁靈使 | 仙人 | 精英 | 木 | spirit | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m171_e1 | 鎮天神將 | 仙人 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m171_e2 | 玉京誅邪使 | 仙人 | 精英 | 火 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m181_e1 | 太初巡道使 | 仙帝 | 精英 | 金 | humanoid_guard | humanoid | 1x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m181_e2 | 歸源監印官 | 仙帝 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m182_e1 | 歸墟碎界將 | 仙帝 | 精英 | 土 | dao_avatar | colossus | 2x6 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m182_e2 | 萬象熔界司 | 仙帝 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m180_e1 | 守道者 | 仙帝 | 精英 | 金 | beast | quadruped | 2x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m180_e2 | 混元監道官 | 仙帝 | 精英 | 火 | elemental | spirit | 2x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m3_b1 | 守山靈虎 | 凡人 | 首領 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m12_b1 | 赤火猿 | 凡人 | 首領 | 火 | beast | quadruped | 3x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m22_b1 | 靈湖巨蟹 | 凡人 | 首領 | 水 | giant_crab | low_crawler | 4x2 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m7_b1 | 萬劍劍意 | 練氣 | 首領 | 金 | sword_spirit | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m16_b1 | 萬獸獸王 | 練氣 | 首領 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m26_b1 | 靈湖水蛟 | 練氣 | 首領 | 水 | serpent | serpentine | 4x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m32_b1 | 極地劍靈 | 築基 | 首領 | 金 | sword_spirit | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m42_b1 | 烈焰妖王 | 築基 | 首領 | 火 | elemental | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m52_b1 | 雷澤領主 | 築基 | 首領 | 金 | elemental | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m62_b1 | 金翅大鵬 | 金丹 | 首領 | 金 | elemental | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m72_b1 | 厄難毒體 | 金丹 | 首領 | 木 | elemental | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m82_b1 | 覆海蛟龍 | 金丹 | 首領 | 水 | dragon | serpentine | 4x3 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m92_b1 | 北寒劍尊 | 元嬰 | 首領 | 金 | sword_avatar | humanoid | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m102_b1 | 刑天殘軀 | 元嬰 | 首領 | 土 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m112_b1 | 九幽鬼帝 | 元嬰 | 首領 | 火 | ghost | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m121_b1 | 修羅魔尊 | 化神 | 首領 | 火 | elemental | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m131_b1 | 時空之主 | 煉虛 | 首領 | 金 | dao_avatar | colossus | 2x6 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m141_b1 | 靈皇 | 合體 | 首領 | 木 | spirit | spirit | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m151_b1 | 守界者 | 大乘 | 首領 | 金 | beast | quadruped | 2x1 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m161_b1 | 天道化身 | 渡劫 | 首領 | 金 | dao_avatar | colossus | 2x6 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m171_b1 | 九天仙尊 | 仙人 | 首領 | 金 | sword_avatar | humanoid | 2x4 | 未生成 | 未生成 | 待兩套完成 | 否 |
| m180_b1 | 鴻蒙道祖 | 仙帝 | 首領 | 金 | dao_avatar | colossus | 2x6 | 未生成 | 未生成 | 待兩套完成 | 否 |

## 更新方式

每完成一隻怪物的 movement 或 combat：

1. 使用 `$generate2dsprite` 以 built-in `image_gen` 產生 raw sheet，背景必須為 `#FF00FF`。
2. 使用 `$generate2dsprite` processor 做 magenta cleanup、frame splitting、alignment 與 QC。
3. 將輸出放到對應資料夾：`public/assets/generated/characters/monsters/<enemy-id>-movement-v1/` 或 `<enemy-id>-combat-v1/`。
4. QC 通過後才把 asset registry source 改為 `generated`、`qcStatus` 改為 `passed`。
5. 比對同一 enemy 的 movement / combat pair style：silhouette、palette、outline、scale、view angle 與 footline 必須一致。
6. 重新產生本 checklist，確認該怪物的 movement / combat / pair style QC / production-ready 狀態。
