import { useEffect, useRef } from 'react';
import './FadeOutProgress.css';

interface Props {
  startedAt: number;
  duration: number;
}

export function FadeOutProgress({ startedAt, duration }: Props) {
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = fillRef.current;
    if (!element) return;

    const durationMs = Math.max(1, duration * 1000);

    const animation = element.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], {
      duration: durationMs,
      easing: 'linear',
      fill: 'forwards'
    });

    return () => animation.cancel();
  }, [startedAt, duration]);

  return (
    <span className="fade-out-progress" aria-hidden="true">
      <span ref={fillRef} className="fade-out-progress__fill" />
    </span>
  );
}
