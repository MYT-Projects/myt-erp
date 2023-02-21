import {handleValidationChange} from '../CommonValidation';

export const validatePriceLevel = (data, setIsError) => {
    //Required 
    // name: "",

    var isValid = true;

    if(data.name === "") {
        handleValidationChange("name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("name", false, setIsError);
    }
    

    return isValid
  
}