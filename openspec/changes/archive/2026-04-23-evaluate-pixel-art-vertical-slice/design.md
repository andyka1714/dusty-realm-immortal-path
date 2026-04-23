## Context

目前專案的 `Adventure` 場景已深度綁在 `PixiJS` retained scene 上，並以 `cellSize + grid coordinate + sprite / graphics overlay` 方式運作。這讓像素風成為比真 3D 更符合現狀的長期視覺方向。

前幾條主線已先完成：

1. `Spec / Persistence / Migration`
2. `輪迴轉生正式化`
3. `Workshop / Encounter` 最小閉環

因此現在適合進到下一個非純系統向的 production track：先做 `pixel-art pre-production`，但不直接全專案翻修。

## Goals

- 為像素風建立一份可以直接執行的 art bible，而不是停留在抽象描述
- 定義一個代表性 vertical slice，讓後續 prototype 不會無限擴張
- 驗證像素風是否能在 web / mobile 維持可讀性、效能與 live combat cue 前饋
- 明確定義哪些素材可以先由 agent 自主生成，哪些仍需要人工 review 或後續精修

## Non-Goals

- 不在這條變更中直接全面替換現有 `AdventureStage`
- 不在這條變更中建立完整全地圖像素資產包
- 不切到真 3D 或引入 `Three.js`
- 不在這條變更中同步擴張宗門 / 世界內容量

## Decisions

- 繼續以 `PixiJS` 作為 prototype renderer，不新增第二套 3D 技術棧
- vertical slice 只鎖定一張代表性地圖，預設為 `東郊靈田 (map 20)`，因為它尺寸小、地形清楚、容易驗證 tile / terrain cue 的第一版語言
- prototype 的最小角色組合固定為：`1` 個玩家、`1` 個近戰怪、`1` 個遠程 / 法術怪，外加傳送門與 target focus，但角色本體維持文字 token 而不是像素 sprite
- 角色 token 的最終 prototype 基線不是「一般文字方塊」，而是更接近地圖單字牌的緊湊 plaque chrome；一般目標只顯示單字，target / 高優先敵人才顯示最短名牌
- 像素資產規格固定採用：
  - 地面 tile：`16x16`
  - 主要 VFX / telegraph 單元：`16x16` 或 `32x32`
  - 桌機 stage cell：`48px (3x)`
  - 行動裝置 stage cell：`32px (2x)`
- prototype 階段允許 agent 自主生成 placeholder tiles、entity token、portal marker 與 VFX，但正式 rollout 前仍需人工 review 風格一致性

## Risks / Trade-offs

- 若 art bible 不夠具體，prototype 仍會變成邊做邊猜
  - Mitigation: 先把 tile、entity token、UI、VFX、palette、scale strategy 全寫死
- 若 vertical slice 範圍過大，會重新踩進「像素風 full rollout」的返工風險
  - Mitigation: 嚴格限制為單地圖、單玩家、兩種怪物 archetype 與一套 cue
- 若 entity 也像素化，容易把目前專案偏文字遊戲的辨識方式整個打掉
  - Mitigation: 先只像素化地圖與場景 cue，玩家 / NPC / 怪物維持文字 token
- 若全部素材都承諾自動生成，後面 production quality consistency 會失控
  - Mitigation: 在設計中區分 prototype 可自動生成與 full rollout 需 review 的資產層級
- 若 runtime scale 不是整數倍，像素畫面會模糊
  - Mitigation: prototype 明確使用 nearest-neighbor 與整數倍 scale

## Migration Plan

1. 先建立 `pixel-art art bible` 與 vertical slice 驗證清單
2. 再以隔離式 prototype 方式導入單地圖像素 stage
3. 驗證 web / mobile 可讀性、效能與 cue 完整度
4. 通過後才決定是否進下一條 `pixel-art full rollout` change
