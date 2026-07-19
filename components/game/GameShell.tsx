import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FloatingDock, GamePanelId } from "./FloatingDock";
import { GameHUD } from "./GameHUD";
import { GamePanel } from "./GamePanel";
import { QuestTrackerHUD } from "./QuestTrackerHUD";
import { BookOpen, Hammer, Home, Info, Package, Scroll } from "lucide-react";
import { GameTooltip } from "./GameTooltip";
import { SkillAcquisitionGuide } from "./SkillAcquisitionGuide";
import { Modal } from "../Modal";
import { PendingEncounterPanel } from "./PendingEncounterPanel";
import { AppDispatch, RootState } from "../../store/store";
import { checkTimeEvents } from "../../store/actions/timeActions";
import { getEncounterEventById } from "../../data/encounters";
import {
  dismissPendingEncounter,
  resolvePendingEncounterChoice,
} from "../../store/actions/encounterActions";
import { Button } from "../ui/button";
import { SaveRecoveryBanner } from "./SaveRecoveryBanner";

const Adventure = lazy(() =>
  import("../../pages/Adventure").then((module) => ({
    default: module.Adventure,
  }))
);
const Dashboard = lazy(() =>
  import("../../pages/Dashboard").then((module) => ({
    default: module.Dashboard,
  }))
);
const Inventory = lazy(() =>
  import("../../pages/Inventory").then((module) => ({
    default: module.Inventory,
  }))
);
const Workshop = lazy(() =>
  import("../../pages/Workshop").then((module) => ({
    default: module.Workshop,
  }))
);
const CompendiumModal = lazy(() =>
  import("../Compendium/CompendiumModal").then((module) => ({
    default: module.CompendiumModal,
  }))
);
const SkillPanel = lazy(() =>
  import("./SkillPanel").then((module) => ({
    default: module.SkillPanel,
  }))
);

const PANEL_CONFIG: Record<
  Exclude<GamePanelId, "compendium" | "map">,
  {
    widthClassName: string;
    title: string;
    eyebrow: string;
    icon: React.ReactNode;
    render: () => React.ReactNode;
  }
> = {
  character: {
    widthClassName: "md:w-[min(96vw,1480px)]",
    title: "道途",
    eyebrow: "CULTIVATION PATH",
    icon: <Home size={18} />,
    render: () => <Dashboard embedded />,
  },
  inventory: {
    widthClassName: "md:w-[min(96vw,1500px)]",
    title: "行囊空間",
    eyebrow: "TRAVEL PACK",
    icon: <Package size={18} />,
    render: () => <Inventory embedded />,
  },
  skills: {
    widthClassName: "md:w-[min(92vw,980px)]",
    title: "角色功法",
    eyebrow: "SKILL LOADOUT",
    icon: <Scroll size={18} />,
    render: () => <SkillPanel />,
  },
  workshop: {
    widthClassName: "md:w-[min(94vw,1320px)]",
    title: "洞府百業",
    eyebrow: "ESTATE ARTS",
    icon: <Hammer size={18} />,
    render: () => <Workshop embedded />,
  },
};

export const GameShell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activePanel, setActivePanel] = useState<GamePanelId | null>(null);
  const [mapOpenRequest, setMapOpenRequest] = useState(0);
  const [skillInfoTooltip, setSkillInfoTooltip] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const { age, isInitialized, isDead } = useSelector(
    (state: RootState) => state.character
  );
  const pendingEncounter = useSelector(
    (state: RootState) => state.encounter.pendingEvent
  );

  useEffect(() => {
    if (isInitialized && !isDead) {
      dispatch(checkTimeEvents());
    }
  }, [dispatch, age, isInitialized, isDead]);

  const handleTogglePanel = (panel: GamePanelId) => {
    if (panel === "map") {
      setMapOpenRequest((value) => value + 1);
      setActivePanel(null);
      return;
    }

    setActivePanel((current) => (current === panel ? null : panel));
  };
  const showSkillInfoTooltip = (event: React.SyntheticEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSkillInfoTooltip({
      x: Math.min(rect.left, window.innerWidth - 360),
      y: rect.bottom + 8,
    });
  };
  const hideSkillInfoTooltip = () => setSkillInfoTooltip(null);

  const skillTitleAccessory =
    activePanel === "skills" ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mb-1 h-7 w-7 rounded-full border border-stone-700/70 bg-stone-950/70 text-stone-400 hover:border-amber-500/60 hover:text-amber-200"
        aria-label="功法取得流程"
        data-testid="skill-acquisition-info-trigger"
        onMouseEnter={showSkillInfoTooltip}
        onMouseLeave={hideSkillInfoTooltip}
        onFocus={showSkillInfoTooltip}
        onBlur={hideSkillInfoTooltip}
      >
        <Info size={14} />
      </Button>
    ) : null;
  const handleDismissPendingEncounter = () => {
    dispatch(dismissPendingEncounter());
  };

  const isCompendiumOpen = activePanel === "compendium";

  const activePanelConfig = useMemo(() => {
    if (
      !activePanel ||
      activePanel === "compendium" ||
      activePanel === "map"
    ) {
      return null;
    }

    return PANEL_CONFIG[activePanel];
  }, [activePanel]);
  const pendingEncounterEvent = pendingEncounter
    ? getEncounterEventById(pendingEncounter.eventId)
    : null;
  const pendingEncounterEyebrow =
    pendingEncounter?.presentationCue?.chainLabel ??
    pendingEncounterEvent?.presentation?.chainLabel ??
    pendingEncounterEvent?.presentation?.categoryLabel ??
    "FATED ENCOUNTER";

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-black font-serif text-stone-100">
      <Suspense fallback={<SceneLoading />}>
        <Adventure
          isInputBlocked={activePanel !== null}
          mapOpenRequest={mapOpenRequest}
        />
      </Suspense>

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.72)]"></div>

      <GameHUD />
      <QuestTrackerHUD />
      <FloatingDock activePanel={activePanel} onTogglePanel={handleTogglePanel} />
      <SaveRecoveryBanner />

      <Suspense fallback={null}>
        {activePanelConfig && (
          <GamePanel
            isOpen={!!activePanelConfig}
            onClose={() => setActivePanel(null)}
            widthClassName={activePanelConfig.widthClassName}
            title={activePanelConfig.title}
            eyebrow={activePanelConfig.eyebrow}
            titleIcon={activePanelConfig.icon}
            titleAccessory={skillTitleAccessory}
          >
            {activePanelConfig.render()}
          </GamePanel>
        )}

        <GamePanel
          isOpen={isCompendiumOpen}
          onClose={() => setActivePanel(null)}
          widthClassName="md:w-[min(96vw,1500px)]"
          title="萬界圖鑑"
          eyebrow="WORLD COMPENDIUM"
          titleIcon={<BookOpen size={18} />}
        >
          <CompendiumModal
            isOpen={isCompendiumOpen}
            onClose={() => setActivePanel(null)}
            embedded
            initialTab={activePanel === "skills" ? "skill" : "realm"}
          />
        </GamePanel>

        <Modal
          isOpen={Boolean(pendingEncounter && pendingEncounterEvent)}
          onClose={handleDismissPendingEncounter}
          title="機緣遭遇"
          eyebrow={pendingEncounterEyebrow}
          size="medium"
          actions={
            <Button
              onClick={handleDismissPendingEncounter}
              variant="stone"
              size="sm"
              data-testid="pending-encounter-dismiss"
            >
              暫且離開
            </Button>
          }
        >
          {pendingEncounter && pendingEncounterEvent && (
            <PendingEncounterPanel
              event={pendingEncounterEvent}
              pending={pendingEncounter}
              onChoose={(choiceId) => dispatch(resolvePendingEncounterChoice(choiceId))}
            />
          )}
        </Modal>
      </Suspense>
      {skillInfoTooltip && (
        <GameTooltip
          eyebrow="SKILL GUIDE"
          title="功法取得流程"
          widthClassName="w-[22rem]"
          style={{ left: skillInfoTooltip.x, top: skillInfoTooltip.y }}
        >
          <SkillAcquisitionGuide />
        </GameTooltip>
      )}
    </div>
  );
};

const SceneLoading: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-stone-950 text-stone-500">
    載入主場景...
  </div>
);
