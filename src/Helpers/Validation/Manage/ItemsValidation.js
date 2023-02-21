import {handleValidationChange} from '../CommonValidation';

export const validateItems = (data, itemUnits, setIsError) => {
    //Required 
    // name: "",
    // type: "",
    // breakdown_unit: "",
    // breakdown_value: "",
    // inventory_unit: "",
    // inventory_value: "",
    // min: "",
    // max: "",
    // acceptable_variance: "",

    var isValid = true;


    if(data.name === "") {
        handleValidationChange("name", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("name", false, setIsError);
    }

    if(data.type === "") {
        handleValidationChange("type", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("type", false, setIsError);
    }

    if(itemUnits.length < 1) {
        handleValidationChange("items", true, setIsError);
        isValid = false;
    } else {
        handleValidationChange("items", false, setIsError);
    }

  
    var isValidItems = true;
    itemUnits.map((data) => {

      if(data.breakdown_unit === "") {
        isValidItems = false;
      } else {
          handleValidationChange("itemsUnitsNoInput", false, setIsError);
      }

      if(data.breakdown_value === "") {
        isValidItems = false;
      } else {
          handleValidationChange("itemsUnitsNoInput", false, setIsError);
      }

      if(data.inventory_unit === "") {
        isValidItems = false;
      } else {
          handleValidationChange("itemsUnitsNoInput", false, setIsError);
      }

      if(data.inventory_value === "") {
        isValidItems = false;
      } else {
          handleValidationChange("itemsUnitsNoInput", false, setIsError);
      }

      if(data.min === "") {
        isValidItems = false;
      } else {
          handleValidationChange("itemsUnitsNoInput", false, setIsError);
      }

      if(data.max === "") {
        isValidItems = false;
      } else {
          handleValidationChange("itemsUnitsNoInput", false, setIsError);
      }

      if(data.acceptable_variance === "") {
        isValidItems = false;
      } else {
          handleValidationChange("itemsUnitsNoInput", false, setIsError);
      }
    })


    if(!isValidItems) {
      handleValidationChange("itemsUnitsNoInput", true, setIsError);
    }



   if(isValid && isValidItems) {
      return true
   } else {
      return false
   }

  
}