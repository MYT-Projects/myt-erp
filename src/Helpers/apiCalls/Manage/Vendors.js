import { getToken, getUser } from "../../Utils/Common"
import { getAPICall, postAPICall } from "../axiosMethodCalls"

//GET
export const getAllVendors = async () => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "Vendors/get_all_vendor", {
            requester: getUser(),
            token: getToken(),
        })
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const getVendor = async (id) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "Vendors/get_vendor", {
            requester: getUser(),
            token: getToken(),
            vendor_id: id,
        })
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const createVendor = async (details) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "vendors/create", {
            requester: getUser(),
            token: getToken(),
            ...details
        })
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const updateVendor = async (details) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "vendors/update", {
            requester: getUser(),
            token: getToken(),
            ...details
        })
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const deleteVendor = async (id) => {
    try {
        const response = await postAPICall(process.env.REACT_APP_LINK + "vendors/delete", {
            requester: getUser(),
            token: getToken(),
            vendor_id: id
        })
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const searchVendor = async (name) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "vendors/search", {
            requester: getUser(),
            token: getToken(),
            trade_name: name,
            // address: search.address,
            // email: search.email,
            // contact_person: search.contact_person,
            // phone_no: search.phone_no,
            // tin_no: search.tin_no,
            // bir_no: search.bir_no,
        })
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}