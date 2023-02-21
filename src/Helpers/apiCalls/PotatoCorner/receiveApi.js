import { getToken2, getUser } from "../../Utils/Common";
import { getAPICall } from "./../axiosMethodCalls";

//GET
export const getAllReceivesPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken2(),
                supplier_id: id,
            },
            "potato"
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET
export const getOpenReceivesPotato = async (data, status) => {
    //console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken2(),
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                bill_type: status,
            },
            "potato"
        );
        //console.log(response.data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE
export const getSingleReceivePotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "receives/get_receive",
            {
                requester: getUser(),
                token: getToken2(),
                receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//SUPPLIES EXPENSES RECEIVES
//GET
export const getAllSeReceivesPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "supplies_receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken2(),
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
export const getOpenSeReceivesPotato = async (id, status) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "supplies_receives/get_all_receive",
            {
                requester: getUser(),
                token: getToken2(),
                supplier_id: id,
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
export const getSingleSeReceivePotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "supplies_receives/get_receive",
            {
                requester: getUser(),
                token: getToken2(),
                receive_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
