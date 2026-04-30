import { Gender } from "../types";

export const getPlayerSpriteAssetId = (gender: Gender): string =>
  gender === Gender.Female
    ? "character.player.mortal_female.v1"
    : "character.player.mortal_male.v1";

export const getPlayerCombatSpriteAssetId = (gender: Gender): string =>
  gender === Gender.Female
    ? "character.player.mortal_female.combat_v1"
    : "character.player.mortal_male.combat_v1";
