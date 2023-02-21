import { getToken, getToken2, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";
//GET
export const getAllItemList = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/get_all_inventory",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: id,
                // status: status,
            }
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const searchAllItemList = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.id.split("-")[1],
                name: data.name,
                item_type: data.item_type,
            }
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const getLowOnStock = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: filterConfig.branch_id,
                name: filterConfig.name,
                with_po: filterConfig.with_po,
                item_type: filterConfig.item_type,
                low_stock: 1,
            }
        );
        //console.log(response.data);
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};
export const getLowOnStockPotato = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/search",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: filterConfig.branch_id,
                name: filterConfig.name,
                with_po: filterConfig.with_po,
                item_type: filterConfig.item_type,
                low_stock: 1,
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

// GET SINGLE transfer
export const getItemList = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/get_inventory",
            {
                requester: getUser(),
                token: getToken(),
                inventory_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET
export const getItemHistory = async (branch, item, item_unit_id, type, encoded_on_from, encoded_on_to) => {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    console.log(nextDay)
    
    try {
        let link =
            type == "mango_magic"
                ? process.env.REACT_APP_LINK
                : process.env.REACT_APP_POTATO;
        const response = await getAPICall(
            link + "inventories/get_item_inventory_history",
            {
                requester: getUser(),
                token: type == "mango_magic" ? getToken() : getToken2(),
                branch_id: branch,
                item_id: item,
                item_unit_id: item_unit_id,
                encoded_on_from: encoded_on_from ? Moment(encoded_on_from).format("YYYY-MM-DD") : Moment(date).format("YYYY-MM-DD"),
                encoded_on_to: encoded_on_to ? Moment(encoded_on_to).format("YYYY-MM-DD") : Moment(nextDay).format("YYYY-MM-DD"),
            },
            type == "mango_magic" ? "mango_magic" : "potato"
        );
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};


export const searchHistory = async (branch, item, type, filterConfig) => {
    console.log(branch, item, type)
    const date = new Date();
    date.setDate(date.getDate() - 7);

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    console.log(nextDay)
    try {
        let link =
            type === "mango_magic"
                ? process.env.REACT_APP_LINK
                : process.env.REACT_APP_POTATO;
        const response = await getAPICall(
            link + "inventories/get_item_inventory_history",
            {
                requester: getUser(),
                token: type == "mango_magic" ? getToken() : getToken2(),
                branch_id: branch,
                item_id: item,
                doc_type: filterConfig.doc_type,
                doc_no: filterConfig.doc_no,
                encoded_on_from: filterConfig.date_from ? Moment(filterConfig.date_from).format("YYYY-MM-DD") : Moment(date).format("YYYY-MM-DD"),
                encoded_on_to: filterConfig.date_to ? Moment(filterConfig.date_to).format("YYYY-MM-DD") : Moment(nextDay).format("YYYY-MM-DD"),
                // item_unit_id: item_unit_id,
            },
            type === "mango_magic" ? "mango_magic" : "potato"
        );
        return { data: response.data };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const getItemHistoryFilter = async (data) => {
    console.log(data);
    const date = new Date();
    date.setDate(date.getDate() - 7);

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    console.log(nextDay)

    try {
        var response = "";
        if (data.branch_id.split("-")[0] === "mango") {
            response = await getAPICall(
                process.env.REACT_APP_LINK +
                    "inventories/get_item_inventory_history",
                {
                    requester: getUser(),
                    token: getToken(),
                    branch_id: data.branch_id.split("-")[1],
                    item_id: data.item_id,
                    encoded_on_from: data.date_to
                        ? Moment(data.date_from).format("YYYY-MMM-DD")
                        : Moment(date).format("YYYY-MM-DD"),
                    encoded_on_to: data.date_to
                        ? Moment(data.date_to).format("YYYY-MMM-DD")
                        : Moment(nextDay).format("YYYY-MM-DD"),
                    doc_type: data.doc_type,
                    // item_unit_id: item_unit_id
                },
                "mango_magic"
            );
        } else if (data.branch_id.split("-")[0] === "potato") {
            response = await getAPICall(
                process.env.REACT_APP_POTATO +
                    "inventories/get_item_inventory_history",
                {
                    requester: getUser(),
                    token: getToken2(),
                    branch_id: data.branch_id.split("-")[1],
                    item_id: data.item_id,
                    encoded_on_from: data.date_to
                        ? Moment(data.date_from).format("YYYY-MMM-DD")
                        : Moment(date).format("YYYY-MM-DD"),
                    encoded_on_to: data.date_to
                        ? Moment(data.date_to).format("YYYY-MMM-DD")
                        : Moment(nextDay).format("YYYY-MM-DD"),
                    doc_type: data.doc_type,
                    // item_unit_id: item_unit_id
                },
                "potato"
            );
        }

        return { data: response.data };
    } catch (error) {
        console.log(error.response);
        return { error: error.response };
    }
};

export const searchInventory = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: filterConfig.branch_id,
                name: filterConfig.name,
                item_type: filterConfig.item_type,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateItemListInventory = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.id,
                inventory_id: data.inventory_id,
                ingredient_id: data.ingredient_id,
                current_qty: data.current_qty,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// SEARCH BAR
export const searchItemsInBranch = async (
    value = "",
    item_type = "",
    branch_id
) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/search",
            {
                requester: getUser(),
                token: getToken(),
                name: value,
                item_type: item_type,
                branch_id: branch_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchItemsInBranch_Potato = async (
    value = "",
    item_type = "",
    branch_id
) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/search",
            {
                requester: getUser(),
                token: getToken2(),
                name: value,
                item_type: item_type,
                branch_id: branch_id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
