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

export const getOrder = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "orders/get_order",
            {
                requester: getUser(),
                token: getToken(),
                order_id: data.id,
                transaction_type: data.type,
                added_on_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                added_on_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllOrder = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "orders/get_all_order",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchOrder = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "orders/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
                branch_name: data.branch_name,
                payment_type: data.mode,
                transaction_type: data.type,
                added_on_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                added_on_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};


export const searchOrderByBranch = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "orders/sales_per_branch",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
                branch_name: data.branch_name,
                transaction_type: data.type,
                added_on_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                added_on_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteOrder = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "orders/delete",
            {
                requester: getUser(),
                token: getToken(),
                order_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};