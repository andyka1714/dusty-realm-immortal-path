import React from "react";
import { Sparkles } from "lucide-react";
import { EncounterEvent } from "../../data/encounters";
import { PendingEncounter } from "../../types";

interface PendingEncounterPanelProps {
  event: EncounterEvent;
  pending: PendingEncounter;
  onChoose: (choiceId: string) => void;
}

export const PendingEncounterPanel: React.FC<PendingEncounterPanelProps> = ({
  event,
  pending,
  onChoose,
}) => (
  <div className="space-y-5 px-1 pb-2">
    <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.34em] text-stone-500">
            Encounter · {pending.year} 歲
          </div>
          <div className="mt-1 text-xl font-semibold text-stone-100">{event.title}</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-stone-300">{event.description}</p>
    </div>

    <div className="space-y-3">
      {event.choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onChoose(choice.id)}
          className="w-full rounded-2xl border border-stone-800 bg-stone-950/75 p-4 text-left transition hover:border-amber-500/35 hover:bg-stone-900"
        >
          <div className="text-base font-medium text-stone-100">{choice.label}</div>
          <div className="mt-2 text-sm text-stone-400">{choice.description}</div>
        </button>
      ))}
    </div>
  </div>
);
