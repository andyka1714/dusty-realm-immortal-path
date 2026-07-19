import React, { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGameLoop } from "./hooks/useGameLoop";
import { processOfflineGains } from "./store/slices/characterSlice";
import { AppDispatch, RootState } from "./store/store";
import { GameShell } from "./components/game/GameShell";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Start the Global Game Loop
  useGameLoop();

  const { isInitialized, isDead } = useSelector(
    (state: RootState) => state.character
  );

  // Process offline gains on mount
  useEffect(() => {
    dispatch(processOfflineGains());
  }, [dispatch]);

  // Watch for Age milestones & Lifespan warnings
  // Logic migrated to checkTimeEvents in timeActions.ts

  if (!isInitialized || isDead) {
    return (
      <div className="h-[100dvh] w-full overflow-y-auto bg-stone-950 font-serif text-stone-200">
        <Suspense fallback={<FullscreenLoading />}>
          <Dashboard />
        </Suspense>
      </div>
    );
  }

  return <GameShell />;
};

const FullscreenLoading: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-stone-950 text-stone-400">
    載入中...
  </div>
);

export default App;
