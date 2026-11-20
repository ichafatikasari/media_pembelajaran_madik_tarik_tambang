import React from 'react';
import { Crown, Home, RotateCcw, Scale, Sparkles, Trophy } from 'lucide-react';
import { EndReason, GameSettings, MatchState } from '../types/game';
import { TeamBadge } from './Character';
import { PullerGroup } from './PullerGroup';
import { SchoolBackground } from './SchoolBackground';

interface ResultScreenProps {
  match: MatchState;
  settings: GameSettings;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const END_REASON_TEXT: Record<EndReason, string> = {
  questions_exhausted: 'Kedua tim menyelesaikan seluruh soal',
  time_up: 'Waktu permainan habis',
  tiebreaker: 'Menang lewat Ronde Penentuan (Tiebreaker)',
  manual: 'Permainan diakhiri oleh guru',
};

const CONFETTI_COLORS = ['#FF1744', '#1E6BFF', '#FFD400', '#00C853', '#FF9100', '#7C4DFF'];

export const ResultScreen: React.FC<ResultScreenProps> = ({
  match,
  settings,
  onPlayAgain,
  onBackToMenu,
}) => {
  const winner =
    match.winner ??
    (match.ropePosition < 0 ? 'red' : match.ropePosition > 0 ? 'blue' : 'tie');

  const confettiCount = settings.lightweightEffects ? 10 : 30;
  const redTotalAnswered = match.red.answeredCount;
  const blueTotalAnswered = match.blue.answeredCount;

  const setCount = settings.endMode === 'time' ? 50 : settings.questionsPerTeam;
  const reasonLabel =
    match.endReason === 'questions_exhausted'
      ? `Kedua tim menyelesaikan seluruh ${setCount} soal`
      : match.endReason
      ? END_REASON_TEXT[match.endReason]
      : `Kedua tim menyelesaikan seluruh ${setCount} soal`;

  const bannerTheme =
    winner === 'red'
      ? 'bg-gradient-to-b from-[#FF1744] to-[#B80023] border-[#FFD400] card-3d-red text-white'
      : winner === 'blue'
      ? 'bg-gradient-to-b from-[#1E6BFF] to-[#0A2FA8] border-[#FFD400] card-3d-blue text-white'
      : 'bg-gradient-to-b from-[#7C4DFF] to-[#4C1D95] border-[#FFD400] card-3d text-white';

  return (
    <div className="w-[1600px] h-[900px] bg-[#071338] text-white flex flex-col relative overflow-hidden">
      <SchoolBackground
        leader={winner === 'tie' ? null : winner}
        dangerSide={null}
        excitementKey={1}
        compact
      />

      {/* Saturated Confetti Fireworks Celebration */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            style={{
              left: `${(i * (100 / confettiCount) + 1.5) % 98}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animation: `confettiFall ${2.0 + (i % 5) * 0.4}s linear ${(i % 7) * 0.2}s infinite`,
            }}
            className="absolute -top-[16px] w-[14px] h-[14px] rounded-xs border border-[#040B24]"
          />
        ))}
      </div>

      <main className="relative z-20 flex-1 max-w-[1320px] w-full mx-auto px-[40px] py-[28px] flex flex-col justify-center gap-[22px] overflow-hidden">
        <section
          className={`p-[24px] rounded-3xl border-[5px] text-center space-y-[12px] ${bannerTheme}`}
        >
          <div className="inline-flex items-center justify-center gap-[10px] px-[20px] py-[8px] rounded-2xl bg-[#0B1B4D] border-[3px] border-[#FFD400] shadow-[0_5px_0_#040B24]">
            {winner === 'tie' ? (
              <Scale className="w-[34px] h-[34px] text-[#FFD400]" />
            ) : (
              <>
                <Crown className="w-[30px] h-[30px] text-[#FFD400] fill-[#FFD400]" />
                <Trophy className="w-[34px] h-[34px] text-[#FFD400]" />
                <Sparkles className="w-[26px] h-[26px] text-[#00E676]" />
              </>
            )}
          </div>

          <h1 className="font-display font-bold text-[52px] leading-[1.15] text-outline-heavy text-[#FFD400]">
            {winner === 'red'
              ? `▲ ${settings.redName} MENANG!`
              : winner === 'blue'
              ? `● ${settings.blueName} MENANG!`
              : 'PERTANDINGAN SERI!'}
          </h1>

          <div className="flex items-center justify-center gap-[12px] text-[16px] font-bold">
            <span className="px-[16px] py-[6px] rounded-full bg-[#040B24]/80 border-2 border-[#FFD400] text-white">
              Selisih Tali Akhir:{' '}
              <strong className="text-[#FFD400]">
                {match.ropePosition === 0
                  ? 'Seimbang (0)'
                  : match.ropePosition < 0
                  ? `▲ ${settings.redName} +${Math.abs(match.ropePosition)}`
                  : `● ${settings.blueName} +${Math.abs(match.ropePosition)}`}
              </strong>
            </span>
            <span className="px-[16px] py-[6px] rounded-full bg-[#040B24]/80 border-2 border-[#29B6FF] text-white">
              Alasan Berakhir: <strong className="text-[#29B6FF]">{reasonLabel}</strong>
            </span>
          </div>

          <div className="flex items-end justify-center gap-[32px] pt-[6px] overflow-hidden">
            <PullerGroup
              teamId="red"
              count={settings.pullersPerTeam}
              pose={winner === 'red' || winner === 'tie' ? 'cheer' : 'fall'}
              shiftPercent={0}
              lightweightEffects={settings.lightweightEffects}
            />
            <PullerGroup
              teamId="blue"
              count={settings.pullersPerTeam}
              pose={winner === 'blue' || winner === 'tie' ? 'cheer' : 'fall'}
              shiftPercent={0}
              lightweightEffects={settings.lightweightEffects}
            />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-[22px] tabular-nums">
          {/* TIM MERAH STAT CARD */}
          <div className="p-[20px] rounded-3xl bg-gradient-to-b from-[#0B1B4D] to-[#16307A] border-[4px] border-[#FF1744] card-3d-red space-y-[14px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[14px]">
                <TeamBadge teamId="red" size="md" />
                <div>
                  <h2 className="font-display font-bold text-[26px] text-[#FF5277] text-outline-dark">
                    ▲ {settings.redName}
                  </h2>
                  <p className="text-[14px] font-bold text-[#93C5FD]">
                    {match.red.memberCount} anggota · Putaran ke-{match.red.currentRound}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-[#FFD400]">POIN TARIK</p>
                <p className="font-display font-bold text-[34px] leading-none text-white text-outline-dark">
                  {match.red.tugPoints}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[12px] text-center">
              <div className="p-[12px] rounded-xl bg-[#064E1D] border-2 border-[#00C853]">
                <p className="text-[14px] font-bold text-[#69F0AE]">Benar</p>
                <p className="font-display font-bold text-[28px] text-white text-outline-dark">
                  {match.red.correctCount}
                </p>
              </div>
              <div className="p-[12px] rounded-xl bg-[#5E0012] border-2 border-[#FF1744]">
                <p className="text-[14px] font-bold text-[#FF8A9E]">Salah</p>
                <p className="font-display font-bold text-[28px] text-white text-outline-dark">
                  {match.red.wrongCount}
                </p>
              </div>
              <div className="p-[12px] rounded-xl bg-[#13296B] border-2 border-[#29B6FF]">
                <p className="text-[14px] font-bold text-[#7CC9FF]">Soal Terjawab</p>
                <p className="font-display font-bold text-[28px] text-white text-outline-dark">
                  {redTotalAnswered}
                </p>
              </div>
            </div>
          </div>

          {/* TIM BIRU STAT CARD */}
          <div className="p-[20px] rounded-3xl bg-gradient-to-b from-[#0B1B4D] to-[#16307A] border-[4px] border-[#1E6BFF] card-3d-blue space-y-[14px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[14px]">
                <TeamBadge teamId="blue" size="md" />
                <div>
                  <h2 className="font-display font-bold text-[26px] text-[#60A5FA] text-outline-dark">
                    ● {settings.blueName}
                  </h2>
                  <p className="text-[14px] font-bold text-[#93C5FD]">
                    {match.blue.memberCount} anggota · Putaran ke-{match.blue.currentRound}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-[#FFD400]">POIN TARIK</p>
                <p className="font-display font-bold text-[34px] leading-none text-white text-outline-dark">
                  {match.blue.tugPoints}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[12px] text-center">
              <div className="p-[12px] rounded-xl bg-[#064E1D] border-2 border-[#00C853]">
                <p className="text-[14px] font-bold text-[#69F0AE]">Benar</p>
                <p className="font-display font-bold text-[28px] text-white text-outline-dark">
                  {match.blue.correctCount}
                </p>
              </div>
              <div className="p-[12px] rounded-xl bg-[#5E0012] border-2 border-[#FF1744]">
                <p className="text-[14px] font-bold text-[#FF8A9E]">Salah</p>
                <p className="font-display font-bold text-[28px] text-white text-outline-dark">
                  {match.blue.wrongCount}
                </p>
              </div>
              <div className="p-[12px] rounded-xl bg-[#13296B] border-2 border-[#29B6FF]">
                <p className="text-[14px] font-bold text-[#7CC9FF]">Soal Terjawab</p>
                <p className="font-display font-bold text-[28px] text-white text-outline-dark">
                  {blueTotalAnswered}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-[18px]">
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-3d inline-flex items-center justify-center gap-[10px] px-[34px] py-[16px] rounded-2xl bg-[#00C853] hover:bg-[#19DC6A] text-white font-display font-bold text-[20px] border-4 border-[#040B24] cursor-pointer min-h-[62px] text-outline-dark"
          >
            <RotateCcw className="w-[22px] h-[22px]" />
            MAIN LAGI (ACAK SOAL BARU)
          </button>

          <button
            type="button"
            onClick={onBackToMenu}
            className="btn-3d inline-flex items-center justify-center gap-[10px] px-[34px] py-[16px] rounded-2xl bg-[#1E6BFF] hover:bg-[#3B82FF] text-white font-display font-bold text-[20px] border-4 border-[#040B24] cursor-pointer min-h-[62px] text-outline-dark"
          >
            <Home className="w-[22px] h-[22px]" />
            KEMBALI KE MENU
          </button>
        </div>
      </main>
    </div>
  );
};
