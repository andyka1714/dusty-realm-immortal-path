import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { getRealmLabel } from "../../utils/realm";
import { formatSpiritStone } from "../../utils/currency";
import { DAYS_PER_YEAR } from "../../constants";
import { MAPS } from "../../data/maps";
import { Sparkles, Timer, Wallet } from "lucide-react";

export const GameHUD: React.FC = () => {
  const { character, adventure } = useSelector((state: RootState) => state);
  const currentMap = MAPS.find((map) => map.id === adventure.currentMapId);

  return (
    <>
      <div className="pointer-events-none fixed left-4 top-4 z-[3000] flex max-w-[calc(100vw-2rem)] flex-col gap-3">
        <div className="rounded-[24px] border border-stone-700/70 bg-stone-950/82 px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div>
              <div className="text-lg font-bold tracking-[0.2em] text-stone-100">
                {character.name}
              </div>
              <div className="mt-1 text-xs text-stone-500">
                {getRealmLabel(character.majorRealm, character.minorRealm)}
              </div>
            </div>
            <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              {character.isInSeclusion ? "閉關中" : "歷練中"}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed right-4 top-4 z-[3000] flex max-w-[calc(100vw-2rem)] flex-col gap-3">
        <div className="rounded-[24px] border border-stone-700/70 bg-stone-950/82 px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 text-sm text-stone-300">
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2 text-stone-500">
                <Wallet size={14} />
                靈石
              </span>
              <span className="font-mono text-amber-300">
                {formatSpiritStone(character.spiritStones)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2 text-stone-500">
                <Sparkles size={14} />
                修為
              </span>
              <span className="font-mono text-emerald-300">
                {character.currentExp.toFixed(0)} / {character.maxExp.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2 text-stone-500">
                <Timer size={14} />
                壽元
              </span>
              <span className="font-mono text-stone-300">
                {(character.age / DAYS_PER_YEAR).toFixed(1)} /{" "}
                {(character.lifespan / DAYS_PER_YEAR).toFixed(0)} 歲
              </span>
            </div>
            {currentMap && (
              <div className="border-t border-stone-800 pt-2 text-right text-xs tracking-[0.2em] text-stone-500">
                區域 {currentMap.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
