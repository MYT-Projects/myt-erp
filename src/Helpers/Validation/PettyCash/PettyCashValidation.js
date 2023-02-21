import { handleValidationChange } from "../CommonValidation";

export const validatePettyCashOutCreate = (data, setIsError) => {
	// 		petty_cash_id: "",
	// 		type: "out",
	// 		particulars: "",
	// 		invoice_no: "",
	// 		date: "",
	// 		names: [],
	// 		quantities: [],
	// 		prices: [],
	// 		units: [],
	var isValid = true;

	if(data.date === ""){
		handleValidationChange("date", true, setIsError);
		isValid = false;
	}

	if(data.out_type === ""){
		handleValidationChange("out_type", true, setIsError);
		isValid = false;
	} else {
        handleValidationChange("out_type", false, setIsError);
    }

	if(data.particulars === ""){
		handleValidationChange("particulars", true, setIsError);
		isValid = false;
	}

	if(data.amount === ""){
		handleValidationChange("amount", true, setIsError);
		isValid = false;
	}
	// what follows some ugly code, sorry po, intern lang poo

	const items = [...data.item_names, ...data.item_quantities, ...data.item_prices, ...data.item_units]
	//empty list
	if(items.length == 0){
		handleValidationChange("list", true, setIsError);
		isValid = false;
	}
	//missing value
	else if(items.length % 4 != 0){
		handleValidationChange("listInfo", true, setIsError);
		isValid = false;
	}
	//empty string
	if(items.some((element)=>{return element===""})){
		handleValidationChange("listInfo", true, setIsError);
		isValid = false;
	}
	//check numerical quantities
	if([...data.item_prices, ...data.item_quantities].some((element)=>{return isNaN(parseFloat(element))})){
		handleValidationChange("listInfo", true, setIsError);
		isValid = false;
	}

	return isValid;
	
}

export const validatePettyCashOutUpdate = (data, setIsError) => {
	// 		petty_cash_id: "",
	//		petty_cash_detail_id: "",
	// 		type: "out",
	// 		particulars: "",
	// 		invoice_no: "",
	// 		date: "",
	// 		names: [],
	// 		quantities: [],
	// 		prices: [],
	// 		units: [],
	var isValid = true;

	if(data.date === ""){
		handleValidationChange("date", true, setIsError);
		isValid = false;
	}
	if(data.particulars === ""){
		handleValidationChange("particulars", true, setIsError);
		isValid = false;
	}

	if(data.amount === ""){
		handleValidationChange("amount", true, setIsError);
		isValid = false;
	}
	// what follows some ugly code, sorry po, intern lang poo

	const items = [...data.item_names, ...data.item_quantities, ...data.item_prices, ...data.item_units]
	//empty list
	if(items.length == 0){
		handleValidationChange("list", true, setIsError);
		isValid = false;
	}
	//missing value
	else if(items.length % 4 != 0){
		handleValidationChange("listInfo", true, setIsError);
		isValid = false;
	}
	//empty string
	if(items.some((element)=>{return element===""})){
		handleValidationChange("listInfo", true, setIsError);
		isValid = false;
	}
	//check numerical quantities
	if([...data.item_prices, ...data.item_quantities].some((element)=>{return isNaN(parseFloat(element))})){
		handleValidationChange("listInfo", true, setIsError);
		isValid = false;
	}

	return isValid;
	
}

export const validatePettyCashInCreate = (data, setIsError) => {
	// 		petty_cash_id: "",
	// 		type: "in",
	// 		from: "",
	// 		date: "",
	//		remarks: ""
	//		amount: ""

	var isValid = true;

	if(data.date === ""){
		handleValidationChange("date", true, setIsError);
		isValid = false;
	}

	if(data.from === ""){
		handleValidationChange("from", true, setIsError);
		isValid = false;
	}

	if(isNaN(parseFloat(data.amount))){
		handleValidationChange("amount", true, setIsError);
		isValid = false;
	}

	return isValid;
	
}

export const validatePettyCashInUpdate = (data, setIsError) => {
	// 		petty_cash_id: "",
	//		petty_cash_detail_id: "",
	// 		type: "in",
	// 		from: "",
	// 		date: "",
	//		remarks: ""
	//		amount: ""

	var isValid = true;

	if(data.date === ""){
		handleValidationChange("date", true, setIsError);
		isValid = false;
	}

	if(data.from === ""){
		handleValidationChange("from", true, setIsError);
		isValid = false;
	}

	if(isNaN(parseFloat(data.amount))){
		handleValidationChange("amount", true, setIsError);
		isValid = false;
	}

	return isValid;
	
}