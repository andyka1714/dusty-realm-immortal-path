# 變更：深化 Workshop 經濟與專精 v2

## 為什麼

Workshop 已有高階 recipe、專精樹、route-specific material source 與 UI cue，但 mastery 目前主要仍是門檻。v2 要讓 mastery、專精 leaf 與 route-specific sink 形成更清楚的中後期決策。

## 這次要改什麼

- 補 mastery milestone 與第二層 specialization leaf
- 補中後期 / 終盤 recipe family 與 route-specific material sink
- 補可測的專精效果，例如副產物、品質保底或 tier-specific output cue
- 維持 actor token 與 AdventureStage 不變

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `types.ts`
  - `data/workshopRecipes.ts`
  - `data/workshopSpecializationTree.ts`
  - `store/actions/workshopActions.ts`
  - `pages/Workshop.tsx`
  - `store/persistedStateMigration.ts`
  - `docs/02_Gameplay/workshop.md`
