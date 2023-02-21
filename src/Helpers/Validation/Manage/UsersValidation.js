import { handleValidationChange } from "../CommonValidation";

export const validateUsers = (data, setIsError) => {
    //Required
    // first_name: "",
    // middle_name: "",
    // last_name: "",
    // role: "",
    // user_type: "",
    // username: "",
    // password: "",
    // branches: "",

    var isValid = true;
    var isValidFirstName = true;
    var isValidLastName = true;
    var isValidUsername = true;
    var isValidPassword = true;
    var isValidType = true;
    var isValidConfirmPassword = true;

    if (data.first_name === "") {
        handleValidationChange("first_name", true, setIsError);
        isValidFirstName = false;
    } else {
        handleValidationChange("first_name", false, setIsError);
        isValidFirstName = true;
    }

    // if(data.middle_name === "") {
    //     handleValidationChange("middle_name", true, setIsError);
    //     isValid = true;
    // } else {
    //     handleValidationChange("middle_name", false, setIsError);
    // }

    if (data.last_name === "") {
        handleValidationChange("last_name", true, setIsError);
        isValidLastName = false;
    } else {
        handleValidationChange("last_name", false, setIsError);
        isValidLastName = true;
    }

    if (data.type === "") {
        handleValidationChange("type", true, setIsError);
        isValidType = false;
    } else {
        handleValidationChange("type", false, setIsError);
        isValidType = true;
    }

    // //console.log(data.role)
    // //console.log(branches)
    // if(data.type === "3" && branches.length === 0) {
    //     // //console.log("is error")
    //     handleValidationChange("branches", true, setIsError);
    //     isValid = false;
    // } else {
    //     // //console.log("is not error")
    //     // //console.log(data.role)
    //     handleValidationChange("branches", false, setIsError);
    // }

    // if(data.user_type === "") {
    //     handleValidationChange("user_type", true, setIsError);
    //     isValid = false;
    // } else {
    //     handleValidationChange("user_type", false, setIsError);
    // }

    if (data.username === "") {
        handleValidationChange("username", true, setIsError);
        isValidUsername = false;
    } else {
        handleValidationChange("username", false, setIsError);
        isValidUsername = true;
    }

    // if (data.password === "") {
    //     handleValidationChange("password", true, setIsError);
    //     isValidPassword = false;
    // } else {
    //     handleValidationChange("password", false, setIsError);
    //     isValidPassword = true;
    // }

    if (data.confirm_password === "") {
        handleValidationChange("confirm_password", true, setIsError);
        isValidConfirmPassword = false;
    } else {
        handleValidationChange("confirm_password", false, setIsError);
        isValidConfirmPassword = true;
    }

    isValid =
        isValidFirstName &&
        isValidLastName &&
        isValidType &&
        isValidUsername &&
        isValidPassword &&
        isValidConfirmPassword;

    return isValid;
};
