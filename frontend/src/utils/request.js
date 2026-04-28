import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'http://192.204.32.49:5001/api'  // 改成你的服务器IP
    : '/api',
  timeout: 10000
});

// ... 其余代码不变

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const message = error.response?.data?.message || '请求失败';
    console.error('API Error:', message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default request;