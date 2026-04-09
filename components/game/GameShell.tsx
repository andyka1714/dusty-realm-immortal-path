import React, { Suspense, lazy, useMemo, useState } from "react";
import { FloatingDock, GamePanelId } from "./FloatingDock";
import { GameHUD } from "./GameHUD";
import { GamePanel } from "./GamePanel";

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
  { widthClassName: string; render: () => React.ReactNode }
> = {
  character: {
    widthClassName: "md:w-[min(90vw,1320px)]",
    render: () => <Dashboard />,
  },
  inventory: {
    widthClassName: "md:w-[min(92vw,1380px)]",
    render: () => <Inventory />,
  },
  workshop: {
    widthClassName: "md:w-[min(88vw,1180px)]",
    render: () => <Workshop />,
  },
};

export const GameShell: React.FC = () => {
  const [activePanel, setActivePanel] = useState<GamePanelId | null>(null);

  const handleTogglePanel = (panel: GamePanelId) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const isCompendiumOpen = activePanel === "compendium";

  const activePanelConfig = useMemo(() => {
    if (!activePanel || activePanel === "compendium") {
      return null;
    }

    return PANEL_CONFIG[activePanel];
  }, [activePanel]);

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
          >
            {activePanelConfig.render()}
          </GamePanel>
        )}

        <CompendiumModal
          isOpen={isCompendiumOpen}
          onClose={() => setActivePanel(null)}
        />
      </Suspense>
    </div>
  );
};

const SceneLoading: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-stone-950 text-stone-500">
    載入主場景...
  </div>
);
