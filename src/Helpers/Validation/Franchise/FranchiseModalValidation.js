import {handleValidationChange} from '../CommonValidation';

export const validateFranchise = (data, setIsError) => {
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
    console.log(data.payment_type)

    if(data.payment_type === "") {
        handleValidationChange("payment_type", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("payment_type", false, setIsError);
    }

    if(data.payment_type === "check" && data.bank_name === "") {
        handleValidationChange("bank_name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("bank_name", false, setIsError);
    }

    if(data.to_bank_id === "" || data.to_bank_id === undefined) {
        handleValidationChange("to_bank_id", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("to_bank_id", false, setIsError);
    }

    // if(data.payment_method === "check" && data.from_bank_id === "") {
    //     handleValidationChange("from_bank_id", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("from_bank_id", false, setIsError);
    // }

    if(data.payment_type === "check" && (data.cheque_number === "" || data.cheque_number === undefined)) {
        handleValidationChange("cheque_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("cheque_number", false, setIsError);
    }

    if(data.payment_type === "check" && (data.cheque_date === "" || data.cheque_date === undefined)) {
        handleValidationChange("cheque_date", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("cheque_date", false, setIsError);
    }

    if(data.payment_type === "others" && (data.reference_number === "" || data.reference_number === undefined)) {
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

    if(data.invoice_no === "" || data.invoice_no === undefined ) {
        handleValidationChange("invoice_no", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("invoice_no", false, setIsError);
    }


    return isValid
  
}