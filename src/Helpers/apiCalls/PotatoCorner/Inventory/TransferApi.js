import { getToken2 } from "../../../Utils/Common";
import { getToken, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllTransfersPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/get_all_transfer",
            {
                requester: getUser(),
                token: getToken2(),
                // status: status,
            },
            "potato"
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const getTransferPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/get_transfer",
            {
                requester: getUser(),
                token: getToken2(),
                transfer_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE transfer receive
export const getTransferReceivePotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfer_receives/get_transfer_receive",
            {
                requester: getUser(),
                token: getToken2(),
                transfer_receive_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const deleteTransferPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/delete",
            {
                requester: getUser(),
                token: getToken2(),
                transfer_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteTransferReceivePotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfer_receives/delete",
            {
                requester: getUser(),
                token: getToken2(),
                transfer_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// update transfer status
export const updateTransferStatusPotato = async (id, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/change_status",
            {
                requester: getUser(),
                token: getToken2(),
                transfer_id: id,
                new_status: status,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateTransferReceiveStatusPotato = async (id, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfer_receives/change_status",
            {
                requester: getUser(),
                token: getToken2(),
                transfer_receive_id: id,
                new_status: status,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// update transfer status
export const recordTransferActionPotato = async (data, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/record_status",
            {
                requester: getUser(),
                token: getToken2(),
                transfer_id: data.doc_no.split("_")[1],
                transfer_number: data.doc_no.split("_")[1],
                dispatcher: data.dispatcher,
                new_status: status,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const createTransferPotato = async (newTransfer, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            request_id: newTransfer.request_id,
            branch_from: newTransfer.branch_from,
            branch_to: newTransfer.branch_to,
            transfer_number: newTransfer.transfer_number,
            transfer_date: newTransfer.transfer_date,
            remarks: newTransfer.remarks,
            dispatcher: newTransfer.dispatcher,

            // receive_id dropsearch
            item_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            units: items.map((item) => {
                return item.units;
            }),

            quantities: items.map((item) => {
                return item.quantities;
            }),

            prices: items.map((item) => {
                return "0";
                // GI SET SA UG ZERO KAY WALA MAY GI RETURN NA PRICES SA API
                // return item.prices;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "transfers/create",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};

export const updateTransferPotato = async (newTransfer, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            transfer_id: newTransfer.transfer_id,
            branch_from: newTransfer.branch_from,
            branch_to: newTransfer.branch_to,
            transfer_number: newTransfer.transfer_number,
            transfer_date: newTransfer.transfer_date,
            remarks: newTransfer.remarks,
            dispatcher: newTransfer.dispatcher,
            status: newTransfer.status,
            // receive_id dropsearch
            item_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            units: items.map((item) => {
                return item.units;
            }),

            quantities: items.map((item) => {
                return item.quantities;
            }),

            prices: items.map((item) => {
                return "0";
                // return item.prices;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "transfers/update",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};


export const createTransferReceivePotato = async (newTransfer, receiveItems, items) => {
    var allItems = receiveItems.concat(items);

    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            transfer_id: newTransfer.transfer_id,
            branch_from: newTransfer.branch_from,
            branch_to: newTransfer.branch_to,
            transfer_number: newTransfer.transfer_number,
            transfer_receive_date: newTransfer.transfer_receive_date,
            received_by: newTransfer.received_by,
            remarks: newTransfer.remarks,

            // receive_id dropsearch
            item_ids: allItems.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            units: allItems.map((item) => {
                return item.units;
            }),

            quantities: allItems.map((item) => {
                return item.quantities;
            }),

            transfer_item_ids: allItems.map((item) => {
                return item.id;
            }),

            // prices: allItems.map((item) => {
            //     return "0";
            //     // GI SET SA UG ZERO KAY WALA MAY GI RETURN NA PRICES SA API
            //     // return item.prices;
            // }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "transfer_receives/create",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};

export const updateTransferReceivePotato = async (newTransfer, receiveItems, items) => {
    var allItems = receiveItems.concat(items);

    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            transfer_id: newTransfer.transfer_id,
            branch_from: newTransfer.branch_from,
            branch_to: newTransfer.branch_to,
            transfer_number: newTransfer.transfer_number,
            transfer_date: newTransfer.transfer_date,
            received_by: newTransfer.received_by,
            remarks: newTransfer.remarks,

            // receive_id dropsearch
            item_ids: allItems.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            units: allItems.map((item) => {
                return item.units;
            }),

            quantities: allItems.map((item) => {
                return item.quantities;
            }),

        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "transfer_receives/update",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};


//FILTER
export const searchByDatePotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/search",
            {
                requester: getUser(),
                token: getToken2(),
                start_date: data.date_from
                    ? Moment(data.date_date_from).format("YYYY-MM-DD")
                    : data.date_date_from,
                end_date: data.date_to
                    ? Moment(data.date_to).format("YYYY-MM-DD")
                    : data.date_to,
                branch_to: data.branch_to,
                // payment_mode: data.payment_mode,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//FILTER
export const searchByTransferPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/search",
            {
                requester: getUser(),
                token: getToken2(),
                // start_date: Moment(data.from).format("YYYY-MM-DD") ,
                // end_date: data.to? Moment(data.to).format("YYYY-MM-DD") : data.to,
                transfer_number: data,
                // payment_mode: data.payment_mode,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
