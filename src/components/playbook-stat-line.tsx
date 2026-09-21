import type { PlaybookStats } from "@/lib/playbooks/stats";

function formatRate(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${Math.round(value * 100)}%`;
}

function formatR(value: number | null) {
  if (value === null) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}R`;
}

export function PlaybookStatLine({ stats }: { stats: PlaybookStats }) {
  if (stats.closed === 0) {
    return (
      <p className="font-mono text-xs text-fog">
        No closes yet
        {stats.skipped > 0 ? ` · ${stats.skipped} skipped` : ""}
      </p>
    );
  }

  const tone =
    stats.avgR === null || stats.avgR === 0
      ? "text-mist"
      : stats.avgR > 0
        ? "text-gain"
        : "text-loss";

  return (
    <p className="font-mono text-sm">
      <span className={tone}>
        {formatRate(stats.winRate)} wr · {formatR(stats.avgR)}
      </span>
      <span className="text-fog">
        {" "}
        · {stats.closed} closed
        {stats.skipped > 0 ? ` · ${stats.skipped} skipped` : ""}
      </span>
    </p>
  );
}
