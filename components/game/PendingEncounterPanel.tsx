import React from "react";
import { Sparkles } from "lucide-react";
import { EncounterEvent, getEncounterPreviewCue } from "../../data/encounters";
import { PendingEncounter } from "../../types";
import { Button } from "../ui/button";

const cueToneLabels = {
  steady: "穩定",
  risky: "高風險",
  costly: "需付出",
} as const;

const cueTagClassNames = {
  resource: "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
  cost: "border-rose-500/25 bg-rose-500/10 text-rose-100",
  benefit: "border-amber-500/25 bg-amber-500/10 text-amber-100",
  risk: "border-orange-500/25 bg-orange-500/10 text-orange-100",
} as const;

interface PendingEncounterPanelProps {
  event: EncounterEvent;
  pending: PendingEncounter;
  onChoose: (choiceId: string) => void;
}

export const PendingEncounterPanel: React.FC<PendingEncounterPanelProps> = ({
  event,
  pending,
  onChoose,
}) => {
  const presentationCue = pending.presentationCue ?? getEncounterPreviewCue(event);

  return (
    <div className="space-y-5 px-1 pb-2">
      <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.34em] text-stone-500">
              機緣遭遇 · {pending.year} 歲
            </div>
            <div className="mt-1 text-xl font-semibold text-stone-100">{event.title}</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-stone-300">{event.description}</p>
        <p className="mt-2 text-xs leading-6 text-stone-500">
          此事來得突然，須當場擇一應對；若暫且離開，將不會取得此段機緣的收穫。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {event.presentation?.categoryLabel && (
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] tracking-[0.22em] text-amber-100">
              {event.presentation.categoryLabel}
            </span>
          )}
          {presentationCue.chainLabel && (
            <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] tracking-[0.22em] text-amber-50">
              {presentationCue.chainLabel}
            </span>
          )}
          {presentationCue.memoryCue && (
            <span className="rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 text-[11px] tracking-[0.22em] text-stone-300">
              {presentationCue.memoryCue}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {presentationCue.routeLabel && (
            <span className="rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 text-[11px] tracking-[0.22em] text-stone-200">
              {presentationCue.routeLabel}
            </span>
          )}
          {presentationCue.professionLabel && (
            <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-[11px] tracking-[0.22em] text-sky-100">
              {presentationCue.professionLabel}
            </span>
          )}
          {presentationCue.sectLabel && (
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] tracking-[0.22em] text-emerald-100">
              {presentationCue.sectLabel}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {event.choices.map((choice) => (
          <Button
            key={choice.id}
            onClick={() => onChoose(choice.id)}
            variant="selection"
            className="h-auto w-full flex-col items-start justify-start rounded-2xl border border-stone-800 bg-stone-950/75 p-4 text-left transition hover:border-amber-500/35 hover:bg-stone-900"
            data-testid={`pending-encounter-choice-${choice.id}`}
          >
            <div className="text-base font-medium text-stone-100">{choice.label}</div>
            <div className="mt-2 text-sm text-stone-400">{choice.description}</div>
            {choice.cue && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-stone-700 bg-stone-900/80 px-2.5 py-1 text-[11px] tracking-[0.18em] text-stone-300">
                  {cueToneLabels[choice.cue.tone ?? "steady"]}
                </span>
                {choice.cue.tags?.map((tag) => (
                  <span
                    key={`${choice.id}-${tag.kind}-${tag.label}`}
                    className={`rounded-full border px-2.5 py-1 text-[11px] tracking-[0.16em] ${cueTagClassNames[tag.kind]}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
