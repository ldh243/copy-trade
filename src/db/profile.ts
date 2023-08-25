import {
  TELEGRAM_CHANNEL_ID,
  TELEGRAM_CHANNEL_ID_LADUY,
} from "../constant/config";
import { IProfile } from "./types";

export const PROFILES: IProfile[] = [
  {
    username: "Smartestmoneydoteth",
    uid: "1FB04E31362DEED9CAA1C7EF8A771B8A",
    channelId: TELEGRAM_CHANNEL_ID,
    type: 1,
  },
  {
    username: "mrwin68",
    uid: "2154D02AD930F6C6E65C507DD73CB3E7",
    channelId: TELEGRAM_CHANNEL_ID,
    type: 1,
  },
  {
    username: "NguyenDinhTamNA",
    uid: "538E78E33A3B0363FC37E393EB334103",
    channelId: TELEGRAM_CHANNEL_ID,
    type: 1,
  },
  {
    username: "#laduymauxanh",
    uid: "C5E7178CDBF2C187ABFA59FBEEC229AD",
    channelId: TELEGRAM_CHANNEL_ID_LADUY,
    type: 3,
  },
];

export const CLOSE_PROFILE: string[] = [
  "Smartestmoneydoteth",
  "mrwin68",
  "NguyenDinhTamNA",
  "#laduymauxanh",
];
