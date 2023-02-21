import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import { getAllItems } from "../itemsApi";

export const getAllSEPO = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "Supplies_expenses/get_all_supplies_expense",
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

export const getSingleSEPurchaseOrder = async (po_id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "Supplies_expenses/get_supplies_expense",
            {
                requester: getUser(),
                token: getToken(),
                supplies_expense_id: po_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getSingleSEPurchaseInvoice = async (pi_id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/get_receive",
            {
                requester: getUser(),
                token: getToken(),
                supplies_receive_id: pi_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createSEPurchaseInvoice = async (
    invoice,
    items,
    additionalItems,
    se_id
) => {
    try {
        var allItems = items.concat(additionalItems);
        var payload = {
            requester: getUser(),
            token: getToken(),
            se_id: se_id,
            supplier_id: invoice.supplier_id,
            vendor_id: invoice.vendor_id,
            branch_id: invoice.branch_id,
            purchase_date: invoice.purchase_date,
            supplies_receive_date: invoice.received_date,
            forwarder_id: invoice.forwarder_id,
            waybill_no: invoice.waybill_no,
            invoice_no: invoice.invoice_no,
            dr_no: invoice.dr_no,
            type: invoice.type,
            freight_cost: invoice.freight_cost,
            discount: invoice.discount,
            // paid_amount: invoice.paid_amount,  //gi comment para dili ma close ang invoice
            remarks: invoice.remarks,
            names: allItems.map((item) => {
                return item.name;
            }),
            quantities: allItems.map((item) => {
                return item.qtyInput;
            }),
            units: allItems.map((item) => {
                return item.unit;
            }),
            prices: allItems.map((item) => {
                return item.price;
            }),
            se_item_ids: allItems.map((item) => {
                return item.id;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/create",
            payload
        );

        //console.log("=== FROM API ===");
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateSEPurchaseInvoice = async (invoice, allItems) => {
    console.log(allItems)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            se_id: invoice.se_id,
            supplies_receive_id: invoice.id,
            supplier_id: invoice.supplier_id,
            vendor_id: invoice.vendor_id,
            branch_id: invoice.branch_id,
            purchase_date: invoice.purchase_date,
            supplies_receive_date: invoice.received_date,
            forwarder_id: invoice.forwarder_id,
            waybill_no: invoice.waybill_no,
            invoice_no: invoice.invoice_no,
            dr_no: invoice.dr_no,
            type: invoice.type,
            freight_cost: invoice.freight_cost,
            discount: invoice.discount,
            // paid_amount: invoice.grand_total, //gi comment para dili ma close ang invoice ig edit
            remarks: invoice.remarks,
            names: allItems.map((item) => {
                return item.name;
            }),
            quantities: allItems.map((item) => {
                return item.qtyInput;
            }),
            units: allItems.map((item) => {
                return item.unit;
            }),
            prices: allItems.map((item) => {
                return item.price;
            }),
            se_item_ids: allItems.map((item) => {
                return item.se_item_id;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/update",
            payload
        );

        //console.log("=== FROM UPDATE SE Invoice API ===");
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getSEPaymentHistory = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "supplies_receives/get_all_invoice_payments",
            {
                requester: getUser(),
                token: getToken(),
                se_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
