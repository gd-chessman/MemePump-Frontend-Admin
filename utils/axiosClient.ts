import axios from 'axios';
import {toast} from "react-toastify";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const axiosClient = axios.create({
  baseURL: `${apiUrl}/admin`,
    withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Lỗi 401: Unauthorized');
      window.location.href = "/login";
    }else if(error.code === "ERR_NETWORK"){
      console.warn("Máy chủ đang gặp sự cố !");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;