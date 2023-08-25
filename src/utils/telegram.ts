import { Telegraf } from "telegraf";
import { TELEGRAM_KEY } from "../constant/config";
import { IPosition, IPositionDetail, IProfile } from "../db/types";
import { formatNumber } from "./number";
import { getMarkPrice } from "../binance";
import { getCoinName } from "./string";
import { getOkexBalance } from "../okex";
const bot = new Telegraf(TELEGRAM_KEY);

export const messageTelegram = async (content: string, profile: IProfile) => {
  const balance = await getOkexBalance();
  let message = content;
  console.log("==========================================================");
  console.log(content);

  message = `📣 *CHÚ Ý* 📣` + message;

  message += `
*Balance hiện tại:* \`${formatNumber(balance, 2)}\``;

  bot.telegram.sendMessage(profile.channelId, message, {
    parse_mode: "Markdown",
  });
};

export const openPositionMsg = (
  profile: IProfile,
  newPosition: IPositionDetail
) => {
  const cmd = newPosition.amount > 0 ? "Long" : "Short";
  const icon = newPosition.amount > 0 ? "🟢" : "🔴";
  const { tether } = getCoinName(newPosition.symbol);

  let message = `
_${profile.username}_ vừa mở lệnh kìa:
${icon} *${cmd}* #${newPosition.symbol} x ${newPosition.leverage}
Entry: \`${formatNumber(newPosition.entryPrice)}\`
Volume: \`${formatNumber(
    newPosition.amount * newPosition.entryPrice
  )}\` ${tether}
`;
  messageTelegram(message, profile);
};

export const dcaPositionMsg = (
  profile: IProfile,
  newPosition: IPositionDetail
) => {
  const cmd = newPosition.amount > 0 ? "Long" : "Short";
  const icon = newPosition.amount > 0 ? "🟢" : "🔴";
  const { tether } = getCoinName(newPosition.symbol);

  let message = `
_${profile.username}_ vừa DCA thêm #${newPosition.symbol}
${icon} ${cmd} #${newPosition.symbol} x ${newPosition.leverage}
Entry: \`${formatNumber(newPosition.markPrice)}\`
Volume: \`${formatNumber(
    newPosition.amount * newPosition.entryPrice
  )}\` ${tether}
Profit: \`${formatNumber(newPosition.pnl)}\` ${tether}
  `;
  messageTelegram(message, profile);
};

export const closePositionMsg = async (
  profile: IProfile,
  closePosition: IPositionDetail
) => {
  let message = "";
  const closePrice = await getMarkPrice(closePosition.symbol);
  const entryPrice = closePosition.entryPrice;
  const cmd = closePosition.amount > 0 ? "Long" : "Short";
  const icon = closePosition.amount > 0 ? "🟢" : "🔴";
  const profit = (closePrice - entryPrice) * closePosition.amount;
  const percentage =
    (profit / (Math.abs(closePosition.amount) * closePrice)) *
    closePosition.leverage;
  const { tether } = getCoinName(closePosition.symbol);
  message = `
_${profile.username}_ đã đóng lệnh:
${icon} ${cmd} #${closePosition.symbol} x ${closePosition.leverage}
Entry price: \`${formatNumber(entryPrice)}\`
Close price: \`${formatNumber(closePrice)}\`
Profit: \`${formatNumber(profit, 2)}\` ${tether} (${formatNumber(
    percentage * 100,
    2
  )}%)
`;

  messageTelegram(message, profile);
  // closeMyPosition(profile.username, closePosition.symbol, cmd);
};

export const closePartOfPositionMsg = async (
  profile: IProfile,
  closePosition: IPositionDetail,
  oldPosition: IPositionDetail
) => {
  let message = "";
  const closePrice = await getMarkPrice(closePosition.symbol);
  const entryPrice = closePosition.entryPrice;
  const cmd = closePosition.amount > 0 ? "Long" : "Short";
  const icon = closePosition.amount > 0 ? "🟢" : "🔴";
  const closeAmount =
    Math.abs(oldPosition.amount - closePosition.amount) *
    (closePosition.amount > 0 ? 1 : -1);
  const profit = (closePrice - entryPrice) * closeAmount;
  const percentage =
    (profit / (Math.abs(closeAmount) * closePrice)) * closePosition.leverage;

  message = `
    ${icon} User _${profile.username}_ has closed a part of position:
${cmd} #${closePosition.symbol} x ${closePosition.leverage}
Entry price: \`${formatNumber(
    entryPrice
  )}\` | Remaining Amount: \`${formatNumber(closePosition.amount)}\` 
Close price: \`${formatNumber(closePrice)}\` | Amount: \`${formatNumber(
    closeAmount
  )}\` | Profit: ${formatNumber(profit, 2)}(${formatNumber(
    percentage * 100,
    2
  )}%)
`;
  messageTelegram(message, profile);
};

export const alertPositionByProfile = async (
  positions: IPosition[],
  profile: IProfile
) => {
  const currentPositions = positions.find(
    (pos: IPosition) => pos.username === profile.username
  );

  if (currentPositions && currentPositions.data.length === 0) {
    return;
  }

  if (currentPositions) {
    let message = `
_${profile.username}_ có các vị thế hiện tại là:`;
    for await (const position of currentPositions.data) {
      const cmd = position.amount > 0 ? "Long" : "Short";
      const icon = position.amount > 0 ? "🟢" : "🔴";
      const currentPrice = await getMarkPrice(position.symbol);
      const profit = (currentPrice - position.entryPrice) * position.amount;
      const percentage =
        (profit / (Math.abs(position.amount) * currentPrice)) *
        position.leverage *
        100;

      const { tether } = getCoinName(position.symbol);
      message += `
${icon} *${cmd}* #${position.symbol} x ${position.leverage}
Entry: \`${formatNumber(position.entryPrice)}\`
Volume: \`${formatNumber(position.amount * position.entryPrice)}\` ${tether}
Profit: \`${formatNumber(profit, 2)}\` ${tether} (${formatNumber(
        percentage,
        2
      )}%)
`;
    }
    messageTelegram(message, profile);
  }
};
