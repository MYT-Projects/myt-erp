import { handleValidationChange } from "../CommonValidation";

export const validateBuildItem = (qty, branch_from, products, setIsError) => {
    //Required
    /*
        branch_from: false,
        qty: false,
        ingredients: false
    */
    var isValid = true;

    console.log(branch_from);

    if (branch_from === "") {
        handleValidationChange("branch_from", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("branch_from", false, setIsError);
    }

    if (qty === "") {
        handleValidationChange("qty", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("qty", false, setIsError);
    }

    if (products.length < 1) {
        handleValidationChange("ingredients", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("ingredients", false, setIsError);
    }

    products.map((data) => {
        if (data.id === "") {
            handleValidationChange("ingredients", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("ingredients", false, setIsError);
        }

        if (data.quantity === "") {
            handleValidationChange("ingredients", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("ingredients", false, setIsError);
        }

        if (data.unit === "") {
            //console.log('unit is empty string')
            handleValidationChange("ingredients", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("ingredients", false, setIsError);
        }
    });

    return isValid;
};
