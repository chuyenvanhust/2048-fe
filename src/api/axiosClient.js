import axios from 'axios';

const axiosClient = axios.create({
  // Vite yêu cầu tiền tố VITE_ để nhận diện biến môi trường
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;