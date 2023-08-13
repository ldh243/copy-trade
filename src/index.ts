import { request } from "./utils/axios";
import { API } from "./constant/config";
import { IPosition, IPositionDetail, IProfile } from "./db/types";
import cron from "node-cron";
import { PROFILES } from "./db/profile";
import { formatNumber } from "./utils/number";
import { messageTelegram } from "./utils/telegram";
import { read, save } from "./utils/db";

const messageOpenOrDCAPosition = (
  profile: IProfile,
  newPosition: IPositionDetail,
  oldPosition?: IPositionDetail
) => {
  let message = "";
  const isNew = oldPosition ? false : true;
  const cmd = newPosition.amount > 0 ? "Long" : "Short";
  const icon = newPosition.amount > 0 ? "🟢" : "🔴";
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
    ${icon} User _${profile.username}_ DCA #${newPosition.symbol}
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
  message += `Check out profile [here](${API.PROFILE_URL}${profile.uid})`;
  messageTelegram(message);
};
const messageClosePosition = (
  profile: IProfile,
  closePosition: IPositionDetail
) => {
  let message = "";
  const cmd = closePosition.amount > 0 ? "Long" : "Short";
  const icon = closePosition.amount > 0 ? "🟢" : "🔴";
  message = `
    ${icon} User _${profile.username}_ has closed position:
${cmd} #${closePosition.symbol} x ${closePosition.leverage}
`;

  //add profile url
  message += `Check out profile [here](${API.PROFILE_URL}${profile.uid})`;
  messageTelegram(message);
};

const getPositions = async (uid: string): Promise<IPositionDetail[]> => {
  const params = {
    encryptedUid: uid,
    tradeType: "PERPETUAL",
  };

  const { data } = await request.post(API.GET_POSITION, params);
  return data.otherPositionRetList;
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
    const newPositions: any[] = await getPositions(profile.uid);
    data.push({ uid: profile.uid, data: newPositions });
    comparePosition(profile, positions, newPositions);
  }

  save(data);
};

// main();

// Schedule main() to run every 1 minutes
cron.schedule("*/1 * * * *", () => {
  main();
});
