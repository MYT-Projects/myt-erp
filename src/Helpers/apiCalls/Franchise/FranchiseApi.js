import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getUser,
} from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

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

export const getFranchisee = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisees/get_franchisee",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchFranchisee = async (info) => {
    console.log(info)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisees/search",
            {
                requester: getUser(),
                token: getToken(),
                name: info.franchise,
                franchised_on_from: info.franchised_on_from
                    ? Moment(info.franchised_on_from).format("YYYY-MM-DD")
                    : info.franchised_on_from,
                franchised_on_to: info.franchised_on_to
                    ? Moment(info.franchised_on_to).format("YYYY-MM-DD")
                    : info.franchised_on_to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchFranchiseeApi = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchisees/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: filterConfig.branch_id,
                name: filterConfig.franchise,
                contract_status: filterConfig.type,
                payment_status: filterConfig.payment_status,
                franchised_on_from: filterConfig.franchised_on_from
                    ? Moment(filterConfig.franchised_on_from).format("YYYY-MM-DD")
                    : filterConfig.franchised_on_from,
                franchised_on_to: filterConfig.franchised_on_to
                    ? Moment(filterConfig.franchised_on_to).format("YYYY-MM-DD")
                    : filterConfig.franchised_on_to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//POST
export const createFranchisee = async (franchise) => {
    //console.log(franchise)
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            branch_id: franchise.branch_id,
            name: franchise.name,
            payment_status: "open_bill",
            franchisee_contact_no: franchise.franchisee_contact_no,
            franchisee_package: franchise.franchisee_package,
            franchisee_fee: franchise.franchisee_fee,
            royalty_fee: franchise.royalty_fee,
            marketing_fee: franchise.marketing_fee,
            package_type: franchise.package_type,
            security_deposit: franchise.security_deposit,
            taxes: franchise.taxes,
            other_fee: franchise.other_fee,
            franchised_on: franchise.franchised_on,
            opening_start: franchise.opening_start,
            contract_start: franchise.contract_start,
            contract_end: franchise.contract_end,
            remarks: franchise.remarks,
            contact_person: franchise.contact_person,
            contact_number: franchise.contact_number,
            address: franchise.address,
            email: franchise.email,
            beginning_credit_limit: franchise.beginning_credit_limit,
            // paid_amount: franchise.amount,
        };

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisees/create",
            payload
        );

        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateFranchisee = async (id, franchise) => {
    var branch_id_new = "";
    if (typeof franchise.branch_id === "object") {
        branch_id_new = franchise.branch_id.value;
    } else {
        branch_id_new = franchise.branch_id;
    }

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            franchisee_id: id,
            branch_id: branch_id_new,
            name: franchise.name,
            franchisee_contact_no: franchise.franchisee_contact_no,
            franchisee_package: franchise.franchisee_package,
            franchisee_fee: franchise.franchisee_fee,
            royalty_fee: franchise.royalty_fee,
            marketing_fee: franchise.marketing_fee,
            package_fee: franchise.package_fee,
            package_type: franchise.package_type,
            security_deposit: franchise.security_deposit,
            taxes: franchise.taxes,
            other_fee: franchise.other_fee,
            franchised_on: franchise.franchised_on,
            opening_start: franchise.opening_start,
            contract_start: franchise.contract_start,
            contract_end: franchise.contract_end,
            remarks: franchise.remarks,
            contact_person: franchise.contact_person,
            contact_number: franchise.contact_number,
            address: franchise.address,
            email: franchise.email,
            beginning_credit_limit: franchise.beginning_credit_limit,

        };

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisees/update",
            payload
        );

        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteFranchisee = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisees/delete",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//DELETE FRANCHISEE PAYMENT
export const deleteFranchiseePayment = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_payments/delete",
            {
                requester: getUser(),
                token: getToken(),
                franchisee_payment_id : id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const filterFranchisee = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/search",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: filterConfig.supplier || "",
                receive_date_from: filterConfig.date_from
                    ? formatYDM(filterConfig.date_from)
                    : "",
                receive_date_to: filterConfig.date_to
                    ? formatYDM(filterConfig.date_to)
                    : "",
                invoice_no: filterConfig.invoice_no || "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllPaymentHistory = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "franchisee_payments/get_all_franchisee_payments",
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

export const createFranchiseePayment = async (
    franchisee_id,
    branch_id,
    info
) => {
    //console.log(info.amount)
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_payments/create",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: branch_id,
                franchisee_id: franchisee_id,
                payment_method: info.payment_method,
                payment_date: info.payment_date,
                deposit_date: info.deposit_date,
                amount: info.amount,
                remarks: info.remarks,
                from_bank_name: info.bank_name,
                cheque_number: info.cheque_number,
                cheque_date: info.cheque_date,
                reference_number: info.reference_number,
                from_bank_id: info.from_bank_id,
                to_bank_id: info.to_bank_id,
                invoice_no: info.invoice_no,
                // transaction_number: info.transaction_number,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const createFranchiseePaymentModal = async (
    franchisee_id,
    branch_id,
    info,
    balance
) => {
    //console.log(info.amount)
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "franchisee_payments/create",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: branch_id,
                franchisee_id: franchisee_id,
                payment_method: info.payment_method,
                payment_date: info.payment_date,
                deposit_date: info.deposit_date,
                amount: info.amount ? info.amount : balance,
                remarks: info.remarks,
                from_bank_name: info.bank_name,
                cheque_number: info.cheque_number,
                cheque_date: info.cheque_date,
                reference_number: info.reference_number,
                from_bank_id: info.from_bank_id,
                to_bank_id: info.to_bank_id,
                invoice_no: info.invoice_no,
                // transaction_number: info.transaction_number,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
