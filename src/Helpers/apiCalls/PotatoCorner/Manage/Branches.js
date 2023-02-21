import { getToken2 } from "../../../Utils/Common";
import { getToken, getUser, getTime12 } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllBranchesPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branches/get_all_branch",
            {
                requester: getUser(),
                token: getToken2(),
            },
            "potato"
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

// GET SINGLE
export const getBranchPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branches/get_branch",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: id,
            },
            "potato"
        );
        //console.log(response)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchBranchPotato = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branches/search",
            {
                requester: getUser(),
                token: getToken2(),
                name: filterConfig.name,
                is_franchise: filterConfig.is_franchise,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchBranchStatusPotato = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branch_operation_logs/get_all",
            {
                requester: getUser(),
                token: getToken2(),
                status: filterConfig.status,
                branch_type: filterConfig.branch_type,
                branch_name: filterConfig.branch_name,
                branch_id: filterConfig.branch_id,
                date: filterConfig.date_from ? Moment(filterConfig.date_from).format("YYYY-MM-DD") : "",
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createBranchPotato = async (data, schedule) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "branches/create",
            {
                requester: getUser(),
                token: getToken2(),
                name: data.name,
                branch_group_id: data.branch_group_id,
                inventory_group_id: data.inventory_group_id,
                initial_drawer: data.initial_drawer,
                address: data.address,
                phone_no: data.phone_no,
                contact_person: data.contact_person,
                contact_person_no: data.contact_person_no,
                franchisee_name: data.franchisee_name,
                franchisee_contact_no: data.franchisee_contact_no,
                tin_no: data.tin_no,
                bir_no: data.bir_no,
                contract_start: data.contract_start ? Moment(data.contract_start).format("YYYY-MM-DD") : "",
                contract_end: data.contract_end ? Moment(data.contract_end).format("YYYY-MM-DD") : "",
                opening_date: data.opening_date ? Moment(data.opening_date).format("YYYY-MM-DD") : "",
                price_level: data.price_level,
                operation_days: data.os_startDate + "-" + data.os_endDate,
                operation_times: getTime12(schedule.osStartTime) + "-" + getTime12(schedule.osEndTime),
                delivery_days: data.delivery_startDate + "-" + data.delivery_endDate,
                delivery_times: getTime12(schedule.deliveryStartTime) + "-" + getTime12(schedule.deliveryEndTime),
                // operation_schedule:
                //     data.os_startDate +
                //     "-" +
                //     schedule.osStartTime +
                //     "-" +
                //     data.os_endDate +
                //     "-" +
                //     schedule.osEndTime,
                // delivery_schedule:
                //     data.delivery_startDate +
                //     "-" +
                //     schedule.deliveryStartTime +
                //     "-" +
                //     data.delivery_endDate +
                //     "-" +
                //     schedule.deliveryEndTime,
                is_franchise: data.is_franchise,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateBranchPotato = async (data, schedule) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "branches/update",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: data.id,
                name: data.name,
                branch_group_id: data.branch_group_id,
                inventory_group_id: data.inventory_group_id,
                phone_no: data.phone_no,
                initial_drawer: data.initial_drawer,
                address: data.address,
                contact_person: data.contact_person,
                contact_person_no: data.contact_person_no,
                franchisee_name: data.franchisee_name,
                franchisee_contact_no: data.franchisee_contact_no,
                tin_no: data.tin_no,
                bir_no: data.bir_no,
                contract_start: data.contract_start,
                contract_end: data.contract_end,
                opening_date: data.opening_date,
                price_level: data.price_level,
                operation_days: data.os_startDate + "-" + data.os_endDate,
                operation_times: getTime12(schedule.osStartTime) + "-" + getTime12(schedule.osEndTime),
                delivery_days: data.delivery_startDate + "-" + data.delivery_endDate,
                delivery_times: getTime12(schedule.deliveryStartTime) + "-" + getTime12(schedule.deliveryEndTime),
                // operation_schedule:
                //     data.os_startDate +
                //     "-" +
                //     schedule.osStartTime +
                //     "-" +
                //     data.os_endDate +
                //     "-" +
                //     schedule.osEndTime,
                // delivery_schedule:
                //     data.delivery_startDate +
                //     "-" +
                //     schedule.deliveryStartTime +
                //     "-" +
                //     data.delivery_endDate +
                //     "-" +
                //     schedule.deliveryEndTime,
                is_franchise: data.is_franchise,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteBranchPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "branches/delete",
            {
                requester: getUser(),
                token: getToken2(),
                branch_id: id,
            },
            "potato"
        );
        //console.log(response)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
