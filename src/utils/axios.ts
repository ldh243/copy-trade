/* eslint-disable no-restricted-syntax */
import axios, { AxiosError, AxiosResponse } from "axios";
import { API_KEY, BASE_API, BINANCE_API } from "../constant/config";

export const request = axios.create({
  baseURL: BASE_API,
});

export const binanceRequest = axios.create({
  baseURL: BINANCE_API,
  headers: {
    "X-MBX-APIKEY": API_KEY,
  },
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

request.interceptors.response.use(handleSuccess, handleError);
binanceRequest.interceptors.response.use(handleSuccess, handleError);
