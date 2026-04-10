import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { getRealmLabel } from "../../utils/realm";
import { formatSpiritStone } from "../../utils/currency";
import { DAYS_PER_YEAR } from "../../constants";
import { Sparkles, Timer, Wallet } from "lucide-react";

export const GameHUD: React.FC = () => {
  const { character } = useSelector((state: RootState) => state);

  return (
    <div className="pointer-events-none fixed left-4 top-4 z-[3000] w-[min(360px,calc(100vw-2rem))]">
      <div className="rounded-[28px] border border-stone-700/70 bg-stone-950/84 px-4 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-[0.2em] text-stone-100">
              {character.name}
            </div>
            <div className="mt-1 text-xs text-stone-500">
              {getRealmLabel(character.majorRealm, character.minorRealm)}
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            {character.isInSeclusion ? "閉關中" : "歷練中"}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-stone-800 pt-3 text-sm text-stone-300">
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
        </div>
      </div>
    </div>
  );
};
