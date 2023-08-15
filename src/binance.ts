import crypto from "crypto";
import { API_SECRET, BASE_ENDPOINT, BINANCE_ENDPOINT } from "./constant/config";
import { binanceRequest, request } from "./utils/axios";
import { IAccountPositionDetail, IPositionDetail, IPrice } from "./db/types";

export const getMarkPrice = async (symbol: string): Promise<number> => {
  const data: IPrice = await binanceRequest.get(BINANCE_ENDPOINT.PRICE, {
    params: {
      symbol: symbol,
    },
  });
  return Number(data.markPrice);
};

export const getOtherPosition = async (
  uid: string
): Promise<IPositionDetail[]> => {
  const params = {
    encryptedUid: uid,
    tradeType: "PERPETUAL",
  };

  const { data } = await request.post(BASE_ENDPOINT.GET_POSITION, params);
  return data.otherPositionRetList;
};

export const getAccountPosition = async (): Promise<
  IAccountPositionDetail[]
> => {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;

  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(queryString)
    .digest("hex");

  const params = {
    timestamp,
    signature,
  };

  const data = await binanceRequest.get(BINANCE_ENDPOINT.ACCOUNT, {
    params,
  });

  const result: IAccountPositionDetail[] = [];

  (data as any).positions.forEach((position: IAccountPositionDetail) => {
    const positionAmt = parseFloat(position.positionAmt);
    if (positionAmt !== 0) {
      result.push(position);
    }
  });

  return result;
};

export const makeOrder = async (position: any): Promise<Boolean> => {
  const timestamp = Date.now();
  const side = Number(position.positionAmt) > 0 ? "SELL" : "BUY"; // Place a sell order to close a long position
  const positionSide = Number(position.positionAmt) > 0 ? "LONG" : "SHORT";
  const type = "MARKET"; // Use a market order to close the position
  const quantity = position.positionAmt.split("-").join("");

  const queryString = `symbol=${position.symbol}&positionSide=${positionSide}&side=${side}&type=${type}&quantity=${quantity}&timestamp=${timestamp}`;

  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(queryString)
    .digest("hex");

  const data = await binanceRequest.post(
    `${BINANCE_ENDPOINT.MAKE_ORDER}?${queryString}&signature=${signature}`,
    null
  );
  return data ? true : false;
};
