import { getToken, getToken2, getUser, numberFormatInt } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";
//GET
export const getAllTransfers = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/get_all_transfer",
            {
                requester: getUser(),
                token: getToken(),
                // status: status,
            }
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const getTransfer = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/get_transfer",
            {
                requester: getUser(),
                token: getToken(),
                transfer_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


// GET SINGLE transfer receive
export const getTransferReceive = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfer_receives/get_transfer_receive",
            {
                requester: getUser(),
                token: getToken(),
                transfer_receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// SEARCH SINGLE transfer receive
export const searchTransferReceiveByTransferID = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfer_receives/search",
            {
                requester: getUser(),
                token: getToken(),
                transfer_receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const deleteTransfer = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/delete",
            {
                requester: getUser(),
                token: getToken(),
                transfer_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteTransferReceive = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfer_receives/delete",
            {
                requester: getUser(),
                token: getToken(),
                transfer_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// update transfer status
export const updateTransferStatus = async (id, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/change_status",
            {
                requester: getUser(),
                token: getToken(),
                transfer_id: id,
                new_status: status,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateTransferReceiveStatus = async (id, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfer_receives/change_status",
            {
                requester: getUser(),
                token: getToken(),
                transfer_receive_id: id,
                new_status: status,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// update transfer status
export const recordTransferAction = async (data, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/record_status",
            {
                requester: getUser(),
                token: getToken(),
                transfer_id: data.doc_no.split("-")[1],
                transfer_number: data.transfer_number,
                dispatcher: data.dispatcher,
                new_status: status,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const createTransfer = async (newTransfer, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
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

export const updateTransfer = async (newTransfer, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
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
            process.env.REACT_APP_LINK + "transfers/update",
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


export const createTransferReceive = async (newTransfer, receiveItems, items) => {
    var allItems = receiveItems.concat(items);
    console.log(newTransfer)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
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
                return numberFormatInt(item.quantities);
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
            process.env.REACT_APP_LINK + "transfer_receives/create",
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

export const updateTransferReceive = async (newTransfer, receiveItems, items) => {
    var allItems = receiveItems.concat(items);

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            transfer_id: newTransfer.transfer_id,
            transfer_receive_id: newTransfer.transfer_receive_id,
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
                return numberFormatInt(item.quantities);
            }),

            transfer_item_ids: allItems.map((item) => {
                return item.id;
            }),

        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "transfer_receives/update",
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

//FILTER
export const searchByDate = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/search",
            {
                requester: getUser(),
                token: getToken(),
                start_date: data.date_from
                    ? Moment(data.date_date_from).format("YYYY-MM-DD")
                    : data.date_date_from,
                end_date: data.date_to
                    ? Moment(data.date_to).format("YYYY-MM-DD")
                    : data.date_to,
                branch_to: data.branch_to,
                // payment_mode: data.payment_mode,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//FILTER
export const searchByTransfer = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/search",
            {
                requester: getUser(),
                token: getToken(),
                // start_date: Moment(data.from).format("YYYY-MM-DD") ,
                transfer_number: data,
                // end_date: data.to? Moment(data.to).format("YYYY-MM-DD") : data.to,
                // payment_mode: data.payment_mode,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchTransfersMango = async (data) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            status: data.status,
            branch_from: data.branch_from,
            branch_to: data.branch_to,
            transfer_status: data.transfer_status,
            transfer_number: data.transfer_number,
            transfer_date_from: data.transfer_date_from ? Moment(data.transfer_date_from).format("YYYY-MM-DD") : "",
            transfer_date_to: data.transfer_date_to ? Moment(data.transfer_date_to).format("YYYY-MM-DD") : "",
            branch_to: data.branch_to,
            limit_by: data.limit_by,
        };
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfers/search",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
export const searchTransfersPotato = async (data) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            status: data.status,
            branch_from: data.branch_from,
            branch_to: data.branch_to,
            transfer_status: data.transfer_status,
            transfer_number: data.transfer_number,
            transfer_date_from: data.transfer_date_from ? Moment(data.transfer_date_from).format("YYYY-MM-DD") : "",
            transfer_date_to: data.transfer_date_to ? Moment(data.transfer_date_to).format("YYYY-MM-DD") : "",
            branch_to: data.branch_to,
            limit_by: data.limit_by,
        };
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfers/search",
            payload,
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const searchTransferReceive = async (data) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            status: data.status,
            branch_from: data.branch_from,
            branch_to: data.branch_to,
            transfer_status: data.transfer_status,
            transfer_number: data.transfer_number,
            date_from: data.transfer_date_from,
            date_to: data.transfer_date_to,
            branch_to: data.branch_to,
            limit_by: data.limit_by,
        };
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "transfer_receives/search",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
export const searchTransferReceivePotato = async (data) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            status: data.status,
            branch_from: data.branch_from,
            branch_to: data.branch_to,
            transfer_status: data.transfer_status,
            transfer_number: data.transfer_number,
            date_from: data.transfer_date_from,
            date_to: data.transfer_date_to,
            branch_to: data.branch_to,
            limit_by: data.limit_by,
        };
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "transfer_receives/search",
            payload,
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
