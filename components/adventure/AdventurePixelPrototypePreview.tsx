import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Shield, Sparkles, Target, Timer, Zap } from "lucide-react";
import { AdventurePixelStagePrototype } from "./AdventurePixelStagePrototype";
import {
  PIXEL_PROTOTYPE_PREVIEW_BOOT_BUDGET_MS,
  PIXEL_PROTOTYPE_PREVIEW_TARGET_FPS,
  createPixelPrototypePreviewFixture,
  getPixelPrototypePreviewModeOverride,
  type PixelPrototypePreviewViewportMode,
} from "../../utils/pixelPrototypePreview";
import { getPixelPrototypeMetrics } from "../../utils/pixelAdventurePrototype";

type RuntimeMetrics = {
  bootMs: number | null;
  fps: number | null;
  samples: number;
};

type PrototypeRuntime = {
  renderFrame: () => void;
};

const PREVIEW_STAGE_SIZES: Record<
  PixelPrototypePreviewViewportMode,
  { width: number; height: number }
> = {
  desktop: { width: 760, height: 560 },
  mobile: { width: 358, height: 420 },
};

const estimateStageSize = (
  modeOverride: PixelPrototypePreviewViewportMode | null
) => {
  if (modeOverride) {
    return PREVIEW_STAGE_SIZES[modeOverride];
  }

  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const mobile = window.innerWidth < 768;
  const width = mobile
    ? Math.max(320, window.innerWidth - 32)
    : Math.min(920, Math.max(520, window.innerWidth - 420));
  const height = mobile
    ? Math.max(320, Math.floor(window.innerHeight * 0.46))
    : Math.min(760, Math.max(420, window.innerHeight - 180));

  return { width, height };
};

const resolveMetricTone = (passed: boolean | null) => {
  if (passed === null) {
    return "border-stone-700 bg-stone-900/70 text-stone-300";
  }

  return passed
    ? "border-emerald-700 bg-emerald-950/50 text-emerald-200"
    : "border-rose-700 bg-rose-950/50 text-rose-200";
};

interface AdventurePixelPrototypePreviewProps {
  modeOverride?: PixelPrototypePreviewViewportMode | null;
}

export const AdventurePixelPrototypePreview: React.FC<
  AdventurePixelPrototypePreviewProps
> = ({ modeOverride: modeOverrideProp }) => {
  const preview = useMemo(() => createPixelPrototypePreviewFixture(), []);
  const stageShellRef = useRef<HTMLDivElement>(null);
  const bootStartRef = useRef(0);
  const modeOverride = useMemo(() => {
    if (modeOverrideProp) {
      return modeOverrideProp;
    }

    if (typeof window === "undefined") {
      return null;
    }

    return getPixelPrototypePreviewModeOverride(window.location.search);
  }, [modeOverrideProp]);
  const [stageSize, setStageSize] = useState(() => estimateStageSize(modeOverride));
  const [prototypeRuntime, setPrototypeRuntime] =
    useState<PrototypeRuntime | null>(null);
  const [runtimeMetrics, setRuntimeMetrics] = useState<RuntimeMetrics>({
    bootMs: null,
    fps: null,
    samples: 0,
  });

  useEffect(() => {
    setStageSize(estimateStageSize(modeOverride));
  }, [modeOverride]);

  useEffect(() => {
    setPrototypeRuntime(null);
    setRuntimeMetrics({
      bootMs: null,
      fps: null,
      samples: 0,
    });

    if (typeof window !== "undefined") {
      bootStartRef.current = performance.now();
    }
  }, [modeOverride]);

  useEffect(() => {
    if (
      modeOverride ||
      !stageShellRef.current ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const width = Math.max(320, Math.floor(entry.contentRect.width));
      const height = Math.max(320, Math.floor(entry.contentRect.height));
      setStageSize({ width, height });
    });

    observer.observe(stageShellRef.current);
    return () => observer.disconnect();
  }, [modeOverride]);

  useEffect(() => {
    if (
      !prototypeRuntime ||
      stageSize.width <= 0 ||
      stageSize.height <= 0 ||
      typeof window === "undefined"
    ) {
      return;
    }

    const sampleCount = 24;
    const bootMs = Math.max(
      0,
      Math.round(performance.now() - bootStartRef.current)
    );
    const renderStart = performance.now();

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      prototypeRuntime.renderFrame();
    }

    const totalRenderMs = performance.now() - renderStart;
    const averageRenderMs = totalRenderMs / sampleCount;
    const fps = averageRenderMs > 0 ? Math.round(1000 / averageRenderMs) : 0;

    setRuntimeMetrics((current) => ({
      bootMs: current.bootMs ?? bootMs,
      fps,
      samples: sampleCount,
    }));
  }, [prototypeRuntime, stageSize.height, stageSize.width]);

  const isMobile =
    modeOverride === "mobile" ||
    (modeOverride !== "desktop" && stageSize.width > 0 ? stageSize.width < 480 : false);
  const stageMetrics =
    stageSize.width > 0 && stageSize.height > 0
      ? getPixelPrototypeMetrics({
          width: stageSize.width,
          height: stageSize.height,
          isMobile,
        })
      : null;

  const targetFps = isMobile
    ? PIXEL_PROTOTYPE_PREVIEW_TARGET_FPS.mobile
    : PIXEL_PROTOTYPE_PREVIEW_TARGET_FPS.desktop;
  const bootPass =
    runtimeMetrics.bootMs === null
      ? null
      : runtimeMetrics.bootMs <= PIXEL_PROTOTYPE_PREVIEW_BOOT_BUDGET_MS;
  const fpsPass =
    runtimeMetrics.fps === null ? null : runtimeMetrics.fps >= targetFps;

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-4 font-serif text-stone-100 md:px-6 md:py-6">
      <div
        className={clsx(
          "mx-auto flex flex-col gap-4",
          modeOverride === "mobile" ? "max-w-[440px]" : "max-w-7xl"
        )}
        data-preview-surface="pixel-prototype"
        data-preview-mode={isMobile ? "mobile" : "desktop"}
        data-preview-scale={stageMetrics?.scale ?? ""}
        data-preview-boot-ms={runtimeMetrics.bootMs ?? ""}
        data-preview-fps={runtimeMetrics.fps ?? ""}
      >
        <header className="rounded-2xl border border-stone-800 bg-black/40 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur md:p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Pixel Prototype Validation
          </div>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-100 md:text-3xl">
                {preview.mapData.name} 像素風 vertical slice 驗證入口
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-300 md:text-[15px]">
                這個入口只用來驗證像素地圖、文字 token 實體、右側 HUD 可讀性與基本效能 budget，
                不改動正式遊玩流程。帶上
                <code className="mx-1 rounded bg-stone-900 px-1.5 py-0.5 text-cyan-200">
                  ?pixel-prototype-preview=1
                </code>
                就會直接進來。
              </p>
            </div>
            <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
              Desktop / Mobile
              <div className="mt-1 text-xs text-cyan-200/80">
                同一入口直接對照 3x / 2x scaling、文字 token 與 HUD 密度
              </div>
            </div>
          </div>
        </header>

        <div
          className={clsx(
            "grid gap-4",
            modeOverride === "mobile"
              ? "grid-cols-1"
              : "xl:grid-cols-[minmax(0,1fr)_340px]"
          )}
        >
          <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-4">
            <div
              ref={stageShellRef}
              className="relative h-[46vh] min-h-[320px] overflow-hidden rounded-2xl border border-stone-800 bg-black md:h-[68vh] md:max-h-[760px]"
            >
              {stageSize.width > 0 && stageSize.height > 0 ? (
                <AdventurePixelStagePrototype
                  mapData={preview.mapData}
                  playerPosition={preview.playerPosition}
                  activeMonsters={preview.activeMonsters}
                  portals={preview.mapData.portals}
                  targetMonsterId={preview.targetMonsterId}
                  combatPresentation={preview.combatPresentation}
                  width={stageSize.width}
                  height={stageSize.height}
                  onTileClick={() => undefined}
                  onPrototypeReady={setPrototypeRuntime}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-stone-500">
                  正在量測 viewport...
                </div>
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-2xl border border-stone-800 bg-stone-900/45 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                <Target size={14} />
                Target HUD
              </div>
              <div className="mt-3 text-lg font-bold text-stone-100">
                蝕骨田鼬
              </div>
              <div className="mt-1 text-sm text-stone-300">{preview.targetRoleLabel}</div>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {preview.targetIntentLabel}
              </p>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="rounded-xl border border-stone-800 bg-black/35 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Player
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {preview.playerStatusNames.map((status) => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-700 bg-emerald-950/45 px-2 py-1 text-xs text-emerald-200"
                      >
                        <Shield size={12} />
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-stone-800 bg-black/35 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Enemy
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {preview.enemyStatusNames.map((status) => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-700 bg-rose-950/45 px-2 py-1 text-xs text-rose-200"
                      >
                        <Zap size={12} />
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-cyan-900/50 bg-cyan-950/25 p-3 text-sm text-cyan-100">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles size={14} />
                  {preview.recentCueLabel}
                </div>
                <div className="mt-1 leading-6 text-cyan-100/80">
                  {preview.recentCueDetail}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-800 bg-stone-900/45 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                <Timer size={14} />
                Performance budget
              </div>
              <div className="mt-3 grid gap-3 text-sm">
                <div
                  className={clsx(
                    "rounded-xl border px-3 py-3",
                    resolveMetricTone(bootPass)
                  )}
                >
                  <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                    Boot budget
                  </div>
                  <div className="mt-1 text-lg font-bold">
                    {runtimeMetrics.bootMs === null
                      ? "量測中"
                      : `${runtimeMetrics.bootMs}ms / ${PIXEL_PROTOTYPE_PREVIEW_BOOT_BUDGET_MS}ms`}
                  </div>
                </div>
                <div
                  className={clsx(
                    "rounded-xl border px-3 py-3",
                    resolveMetricTone(fpsPass)
                  )}
                >
                  <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                    FPS budget
                  </div>
                  <div className="mt-1 text-lg font-bold">
                    {runtimeMetrics.fps === null
                      ? "量測中"
                      : `${runtimeMetrics.fps} fps / ${targetFps} fps`}
                  </div>
                </div>
                <div className="rounded-xl border border-stone-800 bg-black/35 px-3 py-3 text-stone-300">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Pixel scale
                  </div>
                  <div className="mt-1 text-lg font-bold text-stone-100">
                    {stageMetrics ? `${stageMetrics.scale}x` : "等待 viewport"}
                  </div>
                  <div className="mt-1 text-xs text-stone-500">
                    {stageMetrics
                      ? `${stageMetrics.cols}x${stageMetrics.rows} cells · ${runtimeMetrics.samples} frame samples`
                      : "Bootstrap 中"}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
