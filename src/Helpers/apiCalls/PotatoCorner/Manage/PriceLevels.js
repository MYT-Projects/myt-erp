import { getToken2, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";

//GET
export const getAllPriceLevelsPotato = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "price_levels/get_all_price_level",
            {
                requester: getUser(),
                token: getToken2(),
            },
            "potato"
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const getPriceLevelPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "price_levels/get_price_level",
            {
                requester: getUser(),
                token: getToken2(),
                price_level_id: id,
            },
            "potato"
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const searchPriceLevelPotato = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "price_levels/search",
            {
                requester: getUser(),
                token: getToken2(),
                name: name,
            },
            "potato"
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const createPriceLevelPotato = async (data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "price_levels/create",
            {
                requester: getUser(),
                token: getToken2(),
                name: data.name,
                names: data.names,
                commission_rates: data.commission_rates,
                product_ids_0: data["product_ids_0"],
                product_ids_1: data["product_ids_1"],
                product_ids_2: data["product_ids_2"],
                prices_0: data["prices_0"],
                prices_1: data["prices_1"],
                prices_2: data["prices_2"],
            },
            "potato"
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const updatePriceLevelPotato = async (id, data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "price_levels/update",
            {
                requester: getUser(),
                token: getToken2(),
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
            },
            "potato"
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

export const deletePriceLevelPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "price_levels/delete",
            {
                requester: getUser(),
                token: getToken2(),
                price_level_id: id,
                //to finish
            },
            "potato"
        );
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};
