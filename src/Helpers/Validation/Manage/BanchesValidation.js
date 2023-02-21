import { handleValidationChange } from "../CommonValidation";

export const validateBranches = (data, setIsError, type) => {
    //Required
    // name: false,
    // address: false,
    // phone_no: false,
    // initial_drawer: false,
    // price_level: false,
    // contact_person: false,
    // contact_person_no: false

    var isValid = true;

    if (data.initial_drawer === "") {
        handleValidationChange("initial_drawer", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("initial_drawer", false, setIsError);
    }

    // if(data.price_level === "") {
    //     handleValidationChange("price_level", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("price_level", false, setIsError);
    // }

    if (data.contact_person === "") {
        handleValidationChange("contact_person", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("contact_person", false, setIsError);
    }

    if (data.contact_person_no === "") {
        handleValidationChange("contact_person_no", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("contact_person_no", false, setIsError);
    }

    if (type !== "POTATO CORNER") {
        if (data.is_franchise === "") {
            //console.log("here 1")
            handleValidationChange("is_franchise", true, setIsError);
            isValid = false;
        } else {
            //console.log("here 2")
            handleValidationChange("is_franchise", false, setIsError);
        }

        if (data.is_franchise === "0" && data.monthly_rental_fee === "") {
            handleValidationChange("monthly_rental_fee", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("monthly_rental_fee", false, setIsError);
        }

        if ((data.is_franchise === "0" || data.is_franchise === "1") && (data.inventory_group_id === "" || data.inventory_group_id === undefined)) {
            handleValidationChange("inventory_group_id", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("inventory_group_id", false, setIsError);
        }
    }

    if (data.is_franchise === "2") {
        isValid = true;
    }

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

    // if (data.opening_date === "") {
    //     handleValidationChange("opening_date", true, setIsError);
    //     isValid = false;
    // } else {
    //     handleValidationChange("opening_date", false, setIsError);
    // }

    return isValid;
};
