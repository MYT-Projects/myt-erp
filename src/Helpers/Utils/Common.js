import moment from "moment";
import toast from "react-hot-toast";
import { logoutUser } from "../apiCalls/authApi";

/***************************
 * Common Utilities
 ***************************/

export const refreshPage = () => {
    window.location.reload();
};

export const getTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute:'2-digit',
        hour12: true,
    });
};

export const getTime12 = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute:'2-digit',
        hour12: false,
    });
};

export const getMilitaryTime = (date) => {
    return new Date(date).toLocaleTimeString("it-IT", {
        hour: '2-digit',
        minute:'2-digit',
        second: '2-digit',
        // hour12: true,
    });
};

export const subtractMonths = (numOfMonths, date = new Date()) => {
    date.setMonth(date.getMonth() - numOfMonths);
    return date.toISOString().split("T")[0];
};

export const getTodayDate = () => {
    return new Date();
};

export const getTodayDateISO = () => {
    let deets = new Date();
    let date = deets.toLocaleString("en-US", { timeZone: "Asia/Manila" });
    return moment(date).format("yyyy-MM-DD");
};

export const getTodayDateISOFormat = (dateparam) => {
    let deets = new Date(dateparam);
    let date = deets.toLocaleString("en-US", { timeZone: "Asia/Manila" });
    return moment(date).format("yyyy-MM-DD");
};

export const getAge = (dateString) => {
    var today = new Date();
    var birthdate = new Date(dateString);
    var age = today.getFullYear() - birthdate.getFullYear();
    var m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
};

export const formatDate = (date) => {
    if (date) {
        var stringDate = date.split("-");
        return stringDate[1] + "/" + stringDate[2] + "/" + stringDate[0];
    }
};
// export const formatDate = (date) => {
//     var formatDate = new Date(date);
//     var stringDate = formatDate.toDateString().split(" ");

//     return (
//         stringDate[1] +
//         " " +
//         stringDate[2] +
//         ", " +
//         stringDate[3] +
//         " " +
//         formatDate.toLocaleTimeString().replace(/(.*)\D\d+/, "$1")
//     );
// };

export const formatDateNoTime = (date) => {
    var formatDate = new Date(date);
    var stringDate = formatDate.toDateString().split(" ");
    // var withSlash = formatDate(stringDate);
    // //console.log(withSlash);

    return stringDate[1] + " " + stringDate[2] + ", " + stringDate[3];
};

// example parameter: "2022-10-08 00:00:00"
export const formatDateSlash = (date) => {
    var stringDate = date.split(" ");
    var _cleaned = stringDate[0].split("-");

    return _cleaned[1] + "/" + _cleaned[2] + "/" + _cleaned[0];
};

export const formatMDY = (date) => {
    // //console.log(date)
    var stringDate = date.split("-");
    // //console.log(stringDate)
    return stringDate[1] + "-" + stringDate[2] + "-" + stringDate[0];
};

export const validateUsername = (username) => {
    if (username === "") {
        return true;
    } else {
        var filter =
            /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
        return String(username).search(filter) != -1;
    }
};

export const isClosingTime = (time) => {
    var format = "hh:mm:ss";
    var endTime = moment(time, format);
    return moment().isAfter(endTime);
};

export const isNotClosingDate = (date) => {
    return moment().isBefore(moment(date).add(1, "d"));
};

export const validateContact = (num) => {
    var mobileFilter = /((^(\+)(\d){12}$)|(^\d{11}$))/;
    var telFilter = /^[0-9]+(-[0-9]+)+$/;

    if (
        String(num).search(mobileFilter) != -1 ||
        String(num).search(telFilter) != -1
    ) {
        return true;
    } else {
        return false;
    }
};

export const dateFormat = (date) => {
    return moment(date).format("MMM DD, YYYY");
};

export const formatYDM = (date) => {
    return moment(date).format("YYYY-MM-DD");
};

export const numberFormat = (data) => {
    return parseFloat(data).toLocaleString(undefined, {
        minimumFractionDigits: 2,
    });
};

export const numberFormatInt = (data) => {
    return parseFloat(data.replace(/,/g, ''));;
};

export const formatNum = (num) => {
    return parseFloat(Math.round(num * 100) / 100).toFixed(2);
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const TokenExpiry = async (error) => {
    if (error.error.status === 401 || error.status === 401) {
        const response = await logoutUser();
        toast.loading("Token has expired. Logging you out...", {
            style: toastStyle(),
        });
        removeUserSession();
        setTimeout(() => refreshPage(), 1000);
    }
};

/***************************
 * Local Storage Utilities
 ***************************/

//return user data from local storage
export const getUser = () => {
    const userStr = localStorage.getItem("pin");
    if (userStr) return JSON.parse(userStr);
    else return null;
};

//return user name from local storage
export const getName = () => {
    const userStr = localStorage.getItem("name");
    if (userStr) return JSON.parse(userStr);
    else return null;
};

//return user type from local storage
export const getType = () => {
    const userStr = localStorage.getItem("type");
    if (userStr) return JSON.parse(userStr);
    else return null;
};

//return user role from local storage
export const getAPIKey = () => {
    const userStr = localStorage.getItem("api-key");
    if (userStr) return userStr;
    else return null;
};

//return token from local storage
export const getToken = () => {
    const userStr = localStorage.getItem("token");
    if (userStr) return JSON.parse(userStr);
    else return null;
};

// POTATO CORNER -- return user role from local storage
export const getAPIKey2 = () => {
    const userStr = localStorage.getItem("api-key2");
    if (userStr) return userStr;
    else return null;
};

// POTATO CORNER -- return token from local storage
export const getToken2 = () => {
    const userStr = localStorage.getItem("token2");
    if (userStr) return JSON.parse(userStr);
    else return null;
};

//remove user details from local storage
export const removeUserSession = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("type");
    localStorage.removeItem("role");
    localStorage.removeItem("api-key");
    localStorage.removeItem("token");
};

export const isAdmin = () => {
    return getType() === "admin";
};

// toast style
export const toastStyle = () => {
    return {
        fontFamily: "Gotham-Rounded-Medium",
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
    };
};

export const classificationOptions = [
    { name: "classification", label: "All Classification", value: "" },
    { name: "classification", label: "Ingredient", value: "ingredient" },
    { name: "classification", label: "Supplies", value: "supplies" },
    {
        name: "classification",
        label: "Cleaning Supplies",
        value: "cleaning_supplies",
    },
    {
        name: "classification",
        label: "Office Supplies",
        value: "office_supplies",
    },
    { name: "classification", label: "Equipment", value: "equipment" },
    { name: "classification", label: "Uniform", value: "uniform" },
    { name: "classification", label: "Beverage", value: "beverage" },
    { name: "classification", label: "Raw Material", value: "raw_material" },
    {
        name: "classification",
        label: "Store Supplies",
        value: "store_supplies",
    },
    {
        name: "classification",
        label: "Commissary Supplies",
        value: "commissary_supplies",
    },
    {
        name: "classification",
        label: "Commissary Equipment",
        value: "commissary_equipment",
    },
    {
        name: "classification",
        label: "Store Equipment",
        value: "store_equipment",
    },
    { name: "classification", label: "Carpentry", value: "carpentry" },
    { name: "classification", label: "Electrical", value: "electrical" },
    { name: "classification", label: "Painting", value: "painting" },
];
