import axios from "axios";

export const post = async (url: string, data: any, headers: any = {}) => {
  return await axios.post(url, data, headers);
};

export const put = async (url: string, data: any, headers: any = {}) => {
  return await axios.put(url, data, headers);
};

export const get = async (url: string, headers: any = {}) => {
  return await axios.get(url, headers);
};

export const deletes = async (url: string, headers: any = {}) => {
  return await axios.delete(url, headers);
};
