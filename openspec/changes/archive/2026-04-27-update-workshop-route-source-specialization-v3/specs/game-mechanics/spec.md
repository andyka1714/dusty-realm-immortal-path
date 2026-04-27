## MODIFIED Requirements

### Requirement: Workshop route material source 與專精解鎖
系統必須 (MUST) 讓高階 Workshop 材料來源與專精選擇具備可追蹤條件，而不是無成本、無路線辨識的通用開關。

#### Scenario: Route-specific material source 可追蹤
- **WHEN** 玩家透過世界事件、宗門里程碑或高境界 encounter 取得 `凌霄劍星鋼 / 縹緲星魂蓮 / 萬獸血骨殘材`
- **THEN** 系統必須保留來源 cue、route label 或 profession / realm 條件
- **AND** 不得把這些材料退化成無條件通用掉落

#### Scenario: Workshop 專精需要符合解鎖條件
- **WHEN** 玩家嘗試啟用 `Alchemy / Smithing` 專精
- **THEN** 系統必須檢查對應的熟練度、境界、材料或路線條件
- **AND** 未達條件時不得直接套用專精效果

#### Scenario: 專精切換不得繞過高階材料 sink
- **WHEN** 玩家使用已解鎖的 Workshop 專精 craft 高階 recipe
- **THEN** 專精可以影響靈石成本、熟練收益、品質 cue、副收益或 UI cue
- **AND** 不得減免或跳過 recipe 指定的 route-specific 材料消耗

#### Scenario: v3 route chapter 記憶供應高階百業分支
- **WHEN** 玩家完成三宗 v3 後段世界章節並取得 `sect:*:world-chapter-03` world memory tag
- **THEN** Workshop 必須提供可追蹤該記憶的高階 recipe branch、source hint、route tag 或 specialization cue
- **AND** 凌霄劍宗、萬獸山莊、縹緲仙宮三條路線都必須保留不同材料 sink 與輸出辨識
- **AND** 不得因承接 v3 記憶而新增第二套 Workshop persisted state
