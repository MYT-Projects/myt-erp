import toast from "react-hot-toast";
import { getToken2 } from "../../../Utils/Common";
import {
    formatDate,
    getToken,
    getUser,
    toastStyle,
} from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";
const user = getUser();
const token = getToken2();

//GET
export const getAllItemsPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_all_item",
            {
                requester: user,
                token: token,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllItemsByBranchPotato = async (branch_id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_all_item",
            {
                requester: user,
                token: token,
                branch_id: branch_id,
            },
            "potato"
        );
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getItemPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_item",
            {
                requester: user,
                token: token,
                item_id: id,
            },
            "potato"
        );
        return response.data;
    } catch (error) {
        return { error: error.response };
    }
};

export const getAllBranchItemPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/get_all_item",
            {
                requester: user,
                token: token,
                branch_id: id,
            },
            "potato"
        );
        return response.data;
    } catch (error) {
        return { error: error.response };
    }
};

export const createItemPotato = async (itemDetails, itemsUnits) => {
    try {
        var info = {
            requester: user,
            token: token,
            name: itemDetails.name,
            type: itemDetails.type,
            detail: itemDetails.detail,
            is_for_sale: itemDetails.is_for_sale ? "1" : "0",
            is_dsr: itemDetails.is_dsr ? "1" : "0",
            added_by: user,
            added_on: formatDate(),

            //item_units
            breakdown_units: itemsUnits.map((item) => {
                return item.breakdown_unit;
            }),

            breakdown_values: itemsUnits.map((item) => {
                return item.breakdown_value;
            }),

            inventory_units: itemsUnits.map((item) => {
                return item.inventory_unit;
            }),

            inventory_values: itemsUnits.map((item) => {
                return item.inventory_value;
            }),

            minimums: itemsUnits.map((item) => {
                return item.minimum;
            }),

            maximums: itemsUnits.map((item) => {
                return item.maximum;
            }),

            acceptable_variances: itemsUnits.map((item) => {
                return item.acceptable_variance;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "items/create",
            info,
            "potato"
        );
        //console.log(response);
        //console.log(info);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const editItemPotato = async (itemDetails, itemsUnits) => {
    try {
        var info = {
            requester: user,
            token: token,
            item_id: itemDetails.id,
            name: itemDetails.name,
            type: itemDetails.type,
            detail: itemDetails.detail,
            is_for_sale: itemDetails.is_for_sale ? "1" : "0",
            is_dsr: itemDetails.is_dsr ? "1" : "0",
            // added_by: user,
            // added_on: formatDate(),

            //item_units
            breakdown_units: itemsUnits.map((item) => {
                return item.breakdown_unit;
            }),

            breakdown_values: itemsUnits.map((item) => {
                return item.breakdown_value;
            }),

            inventory_units: itemsUnits.map((item) => {
                return item.inventory_unit;
            }),

            inventory_values: itemsUnits.map((item) => {
                return item.inventory_value;
            }),

            minimums: itemsUnits.map((item) => {
                return item.min;
            }),

            maximums: itemsUnits.map((item) => {
                return item.max;
            }),

            acceptable_variances: itemsUnits.map((item) => {
                return item.acceptable_variance;
            }),
            prices: itemsUnits.map((item) => {
                return item.price;
            }),
        };
        //console.log(info);

        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "items/update",
            { ...info },
            "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET
export const searchItemPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/search",
            {
                requester: user,
                token: token,
                name: data.name,
                type: data.type,
            },
            "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteItemPotato = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "items/delete",
            {
                requester: user,
                token: token,
                item_id: id,
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
