import {handleValidationChange} from '../CommonValidation';

export const validateForwarders= (data, setIsError) => {

    var isValid = true;
    var isValidName = true;
    var isValidAddress = true;
    var isValidPhoneNumber = true;


    if(data.address === "") {
        handleValidationChange("address", true, setIsError);
        isValidAddress = false;
    } else {
        handleValidationChange("address", false, setIsError);
        isValidAddress = true;
    }

    
   if(data.name === "") {
        handleValidationChange("name", true, setIsError);
        isValidName = false;
    } else {
        handleValidationChange("name", false, setIsError);
        isValidName = true;
    }


    if(data.phone_number === "") {
        handleValidationChange("phone_number", true, setIsError);
        isValidPhoneNumber = false;
    } else {
        handleValidationChange("phone_number", false, setIsError);
        isValidPhoneNumber = true;
    }

    



    isValid = isValidName   && isValidPhoneNumber && isValidAddress



    return isValid
  
}