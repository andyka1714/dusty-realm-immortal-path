# Runtime 素材清單與治理結果

## 已接入

- 起始地圖「仙緣鎮」：HD 紙雕 raster base，碰撞、NPC、傳送點仍沿用原本格子資料。
- 全部物品與 204 件裝備：依語義映射至 16 張紙雕核心圖示；同一裝備跨品階共用底圖。
- 全部 44 個正式核心技能：依劍、治療、火、雷與通用心法映射圖示。
- UI：Button、Dialog、Modal、行囊、技能面板與新手流程共用 paper token。
- 四足怪 pilot：三方向 × 四幀；右方向由側面鏡像，不旋轉側面圖。
- 角色、NPC、其餘怪物：保留現有 registry 與 runtime frames，待逐批替換時不改碰撞與腳底錨點。

## 品階效果

| 品階 | 底圖 | runtime 效果 |
|---|---|---|
| 下品 | 共用 | 石色邊框 |
| 中品 | 共用 | 玉色邊框與微光 |
| 上品 | 共用 | 青藍邊框與較強外光 |
| 仙品 | 共用 | 金色邊框、光暈與低速環形流光 |

`prefers-reduced-motion` 下會停用仙品流光。

## 清理規則

正式包只收 `frames/*.png` 與透明 fallback。raw sheet、GIF、prompt、QC 與 pipeline metadata 不進正式包；可回復來源存放在 `archive/asset-source-quarantine-20260718/`。現有怪物批次仍在製作中的來源沒有搬動。
