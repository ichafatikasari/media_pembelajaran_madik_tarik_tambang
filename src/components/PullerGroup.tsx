import React, { useEffect, useState } from 'react';
import { CharacterPose, TeamId } from '../types/game';
import { soundEngine } from '../utils/sound';
import { PullerCharacter } from './Character';

interface PullerGroupProps {
  teamId: TeamId;
  count: 3 | 4 | 5;
  pose: CharacterPose;
  /** Used to re-trigger dynamic foot dust puffs on rope moves */
  shiftPercent: number;
  currentPlayer?: number;
  lightweightEffects?: boolean;
  /** 'body' renders z-10 body + clickable area + foot dust; 'hands' renders z-30 gripping fists over rope; 'full' renders combined */
  layer?: 'body' | 'hands' | 'full';
  /** Shared tapped character index for speech bubble synchronization */
  tappedState?: { idx: number; quoteIdx: number } | null;
  onTapPuller?: (idx: number) => void;
}

const FUNNY_QUOTES: Record<TeamId, string[]> = {
  red: ['Ayo Semangat!', 'Merah ▲ kuat!', 'Ayo tarik!', 'Gas terus!', 'Jangan kendor!'],
  blue: ['Ayo Semangat!', 'Biru ● maju!', 'Ayo tarik!', 'Fokus kode!', 'Tahan kuat!'],
};

const PANIC_QUOTE = 'Wuaaah! Hampir kalah!';

interface DustParticleSpec {
  id: number;
  sizeClass: string;
  colorStyle: string;
  offsetClass: string;
  delayMs: number;
}

// Colored earth/gold/turf dust puffs (NO white puffs so they stand out in Smartboard video!)
const FOOT_DUST_PARTICLES: DustParticleSpec[] = [
  { id: 0, sizeClass: 'w-3.5 h-3.5', colorStyle: '#F59E0B', offsetClass: 'bottom-0.5', delayMs: 0 },
  { id: 1, sizeClass: 'w-3 h-3', colorStyle: '#D97706', offsetClass: 'bottom-1.5', delayMs: 65 },
  { id: 2, sizeClass: 'w-2.5 h-2.5', colorStyle: '#84CC16', offsetClass: 'bottom-0', delayMs: 120 },
  { id: 3, sizeClass: 'w-3 h-3', colorStyle: '#FFD400', offsetClass: 'bottom-2', delayMs: 170 },
];

export const PullerGroup: React.FC<PullerGroupProps> = ({
  teamId,
  count,
  pose,
  shiftPercent,
  currentPlayer,
  lightweightEffects = false,
  layer = 'full',
  tappedState,
  onTapPuller,
}) => {
  const [localTapped, setLocalTapped] = useState<{ idx: number; quoteIdx: number } | null>(null);
  const [dustBurstKey, setDustBurstKey] = useState(0);
  const [showDust, setShowDust] = useState(false);

  const isRed = teamId === 'red';
  const indices = Array.from({ length: count }, (_, i) => i);

  useEffect(() => {
    if (layer === 'hands') return;
    if (pose !== 'pull' && pose !== 'dragged') {
      setShowDust(false);
      return;
    }

    setShowDust(true);
    setDustBurstKey((prev) => prev + 1);

    const timer = window.setTimeout(() => {
      setShowDust(false);
    }, 740);

    return () => window.clearTimeout(timer);
  }, [pose, shiftPercent, layer]);

  const dustKicksRight =
    (isRed && pose === 'pull') || (!isRed && pose === 'dragged');
  const dustAnimClass = dustKicksRight ? 'animate-dust-right' : 'animate-dust-left';

  const activeTap = tappedState ?? localTapped;

  const handleTap = (idx: number) => {
    if (onTapPuller) {
      onTapPuller(idx);
      return;
    }
    soundEngine.playBoing();
    setLocalTapped((prev) => ({
      idx,
      quoteIdx: prev ? (prev.quoteIdx + 1) % FUNNY_QUOTES[teamId].length : 0,
    }));
    window.setTimeout(() => {
      setLocalTapped((curr) => (curr?.idx === idx ? null : curr));
    }, 2000);
  };

  const particlesToRender = lightweightEffects
    ? FOOT_DUST_PARTICLES.slice(0, 2)
    : FOOT_DUST_PARTICLES;

  // Tightly pack pullers (~12-15% overlap) with fixed pixel dimensions for 1600x900 stage
  const overlapClass = count === 5 ? '-space-x-[24px]' : '-space-x-[20px]';

  const sizeClass = count === 5 ? 'h-[144px] w-auto' : 'h-[150px] w-auto';

  return (
    <div className={`flex items-end shrink-0 ${overlapClass}`}>
      {indices.map((idx) => {
        const gender: 'girl' | 'boy' = idx % 2 === 0 ? 'girl' : 'boy';
        const isFront = isRed ? idx === count - 1 : idx === 0;
        const isPanicFront = pose === 'panic' && isFront;
        const bubble =
          activeTap?.idx === idx
            ? FUNNY_QUOTES[teamId][(activeTap.quoteIdx + idx) % FUNNY_QUOTES[teamId].length]
            : isPanicFront
            ? PANIC_QUOTE
            : null;

        const activeRelayGlow =
          layer !== 'hands' &&
          typeof currentPlayer === 'number' &&
          (currentPlayer - 1) % count === idx;

        // Back pullers slightly taller/larger (up to 1.07) for subtle depth perspective
        const distFromFront = isRed ? count - 1 - idx : idx;
        const depthScale = 1 + distFromFront * 0.022;

        return (
          <div key={idx} className="relative flex items-end">
            <PullerCharacter
              teamId={teamId}
              gender={gender}
              variantIndex={idx}
              pose={pose}
              layer={layer}
              isFrontPuller={isFront}
              isActiveRelay={activeRelayGlow}
              speechBubble={layer === 'body' ? null : bubble}
              onTap={layer === 'hands' ? undefined : () => handleTap(idx)}
              sizeClass={sizeClass}
              depthScale={depthScale}
            />

            {/* Dynamic colored foot dust puffs on 'pull' or 'dragged' (NOT white!) */}
            {layer !== 'hands' && showDust && (
              <div
                key={`${dustBurstKey}-${idx}`}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 inset-x-1 h-6 z-20"
              >
                {particlesToRender.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      animationDelay: `${p.delayMs + idx * 35}ms`,
                      left: `${18 + ((p.id * 19 + idx * 7) % 58)}%`,
                      backgroundColor: p.colorStyle,
                    }}
                    className={`absolute rounded-full border-2 border-[#451A03] ${p.sizeClass} ${p.offsetClass} ${dustAnimClass}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
