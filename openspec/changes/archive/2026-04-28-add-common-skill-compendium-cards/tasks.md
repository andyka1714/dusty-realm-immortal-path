## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增功法卡片樣式 regression，確認測試先失敗
- [x] 1.3 新增通用功法 catalog regression，確認測試先失敗
- [x] 1.4 新增通用主動功法裝備 / 戰鬥選招 regression，確認測試先失敗

## 2. 實作

- [x] 2.1 新增正式通用功法資料
- [x] 2.2 將通用功法納入 formal core indexes、秘卷與來源
- [x] 2.3 允許通用主動功法被任一職業裝備與戰鬥選用
- [x] 2.4 將功法卡片調整為接近裝備卡片的版型

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests
- [x] 3.2 跑 `npx tsc --noEmit`
- [x] 3.3 跑 `npm run build`
- [x] 3.4 跑 `openspec validate add-common-skill-compendium-cards --strict`
- [x] 3.5 跑 `git diff --check`
- [x] 3.6 更新 tasks，提交並 archive
