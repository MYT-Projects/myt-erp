import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getToken2,
    getUser,
} from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllInventoryGroup = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventory_groups/search",
            {
                requester: getUser(),
                token: getToken(),
                name: data.name,
                supervisor: data.supervisor,
                details: data.details,
                number_of_branch: data.number_of_branch,
                // date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : data.date_from,
                // date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : data.date_to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllInventoryGroupPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventory_groups/search",
            {
                requester: getUser(),
                token: getToken2(),
                name: data.name,
                supervisor: data.supervisor,
                details: data.details,
                number_of_branch: data.number_of_branch,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const getInventoryGroup = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventory_groups/get_inventory_group",
            {
                requester: getUser(),
                token: getToken(),
                inventory_group_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getInventoryGroupPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventory_groups/get_inventory_group",
            {
                requester: getUser(),
                token: getToken2(),
                inventory_group_id: id,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const createInventoryGroup = async (data, ids) => {
    console.log(data, "create")
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventory_groups/create",
            {
                requester: getUser(),
                token: getToken(),
                name: data.name,
                // supervisor: data.supervisor,
                // supervisor_id: data.employee_id,
                details: data.details,
                
                branch_ids: ids.map((id) => {
                    return id.value;
                }),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const createInventoryGroupPotato = async (data, ids) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventory_groups/create",
            {
                requester: getUser(),
                token: getToken2(),
                name: data.name,
                // supervisor: data.supervisor,
                // supervisor_id: data.employee_id,
                details: data.details,
                
                branch_ids: ids.map((id) => {
                    return id.value;
                }),
                
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const updateInventoryGroup = async (data, ids) => {
    console.log(data, "update")
    console.log(ids, "ids")
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventory_groups/update",
            {
                requester: getUser(),
                token: getToken(),
                inventory_group_id: data.id,
                name: data.name,
                details: data.details,
                
                branch_ids: ids.map((id) => {
                    return id.value;
                }),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const updateInventoryGroupPotato = async (data, ids) => {
    console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventory_groups/update",
            {
                requester: getUser(),
                token: getToken2(),
                inventory_group_id: data.id,
                name: data.name,
                details: data.details,
                
                branch_ids: ids.map((id) => {
                    return id.value;
                }),
                
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteInventoryGroup = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventory_groups/delete",
            {
                requester: getUser(),
                token: getToken(),
                inventory_group_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteInventoryGroupPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventory_groups/delete",
            {
                requester: getUser(),
                token: getToken2(),
                inventory_group_id: id,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchBranch = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branches/search",
            {
                requester: getUser(),
                token: getToken(),
                no_inventory_group: 1,
                is_franchise: "0,1"
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchBranchPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branches/search",
            {
                requester: getUser(),
                token: getToken2(),
                no_inventory_group: 1,
                is_franchise: "0,1"
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};