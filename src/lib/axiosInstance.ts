import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URI,
});

// Add an interceptor to inject the token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve the token
  console.log("the token fromfoented ", token)
  console.log(token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Set the token in headers
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default axiosInstance;

