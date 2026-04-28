# Change: 建立功法秘卷物品線

## Why

功法秘卷目前已能由 formal core skill 生成，但仍需要正式規格約束境界、職業、來源與學習用途，避免功法再次被誤解為圖鑑項目或普通消耗品。

## What Changes

- 定義功法秘卷作為獨立物品線，承接藏經閣、門派任務、精英掉落、Boss 掉落與傳承來源。
- 要求每本 formal core manual 都具備境界、職業、來源、前置功法與學習用途 metadata。
- 保留既有 `ConsumableType.Manual` 技術實作，不新增 persisted state。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `data/items/manuals.ts`, `data/skills/skillBookCoverage.test.ts`, `components/Compendium/sourceTracing.ts`
- Persistence: 不新增存檔欄位；新增/整理 catalog metadata 不需要 migration。
