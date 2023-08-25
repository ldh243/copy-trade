import { OKEX_ENDPOINT } from "./constant/config";
import { IPositionDetail, IProfile } from "./db/types";
import { okexRequest } from "./utils/axios";
import { formatSymbolOkex, uppercaseFirstLetter } from "./utils/string";

export const getOkexBalance = async (): Promise<number> => {
  const data = await okexRequest.get(OKEX_ENDPOINT.GET_BALANCE);

  const result: number = data?.data[0]?.details[0]?.cashBal || 0;

  return result;
};

export const getOkexAccountPosition = async (): Promise<IPositionDetail[]> => {
  const { data } = await okexRequest.get(OKEX_ENDPOINT.GET_POSITION);
  console.log(data);
  return genericPosition(data);
};

const getOkexInstrument = async (
  instId: string,
  instType: string
): Promise<number> => {
  const { data } = await okexRequest.get("/api/v5/public/instruments", {
    params: {
      instType,
      instId,
    },
  });
  return Number(data[0].ctVal);
};

const genericPosition = async (positions: any): Promise<IPositionDetail[]> => {
  const result: Promise<IPositionDetail>[] = positions.map(
    async (position: any) => {
      const rate = await getOkexInstrument(position.instId, position.instType);
      const amount = Number(position.availPos) * rate;
      return {
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
