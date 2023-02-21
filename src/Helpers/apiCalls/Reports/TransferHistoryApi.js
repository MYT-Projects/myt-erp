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

export const searchTransferHistory = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/get_transfer_report",
            {
                requester: getUser(),
                token: getToken(),
                branch_from: data.branch_from,
                branch_to: data.branch_to,
                item_id: data.item_id,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchTransferHistoryPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/get_transfer_report",
            {
                requester: getUser(),
                token: getToken2(),
                branch_from: data.branch_from,
                branch_to: data.branch_to,
                item_id: data.item_id,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getNegativeInventory = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/get_negative_inventory",
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

export const getNegativeInventoryPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/get_negative_inventory",
            {
                requester: getUser(),
                token: getToken2(),
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

