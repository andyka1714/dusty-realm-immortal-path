# UI 組件規範 (UI Components)

## 1. 配色系統 (Tailwind)
遵循五行配色：
- **金**: `yellow-500`
- **木**: `emerald-500`
- **水**: `blue-500`
- **火**: `red-500`
- **土**: `amber-700`

## 2. 常用組件
- **Button**: 主要按鈕使用 `amber` 色系，次要按鈕使用 `stone` 色系。
- **Modal**: 居中彈窗，背景帶 `backdrop-blur`。
- **Tooltip**: 滑鼠懸停顯示詳細資訊。

### 目前正式 UI 殼層收斂

- `GamePanel`：主遊戲大面板，已正式具備 `eyebrow + title + icon` 結構。
- `Modal`：任務、商店、突破、地圖總覽、背包確認等視窗，已開始對齊同一套 `eyebrow + title + icon` 語言。
- `GameTooltip`：角色屬性、商店、圖鑑、地圖情報等資訊浮層，已開始對齊同一套 `eyebrow + title + body + footer` 結構。
- `GameHintBubble`：操作提示、dock 切換、背包按鈕等短提示，作為輕量級懸停語言。
