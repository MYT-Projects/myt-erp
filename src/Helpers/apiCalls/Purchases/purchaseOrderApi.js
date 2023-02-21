import { getToken, getToken2, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllPurchaseOrder = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "purchases/get_all_purchase",
            {
                requester: getUser(),
                token: getToken(),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchPurchaseOrder = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "purchases/search",
            {
                requester: getUser(),
                token: getToken(),
                status: data.status,
                order_status: data.order_status,
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                purchase_date_to: data.purchase_date_to ? Moment(data.purchase_date_to).format("YYYY-MM-DD") : "",
                purchase_date_from: data.purchase_date_from ? Moment(data.purchase_date_from).format("YYYY-MM-DD") : "",
                type: data.type,
                limit_by: data.limit_by,
                anything: data.anything,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
export const searchPurchaseOrderPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "purchases/search",
            {
                requester: getUser(),
                token: getToken2(),
                status: data.status,
                order_status: data.order_status,
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                purchase_date_to: data.purchase_date_to ? Moment(data.purchase_date_to).format("YYYY-MM-DD") : "",
                purchase_date_from: data.purchase_date_from ? Moment(data.purchase_date_from).format("YYYY-MM-DD") : "",
                type: data.type,
                limit_by: data.limit_by,
                anything: data.anything,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchByDate = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "purchases/search",
            {
                requester: getUser(),
                token: getToken(),
                purchase_date_from: data.from,
                purchase_date_to: data.to,
                supplier_id: data.supplier_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getItems = async (data) => {
    //console.log(data);
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "items/get_all_item",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branchId,
                all: 1,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllItems = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "items/get_all_item",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: id,
                all: 1,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllBranches = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branches/get_all_branch",
            {
                requester: getUser(),
                token: getToken(),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getPurchaseOrder = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "purchases/get_purchase",
            {
                requester: getUser(),
                token: getToken(),
                purchase_id: id,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const filterPurchaseOrder = async (type) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "purchases/filter_purchase_status",
            {
                requester: getUser(),
                token: getToken(),
                status: type,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createPurchaseOrder = async (PO, items) => {
    //console.log("payload", items);
    try {
        const response = postAPICall(
            process.env.REACT_APP_LINK + "purchases/create",
            {
                requester: getUser(),
                token: getToken(),
                is_save: PO.is_save,
                branch_id: PO.branch_id,
                supplier_id: PO.supplier_id.split("-")[1],
                vendor_id: PO.vendor_id.split("-")[1],
                forwarder_id: PO.forwarder_id,
                status: PO.status,
                // purpose: PO.purpose,
                purchase_date: PO.purchase_date,
                delivery_date: PO.delivery_date,
                requisitioner: PO.requisitioner.value,
                delivery_address: PO.delivery_address,
                remarks: PO.remarks,
                total_purchases: PO.grand_total,
                grand_total: PO.grand_total,
                service_fee: PO.service_fee,
                discount: PO.discount,

                item_ids: items.map((item) => {
                    return item.item_id;
                }),
                quantities: items.map((item) => {
                    return item.qty;
                }),
                units: items.map((item) => {
                    return item.unit;
                }),
                prices: items.map((item) => {
                    return item.price;
                }),
                item_remarks: items.map((item) => {
                    return item.remarks;
                }),
            }
        );
        return response;
    } catch (error) {
        return { error: error.response };
    }
};

export const updatePurchaseOrder = async (PO, items) => {
    //console.log(PO);
    //console.log(items);
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "purchases/update",
            {
                requester: getUser(),
                token: getToken(),
                purchase_id: PO.id,
                is_save: PO.is_save,
                branch_id: PO.branch_id,
                supplier_id: PO.supplier_id.split("-")[1],
                vendor_id: PO.vendor_id.split("-")[1],
                forwarder_id: PO.forwarder_id,
                // purpose: PO.purpose,
                purchase_date: PO.purchase_date,
                delivery_date: PO.delivery_date,
                requisitioner: PO.requisitioner.value,
                delivery_address: PO.delivery_address,
                remarks: PO.remarks,
                status: PO.status,
                service_fee: PO.service_fee,
                discount: PO.discount,

                item_ids: items.map((item) => {
                    //console.log(item);
                    return item.item_id;
                }),
                quantities: items.map((item) => {
                    return item.qty;
                }),
                units: items.map((item) => {
                    return item.unit;
                }),
                prices: items.map((item) => {
                    return item.price;
                }),
                item_remarks: items.map((item) => {
                    return item.remarks;
                }),
            }
        );
        return response;
    } catch (error) {
        return { error: error };
    }
};

export const changeStatusPurchaseOrder = async (id, status) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "purchases/record_action",
            {
                requester: getUser(),
                token: getToken(),
                purchase_id: id,
                action: status,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deletePurchaseOrder = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "purchases/delete",
            {
                requester: getUser(),
                token: getToken(),
                purchase_id: id.split("-")[1],
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const emailPurchaseOrder = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "purchases/send_email_to_supplier",
            {
                requester: getUser(),
                token: getToken(),
                purchase_id: id,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const receivePurchaseOrder = async (PO) => {
    const userDetails = {
        requester: getUser(),
        token: getToken(),
    };
    const payload = {
        ...userDetails,
        ...PO,
    };
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "receives/create",
            {
                ...payload,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const paymentModal = async (
    purchase_id,
    payment,
    balance,
    payee
) => {
    console.log(payment)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            purchase_id: purchase_id,
            amount: payment.paid_amount ? payment.paid_amount : balance,
            payment_type: payment.payment_type,
            payment_date: payment.payment_date,
            deposit_date: payment.deposit_date,
            remarks: payment.remarks,
            from_bank_id: payment.from_bank_id,
            to_bank_id: payment.to_bank_id,
            to_bank_name: payment.to_bank_name,
            from_bank_name: payment.bank_name,
            reference_no: payment.reference_number,
            transaction_number: payment.transaction_number,
            payment_description: payment.payment_description,
            to_account_no: payment.to_account_no,
            to_account_name: payment.to_account_name,
            transaction_fee: payment.transaction_fee,
            payee: payment.payee ? payment.payee : payee,
            particulars: payment.particulars,
            check_no: payment.check_no,
            check_date: payment.check_date,
            issued_date: payment.issued_date,
        };
        //console.log(payment);
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "purchases/add_payment",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};