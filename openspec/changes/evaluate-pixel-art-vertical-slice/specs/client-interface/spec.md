## ADDED Requirements
### Requirement: 像素風視覺基線與垂直切片
系統必須 (MUST) 在全面切換像素風前，先建立正式的像素風 art bible 與可操作的 representative vertical slice。

#### Scenario: 像素風 art bible 可供執行
- **WHEN** 團隊決定評估像素風方向
- **THEN** 必須有一份正式文件定義 tile、sprite、UI、VFX、palette、scale 與 HUD 疊層規格
- **AND** 文件必須同時包含 web / mobile 的顯示策略，而不是只描述桌機畫面

#### Scenario: 像素風垂直切片可操作
- **WHEN** 玩家進入指定的 prototype 場景
- **THEN** 介面必須以同一套像素語言渲染地圖、玩家、怪物、傳送門與 HUD
- **AND** 不得只提供靜態 mockup 或單張截圖

#### Scenario: 行動裝置像素縮放保持清晰
- **WHEN** prototype 場景在行動裝置尺寸運行
- **THEN** 必須維持整數倍縮放與可讀的 HUD
- **AND** 不得因平滑縮放或版面擁擠而讓畫面變糊或資訊不可讀
