import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BREAKTHROUGH_TEXTS, GENERIC_BREAKTHROUGH_TEXT } from "../../data/game_text";
import { addLog } from "../../store/slices/logSlice";
import { AppDispatch, RootState } from "../../store/store";

let processedBreakthroughTimestamp = 0;

export const useBreakthroughResultLog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const lastBreakthroughResult = useSelector(
    (state: RootState) => state.character.lastBreakthroughResult
  );
  const majorRealm = useSelector((state: RootState) => state.character.majorRealm);

  useEffect(() => {
    if (
      !lastBreakthroughResult ||
      lastBreakthroughResult.timestamp <= processedBreakthroughTimestamp
    ) {
      return;
    }

    processedBreakthroughTimestamp = lastBreakthroughResult.timestamp;

    if (lastBreakthroughResult.success) {
      if (lastBreakthroughResult.isMajor) {
        const text =
          BREAKTHROUGH_TEXTS[majorRealm]?.success ||
          "金光乍現，瓶頸轟然破碎！壽元大增，修為更進一步！";
        dispatch(addLog({ message: text, type: "gold" }));
      } else {
        dispatch(
          addLog({
            message: GENERIC_BREAKTHROUGH_TEXT.minorSuccess,
            type: "success",
          })
        );
      }
      return;
    }

    if (lastBreakthroughResult.isMajor) {
      const text =
        BREAKTHROUGH_TEXTS[majorRealm]?.failure ||
        (lastBreakthroughResult.isTribulation
          ? GENERIC_BREAKTHROUGH_TEXT.tribulationFailure
          : "突破失敗，心魔干擾...");
      dispatch(
        addLog({
          message: text,
          type: lastBreakthroughResult.isTribulation ? "tribulation" : "danger",
        })
      );
      return;
    }

    dispatch(
      addLog({
        message: lastBreakthroughResult.dropRealm
          ? GENERIC_BREAKTHROUGH_TEXT.realmDropFailure
          : GENERIC_BREAKTHROUGH_TEXT.minorFailure,
        type: "danger",
      })
    );
  }, [dispatch, lastBreakthroughResult, majorRealm]);
};
