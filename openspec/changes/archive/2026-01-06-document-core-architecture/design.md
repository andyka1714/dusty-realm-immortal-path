# Design: 純前端架構 (Frontend-Only Architecture)

## Context
「塵寰仙途 (Dusty Realm Immortal Path)」是一款純單機的放置型 RPG，沒有後端伺服器。所有的邏輯和數據都必須儲存在使用者的瀏覽器中。

## Goals
- **持久化 (Persistence)**：遊戲狀態必須在頁面重新載入後保留。
- **離線進度 (Offline Progress)**：遊戲必須能根據上次存檔至今的時間差計算收益。
- **可擴展性 (Scalability)**：架構應支援擴充遊戲系統 (Redux Slices) 而無需重寫持久化邏輯。

## Key Architecture Decisions

### 1. 數據管理 (Redux + LocalStorage)
- **單一信任源 (Single Source of Truth)**：Redux Store。
- **持久化策略**：
  - 以 `localStorage` 作為資料庫。
  - **存檔 (Save)**：訂閱 Store 變更 (Debounce 1000ms) -> `JSON.stringify` -> 寫入 localStorage。
  - **讀檔 (Load)**：App 掛載 (Mount) 時 -> `JSON.parse` -> Hydrate 回 Redux 初始狀態。
- **離線計算**：
  - 在 State 中記錄 `lastSaveTime`。
  - 載入時計算 `Date.now() - lastSaveTime`。
  - 根據經過的時間差模擬修煉 Tick 並發放經驗值。

### 2. UI/功能風格
- **框架**：React 19 + TypeScript。
- **樣式**：Tailwind CSS (Utility-first)。
- **主題**：預設深色模式 (`bg-stone-950`)，並使用標準色票 (Amber, Emerald, Blue, Red) 對應五行。
- **組件模式**：
  - `components/`：可重用的 UI (Panels, Modals)。
  - `pages/`：功能頁面視圖。
  - `hooks/useGameLoop`：核心計時器。

## Risks
- **數據遺失**：使用者清除瀏覽器快取會導致存檔消失。
- **作弊風險**：使用者可以修改 LocalStorage。(單機遊戲可接受此風險)。
- **容量限制**：LocalStorage 約有 5MB 限制。(需限制 Log 數量以免爆滿)。
