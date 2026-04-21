# Pixel Map + Text Entity Design

## Context

`evaluate-pixel-art-vertical-slice` 已經完成第一版 runtime prototype 與 web/mobile 驗證，但原本的文件與 prototype 還假設玩家、NPC、怪物會一起像素化成 sprite。這和目前專案真正保留下來的優勢不一致。

這個專案的世界閱讀感本來就偏文字遊戲：

- 場上角色、功能點與互動物件本來就適合用單字辨識
- HUD 與 target cue 已經承接了大部分語意
- 若把玩家 / 怪物硬做成像素 sprite，反而會把目前清楚的閱讀方式推回傳統像素 RPG

因此這一輪不是把 pixel prototype 回退，而是把方向收斂成 hybrid：

- 地圖、地景與戰鬥 cue 像素化
- 玩家、NPC、怪物維持文字 token
- HUD 與 target cue 仍然是主要語意來源

## Goals

- 把像素化範圍明確限制在地圖、地景與場景 cue
- 把玩家 / NPC / 怪物改成一致的文字 token 視覺，而不是 debug label 或像素 sprite
- 保留既有 preview harness、效能量測與 web/mobile 驗證入口

## Non-Goals

- 不把正式 `AdventureStage` 改成文字 token
- 不在這輪擴張到完整像素 UI rollout
- 不引入新的 entity animation system

## Decisions

- `AdventurePixelStagePrototype` 的 terrain、portal、危險區、投射物與 target focus 保持像素化
- 玩家固定顯示 `我`
- 怪物使用名稱中的高辨識單字作為 token，例如 `鼬`、`狼`
- NPC / 功能點沿用 `商`、`匠`、`長` 這種文字牌語言
- token 的辨識優先順序固定為：`單字 > 框色 > target/status 外圈 > HUD`
- 保留目前 `?pixel-prototype-preview=1` 與 `pixel-prototype-mode=desktop|mobile` 驗證入口，避免重新做一套驗證殼

## Risks / Trade-offs

- 如果 token 樣式太接近 debug overlay，會看起來像開發模式畫面
  - Mitigation: 實作正式 token chrome，而不是只把 `PIXI.Text` 疊上去
- 如果單字抽取規則太隨機，怪物辨識會不穩
  - Mitigation: 先用穩定的 fallback 規則，必要時再補顯式映射表
- 如果 token、危險圈與狀態 cue 同時搶畫面，手機端反而更亂
  - Mitigation: 只保留最短 token、少量上方標記，主要資訊交給右側 HUD

## Success Criteria

- 像素原型畫面不再出現玩家 / 怪物 block sprite
- 桌機與手機 preview 都能看到一致的文字 token entity
- Target HUD、危險區與投射物 cue 在 token 模式下仍然可讀
- 現有 preview 測試、build、typecheck 與 OpenSpec 驗證維持通過
