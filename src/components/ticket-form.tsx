"use client";

import { useRef, useState } from "react";
import { createTicket } from "@/app/actions/trades";
import { TicketRiskReadout } from "@/components/ticket-risk-readout";
import type { Playbook } from "@/lib/playbooks/defaults";
import {
  plannedStopError,
  stopDistance,
  toNumber,
  TRADE_INSTRUMENTS,
} from "@/lib/trades/types";

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-mist outline-none placeholder:text-fog/70 focus:border-gold focus:ring-2 focus:ring-gold/30";

type TicketFormProps = {
  sessionId: string;
  riskDollars: number | null;
  playbooks: Playbook[];
};

function formNumber(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? toNumber(value) : null;
}

function stopErrorFromForm(form: HTMLFormElement) {
  const data = new FormData(form);
  const side = data.get("side");

  if (side !== "long" && side !== "short") {
    return null;
  }

  return plannedStopError(
    side,
    formNumber(data, "planned_entry"),
    formNumber(data, "planned_sl"),
  );
}

export function TicketForm({
  sessionId,
  riskDollars,
  playbooks,
}: TicketFormProps) {
  const stopRef = useRef<HTMLInputElement>(null);
  const [stopError, setStopError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  if (playbooks.length === 0) {
    return (
      <p className="mt-4 text-sm text-fog">
        Add playbooks before locking a ticket.
      </p>
    );
  }

  function syncPlanMetrics(form: HTMLFormElement) {
    const data = new FormData(form);
    const error = stopErrorFromForm(form);
    setStopError(error);
    stopRef.current?.setCustomValidity(error ?? "");
    setDistance(
      stopDistance(
        formNumber(data, "planned_entry"),
        formNumber(data, "planned_sl"),
      ),
    );
  }

  return (
    <form
      action={createTicket}
      onInput={(event) => syncPlanMetrics(event.currentTarget)}
      onChange={(event) => syncPlanMetrics(event.currentTarget)}
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
            ref={stopRef}
            name="planned_sl"
            type="number"
            required
            step="any"
            inputMode="decimal"
            aria-invalid={stopError ? true : undefined}
            className={
              stopError
                ? `${fieldClassName} border-loss focus:border-loss focus:ring-loss/30`
                : fieldClassName
            }
          />
          {stopError ? (
            <span className="mt-1.5 block text-xs text-loss">{stopError}</span>
          ) : null}
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
      <div className="mt-4">
        <TicketRiskReadout riskDollars={riskDollars} distance={distance} />
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
