## 1. 規格與測試

- [ ] 1.1 驗證 OpenSpec change
- [ ] 1.2 補強裝備境界 audit regression
- [ ] 1.3 檢查三職業裝備 progression 是否缺境界

## 2. 實作

- [ ] 2.1 補齊缺失境界或職業裝備 metadata
- [ ] 2.2 確認煉器 recipe output 和裝備 template id 對齊
- [ ] 2.3 更新追蹤文件，記錄不需要 migration 的理由

## 3. 驗證

- [ ] 3.1 Run `npm test -- data/items/equipment/equipmentAudit.test.ts`
- [ ] 3.2 Run `npx tsc --noEmit`
- [ ] 3.3 Run `openspec validate add-equipment-item-line --strict`
