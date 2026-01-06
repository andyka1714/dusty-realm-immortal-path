# Project Context

## Purpose
「塵寰仙途 (Dusty Realm Immortal Path)」是一款純前端、無後端伺服器的放置型修仙 RPG 網頁遊戲。玩家透過時間累積修為，突破境界，探索世界。

## Tech Stack
- **Language**: TypeScript 5.x
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Persistence**: LocalStorage

## Project Conventions

### Language Requirement
- **所有 OpenSpecs (Proposal, Design, Specs, Tasks) 必須使用繁體中文 (Traditional Chinese) 撰寫。**
- 程式碼變數、函式名稱使用英文。
- 遊戲內文案、對話、日誌使用繁體中文。

### Code Style
- Functional Components + Hooks 優先。
- 嚴格的 TypeScript 型別檢查 (No any)。
- 領域邏輯封裝在 Redux Slices 或 Custom Hooks。

### Architecture Patterns
- **Frontend-Only**: 所有邏輯在瀏覽器執行。
- **Offline Progress**: 載入時根據 `lastSaveTime` 計算離線收益。

### Git Workflow
- Commit Message 遵循 Conventional Commits (e.g., `feat(character): ...`)
- 變更前必須執行 `npx tsc --noEmit` 確保無型別錯誤。

## Domain Context
- **境界 (Realms)**: 練氣 -> 築基 -> 金丹 -> 元嬰...
- **靈根 (Spirit Roots)**: 影響修煉速度與屬性加成 (金木水火土/變異/天靈根)。
- **五行 (Five Elements)**: 相生相剋機制。
