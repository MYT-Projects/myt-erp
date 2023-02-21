import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getUser,
} from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

//GET
export const getAllInvoices = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken(),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getInvoice = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/get_receive",
            {
                requester: getUser(),
                token: getToken(),
                receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getPaymentHistory = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/get_all_invoice_payments",
            {
                requester: getUser(),
                token: getToken(),
                receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createInvoice = async (invoice, items, po_id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            po_id: po_id,
            branch_id: invoice.branch_id,
            supplier_id: invoice.supplier_id,
            vendor_id: invoice.vendor_id,
            purchase_date: invoice.purchase_date,
            receive_date: invoice.received_date,
            forwarder_id: invoice.forwarder_id,
            waybill_no: invoice.waybill_no,
            invoice_no: invoice.invoice_no,
            dr_no: invoice.dr_no,
            freight_cost: invoice.freight_cost ? invoice.freight_cost : "0",
            discount: invoice.discount ? invoice.discount : "0",
            remarks: invoice.remarks,
            service_fee: invoice.service_fee,

            item_ids: items.map((item) => {
                return item.item_id;
            }),
            quantities: items.map((item) => {
                return item.qtyInput;
            }),
            units: items.map((item) => {
                return item.unit;
            }),
            prices: items.map((item) => {
                return item.price;
            }),
            po_item_ids: items.map((item) => {
                return item.po_item_id;
            }),
            // types: items.map((item) => {
            //     return item.type ? item.type : "";
            // }),
        };
        //console.log("payload");
        //console.log(payload);

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "receives/create",
            payload
        );

        //console.log(response);

        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateInvoice = async (invoice, items, id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            receive_id: id,
            po_id: invoice.po_id,
            branch_id: invoice.branch_id,
            supplier_id: invoice.supplier_id,
            vendor_id: invoice.vendor_id,
            purchase_date: invoice.purchase_date,
            receive_date: invoice.received_date,
            forwarder_id: invoice.forwarder_id,
            waybill_no: invoice.waybill_no,
            invoice_no: invoice.invoice_no,
            dr_no: invoice.dr_no,
            freight_cost: invoice.freight_cost,
            discount: invoice.discount,
            // paid_amount: invoice.grand_total,
            remarks: invoice.remarks,
            service_fee: invoice.service_fee,

            item_ids: items.map((item) => {
                return item.item_id;
                // return item.id;
                // return item.po_item_id;
            }),
            quantities: items.map((item) => {
                return item.qtyInput;
            }),
            units: items.map((item) => {
                return item.unit;
            }),
            prices: items.map((item) => {
                return item.price;
            }),
            po_item_ids: items.map((item) => {
                return item.po_item_id;
            }),
        };
        //console.log("payload");
        //console.log(payload);
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "receives/update",
            payload
        );

        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "receives/delete",
            {
                requester: getUser(),
                token: getToken(),
                receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const filterInvoice = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/search",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: filterConfig.supplier || "",
                vendor_id: filterConfig.vendor_id || "",
                payment_status: filterConfig.payment_status,
                receive_date_from: filterConfig.date_from
                    ? formatYDM(filterConfig.date_from)
                    : "",
                receive_date_to: filterConfig.date_to
                    ? formatYDM(filterConfig.date_to)
                    : "",
                invoice_no: filterConfig.invoice_no || "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const closeOverpaidBill = async (id, remarks) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/close_overpaid_receive",
            {
                requester: getUser(),
                token: getToken(),
                receive_id: id,
                remarks: remarks,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};