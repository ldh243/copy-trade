import { Telegraf } from "telegraf";
import { TELEGRAM_CHANNEL_ID, TELEGRAM_KEY } from "../constant/config";

export const messageTelegram = (content: string) => {
  const bot = new Telegraf(TELEGRAM_KEY);
  console.log("==========================================================");
  console.log(content);
  bot.telegram.sendMessage(TELEGRAM_CHANNEL_ID, content, {
    parse_mode: "Markdown",
  });
};
