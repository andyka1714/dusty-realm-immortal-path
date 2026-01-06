---
description: 提交專案變更到 Git
---

# Commit Changes

## 使用方式

```bash
/commit-changes
```

## 執行流程

### 1. 檢查專案狀態
```bash
git status
```

### 2. 驗證代碼品質 (Pre-commit Check)
在提交前，必須確保專案可建置且無型別錯誤。
```bash
# 1. TypeScript 檢查
npx tsc --noEmit

# 2. 建置檢查 (確保沒有 Build Errors)
npm run build
```
若上述步驟失敗，**必須**先修復錯誤再進行提交。

### 3. 分析變更
```bash
git diff          # 檢視詳細變更
git diff --staged # 檢視已暫存的變更
```

### 4. 處理提交
1. 評估是否需要提交（排除臨時檔案、建置產物 `dist/`）
2. 暫存相關檔案 (`git add`)
3. 若使用者未提供 `message`，則根據變更內容生成符合規範的提交訊息
4. 建立提交 (`git commit`)

## 提交訊息格式

遵循 Conventional Commits 規範：
```
<type>(<scope>): <簡短描述>
```

### Type 類型：
- `feat`: 新功能 (Game Feature, UI)
- `fix`: 錯誤修復
- `refactor`: 重構 (Code style, Logic improvement)
- `style`: 格式調整 (Tailwind classes, Formatting)
- `docs`: 文件更新 (README, Specs)
- `test`: 測試相關
- `chore`: 建構流程變更 (Dependencies, Configs)

### Scope 範圍參考：
- **Core**: `store` (Redux), `types` (Interfaces)
- **Features**: `character` (Cultivation), `inventory`, `adventure`, `workshop`
- **UI**: `components`, `layout`
- **System**: `config` (Constants), `utils`

### 範例：
- `feat(character): 實作練氣期突破邏輯`
- `fix(inventory): 修正物品堆疊數量顯示錯誤`
- `chore(config): 調整五行靈根生成機率`
- `style(ui): 優化側邊欄在手機版的顯示`

## 排除檔案
- `node_modules/`
- `dist/`
- `.env.local`
- `.DS_Store`

## 安全檢查
- 確認沒有敏感資訊（API 金鑰、密碼）
- 移除除錯程式碼（console.log, debugger）
- 確保所有 TypeScript 錯誤 `ts(2339)` 等已解決