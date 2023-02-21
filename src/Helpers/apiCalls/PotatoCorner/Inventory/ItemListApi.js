import { getToken2, getToken, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";

//GET
export const getAllItemListPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/get_all_inventory",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: id,
                // status: status,
            },
            "potato"
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const searchAllItemListPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/search",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: data.id.split("-")[1],
                name: data.name,
                item_type: data.item_type,
            },
            "potato"
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const getItemListPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/get_inventory",
            {
                requester: getUser(),
                token: getToken2(),
                inventory_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET
export const getItemHistoryPotato = async (branch, item, encoded_on_from, encoded_on_to) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO +
                "inventories/get_item_inventory_history",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: branch,
                item_id: item,
                encoded_on_from: encoded_on_from,
                encoded_on_to: encoded_on_to,
                // status: status,
            },
            "potato"
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const searchInventoryPotato = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/search",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: filterConfig.branch_id,
                name: filterConfig.name,
                item_type: filterConfig.item_type,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateItemListInventoryPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/search",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: data.id,
                inventory_id: data.inventory_id,
                ingredient_id: data.ingredient_id,
                current_qty: data.current_qty,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
