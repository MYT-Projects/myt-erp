import {
    formatDateNoTime,
    formatYDM,
    getToken,
    getToken2,
    getUser,
} from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

// //GET
export const getInventoryDetails = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "inventories/get_warehouse_inventory_details",
            {
                requester: getUser(),
                token: getToken(),
                item_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error };
    }
};

export const getInventoryDetailsPotato = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_POTATO + "inventories/get_warehouse_inventory_details",
            {
                requester: getUser(),
                token: getToken2(),
                item_id: id
            }, "potato"
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};


// export const createItemDetails = async (item_id,
//     item_unit_id,
//     warehouse_ids,
//     inventory_group,
//     default_item_unit_ids,
//     minimum_levels,
//     maximum_levels,
//     critical_levels,
//     current_levels,
//     acceptable_variances,
//     beginning_quantities,
//     units) => {

//     var count = warehouse_ids.filter((val) => {
//         return val!==null;
//     }).length + inventory_group.filter((val) => {
//         return val!==null;
//     }).length
//     console.log(count)
//     console.log(inventory_group)

//     warehouse_ids.splice(count)
//     inventory_group.splice(count)
//     default_item_unit_ids.splice(count)
//     minimum_levels.splice(count)
//     maximum_levels.splice(count)
//     critical_levels.splice(count)
//     // current_levels.splice(count)
//     acceptable_variances.splice(count)
//     beginning_quantities.splice(count)
//     units.splice(count)

//     try {
//         var payload = {
//             requester: getUser(),
//             token: getToken(),
//             item_id: item_id,
//             item_unit_id: item_unit_id,

//             branch_ids: warehouse_ids.map((val, index) => {
//                 return val;
//             }),
//             inventory_group_ids: inventory_group.map((val, index) => {
//                 return val;
//             }),
//             default_item_unit_ids: default_item_unit_ids.map((val, index) => {
//                 return val;
//             }),
//             minimum_levels: minimum_levels.map((val, index) => {
//                 return val;
//             }),
//             maximum_levels: maximum_levels.map((val, index) => {
//                 return val;
//             }),
//             critical_levels: critical_levels.map((val, index) => {
//                 return val;
//             }),
//             // current_levels: current_levels.map((val, index) => {
//             //     return val;
//             // }),
//             acceptable_variances: acceptable_variances.map((val, index) => {
//                 return val;
//             }),
//             beginning_quantities: beginning_quantities.map((val, index) => {
//                 return val;
//             }),
//             units: units.map((unit, index) => {
//                 return unit;
//             }),
//         };
//         const response = await postAPICall(
//             process.env.REACT_APP_LINK + "inventories/update_warehouse_inventory",
//             payload
//         );
//         //console.log(payload);
//         //console.log(response);
//         return { data: response.data };
//     } catch (error) {
//         //console.log(error);
//         return { error: error.response };
//     }
// };


export const createItemDetails = async (id, unit, itemDetails) => {

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            item_id: id,
            item_unit_id: unit,

            branch_ids: itemDetails.map((data, index) => {
                if(data.type === "warehouse") {
                    return data.branch_id;
                } else {
                    return null;
                }
            }),
            inventory_group_ids: itemDetails.map((data, index) => {
                if(data.type === "inventory") {
                    return data.inventory_group_id;
                } else {
                    return null;
                }
            }),
            default_item_unit_ids: itemDetails.map((data, index) => {
                return data.item_unit_id;
            }),
            minimum_levels: itemDetails.map((data, index) => {
                return data.min;
            }),
            maximum_levels: itemDetails.map((data, index) => {
                return data.max;
            }),
            critical_levels: itemDetails.map((data, index) => {
                return data.critical_level;
            }),
            // current_levels: current_levels.map((data, index) => {
            //     return data;
            // }),
            acceptable_variances: itemDetails.map((data, index) => {
                return data.acceptable_variance;
            }),
            beginning_quantities: itemDetails.map((data, index) => {
                return data.beginning_qty;
            }),
            units: itemDetails.map((data) => {
                return unit;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "inventories/update_warehouse_inventory",
            payload
        );
        console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};


export const createItemDetailsPotato = async (id, unit, itemDetails) => {

    try {
        var payload = {
            requester: getUser(),
            token: getToken2(),
            item_id: id,
            item_unit_id: unit,

            branch_ids: itemDetails.map((data, index) => {
                if(data.type === "warehouse") {
                    return data.branch_id;
                } else {
                    return null;
                }
            }),
            inventory_group_ids: itemDetails.map((data, index) => {
                if(data.type === "inventory") {
                    return data.inventory_group_id;
                } else {
                    return null;
                }
            }),
            default_item_unit_ids: itemDetails.map((data, index) => {
                return data.item_unit_id;
            }),
            minimum_levels: itemDetails.map((data, index) => {
                return data.min;
            }),
            maximum_levels: itemDetails.map((data, index) => {
                return data.max;
            }),
            critical_levels: itemDetails.map((data, index) => {
                return data.critical_level;
            }),
            // current_levels: current_levels.map((data, index) => {
            //     return data;
            // }),
            acceptable_variances: itemDetails.map((data, index) => {
                return data.acceptable_variance;
            }),
            beginning_quantities: itemDetails.map((data, index) => {
                return data.beginning_qty;
            }),
            units: itemDetails.map((data) => {
                return unit;
            }),
        };
        const response = await postAPICall(
            process.env.REACT_POTATO_LINK + "inventories/update_warehouse_inventory",
            payload, "potato"
        );
        console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        //console.log(error);
        return { error: error.response };
    }
};


// export const createItemDetailsPotato = async (item_id,
//     item_unit_id,
//     warehouse_ids,
//     inventory_group,
//     default_item_unit_ids,
//     minimum_levels,
//     maximum_levels,
//     critical_levels,
//     // current_levels,
//     acceptable_variances,
//     beginning_quantities,
//     units ) => {

//     var count = warehouse_ids.filter((val) => {
//         return val!==null;
//     }).length + inventory_group.filter((val) => {
//         return val!==null;
//     }).length
//     console.log(count)
//     console.log(inventory_group)

//     warehouse_ids.splice(count)
//     inventory_group.splice(count)
//     default_item_unit_ids.splice(count)
//     minimum_levels.splice(count)
//     maximum_levels.splice(count)
//     critical_levels.splice(count)
//     // current_levels.splice(count)
//     acceptable_variances.splice(count)
//     beginning_quantities.splice(count)
//     units.splice(count)

//     try {
//         var payload = {
//             requester: getUser(),
//             token: getToken(),
//             item_id: item_id,
//             item_unit_id: item_unit_id,

//             branch_ids: warehouse_ids.map((val, index) => {
//                 return val;
//             }),
//             inventory_group_ids: inventory_group.map((val, index) => {
//                 return val;
//             }),
//             default_item_unit_ids: default_item_unit_ids.map((val, index) => {
//                 return val;
//             }),
//             minimum_levels: minimum_levels.map((val, index) => {
//                 return val;
//             }),
//             maximum_levels: maximum_levels.map((val, index) => {
//                 return val;
//             }),
//             critical_levels: critical_levels.map((val, index) => {
//                 return val;
//             }),
//             // current_levels: current_levels.map((val, index) => {
//             //     return val;
//             // }),
//             acceptable_variances: acceptable_variances.map((val, index) => {
//                 return val;
//             }),
//             beginning_quantities: beginning_quantities.map((val, index) => {
//                 return val;
//             }),
//             units: units.map((unit, index) => {
//                 return unit;
//             }),
//         };
//         const response = await postAPICall(
//             process.env.REACT_POTATO_LINK + "inventories/update_warehouse_inventory",
//             payload, "potato"
//         );
//         //console.log(payload);
//         //console.log(response);
//         return { data: response.data };
//     } catch (error) {
//         //console.log(error);
//         return { error: error.response };
//     }
// };
