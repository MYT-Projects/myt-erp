import { handleValidationChange } from "../CommonValidation";

export const validateFranchiseSale = (data, items, items2, setIsError) => {
    //console.log(items)
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

    if (data.franchisee_id === "") {
        handleValidationChange("franchisee_id", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("franchisee_id", false, setIsError);
    }

    if (data.delivery_address === "") {
        handleValidationChange("delivery_address", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("delivery_address", false, setIsError);
    }

    if (data.delivery_date === "") {
        handleValidationChange("delivery_date", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("delivery_date", false, setIsError);
    }

    // if (data.seller_branch_id === "") {
    //     handleValidationChange("seller_branch_id", true, setIsError);
    //     isValid = false;
    // } else {
    //     handleValidationChange("seller_branch_id", false, setIsError);
    // }

    // if(data.sales_invoice_no === "") {
    //     handleValidationChange("sales_invoice_no", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("sales_invoice_no", false, setIsError);
    // }

    if (items.length < 1 && items2.length < 1) {
        handleValidationChange("list", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("list", false, setIsError);
    }

    // if (items2.length < 1) {
    //     handleValidationChange("list2", true, setIsError);
    //     isValid = false;
    // } else {
    //     handleValidationChange("list2", false, setIsError);
    // }

    // items?.map((data) => {
    //     //console.log(data)
    //     if (
    //         data.item_id === "" ||
    //         data.item_id === undefined ||
    //         data.qty === "" ||
    //         data.qty === undefined ||
    //         data.qty === "0" ||
    //         data.qty === 0
    //     ) {
    //         handleValidationChange("listInfo", true, setIsError);
    //         isValid = false;
    //     } else {
    //         handleValidationChange("listInfo", false, setIsError);
    //     }
    // });

    return isValid;
};
