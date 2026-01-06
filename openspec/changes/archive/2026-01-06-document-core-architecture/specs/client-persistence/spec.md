## ADDED Requirements

### Requirement: 數據儲存結構 (Data Schema)
系統必須 (MUST) 在 LocalStorage 中儲存完整的 Redux State Tree。

#### Scenario: 核心狀態 (RootState)
- **WHEN** 序列化存檔
- **THEN** 存檔物件必須包含以下 Slice：
  - `character`: 角色狀態 (含 `attributes`, `majorRealm`, `spiritRoot` 等)
  - `inventory`: 背包狀態 (含 `items: InventoryItem[]`, `equipment`)
  - `adventure`: 冒險狀態 (含 `currentMapId`, `playerPosition`, `activeMonsters`)
  - `workshop`: 生活技能狀態 (含 `gatheringLevel`, `unlockedRecipes`)
  - `logs`: 遊戲日誌 (最近 50 筆)

#### Scenario: 角色數據 (Character State)
- **WHEN** 儲存角色
- **THEN** 必須包含基礎屬性 (`physique`, `rootBone`...)
- **AND** 必須包含時間數據 (`age` 天數, `lifespan` 壽元, `lastSaveTime`)
- **AND** 必須包含修煉數據 (`currentExp`, `maxExp`, `cultivationRate`)

### Requirement: 離線收益計算 (Offline Logic)
系統必須 (MUST) 在讀取存檔時計算離線期間的收益。

#### Scenario: 時間差計算
- **WHEN** 應用程式初始化 (Hydrate)
- **THEN** 讀取 `character.lastSaveTime`
- **AND** 計算 `delta = Date.now() - lastSaveTime`
- **AND** 若 delta > 12小時，則以 12小時 (43200秒) 為上限

#### Scenario: 獎勵發放
- **WHEN** 確認離線時間有效
- **THEN** 發放 `delta (秒) * cultivationRate` 的經驗值
- **AND** 在日誌中插入一條「離線收益」紀錄
