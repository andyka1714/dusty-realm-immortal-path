## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change。
- [x] 1.2 新增 Adventure shared UI smoke，確認小地圖資訊層與 action wheel 狀態 selector 存在。
- [x] 1.3 確認測試在缺少新 selector / 文案時會失敗。

## 2. 實作

- [x] 2.1 右上小地圖補上 `adventure-minimap-status`，顯示地圖、座標、附近妖獸與 Boss 狀態。
- [x] 2.2 右下 action wheel 補上 `adventure-action-wheel-status`，顯示目前目標、裝備主動功法與靈力狀態。
- [x] 2.3 調整 mobile class，降低右下狀態佔用並避開 bottom dock。

## 3. 驗證與收口

- [x] 3.1 跑 targeted e2e / typecheck / build / OpenSpec validate / `git diff --check`。
- [x] 3.2 更新 tracking docs，記錄不需要 migration 的理由。
- [x] 3.3 完成後 archive change。
