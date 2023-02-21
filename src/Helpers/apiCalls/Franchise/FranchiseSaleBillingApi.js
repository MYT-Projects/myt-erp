import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getUser,
    numberFormatInt
} from "../../Utils/Common";
import Moment from "moment";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

//GET
export const getAllFranchiseSaleBilling = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "franchisee_sale_billings/get_all_franchisee_billing_sale",
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

export const getFranchise = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "franchisee_sale_billings/get_franchisee_billing_sale",
            {
                requester: getUser(),
                token: getToken(),
                fs_billing_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//SEARCH
export const getAllFSBMissing = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/search",
            {
                requester: getUser(),
                token: getToken(),
                have_not_reported: 1,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

/*
SEARCH PARAMETERS

    MISSING
        have_not_reported = 1

    DONE
        status = done

    OPEN
        payment_status = open_bill
        status = done

    ALL MISSING
        all = 1

    CLOSED
        payment_status = closed_bill
        status = done
*/
export const searchSalesBilling = async (filterConfig) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            branch_id: filterConfig.franchisee_id,
            status: filterConfig.status,
            payment_status: filterConfig.payment_status,
            // have_not_reported: filterConfig.have_not_reported,
            have_reported: filterConfig.have_reported,
            branch_name: filterConfig.branch_name,
            franchisee_name: filterConfig.franchisee_name,
            month: filterConfig.month,
            all: filterConfig.all,
        };
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/search",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchSalesBillingMissing = async (filterConfig) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            month: filterConfig.month,
            year: filterConfig.year,
            branch_name: filterConfig.branch_name,
            franchisee_name: filterConfig.franchisee_name,
            branch_id: filterConfig.franchisee_id,
        };
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/search_missing",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllOpenCloseBilling = async (status, month) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/search",
            {
                requester: getUser(),
                token: getToken(),
                type: status,
                month: month,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//POST
export const createFranchiseSaleBilling = async (franchise, sheet, discount) => {
    //console.log(franchise)
    console.log(sheet)
    console.log("discount", discount)

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            branch_id: franchise.branch_id,
            franchisee_id: franchise.franchisee_id,
            month: franchise.month,
            discount: discount.discount,
            discount_remarks: discount.discount_remarks,

            dates: sheet.map((sale) => {
                // //console.log(Moment(sale.date).format("YYYY-MM-DD"))
                return Moment(sale.date).format("YYYY-MM-DD");
            }),
            sales: sheet.map((sale) => {
                return sale.sales? sale.sales : "0";
            }),
            is_closed: sheet.map((sale) => {
                return sale.is_closed;
            }),
        };

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/create",
            payload
        );
        console.log(response)
        return { data: response.data };
    } catch (error) {
        console.log(error)
        return { error: error.response };
    }
};

//UPDATE
export const updateFranchiseSaleBilling = async (franchise, sheet, discount) => {
    //console.log(franchise)
    //console.log(sheet)
    console.log("discount", discount)

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            branch_id: franchise.branch_id,
            fs_billing_id: franchise.id,
            franchisee_id: franchise.franchise_id,
            month: Moment(franchise.month).format("YYYY-MM-DD"),
            discount: discount.discount,
            discount_remarks: discount.discount_remarks,

            dates: sheet.map((sale) => {
                // //console.log(Moment(sale.date).format("YYYY-MM-DD"))
                return Moment(sale.date).format("YYYY-MM-DD");
            }),
            sales: sheet.map((sale) => {
                return sale.sales ? sale.sales : "0";
            }),
            is_closed: sheet.map((sale) => {
                return sale.is_closed;
            }),
        };

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/update",
            payload
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        //console.log(error)
        return { error: error.response };
    }
};

export const updateFranchiseSaleBillingDiscount = async (franchise, discount) => {
    //console.log(franchise)
    //console.log(sheet)

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            branch_id: franchise.branch_id,
            fs_billing_id: franchise.id,
            franchisee_id: franchise.franchise_id,
            discount: discount.discount,
            discount_remarks: discount.discount_remarks,

            // month: Moment(franchise.month).format("YYYY-MM-DD"),
            // month: franchise.month,

            // dates: sheet.map((sale) => {
            //     // //console.log(Moment(sale.date).format("YYYY-MM-DD"))
            //     return Moment(sale.date).format("YYYY-MM-DD");
            // }),
            // sales: sheet.map((sale) => {
            //     return sale.sales ? sale.sales : "0";
            // }),
            // is_closed: sheet.map((sale) => {
            //     return sale.is_closed;
            // }),
        };

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/update",
            payload
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        //console.log(error)
        return { error: error.response };
    }
};

export const searchFranchiseeBranchName = async (info) => {
    //console.log(info)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_name: info,
                // franchised_on_from: info.franchised_on_from,
                // franchised_on_to: info.franchised_on_to
            }
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchFranchiseeDropdown = async (info) => {
    //console.log(info)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/search",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_id: info,
                // franchised_on_from: info.franchised_on_from,
                // franchised_on_to: info.franchised_on_to
            }
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchFranchiseeMonth = async (info) => {
    //console.log(info)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/search",
            {
                requester: getUser(),
                token: getToken(),
                month: info,
                // franchised_on_from: info.franchised_on_from,
                // franchised_on_to: info.franchised_on_to
            }
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//CREATE PAYMENT
export const createFranchiseeSaleBillingPayment = async (id, info, billing) => {
    console.log(billing)
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "fs_billing_payments/create",
            {
                requester: getUser(),
                token: getToken(),
                fs_billing_id: id,
                franchisee_id: billing.franchise_id,
                payment_type: info.payment_type,
                payment_date: info.payment_date,
                deposit_date: info.deposit_date,
                remarks: info.remarks,
                bank_id: info.bank_id,
                from_bank_name: info.bank_name,
                to_bank_id: info.to_bank_id,
                cheque_number: info.cheque_number,
                cheque_date: info.cheque_date,
                reference_number: info.reference_number,
                transaction_number: info.transaction_number,
                payment_description: info.payment_description,
                term_day: info.term_day,
                delivery_address: info.delivery_address,
                paid_amount: info.paid_amount,
                grand_total: numberFormatInt(billing.total_amount_due),
                subtotal: info.subtotal,
                service_fee: info.service_fee,
                delivery_fee: info.delivery_fee,
                withholding_tax: info.withholding_tax,
                discount: info.discount,
                remarks: info.remarks,
                discount_remarks: info.discount_remarks,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const createFranchiseeSaleBillingPaymentModal = async (
    id,
    info,
    balance
) => {
    console.log(info, balance)
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "fs_billing_payments/create",
            {
                requester: getUser(),
                token: getToken(),
                fs_billing_id: id,
                franchisee_id: info.franchisee_id,
                payment_type: info.payment_type,
                payment_date: info.payment_date,
                deposit_date: info.deposit_date,
                remarks: info.remarks,
                bank_id: info.bank_id,
                to_bank_id: info.to_bank_id,
                from_bank_name: info.bank_name,
                cheque_number: info.cheque_number,
                cheque_date: info.cheque_date,
                reference_number: info.reference_number,
                transaction_number: info.transaction_number,
                payment_description: info.payment_description,
                term_day: info.term_day,
                delivery_address: info.delivery_address,
                paid_amount: info.paid_amount ? info.paid_amount : balance,
                grand_total: info.grand_total,
                subtotal: info.subtotal,
                service_fee: info.service_fee,
                delivery_fee: info.delivery_fee,
                discount: info.discount,
                withholding_tax: info.withholding_tax,
                
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET PAYMENT
export const getAllFranchiseSaleBillingPayment = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "fs_billing_payments/get_all_fs_billing_payment",
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

export const deleteFranchiseSaleBilling = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_sale_billings/delete",
            {
                requester: getUser(),
                token: getToken(),
                fs_billing_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//DELETE FSBILLING PAYMENT
export const deleteFranchiseSaleBillingPayment = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "fs_billing_payments/delete",
            {
                requester: getUser(),
                token: getToken(),
                fs_billing_payment_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

