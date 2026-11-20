import React, { useState } from 'react';
import { CharacterPose, TeamId } from '../types/game';

export const REFERENCE_MASCOT_URL =
  '/assets/aistudio/Ikon_Tim_Merah_dan_Tim_Biru_Cheerful_38f0e028.png';

interface TeamBadgeProps {
  teamId: TeamId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamId,
  size = 'md',
  className = '',
}) => {
  const [imgErr, setImgErr] = useState(false);

  const dims = {
    sm: 'w-11 h-11 md:w-12 md:h-12 rounded-xl',
    md: 'w-14 h-14 md:w-16 md:h-16 rounded-2xl',
    lg: 'w-24 h-24 rounded-3xl',
  }[size];

  const isRed = teamId === 'red';
  const frame = isRed
    ? 'border-[#FF1744] bg-[#B80023] shadow-[0_4px_0_#5E0012]'
    : 'border-[#1E6BFF] bg-[#0A2FA8] shadow-[0_4px_0_#04134A]';

  return (
    <div className={`relative shrink-0 ${dims} ${className}`}>
      <div className={`w-full h-full overflow-hidden rounded-[inherit] border-[3px] ${frame}`}>
        {!imgErr ? (
          <img
            src={REFERENCE_MASCOT_URL}
            alt={isRed ? 'Maskot Tim Merah' : 'Maskot Tim Biru'}
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
            className={`h-full w-[200%] max-w-none object-cover object-center ${
              isRed ? 'translate-x-0' : '-translate-x-1/2'
            }`}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center font-display font-bold text-sm text-white ${
              isRed ? 'bg-[#FF1744]' : 'bg-[#1E6BFF]'
            }`}
          >
            {isRed ? '▲' : '●'}
          </div>
        )}
      </div>

      {/* Non-color team shape marker (▲ Red, ● Blue) */}
      <span
        aria-hidden="true"
        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#040B24] flex items-center justify-center text-[10px] font-bold text-white shadow ${
          isRed ? 'bg-[#FF1744]' : 'bg-[#1E6BFF]'
        }`}
      >
        {isRed ? '▲' : '●'}
      </span>
    </div>
  );
};

interface PullerCharacterProps {
  teamId: TeamId;
  gender: 'girl' | 'boy';
  variantIndex: number;
  pose: CharacterPose;
  /** 'body' = z-10 body/legs/head/back-palms, 'hands' = z-30 gripping arms/fists OVER rope, 'full' = both combined */
  layer?: 'body' | 'hands' | 'full';
  /** True for the front-most puller where the rope end is wrapped/knotted */
  isFrontPuller?: boolean;
  isActiveRelay?: boolean;
  speechBubble?: string | null;
  onTap?: () => void;
  sizeClass?: string;
  depthScale?: number;
}

const SKIN_TONES = ['#F5C09A', '#EBB086', '#DF9E74', '#F7C8A4'];
const SKIN_SHADOWS = ['#DDA077', '#D18F65', '#C27E56', '#DFAB82'];
const HAIR_COLORS = ['#2E190E', '#171311', '#4A2B18', '#24160F'];

/**
 * Glossy 3-tier shaded chibi student puller SVG with separated body (z-10) & gripping hands (z-30) layers
 * so the 3D rope (z-20) passes cleanly in front of the torso and behind the gripping fists.
 * Both hands grip firmly at fixed y = 78 (57.35% of viewBox height 136) across all poses.
 */
export const PullerCharacter: React.FC<PullerCharacterProps> = ({
  teamId,
  gender,
  variantIndex,
  pose,
  layer = 'full',
  isFrontPuller = false,
  isActiveRelay = false,
  speechBubble,
  onTap,
  sizeClass = 'h-[150px] w-auto',
  depthScale = 1,
}) => {
  const isRed = teamId === 'red';
  const bandColor = isRed ? '#FF1744' : '#1E6BFF';
  const bandBorder = '#040B24';
  const skin = SKIN_TONES[variantIndex % SKIN_TONES.length];
  const skinShadow = SKIN_SHADOWS[variantIndex % SKIN_SHADOWS.length];
  const hair = HAIR_COLORS[variantIndex % HAIR_COLORS.length];

  const isCheerOrFall = pose === 'cheer' || pose === 'fall';

  const poseAnim =
    pose === 'pull'
      ? isRed
        ? 'animate-pull-left'
        : 'animate-pull-right'
      : pose === 'dragged'
      ? 'animate-dragged'
      : pose === 'panic'
      ? 'animate-panic'
      : pose === 'cheer'
      ? 'animate-cheer'
      : pose === 'fall'
      ? 'translate-y-3 opacity-95'
      : '';

  const torsoTiltDeg =
    pose === 'pull'
      ? -15
      : pose === 'dragged'
      ? 12
      : pose === 'sad'
      ? 7
      : pose === 'fall'
      ? 26
      : -5;

  const shoulderShiftX =
    pose === 'pull' ? -6 : pose === 'dragged' ? 5 : pose === 'sad' ? 2 : -2;

  const renderEyes = (lx: number, rx: number, y: number) => {
    if (pose === 'cheer') {
      return (
        <>
          <path d={`M ${lx - 4} ${y + 1} Q ${lx} ${y - 4.8} ${lx + 4} ${y + 1}`} fill="none" stroke="#040B24" strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M ${rx - 4} ${y + 1} Q ${rx} ${y - 4.8} ${rx + 4} ${y + 1}`} fill="none" stroke="#040B24" strokeWidth="2.8" strokeLinecap="round" />
        </>
      );
    }
    if (pose === 'panic') {
      return (
        <>
          <circle cx={lx} cy={y} r="5" fill="#FFFFFF" stroke="#040B24" strokeWidth="2" />
          <circle cx={lx} cy={y} r="2.1" fill="#040B24" />
          <circle cx={rx} cy={y} r="5" fill="#FFFFFF" stroke="#040B24" strokeWidth="2" />
          <circle cx={rx} cy={y} r="2.1" fill="#040B24" />
        </>
      );
    }
    if (pose === 'sad' || pose === 'dragged' || pose === 'fall') {
      return (
        <>
          <path d={`M ${lx - 3.2} ${y - 2.2} L ${lx + 3.2} ${y + 2.2} M ${lx + 3.2} ${y - 2.2} L ${lx - 3.2} ${y + 2.2}`} stroke="#040B24" strokeWidth="2.4" strokeLinecap="round" />
          <path d={`M ${rx - 3.2} ${y - 2.2} L ${rx + 3.2} ${y + 2.2} M ${rx + 3.2} ${y - 2.2} L ${rx - 3.2} ${y + 2.2}`} stroke="#040B24" strokeWidth="2.4" strokeLinecap="round" />
        </>
      );
    }
    if (pose === 'pull') {
      return (
        <>
          <path d={`M ${lx - 4} ${y - 2.2} L ${lx + 3} ${y} L ${lx - 4} ${y + 2.2}`} fill="none" stroke="#040B24" strokeWidth="2.6" strokeLinecap="round" />
          <path d={`M ${rx + 4} ${y - 2.2} L ${rx - 3} ${y} L ${rx + 4} ${y + 2.2}`} fill="none" stroke="#040B24" strokeWidth="2.6" strokeLinecap="round" />
        </>
      );
    }
    return (
      <>
        <circle cx={lx} cy={y} r="4.1" fill="#FFFFFF" stroke="#040B24" strokeWidth="1.4" />
        <circle cx={lx + 0.5} cy={y} r="2.5" fill="#040B24" />
        <circle cx={lx - 0.8} cy={y - 1.1} r="1" fill="#FFFFFF" />
        <circle cx={rx} cy={y} r="4.1" fill="#FFFFFF" stroke="#040B24" strokeWidth="1.4" />
        <circle cx={rx + 0.5} cy={y} r="2.5" fill="#040B24" />
        <circle cx={rx - 0.8} cy={y - 1.1} r="1" fill="#FFFFFF" />
      </>
    );
  };

  const renderMouth = (cx: number, cy: number) => {
    if (pose === 'cheer') {
      return <path d={`M ${cx - 5.5} ${cy} Q ${cx} ${cy + 8.5} ${cx + 5.5} ${cy} Z`} fill="#FF1744" stroke="#040B24" strokeWidth="1.8" />;
    }
    if (pose === 'panic') {
      return <ellipse cx={cx} cy={cy + 3} rx="4.2" ry="4.8" fill="#B80023" stroke="#040B24" strokeWidth="1.8" />;
    }
    if (pose === 'sad' || pose === 'dragged' || pose === 'fall') {
      return <path d={`M ${cx - 5} ${cy + 4} Q ${cx} ${cy - 2.2} ${cx + 5} ${cy + 4}`} fill="none" stroke="#040B24" strokeWidth="2.3" strokeLinecap="round" />;
    }
    if (pose === 'pull') {
      return <ellipse cx={cx} cy={cy + 2} rx="4.4" ry="2.6" fill="#B80023" stroke="#040B24" strokeWidth="1.7" />;
    }
    return <path d={`M ${cx - 4.5} ${cy} Q ${cx} ${cy + 5.2} ${cx + 4.5} ${cy}`} fill="none" stroke="#040B24" strokeWidth="2.1" strokeLinecap="round" />;
  };

  const renderBodyContent = () => (
    <>
      {/* Crisp Elliptical Ground Shadow */}
      <ellipse cx="46" cy="128" rx="30" ry="6.5" fill="#040B24" opacity="0.42" />

      {/* Sweat drop on panic / dragged */}
      {(pose === 'panic' || pose === 'dragged') && (
        <path d="M 76 23 Q 83 32 76 40 Q 69 32 76 23 Z" fill="#29B6FF" stroke="#040B24" strokeWidth="1.8" />
      )}

      <g transform={isRed ? '' : 'translate(94, 0) scale(-1, 1)'}>
        {/* Back leg: straight & braced backward */}
        <path
          d="M 35 88 L 12 121 L 23 123 L 44 91 Z"
          fill="#0F172A"
          stroke="#040B24"
          strokeWidth="2.6"
        />
        <rect x="8" y="119" width="21" height="8.5" rx="4.2" fill={bandColor} stroke="#040B24" strokeWidth="2.4" />
        <rect x="10" y="120.5" width="14" height="2.2" rx="1" fill="#FFFFFF" opacity="0.45" />

        {/* Front leg: clearly bent at the knee pushing against the turf */}
        <path
          d="M 46 88 L 65 103 L 58 122 L 47 121 L 53 105 L 38 92 Z"
          fill="#1E293B"
          stroke="#040B24"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <rect x="48" y="119" width="22" height="8.5" rx="4.2" fill={bandColor} stroke="#040B24" strokeWidth="2.4" />
        <rect x="50" y="120.5" width="15" height="2.2" rx="1" fill="#FFFFFF" opacity="0.45" />

        {/* Torso & Head leaning back around hip (42, 88) */}
        <g transform={`rotate(${torsoTiltDeg} 42 88)`}>
          {/* 3-tier shaded Yellow Jersey (#FFD400 base, #D99B00 shadow, #FFF59D glossy highlight) + Green Collar & Crest */}
          <path d="M25 53 L60 53 L63 90 L22 90 Z" fill="#FFD400" stroke="#040B24" strokeWidth="2.8" />
          <path d="M23 76 L62 76 L63 89 L22 89 Z" fill="#D99B00" opacity="0.65" />
          <path d="M27 55 L58 55 L58 60 L26 60 Z" fill="#FFF59D" opacity="0.7" />
          <path d="M35 53 L43 62 L51 53 Z" fill="#00C853" stroke="#040B24" strokeWidth="2.2" />
          <polygon points="49,66 53,69 52,75 46,75 45,69" fill="#00C853" stroke="#040B24" strokeWidth="1.5" />

          {/* Head */}
          {gender === 'girl' ? (
            <g>
              {/* White Hijab with bold dark outline & blue-gray 3D fold shading */}
              <path
                d="M18 31 C18 7, 30 2, 43 2 C56 2, 68 7, 68 31 C68 47, 58 56, 43 58 C28 56, 18 47, 18 31 Z"
                fill="#FFFFFF"
                stroke="#0B1B4D"
                strokeWidth="3.2"
              />
              <path
                d="M20 34 C22 46, 31 54, 43 56 C55 54, 64 46, 66 34 C60 44, 52 49, 43 50 C34 49, 26 44, 20 34 Z"
                fill="#9BC0E8"
                opacity="0.85"
              />
              <path
                d="M24 14 C31 7, 52 7, 60 15"
                fill="none"
                stroke="#C5DDF7"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Team Headband */}
              <rect x="21" y="11" width="44" height="6.5" rx="3.2" fill={bandColor} stroke={bandBorder} strokeWidth="2.2" />
              <rect x="24" y="12.2" width="38" height="1.8" rx="1" fill="#FFFFFF" opacity="0.45" />

              {/* Face with warm skin + chin shadow */}
              <ellipse cx="44" cy="32" rx="16" ry="15" fill={skin} stroke="#0B1B4D" strokeWidth="2.2" />
              <path d="M 30 37 Q 44 48 58 37 Q 52 46 44 46 Q 36 46 30 37 Z" fill={skinShadow} opacity="0.7" />
              <ellipse cx="35" cy="36" rx="3.2" ry="1.9" fill="#FF6B8B" opacity="0.75" />
              <ellipse cx="55" cy="36" rx="3.2" ry="1.9" fill="#FF6B8B" opacity="0.75" />
              {renderEyes(39, 51, 30)}
              {renderMouth(45, 39)}
            </g>
          ) : (
            <g>
              <ellipse cx="44" cy="31" rx="19" ry="18" fill={skin} stroke="#040B24" strokeWidth="2.8" />
              <path d="M 28 38 Q 44 50 60 38 Q 53 48 44 48 Q 35 48 28 38 Z" fill={skinShadow} opacity="0.65" />
              <ellipse cx="34" cy="36" rx="3.4" ry="1.9" fill="#FF6B8B" opacity="0.75" />
              <ellipse cx="56" cy="36" rx="3.4" ry="1.9" fill="#FF6B8B" opacity="0.75" />
              {variantIndex % 2 === 0 ? (
                <path
                  d="M24 29 C23 10, 34 4, 45 4 C58 4, 65 12, 63 29 C58 19, 51 16, 44 18 C37 16, 29 19, 24 29 Z"
                  fill={hair}
                  stroke="#040B24"
                  strokeWidth="2.6"
                />
              ) : (
                <path
                  d="M23 28 C22 11, 32 3, 45 5 C54 2, 65 11, 64 28 L56 21 L48 25 L40 20 L31 24 Z"
                  fill={hair}
                  stroke="#040B24"
                  strokeWidth="2.6"
                />
              )}
              <rect x="25" y="14.5" width="38" height="6" rx="3" fill={bandColor} stroke={bandBorder} strokeWidth="2.2" />
              <rect x="28" y="15.7" width="32" height="1.6" rx="0.8" fill="#FFFFFF" opacity="0.45" />
              {renderEyes(38, 52, 30)}
              {renderMouth(45, 39)}
            </g>
          )}
        </g>

        {/* Back palms behind the rope (so rope sits cleanly between palm & gripping fist) */}
        {!isCheerOrFall && (
          <>
            <ellipse cx="55" cy="78" rx="6" ry="6.6" fill={skinShadow} stroke="#040B24" strokeWidth="2.4" />
            <ellipse cx="77" cy="78" rx="6" ry="6.6" fill={skinShadow} stroke="#040B24" strokeWidth="2.4" />
          </>
        )}
      </g>
    </>
  );

  const renderHandsContent = () => (
    <g transform={isRed ? '' : 'translate(94, 0) scale(-1, 1)'}>
      {isCheerOrFall ? (
        <g>
          <path
            d={pose === 'cheer' ? 'M50 58 L74 34 L80 41 L56 66 Z' : 'M50 62 L74 74 L70 82 L46 70 Z'}
            fill="#00C853"
            stroke="#040B24"
            strokeWidth="2.6"
          />
          <circle
            cx={pose === 'cheer' ? 76 : 72}
            cy={pose === 'cheer' ? 37 : 78}
            r="4.4"
            fill={bandColor}
            stroke={bandBorder}
            strokeWidth="2"
          />
          <circle
            cx={pose === 'cheer' ? 81 : 78}
            cy={pose === 'cheer' ? 31 : 79}
            r="6.6"
            fill={skin}
            stroke="#040B24"
            strokeWidth="2.6"
          />
        </g>
      ) : (
        <g>
          {/* Rope loop/knot wrapped around front-most puller's waist & grip */}
          {isFrontPuller && (
            <g>
              <path
                d="M 32 76 Q 58 84 82 78"
                fill="none"
                stroke="#451A03"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
              <path
                d="M 32 76 Q 58 84 82 78"
                fill="none"
                stroke="#FF9100"
                strokeWidth="4.8"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <circle cx="84" cy="78" r="5.5" fill="#FF9100" stroke="#451A03" strokeWidth="2.4" />
            </g>
          )}

          {/* Far/Rear Arm reaching forward to first grip (55, 78) */}
          <path
            d={`M ${34 + shoulderShiftX} 57 L 54 73 L 50 82 L ${29 + shoulderShiftX} 66 Z`}
            fill="#007A33"
            stroke="#040B24"
            strokeWidth="2.6"
          />
          <line
            x1={32 + shoulderShiftX}
            y1="59"
            x2="51"
            y2="75"
            stroke="#FFD400"
            strokeWidth="2.2"
          />
          <circle cx="49" cy="77" r="4.2" fill={bandColor} stroke={bandBorder} strokeWidth="2" />

          {/* Near/Front Arm reaching straight forward to front grip (77, 78) */}
          <path
            d={`M ${48 + shoulderShiftX} 58 L 76 73 L 72 82 L ${43 + shoulderShiftX} 67 Z`}
            fill="#00C853"
            stroke="#040B24"
            strokeWidth="2.8"
          />
          <line
            x1={46 + shoulderShiftX}
            y1="60"
            x2="73"
            y2="75"
            stroke="#FFD400"
            strokeWidth="2.4"
          />
          <circle cx="71" cy="77" r="4.4" fill={bandColor} stroke={bandBorder} strokeWidth="2" />

          {/* Both Bold Clenched Fists IN FRONT of the rope (z-30) with thick outlines & knuckles */}
          <g>
            <rect x="48" y="71.5" width="14" height="12.5" rx="5.5" fill={skin} stroke="#040B24" strokeWidth="2.8" />
            <line x1="52.5" y1="73" x2="52.5" y2="83" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="57" y1="73" x2="57" y2="83" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />

            <rect x="70.5" y="71.5" width="14.5" height="12.5" rx="5.5" fill={skin} stroke="#040B24" strokeWidth="2.8" />
            <line x1="75" y1="73" x2="75" y2="83" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="79.5" y1="73" x2="79.5" y2="83" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
      )}
    </g>
  );

  // Hands-only overlay layer (z-30, pointer-events-none) + Speech bubble at z-50 above head
  if (layer === 'hands') {
    return (
      <div
        className={`relative select-none pointer-events-none ${poseAnim}`}
        style={{ transform: `scale(${depthScale})`, transformOrigin: 'bottom center' }}
      >
        {speechBubble && (
          <div
            className={`animate-pop-in absolute -top-9 left-1/2 -translate-x-1/2 z-50 px-2.5 py-0.5 rounded-xl border-[3px] border-[#040B24] text-xs font-display font-bold whitespace-nowrap shadow-[0_4px_0_#040B24] ${
              isRed ? 'bg-[#FF1744] text-white text-outline-dark' : 'bg-[#1E6BFF] text-white text-outline-dark'
            }`}
          >
            {speechBubble}
          </div>
        )}
        <svg viewBox="8 0 78 136" className={sizeClass} aria-hidden="true">
          {renderHandsContent()}
        </svg>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Maskot ${isRed ? 'Tim Merah' : 'Tim Biru'} #${variantIndex + 1}`}
      style={{ transform: `scale(${depthScale})`, transformOrigin: 'bottom center' }}
      className={`relative group select-none cursor-pointer focus:outline-none ${poseAnim}`}
    >
      {layer === 'full' && speechBubble && (
        <div
          className={`animate-pop-in absolute -top-9 left-1/2 -translate-x-1/2 z-50 px-2.5 py-0.5 rounded-xl border-[3px] border-[#040B24] text-xs font-display font-bold whitespace-nowrap shadow-[0_4px_0_#040B24] pointer-events-none ${
            isRed ? 'bg-[#FF1744] text-white text-outline-dark' : 'bg-[#1E6BFF] text-white text-outline-dark'
          }`}
        >
          {speechBubble}
        </div>
      )}

      {isActiveRelay && (
        <div
          className="absolute -inset-1 rounded-full border-2 border-[#FFD400] opacity-85 pointer-events-none"
          style={{
            background: isRed
              ? 'radial-gradient(circle, rgba(255,23,68,0.45) 0%, transparent 72%)'
              : 'radial-gradient(circle, rgba(30,107,255,0.45) 0%, transparent 72%)',
          }}
        />
      )}

      <svg
        viewBox="8 0 78 136"
        className={sizeClass}
        style={{
          filter: 'drop-shadow(0 4px 0 rgba(4, 11, 36, 0.38))',
        }}
      >
        {renderBodyContent()}
        {layer === 'full' && renderHandsContent()}
      </svg>
    </button>
  );
};

interface CharacterDuoProps {
  teamId: TeamId;
  pose: CharacterPose;
}

export const Character: React.FC<CharacterDuoProps> = ({ teamId, pose }) => (
  <div className="flex items-end -space-x-4">
    <PullerCharacter teamId={teamId} gender="girl" variantIndex={0} pose={pose} />
    <PullerCharacter teamId={teamId} gender="boy" variantIndex={1} pose={pose} />
  </div>
);
