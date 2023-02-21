import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getToken2,
    getUser,
    numberFormatInt
} from "../../Utils/Common";
import Moment from "moment";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

export const getAttendance = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "attendances/get_attendance",
            {
                requester: getUser(),
                token: getToken(),
                attendance_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllAttendance = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "attendances/get_all_attendance",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchAttendance = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "attendances/search",
            {
                requester: getUser(),
                token: getToken(),
                branch_id: data.branch_id,
                employee_id: data.employee_id,
                group_datetime: data.group_datetime,
                branch_name: data.branch_name,
                employee_name: data.employee_name,
                by_employees: data.by_employees,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
                date: data.date ? Moment(data.date).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const deleteAttendance = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "attendances/delete",
            {
                requester: getUser(),
                token: getToken(),
                attendance_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};