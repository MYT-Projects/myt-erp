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

export const getCashCount = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "cash_counts/get_cash_count",
            {
                requester: getUser(),
                token: getToken(),
                cash_count_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllCashCount = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "cash_counts/get_all_cash_count",
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

export const searchCashCount = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "cash_counts/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
                branch_name: data.branch_name,
                count_date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                count_date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                group_cash_counts: data.group_cash_counts,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteCashCount = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "cash_counts/delete",
            {
                requester: getUser(),
                token: getToken(),
                cash_count_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getCashCountReport = async (branch_id, date) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "cash_counts/get_cash_count_reports",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: branch_id,
                date: date ? Moment(date).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};