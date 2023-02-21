import { handleValidationChange } from "../CommonValidation";

export const validateSePurchaseInvoice = (
    data,
    items,
    setIsError
) => {
    console.log("data", data);
    console.log("items", items);

    var isValid = true;

    if (data.received_date === "") {
        handleValidationChange("received_date", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("received_date", false, setIsError);
    }

    if (
        (data.invoice_no === "" ||
            data.invoice_no === undefined ||
            data.invoice_no === null) &&
        (data.dr_no === "" || data.dr_no === undefined || data.dr_no === null)
    ) {
        handleValidationChange("invoice_no", true, setIsError);
        handleValidationChange("dr_no", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("invoice_no", false, setIsError);
        handleValidationChange("dr_no", false, setIsError);
    }

    if (items.length !== 0) {
        items.map((data) => {
            if (
                data.qtyInput === "" ||
                data.qtyInput === undefined ||
                data.qtyInput === 0
            ) {
                handleValidationChange("qtyInput", true, setIsError);
                isValid = false;
            } else {
                handleValidationChange("qtyInput", false, setIsError);
            }
            if (
                data.price === "" ||
                data.price === undefined ||
                data.price === 0
            ) {
                handleValidationChange("price", true, setIsError);
                isValid = false;
            } else {
                handleValidationChange("price", false, setIsError);
            }
        });
    } else {
        handleValidationChange("received_items_table", true, setIsError);
        isValid = false;
    }

    return isValid;
};
