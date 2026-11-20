/**
 * Gamehendge 3D In-Run Story Quests & Dialogue Milestones
 */

export class QuestManager {
  constructor() {
    this.currentStage = 1;
    this.onQuestComplete = null;

    this.quests = {
      1: {
        id: 'garrison',
        title: 'Breach the Garrison',
        desc: 'Defeat Wilson Foot Soldiers',
        target: 25,
        progress: 0,
        speaker: 'The Sloth',
        portrait: '🦥',
        dialogue: 'You breached the outer lines... but Wilson still holds the Book. Recover its lost pages!'
      },
      2: {
        id: 'pages',
        title: 'The Lost Pages',
        desc: 'Recover Helping Friendly Book Pages',
        target: 3,
        progress: 0,
        speaker: 'Colonel Forbin',
        portrait: '🧙‍♂️',
        dialogue: 'Three sacred pages reclaimed! The mountain winds whisper of the Hosemaster approaching!'
      },
      3: {
        id: 'hosemaster',
        title: 'The Watchful Hosemaster',
        desc: 'Slay The Hosemaster at 05:00',
        target: 1,
        progress: 0,
        speaker: 'Errand Boy',
        portrait: '👦',
        dialogue: 'The Hosemaster has fallen! Storm Wilson’s citadel and bring peace to Gamehendge!'
      },
      4: {
        id: 'wilson',
        title: 'Storm the Citadel',
        desc: 'Defeat King Wilson at 10:00',
        target: 1,
        progress: 0,
        speaker: 'Icculus',
        portrait: '📖',
        dialogue: 'Gamehendge is liberated! The Helping Friendly Book is restored!'
      }
    };
  }

  getCurrentQuest() {
    return this.quests[this.currentStage] || null;
  }

  getProgressText() {
    const q = this.getCurrentQuest();
    if (!q) return 'All Quests Complete';
    return `${q.desc}: ${q.progress} / ${q.target}`;
  }

  registerKill(enemyType, count = 1) {
    const q = this.getCurrentQuest();
    if (!q) return;

    if (q.id === 'garrison' && (enemyType === 'soldier' || enemyType === 'foot_soldier')) {
      q.progress = Math.min(q.target, q.progress + count);
      if (q.progress >= q.target) {
        this.completeCurrentQuest();
      }
    } else if (q.id === 'hosemaster' && enemyType === 'hosemaster') {
      q.progress = 1;
      this.completeCurrentQuest();
    } else if (q.id === 'wilson' && enemyType === 'wilson') {
      q.progress = 1;
      this.completeCurrentQuest();
    }
  }

  collectPage() {
    const q = this.getCurrentQuest();
    if (!q || q.id !== 'pages') return;

    q.progress = Math.min(q.target, q.progress + 1);
    if (q.progress >= q.target) {
      this.completeCurrentQuest();
    }
  }

  completeCurrentQuest() {
    const q = this.getCurrentQuest();
    if (this.onQuestComplete) {
      this.onQuestComplete(q);
    }
    this.currentStage++;
  }
}
