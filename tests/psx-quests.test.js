import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QuestManager } from '../js/combat/quests.js';

test('Task 6: QuestManager initializes at Stage 1: Breach the Garrison', () => {
  const qm = new QuestManager();
  assert.strictEqual(qm.currentStage, 1);
  const q = qm.getCurrentQuest();
  assert.strictEqual(q.id, 'garrison');
  assert.strictEqual(q.title, 'Breach the Garrison');
  assert.strictEqual(q.target, 25);
  assert.strictEqual(q.progress, 0);
  assert.strictEqual(qm.getProgressText(), 'Defeat Wilson Foot Soldiers: 0 / 25');
});

test('Task 6: Registering kills advances Stage 1 and triggers milestone reward', () => {
  const qm = new QuestManager();
  let rewardTriggered = false;
  qm.onQuestComplete = (quest) => {
    if (quest.id === 'garrison') rewardTriggered = true;
  };

  // Add 24 kills -> not complete
  qm.registerKill('soldier', 24);
  assert.strictEqual(qm.currentStage, 1);
  assert.strictEqual(rewardTriggered, false);

  // 25th kill -> completes Stage 1, advances to Stage 2
  qm.registerKill('soldier', 1);
  assert.strictEqual(rewardTriggered, true);
  assert.strictEqual(qm.currentStage, 2);
  assert.strictEqual(qm.getCurrentQuest().id, 'pages');
});

test('Task 6: Collecting pages advances Stage 2 to Stage 3', () => {
  const qm = new QuestManager();
  qm.currentStage = 2; // Jump to stage 2
  let pageReward = false;
  qm.onQuestComplete = (quest) => {
    if (quest.id === 'pages') pageReward = true;
  };

  qm.collectPage();
  qm.collectPage();
  assert.strictEqual(qm.getCurrentQuest().progress, 2);
  assert.strictEqual(pageReward, false);

  qm.collectPage();
  assert.strictEqual(pageReward, true);
  assert.strictEqual(qm.currentStage, 3);
  assert.strictEqual(qm.getCurrentQuest().id, 'hosemaster');
});
