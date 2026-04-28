## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增裝備職業分類 rendering regression，確認測試先失敗
- [x] 1.3 新增功法 amber 色系 regression，確認測試先失敗

## 2. 實作

- [x] 2.1 新增裝備職業 tab state 與 initial prop
- [x] 2.2 從 `EQUIPMENT_REALM_AUDIT` 推導裝備分類
- [x] 2.3 將功法 summary / realm heading 改為 amber 色系

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests
- [x] 3.2 跑 `npm test`
- [x] 3.3 跑 `npx tsc --noEmit`
- [x] 3.4 跑 `npm run build`
- [x] 3.5 跑 `openspec validate align-compendium-equipment-skill-tabs --strict`
- [x] 3.6 跑 `git diff --check`
- [x] 3.7 更新 tasks，archive 並提交
