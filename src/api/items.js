import {APP_URL} from "../config/config";

const itemsApiService = () => fetch(`${APP_URL}/api/items`).
    then((re) => re.json());

export {
    itemsApiService
};
