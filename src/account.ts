import { getAccountPosition, getMarkPrice, makeOrder } from "./binance";
import { IAccountPositionDetail } from "./db/types";
import { formatNumber } from "./utils/number";
import { messageTelegram } from "./utils/telegram";

export const closeMyPosition = async (
  username: string,
  symbol: string,
  cmd: string
) => {
  if (username !== "Smartestmoneydoteth") return;

  const myPositions = await getAccountPosition();
  const positionBySymbol = myPositions.find(
    (position: IAccountPositionDetail) =>
      position.symbol === symbol &&
      (Number(position.positionAmt) > 0 ? "Long" : "Short") === cmd
  );

  if (!positionBySymbol) {
    return false;
  }

  const isClose: Boolean = await makeOrder(positionBySymbol);

  if (isClose) {
    let message = "";
    const icon = cmd === "Long" ? "🟢" : "🔴";
    const closePrice = await getMarkPrice(positionBySymbol.symbol);
    message = `
    ${icon} Closed position: ${cmd} #${positionBySymbol.symbol} x ${
      positionBySymbol.leverage
    }
Entry price: ${formatNumber(
      positionBySymbol.entryPrice
    )} | Close price: ${formatNumber(closePrice)} | Profit: ${formatNumber(
      positionBySymbol.unrealizedProfit,
      2
    )}
`;
    messageTelegram(message);
  }
};
