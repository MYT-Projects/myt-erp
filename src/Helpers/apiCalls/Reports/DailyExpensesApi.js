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

export const getExpenses = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "expenses/get_expense",
            {
                requester: getUser(),
                token: getToken(),
                expense_id: data.id,
                item_name: data.item_name,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllExpenses = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "expenses/get_all_expense",
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

export const searchExpenses = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "expenses/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
                by_branch: data.by_branch,
                branch_name: data.branch_name,
                expense_date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                expense_date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteExpenses = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "expenses/delete",
            {
                requester: getUser(),
                token: getToken(),
                expense_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};