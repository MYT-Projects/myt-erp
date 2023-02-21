import {handleValidationChange} from '../CommonValidation';

export const validateBanks = (data, setIsError) => {
    //Required 
    // bank_name: "",

    var isValid = true;

    if(data.bank_name === "") {
        handleValidationChange("bank_name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("bank_name", false, setIsError);
    }
    
    if(data.check_template_id === "") {
        handleValidationChange("check_template_id", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("check_template_id", false, setIsError);
    }

    return isValid
  
}