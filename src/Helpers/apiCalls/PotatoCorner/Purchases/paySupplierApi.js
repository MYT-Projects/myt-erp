import { getToken, getToken2, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllSupplierPaymentsPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "supplies_payments/get_all_payment",
            {
                requester: getUser(),
                token: getToken2(),
                start_date: data.from ? Moment(data.from).format("YYYY-MM-DD") : "",
                end_date: data.to
                    ? Moment(data.to).format("YYYY-MM-DD")
                    : data.to,
                vendor_id: data.vendor_id,
                supplier_id: data.supplier_id,
                payment_mode: data.payment_mode,
                doc_no: data.doc_no,
            },
            "potato"
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

//FILTER
export const searchByDatePotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "supplies_payments/get_all_payment",
            {
                requester: getUser(),
                token: getToken2(),
                start_date: data.from ? Moment(data.from).format("YYYY-MM-DD") : "",
                end_date: data.to
                    ? Moment(data.to).format("YYYY-MM-DD")
                    : data.to,
                supplier_id: data.supplier_id,
                payment_mode: data.payment_mode,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET SINGLE CASH
export const getSingleCashSPPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "cash_payments/get_slip",
            {
                requester: getUser(),
                token: getToken2(),
                slip_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
//GET SINGLE CHECK
export const getSingleCheckSPPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "check_payments/get_slip",
            {
                requester: getUser(),
                token: getToken2(),
                slip_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
//GET SINGLE BANK
export const getSingleBankSPPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "bank_payments/get_slip",
            {
                requester: getUser(),
                token: getToken2(),
                slip_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//CREATE CHECK PAYMENT
export const createCheckPaymentPotato = async (newPayment, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            supplier_id: newPayment.supplier_id,
            bank_id: newPayment.bank_id,
            check_no: newPayment.check_no,
            check_date: newPayment.check_date,
            issued_date: newPayment.issued_date,
            payee: newPayment.payee,
            particulars: newPayment.particulars,
            acknowledged_by: newPayment.acknowledged_by,

            // receive_id dropsearch
            receive_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            amounts: items.map((item) => {
                return item.amount;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "check_payments/create",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE CASH PAYMENT
export const createCashPaymentPotato = async (newPayment, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            payment_date: newPayment.payment_date,
            supplier_id: newPayment.supplier_id,
            payee: newPayment.payee,
            acknowledged_by: newPayment.acknowledged_by,
            particulars: newPayment.particulars,

            // receive_id dropsearch
            receive_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            amounts: items.map((item) => {
                return item.amount;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "cash_payments/create",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE BANK PAYMENT
export const createBankPaymentPotato = async (
    newPayment,
    items,
    transactionFee
) => {
    try {
        //console.log(newPayment);
        //console.log(items);
        var payload = {
            requester: getUser(),
            token: getToken2(),

            payment_date: newPayment.payment_date,
            bank_from: newPayment.bank_from,
            from_account_no: newPayment.from_account_no,
            from_account_name: newPayment.from_account_name,
            bank_to: newPayment.bank_to,
            to_account_no: newPayment.to_account_no,
            to_account_name: newPayment.to_account_name,
            transaction_fee: transactionFee,
            reference_no: newPayment.reference_no,
            supplier_id: newPayment.supplier_id,
            payee: newPayment.payee,
            particulars: newPayment.particulars,
            acknowledged_by: newPayment.acknowledged_by,

            // receive_id dropsearch
            receive_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            amounts: items.map((item) => {
                return item.amount;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "bank_payments/create",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE CHECK PAYMENT
export const updateCheckPaymentPotato = async (newPayment, items, id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            check_slip_id: id,

            supplier_id: newPayment.supplier_id,
            bank_id: newPayment.bank_id,
            check_no: newPayment.check_no,
            check_date: newPayment.check_date,
            issued_date: newPayment.issued_date,
            payee: newPayment.payee,
            particulars: newPayment.particulars,
            acknowledged_by: newPayment.acknowledged_by,

            // receive_id dropsearch
            receive_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            amounts: items.map((item) => {
                return item.amount;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "check_payments/update",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE CHECK PAYMENT
export const updateCashPaymentPotato = async (newPayment, items, id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            cash_slip_id: id,

            payment_date: newPayment.payment_date,
            supplier_id: newPayment.supplier_id,
            payee: newPayment.payee,
            acknowledged_by: newPayment.acknowledged_by,
            particulars: newPayment.particulars,

            // receive_id dropsearch
            receive_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            amounts: items.map((item) => {
                return item.amount;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "cash_payments/update",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
// UPDATE BANK PAYMENT
export const updateBankPaymentPotato = async (
    newPayment,
    items,
    transactionFee,
    id
) => {
    try {
        //console.log(newPayment);
        //console.log(items);
        var payload = {
            requester: getUser(),
            token: getToken2(),
            bank_slip_id: id,

            payment_date: newPayment.payment_date,
            bank_from: newPayment.bank_from,
            from_account_no: newPayment.from_account_no,
            from_account_name: newPayment.from_account_name,
            bank_to: newPayment.bank_to,
            to_account_no: newPayment.to_account_no,
            to_account_name: newPayment.to_account_name,
            transaction_fee: transactionFee,
            reference_no: newPayment.reference_no,
            supplier_id: newPayment.supplier_id,
            payee: newPayment.payee,
            particulars: newPayment.particulars,
            acknowledged_by: newPayment.acknowledged_by,

            // receive_id dropsearch
            receive_ids: items.map((item) => {
                return item.entry.value;
            }),
            // amount input field
            amounts: items.map((item) => {
                return item.amount;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "bank_payments/update",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// DELETE CHECK
export const deleteCheckSPPotato = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            check_slip_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "check_payments/delete_slip",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
// DELETE CASH
export const deleteCashSPPotato = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            cash_slip_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "cash_payments/delete_slip",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
// DELETE Bank
export const deleteBankSPPotato = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            bank_slip_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "bank_payments/delete_slip",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
