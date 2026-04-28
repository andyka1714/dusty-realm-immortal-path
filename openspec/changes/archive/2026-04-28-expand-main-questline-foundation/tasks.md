## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change。
- [x] 1.2 新增 quest data regression，確認新主線存在、前置、NPC 與流程文案正確。
- [x] 1.3 確認測試在 quest / NPC 未新增時會失敗。

## 2. 實作

- [x] 2.1 新增 `tutorial_03_scripture_intro` 主線任務。
- [x] 2.2 將任務掛到 `village_scripture_keeper`。
- [x] 2.3 任務對話明確提到藏經閣、背包參悟與功法面板裝備。

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests / typecheck / build / OpenSpec validate / `git diff --check`。
- [x] 3.2 更新 tracking docs，記錄不需要 migration 的理由。
- [x] 3.3 完成後 archive change。
