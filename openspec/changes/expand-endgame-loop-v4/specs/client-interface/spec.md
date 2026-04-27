## ADDED Requirements

### Requirement: 終盤收束與輪迴語意可讀
介面必須 (MUST) 讓玩家分辨死亡後輪迴、主動坐化、本世收束、飛升/結局式收束與主動重開的語意差異，而不是把所有入口都呈現成同一個懲罰式重置。

#### Scenario: 主動收束入口顯示本世語意
- **WHEN** 玩家仍活著並查看 Dashboard 的主動輪迴入口
- **THEN** 介面必須顯示這是主動完成本世並進入下一世規劃
- **AND** 必須避免讓玩家誤解成死亡懲罰或無提示刪檔

#### Scenario: 輪迴大殿顯示 v4 route reward cue
- **WHEN** 玩家在輪迴大殿查看由 v4 endgame memory 解鎖或強化的 route reward
- **THEN** 卡片必須顯示對應 route identity、endgame memory source 與下一世收益
- **AND** locked 狀態必須顯示缺少的 v4 memory tag

#### Scenario: 終盤 Workshop 與 pending encounter 保持 cue 可讀
- **WHEN** 玩家查看 v4 終盤 recipe 或 pending encounter
- **THEN** 介面必須顯示 route label、source hint、memory cue 或材料 sink cue
- **AND** mobile shared panel 不得因新增 cue 產生水平溢出
