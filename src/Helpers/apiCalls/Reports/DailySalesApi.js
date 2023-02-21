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

export const getDailySale = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "daily_sales/get_daily_sale",
            {
                requester: getUser(),
                token: getToken(),
                daily_sale_id: data.id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getDailyInventory = async (data) => {
    // console.log(data.branch_id)
    const branch_id = data.branch_id ? data.branch_id : '';
    const date_from = data.date_from ? data.date_from : '';
    const date_to = data.date_to ? data.date_to : '';
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventory_reports/get_daily_inventories",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: branch_id,
                date: date_from
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getInventorySales = async (data) => {
    const branch_id = data.branch_id ? data.branch_id : '';
    const date_from = data.date_from ? data.date_from : '';
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "daily_sales/get_inventory_sales",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: branch_id,
                date: date_from
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchDailySales = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "daily_sales/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
                inventory_variance_discrepancy: data.inventory_variance_discrepancy,
                cash_variance_discrepancy: data.cash_variance_discrepancy,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
                date: data.date ? Moment(data.date).format("YYYY-MM-DD") : "",
                
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
}
