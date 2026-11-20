import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalSeconds: number;
  isPaused: boolean;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalSeconds, isPaused }) => {
  const ratio = totalSeconds > 0 ? Math.max(0, Math.min(1, timeLeft / totalSeconds)) : 0;
  const radius = 29;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  const isUrgent = timeLeft <= 3 && timeLeft > 0;
  const isWarning = timeLeft > 3 && ratio <= 0.5;

  const strokeColor = isUrgent ? '#FF1744' : isWarning ? '#FFD400' : '#00C853';
  const textColor = isUrgent ? 'text-[#FF5277]' : isWarning ? 'text-[#FFD400]' : 'text-[#69F0AE]';
  const ringBg = isUrgent
    ? 'border-[#FF1744] bg-[#2D0613]'
    : isWarning
    ? 'border-[#FFD400] bg-[#0B1B4D]'
    : 'border-[#040B24] bg-[#0B1B4D]';

  return (
    <div
      className={`relative w-[64px] h-[64px] rounded-full border-[3px] shadow-[0_3px_0_#040B24] flex items-center justify-center shrink-0 transition-transform ${ringBg} ${
        isUrgent && !isPaused ? 'animate-timer-urgent' : ''
      }`}
      aria-label={`Sisa waktu ${timeLeft} detik`}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#16307A" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className={`font-display font-bold text-[24px] leading-none tabular-nums text-outline-heavy ${textColor}`}
        >
          {timeLeft}
        </span>
      </div>
    </div>
  );
};
