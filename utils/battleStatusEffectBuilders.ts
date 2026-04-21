import { Enemy, ProfessionType, Skill } from "../types";
import { getCanonicalSkillId } from "./battlePassives";
import { getStatusLabel } from "./battleStatusLabels";
import type {
  CombatStatusKindLike,
  CombatStatusLike,
} from "./battleStatusTypes";

export const createSwordQiArmorBreakStatus = (
  currentTimeMs: number
): CombatStatusLike => ({
  id: "sword_meridian_break",
  name: "劍脈破甲",
  kind: "armorBreak",
  value: 0.08,
  expiresAtMs: currentTimeMs + 2000,
  nextTickAtMs: undefined,
});

export const buildStatusesFromEnemySpecial = (
  specialAttack?: Enemy["specialAttack"],
  targetMaxHp?: number
): CombatStatusLike[] => {
  if (!specialAttack?.statusEffect) return [];

  const { id, duration, chance, value } = specialAttack.statusEffect;
  if (Math.random() > chance) return [];

  let kind: CombatStatusKindLike = "incapacitate";
  if (id === "burn" || id === "true_fire_burn") kind = "burn";
  else if (id === "poison") kind = "poison";
  else if (id === "bleed") kind = "bleed";
  else if (id === "armorBreak") kind = "armorBreak";
  else if (id === "vulnerable") kind = "vulnerable";
  else if (id === "drain") kind = "drain";

  return [
    {
      id,
      name: getStatusLabel(id),
      kind,
      value:
        value ??
        (kind === "burn"
          ? 0.02
          : kind === "poison"
            ? 0.018
            : kind === "bleed"
              ? 0.015
              : kind === "armorBreak"
                ? 0.1
                : kind === "vulnerable"
                  ? 0.12
                : kind === "drain"
                  ? 0.04
                  : targetMaxHp ?? 0),
      expiresAtMs: duration * 1000,
      nextTickAtMs:
        kind === "burn" ||
        kind === "poison" ||
        kind === "bleed" ||
        kind === "drain"
          ? 1000
          : undefined,
    },
  ];
};

export const buildStatusesFromSkill = (
  skill: Skill,
  targetMaxHp: number
): CombatStatusLike[] => {
  const statuses: CombatStatusLike[] = [];
  const expiresAtMs = (skill.statusEffect?.duration ?? 0) * 1000;
  const canonicalSkillId = getCanonicalSkillId(skill);

  if (skill.statusEffect) {
    const base = {
      id: skill.statusEffect.id,
      name: getStatusLabel(skill.statusEffect.id),
      value: skill.statusEffect.value ?? 0,
      expiresAtMs,
      nextTickAtMs: 1000,
    };

    switch (skill.statusEffect.id) {
      case "stun":
      case "freeze":
      case "paralyze":
      case "banish":
        statuses.push({ ...base, kind: "incapacitate" });
        break;
      case "true_fire_burn":
      case "burn":
        statuses.push({ ...base, kind: "burn" });
        break;
      case "poison":
        statuses.push({ ...base, kind: "poison" });
        break;
      case "bleed":
        statuses.push({ ...base, kind: "bleed" });
        break;
      case "earth_shatter_debuff":
        statuses.push({
          id: "vulnerable",
          name: getStatusLabel("vulnerable"),
          kind: "vulnerable",
          value: Math.max(0.12, (skill.statusEffect.value ?? 0.3) * 0.4),
          expiresAtMs,
          nextTickAtMs: undefined,
        });
      // fall through
      case "armorBreak":
        statuses.push({
          ...base,
          kind: "armorBreak",
          value: skill.statusEffect.value ?? 0.3,
          nextTickAtMs: undefined,
        });
        break;
      case "vulnerable":
        statuses.push({
          ...base,
          kind: "vulnerable",
          value: skill.statusEffect.value ?? 0.12,
          nextTickAtMs: undefined,
        });
        break;
      case "reflect_taunt":
        statuses.push({
          ...base,
          kind: "reflect",
          value: skill.statusEffect.value ?? 0.5,
        });
        break;
      case "taunt":
        statuses.push({
          ...base,
          kind: "taunt",
          nextTickAtMs: undefined,
        });
        break;
      case "sword_qi":
        statuses.push({
          ...base,
          kind: "critBoost",
          value: skill.statusEffect.value ?? 5,
          nextTickAtMs: undefined,
        });
        break;
      case "beast_god_form":
        statuses.push(
          {
            id: "beast_god_form_frenzy",
            name: getStatusLabel("beast_god_form"),
            kind: "damageAmp",
            value: 0.3,
            expiresAtMs,
            nextTickAtMs: undefined,
          },
          {
            id: "beast_god_form_leech",
            name: getStatusLabel("beast_god_form"),
            kind: "lifesteal",
            value: 0.2,
            expiresAtMs,
            nextTickAtMs: undefined,
          },
          {
            id: "beast_god_form_guard",
            name: getStatusLabel("beast_god_form"),
            kind: "controlImmune",
            value: 1,
            expiresAtMs,
            nextTickAtMs: undefined,
          }
        );
        break;
      case "god_kingdom":
        statuses.push({
          ...base,
          kind: "drain",
          value: skill.statusEffect.value ?? 0.1,
        });
        break;
      case "spirit_sever":
        statuses.push({
          ...base,
          kind: "armorBreak",
          value: skill.statusEffect.value ?? 0.18,
          nextTickAtMs: undefined,
        });
        break;
      case "zhuxian_domain":
        statuses.push({
          ...base,
          kind: "burn",
          value: 0.03,
        });
        statuses.push({
          id: "zhuxian_break",
          name: "誅仙劍陣",
          kind: "armorBreak",
          value: skill.statusEffect.value ?? 0.3,
          expiresAtMs,
          nextTickAtMs: undefined,
        });
        break;
    }
  }

  if (skill.id === "b_g_active") {
    statuses.push({
      id: "shield",
      name: "護盾",
      kind: "shield",
      value: Math.floor(targetMaxHp * 0.2),
      expiresAtMs: 2 * 1000,
    });
  }

  if (skill.id === "b_bi_active" || canonicalSkillId === "b_ma_active") {
    statuses.push({
      id: "giant_form_guard",
      name: "法天象地",
      kind: "shield",
      value: Math.floor(targetMaxHp * 0.35),
      expiresAtMs: 5 * 1000,
    });
  }

  if (
    canonicalSkillId === "b_vr_active" &&
    !statuses.some((status) => status.kind === "reflect")
  ) {
    statuses.push({
      id: "battle_tribulation_reflect",
      name: "反震",
      kind: "reflect",
      value: 0.5,
      expiresAtMs: 3 * 1000,
      nextTickAtMs: undefined,
    });
  }

  if (
    canonicalSkillId === "s_tr_active" &&
    !statuses.some((status) => status.name === "誅仙劍陣")
  ) {
    statuses.push({
      id: "zhuxian_burn",
      name: "燃燒",
      kind: "burn",
      value: 0.03,
      expiresAtMs: 5 * 1000,
      nextTickAtMs: 1000,
    });
    statuses.push({
      id: "zhuxian_break",
      name: "誅仙劍陣",
      kind: "armorBreak",
      value: 0.3,
      expiresAtMs: 5 * 1000,
      nextTickAtMs: undefined,
    });
  }

  if (
    canonicalSkillId === "m_tr_active" &&
    !statuses.some((status) => status.id === "paralyze")
  ) {
    statuses.push({
      id: "paralyze",
      name: getStatusLabel("paralyze"),
      kind: "incapacitate",
      value: 0,
      expiresAtMs: 1000,
      nextTickAtMs: undefined,
    });
  }

  if (
    canonicalSkillId === "b_n_active" &&
    !statuses.some((status) => status.id === "beast_god_form_guard")
  ) {
    statuses.push(
      {
        id: "beast_god_form_frenzy",
        name: getStatusLabel("beast_god_form"),
        kind: "damageAmp",
        value: 0.3,
        expiresAtMs: 3 * 1000,
        nextTickAtMs: undefined,
      },
      {
        id: "beast_god_form_leech",
        name: getStatusLabel("beast_god_form"),
        kind: "lifesteal",
        value: 0.2,
        expiresAtMs: 3 * 1000,
        nextTickAtMs: undefined,
      },
      {
        id: "beast_god_form_guard",
        name: getStatusLabel("beast_god_form"),
        kind: "controlImmune",
        value: 1,
        expiresAtMs: 3 * 1000,
        nextTickAtMs: undefined,
      }
    );
  }

  return statuses;
};
