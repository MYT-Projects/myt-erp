import { getToken, getToken2, getUser } from "../Utils/Common";
import { getAPICall } from "./axiosMethodCalls";

//GET
export const getAllReceives = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: id,
            }
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET
export const getOpenReceives = async (data, status) => {
    //console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                bill_type: status,
            }
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE
export const getSingleReceive = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "receives/get_receive",
            {
                requester: getUser(),
                token: getToken(),
                receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
export const getSingleReceivePotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "receives/get_receive",
            {
                requester: getUser(),
                token: getToken2(),
                receive_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//SUPPLIES EXPENSES RECEIVES
//GET
export const getAllSeReceives = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
            }
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET
export const getOpenSeReceives = async (data, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                bill_type: status,
            }
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE
export const getSingleSeReceive = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "supplies_receives/get_receive",
            {
                requester: getUser(),
                token: getToken(),
                receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
