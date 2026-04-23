# 變更：建立輪迴轉生與 meta progression foundation

## 為什麼

前一輪 battle core、技能書、高境界內容密度與 live-combat presentation 已完成第一階段收口，但產品層仍存在更大的結構性缺口：

1. `輪迴轉生` 目前只有概念文件，死亡仍只是把角色退回未初始化狀態
2. LocalStorage 存檔仍只有單層 current run，沒有能承接多周目與永久成長的 `Soul Save`
3. OpenSpec base spec 仍停留在舊版網格探索 / 回合制描述，尚未回寫目前已正式落地的 world combat 與 UI 流程

如果不先建立這條 foundation，後續要做的 `洞府百業`、`事件 / 奇遇`、`宗門內容擴張` 與像素風重製，都會疊在過時 spec 與單層存檔上，返工成本會持續放大。

## 這次要改什麼

- 建立正式的 `Soul Save / Merit / Lifetime Stats / Heirloom / Perks / Reincarnation Hall` foundation
- 將目前單層 LocalStorage 存檔升級為版本化 schema，區分 current run 與 soul progression
- 把 `game-mechanics / client-persistence / client-interface` 的 base spec 回寫到目前真實玩法，尤其是：
  - 地圖內時間軸戰鬥與 world combat
  - 死亡後不再只是直接 reset，而是進入輪迴結算與配置流程
  - full-screen 入口流程需支援 `Intro / Death Summary / Reincarnation Hall / GameShell`

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-persistence`
  - `client-interface`
- Affected code:
  - `store/localStorage.ts`
  - `store/persistedStateMigration.ts`
  - `store/store.ts`
  - `store/slices/characterSlice.ts`
  - `pages/Dashboard.tsx`
  - `App.tsx`
  - `docs/02_Gameplay/reincarnation.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`

