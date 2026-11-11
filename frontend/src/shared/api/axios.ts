import axios from "axios";
import { getAccessToken, removeAccessToken } from "../lib/tokenStorage";
import { API_BASE_URL, APP_STORE } from "../lib/platform";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // The server words subscription messages without «оплатите» for the Google Play build.
    if (APP_STORE) {
        config.headers["X-App-Store"] = APP_STORE;
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