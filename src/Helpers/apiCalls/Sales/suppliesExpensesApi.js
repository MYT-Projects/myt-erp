import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

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
            branch_id: newSE.branch_id,
            forwarder_id: newSE.forwarder_id,
            delivery_address: newSE.delivery_address,
            delivery_date: newSE.delivery_date,
            is_save: newSE.is_save,
            supplies_expense_date: newSE.supplies_expense_date,
            remarks: newSE.remarks,
            status: newSE.status,
            freight_collect: "0",

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
            process.env.REACT_APP_LINK + "Supplies_expenses/update",
            payload
        );
        //
        return response;
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
            process.env.REACT_APP_LINK + "Supplies_expenses/search",
            {
                requester: getUser(),
                token: getToken(),
                se_date_from: data.from,
                se_date_to: data.to,
                branch_id: data.branch_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
