import { formatYDM, getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

//GET
export const getAllSuppliesInvoices = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/get_all_receive",
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

export const getSuppliesInvoice = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/get_receive",
            {
                requester: getUser(),
                token: getToken(),
                supplies_receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createSuppliesInvoice = async (invoice, items, po_id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/create",
            {
                requester: getUser(),
                token: getToken(),
                po_id: po_id,
                supplier_id: invoice.supplier_id,
                purchase_date: invoice.purchase_date,
                receive_date: invoice.received_date,
                purpose: invoice.purpose,
                forwarder_id: invoice.forwarder_id,
                waybill_no: invoice.waybill_no,
                invoice_no: invoice.invoice_no,
                dr_no: invoice.dr_no,
                freight_cost: invoice.freight_cost,
                discount: invoice.discount,
                paid_amount: invoice.grand_total,
                remarks: invoice.remarks,
                item_ids: items.map((item) => {
                    return item.ingredient_id;
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
                se_item_ids: items.map((item) => {
                    return item.po_item_id;
                }),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateSuppliesInvoice = async (invoice, items, id) => {
    //console.log(invoice, items, id);
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/update",
            {
                requester: getUser(),
                token: getToken(),
                supplies_receive_id: id,
                se_id: invoice.po_id,
                supplier_id: invoice.supplier_id,
                purchase_date: invoice.purchase_date,
                supplies_receive_date: invoice.received_date,
                purpose: invoice.purpose,
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
                    return item.qty;
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
            }
        );
        return { data: response };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteSuppliesInvoice = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/delete",
            {
                requester: getUser(),
                token: getToken(),
                supplies_receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const filterSEInvoice = async (filterConfig) => {
    try {
        console.log(filterConfig.supplier);
        var supplier = filterConfig.supplier.split("|")[0];
        var type = filterConfig.supplier.split("|")[1];
        var payload = {
            requester: getUser(),
            token: getToken(),
            supplier_id: type === "supplier" ? supplier : "",
            vendor_id: type === "vendor" ? supplier : "",
            bank_id: filterConfig.bank || "",
            bill_type: filterConfig.status || "",
            se_receive_date_from: filterConfig.date_from
                ? formatYDM(filterConfig.date_from)
                : "",
            se_receive_date_to: filterConfig.date_to
                ? formatYDM(filterConfig.date_to)
                : "",
            invoice_no: filterConfig.invoice_no || "",
        };
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/search",
            // process.env.REACT_APP_LINK + "supplies_receives/search",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};


export const filterSEInvoiceDashboard = async (filterConfig) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            bill_type: filterConfig.bill_type || "",
        };
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/search",
            // process.env.REACT_APP_LINK + "supplies_receives/search",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};