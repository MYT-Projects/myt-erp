import { handleValidationChange } from "../CommonValidation";

export const validateAddPO = (data, items, setIsError) => {
    var isValid = true;
    var isValidSupplier = true;
    var isValidPurchaseDate = true;
    var isValidDeliveryDate = true;
    var isValidRequisitioner = true;
    var isValidDeliveryAddress = true;
    var isValidAmount = true;

    if (data.supplier_id === "" && data.vendor_id === "") {
        handleValidationChange("supplierName", true, setIsError);
        isValidSupplier = false;
    } else {
        handleValidationChange("supplierName", false, setIsError);
        isValidSupplier = true;
    }

    if (
        data.purchase_date === "" ||
        data.purchase_date === undefined ||
        data.purchase_date === "Invalid Date"
    ) {
        handleValidationChange("purchaseDate", true, setIsError);
        isValidPurchaseDate = false;
    } else {
        handleValidationChange("purchaseDate", false, setIsError);
        isValidPurchaseDate = true;
    }

    if (
        data.delivery_date === "" ||
        data.delivery_date === undefined ||
        data.purchase_date === "Invalid Date"
    ) {
        handleValidationChange("deliveryDate", true, setIsError);
        isValidDeliveryDate = false;
    } else {
        handleValidationChange("deliveryDate", false, setIsError);
        isValidDeliveryDate = true;
    }

    if (data.requisitioner === "" || data.requisitioner === undefined) {
        handleValidationChange("requisitioner", true, setIsError);
        isValidRequisitioner = false;
    } else {
        handleValidationChange("requisitioner", false, setIsError);
        isValidRequisitioner = true;
    }

    // if(data.location === "" || data.location === undefined) {
    //     handleValidationChange("deliveryAddress", true, setIsError);
    //     isValidDeliveryAddress = false;
    // } else {
    //     handleValidationChange("deliveryAddress", false, setIsError);
    //     isValidDeliveryAddress = true;
    // }

    if (data.delivery_address === "" || data.delivery_address === undefined) {
        handleValidationChange("deliveryAddress", true, setIsError);
        isValidDeliveryAddress = false;
    } else {
        handleValidationChange("deliveryAddress", false, setIsError);
        isValidDeliveryAddress = true;
    }

    items?.map((data) => {
        //console.log(data)
        if (data.price === "" || data.price === undefined || data.price === 0) {
            handleValidationChange("price", true, setIsError);
            isValidAmount = false;
        } else {
            handleValidationChange("price", false, setIsError);
            isValidAmount = true;
        }
    });

    isValid =
        isValidSupplier &&
        isValidPurchaseDate &&
        isValidDeliveryDate &&
        isValidRequisitioner &&
        isValidDeliveryAddress;

    return isValid;
};


export const validatePoPayment = (data, setIsError) => {
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

    if(data.amount === "") {
        handleValidationChange("amount", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("amount", false, setIsError);
    }

    if(data.payment_method === "") {
        handleValidationChange("payment_method", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("payment_method", false, setIsError);
    }

    if(data.payment_method === "check" && data.bank_name === "") {
        handleValidationChange("bank_name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("bank_name", false, setIsError);
    }

    // if(data.payment_method === "check" && data.from_bank_id === "") {
    //     handleValidationChange("from_bank_id", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("from_bank_id", false, setIsError);
    // }

    if(data.payment_method === "check" && data.cheque_number === "") {
        handleValidationChange("cheque_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("cheque_number", false, setIsError);
    }

    if(data.payment_method === "check" && data.cheque_date === "") {
        handleValidationChange("cheque_date", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("cheque_date", false, setIsError);
    }

    if(data.payment_method === "others" && data.reference_number === "") {
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