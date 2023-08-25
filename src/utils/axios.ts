/* eslint-disable no-restricted-syntax */
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  API_KEY,
  BASE_API,
  BINANCE_API,
  OKEX_API,
  OKEX_API_KEY,
  OKEX_API_SECRET,
  OKEX_PASSPHRASE,
} from "../constant/config";
import moment from "moment";
import crypto from "crypto";

export const request = axios.create({
  baseURL: BASE_API,
});

export const binanceRequest = axios.create({
  baseURL: BINANCE_API,
  headers: {
    "X-MBX-APIKEY": API_KEY,
  },
});

export const okexRequest = axios.create({
  baseURL: OKEX_API,
});

const handleSuccess = (res: AxiosResponse) => {
  // const statusCode = res.data?.code;

  // if (statusCode !== 0 && statusCode !== -2) {
  //   return Promise.reject(res.data);
  // }

  if (res.request) return res.data;
};

const handleError = async (err: AxiosError) => {
  const data = err?.response?.data;
  console.log(data);
};

okexRequest.interceptors.request.use(
  async (config: any) => {
    const timestamp = moment().toISOString();
    const method = config.method.toUpperCase();
    let message = timestamp + method + config.url;

    const signature = crypto
      .createHmac("sha256", OKEX_API_SECRET)
      .update(message)
      .digest("base64");

    config = {
      ...config,
      headers: {
        ...config.headers,
        "OK-ACCESS-KEY": OKEX_API_KEY,
        "OK-ACCESS-PASSPHRASE": OKEX_PASSPHRASE,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
      },
    };
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

request.interceptors.response.use(handleSuccess, handleError);
binanceRequest.interceptors.response.use(handleSuccess, handleError);
okexRequest.interceptors.response.use(handleSuccess, handleError);
