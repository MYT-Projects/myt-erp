import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

//GET
export const getAllPriceLevels = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "price_levels/get_all_price_level",
            {
                requester: getUser(),
                token: getToken(),
            }
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const getPriceLevel = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "price_levels/get_price_level",
            {
                requester: getUser(),
                token: getToken(),
                price_level_id: id,
            }
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const searchPriceLevel = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "price_levels/search",
            {
                requester: getUser(),
                token: getToken(),
                name: name,
            }
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const createPriceLevel = async (data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "price_levels/create",
            {
                requester: getUser(),
                token: getToken(),
                name: data.name,
                names: data.names,
                commission_rates: data.commission_rates,
                product_ids_0: data["product_ids_0"],
                product_ids_1: data["product_ids_1"],
                product_ids_2: data["product_ids_2"],
                prices_0: data["prices_0"],
                prices_1: data["prices_1"],
                prices_2: data["prices_2"],
            }
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const updatePriceLevel = async (id, data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "price_levels/update",
            {
                requester: getUser(),
                token: getToken(),
                price_level_id: id,
                name: data.name,
                names: data.names,
                commission_rates: data.commission_rates,
                product_ids_0: data["product_ids_0"],
                product_ids_1: data["product_ids_1"],
                prices_0: data["prices_0"],
                prices_1: data["prices_1"],
                product_ids_2: data["product_ids_2"],
                prices_2: data["prices_2"],
            }
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const deletePriceLevel = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "price_levels/delete",
            {
                requester: getUser(),
                token: getToken(),
                price_level_id: id,
                //to finish
            }
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};
