## 1. Spec 與 persistence foundation
- [x] 1.1 回寫 `game-mechanics / client-persistence / client-interface` 的 base truth，承接 world combat 與 reincarnation flow
- [x] 1.2 將 LocalStorage 升級為版本化 save envelope，正式區分 `current` 與 `soul`
- [x] 1.3 為 legacy raw save 補 migration，讓舊存檔可安全升級到新 schema

## 2. 輪迴轉生 core
- [x] 2.1 建立 `soul` slice 與 `Merit / Lifetime Stats / Heirloom / Perk` 的正式型別與初始資料
- [x] 2.2 將本世結算改成 `Life Review -> Reincarnation Hall -> Rebirth` 的正式流程，不再只是直接 reset
- [x] 2.3 改造角色初始化與 current run reset，讓新一世可吃到輪迴配置且不清掉 soul progression

## 3. 介面、文件與驗證
- [x] 3.1 將 `App / Dashboard` 的 full-screen 入口改為 `Intro / Death Summary / Reincarnation Hall / GameShell` 的正式分流
- [x] 3.2 同步更新 `docs/02_Gameplay/reincarnation.md` 與相關 audit / tracking 文件
- [x] 3.3 補 migration、merit calculation、reincarnation state transition 的 regression tests，並驗證 `npm run typecheck`、相關測試與 `openspec validate add-meta-progression-foundation --strict`
