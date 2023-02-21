import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getToken2,
    getUser,
    numberFormatInt
} from "../../Utils/Common";
import Moment from "moment";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

export const getWastage = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "wastages/get_wastage",
            {
                requester: getUser(),
                token: getToken(),
                wastage_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllWastage = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "wastages/get_all_wastage",
            {
                requester: getUser(),
                token: getToken(),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchWastage = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "wastages/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
                branch_name: data.branch_name,
                item_id: data.item_id,
                wastage_date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                wastage_date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteWastage = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "wastages/delete",
            {
                requester: getUser(),
                token: getToken(),
                wastage_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};