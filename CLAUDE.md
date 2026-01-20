# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概览

**Dusty Realm Immortal Path (塵寰仙途)** is a Chinese cultivation (修仙) idle RPG built with React 19, TypeScript, Redux Toolkit, and Vite. The game features realm progression, spirit root attributes, adventure/combat systems, and resource management.

### 開發環境與指令

```bash
# 安裝相依套件
npm install

# 執行開發伺服器
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 提交前必須執行

```bash
# TypeScript 檢查 (確保無型別錯誤)
npx tsc --noEmit

# 檢查專案能否成功建置
npm run build
```

## 專案結構與架構

### 核心目錄
- `types.ts` - 核心型別定義 (Enums: MajorRealm, SpiritRootId, ElementType, ProfessionType, etc.)
- `constants.ts` - 遊戲數值平衡與設定 (Magic Numbers 禁止出現在邏輯層)
- `store/` - Redux 狀態管理
- `pages/` - 主要頁面視圖 (Dashboard, Adventure, Inventory, Workshop)
- `components/` - React UI 元件
- `hooks/` - 自定義 Hooks (useGameLoop)
- `utils/` - 工具函數 (battleSystem, dropSystem, logParser)
- `data/` - 遊戲內容數據 (maps, enemies, npcs, quests, items, shops)

### Redux 狀態架構

State is managed through Redux Toolkit with localStorage persistence. The store is configured in `store/store.ts`:

**Slices:**
- `characterSlice.ts` (21KB) - Core character state, cultivation, breakthrough, time events
- `adventureSlice.ts` (16KB) - Map navigation, combat, monster spawning, movement
- `inventorySlice.ts` (7KB) - Items, equipment, inventory management
- `questSlice.ts` - Quest state tracking
- `workshopSlice.ts` - Crafting levels and recipes
- `logSlice.ts` - Game event logs

**重要:** When modifying `types.ts`, check all slices for type errors as they heavily depend on these types.

### 遊戲主迴圈

The `useGameLoop` hook dispatches `tickCultivation()` every `GAME_TICK_RATE_MS` (1000ms = 1 game day). This handles:
- Age progression
- Passive cultivation gains
- Time-based events
- Seclusion countdown

### 頁面路由

App uses simple tab-based routing (not React Router):
- `dashboard` - Character stats, cultivation, breakthrough
- `adventure` - Map exploration, combat system
- `inventory` - Items, equipment management
- `workshop` - Crafting (alchemy/blacksmith)

## 領域邏輯規範

### 數值平衡 (CRITICAL)

**ALL game balance numbers MUST be defined in `constants.ts`** - Experience multipliers, realm lifespans, base probabilities, breakthrough requirements. NEVER hardcode magic numbers in components or slices.

Key constants structures:
- `REALM_EXP_CONFIG` - Experience curve configuration per realm
- `REALM_BASE_STATS` - HP/MP per realm
- `REALM_ATTRIBUTE_GROWTH` - Stat gains on breakthrough
- `SPIRIT_ROOT_DETAILS` - Complete spirit root definitions with bonuses
- `BREAKTHROUGH_CONFIG` - Breakthrough requirements and tribulation settings

### 境界邏輯

Realm progression follows `MajorRealm` enum (Mortal=0 to ImmortalEmperor=11):
- Minor realms: 0-9 (see `MINOR_REALM`)
- Breakthrough requires specific items from bosses (see `BREAKTHROUGH_CONFIG.bossHint`)
- Major boundaries (Golden Core+) trigger tribulations with failure penalties
- Use `calculateMaxExp(major, minor)` for experience calculations

### 靈根系統

Spirit roots are dual-layered:
- **Category (Tier)**: `SpiritRootType` (Heterogenous/True/Heavenly/Variant)
- **Specific ID**: `SpiritRootId` (e.g., `HEAVENLY_GOLD`, `VARIANT_THUNDER`)

Each spirit root has detailed configuration in `SPIRIT_ROOT_DETAILS` including:
- Cultivation multiplier
- Combat stat bonuses
- Initial stat bonuses
- Special abilities (alchemy, crafting bonuses)

### 戰鬥與冒險

Combat is turn-based and handled in `utils/battleSystem.ts`. Key systems:
- **Movement speed** varies by realm (`MOVEMENT_SPEEDS`)
- **Element system** - Five elements with counter relationships (defined in `ELEMENT_COLORS`)
- **Enemy ranks** - Common, Elite, Boss (affects drop rates)
- **Monster spawning** - Time-based respawns in adventure mode

### 狀態管理模式

- Logic should be encapsulated in Slice `reducers` or Thunks
- Components only select data (`useSelector`) and dispatch actions (`useDispatch`)
- Avoid complex `useEffect` chains in components
- Use Redux's Immer for immutable updates

## 設計系統

- **UI Style**: Primarily `stone` color scheme (`bg-stone-950`, `text-stone-200`) for ancient cultivation aesthetic
- **Five Elements Colors**:
  - Metal (金): `text-yellow-400`
  - Wood (木): `text-emerald-400`
  - Water (水): `text-blue-400`
  - Fire (火): `text-red-400`
  - Earth (土): `text-amber-700`
- **Icons**: `lucide-react`
- **Responsive**: Mobile-first with desktop sidebar collapse

## 語言約定

**程式碼變數命名必須使用英文**
**註解及字串內容（遊戲對話、日誌）必須使用繁體中文**

## 常見修改模式

### Adding a New Item
1. Define in `data/items/` (categorized by type)
2. Add to appropriate drop table in `data/drop_tables.ts`
3. Optionally add to shop in `data/shops.ts`

### Adding a New Quest
1. Define in `data/quests.ts` with requirements/rewards/dialogue
2. Link to NPC in `data/npcs.ts` via `questIds`
3. Quest progress tracked in `questSlice.ts`

### Balance Changes
1. Modify values in `constants.ts`
2. Consider side effects on existing saves
3. Test breakthrough success rates with new values

### Adding New Map/Enemy
1. Define map in `data/maps.ts` with portals, NPCs, spawn points
2. Define enemies in `data/enemies/` with realm-appropriate stats
3. Consider realm progression curve when setting stats

## 已知的重要檔案依賴

- Modifying `types.ts` → Check ALL slices for type errors
- Modifying `constants.ts` → May affect save compatibility
- Modifying `characterSlice.ts` → Core game loop, test thoroughly
- Modifying `adventureSlice.ts` → Combat/movement logic is complex
