import { handleValidationChange } from "../CommonValidation";

export const validateEmployees = (data, setIsError) => {
    //Required
    // first_name: "",
    // middle_name: "",
    // last_name: "",
    // username: "",
    // password: "",
    //email:"",

    var isValid = true;
    var isValidFirstName = true;
    var isValidLastName = true;
    var isValidUsername = true;
    var isValidPassword = true;
    var isValidConfirmPassword = true;
    var isValidEmail = true;
    var isContactNumber = true;
    var isAddress = true;
    var isGender = true;
    var isBirthdate = true;
    var isCivilStatus = true;
    var isNationality = true;
    var isReligion = true;
    var isEmploymentStatus = true;
    var isSalaryType = true;
    var isSalary = true;

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
    if (data.email === "") {
        handleValidationChange("email", true, setIsError);
        isValidEmail = false;
    } else {
        handleValidationChange("email", false, setIsError);
        isValidEmail = true;
    }

    if (data.password === "") {
        handleValidationChange("password", true, setIsError);
        isValidPassword = false;
    } else {
        handleValidationChange("password", false, setIsError);
        isValidPassword = true;
    }

    if (data.confirm_password === "") {
        handleValidationChange("confirm_password", true, setIsError);
        isValidConfirmPassword = false;
    } else {
        handleValidationChange("confirm_password", false, setIsError);
        isValidConfirmPassword = true;
    }

    if (data.contact_no === "") {
        handleValidationChange("contact_no", true, setIsError);
        isContactNumber = false;
    } else {
        handleValidationChange("contact_no", false, setIsError);
        isContactNumber = true;
    }

    if (data.address === "") {
        handleValidationChange("address", true, setIsError);
        isAddress = false;
    } else {
        handleValidationChange("address", false, setIsError);
        isAddress = true;
    }

    if (data.gender === "") {
        handleValidationChange("gender", true, setIsError);
        isGender = false;
    } else {
        handleValidationChange("gender", false, setIsError);
        isGender = true;
    }

    if (data.birthdate === "") {
        handleValidationChange("birthdate", true, setIsError);
        isBirthdate = false;
    } else {
        handleValidationChange("birthdate", false, setIsError);
        isBirthdate = true;
    }

    if (data.civil_status === "") {
        handleValidationChange("civil_status", true, setIsError);
        isCivilStatus = false;
    } else {
        handleValidationChange("civil_status", false, setIsError);
        isCivilStatus = true;
    }

    if (data.nationality === "") {
        handleValidationChange("nationality", true, setIsError);
        isNationality = false;
    } else {
        handleValidationChange("nationality", false, setIsError);
        isNationality = true;
    }

    if (data.religion === "") {
        handleValidationChange("religion", true, setIsError);
        isReligion = false;
    } else {
        handleValidationChange("religion", false, setIsError);
        isReligion = true;
    }

    if (data.employment_status === "") {
        handleValidationChange("employment_status", true, setIsError);
        isEmploymentStatus = false;
    } else {
        handleValidationChange("employment_status", false, setIsError);
        isEmploymentStatus = true;
    }

    if (data.salary_type === "") {
        handleValidationChange("salary_type", true, setIsError);
        isSalaryType = false;
    } else {
        handleValidationChange("salary_type", false, setIsError);
        isSalaryType = true;
    }

    if (data.salary === "") {
        handleValidationChange("salary", true, setIsError);
        isSalary = false;
    } else {
        handleValidationChange("salary", false, setIsError);
        isSalary = true;
    }



    isValid =
        isValidFirstName &&
        isValidLastName &&
        isValidUsername &&
        isValidPassword &&
        isValidConfirmPassword &&
        isContactNumber &&
        isAddress &&
        isGender &&
        isBirthdate &&
        isCivilStatus &&
        isNationality &&
        isReligion &&
        isEmploymentStatus &&
        isSalaryType &&
        isSalary &&
        isValidEmail;

    return isValid;
};
