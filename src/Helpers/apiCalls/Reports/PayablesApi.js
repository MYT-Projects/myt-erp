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
export const getAllPayables = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "reports/get_receive_payables",
            {
                requester: getUser(),
                token: getToken(),
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                invoice_no: data.invoice_no,
                payable: data.payable,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : data.date_from,
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : data.date_to,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getAllPayablesPotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "reports/get_receive_payables",
            {
                requester: getUser(),
                token: getToken2(),
                supplier_id: data.supplier_id,
                vendor_id: data.vendor_id,
                invoice_no: data.invoice_no,
                payable: data.payable,
                date_from: data.date_from ? Moment(data.date_from).format("YYYY-MM-DD") : data.date_from,
                date_to: data.date_to ? Moment(data.date_to).format("YYYY-MM-DD") : data.date_to,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
