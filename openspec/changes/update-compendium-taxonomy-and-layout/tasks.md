## 1. OpenSpec 與基線確認

- [x] 1.1 讀取 `components/Compendium/CompendiumModal.tsx`、`docs/04_UI/components.md`、`openspec/specs/client-interface/spec.md`
- [x] 1.2 確認本 change 只調整圖鑑 UI，不新增 item / skill / quest / LocalStorage schema
- [x] 1.3 驗證 `openspec validate update-compendium-taxonomy-and-layout --strict`

## 2. 圖鑑 layout 與分類重整

- [x] 2.1 先補 failing component tests：item heading 不遮第一張卡、skill profession filter、sect tab 單宗聚焦
- [x] 2.2 重構 `神兵法寶` section header，移除遮卡片的 sticky realm title 或調整為不覆蓋內容的 filter/header
- [x] 2.3 重構 `功法神通` 為 `通用 / 劍修 / 體修 / 法修` tabs，並在每個 view 內按境界分組
- [x] 2.4 重構 `宗門傳承` 為三宗 tabs，單宗 view 顯示人物、傳承功法與章節線索

## 3. Browser smoke 與文件

- [x] 3.1 補或更新 Playwright smoke：desktop/mobile 開啟圖鑑並切換 `item / skill / sect`
- [x] 3.2 更新 `docs/04_UI/components.md` 與 `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- [x] 3.3 明確記錄 schema change 為 `no`，不需要 migration

## 4. 驗證與收口

- [x] 4.1 跑 targeted component tests 與圖鑑 Playwright smoke
- [x] 4.2 跑 `npm run typecheck`、必要時 `npm run build`、`git diff --check`
- [x] 4.3 完成後更新 tasks 狀態、回寫 base spec、提交，再 archive
