export const fmtUSD = (n: number | null | undefined, dp = 0): string =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: dp,
        minimumFractionDigits: 0,
      });

export const fmtPct = (n: number | null | undefined, dp = 1): string =>
  n == null ? "—" : `${n.toFixed(dp)}%`;

export const fmtNum = (n: number | null | undefined, dp = 0): string =>
  n == null ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: dp });

/** DSCR display: the 999 sentinel means a cash purchase (no debt). */
export const fmtDscr = (n: number | null | undefined): string =>
  n == null ? "—" : n >= 999 ? "—" : n.toFixed(2);
