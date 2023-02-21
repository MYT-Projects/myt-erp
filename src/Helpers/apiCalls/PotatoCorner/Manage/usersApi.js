import toast from "react-hot-toast";
import {
    getToken2,
    getUser,
    refreshPage,
    toastStyle,
} from "../../../Utils/Common";
import {
    getAPICall,
    postAPICall,
    postAPICall2,
} from "./../../axiosMethodCalls";

/***************************
 * FILTER
 ***************************/

const user = getUser();
const token = getToken2();

//POST
export const createUserPotato = async (info, branches, pin) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "users/create",
            {
                requester: user,
                token: getToken2(),
                username: info.username,
                password: info.password,
                last_name: info.last_name ? info.last_name : " ",
                first_name: info.first_name,
                middle_name: info.middle_name ? info.middle_name : " ",
                employee_id: info.employee_id,
                email: info.email,
                type: info.type,
                branch_id: branches ? branches : info.branch_id,
                pin: pin
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        console.log(error.response);
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

export const editUserPotato = async (info, branches) => {
    // var branchesData = [];

    // branches.map((data) => {
    //     branchesData.push(data.value);
    // })

    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "users/update",
            {
                requester: user,
                token: token,
                // user_id: info.id,
                pin: info.pin,
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

            },
            "potato"
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

export const editPasswordPotato = async (
    id,
    password,
    token,
    userKey,
    userId
) => {
    let config = {
        headers: {
            "api-key": "daccfc89-ff47-4ce1-99bf-5ad2d8f57282",
            "user-key": userKey,
            "Content-Type": "application/json",
        },
    };
    try {
        const response = await postAPICall2(
            process.env.REACT_APP_POTATO + "users/change_password",
            {
                requester: id,
                user_id: userId,
                token: token,
                password: password,
            },
            config,
            "potato"
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

export const getSingleUserPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "users/get_user",
            {
                requester: user,
                token: token,
                user_id: id,
            },
            "potato"
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

export const getAllUsersPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "users/get_all_user",
            {
                requester: user,
                token: token,
            },
            "potato"
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

export const searchUserPotato = async (username) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "users/search",
            {
                requester: user,
                token: token,
                name: username,
            },
            "potato"
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
//         const response = await postAPICall(process.env.REACT_APP_POTATO + 'users/search', {
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

export const deleteUserPotato = async (pin) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "users/delete",
            {
                requester: user,
                token: token,
                // user_id: id,
                pin: pin,
            },
            "potato"
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

export const getAllRolesPotato = async () => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "roles/filtered_get",
            {
                requester: user,
                token: token,
            },
            "potato"
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
