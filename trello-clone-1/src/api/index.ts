import axios from "axios";

const baseURL = import.meta.env.VITE_APP_BASE_URL;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// add req and res interceptors as needed

export default api;
