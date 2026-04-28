import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { getRealmLabel } from "../../utils/realm";
import { formatSpiritStone } from "../../utils/currency";
import { DAYS_PER_YEAR } from "../../constants";
import { Activity, Heart, Shield, Sparkles, Wallet, Zap } from "lucide-react";
import { MAPS } from "../../data/maps";
import { resolveAdventureCombatUiState } from "../../utils/adventureCombatUiState";
import { calculatePlayerStats } from "../../utils/battleSystem";
import {
  calculatePlayerCombatPower,
  formatCombatPower,
  getCharacterDerivedLevel,
} from "../../utils/combatPower";

export const GameHUD: React.FC = () => {
  const character = useSelector((state: RootState) => state.character);
  const equipmentStats = useSelector(
    (state: RootState) => state.inventory.equipmentStats
  );
  const currentMapId = useSelector(
    (state: RootState) => state.adventure.currentMapId
  );
  const currentMap = MAPS.find((map) => map.id === currentMapId);
  const combatUiState = resolveAdventureCombatUiState({
    hasCombatEncounters: Boolean(currentMap?.enemies.length),
    isInSeclusion: character.isInSeclusion,
    showIntro: false,
    isBattling: false,
    isMapModalOpen: false,
  });
  const combatStats = calculatePlayerStats(
    character.attributes,
    character.majorRealm,
    character.spiritRootId,
    equipmentStats,
    character.name,
    character.profession,
    character.skills
  );
  const combatPower = calculatePlayerCombatPower({
    stats: combatStats,
    majorRealm: character.majorRealm,
    minorRealm: character.minorRealm,
  });
  const derivedLevel = getCharacterDerivedLevel(
    character.majorRealm,
    character.minorRealm
  );

  return (
    <div className="pointer-events-none fixed left-4 top-4 z-[3000] w-[min(370px,calc(100vw-2rem))]">
      <div
        className="rounded-2xl border border-stone-700/70 bg-stone-950/88 px-3 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.34)] backdrop-blur-xl"
        data-testid="game-hud-character-card"
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-gradient-to-br from-stone-900 to-amber-950/35 text-lg font-black text-amber-300 shadow-[inset_0_0_14px_rgba(245,158,11,0.12)]"
            data-testid="game-hud-avatar"
          >
            {character.name.slice(0, 1) || "道"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-base font-bold tracking-[0.12em] text-stone-100">
                  {character.name}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                  <span>{getRealmLabel(character.majorRealm, character.minorRealm)}</span>
                  <span className="rounded border border-stone-700 bg-stone-900/80 px-1.5 py-0.5 font-mono text-stone-300">
                    Lv.{derivedLevel}
                  </span>
                </div>
              </div>
              <div className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                {combatUiState.hudActivityLabel}
              </div>
            </div>

            <div className="mt-2 grid gap-1.5">
              <div>
                <div className="mb-0.5 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> 氣血
                  </span>
                  <span className="font-mono text-emerald-300">
                    {combatStats.maxHp} / {combatStats.maxHp}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-stone-800">
                  <div className="h-full w-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <div className="mb-0.5 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Activity size={12} /> 靈力
                  </span>
                  <span className="font-mono text-blue-300">
                    {combatStats.maxMp} / {combatStats.maxMp}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-stone-800">
                  <div className="h-full w-full bg-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-stone-800/80 pt-2 text-xs text-stone-300"
          data-testid="game-hud-compact-stat-grid"
        >
          <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-stone-800/70 bg-black/16 px-2 py-1.5">
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Zap size={12} />
              戰力
            </span>
            <span className="truncate font-mono font-bold text-amber-300">
              {formatCombatPower(combatPower)}
            </span>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-stone-800/70 bg-black/16 px-2 py-1.5">
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Wallet size={12} />
              靈石
            </span>
            <span className="truncate font-mono text-amber-300">
              {formatSpiritStone(character.spiritStones)}
            </span>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-stone-800/70 bg-black/16 px-2 py-1.5">
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Sparkles size={12} />
              修為
            </span>
            <span className="truncate font-mono text-emerald-300">
              {character.currentExp.toFixed(0)} / {character.maxExp.toFixed(0)}
            </span>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-stone-800/70 bg-black/16 px-2 py-1.5">
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <Shield size={12} />
              壽元
            </span>
            <span className="truncate font-mono text-stone-300">
              {(character.age / DAYS_PER_YEAR).toFixed(1)} /{" "}
              {(character.lifespan / DAYS_PER_YEAR).toFixed(0)} 歲
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
