import toast from "react-hot-toast";
import { getToken2 } from "../../../Utils/Common";
import {
    formatDate,
    getToken,
    getUser,
    toastStyle,
} from "../../../Utils/Common.js";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";
const user = getUser();
const token = getToken2();

export const getItemPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_item",
            {
                requester: user,
                token: token,
                item_id: id,
            }, "potato"
        );
        return response.data;
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllItemsPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_all_item",
            {
                requester: user,
                token: token,
                branch_id: id,
            }, "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};