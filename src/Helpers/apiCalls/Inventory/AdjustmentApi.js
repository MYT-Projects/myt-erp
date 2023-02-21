import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";
//GET ALL
export const getAllAdjustments = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/get_all_adjustment",
            {
                requester: getUser(),
                token: getToken(),
                // branch_id: id
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};
export const searchAdjustmentsMango = async (filterConfig) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/search",
            {
                requester: getUser(),
                token: getToken(),
                status: filterConfig.status,
                branch_id: filterConfig.branch_id,
                // counted_by: filterConfig.counted_by,
                remarks: filterConfig.remarks,
                item_id: filterConfig.item_id,
                type_id: filterConfig.type_id,
                date_from: filterConfig.date_from ? Moment(filterConfig.date_from).format("YYYY-MM-DD") : filterConfig.date_from,
                date_to: filterConfig.date_to ? Moment(filterConfig.date_to).format("YYYY-MM-DD") : filterConfig.date_to,
                name: filterConfig.name,
                request_type: filterConfig.type,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAdjustment = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/get_adjustment",
            {
                requester: getUser(),
                token: getToken(),
                adjustment_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllAdjustmentItemType = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/get_all_adjustment_types",
            {
                requester: getUser(),
                token: getToken(),
                // branch_id: id
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

//FILTER
export const searchByDate = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/search",
            {
                requester: getUser(),
                token: getToken(),
                start_date: data.to
                    ? Moment(data.from).format("YYYY-MM-DD")
                    : data.to,
                end_date: data.to
                    ? Moment(data.to).format("YYYY-MM-DD")
                    : data.to,
                branch_id: data.branch_id,
                item_id: data.item_id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchByCounter = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/search",
            {
                requester: getUser(),
                token: getToken(),
                counted_by: data,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// CREATE ADJUSTMENT
export const createAdjustment = async (adjustment) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            inventory_id: adjustment.inventory_id,
            branch_id: adjustment.branch_id,
            item_id: adjustment.item_id,
            type_id: adjustment.type_id,
            counted_by: adjustment.counted_by,
            physical_count: adjustment.physical_count,
            difference: adjustment.difference,
            unit: adjustment.unit,
            remarks: adjustment.remarks, // employee remarks
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "adjustments/create",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};

export const updateAdjustmentStatus = async (data, remarks, status, request_type) => {
    console.log(request_type);
    //console.log(
    //     data.map((adjustment) => {
    //         return adjustment.id;
    //     })
    // );
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "adjustments/update_status",
            {
                requester: getUser(),
                token: getToken(),
                status: status,
                request_type: request_type,
                remarks: remarks, // admin remarks when approving adjustment requests

                adjustment_ids: data.map((adjustment) => {
                    return adjustment.id;
                }),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
