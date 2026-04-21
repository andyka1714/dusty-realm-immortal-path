## 1. 像素風 pre-production 基線
- [x] 1.1 建立正式 `pixel-art art bible`，補齊 tile / sprite / UI / VFX / palette / scale 規格
- [x] 1.2 鎖定 representative vertical slice 的地圖、角色、怪物 archetype、戰鬥 cue 與驗證門檻
- [x] 1.3 定義自主生成像素素材在 prototype 階段的可接受邊界、review 規則與不承諾項

## 2. Adventure vertical slice prototype
- [x] 2.1 以 `PixiJS` 建立隔離式像素風 prototype stage，不直接覆蓋正式 `AdventureStage`
- [x] 2.2 渲染一張代表性地圖、1 個玩家、2 種怪物 archetype、傳送門與 target focus
- [x] 2.3 接回至少一套 live combat cue：近戰命中、投射物、危險區 telegraph、target / status cue

## 3. 驗證、文件與追蹤
- [ ] 3.1 驗證 web / mobile 的像素縮放、HUD 可讀性與效能 budget
- [x] 3.2 更新 `docs/04_UI/pixel_art_bible.md`、`docs/06_Balance_Audit/13_3D渲染與戰鬥呈現評估.md` 與 tracking docs
- [x] 3.3 驗證 `openspec validate evaluate-pixel-art-vertical-slice --strict` 與相關 prototype 檢查
