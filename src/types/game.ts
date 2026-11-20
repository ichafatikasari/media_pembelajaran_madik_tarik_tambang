export type TeamId = 'red' | 'blue';

export type ScreenView = 'HOME' | 'SETTINGS' | 'PLAYING' | 'RESULTS';

export type MatchPhase = 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'FINISHED';

export type EndMode = 'questions' | 'time' | 'both';

export type EndReason =
  | 'questions_exhausted'
  | 'time_up'
  | 'tiebreaker'
  | 'manual';

export type CharacterPose =
  | 'idle'
  | 'pull'
  | 'dragged'
  | 'panic'
  | 'cheer'
  | 'sad'
  | 'fall';

export type QuestionDifficulty = 'Mudah' | 'Sedang' | 'Sulit';

export type DifficultyFilter = 'Semua' | QuestionDifficulty;

export type TotalTimeOption = 3 | 5 | 10; // minutes

export type QuestionsCountOption = 10 | 25 | 50;

export interface QuestionPrompt {
  id: string;
  pairNumber: number;
  team: TeamId;
  category: string;
  difficulty: QuestionDifficulty;
  isBonus: boolean;
  prompt: string;
  codeSnippet?: string;
  options: [string, string, string, string];
}

export interface QuestionAnswerKey {
  id: string;
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface QueuedQuestion {
  id: string;
  optionOrder: [number, number, number, number];
  isBonus: boolean;
  isSuddenDeath?: boolean;
}

export interface PlayerRoundAttempt {
  playerNumber: number;
  round: number;
  isCorrect: boolean;
  isTimeout: boolean;
  isTiebreaker?: boolean;
}

export interface PullHistoryEntry {
  id: number;
  timestamp: string;
  team: TeamId;
  playerNumber: number;
  round: number;
  outcome: 'correct' | 'wrong' | 'timeout';
  isBonus: boolean;
  ropeDelta: number; // negative = toward Red, positive = toward Blue
  ropeAfter: number;
}

export interface GameSettings {
  redName: string;
  blueName: string;
  redCount: number;
  blueCount: number;
  pullersPerTeam: 3 | 4 | 5;
  questionsPerTeam: QuestionsCountOption;
  endMode: EndMode;
  totalTimeMinutes: TotalTimeOption;
  timerSeconds: 10 | 15 | 20;
  difficultyFilter: DifficultyFilter;
  stepsToWin: number; // visual finish line distance 3..10 (does NOT end the game)
  wrongPullsOpponent: boolean; // default true
  bonusEnabled: boolean;
  showExplanation: boolean; // default false
  allowRepeatQuestion: boolean; // default false
  videoRecordMode: boolean; // default true
  lightweightEffects: boolean; // default false
}

export interface TeamInstantFeedback {
  isCorrect: boolean;
  isTimeout: boolean;
  selectedOption: number | null;
  correctOption: number;
  explanation: string;
  ropeDeltaLabel: string;
}

export interface TeamRaceState {
  teamId: TeamId;
  memberCount: number;
  queue: QueuedQuestion[];
  questionIndex: number;
  bankCycle: number;
  answeredCount: number;
  spareUsed: number;
  currentPlayer: number; // 1-based
  currentRound: number; // 1-based
  lastAnsweredPlayer: number | null;
  finishedQuestions: boolean;
  correctCount: number;
  wrongCount: number;
  streak: number;
  tugPoints: number;
  timeLeft: number;
  feedback: TeamInstantFeedback | null;
  activePose: CharacterPose;
  playerHistory: PlayerRoundAttempt[];
}

export interface MatchState {
  sessionId: string;
  phase: MatchPhase;
  countdownValue: 3 | 2 | 1 | 0;
  isTiebreaker: boolean;
  tiebreakerRound: number;
  /** True unclamped net rope difference: Negative = Red leads, Positive = Blue leads */
  ropePosition: number;
  totalTimeLeft: number; // seconds when endMode is 'time' or 'both'
  winner: TeamId | 'tie' | null;
  endReason: EndReason | null;
  red: TeamRaceState;
  blue: TeamRaceState;
  shakeTrigger: number;
  pullHistory: PullHistoryEntry[];
}
