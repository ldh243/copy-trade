import crypto from "crypto";
import axios from "axios";
import {
  API_KEY,
  API_SECRET,
  BASE_ENDPOINT,
  BINANCE_ENDPOINT,
} from "./constant/config";
import { binanceRequest, request } from "./utils/axios";
import { IPositionDetail, IPrice } from "./db/types";

const endpoint = "https://fapi.binance.com/fapi/v2/account";
const timestamp = Date.now();
const queryString = `timestamp=${timestamp}`;

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

export const binance = () => {
  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(queryString)
    .digest("hex");

  const headers = {
    "X-MBX-APIKEY": API_KEY,
  };

  const params = {
    timestamp,
    signature,
  };

  axios
    .get(endpoint, { headers, params })
    .then((response) => {
      const positions = response.data.positions;

      positions.forEach((position: any) => {
        const symbol = position.symbol;
        const positionAmt = parseFloat(position.positionAmt);
        const entryPrice = parseFloat(position.entryPrice);

        if (positionAmt !== 0) {
          console.log(
            `Symbol: ${symbol}, Position Amount: ${positionAmt}, Entry Price: ${entryPrice}`
          );
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
};
