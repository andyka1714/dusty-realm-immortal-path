## 1. 規格與設計

- [x] 1.1 寫入素材管線設計文件
- [x] 1.2 建立 OpenSpec change
- [x] 1.3 驗證 OpenSpec change

## 2. Asset Registry

- [x] 2.1 新增 registry RED tests
- [x] 2.2 新增 `AssetDefinition` 型別
- [x] 2.3 新增 `assetRegistry`、lookup 與 fallback
- [x] 2.4 註冊男性凡人主角素材 metadata

## 3. 素材生成

- [x] 3.1 寫入 `$generate2dsprite` prompt
- [x] 3.2 生成 raw 4x4 walk sheet
- [x] 3.3 後處理透明 sheet、frames 與 GIF
- [x] 3.4 更新 `pipeline-meta.json`

## 4. 驗證

- [x] 4.1 跑 targeted tests
- [x] 4.2 跑 typecheck / build
- [x] 4.3 跑 OpenSpec validate 與 `git diff --check`

## 5. 地圖接入

- [x] 5.1 新增玩家 sprite 動畫 frame selection tests
- [x] 5.2 將 `character.player.mortal_male.v1` 接進官方 Adventure 地圖玩家渲染
- [x] 5.3 靜止時使用目前朝向 idle frame，移動時才播放 walk cycle
- [x] 5.4 保留原文字 token 作素材載入失敗 fallback

## 6. 性別素材切換

- [x] 6.1 生成並後處理女性凡人 4x4 walk sheet
- [x] 6.2 註冊 `character.player.mortal_female.v1`
- [x] 6.3 依 `character.gender` 選擇男性或女性角色素材
- [x] 6.4 保留同一套 idle / moving 動畫規則

## 7. 戰鬥動作

- [x] 7.1 生成男性與女性凡人 2x3 木劍戰鬥動作 sheet
- [x] 7.2 註冊 `character.player.mortal_male.combat_v1` 與 `character.player.mortal_female.combat_v1`
- [x] 7.3 戰鬥中切換到 combat sheet 並依出手節奏切 frame，非戰鬥時切回 walk sheet
- [x] 7.4 玩家未移動時不再使用呼吸縮放動畫
