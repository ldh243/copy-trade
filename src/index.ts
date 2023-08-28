import {
  IPosition,
  IPositionDetail,
  IPositionDetailHistory,
  IProfile,
  OkexInstrument,
} from "./db/types";
import { PROFILES } from "./db/profile";
import {
  alertPositionByProfile,
  closePartOfPositionMsg,
  closePositionMsg,
  closePositionOkexMsg,
  dcaPositionMsg,
  openPositionMsg,
  testMessage,
} from "./utils/telegram";
import { read, save } from "./utils/db";
import { getOtherPosition } from "./binance";
import {
  getOkexAccountPosition,
  getOkexAccountPositionHistory,
  getOkexInstrument,
} from "./okex";
import { PROFILE_TYPE } from "./constant/config";

const comparePosition = async (
  profile: IProfile,
  positions: IPosition[],
  newPositions: IPositionDetail[]
) => {
  const currentPositions = positions.find(
    (position: IPosition) => position.username === profile.username
  );

  //check DCA or open new position
  newPositions.forEach((newPosition: IPositionDetail) => {
    const currentPositionBySymbol = currentPositions?.data.find(
      (currentPosition) =>
        currentPosition.symbol === newPosition.symbol &&
        currentPosition.type === newPosition.type
    );
    if (!currentPositionBySymbol) {
      openPositionMsg(profile, newPosition);
    } else if (
      Math.abs(currentPositionBySymbol.amount) - Math.abs(newPosition.amount) >
        0 &&
      currentPositionBySymbol.entryPrice === newPosition.entryPrice
    ) {
      closePartOfPositionMsg(profile, newPosition, currentPositionBySymbol);
    } else if (
      currentPositionBySymbol.amount !== newPosition.amount ||
      currentPositionBySymbol.entryPrice !== newPosition.entryPrice
    ) {
      dcaPositionMsg(profile, newPosition);
    }
  });
  //check close position
  if (currentPositions?.data) {
    let okexPositionHistory: IPositionDetailHistory[] = [];
    if (profile.type === PROFILE_TYPE.OKEX_API) {
      okexPositionHistory = await getOkexAccountPositionHistory();
    }
    for await (const currentPosition of currentPositions?.data) {
      const newPositionBySymbol = newPositions.findIndex(
        (newPosition) =>
          newPosition.symbol === currentPosition.symbol &&
          newPosition.type === currentPosition.type
      );
      if (newPositionBySymbol === -1) {
        if (profile.type === PROFILE_TYPE.OKEX_API) {
          closePositionOkexMsg(profile, currentPosition, okexPositionHistory);
        } else {
          closePositionMsg(profile, currentPosition);
        }
      }
    }
  }
};

const alertPosition = async () => {
  const profile = PROFILES.find((el) => el.username.includes("laduy"));
  const positions = await read();
  if (profile) {
    alertPositionByProfile(positions, profile);
  }
};

const getPosition = async (
  profile: IProfile,
  instruments: OkexInstrument[]
): Promise<IPositionDetail[]> => {
  let result: IPositionDetail[] = [];
  if (profile.type === PROFILE_TYPE.BINANCE_BOARD) {
    result = await getOtherPosition(profile);
  } else if (profile.type === PROFILE_TYPE.BINANCE_API) {
    //not implement yet
  } else if (profile.type === PROFILE_TYPE.OKEX_API) {
    result = await getOkexAccountPosition(instruments);
  }
  return result;
};

let instruments: OkexInstrument[] = [];

const main = async () => {
  const positions = await read();

  if (instruments.length === 0) {
    instruments = await getOkexInstrument("SWAP");
  }

  const data: IPosition[] = [];

  for (const profile of PROFILES) {
    const newPositions: any[] = await getPosition(profile, instruments);
    data.push({ username: profile.username, data: newPositions });
    comparePosition(profile, positions, newPositions);
  }

  save(data);
};

// main();

alertPosition();

// testMessage("Chán thật");

// Schedule main() to run every 15 seconds
setInterval(() => {
  main();
}, 15 * 1000);

// Schedule main() to run every 90 minutes
setInterval(() => {
  alertPosition();
}, 180 * 60 * 1000);

/**
 * *1. Test open new position by remove
 *
 * *2. Test close position by add another position
 * * - close Long with profit > 0
 * * - close Long with profit < 0
 * * - close Short with profit > 0
 * * - close Short with profit < 0
 *
 * *3. Test dca position by different entry and different amount
 *
 * *4. Test close a part of position by the same entry and different amount
 * * - close Long with profit > 0
 * * - close Long with profit < 0
 * * - close Short with profit > 0
 * * - close Short with profit < 0
 *
 */
