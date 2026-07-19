# 素材生產清單（pilot → 批次）

| 類別 | Pilot | 批次規則 | Runtime 形態 |
|---|---|---|---|
| 玩家／NPC | 玩家 3/4 三視圖、村長 | 每角色 idle/walk/attack | frames PNG |
| 怪物 | 守山靈虎、蜥蜴 | 前／後／側，左右鏡像 | frames PNG |
| 地圖 | 仙緣鎮 | base + props + collision | layered raster |
| 技能 | 劍訣、回春術 | 64px 圖示 + 3 段特效 | icon/effect |
| 物品 | 靈石、草藥 | silhouette 清楚、少文字 | icon |
| 裝備 | 鐵劍 | 同圖跨品階，框／光暈區分 | icon + tier overlay |
| UI | 主框、彈窗、HUD | 紙張、墨線、投影 token | CSS/SVG/raster |

正式包只接受 runtime frames、必要圖示與 fallback；prompt、raw sheet、GIF、QC 與 metadata 留在 source/archive。
