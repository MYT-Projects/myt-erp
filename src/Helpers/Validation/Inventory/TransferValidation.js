import {handleValidationChange} from '../CommonValidation';

export const validateTransfer = (data, items, setIsError, type) => {
    //Required 
    // name: "",
    // list: false,
    // listInfo: false,
    // list must be equal or greater than one
    // all fields must be filled out in list

    var isValid = true;

    console.log(data)

    if(data.transfer_date === "") {
        handleValidationChange("transfer_date", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("transfer_date", false, setIsError);
    }

    if(data.transfer_number === "" || data.transfer_number === undefined || data.transfer_number === null) {
        handleValidationChange("transfer_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("transfer_number", false, setIsError);
    }

    if(data.branch_from === "" || data.branch_from === undefined) {
        handleValidationChange("branch_from", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("branch_from", false, setIsError);
    }

    if(data.branch_to === "" || data.branch_to === undefined) {
        handleValidationChange("branch_to", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("branch_to", false, setIsError);
    }

    // if((data.dispatcher === "" || data.dispatcher === undefined || data.dispatcher === 0) && type === "edit" ) {
    //     handleValidationChange("dispatcher", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("dispatcher", false, setIsError);
    // }

    if(items.length < 1) {
        handleValidationChange("list", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("list", false, setIsError);
    }

    items.map((data) => {
        if(data.entry.value === "") {
            handleValidationChange("listInfo", true, setIsError);
            isValid=false;
        } else {
            handleValidationChange("listInfo", false, setIsError);
        }

        if(data.quantities === "") {
            handleValidationChange("listInfo", true, setIsError);
            isValid=false;
        } else {
            handleValidationChange("listInfo", false, setIsError);
        }
        
    })


    return isValid
  
}


export const validateTransferView = (data, items, setIsError, type) => {
    //Required 
    // name: "",
    // list: false,
    // listInfo: false,
    // list must be equal or greater than one
    // all fields must be filled out in list

    var isValid = true;

    if(data.transfer_number === "" || data.transfer_number === undefined || data.transfer_number === null) {
        handleValidationChange("transfer_number", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("transfer_number", false, setIsError);
    }

    if((data.dispatcher === "" || data.dispatcher === undefined) ) {
        handleValidationChange("dispatcher", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("dispatcher", false, setIsError);
    }

    // if(items.length < 1) {
    //     handleValidationChange("list", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("list", false, setIsError);
    // }


    return isValid
  
}


export const validateTransferReceive = (data, items, setIsError, type) => {
    //Required 
    // name: "",
    // list: false,
    // listInfo: false,
    // list must be equal or greater than one
    // all fields must be filled out in list

    var isValid = true;
    console.log(data.received_by)
    console.log(data.transfer_receive_date)

    // if(data.transfer_number === "" || data.transfer_number === undefined || data.transfer_number === null) {
    //     handleValidationChange("transfer_number", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("transfer_number", false, setIsError);
    // }

    if((data.transfer_receive_date  === "" || data.transfer_receive_date  === undefined || data.transfer_receive_date === null) ) {
        handleValidationChange("transfer_receive_date", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("transfer_receive_date", false, setIsError);
    }

    if((data.received_by  === "" || data.received_by  === undefined || data.received_by === null) ) {
        handleValidationChange("received_by", true, setIsError);
        isValid=false;
    } else {
        handleValidationChange("received_by", false, setIsError);
    }

    // if(items.length < 1) {
    //     handleValidationChange("list", true, setIsError);
    //     isValid=false;
    // } else {
    //     handleValidationChange("list", false, setIsError);
    // }


    return isValid
  
}

