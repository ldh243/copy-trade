export const getCoinName = (
  pair: string
): { coinName: string; tether: string } => {
  let tether = "BUSD";
  if (pair.includes("USDT")) {
    tether = "USDT";
  }
  return { coinName: pair.slice(0, -4), tether };
};

export const uppercaseFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatSymbolOkex = (symbol: string): string => {
  const arr = symbol.split("-");
  return arr[0] + arr[1];
};
