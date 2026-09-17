import type { Playbook } from "@/lib/playbooks/defaults";
import { createTicket } from "@/app/actions/trades";
import { TRADE_INSTRUMENTS } from "@/lib/trades/types";

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-mist outline-none placeholder:text-fog/70 focus:border-gold focus:ring-2 focus:ring-gold/30";

type TicketFormProps = {
  sessionId: string;
  playbooks: Playbook[];
};

export function TicketForm({ sessionId, playbooks }: TicketFormProps) {
  if (playbooks.length === 0) {
    return (
      <p className="mt-4 text-sm text-fog">
        Add playbooks before locking a ticket.
      </p>
    );
  }

  return (
    <form
      action={createTicket}
      className="mt-5 rounded-xl border border-line bg-paper p-5"
    >
      <input type="hidden" name="session_id" value={sessionId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-fog">
          Playbook
          <select name="playbook_id" required className={fieldClassName}>
            {playbooks.map((playbook) => (
              <option key={playbook.id} value={playbook.id}>
                {playbook.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-fog">
          Instrument
          <select name="instrument" required className={fieldClassName}>
            {TRADE_INSTRUMENTS.map((instrument) => (
              <option key={instrument} value={instrument}>
                {instrument}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-fog">
          Side
          <select name="side" required className={fieldClassName}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-fog">
          Planned entry
          <input
            name="planned_entry"
            type="number"
            required
            step="any"
            inputMode="decimal"
            className={fieldClassName}
          />
        </label>
        <label className="text-sm text-fog">
          Planned SL
          <input
            name="planned_sl"
            type="number"
            required
            step="any"
            inputMode="decimal"
            className={fieldClassName}
          />
        </label>
        <label className="text-sm text-fog">
          Planned TP
          <input
            name="planned_tp"
            type="number"
            step="any"
            inputMode="decimal"
            className={fieldClassName}
          />
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-fog">
          Filled entry
          <input
            name="filled_entry"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="Leave empty if not filled"
            className={fieldClassName}
          />
        </label>
        <label className="text-sm text-fog">
          Filled exit
          <input
            name="filled_exit"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="Optional"
            className={fieldClassName}
          />
        </label>
      </div>
      <label className="mt-4 block text-sm text-fog">
        Notes
        <textarea
          name="notes"
          rows={2}
          placeholder="What you saw. Why this ticket."
          className={fieldClassName}
        />
      </label>
      <button
        type="submit"
        className="mt-5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink hover:bg-gold/90"
      >
        Lock ticket
      </button>
    </form>
  );
}
