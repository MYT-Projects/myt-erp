import toast from "react-hot-toast";
import { formatDate, getToken, getUser, toastStyle } from "../Utils/Common";
import { getAPICall, postAPICall } from "./axiosMethodCalls";
const user = getUser();
const token = getToken();

//GET
export const getAllForwarders = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "forwarders/get_all_forwarder",
            {
                requester: user,
                token: token,
            }
        );
        return response.data;
    } catch (error) {
        return { error: error.response };
    }
};

export const getForwarder = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "forwarders/get_forwarder",
            {
                requester: user,
                token: token,
                forwarder_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const createForwarder = async (info) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "forwarders/create",
            {
                requester: user,
                token: token,
                name: info.name,
                address: info.address,
                phone_no: info.phone_no,
            }
        );
        //console.log(response)
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const editForwarder = async (forwarderData) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "forwarders/update",
            {
                requester: user,
                token: token,
                forwarder_id: forwarderData.id,
                name: forwarderData.name,
                address: forwarderData.address,
                phone_no: forwarderData.phone_no,
            }
        );
        //console.log(response)
        return { data: response.data };
    } catch (error) {
        if (error.response.status === 401) {
            toast.error(
                "Unauthorized access: another device is using this account",
                { style: toastStyle() }
            );
            //   removeSession();
        }
        return { error: error.response };
    }
};

export const deleteForwarder = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "forwarders/delete",
            {
                requester: user,
                token: token,
                forwarder_id: id,
            }
        );
        return { data: response };
    } catch (error) {
        if (error.response.status === 401) {
            toast.error(
                "Unauthorized access: another device is using this account",
                { style: toastStyle() }
            );
            //   removeSession();
        }
        return { error: error.response };
    }
};

export const searchForwarder = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "forwarders/search",
            {
                requester: getUser(),
                token: getToken(),
                name: name,
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
