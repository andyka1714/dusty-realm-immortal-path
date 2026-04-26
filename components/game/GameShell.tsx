import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FloatingDock, GamePanelId } from "./FloatingDock";
import { GameHUD } from "./GameHUD";
import { GamePanel } from "./GamePanel";
import { BookOpen, Hammer, Home, Package } from "lucide-react";
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

const PANEL_CONFIG: Record<
  Exclude<GamePanelId, "compendium">,
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
    setActivePanel((current) => (current === panel ? null : panel));
  };
  const handleDismissPendingEncounter = () => {
    dispatch(dismissPendingEncounter());
  };

  const isCompendiumOpen = activePanel === "compendium";

  const activePanelConfig = useMemo(() => {
    if (!activePanel || activePanel === "compendium") {
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
        <Adventure isInputBlocked={activePanel !== null} />
      </Suspense>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_26%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_24%)]"></div>
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.72)]"></div>

      <GameHUD />
      <FloatingDock activePanel={activePanel} onTogglePanel={handleTogglePanel} />

      <Suspense fallback={null}>
        {activePanelConfig && (
          <GamePanel
            isOpen={!!activePanelConfig}
            onClose={() => setActivePanel(null)}
            widthClassName={activePanelConfig.widthClassName}
            title={activePanelConfig.title}
            eyebrow={activePanelConfig.eyebrow}
            titleIcon={activePanelConfig.icon}
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
    </div>
  );
};

const SceneLoading: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-stone-950 text-stone-500">
    載入主場景...
  </div>
);
