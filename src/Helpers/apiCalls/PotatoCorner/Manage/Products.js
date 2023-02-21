import { getToken, getToken2, getUser } from "../../../Utils/Common";
import { getAPICall, postAPICall } from "../../axiosMethodCalls";

//GET
export const getAllProductsPotato = async (name, is_addon) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "products/get_all_product",
            {
                requester: getUser(),
                token: getToken2(),
                product_name : name,
                is_addon : is_addon,
            },
            "potato"
        );
        // //console.log(response);
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

// GET SINGLE
export const getProductPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "products/get_product",
            {
                requester: getUser(),
                token: getToken2(),
                product_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchProductPotato = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "products/search",
            {
                requester: getUser(),
                token: getToken2(),
                name: name,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createProductPotato = async (data, priceLevelIDs, items, optionalItems, file) => {
    console.log(file)
    
    var array = []
    priceLevelIDs.map((data) => {
        if(data.is_selected){
            array.push(data)
        }
    })

    let form_data = new FormData();
    if(file){
        console.log(file)
        form_data.append("image_file", file);
        form_data.append("requester", getUser());
        form_data.append("token", getToken2());
        form_data.append("name", data.name);
        form_data.append("is_addon", data.is_addon);
        form_data.append("details", data.details);
        
        array.map((data) => {
            form_data.append('price_level_ids[]', data.id);
        });

        items.map((item) => {
            form_data.append('item_ids[]', item.id);
        });
        items.map((item) => {
            form_data.append('units[]', item.unit);
        });
        items.map((item) => {
            form_data.append('quantities[]', item.quantity);
        });

        optionalItems.map((item) => {
            form_data.append('req_product_item_ids[]', item.product_item_id);
        });
        optionalItems.map((item) => {
            form_data.append('req_item_ids[]', item.item_id);
        });
        optionalItems.map((item) => {
            form_data.append('req_units[]', item.unit);
        });
        optionalItems.map((item) => {
            form_data.append('req_quantities[]', item.qty);
        });

        // form_data.append("item_ids[]", itemIds);
        // form_data.append("units[]", unitIds);
        // form_data.append("quantities[]", qty);
    }

    for (var pair of form_data.entries()) {
        console.log("form data", pair[0]+ ', ' + pair[1]); 
    }

    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "products/create", form_data, 
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateProductsPotato = async (data, priceLevelIDs, items, optionalItems, file) => {
    console.log(file)

    var array = []
    priceLevelIDs.map((data) => {
        if(data.is_selected){
            array.push(data)
        }
    })

    let form_data = new FormData();
    if(file){
        console.log(file)
        form_data.append("image_file", file);
        form_data.append("requester", getUser());
        form_data.append("token", getToken2());
        form_data.append("product_id", data.id);
        form_data.append("name", data.name);
        form_data.append("is_addon", data.is_addon);
        form_data.append("details", data.details);
        
        array.map((data) => {
            form_data.append('price_level_ids[]', data.id);
        });

        items.map((item) => {
            form_data.append('item_ids[]', item.item_id);
        });
        items.map((item) => {
            form_data.append('units[]', item.unit);
        });
        items.map((item) => {
            form_data.append('quantities[]', item.quantity ? item.quantity : item.qty);
        });

        optionalItems.map((item) => {
            form_data.append('req_product_item_ids[]', item.product_item_id);
        });
        optionalItems.map((item) => {
            form_data.append('req_item_ids[]', item.item_id);
        });
        optionalItems.map((item) => {
            form_data.append('req_units[]', item.unit);
        });
        optionalItems.map((item) => {
            form_data.append('req_quantities[]', item.qty);
        });
        
        // form_data.append("item_ids[]", itemIds);
        // form_data.append("units[]", unitIds);
        // form_data.append("quantities[]", qty);
    }

    for (var pair of form_data.entries()) {
        console.log("form data", pair[0]+ ', ' + pair[1]); 
    }

    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "products/update", form_data,
            // {
            //     requester: getUser(),
            //     token: getToken2(),
            //     product_id: data.id,
            //     name: data.name,
            //     is_addon: data.is_addon,
            //     details: data.details,
            //     item_ids: itemIds,
            //     units: unitIds,
            //     quantities: qty,
            // },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteProductPotato = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_POTATO + "products/delete",
            {
                requester: getUser(),
                token: getToken2(),
                product_id: id,
            },
            "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
