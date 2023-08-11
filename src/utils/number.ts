import numeral from "numeral";
export const formatNumber = (price: number) => {
  return numeral(price).format("0,0.[00000000]");
};
