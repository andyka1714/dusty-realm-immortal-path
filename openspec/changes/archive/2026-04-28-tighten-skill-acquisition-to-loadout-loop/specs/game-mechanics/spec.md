## ADDED Requirements

### Requirement: 參悟功法後必須銜接戰鬥裝備
系統必須 (MUST) 在玩家參悟主動功法後，引導玩家將該功法設為戰鬥裝備，而不是只把技能加入已學清單。

#### Scenario: 玩家在背包參悟主動功法
- **WHEN** 玩家成功使用帶有 `learn_skill` effect 的功法秘卷
- **THEN** 系統必須把功法加入已學技能
- **AND** 成功提示必須指出可到功法面板裝備主動術式參戰
