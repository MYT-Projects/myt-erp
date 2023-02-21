import { getToken, getToken2, getUser } from "../Utils/Common";
import { getAPICall, postAPICall } from "./axiosMethodCalls";

//GET FROM MANGO MAGIC DB
export const getAllSuppliers = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "suppliers/get_all_supplier",
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
//GET FROM POTATO CORNER DB
export const getAllSuppliers2 = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "suppliers/get_all_supplier",
            {
                requester: getUser(),
                token: getToken2(),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getSupplier = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "suppliers/get_supplier",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: id,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const createSupplier = async (details) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "suppliers/create",
            {
                requester: getUser(),
                token: getToken(),
                ...details,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateSupplier = async (details) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "suppliers/update",
            {
                requester: getUser(),
                token: getToken(),
                ...details,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteSupplier = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "suppliers/delete",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchSupplier = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "suppliers/search",
            {
                requester: getUser(),
                token: getToken(),
                trade_name: name,
                // address: search.address,
                // email: search.email,
                // contact_person: search.contact_person,
                // phone_no: search.phone_no,
                // tin_no: search.tin_no,
                // bir_no: search.bir_no,
            }
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
