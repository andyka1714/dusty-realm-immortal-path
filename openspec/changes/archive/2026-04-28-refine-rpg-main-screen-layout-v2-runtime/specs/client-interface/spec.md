## ADDED Requirements

### Requirement: RPG 主畫面 Layout v2 必須有 runtime 狀態層
介面必須 (MUST) 在 Adventure 主畫面提供穩定的右上小地圖資訊層與右下戰鬥功法快捷狀態，讓 layout v2 不只停留在規格描述。

#### Scenario: 玩家在主畫面查看地圖與戰鬥狀態
- **WHEN** 玩家進入 Adventure 主畫面
- **THEN** 右上小地圖必須顯示目前地圖、座標、附近妖獸與 Boss 狀態
- **AND** 右下 action wheel 必須顯示目前目標、裝備主動功法與靈力可用狀態
- **AND** mobile viewport 下任務入口、底部 dock 與戰鬥快捷不得互相遮擋
