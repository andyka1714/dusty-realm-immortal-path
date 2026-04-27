## Context

Reincarnation already supports:

- build identity: `balanced / sword / body / mage`
- route soul seals gated by `requiredWorldMemoryTags`
- heirloom compatibility by selected lane
- rebirth config sanitization using existing planner context

Current route-memory seals use early route tags. This change adds v3 route memory as a higher-tier unlock source, without adding new persisted fields.

## Goals / Non-Goals

Goals:

- Add v3 route memory soul seals or perks for sword / body / mage.
- Read existing `sect:*:world-chapter-03` tags from `soul.worldMemoryTags`.
- Show v3 route source in Reincarnation Hall available / locked seal cards and preview cue.
- Preserve lane-based heirloom constraints.

Non-Goals:

- No new soul schema.
- No migration.
- No new death / rebirth flow.
- No changes to encounter writing of world memory.

## Decisions

### Decision: Add catalog entries, not state shape

V3 hooks are represented as new `DEFAULT_REINCARNATION_SOUL_SEALS` or perks with `requiredWorldMemoryTags`. This reuses existing filtering and sanitization.

### Decision: Use existing UI locked seal rendering

Reincarnation Hall already renders locked seals with unlock requirements. We only ensure descriptions / required tags are explicit enough for v3.

### Decision: Keep heirloom lane rules unchanged

Higher-tier soul seals still use lane `sword / body / mage`; existing heirloom filtering remains the enforcement point.

## Risks / Trade-offs

- Risk: too many available seals crowd the Hall.
  - Mitigation: add one v3 seal per lane and keep copy concise.
- Risk: v3 seals duplicate early route seals.
  - Mitigation: v3 seals require `MajorRealm.Immortal` and `sect:*:world-chapter-03`, and provide distinct identity cue / benefits.
- Risk: accidentally requiring migration.
  - Mitigation: only add catalog data and tests against existing `worldMemoryTags`.

## Migration Plan

No migration. Existing save payload already stores `soul.worldMemoryTags` and `rebirthConfig.selectedSealId`. Invalid selected seals are already sanitized against available seal ids.
