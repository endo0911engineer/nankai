import { useEffect, useState } from "react";

export function useCountUp(target: number, duration = 1400): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setCount(0);
      return;
    }
    const startTime = Date.now();
    let rafId: ReturnType<typeof requestAnimationFrame>;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return count;
}
