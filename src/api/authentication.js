import axios from "../config/axios";
import { setAuth } from "../config/auth-service";
import { APP_URL } from "../config/config";

export const login = payload => {
  return axios.post(`${APP_URL}/app/authentication`, payload).then(r => {
    setAuth(r.data);
    return r.data;
  });
};
