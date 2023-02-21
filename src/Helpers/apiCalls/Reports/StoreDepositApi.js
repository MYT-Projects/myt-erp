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

export const getStoreDeposit = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "store_deposits/get",
            {
                requester: getUser(),
                token: getToken(),
                store_deposit_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchStoreDeposit = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "store_deposits/search",
            {
                requester: getUser(),
                token: getToken(),
                transaction_type: data.transaction_type,
                branch_id: data.branch_id,
                status: data.status,
                branch_name: data.branch_name,
                wide_search: data.branch_name,
                deposited_to: data.bank_id,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const updateStatusStoreDeposit = async (ids, status) => {
    console.log(ids, status)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "store_deposits/update_status",
            {
                requester: getUser(),
                token: getToken(),
                store_deposit_ids: ids.map((id) => {
                    return id.id;
                }),
                status: status,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteStoreDeposit = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "store_deposits/delete",
            {
                requester: getUser(),
                token: getToken(),
                store_deposit_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};