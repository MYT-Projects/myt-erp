import {handleValidationChange} from '../CommonValidation';

export const validateAddSO= (data, setIsError) => {

    var isValid = true;
    var isValidSupplier = true;
    var isValidPurchaseDate = true;
    var isValidDeliveryDate = true;
    var isValidRequisitioner = true;
    var isValidDeliveryAddress = true;
    var isValidType = true;

   
    if(data.supplier_id === ""  && data.vendor_id === "") {
        handleValidationChange("supplierName", true, setIsError);
        isValidSupplier = false;
    } else {
        handleValidationChange("supplierName", false, setIsError);
        isValidSupplier = true;
    }

    // if(data.branch_id === "" || data.branch_id === undefined) {
    //     handleValidationChange("branch_id", true, setIsError);
    //     isValidSupplier = false;
    // } else {
    //     handleValidationChange("branch_id", false, setIsError);
    //     isValidSupplier = true;
    // }

    if(data.supplies_expense_date === "" || data.supplies_expense_date === undefined || data.supplies_expense_date === "Invalid Date") {
        handleValidationChange("purchaseDate", true, setIsError);
        isValidPurchaseDate = false;
    } else {
        handleValidationChange("purchaseDate", false, setIsError);
        isValidPurchaseDate = true;
    }

    if(data.delivery_date === "" || data.delivery_date === undefined || data.purchase_date === "Invalid Date") {
        handleValidationChange("deliveryDate", true, setIsError);
        isValidDeliveryDate = false;
    } else {
        handleValidationChange("deliveryDate", false, setIsError);
        isValidDeliveryDate = true;
    }

    if(data.requisitioner === "" || data.requisitioner === undefined) {
        handleValidationChange("requisitioner", true, setIsError);
        isValidRequisitioner = false;
    } else {
        handleValidationChange("requisitioner", false, setIsError);
        isValidRequisitioner = true;
    }

    if(data.type === "" || data.type === undefined) {
        handleValidationChange("type", true, setIsError);
        isValidType = false;
    } else {
        handleValidationChange("type", false, setIsError);
        isValidType = true;
    }

    if(data.delivery_address === "" || data.delivery_address === undefined) {
        handleValidationChange("deliveryAddress", true, setIsError);
        isValidDeliveryAddress = false;
    } else {
        handleValidationChange("deliveryAddress", false, setIsError);
        isValidDeliveryAddress = true;
    }

    isValid = isValidSupplier && isValidPurchaseDate && isValidDeliveryDate && isValidRequisitioner && isValidDeliveryAddress && isValidType

    return isValid
  
}