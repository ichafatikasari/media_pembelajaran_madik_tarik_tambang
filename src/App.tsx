import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Clock,
  Home,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Arena } from './components/Arena';
import { GuideModal } from './components/GuideModal';
import { ResultScreen } from './components/ResultScreen';
import { RopeStepBar } from './components/Rope';
import { HomeMenu, SetupScreen } from './components/SetupScreen';
import { TeacherPanel } from './components/TeacherPanel';
import { TeamQuestionPanel } from './components/TeamQuestionPanel';
import {
  buildTeamQueue,
  getMappedAnswerKey,
  getSpareQuestion,
  getStudentQuestion,
  randomOptionPermutation,
} from './data/questions';
import {
  CharacterPose,
  GameSettings,
  MatchState,
  PlayerRoundAttempt,
  PullHistoryEntry,
  ScreenView,
  TeamId,
  TeamRaceState,
} from './types/game';
import { soundEngine } from './utils/sound';

const STORAGE_KEY = 'arduino_tug_war_50bank_v6';

const DEFAULT_SETTINGS: GameSettings = {
  redName: 'TIM MERAH',
  blueName: 'TIM BIRU',
  redCount: 10,
  blueCount: 10,
  pullersPerTeam: 4,
  questionsPerTeam: 25,
  endMode: 'questions',
  totalTimeMinutes: 3,
  timerSeconds: 15,
  difficultyFilter: 'Semua',
  stepsToWin: 5,
  wrongPullsOpponent: true,
  bonusEnabled: true,
  showExplanation: false,
  allowRepeatQuestion: false,
  videoRecordMode: true,
  lightweightEffects: false,
};

interface PersistedPayload {
  settings: GameSettings;
  match: MatchState | null;
  screen: ScreenView;
  sfxEnabled: boolean;
  musicEnabled: boolean;
}

function loadPersisted(): PersistedPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPayload;
    if (!parsed || !parsed.settings) return null;
    parsed.settings = {
      ...DEFAULT_SETTINGS,
      ...parsed.settings,
      videoRecordMode: parsed.settings.videoRecordMode ?? true,
      lightweightEffects: parsed.settings.lightweightEffects ?? false,
    };
    if (
      parsed.match &&
      (!Array.isArray(parsed.match.red?.playerHistory) ||
        !Array.isArray(parsed.match.blue?.playerHistory))
    ) {
      parsed.match = null;
      parsed.screen = 'HOME';
    }
    if (parsed.match) {
      if (!Array.isArray(parsed.match.pullHistory)) {
        parsed.match.pullHistory = [];
      }
      if (parsed.match.phase === 'PLAYING') {
        parsed.match.phase = 'PAUSED';
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getDangerIdlePose(
  team: TeamId,
  ropePosition: number,
  stepsToWin: number
): CharacterPose {
  if (stepsToWin < 2) return 'idle';
  if (team === 'red' && ropePosition >= stepsToWin - 1) return 'panic';
  if (team === 'blue' && ropePosition <= -(stepsToWin - 1)) return 'panic';
  return 'idle';
}

function pickTiebreakerPlayer(
  memberCount: number,
  lastAnsweredPlayer: number | null
): number {
  if (memberCount <= 1) return 1;
  const candidates: number[] = [];
  for (let i = 1; i <= memberCount; i++) {
    if (i !== lastAnsweredPlayer) {
      candidates.push(i);
    }
  }
  const pool = candidates.length > 0 ? candidates : [1];
  return pool[Math.floor(Math.random() * pool.length)];
}

function createInitialTeamState(
  team: TeamId,
  memberCount: number,
  settings: GameSettings
): TeamRaceState {
  const questionCount = settings.endMode === 'time' ? 50 : settings.questionsPerTeam;
  return {
    teamId: team,
    memberCount,
    queue: buildTeamQueue(
      team,
      questionCount,
      settings.difficultyFilter,
      settings.bonusEnabled
    ),
    questionIndex: 0,
    bankCycle: 1,
    answeredCount: 0,
    spareUsed: 0,
    currentPlayer: 1,
    currentRound: 1,
    lastAnsweredPlayer: null,
    finishedQuestions: false,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    tugPoints: 0,
    timeLeft: settings.timerSeconds,
    feedback: null,
    activePose: 'idle',
    playerHistory: [],
  };
}

function createNewMatch(settings: GameSettings): MatchState {
  return {
    sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    phase: 'COUNTDOWN',
    countdownValue: 3,
    isTiebreaker: false,
    tiebreakerRound: 0,
    ropePosition: 0,
    totalTimeLeft: settings.totalTimeMinutes * 60,
    winner: null,
    endReason: null,
    red: createInitialTeamState('red', settings.redCount, settings),
    blue: createInitialTeamState('blue', settings.blueCount, settings),
    shakeTrigger: 0,
    pullHistory: [],
  };
}

function startTiebreakerRound(
  prev: MatchState,
  settings: GameSettings
): MatchState {
  const nextTieRound = prev.tiebreakerRound + 1;

  const prepareTeam = (team: TeamId, teamState: TeamRaceState): TeamRaceState => {
    const spare =
      getSpareQuestion(team, teamState.spareUsed) ??
      buildTeamQueue(team, 1, settings.difficultyFilter, false)[0];
    const nextQueue = spare ? [...teamState.queue, spare] : teamState.queue;
    const nextIdx = spare ? teamState.queue.length : Math.max(0, teamState.queue.length - 1);
    const chosenPlayer = pickTiebreakerPlayer(
      teamState.memberCount,
      teamState.lastAnsweredPlayer
    );

    return {
      ...teamState,
      queue: nextQueue,
      questionIndex: nextIdx,
      spareUsed: teamState.spareUsed + 1,
      currentPlayer: chosenPlayer,
      finishedQuestions: false,
      timeLeft: settings.timerSeconds,
      feedback: null,
      activePose: 'idle',
    };
  };

  return {
    ...prev,
    isTiebreaker: true,
    tiebreakerRound: nextTieRound,
    red: prepareTeam('red', prev.red),
    blue: prepareTeam('blue', prev.blue),
  };
}

export default function App() {
  const initialRef = useRef<PersistedPayload | null>(loadPersisted());

  const [settings, setSettings] = useState<GameSettings>({
    ...DEFAULT_SETTINGS,
    ...(initialRef.current?.settings ?? {}),
  });
  const [match, setMatch] = useState<MatchState | null>(
    initialRef.current?.match ?? null
  );
  const [screen, setScreen] = useState<ScreenView>(
    initialRef.current?.screen ?? 'HOME'
  );
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(
    initialRef.current?.sfxEnabled ?? true
  );
  const [musicEnabled, setMusicEnabled] = useState<boolean>(
    initialRef.current?.musicEnabled ?? true
  );

  const [guideOpen, setGuideOpen] = useState(false);
  const [teacherPanelOpen, setTeacherPanelOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [stageScale, setStageScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.innerWidth / 1600, window.innerHeight / 900);
  });

  useEffect(() => {
    const updateScale = () => {
      const container = viewportRef.current;
      const w = container?.clientWidth || window.innerWidth;
      const h = container?.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        setStageScale(Math.min(w / 1600, h / 900));
      }
    };

    updateScale();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && viewportRef.current) {
      observer = new ResizeObserver(updateScale);
      observer.observe(viewportRef.current);
    }
    window.addEventListener('resize', updateScale);
    document.addEventListener('fullscreenchange', updateScale);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateScale);
      document.removeEventListener('fullscreenchange', updateScale);
    };
  }, []);

  // Audio sync
  useEffect(() => {
    soundEngine.setSfxEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    soundEngine.setMusicEnabled(musicEnabled);
    if (screen === 'PLAYING' && musicEnabled && match?.phase !== 'PAUSED') {
      soundEngine.startMusic();
    } else {
      soundEngine.stopMusic();
    }
  }, [musicEnabled, screen, match?.phase]);

  // Persistence
  useEffect(() => {
    try {
      const payload: PersistedPayload = {
        settings,
        match,
        screen,
        sfxEnabled,
        musicEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [settings, match, screen, sfxEnabled, musicEnabled]);

  // Fullscreen sync
  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // 1) "3 - 2 - 1 - TARIK!" Initial Countdown
  useEffect(() => {
    if (screen !== 'PLAYING' || match?.phase !== 'COUNTDOWN') return;

    const currentVal = match.countdownValue;
    soundEngine.playCountdown(currentVal === 0);

    const timerId = window.setTimeout(() => {
      if (currentVal > 0) {
        setMatch((prev) =>
          prev && prev.phase === 'COUNTDOWN'
            ? { ...prev, countdownValue: (currentVal - 1) as 3 | 2 | 1 | 0 }
            : prev
        );
      } else {
        setMatch((prev) =>
          prev && prev.phase === 'COUNTDOWN' ? { ...prev, phase: 'PLAYING' } : prev
        );
      }
    }, 620);

    return () => window.clearTimeout(timerId);
  }, [screen, match?.phase, match?.countdownValue]);

  // 2) Evaluate ONE team's tap or timeout independently + append auditable pullHistory
  const evaluateTeamAnswer = useCallback(
    (team: TeamId, selectedOption: number | null, isTimeout: boolean) => {
      setMatch((prev) => {
        if (!prev || prev.phase !== 'PLAYING') return prev;
        const teamState = prev[team];
        if (teamState.feedback !== null) return prev;
        if (teamState.finishedQuestions && !prev.isTiebreaker) return prev;

        const queued = teamState.queue[teamState.questionIndex];
        if (!queued) return prev;
        const answerKey = getMappedAnswerKey(queued);
        if (!answerKey) return prev;

        const otherTeam: TeamId = team === 'red' ? 'blue' : 'red';
        const otherState = prev[otherTeam];

        const isCorrect = !isTimeout && selectedOption === answerKey.correctOption;
        const isBonusWin = isCorrect && queued.isBonus && !prev.isTiebreaker;

        let ropeDeltaTowardTeam = 0;
        let ropeDeltaLabel = 'Tali Diam';

        if (isCorrect) {
          ropeDeltaTowardTeam = isBonusWin ? 2 : 1;
          ropeDeltaLabel = isBonusWin ? '+2 Langkah Bonus!' : '+1 Langkah!';
        } else if (settings.wrongPullsOpponent) {
          ropeDeltaTowardTeam = -1;
          ropeDeltaLabel = 'Tali ke Lawan +1!';
        }

        // Negative ropePosition = Red leads, Positive = Blue leads (UNCLAMPED true net difference!)
        const signedShift =
          team === 'red' ? -ropeDeltaTowardTeam : ropeDeltaTowardTeam;
        const nextRope = prev.ropePosition + signedShift;

        const ropeMovedToSelf = ropeDeltaTowardTeam > 0;
        const ropeMovedToOther = ropeDeltaTowardTeam < 0;

        let nextTeamPose: CharacterPose = teamState.activePose;
        let nextOtherPose: CharacterPose = otherState.activePose;

        if (ropeMovedToSelf) {
          nextTeamPose = 'pull';
          nextOtherPose = 'dragged';
        } else if (ropeMovedToOther) {
          nextTeamPose = 'dragged';
          nextOtherPose = 'pull';
        } else {
          nextTeamPose = 'sad';
        }

        const attemptRecord: PlayerRoundAttempt = {
          playerNumber: teamState.currentPlayer,
          round: teamState.currentRound,
          isCorrect,
          isTimeout,
          isTiebreaker: prev.isTiebreaker,
        };

        const existingHistory = prev.pullHistory ?? [];
        const historyEntry: PullHistoryEntry = {
          id: existingHistory.length + 1,
          timestamp: new Date().toLocaleTimeString('id-ID', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          team,
          playerNumber: teamState.currentPlayer,
          round: teamState.currentRound,
          outcome: isCorrect ? 'correct' : isTimeout ? 'timeout' : 'wrong',
          isBonus: isBonusWin,
          ropeDelta: signedShift,
          ropeAfter: nextRope,
        };

        const updatedTeam: TeamRaceState = {
          ...teamState,
          answeredCount: teamState.answeredCount + 1,
          lastAnsweredPlayer: teamState.currentPlayer,
          correctCount: teamState.correctCount + (isCorrect ? 1 : 0),
          wrongCount: teamState.wrongCount + (isCorrect ? 0 : 1),
          streak: isCorrect ? teamState.streak + 1 : 0,
          tugPoints: teamState.tugPoints + (isCorrect ? ropeDeltaTowardTeam : 0),
          activePose: nextTeamPose,
          playerHistory: [...teamState.playerHistory, attemptRecord],
          feedback: {
            isCorrect,
            isTimeout,
            selectedOption,
            correctOption: answerKey.correctOption,
            explanation: answerKey.explanation,
            ropeDeltaLabel,
          },
        };

        const updatedOther: TeamRaceState = {
          ...otherState,
          tugPoints: otherState.tugPoints + (ropeMovedToOther ? 1 : 0),
          activePose: nextOtherPose,
        };

        return {
          ...prev,
          ropePosition: nextRope,
          shakeTrigger:
            ropeDeltaTowardTeam !== 0 ? prev.shakeTrigger + 1 : prev.shakeTrigger,
          pullHistory: [...existingHistory, historyEntry],
          [team]: updatedTeam,
          [otherTeam]: updatedOther,
        };
      });
    },
    [settings.wrongPullsOpponent]
  );

  // Sound FX triggered cleanly whenever Red or Blue enters feedback state
  const prevRedFbRef = useRef<unknown>(null);
  const prevBlueFbRef = useRef<unknown>(null);

  useEffect(() => {
    const fb = match?.red.feedback ?? null;
    if (fb && fb !== prevRedFbRef.current) {
      if (fb.isCorrect) {
        soundEngine.playCorrect();
        window.setTimeout(() => soundEngine.playRopePull(), 100);
      } else {
        soundEngine.playWrong();
        if (settings.wrongPullsOpponent) {
          window.setTimeout(() => soundEngine.playRopePull(), 120);
        }
      }
    }
    prevRedFbRef.current = fb;
  }, [match?.red.feedback, settings.wrongPullsOpponent]);

  useEffect(() => {
    const fb = match?.blue.feedback ?? null;
    if (fb && fb !== prevBlueFbRef.current) {
      if (fb.isCorrect) {
        soundEngine.playCorrect();
        window.setTimeout(() => soundEngine.playRopePull(), 100);
      } else {
        soundEngine.playWrong();
        if (settings.wrongPullsOpponent) {
          window.setTimeout(() => soundEngine.playRopePull(), 120);
        }
      }
    }
    prevBlueFbRef.current = fb;
  }, [match?.blue.feedback, settings.wrongPullsOpponent]);

  // Settle transient pull/dragged poses back to idle/panic (or 'pull' if waiting) after 650ms
  useEffect(() => {
    if (screen !== 'PLAYING' || match?.phase !== 'PLAYING') return;
    const redTransient =
      match.red.activePose === 'dragged' ||
      (match.red.activePose === 'pull' &&
        match.red.feedback === null &&
        !match.red.finishedQuestions) ||
      (match.red.finishedQuestions && !match.isTiebreaker && match.red.activePose !== 'pull');
    const blueTransient =
      match.blue.activePose === 'dragged' ||
      (match.blue.activePose === 'pull' &&
        match.blue.feedback === null &&
        !match.blue.finishedQuestions) ||
      (match.blue.finishedQuestions && !match.isTiebreaker && match.blue.activePose !== 'pull');

    if (!redTransient && !blueTransient) return;

    const t = window.setTimeout(() => {
      setMatch((prev) => {
        if (!prev || prev.phase !== 'PLAYING') return prev;
        return {
          ...prev,
          red: redTransient
            ? {
                ...prev.red,
                activePose:
                  prev.red.finishedQuestions && !prev.isTiebreaker
                    ? 'pull'
                    : getDangerIdlePose('red', prev.ropePosition, settings.stepsToWin),
              }
            : prev.red,
          blue: blueTransient
            ? {
                ...prev.blue,
                activePose:
                  prev.blue.finishedQuestions && !prev.isTiebreaker
                    ? 'pull'
                    : getDangerIdlePose('blue', prev.ropePosition, settings.stepsToWin),
              }
            : prev.blue,
        };
      });
    }, 650);
    return () => window.clearTimeout(t);
  }, [
    screen,
    match?.phase,
    match?.isTiebreaker,
    match?.red.activePose,
    match?.red.feedback,
    match?.red.finishedQuestions,
    match?.blue.activePose,
    match?.blue.feedback,
    match?.blue.finishedQuestions,
    settings.stepsToWin,
  ]);

  // 3) Advance ONE team independently (sequential relay rotation + endMode + tiebreaker)
  const advanceTeam = useCallback(
    (team: TeamId) => {
      setMatch((prev) => {
        if (!prev || prev.phase !== 'PLAYING') return prev;
        const teamState = prev[team];
        if (teamState.feedback === null) return prev;

        const otherTeam: TeamId = team === 'red' ? 'blue' : 'red';
        const otherState = prev[otherTeam];

        if (prev.isTiebreaker) {
          if (otherState.feedback === null) {
            return prev;
          }

          if (prev.ropePosition !== 0) {
            const winner: TeamId = prev.ropePosition < 0 ? 'red' : 'blue';
            const loser: TeamId = winner === 'red' ? 'blue' : 'red';
            return {
              ...prev,
              phase: 'FINISHED',
              winner,
              endReason: 'tiebreaker',
              [winner]: { ...prev[winner], activePose: 'cheer' as CharacterPose },
              [loser]: { ...prev[loser], activePose: 'fall' as CharacterPose },
            };
          }

          return startTiebreakerRound(prev, settings);
        }

        const wrapped = teamState.currentPlayer >= teamState.memberCount;
        const nextPlayer = wrapped ? 1 : teamState.currentPlayer + 1;
        const nextRound = wrapped ? teamState.currentRound + 1 : teamState.currentRound;
        const nextIdx = teamState.questionIndex + 1;

        if (nextIdx < teamState.queue.length) {
          return {
            ...prev,
            [team]: {
              ...teamState,
              questionIndex: nextIdx,
              currentPlayer: nextPlayer,
              currentRound: nextRound,
              timeLeft: settings.timerSeconds,
              feedback: null,
              activePose: getDangerIdlePose(
                team,
                prev.ropePosition,
                settings.stepsToWin
              ),
            },
          };
        }

        if (settings.endMode === 'time') {
          return {
            ...prev,
            [team]: {
              ...teamState,
              queue: buildTeamQueue(
                team,
                50,
                settings.difficultyFilter,
                settings.bonusEnabled
              ),
              questionIndex: 0,
              bankCycle: teamState.bankCycle + 1,
              currentPlayer: nextPlayer,
              currentRound: nextRound,
              timeLeft: settings.timerSeconds,
              feedback: null,
              activePose: getDangerIdlePose(
                team,
                prev.ropePosition,
                settings.stepsToWin
              ),
            },
          };
        }

        const finishedTeamState: TeamRaceState = {
          ...teamState,
          currentPlayer: nextPlayer,
          currentRound: nextRound,
          finishedQuestions: true,
          feedback: null,
          activePose: 'pull',
        };

        if (!otherState.finishedQuestions) {
          return {
            ...prev,
            [team]: finishedTeamState,
          };
        }

        const nextMatchState: MatchState = {
          ...prev,
          [team]: finishedTeamState,
        };

        if (nextMatchState.ropePosition !== 0) {
          const winner: TeamId = nextMatchState.ropePosition < 0 ? 'red' : 'blue';
          const loser: TeamId = winner === 'red' ? 'blue' : 'red';
          return {
            ...nextMatchState,
            phase: 'FINISHED',
            winner,
            endReason: 'questions_exhausted',
            [winner]: { ...nextMatchState[winner], activePose: 'cheer' as CharacterPose },
            [loser]: { ...nextMatchState[loser], activePose: 'fall' as CharacterPose },
          };
        }

        return startTiebreakerRound(nextMatchState, settings);
      });
    },
    [settings]
  );

  // 4A) Independent Timer for TIM MERAH
  const redTimerRunning =
    screen === 'PLAYING' &&
    match?.phase === 'PLAYING' &&
    match.red.feedback === null &&
    !(match.red.finishedQuestions && !match.isTiebreaker) &&
    match.red.timeLeft > 0;

  useEffect(() => {
    if (!redTimerRunning) return;
    const id = window.setInterval(() => {
      setMatch((prev) => {
        if (
          !prev ||
          prev.phase !== 'PLAYING' ||
          prev.red.feedback !== null ||
          (prev.red.finishedQuestions && !prev.isTiebreaker)
        ) {
          return prev;
        }
        if (prev.red.timeLeft <= 0) return prev;
        const nextVal = prev.red.timeLeft - 1;
        if (nextVal > 0 && nextVal <= 3) {
          soundEngine.playTimerTick();
        }
        return {
          ...prev,
          red: { ...prev.red, timeLeft: nextVal },
        };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [redTimerRunning, match?.red.questionIndex, match?.red.bankCycle, match?.tiebreakerRound]);

  useEffect(() => {
    if (
      screen === 'PLAYING' &&
      match?.phase === 'PLAYING' &&
      match.red.feedback === null &&
      !(match.red.finishedQuestions && !match.isTiebreaker) &&
      match.red.timeLeft === 0
    ) {
      evaluateTeamAnswer('red', null, true);
    }
  }, [
    screen,
    match?.phase,
    match?.isTiebreaker,
    match?.red.feedback,
    match?.red.finishedQuestions,
    match?.red.timeLeft,
    evaluateTeamAnswer,
  ]);

  useEffect(() => {
    if (
      screen !== 'PLAYING' ||
      match?.phase !== 'PLAYING' ||
      match.red.feedback === null
    ) {
      return;
    }
    const delay = settings.showExplanation ? 2000 : 800;
    const t = window.setTimeout(() => advanceTeam('red'), delay);
    return () => window.clearTimeout(t);
  }, [
    screen,
    match?.phase,
    match?.red.feedback,
    match?.blue.feedback,
    match?.isTiebreaker,
    settings.showExplanation,
    advanceTeam,
  ]);

  // 4B) Independent Timer for TIM BIRU
  const blueTimerRunning =
    screen === 'PLAYING' &&
    match?.phase === 'PLAYING' &&
    match.blue.feedback === null &&
    !(match.blue.finishedQuestions && !match.isTiebreaker) &&
    match.blue.timeLeft > 0;

  useEffect(() => {
    if (!blueTimerRunning) return;
    const id = window.setInterval(() => {
      setMatch((prev) => {
        if (
          !prev ||
          prev.phase !== 'PLAYING' ||
          prev.blue.feedback !== null ||
          (prev.blue.finishedQuestions && !prev.isTiebreaker)
        ) {
          return prev;
        }
        if (prev.blue.timeLeft <= 0) return prev;
        const nextVal = prev.blue.timeLeft - 1;
        if (nextVal > 0 && nextVal <= 3) {
          soundEngine.playTimerTick();
        }
        return {
          ...prev,
          blue: { ...prev.blue, timeLeft: nextVal },
        };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [blueTimerRunning, match?.blue.questionIndex, match?.blue.bankCycle, match?.tiebreakerRound]);

  useEffect(() => {
    if (
      screen === 'PLAYING' &&
      match?.phase === 'PLAYING' &&
      match.blue.feedback === null &&
      !(match.blue.finishedQuestions && !match.isTiebreaker) &&
      match.blue.timeLeft === 0
    ) {
      evaluateTeamAnswer('blue', null, true);
    }
  }, [
    screen,
    match?.phase,
    match?.isTiebreaker,
    match?.blue.feedback,
    match?.blue.finishedQuestions,
    match?.blue.timeLeft,
    evaluateTeamAnswer,
  ]);

  useEffect(() => {
    if (
      screen !== 'PLAYING' ||
      match?.phase !== 'PLAYING' ||
      match.blue.feedback === null
    ) {
      return;
    }
    const delay = settings.showExplanation ? 2000 : 800;
    const t = window.setTimeout(() => advanceTeam('blue'), delay);
    return () => window.clearTimeout(t);
  }, [
    screen,
    match?.phase,
    match?.blue.feedback,
    match?.red.feedback,
    match?.isTiebreaker,
    settings.showExplanation,
    advanceTeam,
  ]);

  // 4C) Total Match Timer for endMode === 'time' | 'both'
  const totalClockRunning =
    screen === 'PLAYING' &&
    match?.phase === 'PLAYING' &&
    settings.endMode !== 'questions' &&
    !match.isTiebreaker &&
    (match?.totalTimeLeft ?? 0) > 0;

  useEffect(() => {
    if (!totalClockRunning) return;
    const id = window.setInterval(() => {
      setMatch((prev) => {
        if (
          !prev ||
          prev.phase !== 'PLAYING' ||
          prev.isTiebreaker ||
          prev.totalTimeLeft <= 0
        ) {
          return prev;
        }
        const next = prev.totalTimeLeft - 1;
        if (next > 0) {
          return { ...prev, totalTimeLeft: next };
        }

        const clearedMatch: MatchState = {
          ...prev,
          totalTimeLeft: 0,
          red: { ...prev.red, feedback: null },
          blue: { ...prev.blue, feedback: null },
        };

        if (clearedMatch.ropePosition !== 0) {
          const winner: TeamId = clearedMatch.ropePosition < 0 ? 'red' : 'blue';
          const loser: TeamId = winner === 'red' ? 'blue' : 'red';
          return {
            ...clearedMatch,
            phase: 'FINISHED',
            winner,
            endReason: 'time_up',
            [winner]: { ...clearedMatch[winner], activePose: 'cheer' as CharacterPose },
            [loser]: { ...clearedMatch[loser], activePose: 'fall' as CharacterPose },
          };
        }

        return startTiebreakerRound(clearedMatch, settings);
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [totalClockRunning, settings]);

  // 5) Victory Transition -> Show brief celebratory pose on Schoolyard then Results
  useEffect(() => {
    if (screen !== 'PLAYING' || match?.phase !== 'FINISHED') return;
    soundEngine.playVictory();
    const t = window.setTimeout(() => {
      setScreen('RESULTS');
    }, 950);
    return () => window.clearTimeout(t);
  }, [screen, match?.phase]);

  // Teacher controls
  const handleTogglePause = useCallback(() => {
    setMatch((prev) => {
      if (!prev) return prev;
      if (prev.phase === 'PLAYING') return { ...prev, phase: 'PAUSED' };
      if (prev.phase === 'PAUSED') return { ...prev, phase: 'PLAYING' };
      return prev;
    });
  }, []);

  const handleRepeatTeamQuestion = useCallback(
    (team: TeamId) => {
      setMatch((prev) => {
        if (!prev) return prev;
        const teamState = prev[team];
        const currQ = teamState.queue[teamState.questionIndex];
        if (!currQ) return prev;
        const updatedQueue = [...teamState.queue];
        updatedQueue[teamState.questionIndex] = {
          ...currQ,
          optionOrder: randomOptionPermutation(),
        };
        return {
          ...prev,
          [team]: {
            ...teamState,
            queue: updatedQueue,
            timeLeft: settings.timerSeconds,
            feedback: null,
            activePose: getDangerIdlePose(
              team,
              prev.ropePosition,
              settings.stepsToWin
            ),
          },
        };
      });
    },
    [settings.timerSeconds, settings.stepsToWin]
  );

  const handleStartNewGame = useCallback(
    (overrideSettings?: GameSettings) => {
      const activeSettings = overrideSettings ?? settings;
      if (overrideSettings) {
        setSettings(overrideSettings);
      }
      const fresh = createNewMatch(activeSettings);
      setMatch(fresh);
      setScreen('PLAYING');
    },
    [settings]
  );

  const handleResetMatch = useCallback(() => {
    const fresh = createNewMatch(settings);
    setMatch(fresh);
    setScreen('PLAYING');
  }, [settings]);

  const handleFinishEarly = useCallback(() => {
    setMatch((prev) => {
      if (!prev) return prev;
      const winner: TeamId | 'tie' =
        prev.ropePosition < 0 ? 'red' : prev.ropePosition > 0 ? 'blue' : 'tie';
      return {
        ...prev,
        phase: 'FINISHED',
        winner,
        endReason: 'manual',
        red: {
          ...prev.red,
          activePose: winner === 'blue' ? 'fall' : 'cheer',
        },
        blue: {
          ...prev.blue,
          activePose: winner === 'red' ? 'fall' : 'cheer',
        },
      };
    });
    soundEngine.playVictory();
    setScreen('RESULTS');
  }, []);

  const redQueued = match ? match.red.queue[match.red.questionIndex] : undefined;
  const blueQueued = match ? match.blue.queue[match.blue.questionIndex] : undefined;

  const redQuestion = redQueued ? getStudentQuestion(redQueued) : null;
  const blueQuestion = blueQueued ? getStudentQuestion(blueQueued) : null;

  return (
    <div
      ref={viewportRef}
      data-video-mode={settings.videoRecordMode ? 'on' : 'off'}
      data-light-fx={settings.lightweightEffects ? 'on' : 'off'}
      className="fixed inset-0 bg-[#0B1B4D] overflow-hidden flex items-center justify-center text-white"
    >
      <div
        className="relative w-[1600px] h-[900px] shrink-0 overflow-hidden bg-[#071338]"
        style={{
          transform: `scale(${stageScale})`,
          transformOrigin: 'center center',
        }}
      >
        <div key={screen} className="w-[1600px] h-[900px] animate-screen-enter">
          {screen === 'HOME' && (
            <HomeMenu
              settings={settings}
              hasActiveMatch={Boolean(match && match.phase !== 'FINISHED')}
              sfxEnabled={sfxEnabled}
              musicEnabled={musicEnabled}
              isFullscreen={isFullscreen}
              onStartNewGame={() => handleStartNewGame()}
              onResumeMatch={() => {
                if (match) setScreen('PLAYING');
              }}
              onOpenSettings={() => setScreen('SETTINGS')}
              onOpenGuide={() => setGuideOpen(true)}
              onToggleSfx={() => setSfxEnabled((v) => !v)}
              onToggleMusic={() => setMusicEnabled((v) => !v)}
              onToggleFullscreen={toggleFullscreen}
            />
          )}

          {screen === 'SETTINGS' && (
            <SetupScreen
              settings={settings}
              onSaveSettings={(next) => setSettings(next)}
              onStartWithSettings={(next) => handleStartNewGame(next)}
              onResetSettings={() => {
                setSettings(DEFAULT_SETTINGS);
                return DEFAULT_SETTINGS;
              }}
              onBackToMenu={() => setScreen('HOME')}
            />
          )}

          {screen === 'PLAYING' && match && (
            <div className="w-[1600px] h-[900px] overflow-hidden flex flex-col bg-[#071338] text-white">
              {/* 1) HUD TOP BAR: fixed 64px height */}
              <header className="h-[64px] shrink-0 px-[24px] bg-[#0B1B4D] border-b-[4px] border-[#FFD400] text-white flex items-center justify-between gap-[16px]">
                {/* Left: Crisp Red Triangle ▲ Icon + Big Benar Score + Salah */}
                <div className="flex items-center gap-[12px] min-w-0">
                  <div
                    aria-label={settings.redName}
                    className="w-[46px] h-[46px] rounded-2xl bg-[#FF1744] border-[3px] border-[#FFD400] shadow-[0_3px_0_#780016] flex items-center justify-center shrink-0"
                  >
                    <span className="text-white text-[22px] font-bold leading-none text-outline-dark">
                      ▲
                    </span>
                  </div>

                  <div className="flex items-center gap-[12px] min-w-0">
                    <div className="flex flex-col items-center leading-none bg-[#5E0012] border-[3px] border-[#FF1744] rounded-xl px-[12px] py-[3px] shadow-[0_3px_0_#040B24]">
                      <span className="text-[10px] font-bold uppercase text-[#FFD400] leading-none">
                        Benar
                      </span>
                      <span
                        key={match.red.correctCount}
                        className="animate-score-pop font-display font-bold text-[34px] leading-none text-white tabular-nums text-outline-heavy"
                      >
                        {match.red.correctCount}
                      </span>
                    </div>

                    <div className="flex flex-col leading-tight min-w-0">
                      <p className="font-display font-bold text-[17px] text-[#FF5277] truncate max-w-[180px] text-outline-dark">
                        {settings.redName}
                      </p>
                      <p className="text-[14px] font-bold text-[#FFB3C1] tabular-nums">
                        Salah: <span className="text-white">{match.red.wrongCount}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center: Total Match Timer + >=44px Labeled Action Buttons */}
                <div className="flex items-center gap-[8px] shrink-0">
                  {settings.endMode !== 'questions' && (
                    <div
                      className={`inline-flex items-center gap-[6px] px-[14px] rounded-xl border-2 font-mono font-bold text-[17px] tabular-nums h-[46px] ${
                        match.isTiebreaker
                          ? 'bg-[#7C4DFF] border-[#FFD400] text-white'
                          : match.totalTimeLeft <= 15
                          ? 'bg-[#FF1744] border-[#FFD400] text-white animate-timer-urgent'
                          : 'bg-[#071338] border-[#FFD400] text-[#FFD400]'
                      }`}
                    >
                      <Clock className="w-[18px] h-[18px]" />
                      <span>
                        {match.isTiebreaker
                          ? 'PENENTUAN'
                          : formatClock(match.totalTimeLeft)}
                      </span>
                    </div>
                  )}

                  {(match.phase === 'PLAYING' || match.phase === 'PAUSED') && (
                    <button
                      type="button"
                      onClick={handleTogglePause}
                      title={match.phase === 'PAUSED' ? 'Lanjutkan Permainan' : 'Jeda Permainan'}
                      className="btn-3d inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl bg-[#FFD400] hover:bg-[#FFE042] text-[#0B1B4D] border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px]"
                    >
                      {match.phase === 'PAUSED' ? (
                        <>
                          <Play className="w-[16px] h-[16px] fill-current" />
                          <span className="text-[11px] leading-none">Lanjut</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-[16px] h-[16px]" />
                          <span className="text-[11px] leading-none">Jeda</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setTeacherPanelOpen(true)}
                    title="Panel Kontrol, Rekap, Riwayat & Kunci Guru"
                    className="btn-3d inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl bg-[#1E6BFF] hover:bg-[#3B82FF] text-white border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px]"
                  >
                    <SlidersHorizontal className="w-[16px] h-[16px]" />
                    <span className="text-[11px] leading-none">Guru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    aria-label="Panduan"
                    title="Panduan Permainan"
                    className="btn-3d inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl bg-[#7C4DFF] hover:bg-[#936EFF] text-white border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px]"
                  >
                    <BookOpen className="w-[16px] h-[16px]" />
                    <span className="text-[11px] leading-none">Panduan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMusicEnabled((v) => !v)}
                    aria-label="Musik"
                    title={musicEnabled ? 'Matikan Musik' : 'Nyalakan Musik'}
                    className={`btn-3d inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px] ${
                      musicEnabled ? 'bg-[#FFD400] text-[#0B1B4D]' : 'bg-[#16307A] text-[#93C5FD]'
                    }`}
                  >
                    <Music className="w-[16px] h-[16px]" />
                    <span className="text-[11px] leading-none">Musik</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSfxEnabled((v) => !v)}
                    aria-label="Suara"
                    title={sfxEnabled ? 'Matikan Efek Suara' : 'Nyalakan Efek Suara'}
                    className={`btn-3d inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px] ${
                      sfxEnabled ? 'bg-[#00C853] text-white' : 'bg-[#16307A] text-[#93C5FD]'
                    }`}
                  >
                    {sfxEnabled ? <Volume2 className="w-[16px] h-[16px]" /> : <VolumeX className="w-[16px] h-[16px]" />}
                    <span className="text-[11px] leading-none">Suara</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label="Layar Penuh"
                    title="Mode Layar Penuh"
                    className="btn-3d inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl bg-[#16307A] hover:bg-[#1D3E9E] text-white border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px]"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-[16px] h-[16px]" />
                    ) : (
                      <Maximize2 className="w-[16px] h-[16px]" />
                    )}
                    <span className="text-[11px] leading-none">Layar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmResetOpen(true)}
                    aria-label="Reset Permainan"
                    title="Reset Permainan"
                    className="btn-3d-red inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl bg-[#FF1744] hover:bg-[#FF3D64] text-white border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px]"
                  >
                    <RotateCcw className="w-[16px] h-[16px]" />
                    <span className="text-[11px] leading-none">Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('HOME')}
                    aria-label="Menu Utama"
                    title="Kembali ke Menu Utama"
                    className="btn-3d inline-flex flex-col items-center justify-center gap-[2px] px-[12px] rounded-xl bg-[#16307A] hover:bg-[#1D3E9E] text-white border-2 border-[#040B24] font-bold cursor-pointer min-w-[56px] h-[46px]"
                  >
                    <Home className="w-[16px] h-[16px]" />
                    <span className="text-[11px] leading-none">Menu</span>
                  </button>
                </div>

                {/* Right: Big Benar Score + Salah + Crisp Blue Circle ● Icon */}
                <div className="flex items-center gap-[12px] min-w-0">
                  <div className="flex items-center gap-[12px] min-w-0">
                    <div className="flex flex-col leading-tight text-right min-w-0">
                      <p className="font-display font-bold text-[17px] text-[#60A5FA] truncate max-w-[180px] text-outline-dark">
                        {settings.blueName}
                      </p>
                      <p className="text-[14px] font-bold text-[#93C5FD] tabular-nums">
                        Salah: <span className="text-white">{match.blue.wrongCount}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-center leading-none bg-[#0A2FA8] border-[3px] border-[#1E6BFF] rounded-xl px-[12px] py-[3px] shadow-[0_3px_0_#040B24]">
                      <span className="text-[10px] font-bold uppercase text-[#FFD400] leading-none">
                        Benar
                      </span>
                      <span
                        key={match.blue.correctCount}
                        className="animate-score-pop font-display font-bold text-[34px] leading-none text-white tabular-nums text-outline-heavy"
                      >
                        {match.blue.correctCount}
                      </span>
                    </div>
                  </div>

                  <div
                    aria-label={settings.blueName}
                    className="w-[46px] h-[46px] rounded-2xl bg-[#1E6BFF] border-[3px] border-[#FFD400] shadow-[0_3px_0_#051B6B] flex items-center justify-center shrink-0"
                  >
                    <span className="text-white text-[22px] font-bold leading-none text-outline-dark">
                      ●
                    </span>
                  </div>
                </div>
              </header>

              {/* 2) ARENA (270px) + ROPE STEP BAR (44px) + DUAL QUESTION PANELS (480px) inside 836px body */}
              <main className="h-[836px] shrink-0 flex flex-col px-[24px] py-[10px] gap-[11px] overflow-hidden">
                <Arena match={match} settings={settings} />

                <RopeStepBar
                  ropePosition={match.ropePosition}
                  stepsToWin={settings.stepsToWin}
                />

                <section
                  aria-label="Arena Soal Tim Merah dan Tim Biru"
                  className="h-[480px] shrink-0 grid grid-cols-2 gap-[16px]"
                >
                  <TeamQuestionPanel
                    teamId="red"
                    teamName={settings.redName}
                    question={redQuestion}
                    teamState={match.red}
                    phase={match.phase}
                    isTiebreaker={match.isTiebreaker}
                    tiebreakerRound={match.tiebreakerRound}
                    timerSeconds={settings.timerSeconds}
                    showExplanation={settings.showExplanation}
                    lightweightEffects={settings.lightweightEffects}
                    onAnswerTap={(idx) => evaluateTeamAnswer('red', idx, false)}
                  />

                  <TeamQuestionPanel
                    teamId="blue"
                    teamName={settings.blueName}
                    question={blueQuestion}
                    teamState={match.blue}
                    phase={match.phase}
                    isTiebreaker={match.isTiebreaker}
                    tiebreakerRound={match.tiebreakerRound}
                    timerSeconds={settings.timerSeconds}
                    showExplanation={settings.showExplanation}
                    lightweightEffects={settings.lightweightEffects}
                    onAnswerTap={(idx) => evaluateTeamAnswer('blue', idx, false)}
                  />
                </section>
              </main>

              <TeacherPanel
                isOpen={teacherPanelOpen}
                match={match}
                settings={settings}
                onClose={() => setTeacherPanelOpen(false)}
                onTogglePause={handleTogglePause}
                onToggleShowExplanation={() =>
                  setSettings((p) => ({ ...p, showExplanation: !p.showExplanation }))
                }
                onToggleWrongPullsOpponent={() =>
                  setSettings((p) => ({
                    ...p,
                    wrongPullsOpponent: !p.wrongPullsOpponent,
                  }))
                }
                onRepeatTeamQuestion={handleRepeatTeamQuestion}
                onResetMatch={handleResetMatch}
                onFinishEarly={handleFinishEarly}
              />

              {confirmResetOpen && (
                <div
                  role="dialog"
                  aria-modal="true"
                  className="absolute inset-0 z-50 flex items-center justify-center bg-[#040B24]/80 p-[24px]"
                >
                  <div className="animate-pop-in bg-[#0B1B4D] text-white rounded-3xl border-[5px] border-[#FF1744] card-3d-red w-[520px] p-[28px] space-y-[18px]">
                    <h3 className="font-display font-bold text-[26px] text-[#FFD400] text-outline-dark">
                      Reset Permainan?
                    </h3>
                    <p className="text-[17px] font-semibold text-white/95 leading-[1.35]">
                      Skor kedua tim, posisi tali, riwayat tarikan, rekap pemain, dan giliran estafet
                      akan dikembalikan ke awal serta seluruh soal akan diacak ulang.
                    </p>
                    <div className="flex justify-end gap-[12px]">
                      <button
                        type="button"
                        onClick={() => setConfirmResetOpen(false)}
                        className="btn-3d px-[20px] py-[10px] rounded-xl border-2 border-[#040B24] bg-[#16307A] hover:bg-[#1D3E9E] font-bold text-[16px] text-white cursor-pointer min-h-[46px]"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmResetOpen(false);
                          handleResetMatch();
                        }}
                        className="btn-3d-red px-[22px] py-[10px] rounded-xl bg-[#FF1744] hover:bg-[#FF3D64] border-2 border-[#040B24] font-bold text-[16px] text-white cursor-pointer min-h-[46px]"
                      >
                        Ya, Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {screen === 'RESULTS' && match && (
            <ResultScreen
              match={match}
              settings={settings}
              onPlayAgain={() => handleStartNewGame()}
              onBackToMenu={() => setScreen('HOME')}
            />
          )}
        </div>

        <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      </div>
    </div>
  );
}
