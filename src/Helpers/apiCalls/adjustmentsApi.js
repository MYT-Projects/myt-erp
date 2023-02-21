import axios from "axios";
import { getToken, getToken2, getUser } from "../Utils/Common";
import { getAPICall, postAPICall, postAPICall2 } from "./axiosMethodCalls";

//GET
export const getAllInventoryAdjustments = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/get_all_adjustment",
            {
                requester: getUser(),
                token: getToken(),
            },
            "mango"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
export const getAllAdjustmentTypes = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/get_all_adjustment_types",
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
export const getAllInventoryAdjustmentsPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "adjustments/get_all_adjustment",
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
