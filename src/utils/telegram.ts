import { Telegraf } from "telegraf";
import {
  TELEGRAM_CHANNEL_ID,
  TELEGRAM_CHANNEL_ID_LADUY,
  TELEGRAM_KEY,
} from "../constant/config";
import { IPosition, IPositionDetail, IProfile } from "../db/types";
import { formatNumber } from "./number";
import { getMarkPrice } from "../binance";
import { closeMyPosition } from "../account";

export const messageTelegram = (content: string, profile?: IProfile) => {
  const bot = new Telegraf(TELEGRAM_KEY);
  let message = content;
  console.log("==========================================================");
  console.log(content);
  // if (profile) {
  //   //add profile url
  //   message += `Check out profile [here](${BASE_ENDPOINT.PROFILE_URL}${profile.uid})`;
  // }
  bot.telegram.sendMessage(TELEGRAM_CHANNEL_ID, message, {
    parse_mode: "Markdown",
  });

  if (message.includes("laduy")) {
    bot.telegram.sendMessage(TELEGRAM_CHANNEL_ID_LADUY, message, {
      parse_mode: "Markdown",
    });
  }
};

export const openPositionMsg = (
  profile: IProfile,
  newPosition: IPositionDetail
) => {
  const cmd = newPosition.amount > 0 ? "Long" : "Short";
  const icon = newPosition.amount > 0 ? "🟢" : "🔴";

  let message = `
    ${icon} User _${profile.username}_ make new position:
${cmd} #${newPosition.symbol} x ${newPosition.leverage}
Entry: \`${formatNumber(newPosition.entryPrice)}\` | Volume: \`${formatNumber(
    newPosition.amount
  )}\`
`;
  messageTelegram(message, profile);
};

export const dcaPositionMsg = (
  profile: IProfile,
  newPosition: IPositionDetail,
  oldPosition: IPositionDetail
) => {
  const cmd = newPosition.amount > 0 ? "Long" : "Short";
  const icon = newPosition.amount > 0 ? "🟢" : "🔴";

  let message = `
  ${icon} User _${profile.username}_ DCA #${newPosition.symbol}
${cmd} #${newPosition.symbol} x ${
    newPosition.leverage
  } | Entry: \`${formatNumber(newPosition.markPrice)}\`
Old: Entry: \`${formatNumber(
    oldPosition.entryPrice
  )}\` | Volume: \`${formatNumber(oldPosition.amount)}\`
New: Entry: \`${formatNumber(
    newPosition.entryPrice
  )}\` | Volume: \`${formatNumber(newPosition.amount)}\`
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

  message = `
    ${icon} User _${profile.username}_ has closed position:
${cmd} #${closePosition.symbol} x ${closePosition.leverage}
Entry price: \`${formatNumber(entryPrice)}\` | Close price: \`${formatNumber(
    closePrice
  )}\` | Profit: ${formatNumber(profit, 2)}(${formatNumber(
    percentage * 100,
    2
  )}%)
`;

  messageTelegram(message, profile);
  closeMyPosition(profile.username, closePosition.symbol, cmd);
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
    (pos: IPosition) => pos.uid === profile.uid
  );

  if (currentPositions && currentPositions.data.length === 0) {
    messageTelegram(`User _${profile.username}_ đã đóng hết mẹ lệnh rồi!`);
  }

  if (currentPositions) {
    let message = `User _${profile.username}_ current position:`;
    for await (const position of currentPositions.data) {
      const cmd = position.amount > 0 ? "Long" : "Short";
      const icon = position.amount > 0 ? "🟢" : "🔴";
      const currentPrice = await getMarkPrice(position.symbol);
      const profit = (currentPrice - position.entryPrice) * position.amount;
      const percentage =
        (profit / (Math.abs(position.amount) * currentPrice)) *
        position.leverage;
      console.log("abc");
      message += `
${icon} ${cmd} #${position.symbol} x ${position.leverage}
Entry: \`${formatNumber(position.entryPrice)}\` | Volume: \`${formatNumber(
        position.amount
      )}\`| Profit: ${formatNumber(profit, 2)}(${formatNumber(
        percentage * 100,
        2
      )}%)
    `;
    }
    messageTelegram(message);
  }
};
