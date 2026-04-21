import { Enemy, ProfessionType, Skill } from "../types";
import type { PlayerCombatStatsLike } from "./battleTurnPhaseSharedTypes";

export const buildPlayerActivePassiveProcMessages = (options: {
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  skillReady: boolean;
  activeSkill?: Skill;
  isCrit: boolean;
  manaSpringEmpowered: boolean;
  hasMageMahayanaPassive: boolean;
  hasSwordMahayanaPassive: boolean;
  hasMageQiPassive: boolean;
  bodyFoundationStacks: number;
  voidSwordProc: boolean;
}) => {
  const {
    player,
    skillReady,
    activeSkill,
    isCrit,
    manaSpringEmpowered,
    hasMageMahayanaPassive,
    hasSwordMahayanaPassive,
    hasMageQiPassive,
    bodyFoundationStacks,
    voidSwordProc,
  } = options;

  const messages: string[] = [];

  if (manaSpringEmpowered) {
    messages.push("【法力源泉】靈海盈滿，你的術式威能暴漲。");
  }

  if (
    hasMageMahayanaPassive &&
    skillReady &&
    activeSkill?.profession === ProfessionType.Mage
  ) {
    messages.push("【言出法隨】一言牽動萬法，主動術式威能被再度拔升。");
  }

  if (voidSwordProc) {
    messages.push(
      "【法則之劍】劍勢洞穿護體，這一擊額外撕開敵方防禦並抬升暴傷上限。"
    );
  }

  if (hasSwordMahayanaPassive && isCrit) {
    messages.push("【劍道獨尊】單體劍勢攀至極處，暴擊威能再被推上一層。");
  }

  if (
    hasMageQiPassive &&
    !skillReady &&
    player.profession === ProfessionType.Mage
  ) {
    messages.push("【靈潮循環】法力餘波裹住普攻，讓空窗期不致斷勢。");
  }

  if (bodyFoundationStacks > 0) {
    messages.push(
      `【蠻荒血脈】氣血越低，凶性越盛，當前 ${bodyFoundationStacks} 層血脈沸騰同步拔高攻勢。`
    );
  }

  return messages;
};
