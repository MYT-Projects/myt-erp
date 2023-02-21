import { getToken, getUser } from "../Utils/Common";
import { getAPICall, postAPICall } from "./axiosMethodCalls";

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
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
