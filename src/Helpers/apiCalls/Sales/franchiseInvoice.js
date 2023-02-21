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
            process.env.REACT_APP_LINK +
                "franchisee_sales/get_all_franchisee_sale",
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
            purchase_date: invoice.purchase_date,
            receive_date: invoice.received_date,
            forwarder_id: invoice.forwarder_id,
            waybill_no: invoice.waybill_no,
            invoice_no: invoice.invoice_no,
            dr_no: invoice.dr_no,
            freight_cost: invoice.freight_cost,
            discount: invoice.discount,
            remarks: invoice.remarks,
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
        };
        //console.log("payload");
        //console.log(payload);

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "receives/create",
            payload
        );

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
            purchase_date: invoice.purchase_date,
            receive_date: invoice.received_date,
            forwarder_id: invoice.forwarder_id,
            waybill_no: invoice.waybill_no,
            invoice_no: invoice.invoice_no,
            dr_no: invoice.dr_no,
            freight_cost: invoice.freight_cost,
            discount: invoice.discount,
            paid_amount: invoice.grand_total,
            remarks: invoice.remarks,
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
            process.env.REACT_APP_LINK + "franchisee_sales/delete",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_sale_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//DELETE SALES INVOICE PAYMENT
export const deleteInvoicePayment = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_payments/delete",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_sale_payment_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const filterInvoice = async (filterConfig) => {
    //console.log(filterConfig)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sales/search",
            {
                requester: getUser(),
                token: getToken(),

                franchisee_id: filterConfig.invoice_no || "",
                sales_date_from: filterConfig.date_from
                    ? formatYDM(filterConfig.date_from)
                    : "",
                sales_date_to: filterConfig.date_to
                    ? formatYDM(filterConfig.date_to)
                    : "",
                // sales_invoice_no: filterConfig.invoice_no || "",
                fs_status: filterConfig.invoice_status || "",
                franchisee: filterConfig.franchisee || "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};
