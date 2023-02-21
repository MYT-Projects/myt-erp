import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getToken2,
    getUser,
} from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllRequests = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "requests/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_from: data.branch_from,
                branch_to_name: data.branch_to_name,
                status: data.tab !== "all" ? data.tab : "",
                request_date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : data.date_from,
                request_date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : data.date_to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllRequestsPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "requests/search",
            {
                requester: getUser(),
                token: getToken2(),
                branch_from: data.branch_from,
                branch_to_name: data.branch_to_name,
                status: data.tab,
                request_date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : data.date_from,
                request_date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : data.date_to,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getRequest = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "requests/get_request",
            {
                requester: getUser(),
                token: getToken(),
                request_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getRequestPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "requests/get_request",
            {
                requester: getUser(),
                token: getToken2(),
                request_id: id
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const changeRequestStatus = async (id, status, remarks) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "requests/change_status",
            {
                requester: getUser(),
                token: getToken(),
                request_id: id,
                new_status: status,
                rejection_remarks: remarks,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const changeRequestStatusPotato = async (id, status, remarks) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "requests/change_status",
            {
                requester: getUser(),
                token: getToken2(),
                request_id: id,
                new_status: status,
                rejection_remarks: remarks,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteRequest = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "requests/delete",
            {
                requester: getUser(),
                token: getToken(),
                request_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteRequestPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "requests/delete",
            {
                requester: getUser(),
                token: getToken2(),
                request_id: id,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const createTransferRequest = async (newTransfer, items) => {
    console.log(newTransfer)
    console.log(items)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            branch_from: newTransfer.branch_from,
            branch_to: newTransfer.branch_to,
            transfer_number: newTransfer.transfer_number,
            transfer_date: Moment().format("YYYY-MM-DD"),
            remarks: newTransfer.remarks,
            dispatcher: "",

            // receive_id dropsearch
            item_ids: items.map((item) => {
                return item.item_id;
            }),
            // amount input field
            units: items.map((item) => {
                return item.unit;
            }),

            quantities: items.map((item) => {
                return item.qty;
            }),

            prices: items.map((item) => {
                return item.price;
                // GI SET SA UG ZERO KAY WALA MAY GI RETURN NA PRICES SA API
                // return item.prices;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "transfers/create",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};


export const createTransferRequestPotato = async (newTransfer, items) => {
    console.log(newTransfer)
    console.log(items)
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            branch_from: newTransfer.branch_from,
            branch_to: newTransfer.branch_to,
            transfer_number: newTransfer.transfer_number,
            transfer_date: Moment().format("YYYY-MM-DD"),
            remarks: newTransfer.remarks,
            dispatcher: "",

            // receive_id dropsearch
            item_ids: items.map((item) => {
                return item.item_id;
            }),
            // amount input field
            units: items.map((item) => {
                return item.unit;
            }),

            quantities: items.map((item) => {
                return item.qty;
            }),

            prices: items.map((item) => {
                return item.price;
                // GI SET SA UG ZERO KAY WALA MAY GI RETURN NA PRICES SA API
                // return item.prices;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_POTATO_LINK + "transfers/create",
            payload, "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};
