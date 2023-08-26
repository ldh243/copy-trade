import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

export const API_KEY = process.env.API_KEY as string;
export const API_SECRET = process.env.API_SECRET as string;

export const OKEX_API_KEY = process.env.OKEX_API_KEY as string;
export const OKEX_API_SECRET = process.env.OKEX_API_SECRET as string;
export const OKEX_PASSPHRASE = process.env.OKEX_PASSPHRASE as string;

export const BINANCE_API = "https://fapi.binance.com";

export const BASE_API = "https://www.binance.com/bapi/futures/v1/public";

export const BASE_ENDPOINT = {
  GET_POSITION: "/future/leaderboard/getOtherPosition",
  PROFILE_URL:
    "https://www.binance.com/en/futures-activity/leaderboard/user/um?encryptedUid=",
};

export const OKEX_API = "https://www.okex.com";

export const OKEX_ENDPOINT = {
  GET_BALANCE: "/api/v5/account/balance",
  GET_POSITION: "/api/v5/account/positions",
  GET_POSITION_HISTORY: "/api/v5/account/positions-history",
};

export const BINANCE_ENDPOINT = {
  PRICE: "/fapi/v1/premiumIndex",
  ACCOUNT: "/fapi/v2/account",
  MAKE_ORDER: "/fapi/v1/order",
};

export const POSITION_TYPE = {
  LONG: "Long",
  SHORT: "Short",
};

export const PROFILE_TYPE = {
  BINANCE_BOARD: 1,
  BINANCE_API: 2,
  OKEX_API: 3,
};

export const DB_PATH = `src/db/data.json`;

export const TELEGRAM_KEY = "6434359396:AAE71LMPXQbosw5Gl2oRGzYDNs7TEUmn1UU";
export const TELEGRAM_CHANNEL_ID = "-1001727681681"; //binance group
export const TELEGRAM_CHANNEL_ID_LADUY = "-1001616885476"; //laduy channel
// export const TELEGRAM_CHANNEL_ID_LADUY = "-1001726367480"; //laduy chat
// export const TELEGRAM_CHANNEL_ID_LADUY = "-1001858304466"; //group test trade
