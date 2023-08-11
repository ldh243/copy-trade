import { DB_PATH } from "../constant/config";
import { IPosition } from "../db/types";
import fs from "fs";

export const read = async (): Promise<IPosition[]> => {
  const data = await fs.promises.readFile(DB_PATH, "utf8");
  const result: IPosition[] = JSON.parse(data);
  return result;
};

export const save = async (data: IPosition[]) => {
  try {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
};
