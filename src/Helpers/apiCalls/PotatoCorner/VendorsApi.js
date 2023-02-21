import { getToken, getToken2, getUser } from "../../Utils/Common"
import { getAPICall, postAPICall } from "../axiosMethodCalls"

//GET
export const getAllVendorsPotato = async () => {
    try {
        const response = await getAPICall(process.env.REACT_APP_POTATO + "Vendors/get_all_vendor", {
            requester: getUser(),
            token: getToken2(),
        }, "potato")
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const getVendorPotato = async (id) => {
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