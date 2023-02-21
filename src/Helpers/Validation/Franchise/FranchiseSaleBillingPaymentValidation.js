import {handleValidationChange} from '../CommonValidation';

export const validateFranchiseSaleBilling = (data, setIsError) => {
    //Required 
    /**
     *  franchised_on: "",
        branch_id: "",
        name: "",
        opening_start: "",
        contact_person: "",
        contact_no: "",
        franchise_fee: 0,
        marketing_fee: 0,
        amount: "",
        payment_method: "",
        payment_date: "",
     */

    var isValid = true;

    if(data.payment_type === "") {
        handleValidationChange("payment_type", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("payment_type", false, setIsError);
    }

    // if(data.paid_amount === "") {
    //     handleValidationChange("paid_amount", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("paid_amount", false, setIsError);
    // }

    if(data.payment_type === "check" && data.bank_name === "" || data.bank_name === undefined) {
        handleValidationChange("bank_name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("bank_name", false, setIsError);
    }

    if((data.payment_type === "check" && data.payment_type !== "cash" && data.payment_type !== "others") && data.cheque_number === "" || data.cheque_number === undefined) {
        handleValidationChange("cheque_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("cheque_number", false, setIsError);
    }

    if((data.payment_type === "check" && data.payment_type !== "cash" && data.payment_type !== "others") && data.cheque_date === "" || data.cheque_date === undefined) {
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

    if(data.to_bank_id === "" || data.to_bank_id === undefined) {
        handleValidationChange("to_bank_id", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("to_bank_id", false, setIsError);
    }


    return isValid
  
}