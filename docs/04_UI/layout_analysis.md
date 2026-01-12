# 響應式佈局分析 (Layout Analysis)

## 1. 現狀問題 (Current Issues)
使用者回報在 iPad (Tablet) 裝置上，Sidebar 會遮擋住 Dialog (Modal)。
經分析，這是由於 **Stacking Context (堆疊上下文)** 導致的：
- Sidebar (`z-50`) 與 Main Content 處於同一層級。
- Modal 位於 Main Content 內部。
- 即使 Modal 設定了 `z-5000`，若 Main Content 受到 `relative`, `transform`, 或 `transition` 影響而形成獨立的堆疊上下文，Modal 就無法「跳出」Main Content 去蓋過 Sidebar。

## 2. 解決方案 (The Fix)
我們已將 `Modal` 元件重構為使用 **React Portal (`ReactDOM.createPortal`)**。
*   **原理**: Portal 會將 Modal 的 DOM 節點直接渲染在 `document.body` 下，而非原本的組件樹中。
*   **效果**: Modal 現在是 `body` 的直接子元素，其 `fixed z-[5000]` 屬性將直接相對於視窗 (Viewport) 計算，確保它永遠位於 Sidebar (`z-50`) 之上。

## 3. 裝置佈局策略 (Device Strategy)

針對不同尺寸的裝置，我們建議採取以下切分策略：

### A. 手機 (Mobile) - `< 768px`
*   **Sidebar**: 預設隱藏 (Hidden)。
*   **互動**: 點擊漢堡選單 (Menu Icon) 喚出，以 **抽屜 (Drawer)** 形式覆蓋在畫面上 (`fixed inset-0`)。
*   **主內容**: 佔滿 100% 寬度。

### B. 平板直向 (Tablet Portrait) - `768px ~ 1024px` (如 iPad)
*   **現狀**: Sidebar 預設展開 (`w-64` / 256px)。
*   **問題**: 剩餘寬度僅約 512px，可能導致內容擠壓。
*   **建議**: 
    1.  **預設收合**: 將 Sidebar 預設為收合狀態 (`w-20` / 80px)，釋放更多空間給內容。
    2.  **抽屜模式**: 若空間實在不足，可考慮將此區間也視為 Mobile 模式。
    
### C. 平板橫向 / 桌面 (Desktop) - `> 1024px`
*   **Sidebar**: 預設展開 (`w-64`)。
*   **主內容**: 擁有充足空間展示地圖與資訊面板。

## 4. 下一步優化建議 (Next Steps)
若您覺得 iPad 直向時內容過於擁擠，我們可以在 `App.tsx` 加入螢幕寬度偵測，在 `768px ~ 1024px` 區間時自動將 Sidebar 設定為 `collapsed` (收合) 狀態。

```typescript
// App.tsx 範例邏輯
useEffect(() => {
  const width = window.innerWidth;
  if (width >= 768 && width < 1024) {
    setIsDesktopSidebarCollapsed(true);
  }
}, []);
```
