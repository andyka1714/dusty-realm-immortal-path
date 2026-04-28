## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增 character loadout reducer regression，確認測試先失敗
- [x] 1.3 新增 migration / hydrate sanitize regression，確認測試先失敗
- [x] 1.4 新增 battle skill selection regression，確認測試先失敗
- [x] 1.5 新增 SkillPanel / GameShell rendering regression，確認測試先失敗

## 2. 實作

- [x] 2.1 新增 `equippedActiveSkillId` 型別與 initial state
- [x] 2.2 新增 equip active skill reducer 與合法性檢查
- [x] 2.3 實作 persisted migration sanitize
- [x] 2.4 戰鬥選招優先使用 equipped active skill
- [x] 2.5 新增 `SkillPanel` 並讓底部 `功法` 入口開啟它

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests、typecheck、build、e2e、OpenSpec validate 與 `git diff --check`
- [x] 3.2 更新 tracking docs，記錄 persisted shape
- [x] 3.3 提交 implementation 並 archive
