import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { addSpiritStones, gainExperience } from "../slices/characterSlice";
import { addItem } from "../slices/inventorySlice";
import { addLog } from "../slices/logSlice";
import {
  clearPendingEncounter,
  markEncounterResolved,
} from "../slices/encounterSlice";
import { getEncounterChoice } from "../../data/encounters";

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
    dispatch(markEncounterResolved(encounter.pendingEvent.eventId));
    dispatch(clearPendingEncounter());
  };
