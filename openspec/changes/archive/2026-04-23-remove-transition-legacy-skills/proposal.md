# 變更：正式下線 transition / legacy 技能並補上舊存檔遷移

## 為什麼

`P0 / P1 / P2` 已完成後，技能系統剩下最明確的結構債不是再加新技能，而是把 `transition / legacy` 技能真正收掉。

目前正式技能池、技能書來源與大多數 UI 都已切到 `core only` 視角，但相容層仍停留在「保留 alias + replacement metadata」階段：

- 舊存檔仍可能直接帶著 retired skill id 或 retired manual item id
- `data/skills/index.ts` 仍維護大量 final-cull / removal / manifest 輔助輸出，方便盤點，但還沒正式落成玩家不可見的最終退場流程
- reducer 與 learn flow 雖然已做 replacement-aware 正規化，但仍偏防禦式相容，不是明確的 hydrate migration 主路徑

下一步應該把這批相容資料從「分析與過渡」推進到「正式退場 + 舊檔升級」。

## 這次要改什麼

- 把 `transition / legacy` 技能的 final-cull manifest 正式落成可執行的 migration / cleanup 流程
- 在存檔 hydrate 階段，把舊的 skill id、manual item id、相關引用升級成 formal core replacement
- 讓玩家可見的技能 / 秘卷 / 獎勵 / 圖鑑視圖完全退出 retired skill，本體只保留 formal core
- 保留必要的 compatibility lookup，但只留在 migration 與測試邊界，不再作為常規玩家資料出口
- 補齊 migration regression tests 與文件，讓後續能安全刪整最後一批 retired skill residue

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-persistence`
- Affected code:
  - `store/localStorage.ts`
  - `store/store.ts`
  - `store/slices/characterSlice.ts`
  - `store/slices/inventorySlice.ts`
  - `data/skills/index.ts`
  - `data/skills/pool.ts`
  - `data/skills/retired_aliases.ts`
  - `data/items/manuals.ts`
  - `store/slices/characterSlice.test.ts`
  - `data/skills/skillPoolRegistry.test.ts`
