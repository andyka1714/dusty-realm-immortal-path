# 持久化與存檔 (Persistence)

## 1. 存檔結構 (Save Structure)
使用 Redux Persist 或手動訂閱 Store 變更儲存至 `localStorage`。

```typescript
interface RootState {
  character: CharacterState;
  inventory: InventoryState;
  adventure: AdventureState;
  logs: LogState;
  // ...
}
```

## 2. 自動存檔
- 頻率：每 1000ms (Debounced)。
- 觸發：Redux State 變更。

## 3. 離線收益計算 (Offline Progress)
- 讀取 `lastSaveTime`。
- 計算 `delta = Now - lastSaveTime`。
- 限制 `delta <= 12 hours`。
- 模擬修煉 Tick 獲得經驗值。
