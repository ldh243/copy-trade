import { IPosition, IPositionDetail, IProfile } from "./db/types";
import cron from "node-cron";
import { PROFILES } from "./db/profile";
import {
  closePartOfPositionMsg,
  closePositionMsg,
  dcaPositionMsg,
  openPositionMsg,
} from "./utils/telegram";
import { read, save } from "./utils/db";
import { getOtherPosition } from "./binance";

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
      dcaPositionMsg(profile, newPosition, currentPositionBySymbol);
    }
  });

  //check close position
  currentPositions?.data.forEach((currentPosition: IPositionDetail) => {
    const newPositionBySymbol = newPositions.findIndex(
      (newPosition) => newPosition.symbol === currentPosition.symbol
    );
    if (newPositionBySymbol === -1) {
      closePositionMsg(profile, currentPosition);
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

// Schedule main() to run every 30 seconds
cron.schedule("*/30 * * * * *", () => {
  main();
});

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
