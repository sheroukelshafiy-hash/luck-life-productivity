import { useEffect, useState } from "react";

/**
 * Live clock. Ticks every `intervalMs` (default 1s) so the UI always reflects
 * the user's real local date/time and rolls over automatically at midnight.
 */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Today's date, refreshed once a minute (enough to catch a day change). */
export function useToday() {
  return useNow(60_000);
}
