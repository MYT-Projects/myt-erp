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

export const searchProductionReport = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "build_items/get_production_report",
            {
                requester: getUser(),
                token: getToken(),
                item_id: data.item_id,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const searchProductionReportPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "build_items/get_production_report",
            {
                requester: getUser(),
                token: getToken2(),
                item_id: data.item_id,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : "",
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : "",
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};
