import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getUser,
} from "../../Utils/Common";
import Moment from "moment"
import { getAPICall, postAPICall } from "../axiosMethodCalls";

//GET ALL - Returns all receivables in that branch - contract, sales, billings
export const getAllReceivables = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "transactions/get_all_receivables",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: id
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//GET ALL with date filter
export const getAllReceivablesDate = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "transactions/get_all_receivables",
            {
                requester: getUser(),
                token: getToken(),
                date_from: Moment(data.from).format("YYYY-MM-DD") ,
                end_date: data.to? Moment(data.to).format("YYYY-MM-DD") : data.to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//GET - returns all specific receivables in that branch --- if sales iya e click, mo fetch siya sa tanang sales
export const getReceivable = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transactions/get_all_specific_receivables_by_branch_id",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//SEARCH
export const searchReceivables = async (data) => {
    console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "transactions/get_all_receivables",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.id,
                date_from: data.from,
                date_to: data.to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchFranchisee = async (info) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisees/search",
            {
                requester: getUser(),
                token: getToken(),
                name: info,
                // franchised_on_from: info.franchised_on_from,
                // franchised_on_to: info.franchised_on_to

            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllPayments = async (data) => {
    console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "transactions/get_all_payments",
            {
                requester: getUser(),
                token: getToken(),
                is_done: data.is_done,
                branch_id: data.branch_id,
                franchisee_name: data.franchisee_name,
                type: data.type,
                deposited_to: data.deposited_to,
                payment_mode: data.payment_mode,
                date_from: data.date_from? Moment(data.date_from).format("YYYY-MM-DD") : data.date_from,
                date_to: data.date_to? Moment(data.date_to).format("YYYY-MM-DD") : data.date_to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const markAsDone = async (payments) => {

    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transactions/mark_as_done",
            {
                requester: getUser(),
                token: getToken(),
                // ids: ids,
                // types: types,

                ids: payments.map((payment) => {
                    return payment.id;
                }),
                types: payments.map((payment) => {
                    return payment.type;
                }),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};