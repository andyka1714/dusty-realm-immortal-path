# 變更：收斂 P2 地圖內即時戰鬥表現層

## 為什麼

`P0` 與 `P1` 已完成，`P2` 的技能書深化子批次也已收口，但即時戰鬥表現層仍停在「第一階段距離接戰 + 基本浮字 / 投射物 / 範圍提示」。

目前剩餘問題集中在：

- 地圖內戰鬥雖已同場發生，但攻擊播放、技能冷卻、血條變化仍未完全成為主流程
- AI / 射程 / Boss 技能圈 / 投射物飛行時間還停在初版
- `13_3D渲染與戰鬥呈現評估.md` 與 `combat.md` 已有方向，但還沒有對應的正式實作主線

這批需要獨立成新的表現層子主線，避免再次和 battle core、技能書、3D 評估混在一起。

## 這次要改什麼

- 把地圖內即時戰鬥的 HUD / 血條 / 技能冷卻 / 命中播放正式收斂成主流程
- 補齊近戰追擊、遠程風箏、Boss 範圍提示與投射物飛行時間的表現需求
- 明確界定這條主線只做 `PixiJS` 同場即時戰鬥表現，不做全面 `Three.js` 3D 重寫
- 同步更新 `13_3D渲染與戰鬥呈現評估.md`、`combat.md` 與 `16_下一輪執行優先級Checklist.md`

## 影響範圍

- Affected specs: `game-mechanics`
- Affected code:
  - `pages/Adventure.tsx`
  - `components/adventure/*`
  - `store/slices/adventureSlice.ts`
  - `utils/battle*`
  - `docs/02_Gameplay/combat.md`
  - `docs/06_Balance_Audit/13_3D渲染與戰鬥呈現評估.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
