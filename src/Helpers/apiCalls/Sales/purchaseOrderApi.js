import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

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
export const searchByDate = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "purchases/search",
            {
                requester: getUser(),
                token: getToken(),
                purchase_date_from:data.from,
                purchase_date_to:data.to,
                supplier_id:data.supplier_id
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getItems = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "items/get_all_item",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
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
    try {
        const response = postAPICall(
            process.env.REACT_APP_LINK + "purchases/create",
            {
                requester: getUser(),
                token: getToken(),
                is_save: PO.is_save,
                branch_id: PO.branch_id,
                supplier_id: PO.supplier_id,
                forwarder_id: PO.forwarder_id,
                status: PO.status,
                // purpose: PO.purpose,
                purchase_date: PO.purchase_date,
                delivery_date: PO.delivery_date,
                requisitioner: PO.requisitioner,
                delivery_address: PO.delivery_address,
                remarks: PO.remarks,
                total_purchases: PO.grand_total,
                grand_total: PO.grand_total,
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
            }
        );
        return response;
        
    } catch (error) {
        return { error: error.response };
    }
};

export const updatePurchaseOrder = async (PO, items) => {
    try {
        const response = postAPICall(
            process.env.REACT_APP_LINK + "purchases/update",
            {
                requester: getUser(),
                token: getToken(),
                purchase_id: PO.id,
                is_save: PO.is_save,
                branch_id: PO.branch_id,
                supplier_id: PO.supplier_id,
                forwarder_id: PO.forwarder_id,
                // purpose: PO.purpose,
                purchase_date: PO.purchase_date,
                delivery_date: PO.delivery_date,
                requisitioner: PO.requisitioner,
                delivery_address: PO.delivery_address,
                remarks: PO.remarks,
                status: PO.status,
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
            }
        );
        return response;
    } catch (error) {
        return { error: error.response };
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
                purchase_id: id,
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
    }
    const payload = {
        ...userDetails,
        ...PO
    }
    try {
        const response = await postAPICall(process.env.REACT_APP_LINK + "receives/create", {
           ...payload  
        })
        return { response: response.data }
    } catch (error) {
        return { error: error.response };
    }
};
