import { BASE_ENDPOINT } from "./constant/config";
import { IPosition, IPositionDetail, IProfile } from "./db/types";
import cron from "node-cron";
import { PROFILES } from "./db/profile";
import { formatNumber } from "./utils/number";
import { messageTelegram } from "./utils/telegram";
import { read, save } from "./utils/db";
import { getMarkPrice, getOtherPosition } from "./binance";

const messageOpenOrDCAPosition = async (
  profile: IProfile,
  newPosition: IPositionDetail,
  oldPosition?: IPositionDetail
) => {
  let message = "";

  const isNew = oldPosition ? false : true;
  const cmd = newPosition.amount > 0 ? "Long" : "Short";
  const icon = newPosition.amount > 0 ? "🟢" : "🔴";
  const markPrice = await getMarkPrice(newPosition.symbol);

  if (isNew) {
    message = `
    ${icon} User _${profile.username}_ make new position:
${cmd} #${newPosition.symbol} x ${newPosition.leverage}
Entry: \`${formatNumber(newPosition.entryPrice)}\` | Volume: \`${formatNumber(
      newPosition.amount
    )}\`
`;
  } else if (oldPosition) {
    message = `
    ${icon} User _${profile.username}_ DCA #${
      newPosition.symbol
    } at entry ${formatNumber(markPrice)}
${cmd} #${newPosition.symbol} x ${newPosition.leverage}
Old: Entry: \`${formatNumber(
      oldPosition.entryPrice
    )}\` | Volume: \`${formatNumber(oldPosition.amount)}\`
New: Entry: \`${formatNumber(
      newPosition.entryPrice
    )}\` | Volume: \`${formatNumber(
      newPosition.amount
    )}\` | Mark: \`${formatNumber(newPosition.markPrice)}\`
`;
  }

  //add profile url
  message += `Check out profile [here](${BASE_ENDPOINT.PROFILE_URL}${profile.uid})`;
  messageTelegram(message);
};
const messageClosePosition = async (
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
    ((closePrice - entryPrice) / closePrice) *
    closePosition.leverage *
    (closePosition.amount > 0 ? 1 : -1);

  message = `
    ${icon} User _${profile.username}_ has closed position:
${cmd} #${closePosition.symbol} x ${closePosition.leverage}
Entry price: ${formatNumber(entryPrice)} | Close price: ${formatNumber(
    closePrice
  )} | Profit: ${formatNumber(profit, 2)}(${formatNumber(percentage * 100, 2)}%)
`;

  //add profile url
  message += `Check out profile [here](${BASE_ENDPOINT.PROFILE_URL}${profile.uid})`;
  messageTelegram(message);
};

const comparePosition = async (
  profile: IProfile,
  positions: IPosition[],
  newPositions: IPositionDetail[]
) => {
  const currentPositions = positions.find(
    (position: IPosition) => position.uid === profile.uid
  );

  //check DCA or open new position
  newPositions.forEach((newPosition: IPositionDetail) => {
    const currentPositionBySymbol = currentPositions?.data.find(
      (currentPosition) => currentPosition.symbol === newPosition.symbol
    );
    if (
      currentPositionBySymbol?.amount !== newPosition.amount ||
      currentPositionBySymbol?.entryPrice !== newPosition.entryPrice
    ) {
      messageOpenOrDCAPosition(profile, newPosition, currentPositionBySymbol);
    }
  });

  //check close position
  currentPositions?.data.forEach((currentPosition: IPositionDetail) => {
    const newPositionBySymbol = newPositions.findIndex(
      (newPosition) => newPosition.symbol === currentPosition.symbol
    );
    if (newPositionBySymbol === -1) {
      messageClosePosition(profile, currentPosition);
    }
  });
};

const main = async () => {
  const positions = await read();

  const data: IPosition[] = [];

  for (const profile of PROFILES) {
    const newPositions: any[] = await getOtherPosition(profile.uid);
    data.push({ uid: profile.uid, data: newPositions });
    comparePosition(profile, positions, newPositions);
  }

  save(data);
};

// main();
// binance();

// Schedule main() to run every 30 seconds
cron.schedule("*/30 * * * * *", () => {
  main();
});
