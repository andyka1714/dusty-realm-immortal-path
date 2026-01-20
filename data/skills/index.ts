import { Skill } from "../../types";
import { FOUNDATION_SKILLS } from "./foundation";
import { GOLDEN_CORE_SKILLS } from "./golden_core";
import { NASCENT_SOUL_SKILLS } from "./nascent_soul";
import { SPIRIT_SEVERING_SKILLS } from "./spirit_severing";
import { VOID_REFINING_SKILLS } from "./void_refining";
import { FUSION_SKILLS } from "./fusion";
import { MAHAYANA_SKILLS } from "./mahayana";
import { TRIBULATION_SKILLS } from "./tribulation";
import { IMMORTAL_SKILLS } from "./immortal";
import { IMMORTAL_EMPEROR_SKILLS } from "./immortal_emperor";

export const SKILLS: Record<string, Skill> = {
  ...FOUNDATION_SKILLS,
  ...GOLDEN_CORE_SKILLS,
  ...NASCENT_SOUL_SKILLS,
  ...SPIRIT_SEVERING_SKILLS,
  ...VOID_REFINING_SKILLS,
  ...FUSION_SKILLS,
  ...MAHAYANA_SKILLS,
  ...TRIBULATION_SKILLS,
  ...IMMORTAL_SKILLS,
  ...IMMORTAL_EMPEROR_SKILLS,
};

export const getSkill = (id: string): Skill | undefined => SKILLS[id];
