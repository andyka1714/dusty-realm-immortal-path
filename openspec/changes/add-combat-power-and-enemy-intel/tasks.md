## 1. 規格與測試

- [ ] 1.1 驗證 OpenSpec change，確認 scope、migration 記錄與 affected specs 成立
- [ ] 1.2 先新增 `utils/combatPower.test.ts`，覆蓋角色戰力、妖獸 rank、小境界與特殊攻擊差異，並確認測試先失敗
- [ ] 1.3 先新增 / 擴充 `CompendiumModal` regression，要求妖獸卡顯示戰力、HP、攻防、元素、特招與掉落，並確認測試先失敗

## 2. 實作

- [ ] 2.1 新增 `utils/combatPower.ts`，提供角色與妖獸戰力推導、level 推導與格式化 helper
- [ ] 2.2 擴充萬界圖鑑妖獸資訊卡，保留既有掉落資訊並加入完整戰鬥情報
- [ ] 2.3 擴充 Adventure 選取目標卡，顯示妖獸戰力、攻防、弱點 / 抗性與特殊攻擊摘要

## 3. 驗證與文件

- [ ] 3.1 跑 targeted unit / component tests、Playwright smoke、typecheck、build、`git diff --check`
- [ ] 3.2 更新 gameplay / priority tracking 文件，記錄本 change scope 與不需要 migration 的理由
- [ ] 3.3 完成後更新 tasks 狀態並提交
