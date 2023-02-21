import axios from "axios";
import { getToken, getUser } from "../Utils/Common";
import { getAPICall, postAPICall, postAPICall2 } from "./axiosMethodCalls";

/***************************
 * LOGIN
 ***************************/

// Check Token Status
export const checkTokenStatus = async (token) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "users/get_user",
            {
                requester: getUser(),
                token: getToken(),
                // user_id: 1,
                pin: getUser(),
            }
        );
        //console.log("SUCCESS");
        return true;
    } catch (error) {
        //console.log("FAILED");
        return false;
    }
};

// FOR MANGO MAGIC
export const loginUser = async (username, password) => {
    try {
        const response = await postAPICall2(
            process.env.REACT_APP_LINK + "login",
            {
                username: username,
                password: password,
            },
            {
                "api-key": "daccfc89-ff47-4ce1-99bf-5ad2d8f57282",
                "Content-Type": "application/json",
            }
        );
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        //console.log(process.env.REACT_APP_LINK);
        return { error: error.response };
    }
};
// FOR POTATO CORNER
export const loginUser2 = async (username, password) => {
    try {
        const response = await postAPICall2(
            process.env.REACT_APP_POTATO + "login",
            {
                username: username,
                password: password,
            },
            {
                "api-key": "daccfc89-ff47-4ce1-99bf-5ad2d8f57282",
                "Content-Type": "application/json",
            }
        );
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        //console.log(process.env.REACT_APP_LINK);
        return { error: error.response };
    }
};

/***************************
 * LOGOUT
 ***************************/

export const logoutUser = async () => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "logout",
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
