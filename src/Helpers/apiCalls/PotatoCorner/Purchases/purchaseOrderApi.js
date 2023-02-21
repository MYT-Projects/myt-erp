import { getToken, getToken2, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";

//GET
export const getAllPurchaseOrderPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "purchases/get_all_purchase",
            {
                requester: getUser(),
                token: getToken2(),
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
export const searchByDatePotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "purchases/search",
            {
                requester: getUser(),
                token: getToken2(),
                purchase_date_from: data.from,
                purchase_date_to: data.to,
                supplier_id: data.supplier_id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getItemsPotato = async (data) => {
    //console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_all_item",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: data.branchId,
                all: 1,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllItemsPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_all_item",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: id,
                all: 1,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllBranchesPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branches/get_all_branch",
            {
                requester: getUser(),
                token: getToken2(),
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getPurchaseOrderPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "purchases/get_purchase",
            {
                requester: getUser(),
                token: getToken2(),
                purchase_id: id,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const filterPurchaseOrderPotato = async (type) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "purchases/filter_purchase_status",
            {
                requester: getUser(),
                token: getToken2(),
                status: type,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createPurchaseOrderPotato = async (PO, items) => {
    //console.log(PO)
    //console.log(items)
    try {
        const response = postAPICall(
            process.env.REACT_APP_POTATO + "purchases/create",
            {
                requester: getUser(),
                token: getToken2(),
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
            },
            "potato"
        );
        return response;
    } catch (error) {
        return { error: error };
    }
};

export const updatePurchaseOrderPotato = async (PO, items) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "purchases/update",
            {
                requester: getUser(),
                token: getToken2(),
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
                    return item.item_id.split("|")[0];
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
            },
            "potato"
        );
        return response;
    } catch (error) {
        return { error: error };
    }
};

export const changeStatusPurchaseOrderPotato = async (id, status) => {
    //console.log(id)
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "purchases/record_action",
            {
                requester: getUser(),
                token: getToken2(),
                purchase_id: id,
                action: status,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deletePurchaseOrderPotato = async (id) => {
    var idno = id.split("-")[1];
    //console.log(idno)
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "purchases/delete",
            {
                requester: getUser(),
                token: getToken2(),
                purchase_id: idno,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const emailPurchaseOrderPotato = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "purchases/send_email_to_supplier",
            {
                requester: getUser(),
                token: getToken2(),
                purchase_id: id,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const receivePurchaseOrderPotato = async (PO) => {
    const userDetails = {
        requester: getUser(),
        token: getToken2(),
    };
    const payload = {
        ...userDetails,
        ...PO,
    };
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "receives/create",
            {
                ...payload,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const paymentModalPotato = async (
    purchase_id,
    payment,
    balance,
) => {
    console.log(payment)
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            purchase_id: purchase_id,
            amount: payment.amount ? payment.amount : balance,
            payment_type: payment.payment_type,
            payment_date: payment.payment_date,
            deposit_date: payment.deposit_date,
            remarks: payment.remarks,
            from_bank_id: payment.from_bank_id,
            to_bank_id: payment.to_bank_id,
            from_bank_name: payment.bank_name,
            to_bank_name: payment.to_bank_name,
            reference_no: payment.reference_number,
            transaction_number: payment.transaction_number,
            payment_description: payment.payment_description,
            to_account_no: payment.to_account_no,
            to_account_name: payment.to_account_name,
            transaction_fee: payment.transaction_fee,
            payee: payment.payee,
            particulars: payment.particulars,
            check_no: payment.check_no,
            check_date: payment.check_date,
            issued_date: payment.issued_date,
        };
        // console.log(payment);
        console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "purchases/add_payment",
            {
                ...payload,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};