import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Apne backend ka URL dalein
});

// Auth Token Pass karne ke liye (Request Interceptor)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Token Expire hone par Handle karne ke liye (Response Interceptor)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agar Backend se 401 Unauthorized aaye (Token expire ho gaya ho)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Direct login page par bhej dega
    }
    return Promise.reject(error);
  }
);

export default API;