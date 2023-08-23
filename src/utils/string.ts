export const getCoinName = (
  pair: string
): { coinName: string; tether: string } => {
  let tether = "USDT";
  if (pair.includes("BUSD")) {
    tether = "BUSD";
  }
  return { coinName: pair.slice(0, -4), tether };
};
