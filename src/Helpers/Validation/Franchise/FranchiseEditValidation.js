import {handleValidationChange} from '../CommonValidation';

export const validateFranchiseEdit = (data, setIsError) => {
    //Required 
    /**
     *  franchised_on: "",
        branch_id: "",
        name: "",
        opening_start: "",
        contact_person: "",
        contact_no: "",
     */

    var isValid = true;

    if(data.franchised_on === "") {
        handleValidationChange("franchised_on", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("franchised_on", false, setIsError);
    }


    if(data.branch_id === "") {
        handleValidationChange("branch_id", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("branch_id", false, setIsError);
    }


    if(data.name === "") {
        handleValidationChange("name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("name", false, setIsError);
    }


    // if(data.opening_start === "") {
    //     handleValidationChange("opening_start", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("opening_start", false, setIsError);
    // }

    if(data.contact_person === "") {
        handleValidationChange("contact_person", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("contact_person", false, setIsError);
    }

    if(data.contact_number === "") {
        handleValidationChange("contact_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("contact_number", false, setIsError);
    }

    return isValid
  
}