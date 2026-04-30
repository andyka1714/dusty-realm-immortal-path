import React from "react";

export const SkillAcquisitionGuide: React.FC = () => (
  <div className="grid gap-2 text-xs text-stone-400">
    <div className="rounded-lg border border-stone-800 bg-black/25 px-3 py-2">
      <div className="font-bold text-amber-200">1. 藏經閣購買</div>
      <div className="mt-1">任務、怪物掉落與傳承也可能取得功法秘卷。</div>
    </div>
    <div className="rounded-lg border border-stone-800 bg-black/25 px-3 py-2">
      <div className="font-bold text-emerald-200">2. 背包參悟</div>
      <div className="mt-1">
        買到秘卷不等於已學會，需符合職業、境界與前置條件。
      </div>
    </div>
    <div className="rounded-lg border border-stone-800 bg-black/25 px-3 py-2">
      <div className="font-bold text-sky-200">3. 裝備參戰</div>
      <div className="mt-1">已學主動術式會出現在此，可選為戰鬥功法。</div>
    </div>
  </div>
);
