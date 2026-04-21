## Context

目前專案的 battle core、world strike、timeline replay 已經完成多輪收斂，地圖場景也已經有第一版即時戰鬥表現：

- 同場出手與回擊
- HUD 縮到右下角
- 浮動傷害數字
- 第一版投射物 / 聚氣圈 / 範圍圈 / 受擊爆點

但這些表現還偏分散，沒有被明確定義成正式的「地圖內即時戰鬥呈現」能力。P2 剩餘 backlog 的核心不是 battle math，而是表現層和場上行為。

## Goals

- 明確把地圖內即時戰鬥表現定義成獨立能力
- 讓血條、技能冷卻、攻擊播放、投射物、範圍提示與 AI 射程行為形成一致的需求集合
- 保持在現有 `PixiJS` / 2D-2.5D 路線，不開啟全面 3D 重寫

## Non-Goals

- 不處理 battle core 數學或高境界技能語意
- 不做 `Three.js` 全場景重構
- 不把所有美術表現一次拉到最終品質

## Decisions

- 這條主線只針對地圖內同場即時戰鬥表現，不再回頭改 battle modal / timeline 結算架構
- 優先把「可讀性與主流程完整性」補齊，再處理更細的視覺 polish
- 以 `AdventureStage / visualEffects / combat HUD` 為主戰場，讓特效與 AI 表現圍繞這層收斂

## Risks / Trade-offs

- 若把表現層和 AI 行為一起拉太大，容易再次變成大雜燴
  - Mitigation: 任務拆成 HUD/播放、AI/射程、文件同步三批
- 若過早引入 3D 原型，會讓實作焦點偏離主流程
  - Mitigation: 在 spec 明確排除全面 3D 重寫

## Migration Plan

1. 先補正式 spec，定義同場即時戰鬥表現的完成條件
2. 再依 tasks 拆成 HUD/冷卻/血條、AI/射程、投射物/Boss 圈三批
3. 最後同步 `combat.md` 與 3D 評估文件，讓規劃與實作對齊
