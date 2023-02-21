import axios from "axios";
// import { getAPIKey } from "../Utils/Common";

// var userKey = getAPIKey();
// //console.log(getAPIKey());

const getAPIKey = () => {
    const userStr = localStorage.getItem("api-key");
    if (userStr) return userStr;
    else return null;
};
const getAPIKey2 = () => {
    const userStr = localStorage.getItem("api-key2");
    if (userStr) return userStr;
    else return null;
};

var config = {
    "api-key": "daccfc89-ff47-4ce1-99bf-5ad2d8f57282",
    "user-key": getAPIKey(),
    "Content-Type": "application/json",
};
var config2 = {
    "api-key": "daccfc89-ff47-4ce1-99bf-5ad2d8f57282",
    "user-key": getAPIKey2(),
    "Content-Type": "application/json",
};

// API Axios Get Call.
export const getAPICall = (url, data, type) => {
    if (type === "potato") {
        return axios.get(url, { headers: config2, params: data });
    } else {
        return axios.get(url, { headers: config, params: data });
    }
};
// Potato Corner
export const getAPICall2 = (url, data) => {
    return axios.get(url, { headers: config2, params: data });
};
// API Axios Post Call.
export const postAPICall = (url, data, type) => {
    if (type === "potato") {
        return axios.post(url, data, { headers: config2 });
    } else {
        return axios.post(url, data, { headers: config });
    }
};

// API Axios Post Call.
export const postAPICall2 = (url, data, config) => {
    return axios.post(url, data, { headers: config });
};

// API Axios Put Call.
export const putAPICall = (url, data, type) => {
    if (type === "potato") {
        return axios.put(url, data, { headers: config2 });
    } else {
        return axios.put(url, data, { headers: config });
    }
};
// API Axios Delete Call.
export const deleteAPICall = (url, type) => {
    if (type === "potato") {
        return axios.delete(url, { headers: config2 });
    } else {
        return axios.delete(url, { headers: config });
    }
};
