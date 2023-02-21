import { getToken, getToken2, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllSuppliesExpenses = async () => {
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
//GET
export const getAllSuppliesExpensesPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO +
                "Supplies_expenses/get_all_supplies_expense",
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

// GET SINGLE
export const getSingleSuppliesExpense = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "Supplies_expenses/get_supplies_expense",
            {
                requester: getUser(),
                token: getToken(),
                supplies_expense_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET ALL BRANCHES
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

// DELETE
export const deleteSuppliesExpense = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            supplies_expense_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "Supplies_expenses/delete",
            payload
        );

        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE
export const createSuppliesExpense = async (newSE, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),

            requisitioner: newSE.requisitioner,
            supplier_id: newSE.supplier_id,
            vendor_id: newSE.vendor_id,
            branch_id: newSE.branch_id,
            forwarder_id: newSE.forwarder_id,
            delivery_address: newSE.delivery_address,
            // delivery_date: newSE.delivery_date,
            is_save: newSE.is_save,
            supplies_expense_date: newSE.supplies_expense_date,
            remarks: newSE.remarks,
            status: newSE.status,
            freight_collect: "0",
            type: newSE.type,

            names: items.map((item) => {
                return item.name;
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
            // types: items.map((item) => {
            //     return item.type;
            // }),
        };
        //console.log("create se payload");
        //console.log(payload);
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "Supplies_expenses/create",
            payload
        );

        return response;
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE
export const editSuppliesExpense = async (updatedSE, items, id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            supplies_expense_id: id,
            requisitioner: updatedSE.requisitioner,
            supplier_id: updatedSE.supplier_id,
            vendor_id: updatedSE.vendor_id,
            branch_id: updatedSE.branch_id,
            forwarder_id: updatedSE.forwarder_id,
            delivery_address: updatedSE.delivery_address,
            delivery_date: updatedSE.delivery_date,
            is_save: updatedSE.is_save,
            supplies_expense_date: updatedSE.supplies_expense_date,
            remarks: updatedSE.remarks,
            status: updatedSE.status,
            type: updatedSE.type,

            names: items.map((item) => {
                return item.name;
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
        };

        //console.log("payload");
        //console.log(payload);
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "Supplies_expenses/update",
            payload
        );
        // //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const emailSE = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK +
                "Supplies_expenses/send_email_to_supplier",
            {
                requester: getUser(),
                token: getToken(),
                supplies_expense_id: id,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const receiveSE = async (SE) => {
    const userDetails = {
        requester: getUser(),
        token: getToken(),
    };
    const payload = {
        ...userDetails,
        ...SE,
    };
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/create",
            {
                ...payload,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE
export const approveSuppliesExpense = async (id, status) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            supplies_expense_id: id,
            new_status: status,
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "supplies_expenses/change_status",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchSE = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_expenses/search",
            {
                requester: getUser(),
                token: getToken(),
                se_date_from: data.from ? Moment(data.from).format("YYYY-MM-DD") : "",
                se_date_to: data.to ? Moment(data.to).format("YYYY-MM-DD") : "",
                // branch_id: data.branch_id,
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                status: data.status,
                order_status: data.order_status,
                limit_by: data.limit_by,
                anything: data.anything,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const changeStatus = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_expenses/change_status",
            {
                requester: getUser(),
                token: getToken(),
                supplies_expense_id: data.se_id,
                new_status: data.new_status,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const paymentModal = async (
    supplies_expense_id,
    payment,
    balance,
    payee
) => {
    console.log(payment)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            supplies_expense_id: supplies_expense_id,
            amount: payment.paid_amount ? payment.paid_amount : balance,
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
            payee: payment.payee ? payment.payee : payee,
            particulars: payment.particulars,
            check_no: payment.check_no,
            check_date: payment.check_date,
            issued_date: payment.issued_date,
        };
        //console.log(payment);
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_expenses/add_payment",
            payload
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

