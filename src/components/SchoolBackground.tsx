import React from 'react';
import { TeamId } from '../types/game';

interface SchoolBackgroundProps {
  leader: TeamId | null;
  dangerSide: TeamId | null;
  excitementKey: number;
  compact?: boolean;
}

export const SchoolBackground: React.FC<SchoolBackgroundProps> = ({
  leader,
  dangerSide,
  excitementKey,
  compact = false,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* 1. Saturated Bright Sky Gradient (#0077E6 to #29B6FF) + Blue-Shaded Clouds */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0077E6 0%, #29B6FF 62%, #00A6E0 100%)',
        }}
      />

      {/* Ultra-slow blue-tinted clouds */}
      <svg
        className="animate-cloud-slow absolute top-[6px] left-[12%] w-[88px] h-[36px]"
        viewBox="0 0 120 50"
      >
        <circle cx="30" cy="31" r="17" fill="#7CC9FF" />
        <circle cx="58" cy="23" r="21" fill="#7CC9FF" />
        <circle cx="88" cy="31" r="15" fill="#7CC9FF" />
        <rect x="26" y="31" width="64" height="17" rx="8.5" fill="#7CC9FF" />
        <circle cx="30" cy="28" r="15.5" fill="#D6EEFF" />
        <circle cx="58" cy="20" r="19.5" fill="#D6EEFF" />
        <circle cx="88" cy="28" r="13.5" fill="#D6EEFF" />
        <rect x="27" y="28" width="62" height="14" rx="7" fill="#D6EEFF" />
      </svg>

      <svg
        className="animate-cloud-slow absolute top-[8px] right-[12%] w-[96px] h-[38px]"
        style={{ animationDelay: '-14s' }}
        viewBox="0 0 120 50"
      >
        <circle cx="32" cy="31" r="16" fill="#7CC9FF" />
        <circle cx="62" cy="21" r="21" fill="#7CC9FF" />
        <circle cx="90" cy="31" r="15" fill="#7CC9FF" />
        <rect x="28" y="31" width="66" height="16" rx="8" fill="#7CC9FF" />
        <circle cx="32" cy="28" r="14.5" fill="#D6EEFF" />
        <circle cx="62" cy="18" r="19" fill="#D6EEFF" />
        <circle cx="90" cy="28" r="13.5" fill="#D6EEFF" />
        <rect x="29" y="28" width="64" height="13" rx="6.5" fill="#D6EEFF" />
      </svg>

      {/* 2. Static Schoolyard Buildings ("MAN 1 OKU TIMUR" & "LAB KOMPUTER 1/2/3"), SIDE Flagpole, Trees, Dark Navy Fence */}
      <svg
        viewBox="0 28 1200 190"
        preserveAspectRatio="none"
        className="absolute bottom-[36%] inset-x-0 w-full h-[58%]"
      >
        {/* Rich Saturated Trees */}
        <g stroke="#04391A" strokeWidth="3">
          <circle cx="42" cy="176" r="28" fill="#14A83A" />
          <circle cx="36" cy="168" r="16" fill="#3DDC4F" stroke="none" />
          <circle cx="76" cy="183" r="21" fill="#0D852C" />
          <circle cx="1124" cy="180" r="24" fill="#0D852C" />
          <circle cx="1158" cy="174" r="30" fill="#14A83A" />
          <circle cx="1152" cy="166" r="18" fill="#3DDC4F" stroke="none" />
        </g>

        {/* Left: Basketball Hoop */}
        <g>
          <rect x="104" y="130" width="6" height="82" fill="#1E293B" stroke="#040B24" strokeWidth="2" />
          <rect x="90" y="121" width="34" height="22" rx="4" fill="#1E6BFF" stroke="#040B24" strokeWidth="2.5" />
          <rect x="98" y="127" width="18" height="10" fill="none" stroke="#FFD400" strokeWidth="2.2" />
          <ellipse cx="107" cy="142" rx="8" ry="2.6" fill="none" stroke="#FF9100" strokeWidth="3" />
        </g>

        {/* SIDE Flagpole near school gate (x=158) */}
        <g>
          <rect x="143" y="176" width="32" height="34" rx="4" fill="#0B1B4D" stroke="#FFD400" strokeWidth="2.5" />
          <rect x="156" y="42" width="6" height="136" fill="#0B1B4D" stroke="#040B24" strokeWidth="2" />
          <circle cx="159" cy="39" r="5" fill="#FFD400" stroke="#040B24" strokeWidth="2" />
          {/* Static Merah Putih Flag */}
          <rect x="162" y="45" width="48" height="15" fill="#FF1744" stroke="#040B24" strokeWidth="1.8" />
          <rect x="162" y="60" width="48" height="15" fill="#FFFFFF" stroke="#040B24" strokeWidth="1.8" />
        </g>

        {/* Center-Left: Main School Building — "MAN 1 OKU TIMUR" */}
        <g>
          <polygon points="222,96 402,52 582,96" fill="#FF3D00" stroke="#450A0A" strokeWidth="3.5" />
          <polygon points="246,94 402,59 558,94" fill="#FF6D00" opacity="0.65" />
          <rect x="236" y="96" width="332" height="114" fill="#F59E0B" stroke="#451A03" strokeWidth="3.5" />
          <rect x="239" y="98" width="326" height="15" fill="#FFD400" opacity="0.7" />

          {/* High-contrast Signboard */}
          <rect x="284" y="68" width="236" height="30" rx="7" fill="#0B1B4D" stroke="#FFD400" strokeWidth="3" />
          <text
            x="402"
            y="88"
            textAnchor="middle"
            fill="#FFD400"
            fontSize="15.5"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            MAN 1 OKU TIMUR
          </text>

          {/* Saturated Classroom Windows */}
          {[254, 296, 338, 434, 476, 518].map((wx) => (
            <g key={wx}>
              <rect
                x={wx}
                y="114"
                width="26"
                height="32"
                rx="4"
                fill="#0B1B4D"
                stroke="#451A03"
                strokeWidth="2.5"
              />
              <rect x={wx + 3} y="117" width="20" height="26" rx="2" fill="#29B6FF" />
              <line x1={wx + 13} y1="117" x2={wx + 13} y2="143" stroke="#0B1B4D" strokeWidth="2" />
            </g>
          ))}

          {/* Main Entrance */}
          <rect x="378" y="140" width="48" height="70" rx="5" fill="#78350F" stroke="#040B24" strokeWidth="3" />
          <line x1="402" y1="140" x2="402" y2="210" stroke="#040B24" strokeWidth="2.5" />
          <circle cx="396" cy="176" r="2.5" fill="#FFD400" />
          <circle cx="408" cy="176" r="2.5" fill="#FFD400" />
        </g>

        {/* Center-Right: Computer Laboratory Building with 3 Doors & Labels: LAB KOMPUTER 1, 2, 3 */}
        <g>
          <polygon points="642,104 845,66 1048,104" fill="#1E6BFF" stroke="#040B24" strokeWidth="3.5" />
          <rect x="654" y="104" width="382" height="106" fill="#0E5CAD" stroke="#040B24" strokeWidth="3.5" />
          <rect x="657" y="106" width="376" height="14" fill="#29B6FF" opacity="0.45" />

          {[
            { label: 'LAB KOMPUTER 1', x: 670 },
            { label: 'LAB KOMPUTER 2', x: 792 },
            { label: 'LAB KOMPUTER 3', x: 914 },
          ].map((lab) => (
            <g key={lab.label}>
              <rect
                x={lab.x}
                y="112"
                width="106"
                height="21"
                rx="5"
                fill="#0B1B4D"
                stroke="#FFD400"
                strokeWidth="2"
              />
              <text
                x={lab.x + 53}
                y="126"
                textAnchor="middle"
                fill="#FFD400"
                fontSize="9.2"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {lab.label}
              </text>

              {/* Lab Door */}
              <rect
                x={lab.x + 12}
                y="138"
                width="36"
                height="70"
                rx="4"
                fill="#0B1B4D"
                stroke="#040B24"
                strokeWidth="2.5"
              />
              <circle cx={lab.x + 42} cy="174" r="2.5" fill="#FFD400" />

              {/* Lab Window with Saturated Arduino LEDs */}
              <rect
                x={lab.x + 54}
                y="140"
                width="42"
                height="36"
                rx="4"
                fill="#040B24"
                stroke="#29B6FF"
                strokeWidth="2"
              />
              <rect
                x={lab.x + 60}
                y="148"
                width="30"
                height="18"
                rx="2"
                fill="#00897B"
                stroke="#69F0AE"
                strokeWidth="1.2"
              />
              <circle cx={lab.x + 67} cy="157" r="3" fill="#FF1744" />
              <circle cx={lab.x + 75} cy="157" r="3" fill="#FFD400" />
              <circle cx={lab.x + 83} cy="157" r="3" fill="#00C853" />
            </g>
          ))}
        </g>

        {/* Deep Navy & Gold Baseline Fence */}
        <rect x="0" y="196" width="1200" height="20" fill="#0B1B4D" />
        <line x1="0" y1="196" x2="1200" y2="196" stroke="#FFD400" strokeWidth="3.5" />
        <line x1="0" y1="214" x2="1200" y2="214" stroke="#040B24" strokeWidth="3" />
      </svg>

      {/* 3. Vibrant Saturated Mowed Grass Turf */}
      <div
        className="absolute bottom-0 inset-x-0 h-[38%] border-t-4 border-[#064E1D]"
        style={{
          background: 'linear-gradient(180deg, #3DDC4F 0%, #14A83A 100%)',
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-[38%] opacity-35"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #0D7A28 0px, #0D7A28 56px, transparent 56px, transparent 112px)',
        }}
      />

      {/* Center Painted Gold Turf Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[38%] w-[8px] bg-[#FFD400] border-x-2 border-[#040B24]" />

      {/* 4. Left & Right Victory Zones: Thick White Finish Lines + Signboards + Cheering Spectators */}
      <div
        className={`absolute bottom-0 left-0 w-[8.5%] h-[38%] ${
          dangerSide === 'red' ? 'bg-[#FF1744]/95' : 'bg-[#B80023]/85'
        }`}
      >
        <div className="absolute top-0 bottom-0 right-0 w-[10px] bg-[#FFFFFF] border-x-[3px] border-[#040B24]" />
      </div>

      {!compact && (
        <div className="absolute bottom-[39%] left-[10px] z-10 flex flex-col items-start gap-[4px]">
          <div className="px-[8px] py-[4px] rounded-xl bg-[#FF1744] border-[3px] border-[#040B24] shadow-[0_4px_0_#040B24] text-white font-display font-bold text-[12px] leading-[1.2] text-center text-outline-dark">
            ▲ MENANG
            <br />
            TIM MERAH
          </div>
          <svg
            key={`left-${excitementKey}`}
            viewBox="0 0 64 38"
            className={`w-[58px] h-[34px] ${
              leader === 'red' || excitementKey > 0 ? 'animate-spectator' : ''
            }`}
          >
            <path d="M12 22 L6 12" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M22 22 L28 12" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="17" cy="14" r="9.5" fill="#FFFFFF" stroke="#0B1B4D" strokeWidth="2.2" />
            <circle cx="17" cy="15" r="6" fill="#F5C09A" stroke="#040B24" strokeWidth="1.5" />
            <rect x="10" y="23" width="14" height="13" rx="3" fill="#FFD400" stroke="#040B24" strokeWidth="2" />
            <path d="M40 23 L35 13" stroke="#FF1744" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M52 23 L57 13" stroke="#FF1744" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="46" cy="15" r="8.5" fill="#F5C09A" stroke="#040B24" strokeWidth="2" />
            <path d="M37 13 C38 5, 54 5, 55 13 Z" fill="#FF1744" stroke="#040B24" strokeWidth="1.8" />
            <rect x="39" y="24" width="14" height="12" rx="3" fill="#FF1744" stroke="#040B24" strokeWidth="2" />
          </svg>
        </div>
      )}

      <div
        className={`absolute bottom-0 right-0 w-[8.5%] h-[38%] ${
          dangerSide === 'blue' ? 'bg-[#1E6BFF]/95' : 'bg-[#0A2FA8]/85'
        }`}
      >
        <div className="absolute top-0 bottom-0 left-0 w-[10px] bg-[#FFFFFF] border-x-[3px] border-[#040B24]" />
      </div>

      {!compact && (
        <div className="absolute bottom-[39%] right-[10px] z-10 flex flex-col items-end gap-[4px]">
          <div className="px-[8px] py-[4px] rounded-xl bg-[#1E6BFF] border-[3px] border-[#040B24] shadow-[0_4px_0_#040B24] text-white font-display font-bold text-[12px] leading-[1.2] text-center text-outline-dark">
            ● MENANG
            <br />
            TIM BIRU
          </div>
          {/* Small Cheering Cartoon Spectators (Right Edge) */}
          <svg
            key={`right-${excitementKey}`}
            viewBox="0 0 64 38"
            className={`w-14 h-8 md:w-16 md:h-9 ${
              leader === 'blue' || excitementKey > 0 ? 'animate-spectator' : ''
            }`}
          >
            {/* Spectator 1: Boy in blue shirt */}
            <path d="M12 23 L7 13" stroke="#1E6BFF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M24 23 L29 13" stroke="#1E6BFF" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="18" cy="15" r="8.5" fill="#F5C09A" stroke="#040B24" strokeWidth="2" />
            <path d="M9 13 C10 5, 26 5, 27 13 Z" fill="#1E1B18" />
            <rect x="11" y="24" width="14" height="12" rx="3" fill="#1E6BFF" stroke="#040B24" strokeWidth="2" />
            {/* Spectator 2: Girl in white hijab + yellow top */}
            <path d="M41 22 L35 12" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M51 22 L57 12" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="46" cy="14" r="9.5" fill="#FFFFFF" stroke="#0B1B4D" strokeWidth="2.2" />
            <circle cx="46" cy="15" r="6" fill="#F5C09A" stroke="#040B24" strokeWidth="1.5" />
            <rect x="39" y="23" width="14" height="13" rx="3" fill="#FFD400" stroke="#040B24" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
};
