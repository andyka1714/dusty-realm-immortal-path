# Antigravity Rules for Dusty Realm Immortal Path (塵寰仙途)

此檔案定義 Antigravity AI 在此專案工作時的規則和指引。

## 語言設定

**所有對話和文件皆使用繁體中文**，除非使用者明確要求使用其他語言。
**程式碼變數命名必須使用英文**，但註解及字串內容（如遊戲對話、日誌）必須使用繁體中文。

---

## AI 思維與行為規範

### 初始理解
- 先用自己的話理解使用者的需求，確認問題的完整背景
- 識別明確和隱含的要求 (Explicit & Implicit Requirements)
- 思考成功的結果 (Definition of Done) 應該是什麼樣子

### 多元思考
- 考慮多種可能的解決方案，不要過早承諾單一方法
- 保持多個假設處於活躍狀態
- 思考不同方案的優缺點（Trade-offs）

### 自我驗證
- 質疑自己的假設
- 測試初步結論，尋找潛在的缺陷或缺口
- 考慮邊緣情況 (Edge Cases) 和數值邊界 (Math Boundaries)
- 驗證推理的邏輯一致性，特別是修仙數值的指數成長邏輯

### 錯誤處理
- 發現錯誤時自然承認
- 解釋為什麼先前的思維不完整或不正確
- 展示新的理解是如何發展的

### 進度意識
- 保持對已完成和待完成事項的清晰意識
- 記錄目前的信心水準
- 確保所有探索都服務於最終目標

### 自然思維
- 使用自然的思維方式，而非機械化的流程
- 展現真正的問題解決過程
- 保持對問題複雜性的真實參與

---

## 專案結構

- **components/** - React UI 元件 (重用性高)
- **pages/** - 主要頁面視圖 (Dashboard, Inventory...)
- **store/** - Redux 狀態管理 (Slices, Store configuration)
- **hooks/** - 自定義 Hooks (例如遊戲迴圈 useGameLoop)
- **types.ts** - 核心型別定義 (Enums, Interfaces)
- **constants.ts** - 遊戲數值平衡與設定 (Magic Numbers 禁止出現在邏輯層)

---

## React App 開發規範

### 技術環境
- **Runtime**: Node.js
- **Framework**: React 19 (Functional Components)
- **Language**: TypeScript 5.x (Strict Typing)
- **State**: Redux Toolkit (Immer, Slices)
- **Build**: Vite 6.x
- **Styling**: Tailwind CSS (Dark Mode default)

### 常用指令
```bash
# 安裝相依套件
npm install

# 執行開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 🚨 提交前必須執行
```bash
# TypeScript 檢查 (確保無型別錯誤)
npx tsc --noEmit

# 檢查專案能否成功建置
npm run build
```

### 設計系統
- **UI 風格**：主要使用 `stone` 色系 (`bg-stone-950`, `text-stone-200`) 營造古樸修仙感。
- **五行配色**：
  - 金：`text-yellow-400`
  - 木：`text-emerald-400`
  - 水：`text-blue-400`
  - 火：`text-red-400`
  - 土：`text-amber-700`
- **Icon**：使用 `lucide-react`

---

## 領域邏輯規範 (Domain Rules)

### 數值平衡
- 所有遊戲數值（經驗值倍率、境界壽元、基礎機率）**必須在 `constants.ts` 定義**，嚴禁在元件或 Slice 中寫死 Magic Numbers。
- 計算修煉速度或戰鬥數值時，注意浮點數誤差，顯示時應使用 `Math.floor` 或 `toFixed`。
- 境界邏輯嚴格遵循 `MajorRealm` Enum 順序。

### 狀態管理 (Redux)
- 邏輯應封裝在 Slice 的 `reducers` 或 Thunks 中。
- Component 僅負責選取資料 (`useSelector`) 與發送指令 (`useDispatch`)。
- 避免在 Component 內部撰寫複雜的 `useEffect` 邏輯鏈。

---

## 重要檔案

| 用途 | 檔案路徑 |
|------|----------|
| 核心型別定義 | `types.ts` |
| 數值平衡設定 | `constants.ts` |
| 角色狀態邏輯 | `store/slices/characterSlice.ts` |
| 遊戲主迴圈 | `hooks/useGameLoop.ts` |
| 路由與佈局 | `App.tsx` |
| 代碼風格與詳規 | `.cursorrules` (Reference) |

---

## 提交規範

1. **每完成一個功能項目就提交一次**。
2. 提交訊息需清楚描述完成的工作。
3. 若修改了 `types.ts`，必須檢查所有引用的 Slice 是否有型別錯誤。
