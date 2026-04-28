import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, Scroll, Shield, Sparkles, Swords } from "lucide-react";
import { AppDispatch, RootState } from "../../store/store";
import { equipActiveSkill } from "../../store/slices/characterSlice";
import { normalizeLearnedSkills } from "../../data/skills";
import { getRealmLabel } from "../../utils/realm";
import { Button } from "../ui/button";
import clsx from "clsx";

const skillTypeLabel = {
  Active: "主動術式",
  Passive: "被動心法",
} as const;

export const SkillPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const character = useSelector((state: RootState) => state.character);
  const learnedSkills = useMemo(
    () => normalizeLearnedSkills(character.skills),
    [character.skills]
  );
  const activeSkills = learnedSkills.filter(
    (skill) =>
      skill.type === "Active" && skill.profession === character.profession
  );
  const passiveSkills = learnedSkills.filter(
    (skill) =>
      skill.type === "Passive" && skill.profession === character.profession
  );
  const equippedSkill =
    activeSkills.find((skill) => skill.id === character.equippedActiveSkillId) ??
    activeSkills[0] ??
    null;

  return (
    <div
      className="space-y-4 text-stone-200"
      data-testid="skill-panel"
      aria-label="角色功法"
    >
      <section className="rounded-xl border border-stone-800 bg-stone-950/55 p-4">
        <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-stone-200">
          <Scroll size={16} className="text-amber-300" />
          功法取得流程
        </div>
        <div className="mt-3 grid gap-2 text-xs text-stone-400 md:grid-cols-3">
          <div className="rounded-lg border border-stone-800 bg-black/25 px-3 py-2">
            <div className="font-bold text-amber-200">1. 藏經閣購買</div>
            <div className="mt-1">任務、怪物掉落與傳承也可能取得功法秘卷。</div>
          </div>
          <div className="rounded-lg border border-stone-800 bg-black/25 px-3 py-2">
            <div className="font-bold text-emerald-200">2. 背包參悟</div>
            <div className="mt-1">買到秘卷不等於已學會，需符合職業、境界與前置條件。</div>
          </div>
          <div className="rounded-lg border border-stone-800 bg-black/25 px-3 py-2">
            <div className="font-bold text-sky-200">3. 裝備參戰</div>
            <div className="mt-1">已學主動術式會出現在此，可選為戰鬥功法。</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-amber-700/35 bg-amber-950/15 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-amber-200">
              <Swords size={16} />
              戰鬥功法
            </div>
            <div className="mt-2 text-lg font-black text-stone-100">
              {equippedSkill ? equippedSkill.name : "尚未裝備"}
            </div>
            <p className="mt-1 text-sm text-stone-400">
              {equippedSkill
                ? `目前裝備 · ${getRealmLabel(equippedSkill.minRealm, 0)} · ${skillTypeLabel[equippedSkill.type]}`
                : "尚未學會可用功法，可透過藏經閣、任務、怪物掉落或傳承取得功法秘卷。"}
            </p>
          </div>
          {character.equippedActiveSkillId && (
            <Button
              type="button"
              variant="stone"
              size="sm"
              onClick={() => dispatch(equipActiveSkill(null))}
            >
              解除裝備
            </Button>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-stone-200">
          <Scroll size={16} className="text-amber-300" />
          已學主動術式
        </div>
        {activeSkills.length === 0 ? (
          <div className="rounded-lg border border-stone-800 bg-stone-950/60 px-3 py-2 text-sm text-stone-500">
            尚未學會可用功法，先從藏經閣或任務取得功法秘卷。
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {activeSkills.map((skill) => {
              const isEquipped = skill.id === equippedSkill?.id;

              return (
                <article
                  key={skill.id}
                  className={clsx(
                    "rounded-lg border bg-stone-950/55 p-3",
                    isEquipped
                      ? "border-amber-600/70"
                      : "border-stone-800/90"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-bold text-stone-100">
                        {isEquipped && (
                          <CheckCircle2 size={14} className="text-amber-300" />
                        )}
                        <span>{skill.name}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                        {skill.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isEquipped ? "amber" : "stone"}
                      size="sm"
                      onClick={() => dispatch(equipActiveSkill(skill.id))}
                      disabled={isEquipped}
                    >
                      {isEquipped ? "目前裝備" : "裝備"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-stone-200">
          <Shield size={16} className="text-emerald-300" />
          被動心法
        </div>
        {passiveSkills.length === 0 ? (
          <div className="rounded-lg border border-stone-800 bg-stone-950/60 px-3 py-2 text-sm text-stone-500">
            尚未參悟被動心法。
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {passiveSkills.map((skill) => (
              <article
                key={skill.id}
                className="rounded-lg border border-emerald-900/45 bg-emerald-950/10 p-3"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-200">
                  <Sparkles size={14} />
                  {skill.name}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                  {skill.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
