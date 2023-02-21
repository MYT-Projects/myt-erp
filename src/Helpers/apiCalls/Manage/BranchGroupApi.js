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
export const getAllBranchGroup = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branch_groups/search",
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

export const getAllBranchGroupPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branch_groups/search",
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

export const getBranchGroup = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branch_groups/get_branch_group",
            {
                requester: getUser(),
                token: getToken(),
                branch_group_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getBranchGroupPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branch_groups/get_branch_group",
            {
                requester: getUser(),
                token: getToken2(),
                branch_group_id: id,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const createBranchGroup = async (data, ids) => {
    console.log(data, "create")
    try {
        console.log({
            requester: getUser(),
            token: getToken(),
            name: data.name,
            supervisor: data.supervisor,
            supervisor_id: data.employee_id,
            details: data.details,
            
            branch_ids: ids.map((id) => {
                return id.value;
            }),
        })
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branch_groups/create",
            {
                requester: getUser(),
                token: getToken(),
                name: data.name,
                supervisor: data.supervisor,
                supervisor_id: data.employee_id,
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

export const createBranchGroupPotato = async (data, ids) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branch_groups/create",
            {
                requester: getUser(),
                token: getToken2(),
                name: data.name,
                supervisor: data.supervisor,
                supervisor_id: data.employee_id,
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


export const updateBranchGroup = async (data, ids) => {
    console.log(data, "update")
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branch_groups/update",
            {
                requester: getUser(),
                token: getToken(),
                branch_group_id: data.id,
                name: data.name,
                supervisor: data.supervisor,
                supervisor_id: data.supervisor_id,
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

export const updateBranchGroupPotato = async (data, ids) => {
    console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branch_groups/update",
            {
                requester: getUser(),
                token: getToken2(),
                branch_group_id: data.id,
                name: data.name,
                supervisor: data.supervisor,
                supervisor_id: data.employee_id,
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

export const deleteBranchGroup = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "branch_groups/delete",
            {
                requester: getUser(),
                token: getToken(),
                branch_group_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteBranchGroupPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branch_groups/delete",
            {
                requester: getUser(),
                token: getToken2(),
                branch_group_id: id,
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
                no_branch_group: 1,
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
                no_branch_group: 1,
                is_franchise: "0,1"
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};