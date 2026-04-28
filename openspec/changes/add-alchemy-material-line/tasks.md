## 1. 規格與測試

- [ ] 1.1 驗證 OpenSpec change
- [ ] 1.2 新增煉丹材料 taxonomy audit regression
- [ ] 1.3 新增材料 source/sink coverage regression

## 2. 實作

- [ ] 2.1 擴充 `MaterialType` 或新增材料用途 metadata
- [ ] 2.2 在 `data/items/materials.ts` 補凡人到金丹的丹材
- [ ] 2.3 將至少一批丹材接入 Workshop recipe、商店或掉落來源
- [ ] 2.4 更新追蹤文件，記錄不需要 migration 的理由

## 3. 驗證

- [ ] 3.1 Run targeted material tests
- [ ] 3.2 Run `npx tsc --noEmit`
- [ ] 3.3 Run `openspec validate add-alchemy-material-line --strict`
