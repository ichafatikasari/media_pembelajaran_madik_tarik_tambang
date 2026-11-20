import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { GameSettings, MatchState, TeamId } from '../types/game';
import { TugOfWarRig } from './Rope';
import { SchoolBackground } from './SchoolBackground';

interface ArenaProps {
  match: MatchState;
  settings: GameSettings;
}

export const Arena: React.FC<ArenaProps> = ({ match, settings }) => {
  const {
    phase,
    countdownValue,
    ropePosition,
    isTiebreaker,
    tiebreakerRound,
    red,
    blue,
  } = match;
  const { stepsToWin, redName, blueName, pullersPerTeam, lightweightEffects } = settings;

  const leader: TeamId | null =
    ropePosition < 0 ? 'red' : ropePosition > 0 ? 'blue' : null;

  const redAtLine = ropePosition <= -stepsToWin;
  const blueAtLine = ropePosition >= stepsToWin;
  const dangerSide: TeamId | null = redAtLine ? 'red' : blueAtLine ? 'blue' : null;

  const ropeStatusText =
    ropePosition === 0
      ? 'POSISI TALI SEIMBANG'
      : ropePosition < 0
      ? `▲ ${redName} UNGGUL +${Math.abs(ropePosition)}`
      : `● ${blueName} UNGGUL +${Math.abs(ropePosition)}`;

  const ropePillStyle =
    ropePosition < 0
      ? 'bg-[#FF1744] text-white border-[#040B24] shadow-[0_5px_0_#780016]'
      : ropePosition > 0
      ? 'bg-[#1E6BFF] text-white border-[#040B24] shadow-[0_5px_0_#051B6B]'
      : 'bg-[#FFD400] text-[#0B1B4D] border-[#040B24] shadow-[0_5px_0_#78350F]';

  return (
    <section
      aria-label="Arena Lapangan Sekolah Tarik Tambang Arduino"
      className="relative w-full h-[270px] shrink-0 rounded-2xl border-[5px] border-[#040B24] shadow-[0_7px_0_#040B24] overflow-hidden flex flex-col justify-between select-none bg-[#071338]"
    >
      {/* Schoolyard Field Stage (Pullers, Rope, Top Advantage Banner, Side Victory Zones) */}
      <SchoolBackground
        leader={leader}
        dangerSide={dangerSide}
        excitementKey={match.shakeTrigger}
      />

      {/* Large Rope Advantage Banner at top of Arena */}
      <div className="relative z-20 flex items-center justify-center gap-[10px] pt-[8px] px-[16px] pointer-events-none">
        {isTiebreaker && (
          <div className="animate-pop-in px-[14px] py-[4px] rounded-full bg-[#7C4DFF] border-[3px] border-[#FFD400] text-white font-display font-bold text-[15px] leading-[1.2] shadow-[0_4px_0_#040B24] flex items-center gap-[6px] text-outline-dark">
            <ShieldAlert className="w-[16px] h-[16px] text-[#FFD400]" />
            RONDE PENENTUAN {tiebreakerRound > 1 ? `#${tiebreakerRound}` : ''}!
          </div>
        )}

        <div
          className={`px-[20px] py-[5px] rounded-full border-[4px] font-display font-bold text-[17px] leading-[1.2] whitespace-nowrap ${
            ropePosition !== 0 ? 'text-outline-dark' : ''
          } ${ropePillStyle}`}
        >
          {ropeStatusText}
        </div>

        {(redAtLine || blueAtLine) && phase === 'PLAYING' && !isTiebreaker && (
          <div
            className={`animate-pop-in px-[14px] py-[4px] rounded-full border-[3px] border-[#040B24] font-display font-bold text-[14px] leading-[1.2] shadow-[0_4px_0_#040B24] text-outline-dark ${
              redAtLine ? 'bg-[#FF1744] text-white' : 'bg-[#1E6BFF] text-white'
            }`}
          >
            {redAtLine ? `▲ ${redName} UNGGUL!` : `● ${blueName} UNGGUL!`}
          </div>
        )}
      </div>

      {/* Unified 3D Tug-of-War Pullers & Rope Stage */}
      <div className="relative z-20 flex items-end justify-center px-[24px] pb-[8px] flex-1 min-h-0">
        <TugOfWarRig
          ropePosition={ropePosition}
          stepsToWin={stepsToWin}
          pullersPerTeam={pullersPerTeam}
          redPose={red.activePose}
          bluePose={blue.activePose}
          redCurrentPlayer={red.currentPlayer}
          blueCurrentPlayer={blue.currentPlayer}
          lightweightEffects={lightweightEffects}
        />
      </div>

      {/* "3 - 2 - 1 - TARIK!" Start Countdown Overlay */}
      {phase === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-40 bg-[#040B24]/80 flex flex-col items-center justify-center text-white">
          <p className="font-display font-bold text-[18px] uppercase text-[#FFD400] text-outline-dark mb-[4px]">
            Siapkan Tangan di Panel Tim!
          </p>
          <div
            key={countdownValue}
            className={`animate-pop-in font-display font-bold text-[84px] leading-none text-outline-heavy ${
              countdownValue === 0 ? 'text-[#00E676]' : 'text-[#FFD400]'
            }`}
          >
            {countdownValue > 0 ? countdownValue : 'TARIK!'}
          </div>
        </div>
      )}
    </section>
  );
};
