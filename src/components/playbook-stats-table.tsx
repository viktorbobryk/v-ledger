import { PlaybookStatLine } from "@/components/playbook-stat-line";
import type { Playbook } from "@/lib/playbooks/defaults";
import { emptyPlaybookStats, type PlaybookStats } from "@/lib/playbooks/stats";

export function PlaybookStatsTable({
  playbooks,
  stats,
}: {
  playbooks: Playbook[];
  stats: Map<string, PlaybookStats>;
}) {
  if (playbooks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-paper text-fog">
          <tr>
            <th className="px-4 py-3 font-medium">Playbook</th>
            <th className="px-4 py-3 font-medium">Closed stats</th>
          </tr>
        </thead>
        <tbody>
          {playbooks.map((playbook) => (
            <tr key={playbook.id} className="border-b border-line last:border-b-0">
              <td className="px-4 py-3 font-mono text-gold uppercase">
                {playbook.slug}
              </td>
              <td className="px-4 py-3">
                <PlaybookStatLine
                  stats={stats.get(playbook.id) ?? emptyPlaybookStats(playbook.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
