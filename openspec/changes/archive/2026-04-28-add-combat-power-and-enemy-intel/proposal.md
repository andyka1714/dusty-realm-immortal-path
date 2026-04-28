# Change: 新增戰力估算與妖獸情報

## Why

主遊戲 HUD 與萬界圖鑑需要更像正式 RPG 的強弱判讀資訊，但目前玩家只能看到境界、血量與掉落，難以快速比較自身與妖獸威脅。使用者也希望後續左上角色卡、目標卡與圖鑑都能顯示戰力、氣血、攻防、元素、特招與掉落等資訊。

## What Changes

- 新增 deterministic 戰力估算 helper，從既有角色戰鬥屬性與妖獸 catalog 推導戰力。
- 妖獸戰力必須考慮境界、小境界、rank、攻防血量與特殊攻擊，不取代正式戰鬥公式。
- 萬界圖鑑的地圖 / 妖獸區塊顯示 HP、攻擊、防禦、戰力、元素、弱點、抗性、AI 風格與特殊攻擊。
- Adventure 選取妖獸目標卡顯示戰力與主要情報，讓玩家在接戰前判斷威脅。
- 補 unit / component / smoke regression，避免圖鑑妖獸頁再次退回只顯示境界與掉落。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `utils/combatPower.ts`, `components/Compendium/CompendiumModal.tsx`, `pages/Adventure.tsx`, tests
- Persistence: 不新增 persisted state；戰力與妖獸情報全部由既有 character stats、enemy catalog、map catalog 推導，不需要 migration 或 hydrate sanitize。
