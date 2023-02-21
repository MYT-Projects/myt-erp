import toast from "react-hot-toast";
import {
    getToken,
    getToken2,
    getUser,
    refreshPage,
    toastStyle,
} from "../Utils/Common";
import { getAPICall, postAPICall, postAPICall2 } from "./axiosMethodCalls";

/***************************
 * FILTER
 ***************************/

const user = getUser();
const token = getToken();

//POST
// Save user to both db
export const createUser = async (info, branches) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "users/create",
            {
                requester: user,
                token: token,
                username: info.username,
                password: info.password,
                last_name: info.last_name ? info.last_name : " ",
                first_name: info.first_name,
                middle_name: info.middle_name ? info.middle_name : " ",
                employee_id: info.employee_id,
                email: info.email,
                type: info.type,
                branch_id: branches ? branches : info.branch_id,
            }
        );
        // const response2 = await postAPICall(
        //     process.env.REACT_APP_POTATO + "users/create",
        //     {
        //         requester: user,
        //         token: getToken2(),
        //         username: info.username,
        //         password: info.password,
        //         last_name: info.last_name ? info.last_name : " ",
        //         first_name: info.first_name,
        //         middle_name: info.middle_name ? info.middle_name : " ",
        //         employee_id: info.employee_id,
        //         email: info.email,
        //         type: info.type,
        //         branch_id: branches ? branches : info.branch_id,
        //     },
        //     "potato"
        // );
        // return { data: { mango: response.data, potato: response2.data } };
        return { data: response.data };

    } catch (error) {
        if (error.response.status === 401) {
            toast.error(
                "Unauthorized access: another device is using this account",
                { style: toastStyle() }
            );
        }
        return { error: error.response };
    }
};

export const editUser = async (info, branches) => {
    // var branchesData = [];

    // branches.map((data) => {
    //     branchesData.push(data.value);
    // })

    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "users/update",
            {
                requester: user,
                token: token,
                pin: info.pin,
                // user_id: info.id,
                username: info.username,
                password: info.password,
                last_name: info.last_name,
                first_name: info.first_name,
                middle_name: info.middle_name,
                email: info.email,
                type: info.type,
                // status: info.status,
                // branch_ids: branchesData.join(","),
                branch_ids: branches,
                employee_id: info.employee_id,

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

export const editPassword = async (id, password, token, userKey, userId) => {
    let config = {
        headers: {
            "api-key": "daccfc89-ff47-4ce1-99bf-5ad2d8f57282",
            "user-key": userKey,
            "Content-Type": "application/json",
        },
    };
    try {
        const response = await postAPICall2(
            process.env.REACT_APP_LINK + "users/change_password",
            {
                requester: id,
                user_id: userId,
                token: token,
                password: password,
            },
            config
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

export const getSingleUser = async (pin) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "users/get_user",
            {
                requester: user,
                token: token,
                // user_id: id,
                pin: pin
            }
        );
        return { data: response.data.data };
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

export const getAllUsers = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "users/get_all_user",
            {
                requester: user,
                token: token,
            }
        );
        return { data: response.data.data };
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

export const searchUser = async (username) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "users/search",
            {
                requester: user,
                token: token,
                name: username,
            }
        );
        return { data: response.data.data };
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

// export const searchUser = async (data) => {
//     try {
//         const response = await postAPICall(process.env.REACT_APP_LINK + 'users/search', {
//             requester: user,
//             token: token,
//             name: data,
//         });
//         return ({ data: response });
//     } catch (error) {
//         if (error.response.status === 401) {
//           toast.error(
//             "Unauthorized access: another device is using this account", {style: toastStyle(),}
//           );
//         //   removeSession();

//         }
//         return ({ error: error.response });
//     }
// }

export const deleteUser = async (pin) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "users/delete",
            {
                requester: user,
                token: token,
                // user_id: id,
                pin: pin
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

export const getAllRoles = async () => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "roles/filtered_get",
            {
                requester: user,
                token: token,
            }
        );
        return { data: response.data.data };
    } catch (error) {
        if (error.response.status === 401) {
            toast.error(
                "Unauthorized access: another device is using this account"
            );
            //   removeSession();
        }
        return { error: error.response };
    }
};
