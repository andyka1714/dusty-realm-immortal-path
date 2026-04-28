# Change: 清理歷史規劃文件殘留待辦

## Why

部分早期 plan 檔仍保留未勾選 checklist，但對應功能已在後續 tracking docs、OpenSpec archive 與 live code 中完成。這會讓後續盤點誤判已有功能仍未完成。

## What Changes

- 將已被後續收口文件吸收的 plan 標記為 historical / completed elsewhere。
- 在 tracking docs 記錄舊 checklist 不再作為 active backlog。
- 不改 runtime code。

## Impact

- Affected specs: `client-interface`
- Affected code: docs only
- Persistence: 不影響 LocalStorage 或任何 runtime state，不需要 migration。
