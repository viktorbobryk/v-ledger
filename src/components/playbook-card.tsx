import type { Playbook } from "@/lib/playbooks/defaults";

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  return (
    <article className="rounded-xl border border-line bg-paper p-5">
      <p className="font-mono text-xs tracking-[0.2em] text-gold uppercase">
        {playbook.slug}
      </p>
      <h2 className="mt-2 text-lg font-medium text-mist">{playbook.name}</h2>
      <p className="mt-2 text-sm leading-6 text-fog">{playbook.description}</p>
    </article>
  );
}
