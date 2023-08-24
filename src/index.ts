import { IPosition, IPositionDetail, IProfile } from "./db/types";
import cron from "node-cron";
import { PROFILES } from "./db/profile";
import {
  alertPositionByProfile,
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
  currentPositions?.data.forEach((currentPosition: IPositionDetail) => {
    const newPositionBySymbol = newPositions.findIndex(
      (newPosition) =>
        newPosition.symbol === currentPosition.symbol &&
        newPosition.type === currentPosition.type
    );
    if (newPositionBySymbol === -1) {
      closePositionMsg(profile, currentPosition);
    }
  });
};

const alertPosition = async () => {
  const profile = PROFILES.find((el) => el.username.includes("laduy"));
  const positions = await read();
  if (profile) {
    alertPositionByProfile(positions, profile);
  }
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

alertPosition();

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
