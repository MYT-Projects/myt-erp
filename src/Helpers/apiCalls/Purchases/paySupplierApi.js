import { getToken, getToken2, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllSupplierPayments = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_payments/get_all_payment",
            {
                requester: getUser(),
                token: getToken(),
                start_date: data.from ? Moment(data.from).format("YYYY-MM-DD") : "",
                end_date: data.to
                    ? Moment(data.to).format("YYYY-MM-DD")
                    : data.to,
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                payment_mode: data.payment_mode,
                doc_no: data.doc_no,
            }
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

//FILTER
export const searchByDate = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_payments/get_all_payment",
            {
                requester: getUser(),
                token: getToken(),
                start_date: data.from ? Moment(data.from).format("YYYY-MM-DD") : "",
                end_date: data.to
                    ? Moment(data.to).format("YYYY-MM-DD")
                    : data.to,
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                payment_mode: data.payment_mode,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET SINGLE CASH
export const getSingleCashSP = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "cash_payments/get_slip",
            {
                requester: getUser(),
                token: getToken(),
                slip_id: id,
            }
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
export const getSingleCheckSP = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "check_payments/get_slip",
            {
                requester: getUser(),
                token: getToken(),
                slip_id: id,
            }
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
export const getSingleBankSP = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "bank_payments/get_slip",
            {
                requester: getUser(),
                token: getToken(),
                slip_id: id,
            }
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
export const createCheckPayment = async (newPayment, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            supplier_id: newPayment.supplier_id,
            vendor_id: newPayment.vendor_id,
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
            process.env.REACT_APP_LINK + "check_payments/create",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE CASH PAYMENT
export const createCashPayment = async (newPayment, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            payment_date: newPayment.payment_date,
            supplier_id: newPayment.supplier_id,
            vendor_id: newPayment.vendor_id,
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
            process.env.REACT_APP_LINK + "cash_payments/create",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
export const createCashPaymentPotato = async (newPayment, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            payment_date: newPayment.payment_date,
            supplier_id: newPayment.supplier_id,
            vendor_id: newPayment.vendor_id,
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
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE BANK PAYMENT
export const createBankPayment = async (newPayment, items, transactionFee) => {
    try {
        //console.log(newPayment);
        //console.log(items);
        var payload = {
            requester: getUser(),
            token: getToken(),

            payment_date: newPayment.payment_date,
            bank_from: newPayment.bank_from,
            from_account_no: newPayment.from_account_no,
            from_account_name: newPayment.from_account_name,
            bank_to: newPayment.bank_to,
            bank_to_name: newPayment.bank_to_name,
            to_account_no: newPayment.to_account_no,
            to_account_name: newPayment.to_account_name,
            transaction_fee: transactionFee,
            reference_no: newPayment.reference_no,
            supplier_id: newPayment.supplier_id,
            vendor_id: newPayment.vendor_id,
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
            process.env.REACT_APP_LINK + "bank_payments/create",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
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
            bank_to_name: newPayment.bank_to_name,
            to_account_no: newPayment.to_account_no,
            to_account_name: newPayment.to_account_name,
            transaction_fee: transactionFee,
            reference_no: newPayment.reference_no,
            supplier_id: newPayment.supplier_id,
            vendor_id: newPayment.vendor_id,
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
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE CHECK PAYMENT
export const updateCheckPayment = async (newPayment, items, id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            check_slip_id: id,

            supplier_id: newPayment.supplier_id,
            vendor_id: newPayment.vendor_id,
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
            process.env.REACT_APP_LINK + "check_payments/update",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE CHECK PAYMENT
export const updateCashPayment = async (newPayment, items, id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            cash_slip_id: id,

            payment_date: newPayment.payment_date,
            supplier_id: newPayment.supplier_id,
            vendor_id: newPayment.vendor_id,
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
            process.env.REACT_APP_LINK + "cash_payments/update",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
// UPDATE BANK PAYMENT
export const updateBankPayment = async (
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
            token: getToken(),
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
            vendor_id: newPayment.vendor_id,
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
            process.env.REACT_APP_LINK + "bank_payments/update",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// DELETE CHECK
export const deleteCheckSP = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            check_slip_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "check_payments/delete_slip",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
// DELETE CASH
export const deleteCashSP = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            cash_slip_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "cash_payments/delete_slip",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
// DELETE Bank
export const deleteBankSP = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            bank_slip_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "bank_payments/delete_slip",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
