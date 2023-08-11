import { Telegraf } from "telegraf";
import { request } from "./utils/axios";
import {
  API,
  DB_PATH,
  TELEGRAM_CHANNEL_ID,
  TELEGRAM_KEY,
} from "./constant/config";
import fs from "fs";
import { IPosition, IPositionDetail, IProfile } from "./db/types";
import cron from "node-cron";
import { PROFILES } from "./db/profile";

const messageOpenOrDCAPosition = (
  profile: IProfile,
  newPosition: IPositionDetail,
  oldPosition?: IPositionDetail
) => {
  let message = "";
  const cmd = newPosition.amount > 0 ? "Long" : "Short";
  const isNew = oldPosition ? false : true;
  if (isNew) {
    message = `
    \`User ${profile.username} make new position:
${cmd} ${newPosition.symbol} x ${newPosition.leverage}
Entry: ${newPosition.entryPrice} | Volume: ${newPosition.amount} | Mark: ${newPosition.markPrice}\`
`;
  } else if (oldPosition) {
    message = `
    \`User ${profile.username} DCA ${cmd} ${newPosition.symbol}.
Old: Entry: ${oldPosition.entryPrice} | Volume: ${oldPosition.entryPrice}
New: Entry: ${newPosition.entryPrice} | Volume: ${newPosition.entryPrice} | Mark: ${newPosition.markPrice}\`
`;
  }

  //add profile url
  message += `\`Check out profile\`  [here](${API.PROFILE_URL}${profile.uid})`;
  pushMsgTele(message);
};
const messageClosePosition = (
  profile: IProfile,
  closePosition: IPositionDetail
) => {
  let message = "";
  const cmd = closePosition.amount > 0 ? "Long" : "Short";
  message = `
    \`User ${profile.username} has closed position:
${cmd} ${closePosition.symbol} x ${closePosition.leverage}\`
`;

  //add profile url
  message += `\`Check out profile\`  [here](${API.PROFILE_URL}${profile.uid})`;
  pushMsgTele(message);
};

const pushMsgTele = (content: string) => {
  const bot = new Telegraf(TELEGRAM_KEY);
  bot.telegram.sendMessage(TELEGRAM_CHANNEL_ID, content, {
    parse_mode: "Markdown",
  });
};

const readDB = async (): Promise<IPosition[]> => {
  const data = await fs.promises.readFile(DB_PATH, "utf8");
  const result: IPosition[] = JSON.parse(data);
  return result;
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

const saveDB = async (data: IPosition[]) => {
  try {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
};

const main = async () => {
  const positions = await readDB();

  const data: IPosition[] = [];

  for (const profile of PROFILES) {
    const newPositions: any[] = await getPositions(profile.uid);
    data.push({ uid: profile.uid, data: newPositions });
    comparePosition(profile, positions, newPositions);
  }

  saveDB(data);
};

// main();

// Schedule main() to run every 2 minutes
cron.schedule("*/2 * * * *", () => {
  main();
});
