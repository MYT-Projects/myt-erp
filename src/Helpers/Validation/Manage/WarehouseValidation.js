import { handleValidationChange } from "../CommonValidation";

export const validateWarehouse = (data, setIsError, type) => {
    //Required
    // name: false,
    // address: false,
    // phone_no: false,
    // initial_drawer: false,
    // price_level: false,
    // contact_person: false,
    // contact_person_no: false

    var isValid = true;
    
    if (data.name === "") {
        handleValidationChange("name", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("name", false, setIsError);
    }

    if (data.address === "") {
        handleValidationChange("address", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("address", false, setIsError);
    }

    if (data.phone_no === "") {
        handleValidationChange("phone_no", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("phone_no", false, setIsError);
    }

    return isValid;
};
