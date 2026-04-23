import { Action, ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { WORKSHOP_RECIPES, getWorkshopDisciplineLevel } from "../../data/workshopRecipes";
import { deductSpiritStones } from "../slices/characterSlice";
import { addItem, removeItem } from "../slices/inventorySlice";
import { addLog } from "../slices/logSlice";
import { recordRecipeCrafted } from "../slices/workshopSlice";
import { MajorRealmCN } from "../../types";

const getStackableItemCount = (state: RootState, itemId: string) =>
  state.inventory.items
    .filter((slot) => slot.itemId === itemId && !slot.instanceId)
    .reduce((total, slot) => total + slot.count, 0);

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

    if (state.character.spiritStones < recipe.spiritStoneCost) {
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

    dispatch(deductSpiritStones(recipe.spiritStoneCost));
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
        masteryYield: recipe.masteryYield ?? 1,
      })
    );
    dispatch(
      addLog({
        message: `百業運轉成功，已完成【${recipe.name}】，${recipe.discipline === "alchemy" ? "丹道" : "器道"}熟練 +${recipe.masteryYield ?? 1}。`,
        type: "success",
      })
    );
  };
