import { OKEX_ENDPOINT } from "./constant/config";
import {
  IPositionDetail,
  IPositionDetailHistory,
  OkexInstrument,
} from "./db/types";
import { okexRequest } from "./utils/axios";
import { formatSymbolOkex, uppercaseFirstLetter } from "./utils/string";

export const getOkexBalance = async (): Promise<number> => {
  const data = await okexRequest.get(OKEX_ENDPOINT.GET_BALANCE);

  const result: number = data?.data[0]?.details[0]?.cashBal || 0;

  return result;
};

export const getOkexAccountPosition = async (): Promise<IPositionDetail[]> => {
  const { data } = await okexRequest.get(OKEX_ENDPOINT.GET_POSITION);
  const instruments = await getOkexInstrument("SWAP");
  return genericPosition(data, instruments);
};

export const getOkexAccountPositionHistory = async (): Promise<
  IPositionDetailHistory[]
> => {
  const { data } = await okexRequest.get(OKEX_ENDPOINT.GET_POSITION_HISTORY);
  return data;
};

const getOkexInstrument = async (
  instType: string
): Promise<OkexInstrument[]> => {
  const { data } = await okexRequest.get("/api/v5/public/instruments", {
    params: {
      instType,
    },
  });
  return data;
};

const genericPosition = async (
  positions: any,
  instruments: OkexInstrument[]
): Promise<IPositionDetail[]> => {
  const result: Promise<IPositionDetail>[] = positions.map(
    async (position: any) => {
      const instrument = instruments.find(
        (instrument: OkexInstrument) => position.instId === instrument.instId
      );

      const rate = Number(instrument?.ctVal || 1);

      const amount = Number(position.availPos) * Number(rate);
      return {
        id: position.posId,
        type: uppercaseFirstLetter(position.posSide),
        symbol: formatSymbolOkex(position.instId),
        entryPrice: Number(position.avgPx),
        markPrice: Number(position.markPx),
        pnl: Number(position.upl),
        amount: amount * (position.posSide === "long" ? 1 : -1),
        leverage: Number(position.lever),
      };
    }
  );

  return await Promise.all(result);
};
