import axiosConstructor from "axios";
import {clearAuth, clearStepStatus, getAccessToken, getRefreshToken, setAuth} from "./auth-service";
import { APP_URL } from "./config";
import { createBrowserHistory } from "history";
import cachios from "cachios"; // making sure at a single timeframe only a single refresh request is fired ttl=30s
import _ from "lodash";

const axios = axiosConstructor.create({
  timeout: 100000
});


/**
 * Request interceptors to add accessToken
 */
axios.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  });

/**
 * Response interceptors for refresh logic and login redirect
 */
axios.interceptors.response.use((response) => {
  return response;
}, error => {
  const originalRequest = error.config;

  if (error.response.status === 401 && originalRequest.url ===
    `${APP_URL}/authentication/refresh`) {
    createBrowserHistory().push("/login");
    clearAuth();
    clearStepStatus();
    window.location.reload();
    return Promise.reject(error);
  }

  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    return cachios.get(`${APP_URL}/authentication/refresh`,
      {
        headers: {
          "Authorization": `Bearer ${getRefreshToken()}`
        }
      })
      .then(res => {
        if (res.status === 201) {
          setAuth(res.data);
          axiosConstructor.defaults.headers.common["Authorization"] = "Bearer " + getAccessToken();
          return axios(originalRequest);
        }
      }).catch(error => {
        if (_.get(error, "response.status") === 401 && _.get(error, "config.url") === `${APP_URL}/authentication/refresh`) {
          createBrowserHistory().push("/login");
          clearAuth();
          clearStepStatus();
          window.location.reload();
          return Promise.reject(error);
        }
      });
  }
  return Promise.reject(error);
});

export default axios;
