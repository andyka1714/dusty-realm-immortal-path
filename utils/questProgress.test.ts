import { describe, expect, it } from 'vitest';
import { MajorRealm, Quest, QuestType } from '../types';
import {
  resolveQuestReadinessAtNpc,
  resolveQuestKillProgressOnEnemyDefeat,
} from './questProgress';

const levelAndKillQuest: Quest = {
  id: 'test_foundation_kill',
  type: QuestType.Side,
  title: '測試任務',
  description: '同時要求境界與擊殺',
  giverId: 'quest_npc',
  submitNpcId: 'quest_npc',
  requirements: [
    { type: 'level', minRealm: MajorRealm.Foundation },
    { type: 'kill', targetId: 'm32_b1', count: 1 },
  ],
  rewards: [],
  dialogue: {
    start: ['start'],
    progress: ['progress'],
    complete: ['complete'],
  },
};

const dialogueOnlyQuest: Quest = {
  id: 'test_dialogue_submit',
  type: QuestType.Side,
  title: '對話任務',
  description: '只要求到指定 NPC 對話',
  giverId: 'guide_npc',
  submitNpcId: 'blacksmith_npc',
  requirements: [{ type: 'dialogue', targetNpcId: 'blacksmith_npc' }],
  rewards: [],
  dialogue: {
    start: ['start'],
    progress: ['progress'],
    complete: ['complete'],
  },
};

describe('questProgress', () => {
  it('does not mark a level+kill quest ready before the kill target is defeated', () => {
    const ready = resolveQuestReadinessAtNpc({
      quest: levelAndKillQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      majorRealm: MajorRealm.Foundation,
      npcId: 'quest_npc',
    });

    expect(ready).toBe(false);
  });

  it('marks a level+kill quest ready after defeating the matching target', () => {
    const update = resolveQuestKillProgressOnEnemyDefeat({
      quest: levelAndKillQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      defeatedEnemyId: 'm32_b1',
      majorRealm: MajorRealm.Foundation,
    });

    expect(update).toEqual({
      progress: 1,
      isReadyToComplete: true,
    });
  });

  it('ignores unrelated enemy defeats', () => {
    const update = resolveQuestKillProgressOnEnemyDefeat({
      quest: levelAndKillQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      defeatedEnemyId: 'm42_b1',
      majorRealm: MajorRealm.Foundation,
    });

    expect(update).toBeNull();
  });

  it('marks a dialogue-only quest ready at the correct NPC', () => {
    const ready = resolveQuestReadinessAtNpc({
      quest: dialogueOnlyQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      majorRealm: MajorRealm.Mortal,
      npcId: 'blacksmith_npc',
    });

    expect(ready).toBe(true);
  });

  it('does not mark a dialogue-only quest ready at the wrong NPC', () => {
    const ready = resolveQuestReadinessAtNpc({
      quest: dialogueOnlyQuest,
      activeQuestState: { progress: 0, isReadyToComplete: false },
      majorRealm: MajorRealm.Mortal,
      npcId: 'guide_npc',
    });

    expect(ready).toBe(false);
  });
});
