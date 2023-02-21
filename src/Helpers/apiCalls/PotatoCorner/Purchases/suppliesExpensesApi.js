import { getToken, getToken2, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";

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
export const getSingleSuppliesExpensePotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO +
                "Supplies_expenses/get_supplies_expense",
            {
                requester: getUser(),
                token: getToken2(),
                supplies_expense_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET ALL BRANCHES
export const getAllBranchesPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branches/get_all_branch",
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

// DELETE
export const deleteSuppliesExpensePotato = async (id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            supplies_expense_id: id,
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "Supplies_expenses/delete",
            payload,
            "potato"
        );

        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE
export const createSuppliesExpensePotato = async (newSE, items) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),

            requisitioner: newSE.requisitioner,
            supplier_id: newSE.supplier_id,
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
            // types: items.map((item) => {
            //     return item.type;
            // }),
        };
        //console.log("create se payload");
        //console.log(payload);
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "Supplies_expenses/create",
            payload,
            "potato"
        );

        return response;
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE
export const editSuppliesExpensePotato = async (updatedSE, items, id) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            supplies_expense_id: id,
            requisitioner: updatedSE.requisitioner,
            supplier_id: updatedSE.supplier_id,
            branch_id: updatedSE.branch_id,
            forwarder_id: updatedSE.forwarder_id,
            delivery_address: updatedSE.delivery_address,
            delivery_date: updatedSE.delivery_date,
            is_save: updatedSE.is_save,
            supplies_expense_date: updatedSE.supplies_expense_date,
            remarks: updatedSE.remarks,
            status: updatedSE.status,

            // requesitioner: updatedSE.requesitioner,
            // supplier_id: updatedSE.supplier_id,
            // branch_id: updatedSE.branch_id,

            // supplies_expense_date: updatedSE.supplies_expense_date,
            // remarks: updatedSE.remarks,

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
            types: items.map((item) => {
                return item.type;
            }),
        };

        //
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "Supplies_expenses/update",
            payload,
            "potato"
        );
        //
        return response;
    } catch (error) {
        return { error: error.response };
    }
};

export const emailSEPotato = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO +
                "Supplies_expenses/send_email_to_supplier",
            {
                requester: getUser(),
                token: getToken2(),
                supplies_expense_id: id,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const receiveSEPotato = async (SE) => {
    const userDetails = {
        requester: getUser(),
        token: getToken2(),
    };
    const payload = {
        ...userDetails,
        ...SE,
    };
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "supplies_receives/create",
            {
                ...payload,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// UPDATE
export const approveSuppliesExpensePotato = async (id, status) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            supplies_expense_id: id,
            new_status: status,
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "supplies_expenses/change_status",
            payload,
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchSEPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "supplies_expenses/search",
            {
                requester: getUser(),
                token: getToken2(),
                se_date_from: data.from,
                se_date_to: data.to,
                branch_id: data.branch_id,
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                anything: data.anything,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const paymentModalPotato = async (
    purchase_id,
    payment,
    balance,
) => {
    console.log(payment)
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            purchase_id: purchase_id,
            amount: payment.amount ? payment.amount : balance,
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
            payee: payment.payee,
            particulars: payment.particulars,
            check_no: payment.check_no,
            check_date: payment.check_date,
            issued_date: payment.issued_date,
        };
        // console.log(payment);
        console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "supplies_expenses/add_payment",
            {
                ...payload,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};