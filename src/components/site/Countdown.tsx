import { useEffect, useState } from "react";

function format(ms: number) {
  if (ms <= 0) return "Ended";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${d}d ${h}h ${m}m left`;
}

export function Countdown({ endsAt, className = "" }: { endsAt: number; className?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  return <span className={className}>{format(endsAt - now)}</span>;
}
