import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

export const API_KEY = process.env.API_KEY as string;
export const API_SECRET = process.env.API_SECRET as string;

export const BINANCE_API = "https://fapi.binance.com";

export const BASE_API = "https://www.binance.com/bapi/futures/v1/public";

export const BASE_ENDPOINT = {
  GET_POSITION: "/future/leaderboard/getOtherPosition",
  PROFILE_URL:
    "https://www.binance.com/en/futures-activity/leaderboard/user/um?encryptedUid=",
};

export const BINANCE_ENDPOINT = {
  PRICE: "/fapi/v1/premiumIndex",
};

export const DB_PATH = `src/db/data.json`;

export const TELEGRAM_KEY = "6434359396:AAE71LMPXQbosw5Gl2oRGzYDNs7TEUmn1UU";
export const TELEGRAM_CHANNEL_ID = "-909658935"; //main group
// export const TELEGRAM_CHANNEL_ID = "-798774213";
