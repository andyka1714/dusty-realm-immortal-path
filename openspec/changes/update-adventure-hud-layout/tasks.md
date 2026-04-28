## 1. 規格與測試

- [ ] 1.1 驗證 OpenSpec change，確認 HUD layout scope 與 migration 記錄成立
- [ ] 1.2 先新增 `GameHUD` component regression，要求角色卡顯示 avatar、Lv、HP、MP、戰力，並確認測試先失敗
- [ ] 1.3 先新增 / 擴充 `FloatingDock` 與 Playwright regression，要求 `功法 / 地圖` 入口與小型戰鬥 action wheel，並確認測試先失敗

## 2. 實作

- [ ] 2.1 擴充 `GameHUD`，使用既有 stats 與 combat power helper 推導 Lv、HP、MP、戰力
- [ ] 2.2 擴充 `FloatingDock` / `GameShell`，新增 `skills` 與 `map` 入口並保持既有面板行為
- [ ] 2.3 將 Adventure 大型 `戰鬥快捷列` 改為小型 action wheel，保留普攻、主動術式、掛機與地圖功能

## 3. 驗證與文件

- [ ] 3.1 跑 targeted component tests、Playwright smoke、typecheck、build、`git diff --check`
- [ ] 3.2 更新 priority tracking 文件，記錄本 change scope 與不需要 migration 的理由
- [ ] 3.3 完成後更新 tasks 狀態並提交
