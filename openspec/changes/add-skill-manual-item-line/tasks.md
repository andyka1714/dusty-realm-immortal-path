## 1. 規格與測試

- [ ] 1.1 驗證 OpenSpec change
- [ ] 1.2 新增或補強功法秘卷 coverage regression
- [ ] 1.3 確認每本 formal core manual 都有可追蹤來源

## 2. 實作

- [ ] 2.1 補齊功法秘卷 metadata audit
- [ ] 2.2 確認藏經閣、任務、掉落與傳承來源都能被圖鑑反查
- [ ] 2.3 更新物品線追蹤文件，記錄不需要 migration 的理由

## 3. 驗證

- [ ] 3.1 Run `npm test -- data/skills/skillBookCoverage.test.ts data/skillManualRouting.test.ts`
- [ ] 3.2 Run `npx tsc --noEmit`
- [ ] 3.3 Run `openspec validate add-skill-manual-item-line --strict`
