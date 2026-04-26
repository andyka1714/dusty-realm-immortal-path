import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { addSpiritStones, gainExperience } from "../slices/characterSlice";
import { addItem } from "../slices/inventorySlice";
import { addLog } from "../slices/logSlice";
import { addWorldMemoryTags } from "../slices/soulSlice";
import {
  clearPendingEncounter,
  markEncounterResolved,
} from "../slices/encounterSlice";
import { getEncounterChoice, getEncounterEventById } from "../../data/encounters";

export const resolvePendingEncounterChoice = (
  choiceId: string
): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const { encounter } = getState();
    if (!encounter.pendingEvent) {
      return;
    }

    const choice = getEncounterChoice(encounter.pendingEvent, choiceId);
    if (!choice) {
      dispatch(addLog({ message: "機緣已逝，無法辨認這條遭遇分支。", type: "danger" }));
      return;
    }

    const { reward } = choice;
    const event = getEncounterEventById(encounter.pendingEvent.eventId);
    if (reward.experience) {
      dispatch(gainExperience(reward.experience));
    }
    if (reward.spiritStones) {
      dispatch(addSpiritStones({ amount: reward.spiritStones, source: "other" }));
    }
    reward.items?.forEach((item) => {
      dispatch(addItem({ itemId: item.itemId, count: item.count }));
    });

    dispatch(addLog({ message: reward.logMessage, type: "info" }));
    if (event?.chain?.worldMemoryTags?.length) {
      dispatch(addWorldMemoryTags(event.chain.worldMemoryTags));
    }
    dispatch(markEncounterResolved(encounter.pendingEvent.eventId));
    dispatch(clearPendingEncounter());
  };

export const dismissPendingEncounter = (): ThunkAction<
  void,
  RootState,
  unknown,
  Action<string>
> =>
  (dispatch, getState) => {
    const pending = getState().encounter.pendingEvent;
    if (!pending) return;

    const event = getEncounterEventById(pending.eventId);
    dispatch(
      addLog({
        message: event
          ? `你暫且離開【${event.title}】，沒有收取這段機緣。`
          : "你暫且離開這段機緣。",
        type: "info",
      })
    );
    dispatch(clearPendingEncounter());
  };
