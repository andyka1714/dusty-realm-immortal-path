import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, ChevronsUp, Lock, Zap } from "lucide-react";
import { BREAKTHROUGH_CONFIG, MINOR_REALM_CAP } from "../../constants";
import { ITEMS } from "../../data/items";
import { Modal } from "../Modal";
import { Button } from "../ui/button";
import { attemptBreakthrough } from "../../store/slices/characterSlice";
import { removeItem } from "../../store/slices/inventorySlice";
import { addLog } from "../../store/slices/logSlice";
import { AppDispatch, RootState } from "../../store/store";
import { buildBreakthroughPreview } from "../../utils/breakthroughPreview";
import { useBreakthroughResultLog } from "./useBreakthroughResultLog";

interface BreakthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const resolveBreakthroughModalState = (
  character: RootState["character"],
  inventory: RootState["inventory"]["items"]
) => {
  const {
    majorRealm,
    minorRealm,
    attributes,
    spiritRootId,
    breakthroughConsequence,
  } = character;
  const isMajorBreakthrough = minorRealm >= MINOR_REALM_CAP;
  const config = BREAKTHROUGH_CONFIG[majorRealm];
  const requiredItemId = isMajorBreakthrough ? config.requiredItemId : null;
  const requiredItem = requiredItemId ? ITEMS[requiredItemId] : null;
  const hasItem = requiredItemId
    ? inventory.some((item) => item.itemId === requiredItemId && item.count > 0)
    : true;
  const breakthroughPreview = buildBreakthroughPreview({
    majorRealm,
    minorRealm,
    attributes,
    spiritRootId,
    hasRequiredItem: hasItem,
    requiredItemName: requiredItem?.name,
    activeConsequence: breakthroughConsequence,
  });

  return {
    title: isMajorBreakthrough ? "衝擊大境界" : "突破小境界",
    isMajorBreakthrough,
    config,
    requiredItemId,
    requiredItem,
    hasItem,
    breakthroughPreview,
    successRate: breakthroughPreview.successRatePercent,
    isConfirmDisabled: Boolean(isMajorBreakthrough && requiredItemId && !hasItem),
  };
};

export const BreakthroughModal: React.FC<BreakthroughModalProps> = ({
  isOpen,
  onClose,
}) => {
  useBreakthroughResultLog();

  const dispatch = useDispatch<AppDispatch>();
  const character = useSelector((state: RootState) => state.character);
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const {
    title,
    isMajorBreakthrough,
    config,
    requiredItemId,
    requiredItem,
    hasItem,
    breakthroughPreview,
    successRate,
    isConfirmDisabled,
  } = resolveBreakthroughModalState(character, inventory);

  const confirmBreakthrough = () => {
    if (isMajorBreakthrough && requiredItemId) {
      if (!hasItem) {
        dispatch(
          addLog({
            message: `缺少關鍵道具【${requiredItem?.name}】，無法突破！`,
            type: "danger",
          })
        );
        return;
      }

      dispatch(removeItem({ itemId: requiredItemId, count: 1 }));
      dispatch(attemptBreakthrough({ successChanceBonus: 0, consumedItem: true }));
      dispatch(
        addLog({
          message: `服下【${requiredItem?.name}】，運轉全身靈力衝擊瓶頸...`,
          type: "info",
        })
      );
    } else {
      dispatch(attemptBreakthrough({ successChanceBonus: 0 }));
      dispatch(addLog({ message: "運轉全身靈力衝擊瓶頸...", type: "info" }));
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      eyebrow="BREAKTHROUGH RITE"
      icon={
        config.tribulationName ? (
          <Zap size={18} className="text-red-500" />
        ) : (
          <ChevronsUp size={18} className="text-amber-500" />
        )
      }
    >
      <div className="space-y-6 py-2 text-center">
        <div className="flex justify-center">
          <div
            className={`flex h-20 w-20 animate-pulse items-center justify-center rounded-full border-2 bg-stone-800 shadow-[0_0_20px_rgba(245,158,11,0.3)] ${
              config.penaltyType === "major_unsafe"
                ? "border-red-500"
                : "border-amber-500"
            }`}
          >
            {config.tribulationName ? (
              <Zap size={40} className="text-red-500" />
            ) : (
              <ChevronsUp size={40} className="text-amber-500" />
            )}
          </div>
        </div>

        {config.tribulationName && isMajorBreakthrough && (
          <div className="rounded border border-red-900 bg-red-950/50 p-2 text-sm font-bold text-red-200">
            ⚠️ {config.tribulationName} 將至！
          </div>
        )}

        <div>
          <p className="mb-2 text-stone-400">當前境界圓滿，是否嘗試衝擊瓶頸？</p>
          <div className="font-mono text-3xl font-bold text-emerald-400">
            {successRate.toFixed(1)}%{" "}
            <span className="text-sm text-stone-500">成功率</span>
          </div>
          <p className="mt-1 text-xs text-stone-600">
            成功率受悟性、福緣與靈根影響
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {breakthroughPreview.preparationCues.map((cue) => (
              <span
                key={cue}
                className="rounded border border-stone-700 bg-stone-950 px-2 py-1 text-[11px] text-stone-400"
              >
                {cue}
              </span>
            ))}
          </div>
        </div>

        {isMajorBreakthrough && requiredItem && (
          <div
            className={`flex items-center gap-3 rounded border p-4 text-left ${
              hasItem
                ? "border-stone-600 bg-stone-800"
                : "border-red-900 bg-red-950/30"
            }`}
          >
            <div className="rounded border border-stone-700 bg-stone-900 p-2">
              {hasItem ? (
                <ChevronsUp className="text-amber-500" />
              ) : (
                <Lock className="text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <div
                className={hasItem ? "font-bold text-amber-500" : "font-bold text-red-400"}
              >
                需要：{requiredItem.name}
              </div>
              <div className="text-xs text-stone-500">
                {hasItem ? "已持有，點擊突破後消耗" : `未持有 (掉落：${config.bossHint})`}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 rounded border border-stone-800 bg-stone-900/50 p-4 text-left">
          <AlertTriangle
            className={
              config.penaltyType === "major_unsafe"
                ? "text-red-600"
                : "text-orange-500"
            }
          />
          <div className="text-sm">
            <span className="mb-1 block font-bold text-stone-300">失敗懲罰</span>
            <ul className="list-inside list-disc space-y-1 text-xs text-stone-400/80">
              {config.penaltyType === "major_unsafe" ? (
                <>
                  <li className="font-bold text-red-400">
                    天劫失敗：修為盡失 (-100%)
                  </li>
                  <li className="text-red-400">核心道具損毀</li>
                </>
              ) : (
                <li>修為倒退 30%</li>
              )}
              {isMajorBreakthrough && config.penaltyType !== "major_unsafe" && (
                <li className="text-orange-400">道具損毀</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            data-testid="breakthrough-modal-cancel"
          >
            暫緩
          </Button>
          <Button
            onClick={confirmBreakthrough}
            disabled={isConfirmDisabled}
            variant={isConfirmDisabled ? "stone" : "primary"}
            className="flex-1 font-bold shadow-lg"
            data-testid="breakthrough-modal-confirm"
          >
            開始突破
          </Button>
        </div>
      </div>
    </Modal>
  );
};
