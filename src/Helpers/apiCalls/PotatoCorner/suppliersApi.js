import { getToken, getToken2, getUser } from "../../Utils/Common"
import { getAPICall, postAPICall } from "../axiosMethodCalls"

//GET
export const getAllSuppliersPotato = async () => {
    try {
        const response = await getAPICall(process.env.REACT_APP_POTATO + "suppliers/get_all_supplier", {
            requester: getUser(),
            token: getToken2(),
        }, "potato")
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const getSupplierPotato = async (id) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_POTATO + "suppliers/get_supplier", {
            requester: getUser(),
            token: getToken2(),
            supplier_id: id,
        }, "potato")
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const createSupplierPotato = async (details) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_POTATO + "suppliers/create", {
            requester: getUser(),
            token: getToken2(),
            ...details
        }, "potato")
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const updateSupplierPotato = async (details) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_POTATO + "suppliers/update", {
            requester: getUser(),
            token: getToken2(),
            ...details
        }, "potato")
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const deleteSupplierPotato = async (id) => {
    try {
        const response = await postAPICall(process.env.REACT_APP_POTATO + "suppliers/delete", {
            requester: getUser(),
            token: getToken2(),
            supplier_id: id
        }, "potato")
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const searchSupplierPotato = async (name) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_POTATO + "suppliers/search", {
            requester: getUser(),
            token: getToken2(),
            trade_name: name,
            // address: search.address,
            // email: search.email,
            // contact_person: search.contact_person,
            // phone_no: search.phone_no,
            // tin_no: search.tin_no,
            // bir_no: search.bir_no,
        }, "potato")
        return { response: response.data }
    } catch (error) {
        return { error: error.response }
    }
}