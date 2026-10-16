import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * RouteProgressBar - Ultra-fast, zero-latency top progress indicator
 * Triggers instantly on route change and smoothly completes without delaying the UI.
 */
export const RouteProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any previous running timers
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    // Trigger immediate visual progress
    setVisible(true);
    setProgress(25);

    // Fast, non-blocking progression
    const t1 = setTimeout(() => {
      setProgress(75);
    }, 40);

    const t2 = setTimeout(() => {
      setProgress(100);
    }, 180);

    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 320);

    timerRef.current = [t1, t2, t3];

    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] h-[2.5px] pointer-events-none overflow-hidden transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="h-full bg-gradient-to-r from-[#b39d82] via-[#4854cc] to-[#38bdf8] shadow-[0_0_8px_rgba(72,84,204,0.6)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default RouteProgressBar;
