## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change。
- [x] 1.2 新增 SkillPanel regression，確認功法取得 / 參悟 / 裝備流程提示存在。
- [x] 1.3 新增 Inventory regression，確認參悟成功 log 會提示去功法面板裝備。

## 2. 實作

- [x] 2.1 `SkillPanel` 增加「功法取得流程」區塊。
- [x] 2.2 `Inventory` 參悟技能成功 log 增加裝備提示。
- [x] 2.3 確認 ShopPanel 既有功法秘卷提示仍保留。

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests / typecheck / build / OpenSpec validate / `git diff --check`。
- [x] 3.2 更新 tracking docs，記錄不需要 migration 的理由。
- [x] 3.3 完成後 archive change。
