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

    if(data.beginning_credit_limit === "") {
        handleValidationChange("beginning_credit_limit", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("beginning_credit_limit", false, setIsError);
    }

    if(data.contract_start === "") {
        handleValidationChange("contract_start", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("contract_start", false, setIsError);
    }

    if(data.contract_end === "") {
        handleValidationChange("contract_end", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("contract_end", false, setIsError);
    }

    if(data.franchisee_fee === "") {
        handleValidationChange("franchisee_fee", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("franchisee_fee", false, setIsError);
    }

    if(data.package_fee === "") {
        handleValidationChange("package_fee", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("package_fee", false, setIsError);
    }

    // if(data.royalty_fee === "") {
    //     handleValidationChange("royalty_fee", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("royalty_fee", false, setIsError);
    // }

    // if(data.amount === "") {
    //     handleValidationChange("amount", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("amount", false, setIsError);
    // }

    // if(data.payment_method === "") {
    //     handleValidationChange("payment_method", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("payment_method", false, setIsError);
    // }

    // if(data.payment_method === "check" && data.bank_name === "") {
    //     handleValidationChange("bank_name", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("bank_name", false, setIsError);
    // }

    // // if(data.payment_method === "check" && data.from_bank_id === "") {
    // //     handleValidationChange("from_bank_id", true, setIsError);
    // //     isValid=false;
    // // } else {
    // //     handleValidationChange("from_bank_id", false, setIsError);
    // // }

    // if(data.payment_method === "check" && data.cheque_number === "") {
    //     handleValidationChange("cheque_number", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("cheque_number", false, setIsError);
    // }

    // if(data.payment_method === "check" && data.cheque_date === "") {
    //     handleValidationChange("cheque_date", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("cheque_date", false, setIsError);
    // }

    // if(data.payment_method === "others" && data.reference_number === "") {
    //     handleValidationChange("reference_number", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("reference_number", false, setIsError);
    // }

    

    // if(data.payment_date === "") {
    //     handleValidationChange("payment_date", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("payment_date", false, setIsError);
    // }

    // if(data.invoice_no === "") {
    //     handleValidationChange("invoice_no", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("invoice_no", false, setIsError);
    // }


    return isValid
  
}