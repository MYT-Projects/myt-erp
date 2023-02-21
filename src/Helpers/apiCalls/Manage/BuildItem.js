import { dateFormat, formatYDM, getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";
import Moment from "moment";

//GET
export const getAllBuildItem = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "build_items/get_all_build_item",
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

// GET SINGLE
export const getBuildItem = async (id) => {
    //console.log(id);
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "build_items/get_build_item",
            {
                requester: getUser(),
                token: getToken(),
                build_item_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchBuildItem = async (filterConfig) => {
    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            name: filterConfig.name,
            item_id: filterConfig.item_id,
            added_on_from: filterConfig.added_on_from ? Moment(filterConfig.added_on_from).format("YYYY-MM-DD") : "",
            added_on_to: filterConfig.added_on_to ? Moment(filterConfig.added_on_to).format("YYYY-MM-DD") : "",
        };
        //console.log(payload);
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "build_items/search",
            payload
        );
        return { data: response };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createBuildItem = async (
    build,
    branchFrom,
    branch,
    item,
    product,
    qty,
    branchTo
) => {
    var item_ids = [];
    var quantities = [];
    var item_unit_ids = [];
    var units = [];

    product.map((data) => {
        item_ids.push(data.id);
        quantities.push(data.quantity);
        item_unit_ids.push(data.unit);
        units.push(data.unitList.item_units[0].inventory_unit);
    });

    console.log(product);

    try {
        var payload = {
            requester: getUser(),
            token: getToken(),
            from_branch_id: branchFrom,
            to_branch_id: branchTo.split("|")[0],
            item_id: item.id,
            qty: qty,
            item_unit_id: item.item_units[0].id,
            units: units,
            item_ids: item_ids,
            quantities: quantities,
            item_unit_ids: item_unit_ids,
            production_date: formatYDM(build.production_date),
            expiration_date: formatYDM(build.expiration_date),
            batch: build.batch,
            production_slip_no: build.production_slip_no,
            yield: build.yield,
        };
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "build_items/create",
            payload
        );
        //console.log(payload);
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateBuildItem = async (
    id,
    build,
    branchFrom,
    branch,
    item,
    product,
    qty
) => {
    var item_ids = [];
    var quantities = [];
    var item_unit_ids = [];
    var units = [];

    product.map((data) => {
        item_ids.push(data.id);
        quantities.push(data.quantity);
        // item_unit_ids.push(data.unit);
        item_unit_ids.push(data.unitList.item_units[0].id);
        units.push(data.unitList.item_units[0].inventory_unit);
    });

    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "build_items/update",
            {
                requester: getUser(),
                token: getToken(),
                build_item_id: id,
                from_branch_id: branchFrom,
                to_branch_id: branch.id,
                item_id: item.id,
                qty: qty,
                units: units,
                item_unit_id: item.item_units[0].id,
                item_ids: item_ids,
                quantities: quantities,
                item_unit_ids: item_unit_ids,
                production_date: formatYDM(build.production_date),
                expiration_date: formatYDM(build.expiration_date),
                batch: build.batch,
                production_slip_no: build.production_slip_no,
                yield: build.yield,
            }
        );
        //console.log(response);
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteBuildItem = async (id) => {
    //console.log(id);
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "build_items/delete",
            {
                requester: getUser(),
                token: getToken(),
                build_item_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
