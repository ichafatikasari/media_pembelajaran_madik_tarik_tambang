import React, { useEffect, useState } from 'react';
import { CheckCircle2, Flame, ShieldAlert, Star, XCircle, Zap } from 'lucide-react';
import {
  MatchPhase,
  QuestionPrompt,
  TeamId,
  TeamRaceState,
} from '../types/game';
import { AutoFitText } from './AutoFitText';
import { Timer } from './Timer';

interface TeamQuestionPanelProps {
  teamId: TeamId;
  teamName: string;
  question: QuestionPrompt | null;
  teamState: TeamRaceState;
  phase: MatchPhase;
  isTiebreaker: boolean;
  tiebreakerRound: number;
  timerSeconds: number;
  showExplanation: boolean;
  lightweightEffects?: boolean;
  onAnswerTap: (optionIndex: number) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

const CONFETTI_BURST_VECTORS = [
  { tx: '-88px', ty: '-52px', tx2: '-110px', ty2: '-10px', color: '#FFD400' },
  { tx: '-54px', ty: '-68px', tx2: '-68px', ty2: '-18px', color: '#00C853' },
  { tx: '-18px', ty: '-74px', tx2: '-22px', ty2: '-24px', color: '#29B6FF' },
  { tx: '22px', ty: '-74px', tx2: '28px', ty2: '-22px', color: '#FF1744' },
  { tx: '58px', ty: '-64px', tx2: '72px', ty2: '-14px', color: '#FF9100' },
  { tx: '90px', ty: '-48px', tx2: '112px', ty2: '-6px', color: '#7C4DFF' },
  { tx: '-72px', ty: '-36px', tx2: '-92px', ty2: '6px', color: '#00E676' },
  { tx: '74px', ty: '-36px', tx2: '94px', ty2: '8px', color: '#FFD400' },
  { tx: '-36px', ty: '-58px', tx2: '-42px', ty2: '-8px', color: '#FF9100' },
  { tx: '38px', ty: '-58px', tx2: '44px', ty2: '-8px', color: '#29B6FF' },
  { tx: '0px', ty: '-82px', tx2: '4px', ty2: '-26px', color: '#FFD400' },
  { tx: '-102px', ty: '-30px', tx2: '-124px', ty2: '10px', color: '#7C4DFF' },
];

export const TeamQuestionPanel: React.FC<TeamQuestionPanelProps> = ({
  teamId,
  teamName,
  question,
  teamState,
  phase,
  isTiebreaker,
  tiebreakerRound,
  timerSeconds,
  showExplanation,
  lightweightEffects = false,
  onAnswerTap,
}) => {
  const isRed = teamId === 'red';
  const feedback = teamState.feedback;
  const isLocked = feedback !== null;
  const isWaitingForOpponent = teamState.finishedQuestions && !isTiebreaker;
  const isPlaying = phase === 'PLAYING' && !isWaitingForOpponent;
  const isBlocked = phase === 'COUNTDOWN' || phase === 'PAUSED' || phase === 'FINISHED';

  const [tightOptions, setTightOptions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setTightOptions({});
  }, [question?.id]);

  const frameBorder = isRed
    ? 'border-[#FF1744] card-3d-red'
    : 'border-[#1E6BFF] card-3d-blue';

  const headerBg = isRed
    ? 'bg-gradient-to-r from-[#B80023] to-[#FF1744] text-white border-b-[3px] border-[#040B24]'
    : 'bg-gradient-to-r from-[#0A2FA8] to-[#1E6BFF] text-white border-b-[3px] border-[#040B24]';

  const shakePanel = feedback && !feedback.isCorrect ? 'animate-panel-shake' : '';

  const totalInSet = teamState.queue.length || 25;
  const questionNumDisplay = Math.min(teamState.questionIndex + 1, totalInSet);
  const burstParticles = lightweightEffects
    ? CONFETTI_BURST_VECTORS.slice(0, 5)
    : CONFETTI_BURST_VECTORS;

  const hasCode = Boolean(question?.codeSnippet);

  return (
    <div
      className={`relative flex flex-col h-[480px] rounded-2xl border-[4px] bg-gradient-to-b from-[#0B1B4D] to-[#16307A] text-white overflow-hidden ${frameBorder} ${shakePanel}`}
    >
      {/* Header (64px content box): ▲/● Nama Tim, Pemain X/Y, Putaran R, Soal N/T (ONCE), Timer 64px */}
      <div
        className={`h-[64px] box-content px-[16px] flex items-center justify-between gap-[12px] shrink-0 ${headerBg}`}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-center gap-[3px]">
          <div className="flex items-center gap-[8px] flex-nowrap overflow-hidden">
            <span className="inline-flex items-center gap-[6px] font-display font-bold text-[19px] leading-[1.2] text-outline-dark whitespace-nowrap">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md bg-[#040B24] text-[#FFD400] text-[12px]"
              >
                {isRed ? '▲' : '●'}
              </span>
              {teamName}
            </span>

            {isTiebreaker ? (
              <span className="inline-flex items-center gap-[4px] px-[10px] py-[2px] rounded-lg bg-[#7C4DFF] border-2 border-[#FFD400] text-white font-display font-bold text-[13px] leading-[1.2] text-outline-dark whitespace-nowrap">
                <ShieldAlert className="w-[14px] h-[14px] text-[#FFD400]" />
                PENENTUAN {tiebreakerRound > 1 ? `#${tiebreakerRound}` : ''}
              </span>
            ) : (
              <span className="text-[14px] leading-[1.2] font-bold bg-[#040B24]/85 border border-white/30 px-[10px] py-[2px] rounded-lg whitespace-nowrap tabular-nums text-[#FFD400]">
                Soal {questionNumDisplay}/{totalInSet}
                {teamState.bankCycle > 1 ? ` (Set ${teamState.bankCycle})` : ''}
              </span>
            )}

            {teamState.streak >= 3 && !isWaitingForOpponent && (
              <span className="animate-pop-in inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-lg bg-[#FF9100] text-[#040B24] font-display font-bold text-[12px] leading-[1.2] border-2 border-[#040B24] whitespace-nowrap">
                <Flame className="w-[14px] h-[14px] fill-current" />
                COMBO {teamState.streak}x
              </span>
            )}

            {question?.isBonus && !isTiebreaker && !isWaitingForOpponent && (
              <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-lg bg-[#FFD400] text-[#040B24] font-display font-bold text-[12px] leading-[1.2] border-2 border-[#040B24] whitespace-nowrap">
                <Zap className="w-[14px] h-[14px] fill-current" />
                BONUS x2
              </span>
            )}
          </div>

          <p className="text-[14px] leading-[1.2] font-bold text-white/95 tabular-nums truncate text-outline-dark">
            {isTiebreaker
              ? `Wakil Penentuan: Pemain ${teamState.currentPlayer} / ${teamState.memberCount}`
              : `Pemain ${teamState.currentPlayer}/${teamState.memberCount} • Putaran ${teamState.currentRound}`}
          </p>
        </div>

        <Timer
          timeLeft={teamState.timeLeft}
          totalSeconds={timerSeconds}
          isPaused={phase !== 'PLAYING' || isLocked || isWaitingForOpponent}
        />
      </div>

      {/* Main Content Area (405px fixed height, ZERO scrollbars): Question Card + 2x2 Options Grid */}
      <div className="relative flex-1 flex flex-col p-[12px] gap-[10px] min-h-0 overflow-hidden">
        {feedback && !feedback.isCorrect && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-[#FF1744]/20"
          />
        )}

        {feedback?.isCorrect && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-[#00C853]/15" />
            <div className="relative flex items-center gap-[24px] -translate-y-[16px]">
              <Star className="animate-pop-in w-[28px] h-[28px] fill-[#FFD400] text-[#040B24]" />
              <Star className="animate-pop-in w-[40px] h-[40px] fill-[#FFD400] text-[#040B24]" />
              <Star className="animate-pop-in w-[28px] h-[28px] fill-[#FFD400] text-[#040B24]" />
            </div>
            {burstParticles.map((p, idx) => (
              <span
                key={`${teamState.answeredCount}-${idx}`}
                className="animate-confetti-burst absolute top-1/2 left-1/2 w-[12px] h-[12px] rounded-xs border border-[#040B24]"
                style={
                  {
                    backgroundColor: p.color,
                    '--tx': p.tx,
                    '--ty': p.ty,
                    '--tx2': p.tx2,
                    '--ty2': p.ty2,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        {!isBlocked && isWaitingForOpponent && (
          <div className="absolute inset-0 z-20 bg-[#064E1D]/95 text-white flex flex-col items-center justify-center p-[24px] text-center space-y-[8px]">
            <div className="w-[56px] h-[56px] rounded-2xl bg-[#00C853] border-[3px] border-[#040B24] shadow-[0_4px_0_#040B24] flex items-center justify-center">
              <CheckCircle2 className="w-[32px] h-[32px] text-white" />
            </div>
            <p className="font-display font-bold text-[32px] leading-[1.2] text-[#FFD400] text-outline-dark">
              SELESAI ✔
            </p>
            <p className="text-[18px] leading-[1.3] font-bold text-white">
              Menunggu tim lawan menyelesaikan {totalInSet} soalnya
            </p>
            <p className="text-[15px] leading-[1.3] font-bold text-[#69F0AE] tabular-nums">
              Benar: {teamState.correctCount} · Salah: {teamState.wrongCount}
            </p>
          </div>
        )}

        {isBlocked && (
          <div className="absolute inset-0 z-20 bg-[#040B24]/90 text-white flex flex-col items-center justify-center p-[20px] text-center">
            <p className="font-display font-bold text-[28px] leading-[1.2] text-[#FFD400] text-outline-dark">
              {phase === 'COUNTDOWN'
                ? 'Bersiap...'
                : phase === 'PAUSED'
                ? 'Permainan Dijeda'
                : 'Pertandingan Selesai!'}
            </p>
            <p className="text-[16px] leading-[1.3] font-semibold text-[#93C5FD] mt-[6px]">
              {phase === 'COUNTDOWN'
                ? 'Tunggu peluit wasit: 3 - 2 - 1 - TARIK!'
                : phase === 'PAUSED'
                ? 'Menunggu guru menekan Lanjut'
                : 'Menampilkan hasil akhir...'}
            </p>
          </div>
        )}

        {question ? (
          <>
            {/* Question Box: fits content cleanly up to max-h-[170px]; side-by-side when code snippet exists */}
            <div className="shrink-0 max-h-[170px] rounded-xl bg-[#071338] border-[3px] border-[#29B6FF]/55 px-[14px] py-[10px] overflow-hidden">
              {hasCode ? (
                <div className="flex flex-row items-center gap-[12px]">
                  <div className="flex-1 min-w-0">
                    <AutoFitText
                      as="h3"
                      text={question.prompt}
                      minSize={20}
                      maxSize={32}
                      lineHeight={1.3}
                      containerClassName="max-h-[144px]"
                      className="font-bold text-white text-outline-dark"
                    />
                  </div>
                  <div className="w-[49%] shrink-0 px-[10px] py-[6px] rounded-lg bg-[#040B24] border-2 border-[#00C853]/70">
                    <AutoFitText
                      as="pre"
                      text={question.codeSnippet ?? ''}
                      minSize={16}
                      maxSize={22}
                      lineHeight={1.25}
                      containerClassName="max-h-[132px]"
                      className="font-mono text-[#69F0AE] whitespace-pre-wrap break-words"
                    />
                  </div>
                </div>
              ) : (
                <AutoFitText
                  as="h3"
                  text={question.prompt}
                  minSize={20}
                  maxSize={32}
                  lineHeight={1.3}
                  containerClassName="max-h-[144px]"
                  className="font-bold text-white text-outline-dark"
                />
              )}
            </div>

            {/* 2x2 Options Grid: fills remaining panel height evenly (min-h >= 84px per button) */}
            <div className="flex-1 grid grid-cols-2 auto-rows-fr gap-[12px] min-h-0">
              {question.options.map((optText, idx) => {
                const isSelected = feedback?.selectedOption === idx;
                const isCorrectOpt = feedback !== null && feedback.correctOption === idx;
                const isWrongSelected =
                  feedback !== null && isSelected && !feedback.isCorrect;

                let btnClass =
                  'bg-[#1D3E9E] hover:bg-[#254EC4] border-[#040B24] text-white btn-3d';
                let letterClass = isRed
                  ? 'bg-[#FF1744] text-white border-[#040B24]'
                  : 'bg-[#29B6FF] text-[#040B24] border-[#040B24]';

                if (feedback) {
                  if (isCorrectOpt) {
                    btnClass =
                      'bg-[#00C853] border-[#040B24] text-white ring-[3px] ring-[#FFD400] btn-3d';
                    letterClass = 'bg-[#FFD400] text-[#040B24] border-[#040B24]';
                  } else if (isWrongSelected) {
                    btnClass = 'bg-[#FF1744] border-[#040B24] text-white btn-3d-red';
                    letterClass = 'bg-[#040B24] text-white border-white/40';
                  } else {
                    btnClass =
                      'bg-[#0A1845] border-[#040B24] text-[#93C5FD]/60 opacity-65 shadow-[0_3px_0_#040B24]';
                    letterClass = 'bg-[#16307A] text-[#93C5FD]/60 border-[#040B24]';
                  }
                }

                const useTightPad = Boolean(tightOptions[idx]);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isPlaying || isLocked}
                    onPointerDown={(e) => {
                      if (e.button === 2) return;
                      if (!isPlaying || isLocked) return;
                      e.preventDefault();
                      onAnswerTap(idx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (!isPlaying || isLocked) return;
                        e.preventDefault();
                        onAnswerTap(idx);
                      }
                    }}
                    className={`h-full min-h-[84px] w-full flex items-center gap-[10px] rounded-2xl border-[3px] text-left leading-[1.3] ${
                      useTightPad ? 'px-[10px] py-[4px]' : 'px-[16px] py-[10px]'
                    } ${isPlaying && !isLocked ? 'cursor-pointer' : 'cursor-default'} ${btnClass}`}
                  >
                    <span
                      className={`w-[40px] h-[40px] rounded-xl border-2 font-display font-bold text-[20px] leading-none flex items-center justify-center shrink-0 ${letterClass}`}
                    >
                      {OPTION_LETTERS[idx]}
                    </span>
                    <div className="flex-1 min-w-0 h-full flex items-center">
                      <AutoFitText
                        as="span"
                        text={optText}
                        minSize={18}
                        maxSize={26}
                        lineHeight={1.3}
                        centerVertically
                        className="font-bold text-outline-dark"
                        onOverflowAtMin={(isOver) => {
                          setTightOptions((prev) =>
                            Boolean(prev[idx]) === isOver ? prev : { ...prev, [idx]: isOver }
                          );
                        }}
                      />
                    </div>
                    {feedback && isCorrectOpt && (
                      <CheckCircle2 className="w-[24px] h-[24px] text-[#FFD400] shrink-0" />
                    )}
                    {feedback && isWrongSelected && (
                      <XCircle className="w-[24px] h-[24px] text-[#FFD400] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Banner overlaid cleanly at bottom (never shifts grid or causes scroll) */}
            {feedback && (
              <div
                role="status"
                className={`animate-pop-in absolute bottom-[10px] inset-x-[12px] z-30 px-[16px] py-[10px] rounded-2xl border-[3px] border-[#040B24] shadow-[0_5px_0_#040B24] flex flex-col gap-[2px] ${
                  feedback.isCorrect
                    ? 'bg-[#00C853] text-white'
                    : 'bg-[#FF1744] text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-[10px]">
                  <span className="font-display font-bold text-[22px] leading-[1.2] text-outline-dark">
                    {feedback.isCorrect
                      ? `BENAR! (${feedback.ropeDeltaLabel})`
                      : feedback.isTimeout
                      ? `WAKTU HABIS! Jawaban: ${OPTION_LETTERS[feedback.correctOption]} (${feedback.ropeDeltaLabel})`
                      : `SALAH! Jawaban: ${OPTION_LETTERS[feedback.correctOption]} (${feedback.ropeDeltaLabel})`}
                  </span>
                  <span className="text-[13px] font-bold px-[10px] py-[3px] rounded-lg bg-[#040B24]/75 text-[#FFD400] whitespace-nowrap">
                    {isTiebreaker ? 'Menunggu lawan...' : 'Soal berikutnya...'}
                  </span>
                </div>
                {showExplanation && (
                  <p className="text-[15px] leading-[1.3] font-bold text-white/95 text-outline-dark">
                    {feedback.explanation}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[18px] font-bold text-[#FFD400]">
            Menyiapkan soal...
          </div>
        )}
      </div>
    </div>
  );
};
