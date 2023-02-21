import {handleValidationChange} from '../CommonValidation';

export const validateFranchiseSalePayment = (data, setIsError) => {
    
    var isValid = true;

    if(data.payment_type === "") {
        handleValidationChange("payment_type", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("payment_type", false, setIsError);
    }

    if(data.paid_amount === "") {
        handleValidationChange("paid_amount", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("paid_amount", false, setIsError);
    }

    if(data.payment_type === "check" && data.bank_id === "" || data.bank_id === undefined) {
        handleValidationChange("bank_id", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("bank_id", false, setIsError);
    }

    if(data.payment_type === "check" && data.payment_type !== "cash" && data.payment_type !== "others" && data.cheque_number === "" || data.cheque_number === undefined) {
        handleValidationChange("cheque_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("cheque_number", false, setIsError);
    }

    if(data.payment_type === "check" && data.payment_type !== "cash" && data.payment_type !== "others" && data.cheque_date === "" || data.cheque_date === undefined) {
        handleValidationChange("cheque_date", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("cheque_date", false, setIsError);
    }

    if(data.payment_type === "others" && data.reference_number === "" || data.reference_number === undefined) {
        handleValidationChange("reference_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("reference_number", false, setIsError);
    }

    if(data.payment_date === "") {
        handleValidationChange("payment_date", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("payment_date", false, setIsError);
    }


    return isValid
  
}