import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  WORKSHOP_RECIPES,
  getWorkshopDisciplineLevel,
  getWorkshopRecipeCraftingPlan,
} from "../../data/workshopRecipes";
import {
  getWorkshopSpecializationNode,
  getWorkshopSpecializationNodeStatus,
  getWorkshopSpecializationResetCost,
} from "../../data/workshopSpecializationTree";
import { deductSpiritStones } from "../slices/characterSlice";
import { addItem, removeItem } from "../slices/inventorySlice";
import { addLog } from "../slices/logSlice";
import {
  activateWorkshopSpecializationNode,
  recordRecipeCrafted,
  resetWorkshopSpecializationTree,
  unlockWorkshopSpecializationNode,
} from "../slices/workshopSlice";
import { MajorRealmCN, type WorkshopDiscipline } from "../../types";

const getStackableItemCount = (state: RootState, itemId: string) =>
  state.inventory.items
    .filter((slot) => slot.itemId === itemId && !slot.instanceId)
    .reduce((total, slot) => total + slot.count, 0);

const getDisciplineLabel = (discipline: WorkshopDiscipline) =>
  discipline === "alchemy" ? "丹道" : "器道";

export const selectWorkshopSpecialization = ({
  discipline,
  specializationId,
}: {
  discipline: WorkshopDiscipline;
  specializationId: string | null;
}): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const state = getState();
    const currentTreeState = state.workshop.specializationTreeByDiscipline[discipline];

    if (specializationId === null) {
      const resetCost = getWorkshopSpecializationResetCost(state.workshop, discipline);

      if (currentTreeState.unlockedNodeIds.length === 0) {
        dispatch(addLog({ message: `${getDisciplineLabel(discipline)}尚未選定專精。`, type: "info" }));
        return;
      }

      if (state.character.spiritStones < resetCost) {
        dispatch(addLog({ message: `靈石不足，無法重置${getDisciplineLabel(discipline)}專精。`, type: "danger" }));
        return;
      }

      dispatch(deductSpiritStones(resetCost));
      dispatch(resetWorkshopSpecializationTree({ discipline }));
      dispatch(addLog({ message: `已重置${getDisciplineLabel(discipline)}專精。`, type: "success" }));
      return;
    }

    const specialization = getWorkshopSpecializationNode(specializationId);

    if (!specialization || specialization.discipline !== discipline) {
      dispatch(addLog({ message: "專精資料不符，無法切換。", type: "danger" }));
      return;
    }

    if (currentTreeState.activeNodeId === specializationId) {
      dispatch(addLog({ message: `已選定${getDisciplineLabel(discipline)}專精：${specialization.name}。`, type: "info" }));
      return;
    }

    const status = getWorkshopSpecializationNodeStatus({
      workshop: state.workshop,
      node: specialization,
      majorRealm: state.character.majorRealm,
      spiritStones: state.character.spiritStones,
    });
    if (!status.isAvailable) {
      dispatch(addLog({ message: status.lockReason ?? status.conflictReason ?? "專精條件不足。", type: "danger" }));
      return;
    }

    if (status.requiredCost > 0) {
      dispatch(deductSpiritStones(status.requiredCost));
    }

    if (status.isUnlocked) {
      dispatch(activateWorkshopSpecializationNode({ discipline, nodeId: specialization.id }));
      dispatch(addLog({ message: `已切換${getDisciplineLabel(discipline)}專精：${specialization.name}。`, type: "success" }));
      return;
    }

    dispatch(unlockWorkshopSpecializationNode({ discipline, nodeId: specialization.id }));
    dispatch(addLog({ message: `已解鎖並啟用${getDisciplineLabel(discipline)}專精：${specialization.name}。`, type: "success" }));
  };

export const craftWorkshopRecipe = (
  recipeId: string
): ThunkAction<void, RootState, unknown, Action<string>> =>
  (dispatch, getState) => {
    const state = getState();
    const recipe = WORKSHOP_RECIPES[recipeId];

    if (!recipe) {
      dispatch(addLog({ message: "丹方殘缺，無法辨識此百業配方。", type: "danger" }));
      return;
    }

    if (!state.workshop.unlockedRecipes.includes(recipeId)) {
      dispatch(addLog({ message: `尚未掌握【${recipe.name}】的配方。`, type: "danger" }));
      return;
    }

    if (recipe.minRealm !== undefined && state.character.majorRealm < recipe.minRealm) {
      dispatch(
        addLog({
          message: `境界不足，需達${MajorRealmCN[recipe.minRealm]}後才能施作【${recipe.name}】。`,
          type: "danger",
        })
      );
      return;
    }

    const disciplineLevel = getWorkshopDisciplineLevel(
      state.workshop,
      recipe.discipline
    );
    if (disciplineLevel < recipe.requiredLevel) {
      dispatch(addLog({
        message: `${recipe.discipline === "alchemy" ? "煉丹爐" : "煉器台"}火候不足，無法施作【${recipe.name}】。`,
        type: "danger",
      }));
      return;
    }

    const craftingPlan = getWorkshopRecipeCraftingPlan(recipe, state.workshop);

    if (state.character.spiritStones < craftingPlan.spiritStoneCost) {
      dispatch(addLog({ message: `靈石不足，無法完成【${recipe.name}】。`, type: "danger" }));
      return;
    }

    const missingIngredient = recipe.ingredients.find(
      (ingredient) => getStackableItemCount(state, ingredient.itemId) < ingredient.count
    );

    if (missingIngredient) {
      dispatch(addLog({
        message: `材料不足，缺少 ${missingIngredient.count} 份【${missingIngredient.itemId}】所需資材。`,
        type: "danger",
      }));
      return;
    }

    dispatch(deductSpiritStones(craftingPlan.spiritStoneCost));
    recipe.ingredients.forEach((ingredient) => {
      dispatch(removeItem({ itemId: ingredient.itemId, count: ingredient.count }));
    });
    recipe.outputs.forEach((output) => {
      dispatch(
        addItem({
          itemId: output.itemId,
          count: output.count,
          quality: output.quality,
        })
      );
    });
    dispatch(
      recordRecipeCrafted({
        recipeId,
        discipline: recipe.discipline,
        masteryYield: craftingPlan.masteryYield,
      })
    );
    const specializationCue = craftingPlan.activeSpecialization
      ? `，專精：${craftingPlan.activeSpecialization.name}`
      : "";
    dispatch(
      addLog({
        message: `百業運轉成功，已完成【${recipe.name}】，${recipe.discipline === "alchemy" ? "丹道" : "器道"}熟練 +${craftingPlan.masteryYield}${specializationCue}。`,
        type: "success",
      })
    );
  };
