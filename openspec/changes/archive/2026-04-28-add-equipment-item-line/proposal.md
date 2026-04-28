# Change: 建立裝備物品線

## Why

裝備已存在多境界資料，但需要正式規格定義三職業武器、防具、飾品、法寶胚與境界 progression，讓任務與煉器能穩定引用。

## What Changes

- 定義劍修、體修、法修與通用裝備的境界階梯。
- 要求每個主要境界至少有對應職業裝備或通用裝備承接。
- 裝備線必須能被任務獎勵、煉器 recipe、掉落與圖鑑 audit 使用。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `data/items/equipment/*`, `data/items/equipment/audit.ts`, `data/items/equipment/equipmentAudit.test.ts`
- Persistence: 不新增存檔欄位；新增 template item 不需要 migration。
