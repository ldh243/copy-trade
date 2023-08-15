import BigNumber from "bignumber.js";
import numeral from "numeral";

export const formatNumber = (num: any, scale = 8) => {
  // Avoid scientist format
  if (Number(num) < 1) return fixed(num, scale);

  let formatString = `0,0`;
  if (scale) {
    formatString += `[.]${`0`.repeat(scale)}`;
  }
  return numeral(num).format(formatString, Math.floor);
};

export const fixed = (value: string, scale: number) => {
  const result = new BigNumber(value).toFixed(scale, BigNumber.ROUND_DOWN);
  return result;
};
