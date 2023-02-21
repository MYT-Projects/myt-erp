import { getToken, getUser } from "../Utils/Common"
import { getAPICall, postAPICall } from "./axiosMethodCalls"
import formData from "react-form-data";

//GET
export const getAllEmployees = async () => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "employees/get_all_employee", {
            requester: getUser(),
            token: getToken(),
        })
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const getEmployee = async (id) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "employees/get_employee", {
            requester: getUser(),
            token: getToken(),
            employee_id: id,
        })
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const searchEmployee = async (name) => {
    try {
        const response = await getAPICall(process.env.REACT_APP_LINK + "employees/search", {
            requester: getUser(),
            token: getToken(),
            name: name,
        })
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

//POST
export const createEmployee = async (employee, file) => {
    let form_data = new FormData();
    form_data.append("requester", getUser());
    form_data.append("token", getToken());
    form_data.append("username", employee.username);
    form_data.append("password", employee.password);
    form_data.append("last_name", employee.last_name);
    form_data.append("first_name", employee.first_name);
    form_data.append("middle_name", employee.middle_name);
    form_data.append("suffix", employee.suffix);
    form_data.append("email", employee.email);
    form_data.append("type", employee.type);
    form_data.append("contact_no", employee.contact_no);
    form_data.append("address", employee.address);
    form_data.append("gender", employee.gender);
    form_data.append("birthdate", employee.birthdate);
    form_data.append("civil_status", employee.civil_status);
    form_data.append("nationality", employee.nationality);
    form_data.append("religion", employee.religion);
    form_data.append("remarks", employee.remarks);
    form_data.append("sss", employee.sss);
    form_data.append("hdmf", employee.hdmf);
    form_data.append("philhealth", employee.philhealth);
    form_data.append("employment_status", employee.employment_status);
    form_data.append("salary_type", employee.salary_type);
    form_data.append("salary", employee.salary);
    form_data.append("daily_allowance", employee.daily_allowance);
    form_data.append("communication_allowance", employee.communication_allowance);
    form_data.append("transportation_allowance", employee.transportation_allowance);
    form_data.append("food_allowance", employee.food_allowance);
    form_data.append("hmo_allowance", employee.hmo_allowance);
    form_data.append("tech_allowance", employee.tech_allowance);
    form_data.append("ops_allowance", employee.ops_allowance);
    form_data.append("special_allowance", employee.special_allowance);
    form_data.append("profile_picture", file);

    for (var pair of form_data.entries()) {
        console.log("form data", pair[0]+ ', ' + pair[1]); 
    }

    try {
        const response = await postAPICall(process.env.REACT_APP_LINK + "employees/create", form_data
        // {
        //     requester: getUser(),
        //     token: getToken(),
        //     username: employee.username,
        //     password: employee.password,
        //     last_name: employee.last_name,
        //     first_name: employee.first_name,
        //     middle_name: employee.middle_name,
        //     email: employee.email,
        //     type: employee.type,
            
        //     contact_no: employee.contact_no,
        //     address: employee.address,
        //     gender: employee.gender,
        //     birthdate: employee.birthdate,
        //     civil_status: employee.civil_status,
        //     nationality: employee.nationality,
        //     religion: employee.religion,
        //     remarks: employee.remarks,
        //     sss_no: employee.sss_no,
        //     hdmf_no: employee.hdmf_no,
        //     philhealth_no: employee.philhealth_no,
        //     employment_status: employee.employment_status,
        //     salary_type: employee.salary_type,
        //     salary: employee.salary,
        //     daily_allowance: employee.daily_allowance,
        //     communication_allowance: employee.communication_allowance,
        //     transportation_allowance: employee.transportation_allowance,
        //     food_allowance: employee.food_allowance,
        //     hmo_allowance: employee.hmo_allowance,
        //     tech_allowance: employee.tech_allowance,
        //     ops_allowance: employee.ops_allowance,
        //     special_allowance: employee.special_allowance,
        //     profile_picture: file,

        // }
        )
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const updateEmployee = async (employee, file) => {
    let form_data = new FormData();
    form_data.append("requester", getUser());
    form_data.append("token", getToken());
    form_data.append("employee_id", employee.id);
    form_data.append("username", employee.username);
    form_data.append("password", employee.password);
    form_data.append("last_name", employee.last_name);
    form_data.append("first_name", employee.first_name);
    form_data.append("middle_name", employee.middle_name !== null ? employee.middle_name : "");
    form_data.append("suffix", employee.suffix !== null ? employee.suffix : "");
    form_data.append("email", employee.email);
    form_data.append("type", employee.type);
    form_data.append("contact_no", employee.contact_no);
    form_data.append("address", employee.address);
    form_data.append("gender", employee.gender);
    form_data.append("birthdate", employee.birthdate);
    form_data.append("civil_status", employee.civil_status);
    form_data.append("nationality", employee.nationality);
    form_data.append("religion", employee.religion);
    form_data.append("remarks", employee.remarks);
    form_data.append("sss", employee.sss);
    form_data.append("hdmf", employee.hdmf);
    form_data.append("philhealth", employee.philhealth);
    form_data.append("employment_status", employee.employment_status);
    form_data.append("salary_type", employee.salary_type);
    form_data.append("salary", employee.salary);
    form_data.append("daily_allowance", employee.daily_allowance);
    form_data.append("communication_allowance", employee.communication_allowance);
    form_data.append("transportation_allowance", employee.transportation_allowance);
    form_data.append("food_allowance", employee.food_allowance);
    form_data.append("hmo_allowance", employee.hmo_allowance);
    form_data.append("tech_allowance", employee.tech_allowance);
    form_data.append("ops_allowance", employee.ops_allowance);
    form_data.append("special_allowance", employee.special_allowance);
    file.name !== undefined && (
        form_data.append("profile_picture", file)
        // form_data.append("profile_picture", file.name !== undefined ? file : employee.profile_picture);
    )

    for (var pair of form_data.entries()) {
        console.log("form data", pair[0]+ ', ' + pair[1]); 
    }
    try {
        const response = await postAPICall(process.env.REACT_APP_LINK + "employees/update", form_data
        // {
        //     requester: getUser(),
        //     token: getToken(),
        //     employee_id: employee.id,
        //     username: employee.username,
        //     password: employee.password_reset,
        //     last_name: employee.last_name,
        //     first_name: employee.first_name,
        //     middle_name: employee.middle_name,
        //     email: employee.email,
        //     type: employee.type,
        //     status: employee.status,

        //     contact_no: employee.contact_no,
        //     address: employee.address,
        //     gender: employee.gender,
        //     birthdate: employee.birthdate,
        //     civil_status: employee.civil_status,
        //     nationality: employee.nationality,
        //     religion: employee.religion,
        //     remarks: employee.remarks,
        //     sss_no: employee.sss_no,
        //     hdmf_no: employee.hdmf_no,
        //     philhealth_no: employee.philhealth_no,
        //     employment_status: employee.employment_status,
        //     salary_type: employee.salary_type,
        //     salary: employee.salary,
        //     daily_allowance: employee.daily_allowance,
        //     communication_allowance: employee.communication_allowance,
        //     transportation_allowance: employee.transportation_allowance,
        //     food_allowance: employee.food_allowance,
        //     hmo_allowance: employee.hmo_allowance,
        //     tech_allowance: employee.tech_allowance,
        //     ops_allowance: employee.ops_allowance,
        //     special_allowance: employee.special_allowance,
        //     profile_picture: file,
        // }
        )
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}

export const deleteEmployee = async (id) => {
    try {
        const response = await postAPICall(process.env.REACT_APP_LINK + "employees/delete", {
            requester: getUser(),
            token: getToken(),
            employee_id: id
        })
        return { data: response.data }
    } catch (error) {
        return { error: error.response }
    }
}