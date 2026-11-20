import React, { useLayoutEffect, useRef, useState } from 'react';

interface AutoFitTextProps {
  text: string;
  minSize: number;
  maxSize: number;
  lineHeight?: number;
  as?: 'div' | 'h3' | 'p' | 'span' | 'pre';
  className?: string;
  containerClassName?: string;
  centerVertically?: boolean;
  onOverflowAtMin?: (overflowing: boolean) => void;
}

/**
 * Binary-search auto-fitting text component (1px precision) designed for
 * fixed 1600x900 CSS-scaled stages. Uses local un-transformed DOM metrics
 * (clientWidth/clientHeight vs scrollWidth/scrollHeight) and ResizeObserver.
 */
export const AutoFitText: React.FC<AutoFitTextProps> = ({
  text,
  minSize,
  maxSize,
  lineHeight = 1.3,
  as = 'span',
  className = '',
  containerClassName = '',
  centerVertically = false,
  onOverflowAtMin,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLElement | null>(null);
  const onOverflowRef = useRef(onOverflowAtMin);
  onOverflowRef.current = onOverflowAtMin;

  const [fontSize, setFontSize] = useState<number>(maxSize);
  const [resizeTick, setResizeTick] = useState(0);

  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      setResizeTick((t) => t + 1);
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    const textEl = textRef.current;
    if (!containerEl || !textEl) return;

    const maxW = containerEl.clientWidth;
    const style = window.getComputedStyle(containerEl);
    const parsedMaxH = Number.parseFloat(style.maxHeight);
    const maxH =
      !centerVertically && Number.isFinite(parsedMaxH) && parsedMaxH > 0
        ? parsedMaxH
        : containerEl.clientHeight;
    if (maxW <= 0 || maxH <= 0) return;

    const prevOverflow = containerEl.style.overflow;
    containerEl.style.overflow = 'hidden';
    textEl.style.lineHeight = String(lineHeight);
    textEl.style.letterSpacing = '0px';

    let low = minSize;
    let high = maxSize;
    let best = minSize;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      textEl.style.fontSize = `${mid}px`;

      const fitsHeight = textEl.scrollHeight <= maxH + 1;
      const fitsWidth = textEl.scrollWidth <= maxW + 1;

      if (fitsHeight && fitsWidth) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    textEl.style.fontSize = `${best}px`;
    const isOverflowAtMin =
      best <= minSize &&
      (textEl.scrollHeight > maxH + 1 || textEl.scrollWidth > maxW + 1);

    containerEl.style.overflow = prevOverflow;
    setFontSize(best);
    onOverflowRef.current?.(isOverflowAtMin);
  }, [text, minSize, maxSize, lineHeight, centerVertically, resizeTick]);

  const Tag = as as React.ElementType;

  return (
    <div
      ref={containerRef}
      className={`w-full min-w-0 ${
        centerVertically ? 'h-full flex items-center' : ''
      } ${containerClassName}`}
    >
      <Tag
        ref={textRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight,
          letterSpacing: '0px',
        }}
        className={`block w-full min-w-0 ${className}`}
      >
        {text}
      </Tag>
    </div>
  );
};
