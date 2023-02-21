import { getToken, getUser } from "../../Utils/Common"
import { getAPICall, postAPICall } from "../axiosMethodCalls"
import Moment from "moment";

const user = getUser();
const token = getToken();

// TABLE / MANAGE

export const getPettyCashInfo = async (params) => {
	try {
		const response = await getAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/get_petty_cash", { 
			token: token,
			requester:user,
			petty_cash_id: params.petty_cash_id
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}

export const getNoOfPettyCashRequest = async () => {
	try {
		const response = await getAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/get_petty_cash_status_frequency", { 
			token: token,
			requester:user,
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}



export const getPettyCashTransactionDetails = async (params) => {

	try {
		const response = await getAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/get_all_petty_cash", { 
			token: token,
			user:user,
			petty_cash_id: params.petty_cash_id
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}

}

export const searchPettyCashTransactionDetails = async (params) => {

	try {
		const response = await getAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/search", {
			token: token,
			requester:user,
			petty_cash_id: params.petty_cash_id,
			date_from: params.date_from ? Moment(params.date_from).format("YYYY-MM-DD") : "",
			date_to: params.date_to ? Moment(params.date_to).format("YYYY-MM-DD") : "",
			type: params.type,
			status: params.status,
			});
		return response.data
	} catch(error){
		return { error: error.response };
	}

}

export const approvePettyCashRequest = async (id) => {

	try {
		const response = await getAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/approve_cashout", {
			token: token,
			requester:user,
			petty_cash_id: id
			});
		return response.data
	} catch(error){
		return { error: error.response };
	}

}

export const deletePettyCashTransactionDetails = async (petty_cash_detail_id) => {

	try {
		const response = await postAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/delete_petty_cash_detail", {
			petty_cash_detail_id: petty_cash_detail_id,
			token: token,
			requester:user,
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}

}

// CASH OUT

export const getPettyCashOutDetailTransaction = async (id) => {
	try {
		const response = await getAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/get_petty_cash_detail", {
			requester: user,
			token: token,
			petty_cash_detail_id: id,
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}

export const postPettyCashOutDetailTransaction = async (data) => {
	try {
		const response = await postAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/create_details", {
			requester: user,
			token: token,
			petty_cash_id: data.petty_cash_id,
			type: data.type,
			out_type: data.out_type,
			particulars: data.particulars,
			invoice_no: data.invoice_no,
			date: data.date,
			names: data.item_names,
			quantities: data.item_quantities,
			prices: data.item_prices,
			units: data.item_units,
			amount: data.amount,
			requested_by: data.requested_by,
			remarks: data.remarks,
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}

export const updatePettyCashOutDetailTransaction = async (data) => {
	try {
		const response = await postAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/update_detail", {
			requester: user,
			token: token,
			petty_cash_id: data.petty_cash_id,
			petty_cash_detail_id: data.petty_cash_detail_id,
			type: data.type,
			out_type: data.out_type,
			particulars: data.particulars,
			invoice_no: data.invoice_no,
			date: data.date,
			names: data.item_names,
			quantities: data.item_quantities,
			prices: data.item_prices,
			units: data.item_units,
			amount: data.amount,
			requested_by: data.requested_by,
			remarks: data.remarks,
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}

// CASH IN

export const getPettyCashInDetailTransaction = async (id) => {
	try {
		const response = await getAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/get_petty_cash_detail", {
			requester: user,
			token: token,
			petty_cash_detail_id: id,
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}

export const postPettyCashInDetailTransaction = async (data) => {
	try {
		const response = await postAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/create_details", {
			requester: user,
			token: token,
			petty_cash_id: data.petty_cash_id,
			type: data.type,
			remarks: data.remarks,
			from: data.from,
			date: data.date,
			amount: data.amount
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}

export const updatePettyCashInDetailTransaction = async (data) => {
	try {
		const response = await postAPICall(process.env.REACT_APP_LINK + "petty_cash_reports/update_detail", {
			requester: user,
			token: token,
			petty_cash_detail_id: data.petty_cash_detail_id,
			type: data.type,
			remarks: data.remarks,
			from: data.from,
			date: data.date,
			amount: data.amount
		});
		return response.data
	} catch(error){
		return { error: error.response };
	}
}