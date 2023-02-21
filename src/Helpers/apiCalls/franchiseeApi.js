import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getUser,
} from "../Utils/Common";
import { getAPICall, postAPICall } from "./axiosMethodCalls";
import Moment from "moment"

//GET
export const getAllFranchisee = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisees/get_all_franchisee",
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

export const recordStatusInvoice = async (id, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sales/record_status_change",
            {
                requester: getUser(),
                token: getToken(),
                status: status,
                franchisee_sale_id: id
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchFranchiseeApi = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisees/search",
            {
                requester: getUser(),
                token: getToken(),
                name: filterConfig.franchise,
                payment_status: filterConfig.payment_status,
                franchised_on_from: filterConfig.franchised_on_from,
                franchised_on_to: filterConfig.franchised_on_to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchFranchiseeSales = async (filterConfig) => {
    console.log(filterConfig)
    const date = new Date();
    date.setDate(date.getDate() - 7);
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sales/search",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_id: filterConfig.franchisee_id,
                buyer_branch_id: filterConfig.branch_id,
                franchisee_name: filterConfig.franchisee_name,
                anything: filterConfig.anything,
                franchisee_sale_id: filterConfig.invoice_no,
                fs_status: filterConfig.fs_status,
                payment_status: filterConfig.payment_status,
                order_request_date_from: filterConfig.date_from? Moment(filterConfig.date_from).format("YYYY-MM-DD") : "",
                order_request_date_to: filterConfig.date_to? Moment(filterConfig.date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getSingleFranchisee = async (franchisee_id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisees/get_franchisee",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_id: franchisee_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getSingleSalesInvoice = async (franchisee_sale_id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sales/get_franchisee_sale",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_sale_id: franchisee_sale_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const createSalesInvoice = async (orderItems, additionalItems, invoice) => {
    console.log(orderItems)
    console.log(additionalItems)
    console.log(invoice)

    var allItems = orderItems.concat(additionalItems);
    console.log(allItems)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),

            franchisee_id: invoice.franchisee_id,
            sales_date: invoice.sales_date,
            delivery_date: invoice.delivery_date,
            order_request_date: invoice.order_request_date,
            seller_branch_id: invoice.seller_branch_id,
            buyer_branch_id: invoice.buyer_branch_id,
            // sales_invoice_no: invoice.sales_invoice_no,
            franchise_order_no: invoice.franchise_order_no,
            transfer_slip_no: invoice.transfer_slip_no,
            address: invoice.address,
            remarks: invoice.remarks,
            sales_staff: invoice.sales_staff,
            ship_via: invoice.ship_via,
            service_fee: invoice.service_fee,
            delivery_fee: invoice.delivery_fee,
            grand_total: invoice.grand_total,

            dr_no: invoice.dr_no,
            charge_invoice_no: invoice.charge_invoice_no,
            collection_invoice_no: invoice.collection_invoice_no,
            fs_status: invoice.fs_status,

            //PAYMENT
            payment_type: invoice.payment_type,
            payment_date: invoice.payment_date,
            deposit_date: invoice.deposit_date,
            payment_remarks: invoice.payment_remarks,
            from_bank_name: invoice.bank_name,
            from_bank_id: invoice.from_bank_id,
            to_bank_id: invoice.to_bank_id,
            cheque_number: invoice.cheque_number,
            cheque_date: invoice.cheque_date,
            reference_number: invoice.reference_number,
            transaction_number: invoice.transaction_number,
            payment_description: invoice.payment_description,
            term_day: invoice.term_day,
            delivery_address: invoice.address,
            grand_total: invoice.grand_total,
            paid_amount: invoice.paid_amount,
            subtotal: invoice.subtotal,
            service_fee: invoice.service_fee,
            delivery_fee: invoice.delivery_fee,
            withholding_tax: invoice.withholding_tax,
            invoice_no: invoice.invoice_no,

            item_ids: allItems.map((item) => {
                return item.item_id.value;
            }),
            item_names: allItems.map((item) => {
                return item.name;
            }),
            quantities: allItems.map((item) => {
                return item.qty;
            }),
            units: allItems.map((item) => {
                return item.unit;
            }),
            prices: allItems.map((item) => {
                return item.price;
            }),
            discounts: allItems.map((item) => {
                return item.unit_discount;
            }),
        };
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sales/create",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateSalesInvoice = async (id, orderItems, additionalItems, invoice) => {
    var allItems = orderItems.concat(additionalItems);
    console.log(id)
    console.log(allItems)
    console.log(orderItems)
    console.log(additionalItems)
    console.log(invoice)

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),

            franchisee_sale_id: id,
            franchisee_id: invoice.franchisee_id,
            sales_date: invoice.sales_date,
            delivery_date: invoice.delivery_date,
            order_request_date: invoice.order_request_date,
            seller_branch_id: invoice.seller_branch_id,
            buyer_branch_id: invoice.buyer_branch_id,
            sales_invoice_no: invoice.sales_invoice_no,
            franchise_order_no: invoice.franchise_order_no,
            transfer_slip_no: invoice.transfer_slip_no,
            // dr_no: invoice.dr_no,
            // charge_invoice_no: invoice.charge_invoice_no,
            // collection_invoice_no: invoice.collection_invoice_no,
            address: invoice.address,
            remarks: invoice.remarks,
            sales_staff: invoice.sales_staff,
            ship_via: invoice.ship_via,
            service_fee: invoice.service_fee,
            delivery_fee: invoice.delivery_fee,
            // fs_status: invoice.status,

            // //PAYMENT
            payment_type: invoice.payment_type,
            payment_date: invoice.payment_date,
            deposit_date: invoice.deposit_date,
            payment_remarks: invoice.payment_remarks,
            from_bank_name: invoice.bank_name,
            from_bank_id: invoice.from_bank_id,
            to_bank_id: invoice.to_bank_id,
            cheque_number: invoice.cheque_number,
            cheque_date: invoice.cheque_date,
            reference_number: invoice.reference_number,
            transaction_number: invoice.transaction_number,
            payment_description: invoice.payment_description,
            term_day: invoice.term_day,
            delivery_address: invoice.address,
            grand_total: invoice.grand_total,
            paid_amount: invoice.paid_amount,
            subtotal: invoice.subtotal,
            service_fee: invoice.service_fee,
            delivery_fee: invoice.delivery_fee,
            withholding_tax: invoice.withholding_tax,
            invoice_no: invoice.invoice_no,

            item_ids: allItems.map((item) => {
                return item.item_id.value;
            }),
            item_names: allItems.map((item) => {
                return item.name? item.name : null;
            }),
            quantities: allItems.map((item) => {
                return item.qty;
            }),
            units: allItems.map((item) => {
                return item.unit;
            }),
            prices: allItems.map((item) => {
                return item.price;
            }),
            discounts: allItems.map((item) => {
                return 0;
                // return item.unit_discount;
            }),
        };
        console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sales/update",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CALL THIS API WHEN PAYING UPON SUBMITTING INVOICE
export const paySalesInvoice = async (
    franchisee_sale_id,
    franchisee_id,
    payment,
    address
) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            franchisee_id: franchisee_id,
            franchisee_sale_id: franchisee_sale_id,
            payment_type: payment.payment_type,
            payment_date: payment.payment_date,
            deposit_date: payment.deposit_date,
            remarks: payment.remarks,
            from_bank_name: payment.bank_name,
            from_bank_id: payment.from_bank_id,
            to_bank_id: payment.to_bank_id,
            cheque_number: payment.cheque_number,
            cheque_date: payment.cheque_date,
            reference_number: payment.reference_number,
            transaction_number: payment.transaction_number,
            payment_description: payment.payment_description,
            term_day: payment.term_day,
            delivery_address: address,
            grand_total: payment.grand_total,
            paid_amount: payment.paid_amount,
            subtotal: payment.subtotal,
            service_fee: payment.service_fee,
            delivery_fee: payment.delivery_fee,
            withholding_tax: payment.withholding_tax,
            invoice_no: payment.invoice_no,
        };
        //console.log(payment);
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_payments/create",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const paySalesInvoiceModal = async (
    franchisee_sale_id,
    franchisee_id,
    payment,
    balance,
    // invoice
) => {
    console.log(payment)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            franchisee_id: franchisee_id,
            franchisee_sale_id: franchisee_sale_id,
            payment_type: payment.payment_type,
            payment_date: payment.payment_date,
            deposit_date: payment.deposit_date,
            from_bank_id: payment.from_bank_id,
            to_bank_id: payment.to_bank_id,
            remarks: payment.remarks,
            from_bank_name: payment.bank_name,
            deposited_to: payment.deposited_to,
            cheque_number: payment.cheque_number,
            cheque_date: payment.cheque_date,
            reference_number: payment.reference_number,
            transaction_number: payment.transaction_number,
            payment_description: payment.payment_description,
            term_day: payment.term_days,
            delivery_address: payment.delivery_address,
            grand_total: payment.grand_total,
            paid_amount: payment.paid_amount ? payment.paid_amount : balance,
            subtotal: payment.subtotal,
            service_fee: payment.service_fee,
            delivery_fee: payment.delivery_fee,
            withholding_tax: payment.withholding_tax,
            invoice_no: payment.invoice_no,
        };
        //console.log(payment);
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_payments/create",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const updatePaymentSalesInvoice = async (
    franchisee_sale_id,
    franchisee_id,
    payment
) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            franchisee_sale_payment_id: payment.id,
            franchisee_id: franchisee_id,
            franchisee_sale_id: franchisee_sale_id,
            payment_type: payment.payment_type,
            payment_date: payment.payment_date,
            deposit_date: payment.deposit_date,
            remarks: payment.remarks,
            from_bank_name: payment.bank_name,
            cheque_number: payment.cheque_number,
            cheque_date: payment.cheque_date,
            reference_number: payment.reference_number,
            transaction_number: payment.transaction_number,
            payment_description: payment.payment_description,
            term_day: payment.term_day,
            delivery_address: payment.delivery_address,
            grand_total: payment.grand_total,
            paid_amount: payment.paid_amount,
            subtotal: payment.subtotal,
            service_fee: payment.service_fee,
            delivery_fee: payment.delivery_fee,
            withholding_tax: payment.withholding_tax,
            invoice_no: payment.invoice_no,
        };
        //console.log(payment);
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_payments/update",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const addPaymentSalesInvoice = async (payment) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            // franchisee_sale_id: payment.franchisee_sale_id,
            franchisee_id: payment.franchisee_id,
            branch_id: payment.branch_id,
            payment_date: payment.payment_date,
            deposit_date: payment.deposit_date,
            payment_type: payment.payment_type,
            paid_amount: payment.paid_amount,
            check_date: payment.check_date,
            check_number: payment.check_number,
            from_bank_name: payment.bank_name,
            payment_description: payment.payment_description,
        };
        //console.log(payment);
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_payments/create",
            payload
        );
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllSaleItemsByBranch = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: id,
            }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const closeOverpaidFranchiseeSale = async (id, remarks) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sales/close_overpaid_franchisee_sale",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_sale_id: id,
                remarks: remarks,
            }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};