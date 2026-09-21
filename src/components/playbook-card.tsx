import { PlaybookStatLine } from "@/components/playbook-stat-line";
import type { Playbook } from "@/lib/playbooks/defaults";
import { emptyPlaybookStats, type PlaybookStats } from "@/lib/playbooks/stats";

export function PlaybookCard({
  playbook,
  stats,
}: {
  playbook: Playbook;
  stats?: PlaybookStats;
}) {
  return (
    <article className="rounded-xl border border-line bg-paper p-5">
      <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase">
        {playbook.slug}
      </p>
      <h2 className="mt-2 text-lg font-medium text-mist">{playbook.name}</h2>
      <p className="mt-2 text-sm leading-6 text-fog">{playbook.description}</p>
      <div className="mt-4">
        <PlaybookStatLine stats={stats ?? emptyPlaybookStats(playbook.id)} />
      </div>
    </article>
  );
}
