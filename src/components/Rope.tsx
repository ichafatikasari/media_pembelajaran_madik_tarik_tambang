import React, { useRef, useState } from 'react';
import { CharacterPose, TeamId } from '../types/game';
import { soundEngine } from '../utils/sound';
import { PullerGroup } from './PullerGroup';

interface TugOfWarRigProps {
  ropePosition: number;
  stepsToWin: number;
  pullersPerTeam: 3 | 4 | 5;
  redPose: CharacterPose;
  bluePose: CharacterPose;
  redCurrentPlayer?: number;
  blueCurrentPlayer?: number;
  lightweightEffects?: boolean;
}

/**
 * Compute horizontal shift as a percentage of the full ARENA width.
 * - Moves >= 3.5% of arena width per step for steps 1..3 so leads are clearly visible.
 * - Safely caps maximum shift so puller groups NEVER cross into or cover the left/right finish lines.
 */
function computeArenaShiftPercent(
  ropePosition: number,
  stepsToWin: number,
  pullersPerTeam: 3 | 4 | 5
): number {
  const clamped = Math.max(-stepsToWin, Math.min(stepsToWin, ropePosition));
  if (clamped === 0 || stepsToWin <= 0) return 0;

  const sign = clamped < 0 ? -1 : 1;
  const absStep = Math.abs(clamped);
  const maxSafeShift = pullersPerTeam === 5 ? 13.5 : 16.5;

  if (stepsToWin * 3.5 <= maxSafeShift) {
    const stepSize = Math.max(3.5, maxSafeShift / stepsToWin);
    return sign * Math.min(maxSafeShift, absStep * stepSize);
  }

  // Ensure steps 1..3 move >= 3.5% per step, then progress smoothly to maxSafeShift
  if (absStep <= 3) {
    return sign * Math.min(maxSafeShift, absStep * 3.5);
  }

  const firstThree = Math.min(maxSafeShift, 10.5);
  const remainingSteps = Math.max(1, stepsToWin - 3);
  const progress = (absStep - 3) / remainingSteps;
  return sign * (firstThree + progress * (maxSafeShift - firstThree));
}

/**
 * Unified 3D Tug-of-War container:
 * - Translates PullerGroups + 3D Braided Orange Rope as ONE unit inside full-width arena track
 * - Center marker ("TENGAH" / "▲ MERAH +X" / "● BIRU +X") floats ABOVE pullers' heads at z-40
 * - Strict layering: Puller Bodies (z-10) < 3D Rope (z-20) < Gripping Fists (z-30) < Center Label (z-40) < Speech Bubbles (z-50)
 */
export const TugOfWarRig: React.FC<TugOfWarRigProps> = ({
  ropePosition,
  stepsToWin,
  pullersPerTeam,
  redPose,
  bluePose,
  redCurrentPlayer,
  blueCurrentPlayer,
  lightweightEffects = false,
}) => {
  const [redTap, setRedTap] = useState<{ idx: number; quoteIdx: number } | null>(null);
  const [blueTap, setBlueTap] = useState<{ idx: number; quoteIdx: number } | null>(null);
  const tapTimerRef = useRef<number | null>(null);

  const arenaShiftPercent = computeArenaShiftPercent(
    ropePosition,
    stepsToWin,
    pullersPerTeam
  );
  const isPulling = redPose === 'pull' || bluePose === 'pull';

  const flagColor =
    ropePosition < 0
      ? 'bg-[#FF1744] border-[#040B24] text-white shadow-[0_4px_0_#780016]'
      : ropePosition > 0
      ? 'bg-[#1E6BFF] border-[#040B24] text-white shadow-[0_4px_0_#051B6B]'
      : 'bg-[#FFD400] border-[#040B24] text-[#0B1B4D] shadow-[0_4px_0_#78350F]';

  const handleTap = (team: TeamId, idx: number) => {
    soundEngine.playBoing();
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }
    if (team === 'red') {
      setRedTap((prev) => ({ idx, quoteIdx: prev ? prev.quoteIdx + 1 : 0 }));
      setBlueTap(null);
      tapTimerRef.current = window.setTimeout(() => {
        setRedTap(null);
      }, 2000);
    } else {
      setBlueTap((prev) => ({ idx, quoteIdx: prev ? prev.quoteIdx + 1 : 0 }));
      setRedTap(null);
      tapTimerRef.current = window.setTimeout(() => {
        setBlueTap(null);
      }, 2000);
    }
  };

  const ropePath = isPulling
    ? 'M 8 16 L 340 16 Q 500 11 660 16 L 992 16'
    : 'M 8 16 L 992 16';

  return (
    <div className="relative w-full flex justify-center items-end overflow-visible">
      {/* Full-width translation track so translateX(%) equals exact % of arena width */}
      <div
        className="w-full flex justify-center items-end transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${arenaShiftPercent}%)` }}
      >
        <div className="relative inline-flex items-end">
          {/* Center Rope Marker ABOVE Pullers' Heads (z-40, never occluded) */}
          <div className="pointer-events-none absolute -top-[34px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
            <div
              className={`px-[12px] py-[2px] rounded-lg border-[3px] text-[13px] leading-[1.2] font-display font-bold whitespace-nowrap ${
                ropePosition !== 0 ? 'text-outline-dark' : ''
              } ${flagColor}`}
            >
              {ropePosition === 0
                ? 'TENGAH'
                : ropePosition < 0
                ? `▲ MERAH +${Math.abs(ropePosition)}`
                : `● BIRU +${Math.abs(ropePosition)}`}
            </div>
            <div className="w-[4px] h-[10px] bg-[#FFD400] border border-[#040B24] rounded-full" />
          </div>

          {/* Ground shadow under center rope span */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[6px] left-[18%] right-[18%] h-[10px] rounded-full bg-[#040B24]/30 z-0"
          />

          {/* LAYER 1 (z-10): Puller Bodies, Legs, Heads, Back-Palms & Colored Foot Dust */}
          <div className="relative z-10 flex items-end">
            <PullerGroup
              teamId="red"
              count={pullersPerTeam}
              pose={redPose}
              shiftPercent={arenaShiftPercent}
              currentPlayer={redCurrentPlayer}
              lightweightEffects={lightweightEffects}
              layer="body"
              tappedState={redTap}
              onTapPuller={(idx) => handleTap('red', idx)}
            />

            <div className="w-[84px] shrink-0" aria-hidden="true" />

            <PullerGroup
              teamId="blue"
              count={pullersPerTeam}
              pose={bluePose}
              shiftPercent={arenaShiftPercent}
              currentPlayer={blueCurrentPlayer}
              lightweightEffects={lightweightEffects}
              layer="body"
              tappedState={blueTap}
              onTapPuller={(idx) => handleTap('blue', idx)}
            />
          </div>

          {/* LAYER 2 (z-20): 3D Cylindrical Orange Braided Rope passing through ALL hands at y=78 (57.35%) */}
          <div
            className={`pointer-events-none absolute z-20 top-[57.35%] -translate-y-1/2 left-[22px] right-[22px] flex items-center ${
              isPulling && !lightweightEffects ? 'animate-rope-taut' : ''
            }`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 1000 32"
              className="w-full h-[30px]"
              preserveAspectRatio="none"
              style={{ filter: 'drop-shadow(0 4px 0 rgba(4, 11, 36, 0.35))' }}
            >
              <defs>
                <linearGradient id="rope3dGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD180" />
                  <stop offset="45%" stopColor="#FF9100" />
                  <stop offset="100%" stopColor="#B84A00" />
                </linearGradient>
              </defs>
              <path
                d={ropePath}
                fill="none"
                stroke="#451A03"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <path
                d={ropePath}
                fill="none"
                stroke="url(#rope3dGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d={ropePath}
                fill="none"
                stroke="#FFE0B2"
                strokeWidth="4.5"
                strokeDasharray="11 11"
                strokeLinecap="round"
              />
              <circle cx="10" cy="16" r="6.5" fill="#FF9100" stroke="#451A03" strokeWidth="2.5" />
              <circle cx="990" cy="16" r="6.5" fill="#FF9100" stroke="#451A03" strokeWidth="2.5" />
              <circle
                cx="500"
                cy={isPulling ? 13 : 16}
                r="8.5"
                fill="#FFD400"
                stroke="#040B24"
                strokeWidth="3"
              />
            </svg>
          </div>

          {/* LAYER 3 (z-30): Gripping Arms, Wristbands & Fists IN FRONT OF the Rope */}
          <div className="pointer-events-none absolute inset-0 z-30 flex items-end">
            <PullerGroup
              teamId="red"
              count={pullersPerTeam}
              pose={redPose}
              shiftPercent={arenaShiftPercent}
              lightweightEffects={lightweightEffects}
              layer="hands"
              tappedState={redTap}
            />

            <div className="w-[84px] shrink-0" aria-hidden="true" />

            <PullerGroup
              teamId="blue"
              count={pullersPerTeam}
              pose={bluePose}
              shiftPercent={arenaShiftPercent}
              lightweightEffects={lightweightEffects}
              layer="hands"
              tappedState={blueTap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface RopeStepBarProps {
  ropePosition: number;
  stepsToWin: number;
}

export const RopeStepBar: React.FC<RopeStepBarProps> = ({
  ropePosition,
  stepsToWin,
}) => {
  const clamped = Math.max(-stepsToWin, Math.min(stepsToWin, ropePosition));
  const steps: number[] = [];
  for (let s = -stepsToWin; s <= stepsToWin; s++) {
    steps.push(s);
  }

  return (
    <div className="h-[44px] w-full flex items-center justify-center shrink-0">
      <div className="h-[44px] inline-flex items-center gap-[12px] px-[18px] rounded-full bg-[#0B1B4D] border-[3px] border-[#FFD400] shadow-[0_4px_0_#040B24]">
        <div className="flex items-center gap-[8px]">
          {steps.map((s) => {
            const isCurrent = s === clamped;
            const isRedSide = s < 0;
            const isBlueSide = s > 0;
            const isWinEdge = Math.abs(s) === stepsToWin;

            return (
              <div
                key={s}
                className={`rounded-full border-2 flex items-center justify-center font-display font-bold transition-transform tabular-nums ${
                  stepsToWin >= 8
                    ? 'w-[24px] h-[24px] text-[12px]'
                    : 'w-[28px] h-[28px] text-[14px]'
                } ${
                  isCurrent
                    ? 'scale-115 bg-[#FFD400] border-[#040B24] text-[#0B1B4D] z-10'
                    : isWinEdge && isRedSide
                    ? 'bg-[#FF1744] border-white text-white'
                    : isWinEdge && isBlueSide
                    ? 'bg-[#1E6BFF] border-white text-white'
                    : isRedSide
                    ? 'bg-[#B80023] border-[#FF5277] text-white'
                    : isBlueSide
                    ? 'bg-[#0A2FA8] border-[#60A5FA] text-white'
                    : 'bg-[#16307A] border-[#FFD400] text-[#FFD400]'
                }`}
              >
                {Math.abs(s)}
              </div>
            );
          })}
        </div>

        {/* True net pull difference indicator */}
        <span
          className={`px-[12px] py-[2px] rounded-full text-[14px] leading-[1.2] font-display font-bold tabular-nums whitespace-nowrap border-2 border-[#040B24] ${
            ropePosition < 0
              ? 'bg-[#FF1744] text-white text-outline-dark'
              : ropePosition > 0
              ? 'bg-[#1E6BFF] text-white text-outline-dark'
              : 'bg-[#FFD400] text-[#0B1B4D]'
          }`}
        >
          Selisih:{' '}
          {ropePosition === 0
            ? '0'
            : ropePosition < 0
            ? `▲ M +${Math.abs(ropePosition)}`
            : `● B +${Math.abs(ropePosition)}`}
        </span>
      </div>
    </div>
  );
};
