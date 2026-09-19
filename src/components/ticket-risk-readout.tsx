function formatAmount(value: number, fractionDigits: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: fractionDigits });
}

export function TicketRiskReadout({
  riskDollars,
  distance,
}: {
  riskDollars: number | null;
  distance: number | null;
}) {
  return (
    <p className="font-mono text-sm text-mist">
      <span className="text-fog">Risk </span>
      {riskDollars === null ? "—" : `$${formatAmount(riskDollars, 2)}`}
      <span className="text-fog"> · Stop </span>
      {distance === null ? "—" : formatAmount(distance, 4)}
    </p>
  );
}
