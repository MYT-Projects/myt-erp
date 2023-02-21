import { getToken, getUser } from "../Utils/Common";
import { getAPICall, postAPICall } from "./axiosMethodCalls";

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
export const getSingleBranch = async (branch_id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branches/get_branch",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: branch_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
