## MODIFIED Requirements

### Requirement: 宗門世界章節可發現性 v2
介面必須 (MUST) 讓玩家透過 NPC、Quest modal 或 pending encounter 看見 route chapter 的入口、進度與結果 cue。

#### Scenario: 章節入口顯示下一步
- **WHEN** 玩家符合 route chapter 條件
- **THEN** 介面必須顯示可互動的 NPC、quest 或 encounter 入口
- **AND** 玩家不得只能靠文件推測下一步去哪裡

#### Scenario: v3 後段章節顯示 map-local 入口
- **WHEN** 玩家完成 route chapter v2 並抵達 `劫雲荒原` 或 `接引仙殿`
- **THEN** 對應宗門 NPC、Quest modal 或 pending encounter 必須顯示 v3 章節路線、route label 與結果 cue
- **AND** 玩家不得只能靠地圖名稱猜測 `渡劫 -> 仙人` 的宗門承接

#### Scenario: 後期地圖顯示 local clue
- **WHEN** 玩家在圖鑑、地圖列表或地圖 NPC 互動中查看後期重點地圖
- **THEN** 介面必須能呈現該地圖的 local rumor、route-sensitive hook 與 Workshop material clue
- **AND** 玩家不得只能靠怪物掉落或外部文件理解材料來源與地區用途
