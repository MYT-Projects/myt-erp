import { getToken, getUser } from "../../Utils/Common";
import { getAPICall, postAPICall } from "../axiosMethodCalls";

//GET
export const getAllCheckTemplates = async () => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK +
                "check_templates/get_all_check_template",
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
export const getCheckTemplate = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "checks_templates/get_check_template",
            {
                requester: getUser(),
                token: getToken(),
                check_template_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const searchCheckTemplate = async (name) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "check_templates/search",
            {
                requester: getUser(),
                token: getToken(),
                name: name,
            }
        );
        return { data: response };
    } catch (error) {
        return { error: error.response };
    }
};

//POST
export const createCheckTemplate = async (data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "check_templates/create",
            {
                requester: getUser(),
                token: getToken(),
                name: data.name,
                file_name: data.file_name,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};

export const updateBank = async (data) => {
    try {
        const response = await postAPICall(
            process.env.REACT_APP_LINK + "check_templates/update",
            {
                requester: getUser(),
                token: getToken(),
                check_template_id: data.id,
                name: data.name,
                file_name: data.file_name,
            }
        );
        return { data: response };
    } catch (error) {
        return { error: error.response };
    }
};

export const deleteCheckTemplate = async (id) => {
    try {
        const response = await getAPICall(
            process.env.REACT_APP_LINK + "check_templates/delete",
            {
                requester: getUser(),
                token: getToken(),
                check_template_id: id,
            }
        );
        return { data: response.data };
    } catch (error) {
        return { error: error.response };
    }
};
