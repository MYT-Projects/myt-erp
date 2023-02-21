import {handleValidationChange} from '../CommonValidation';

export const validateProducts = (data, products, optionalItems, setIsError) => {
    //Required 
    // name: "",
    // list: false,
    // listInfo: false,
    // list must be equal or greater than one
    // all fields must be filled out in list

    var isValid = true;


    if(data.name === "") {
        handleValidationChange("name", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("name", false, setIsError);
    }

    if(products.length < 1) {
        handleValidationChange("list", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("list", false, setIsError);
    }

    products.map((data) => {
        if(data.id === "") {
            handleValidationChange("listInfo", true, setIsError);
            isValid=false;
        } else {
            handleValidationChange("listInfo", false, setIsError);
        }

        if(data.quantity === "") {
            handleValidationChange("listInfo", true, setIsError);
            isValid=false;
        } else {
            handleValidationChange("listInfo", false, setIsError);
        }

        // if(data.unit === "") {
        //     handleValidationChange("listInfo", true, setIsError);
        //     isValid=false;
        // } else {
        //     handleValidationChange("listInfo", false, setIsError);
        // }
        
    })

    if(optionalItems.length >= 1) {
        optionalItems.map((data) => {
            console.log(data)
            if(data.req_product_item_ids === "") {
                handleValidationChange("optionalInfo", true, setIsError);
                isValid=false;
            } else {
                handleValidationChange("optionalInfo", false, setIsError);
            }

            if(data.req_item_ids === "") {
                handleValidationChange("optionalInfo", true, setIsError);
                isValid=false;
            } else {
                handleValidationChange("optionalInfo", false, setIsError);
            }
    
            if(data.req_quantities === "") {
                handleValidationChange("optionalInfo", true, setIsError);
                isValid=false;
            } else {
                handleValidationChange("optionalInfo", false, setIsError);
            }
        })
    }

    return isValid
  
}