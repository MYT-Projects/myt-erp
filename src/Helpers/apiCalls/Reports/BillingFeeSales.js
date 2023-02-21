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

export const getAllSales = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "reports/franchise_sales",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_name: data.franchisee_name,
                branch_id: data.branch_id,
                type: data.type,
                payment_status: data.payment_status,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllFranchiseeSalesReport = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "reports/franchise_sales",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_name: data.franchisee_name,
                branch_id: data.branch_id,
                type: data.type,
                payment_status: data.payment_status,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllSalesByItem = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "reports/get_franchisee_sale_item_report",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_name: data.franchisee_name,
                item_id: data.item_id,
                sales_date_from: data.sales_date_from ? Moment(data.sales_date_from).format("YYYY-MM-DD") : "",
                sales_date_to: data.sales_date_to ? Moment(data.sales_date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllPurchasedItemsSummary = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "reports/get_summary_of_purchased_items_from_suppliers",
            {
                requester: getUser(),
                token: getToken(),
                item_id: data.item_id,
                item_name: data.item_name,
                purchase_date_from: data.purchase_date_from ? Moment(data.purchase_date_from).format("YYYY-MM-DD") : "",
                purchase_date_to: data.purchase_date_to ? Moment(data.purchase_date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllPurchasedItemsSummaryPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "reports/get_summary_of_purchased_items_from_suppliers",
            {
                requester: getUser(),
                token: getToken2(),
                item_id: data.item_id,
                item_name: data.item_name,
                purchase_date_from: data.purchase_date_from ? Moment(data.purchase_date_from).format("YYYY-MM-DD") : "",
                purchase_date_to: data.purchase_date_to ? Moment(data.purchase_date_to).format("YYYY-MM-DD") : "",
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};