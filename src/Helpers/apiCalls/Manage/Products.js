import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import formData from "react-form-data";

//GET
export const getAllProducts = async (name, is_addon) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "products/get_all_product",
            {
                requester: getUser(),
                token: getToken(),
                product_name : name,
                is_addon : is_addon,
            }
        );
        // //console.log(response);
        return { data: response };
    } catch (error) {
        //console.log(error.response);
        return { error: error.response };
    }
};

// GET SINGLE
export const getProduct = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "products/get_product",
            {
                requester: getUser(),
                token: getToken(),
                product_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchProduct = async (name='') => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "products/search",
            {
                requester: getUser(),
                token: getToken(),
                name: name,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createProduct = async (data, priceLevelIDs, items, optionalItems, file) => {
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
        form_data.append("token", getToken());
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
            process.env.REACT_APP_LINK + "products/create", form_data
            // {
            //     requester: getUser(),
            //     token: getToken(),
            //     name: data.name,
            //     is_addon: data.is_addon,
            //     details: data.details,
            //     item_ids: itemIds,
            //     units: unitIds,
            //     quantities: qty,
            //     ...form_data
            // }, form_data
        );
        console.log(form_data)
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateProducts = async (data, priceLevelIDs, items, optionalItems, file) => {

    console.log(data)
    console.log(items)
    console.log(optionalItems)

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
        form_data.append("token", getToken());
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
            process.env.REACT_APP_LINK + "products/update", form_data
            // {
            //     requester: getUser(),
            //     token: getToken(),
            //     product_id: data.id,
            //     name: data.name,
            //     is_addon: data.is_addon,
            //     details: data.details,
            //     item_ids: itemIds,
            //     units: unitIds,
            //     quantities: qty,
            // }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteProduct = async (id) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "products/delete",
            {
                requester: getUser(),
                token: getToken(),
                product_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
