import { describe, expect, it } from "vitest";
import characterReducer from "../../store/slices/characterSlice";
import inventoryReducer from "../../store/slices/inventorySlice";
import { MajorRealm, SpiritRootId } from "../../types";
import { resolveBreakthroughModalState } from "./BreakthroughModal";

const createMajorBreakthroughState = () => {
  const baseCharacter = characterReducer(undefined, { type: "@@INIT" });
  const character = {
    ...baseCharacter,
    isInitialized: true,
    majorRealm: MajorRealm.Mortal,
    minorRealm: 9,
    currentExp: 100,
    maxExp: 100,
    isBreakthroughAvailable: true,
    spiritRootId: SpiritRootId.HEAVENLY_WATER,
  };
  const inventory = {
    ...inventoryReducer(undefined, { type: "@@INIT" }),
    items: [],
  };

  return { character, inventory };
};

describe("BreakthroughModal", () => {
  it("blocks major breakthrough confirmation when the required item is missing", () => {
    const { character, inventory } = createMajorBreakthroughState();
    const state = resolveBreakthroughModalState(character, inventory.items);

    expect(state.title).toBe("衝擊大境界");
    expect(state.requiredItem?.name).toBe("引氣洗髓丹");
    expect(state.hasItem).toBe(false);
    expect(state.config.bossHint).toContain("守塚老屍");
    expect(state.isConfirmDisabled).toBe(true);
  });
});
