import { createRequire } from "node:module";

if (process.platform === "win32") {
  const require = createRequire(import.meta.url);
  const winCa = require("win-ca/api") as (options: { inject: string }) => void;
  winCa({ inject: "+" });
}
