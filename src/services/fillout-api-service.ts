import axios, { AxiosInstance } from 'axios';

export default class FilloutApiService {
  public static axiosInstance: AxiosInstance = axios.create({
    baseURL: 'https://api.fillout.com',
    headers: {
      Authorization: `Bearer ${process.env.FILL_OUT_API_KEY}`
    }
  });
}
