import axios from "axios";
import { getAccessToken, removeAccessToken } from "../lib/tokenStorage";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            removeAccessToken();
        }

        return Promise.reject(error);
    }
);