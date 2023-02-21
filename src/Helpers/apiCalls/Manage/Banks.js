import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

//GET
export const getAllBanks = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "banks/get_all_bank",
            {
                requester: getUser(),
                token: getToken(),
            }
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

// GET SINGLE
export const getBank = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "banks/get_bank",
            {
                requester: getUser(),
                token: getToken(),
                bank_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchBank = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "banks/search",
            {
                requester: getUser(),
                token: getToken(),
                name: name,
            }
        );
        return { data: response };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createBank = async (data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "banks/create",
            {
                requester: getUser(),
                token: getToken(),
                name: data.bank_name,
                check_template_id: data.check_template_id,
                account_no: data.account_no,
                account_name: data.account_name,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateBank = async (data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "banks/update",
            {
                requester: getUser(),
                token: getToken(),
                bank_id: data.id,
                name: data.bank_name,
                account_no: data.account_no,
                account_name: data.account_name,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteBanks = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "banks/delete",
            {
                requester: getUser(),
                token: getToken(),
                bank_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
