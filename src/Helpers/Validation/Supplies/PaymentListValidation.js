import { handleValidationChange } from "../CommonValidation";

export const validatePaymentListCash = (data, items, setIsError) => {
    //Required
    // name: "",
    // list: false,
    // listInfo: false,
    // list must be equal or greater than one
    // all fields must be filled out in list

    var isValid = true;

    if (data.supplier_id === "" && data.vendor_id === "") {
        handleValidationChange("supplier_id", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("supplier_id", false, setIsError);
    }

    if (data.payment_date === "" || data.payment_date === undefined) {
        handleValidationChange("payment_date", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("payment_date", false, setIsError);
    }

    if (data.payee === "" || data.payee === undefined) {
        handleValidationChange("payee", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("payee", false, setIsError);
    }

    if (data.acknowledged_by === "" || data.acknowledged_by === undefined) {
        handleValidationChange("acknowledged_by", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("acknowledged_by", false, setIsError);
    }

    if (items.length < 1) {
        handleValidationChange("list", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("list", false, setIsError);
    }

    items?.map((data) => {
        //console.log(data)
        if (
            data.amount === "" ||
            data.amount === undefined ||
            data.amount === 0
        ) {
            handleValidationChange("listInfo", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("listInfo", false, setIsError);
        }
        // if(type === "edit") {
        //     if(data.entry.value === "" || data.entry.value === undefined) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }

        //     if(data.amount === "" || data.amount === undefined || data.amount === 0) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }
        // } else {
        //     if(data.se_ids === "" || data.se_ids === undefined) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }

        //     if(data.amount === "" || data.amount === undefined || data.amount === 0) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }
        // }
    });

    return isValid;
};

export const validatePaymentListCheck = (data, items, setIsError) => {
    //Required
    // name: "",
    // list: false,
    // listInfo: false,
    // list must be equal or greater than one
    // all fields must be filled out in list

    //console.log(data)
    var isValid = true;

    if (data.supplier_id === ""  && data.vendor_id === "") {
        handleValidationChange("supplier_id", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("supplier_id", false, setIsError);
    }

    if (data.bank_id === "" || data.bank_id === undefined) {
        handleValidationChange("bank_id", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("bank_id", false, setIsError);
    }

    if (data.check_no === "" || data.check_no === undefined) {
        handleValidationChange("check_no", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("check_no", false, setIsError);
    }

    if (data.check_date === "" || data.check_date === undefined) {
        handleValidationChange("check_date", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("check_date", false, setIsError);
    }

    if (data.issued_date === "" || data.issued_date === undefined) {
        handleValidationChange("issued_date", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("issued_date", false, setIsError);
    }

    if (data.payee === "" || data.payee === undefined) {
        handleValidationChange("payee", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("payee", false, setIsError);
    }

    if (data.acknowledged_by === "" || data.acknowledged_by === undefined) {
        handleValidationChange("acknowledged_by", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("acknowledged_by", false, setIsError);
    }

    if (items.length < 1) {
        handleValidationChange("list", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("list", false, setIsError);
    }

    items?.map((data) => {
        //console.log(data)
        if (
            data.amount === "" ||
            data.amount === undefined ||
            data.amount === 0
        ) {
            handleValidationChange("listInfo", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("listInfo", false, setIsError);
        }
        // if(type === "edit") {
        //     if(data.entry.value === "" || data.entry.value === undefined) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }

        //     if(data.amount === "" || data.amount === undefined || data.amount === 0) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }
        // } else {
        //     if(data.se_ids === "" || data.se_ids === undefined) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }

        //     if(data.amount === "" || data.amount === undefined || data.amount === 0) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }
        // }
    });

    return isValid;
};

export const validatePaymentListBank = (data, items, setIsError) => {
    //Required
    // name: "",
    // list: false,
    // listInfo: false,
    // list must be equal or greater than one
    // all fields must be filled out in list

    console.log('data', data)
    console.log('items', items)
    var isValid = true;

    if (data.bank_from === "" || data.bank_from === undefined) {
        handleValidationChange("bank_from", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("bank_from", false, setIsError);
    }

    if (data.payment_date === "" || data.payment_date === undefined) {
        handleValidationChange("payment_date", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("payment_date", false, setIsError);
    }

    if (data.reference_no === "" || data.reference_no === undefined) {
        handleValidationChange("reference_no", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("reference_no", false, setIsError);
    }

    if (data.from_account_no === "" || data.from_account_no === undefined) {
        handleValidationChange("from_account_no", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("from_account_no", false, setIsError);
    }

    if (data.from_account_name === "" || data.from_account_name === undefined) {
        handleValidationChange("from_account_name", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("from_account_name", false, setIsError);
    }

    // if (data.supplier_id === "" || data.supplier_id === undefined) {
    //     handleValidationChange("supplier_id", true, setIsError);
    //     isValid = false;
    // } else {
    //     handleValidationChange("supplier_id", false, setIsError);
    // }

    if (data.supplier_id === "") {
        if (data.vendor_id === "") {
            handleValidationChange("supplier_id", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("supplier_id", false, setIsError);
        }
    } else {
            handleValidationChange("supplier_id", false, setIsError);
        }

    if (data.payee === "" || data.payee === undefined) {
        handleValidationChange("payee", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("payee", false, setIsError);
    }

    if (data.bank_to === "" || data.bank_to === undefined) {
        handleValidationChange("bank_to", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("bank_to", false, setIsError);
    }

    if (data.to_account_no === "" || data.to_account_no === undefined) {
        handleValidationChange("to_account_no", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("to_account_no", false, setIsError);
    }

    if (data.to_account_name === "" || data.to_account_name === undefined) {
        handleValidationChange("to_account_name", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("to_account_name", false, setIsError);
    }

    if (data.acknowledged_by === "" || data.acknowledged_by === undefined) {
        handleValidationChange("acknowledged_by", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("acknowledged_by", false, setIsError);
    }

    if (items.length < 1) {
        handleValidationChange("list", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("list", false, setIsError);
    }

    items?.map((data) => {
        //console.log(data)
        if (
            data.amount === "" ||
            data.amount === undefined ||
            data.amount === 0
        ) {
            handleValidationChange("listInfo", true, setIsError);
            isValid = false;
        } else {
            handleValidationChange("listInfo", false, setIsError);
        }
        // if(type === "edit") {
        //     if(data.entry.value === "" || data.entry.value === undefined) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }

        //     if(data.amount === "" || data.amount === undefined || data.amount === 0) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }
        // } else {
        //     if(data.se_ids === "" || data.se_ids === undefined) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }

        //     if(data.amount === "" || data.amount === undefined || data.amount === 0) {
        //         handleValidationChange("listInfo", true, setIsError);
        //         isValid=false;
        //     } else {
        //         handleValidationChange("listInfo", false, setIsError);
        //     }
        // }
    });

    return isValid;
};
