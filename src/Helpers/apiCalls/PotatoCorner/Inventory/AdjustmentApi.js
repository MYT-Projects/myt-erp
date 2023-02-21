import { getToken2, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";
import Moment from "moment";
//GET ALL
export const getAllAdjustmentsPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "adjustments/get_all_adjustment",
            {
                requester: getUser(),
                token: getToken2(),
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchAdjustmentsPotato = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "adjustments/search",
            {
                requester: getUser(),
                token: getToken2(),
                status: filterConfig.status,
                branch_id: filterConfig.branch_id,
                remarks: filterConfig.remarks,
                // counted_by: filterConfig.counted_by,
                item_id: filterConfig.item_id,
                type_id: filterConfig.type_id,
                date_from: filterConfig.date_from ? Moment(filterConfig.date_from).format("YYYY-MM-DD") : filterConfig.date_from,
                date_to: filterConfig.date_to ? Moment(filterConfig.date_to).format("YYYY-MM-DD") : filterConfig.date_to,
                name: filterConfig.name,
                request_type: filterConfig.type,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAdjustmentPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "adjustments/get_adjustment",
            {
                requester: getUser(),
                token: getToken2(),
                adjustment_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//FILTER
export const searchByDatePotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "adjustments/search",
            {
                requester: getUser(),
                token: getToken2(),
                start_date: data.to
                    ? Moment(data.from).format("YYYY-MM-DD")
                    : data.to,
                end_date: data.to
                    ? Moment(data.to).format("YYYY-MM-DD")
                    : data.to,
                branch_id: data.branch_id,
                item_id: data.item_id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchByCounterPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "adjustments/search",
            {
                requester: getUser(),
                token: getToken2(),
                counted_by: data,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE ADJUSTMENT
export const createAdjustmentPotato = async (adjustment) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            inventory_id: adjustment.inventory_id,
            branch_id: adjustment.branch_id,
            item_id: adjustment.item_id,
            type_id: adjustment.type_id,
            counted_by: adjustment.counted_by,
            physical_count: adjustment.physical_count,
            difference: adjustment.difference,
            unit: adjustment.unit,
            remarks: adjustment.remarks,
        };
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "adjustments/create",
            payload,
            "potato"
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};

export const updateAdjustmentStatusPotato = async (data, remarks, status, request_type) => {
    //console.log(data);
    //console.log(
    //     data.map((adjustment) => {
    //         return adjustment.id;
    //     })
    // );
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "adjustments/update_status",
            {
                requester: getUser(),
                token: getToken2(),
                status: status,
                request_type: request_type,
                remarks: remarks,

                adjustment_ids: data.map((adjustment) => {
                    return adjustment.id;
                }),
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
