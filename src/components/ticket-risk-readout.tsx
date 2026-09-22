import { positionQty } from "@/lib/trades/types";

function formatAmount(value: number, fractionDigits: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: fractionDigits });
}

export function TicketRiskReadout({
  riskDollars,
  distance,
  instrument,
}: {
  riskDollars: number | null;
  distance: number | null;
  instrument: string | null;
}) {
  const qty = positionQty(riskDollars, distance);

  return (
    <p className="font-mono text-sm text-mist">
      <span className="text-fog">Risk </span>
      {riskDollars === null ? "—" : `$${formatAmount(riskDollars, 2)}`}
      <span className="text-fog"> · Stop </span>
      {distance === null ? "—" : formatAmount(distance, 4)}
      <span className="text-fog"> · Qty </span>
      {qty === null || !instrument
        ? "—"
        : `${formatAmount(qty, 6)} ${instrument}`}
    </p>
  );
}
