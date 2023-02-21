import {handleValidationChange} from '../CommonValidation';

export const validateSuppliers = (data, setIsError) => {
    //Required 
    // bir_name: false,
    // trade_name: false,
    // trade_address: false,
    // tin: false,
    // contact_person: false,
    // phone_no: false, 
    // payee: false,

    var isValid = true;

    // if(data.bir_name === "" || data.bir_name === null) {
    //     handleValidationChange("bir_name", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("bir_name", false, setIsError);
    // }

    if(data.trade_name === "" || data.trade_name === null) {
        handleValidationChange("trade_name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("trade_name", false, setIsError);
    }

    if(data.trade_address === "" || data.trade_address === null) {
        handleValidationChange("trade_address", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("trade_address", false, setIsError);
    }

    // if(data.tin === "" || data.tin === null) {
    //     handleValidationChange("tin", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("tin", false, setIsError);
    // }

    if(data.contact_person === "" || data.contact_person === null) {
        handleValidationChange("contact_person", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("contact_person", false, setIsError);
    }

    if(data.phone_no === "" || data.phone_no === null) {
        handleValidationChange("phone_no", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("phone_no", false, setIsError);
    }

    if(data.payee === "" || data.payee === null) {
        handleValidationChange("payee", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("payee", false, setIsError);
    }


    return isValid
  
}
