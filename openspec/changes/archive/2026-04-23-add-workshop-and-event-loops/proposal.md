# 變更：補齊洞府百業與事件奇遇的正式日常循環

## 為什麼

`add-meta-progression-foundation` 已經把版本化存檔、輪迴轉生與 full-screen flow 正式落地，但目前產品仍缺少輪迴之後的日常 loop。

現況最明顯的缺口有三個：

1. `聚靈陣` 以外的 `煉丹 / 煉器` 仍停留在 placeholder
2. `高境界乘區表` 已把丹藥、洞府、奇遇、事件寫成正式規格，但遊戲內沒有對應 loop
3. 年歲推進目前只有 flavor log，沒有正式的選項式 encounter system 承接路線差異與資源收益

如果這條線不先補上，後續就算繼續擴宗門內容或像素風 prototype，也只會疊在一個缺少支撐型養成閉環的底盤上。

## 這次要改什麼

- 把 `聚靈陣 / 煉丹 / 煉器` 做成正式可迭代的 Workshop loop
- 建立正式 `encounter / event` pool，讓途中遭遇有選項、收益、風險與 route-specific 差異
- 讓 Workshop 與 Encounter loop 能承接高境界乘區表中的 `洞府 / 丹藥 / 奇遇 / 事件` 比例
- 同步擴充 persistence、UI 與文件，避免這批系統再次只留在 audit 文件

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `pages/Workshop.tsx`
  - `store/slices/workshopSlice.ts`
  - `store/actions/timeActions.ts`
  - `data/progression/balanceAudit.ts`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/01_修為與境界曲線審計.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
