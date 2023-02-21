import { getToken, getToken2, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";
//GET
export const getAllItemPrices = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/get_all_franchise_sale_item_price",
            {
                requester: getUser(),
                token: getToken(),
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//GET
export const getAllItemPricesPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "franchise_sale_item_prices/get_all_franchise_sale_item_price",
            {
                requester: getUser(),
                token: getToken2(),
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const getItemPrices = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/get_franchise_sale_item_price",
            {
                requester: getUser(),
                token: getToken(),
                franchise_sale_item_price_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const getItemPricesPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "franchise_sale_item_prices/get_franchise_sale_item_price",
            {
                requester: getUser(),
                token: getToken2(),
                franchise_sale_item_price_id: id,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const createItemPrice = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/create",
            {
                requester: getUser(),
                token: getToken(),
                item_id: data.item_id,
                item_unit_id: data.item_unit_id,
                unit: data.unit,
                type: data.type,
                price_1: data.price_1,
                price_2: data.price_2,
                price_3: data.price_3,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const createItemPricePotato = async (data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "franchise_sale_item_prices/create",
            {
                requester: getUser(),
                token: getToken2(),
                item_id: data.item_id,
                item_unit_id: data.item_unit_id,
                unit: data.unit,
                type: data.type,
                price_1: data.price_1,
                price_2: data.price_2,
                price_3: data.price_3,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// PARA SEARCH SA ITEM PRICES
export const searchItemPrice = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/search",
            {
                requester: getUser(),
                token: getToken(),
                item_name: name,
            }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchItemPricePotato = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "franchise_sale_item_prices/search",
            {
                requester: getUser(),
                token: getToken2(),
                item_name: name,
            }, "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// PARA SEARCH SA ITEM
export const searchFranchiseSaleItem = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "items/search",
            {
                requester: getUser(),
                token: getToken(),
                is_for_sale: "0",
            }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchFranchiseSaleItemPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/search",
            {
                requester: getUser(),
                token: getToken2(),
                is_for_sale: "0",
            }, "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchDsrItem = async (is_dsr, data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "items/search",
            {
                requester: getUser(),
                token: getToken(),
                is_dsr: is_dsr,
                name: data.name,
                type: data.type,
            }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchDsrItemPotato = async (is_dsr, data) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "items/search",
            {
                requester: getUser(),
                token: getToken2(),
                is_dsr: is_dsr,
                name: data.name,
                type: data.type,
            }, "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateItemPrice = async (data, id) => {
    console.log(data)
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/update",
            {
                requester: getUser(),
                token: getToken(),
                franchise_sale_item_price_id: id,
                item_id: data.item_id,
                item_unit_id: data.item_unit_id,
                unit: data.unit,
                type: data.type,
                price_1: data.price_1,
                price_2: data.price_2,
                price_3: data.price_3,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateItemPricePotato = async (data, id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/update",
            {
                requester: getUser(),
                token: getToken2(),
                franchise_sale_item_price_id: id,
                item_id: data.item_id,
                item_unit_id: data.item_unit_id,
                unit: data.unit,
                type: data.type,
                price_1: data.price_1,
                price_2: data.price_2,
                price_3: data.price_3,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteItemPrices = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "franchise_sale_item_prices/delete",
            {
                requester: getUser(),
                token: getToken(),
                franchise_sale_item_price_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

// GET SINGLE transfer
export const deleteItemPricesPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "franchise_sale_item_prices/delete",
            {
                requester: getUser(),
                token: getToken2(),
                franchise_sale_item_price_id: id,
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateItemForSale = async (id, value) => {
    try {
        var info = {
            requester: getUser(),
            token: getToken(),
            item_id: id,
            is_for_sale: value,
            
        };
        //console.log(info);

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "items/update",
            { ...info }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateItemForSalePotato = async (id, value) => {
    try {
        var info = {
            requester: getUser(),
            token: getToken2(),
            item_id: id,
            is_for_sale: value,
            
        };
        //console.log(info);

        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "items/update",
            { ...info }, "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateDsr = async (id, value) => {
    try {
        var info = {
            requester: getUser(),
            token: getToken(),
            item_id: id,
            is_dsr: value,
            is_active: value,
            
        };
        //console.log(info);

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "items/update",
            { ...info }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateDsrPotato = async (id, value) => {
    try {
        var info = {
            requester: getUser(),
            token: getToken2(),
            item_id: id,
            is_dsr: value,
            is_active: value,
        };
        //console.log(info);

        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "items/update",
            { ...info }, "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


export const updateDsrStatus = async (id, value) => {
    try {
        var info = {
            requester: getUser(),
            token: getToken(),
            item_id: id,
            // is_dsr: value,
            is_active: value,
            
        };
        //console.log(info);

        const response = await postAPICall(
            process.env.REACT_APP_LINK + "items/update",
            { ...info }
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateDsrStatusPotato = async (id, value) => {
    try {
        var info = {
            requester: getUser(),
            token: getToken2(),
            item_id: id,
            // is_dsr: value,
            is_active: value,
        };
        //console.log(info);

        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "items/update",
            { ...info }, "potato"
        );
        //console.log(response);
        return { response: response.data };
    } catch (error) {
        return { error: error.response };
    }
};