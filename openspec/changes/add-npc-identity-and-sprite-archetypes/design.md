# Design: NPC identity and sprite archetypes

## Context

The project already has production rules for humanoid player walk and combat sprites. NPCs are still represented mainly by text tokens, and several shop-like NPC records use institution names (`萬寶閣`, `靈寶閣`, `藏經閣`) as `name`. Before generating NPC images, the catalog needs stable identity fields and a reusable sprite grouping strategy.

This design covers all 53 existing NPCs across 12 maps. It plans identity and sprite grouping only; it does not include monster sprites, NPC movement sprites, or NPC combat animations.

## Goals

- Give every NPC a personal name.
- Preserve institution/shop/route identity through `affiliationLabel`.
- Support role copy through `roleLabel`.
- Reuse sprites by role and affiliation instead of generating 53 unrelated images.
- Keep different role classes visually distinct.
- Use a humanoid idle sprite standard derived from the existing 96x96 humanoid grounding rules.
- Preserve all current IDs, coordinates, shop links, quests, and interaction behavior.

## Non-Goals

- No monster sprite profile.
- No NPC map movement animation.
- No NPC combat animation.
- No LocalStorage migration.
- No procedural runtime recoloring as the first solution.
- No requirement that every NPC has a unique sprite sheet.

## Proposed NPC Fields

```ts
interface NPC {
  id: string;
  name: string; // personal name
  affiliationLabel?: string; // institution, sect, route group, or location label
  roleLabel?: string; // role shown in detail surfaces
  spriteArchetype?: string; // base visual role
  spriteVariant?: string; // sect, region, realm, or special variant
}
```

Existing fields remain authoritative for gameplay: `id`, `type`, `x`, `y`, `shopId`, `questIds`, `dialogue`, and `description`.

## Display Rules

Map token and hover labels should use:

- With affiliation: first line `affiliationLabel`, second line `name`.
- With affiliation and role in detail panel: `name · roleLabel`.
- Without affiliation: show `name` as today.
- Existing `symbol` remains fallback token text and compact map marker fallback.

Examples:

- `萬寶閣 / 王掌櫃`
- `靈寶閣 / 沈劍爐 · 煉器師`
- `藏經閣 / 白簡執事 · 藏書執事`

## Sprite Archetype Rules

`spriteArchetype` defines the silhouette and props. `spriteVariant` defines palette, sect markers, region mood, or realm intensity.

Core archetypes:

- `wanbao_clerk`: general merchant, ledger, money pouch, shop robe.
- `lingbao_forgemaster`: equipment or artifact maker, hammer/tooling, furnace accents.
- `scripture_keeper`: scripture hall keeper, scrolls, jade slips, formal robe.
- `town_elder`: mortal town elder, plain robe, cane or clasped hands.
- `sect_elder`: senior sect quest NPC; variants distinguish sword, beast, mystic.
- `sect_field_officer`: patrol captain, huntmaster, envoy-like sect operator.
- `route_envoy`: world route quest envoy; variants distinguish sword, beast, mystic and realm stage.
- `route_witness`: world route witness/info NPC; quieter stance than envoy.
- `workshop_specialist`: material, furnace, archive, or crafting clue NPC.
- `scribe_registrar`: registrar, records, maps, reincarnation notes.
- `rift_oracle`: route oracle/broker, late-game guidance NPC.
- `echo_spirit`: semi-transparent sect echo, used only for Info echo NPCs.

Different archetypes must not share one image. Variants may share base construction but should have visible palette/prop differences.

## NPC Idle Sprite Standard

NPCs are stationary map actors. They do not need walk or combat sheets.

Required asset shape:

- Idle sheet: at least 2 transparent `96x96` frames showing only in-place motion.
- Single-frame NPC idle PNGs are not valid production NPC sprite assets.

Idle sheet motion can include breathing, sleeve sway, hair movement, robe movement, hand gestures, floating scrolls, furnace glow, shop ledger motion, weapon aura, or subtle spirit shimmer. It must not include walking displacement, pursuit, attack swings, hit reactions, directional turns, or cast lunges.

Grounding and QC:

- Each frame is `96x96`.
- Footline stays at `y=88`.
- Horizontal center stays at `x=48 ±1px`.
- Character scale remains consistent across all frames.
- Asset metadata records frame count, frame size, idle cadence, footline, center line, target height, archetype, variant, and `qcStatus`.
- Only `qcStatus: "passed"` assets can be used as production map tokens.

## Generated Asset Wiring Rule

Every generated NPC idle sheet must be treated as incomplete until it is connected to live catalog data.

For each generated and QC-passed NPC idle sheet, the same implementation slice must:

- Add or update the generated asset metadata.
- Add or update the sprite registry entry.
- Update the matching NPC catalog entry with `spriteArchetype` and `spriteVariant`, or an equivalent resolver mapping.
- Add test coverage proving the NPC resolves to the new asset.

Generated assets that fail QC may remain in a scratch or rejected location, but they must not be wired into production catalog data. Generated assets that pass QC but are not used by any NPC should not be committed as part of the production rollout.

## Full NPC Identity and Sprite Plan

| Map | NPC ID | Planned Display | Role | Archetype | Variant |
|---|---|---|---|---|---|
| 仙緣鎮 | `village_chief` | 村中長老 / 林守拙 | 新手引導 | `town_elder` | `village` |
| 仙緣鎮 | `village_wanbao` | 萬寶閣 / 王掌櫃 | 掌櫃 | `wanbao_clerk` | `village` |
| 仙緣鎮 | `village_blacksmith` | 鐵匠鋪 / 張鐵山 | 鐵匠 | `lingbao_forgemaster` | `village_blacksmith` |
| 仙緣鎮 | `village_scripture_keeper` | 藏經閣 / 陸簡生 | 入門藏書執事 | `scripture_keeper` | `village` |
| 凌霄劍宗 | `sect_sword_elder` | 凌霄劍宗 / 蕭長鋒 | 劍宗長老 | `sect_elder` | `sword` |
| 凌霄劍宗 | `sect_sword_patrol_captain` | 凌霄劍宗 / 顧巡岳 | 巡山統領 | `sect_field_officer` | `sword` |
| 凌霄劍宗 | `sect_sword_wanbao` | 萬寶閣 / 韓雲商 | 宗門掌櫃 | `wanbao_clerk` | `sword` |
| 凌霄劍宗 | `sect_sword_lingbao` | 靈寶閣 / 沈劍爐 | 劍器煉器師 | `lingbao_forgemaster` | `sword` |
| 凌霄劍宗 | `sect_sword_skills` | 藏經閣 / 白簡執事 | 劍譜執事 | `scripture_keeper` | `sword` |
| 萬獸山莊 | `sect_beast_elder` | 萬獸山莊 / 蒼骨長老 | 煉體長老 | `sect_elder` | `beast` |
| 萬獸山莊 | `sect_beast_huntmaster` | 萬獸山莊 / 厲獵川 | 獵場監軍 | `sect_field_officer` | `beast` |
| 萬獸山莊 | `sect_beast_wanbao` | 萬寶閣 / 祝獠商 | 山莊掌櫃 | `wanbao_clerk` | `beast` |
| 萬獸山莊 | `sect_beast_lingbao` | 靈寶閣 / 鐵骨匠 | 骨器煉器師 | `lingbao_forgemaster` | `beast` |
| 萬獸山莊 | `sect_beast_skills` | 藏經閣 / 玄骨祭書 | 煉體秘卷執事 | `scripture_keeper` | `beast` |
| 縹緲仙宮 | `sect_mystic_elder` | 縹緲仙宮 / 靈微長老 | 傳法長老 | `sect_elder` | `mystic` |
| 縹緲仙宮 | `sect_mystic_envoy` | 縹緲仙宮 / 陶星使 | 外務使 | `sect_field_officer` | `mystic` |
| 縹緲仙宮 | `sect_mystic_wanbao` | 萬寶閣 / 蘇靈掌櫃 | 仙宮掌櫃 | `wanbao_clerk` | `mystic` |
| 縹緲仙宮 | `sect_mystic_lingbao` | 靈寶閣 / 洛霞器師 | 法器師 | `lingbao_forgemaster` | `mystic` |
| 縹緲仙宮 | `sect_mystic_skills` | 藏經閣 / 雲冊執事 | 法術藏書執事 | `scripture_keeper` | `mystic` |
| 三界戰場 | `world_sword_battlefield_envoy` | 凌霄劍宗 / 岳界令 | 界令使 | `route_envoy` | `sword_battlefield` |
| 三界戰場 | `world_beast_battlefield_envoy` | 萬獸山莊 / 血旗厲使 | 血旗使 | `route_envoy` | `beast_battlefield` |
| 三界戰場 | `world_mystic_battlefield_envoy` | 縹緲仙宮 / 星牒洛使 | 星牒使 | `route_envoy` | `mystic_battlefield` |
| 隕仙深淵 | `world_sword_abyss_witness` | 凌霄劍宗 / 沈劍痕 | 深淵見證者 | `route_witness` | `sword_abyss` |
| 隕仙深淵 | `world_beast_abyss_witness` | 萬獸山莊 / 骨鼓魁客 | 深淵見證者 | `route_witness` | `beast_abyss` |
| 隕仙深淵 | `world_mystic_abyss_witness` | 縹緲仙宮 / 觀星岑客 | 深淵見證者 | `route_witness` | `mystic_abyss` |
| 時光長河 | `world_sword_void_river_witness` | 凌霄劍宗 / 碑守寒鋒 | 長河見證者 | `route_witness` | `sword_void_river` |
| 時光長河 | `world_beast_void_river_witness` | 萬獸山莊 / 血骨樁守 | 長河見證者 | `route_witness` | `beast_void_river` |
| 時光長河 | `world_mystic_void_river_witness` | 縹緲仙宮 / 星牒河守 | 長河見證者 | `route_witness` | `mystic_void_river` |
| 萬法聖城 | `world_sword_sacred_city_envoy` | 凌霄劍宗 / 聖城劍令使 | 劍令使 | `route_envoy` | `sword_sacred_city` |
| 萬法聖城 | `world_beast_sacred_city_envoy` | 萬獸山莊 / 聖城血潮使 | 血潮使 | `route_envoy` | `beast_sacred_city` |
| 萬法聖城 | `world_mystic_sacred_city_envoy` | 縹緲仙宮 / 聖城星潮使 | 星潮使 | `route_envoy` | `mystic_sacred_city` |
| 無盡海 | `world_sword_endless_sea_witness` | 凌霄劍宗 / 界海劍潮守 | 界海見證者 | `route_witness` | `sword_endless_sea` |
| 無盡海 | `world_beast_endless_sea_witness` | 萬獸山莊 / 界海血骨守 | 界海見證者 | `route_witness` | `beast_endless_sea` |
| 無盡海 | `world_mystic_endless_sea_witness` | 縹緲仙宮 / 界海星蓮守 | 界海見證者 | `route_witness` | `mystic_endless_sea` |
| 劫雲荒原 | `local_tribulation_cloud_scout` | 劫雲荒原 / 雷雲巡候 | 地區巡候 | `route_witness` | `tribulation_local` |
| 劫雲荒原 | `world_sword_tribulation_envoy` | 凌霄劍宗 / 劫雲劍盟使 | 劍盟使 | `route_envoy` | `sword_tribulation` |
| 劫雲荒原 | `world_beast_tribulation_envoy` | 萬獸山莊 / 劫雲帝血使 | 帝血使 | `route_envoy` | `beast_tribulation` |
| 劫雲荒原 | `world_mystic_tribulation_envoy` | 縹緲仙宮 / 劫雲星詔使 | 星詔使 | `route_envoy` | `mystic_tribulation` |
| 劫雲荒原 | `local_tribulation_material_diviner` | 雷爐工坊 / 雷爐辨材師 | 材料辨識師 | `workshop_specialist` | `tribulation` |
| 接引仙殿 | `local_immortal_registry_keeper` | 接引仙殿 / 仙籍錄事 | 仙籍書吏 | `scribe_registrar` | `immortal_registry` |
| 接引仙殿 | `world_sword_immortal_witness` | 凌霄劍宗 / 接引帝劍守 | 帝劍見證者 | `route_witness` | `sword_immortal` |
| 接引仙殿 | `world_beast_immortal_witness` | 萬獸山莊 / 接引帝血守 | 帝血見證者 | `route_witness` | `beast_immortal` |
| 接引仙殿 | `world_mystic_immortal_witness` | 縹緲仙宮 / 接引星詔守 | 星詔見證者 | `route_witness` | `mystic_immortal` |
| 接引仙殿 | `local_immortal_material_archivist` | 仙材案牘司 / 仙材案牘師 | 材料案牘師 | `scribe_registrar` | `immortal_material` |
| 歸墟裂界 | `local_guixu_rift_cartographer` | 歸墟裂界 / 歸墟界圖師 | 界圖師 | `scribe_registrar` | `guixu_cartographer` |
| 歸墟裂界 | `local_guixu_sword_echo` | 凌霄劍宗 / 歸墟劍星回聲 | 宗門回聲 | `echo_spirit` | `sword_guixu` |
| 歸墟裂界 | `local_guixu_beast_echo` | 萬獸山莊 / 歸墟血骨回聲 | 宗門回聲 | `echo_spirit` | `beast_guixu` |
| 歸墟裂界 | `local_guixu_mystic_echo` | 縹緲仙宮 / 歸墟星蓮回聲 | 宗門回聲 | `echo_spirit` | `mystic_guixu` |
| 歸墟裂界 | `local_guixu_material_forgemaster` | 歸墟終盤爐 / 歸墟終盤爐師 | 終盤爐師 | `workshop_specialist` | `guixu_forge` |
| 歸墟裂界 | `local_guixu_v5_route_oracle` | 歸墟路諭 / 歸墟 v5 路諭師 | 路線解讀者 | `rift_oracle` | `guixu_v5_route` |
| 歸墟裂界 | `local_guixu_v5_workshop_seer` | 歸墟冕爐 / 歸墟 v5 冕爐師 | 帝冕爐師 | `workshop_specialist` | `guixu_v5_workshop` |
| 歸墟裂界 | `local_guixu_v6_afterpath_broker` | 歸墟餘路 / 歸墟 v6 餘路行者 | 餘路行者 | `rift_oracle` | `guixu_v6_afterpath` |
| 歸墟裂界 | `local_guixu_v6_reincarnation_scribe` | 輪迴錄 / 歸墟 v6 輪迴錄師 | 輪迴錄師 | `scribe_registrar` | `guixu_v6_reincarnation` |

## Rollout Phases

### Phase 1: Core settlement and sect hubs

Implement identity fields and sprite mappings for:

- 仙緣鎮: 4 NPCs.
- 凌霄劍宗: 5 NPCs.
- 萬獸山莊: 5 NPCs.
- 縹緲仙宮: 5 NPCs.

This phase validates the institution-label model and covers the most frequently seen NPCs.

### Phase 2: World route NPCs

Implement route envoy and route witness variants for 三界戰場, 隕仙深淵, 時光長河, 萬法聖城, 無盡海, 劫雲荒原, and 接引仙殿.

### Phase 3: Workshop, registrar, and Guixu NPCs

Implement late-game workshop, registrar, oracle, and echo archetypes for 接引仙殿 and 歸墟裂界.

### Phase 4: Polish and asset differentiation

Tune palette and props across variants only after base archetype loading is stable.

## Testing Strategy

- Catalog tests:
  - institution NPCs have personal `name` and non-empty `affiliationLabel`.
  - no NPC with `shopId` uses `萬寶閣`, `靈寶閣`, or `藏經閣` as its personal `name`.
  - all NPCs with sprite metadata resolve to known archetypes.
  - each generated and QC-passed NPC asset is referenced by at least one NPC or explicit archetype mapping.
- Asset registry tests:
  - same archetype/variant maps to expected asset ID.
  - different archetypes do not collapse to the same image.
  - only QC-passed assets are returned as usable map sprites.
- UI tests:
  - affiliation and personal names render together.
  - fallback token still renders when no asset exists.
  - clicking NPCs still opens existing shop, quest, or info interactions.

## Open Questions For Implementation

- Whether Phase 1 should generate all distinct variant sprite sheets immediately, or first use base archetype sheets with metadata-only variants.
- Whether `symbol` should remain manually authored after sprite rollout or become derived from role/affiliation.
- Whether map labels should always show two lines, or only show two lines on hover/selected state to reduce clutter.
