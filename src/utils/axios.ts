/* eslint-disable no-restricted-syntax */
import axios, { AxiosError, AxiosResponse } from "axios";
import { BASE_URL } from "../constant/config";

export const request = axios.create({
  baseURL: BASE_URL,
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
