import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;

// 方便调用的方法
export const get = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await instance.get<T>(url, config);
  return response.data;
};

export const post = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await instance.post<T>(url, data, config);
  return response.data;
};

export const put = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await instance.put<T>(url, data, config);
  return response.data;
};

export const del = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await instance.delete<T>(url, config);
  return response.data;
};
