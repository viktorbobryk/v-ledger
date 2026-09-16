export const DEFAULT_PLAYBOOKS = [
  {
    slug: "hhll",
    name: "HHLL",
    description:
      "Turtle / Donchian breakout. Trade with the SMA, require a close beyond the level, skip the chase.",
    sort_order: 1,
  },
  {
    slug: "vwap",
    name: "VWAP",
    description:
      "Session mean reversion. Fade the σ bands or reclaim VWAP after an excursion.",
    sort_order: 2,
  },
  {
    slug: "orb",
    name: "ORB",
    description:
      "Opening range breakout. First TAKE of the session, stop at the opposite side of the range.",
    sort_order: 3,
  },
  {
    slug: "sweep",
    name: "Sweep",
    description:
      "Liquidity sweep. Wick beyond a swing, close back inside, then reclaim the level.",
    sort_order: 4,
  },
] as const;

export type Playbook = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
};
