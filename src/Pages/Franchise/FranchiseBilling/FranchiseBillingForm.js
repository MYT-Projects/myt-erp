import React, { Fragment, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import trash from "./../../../Assets/Images/trash.png";
import ReactDatePicker from "react-datepicker";
import { SyncLoader } from "react-spinners";
import Select from "react-select";
import "./../Franchise.css";
import {
    formatDate,
    formatDateNoTime,
    numberFormat,
    refreshPage,
    toastStyle,
    dateFormat,
} from "../../../Helpers/Utils/Common";
import {
    getAllTransfers,
    getTransfer,
    createTransfer,
    updateTransfer,
} from "../../../Helpers/apiCalls/Inventory/TransferApi";
import {
    getAllItemList,
    getItemHistory,
} from "../../../Helpers/apiCalls/Inventory/ItemListApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    getAllItems,
    getAllBranchItem,
} from "../../../Helpers/apiCalls/itemsApi";
import { getAllEmployees } from "../../../Helpers/apiCalls/employeesApi";
import { validateTransfer } from "../../../Helpers/Validation/Inventory/TransferValidation";
import InputError from "../../../Components/InputError/InputError";
import toast from "react-hot-toast";
import Moment from "moment";

import {
    getFranchise,
    createFranchiseSaleBilling,
    updateFranchiseSaleBilling,
    searchSalesBillingMissing,
} from "../../../Helpers/apiCalls/Franchise/FranchiseSaleBillingApi";
import { getAllBanks } from "../../../Helpers/apiCalls/banksAPi";
import * as XLSX from "xlsx";

/**
 *  COMPONENT: FORM TO ADD OR EDIT PAYMENT
 */
function FranchiseBillingForm({ add, edit }) {
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const { id, type } = useParams();
    const { state } = useLocation();
    let navigate = useNavigate();

    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionFee, setTransactionFee] = useState("");
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState("");

    // DATA HANDLERS
    const [branchTo, setBranchTo] = useState([]);
    const [branchFrom, setBranchFrom] = useState([]);
    const [entries, setEntries] = useState([]);
    const [entriesList, setEntriesList] = useState([]);
    const [items, setItems] = useState([]);
    const [banks, setBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    const [itemsData, setItemsData] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);

    const [sheetData, setSheetData] = useState([]);
    const [newSheetData, setNewSheetData] = useState([]);
    const [newBillingData, setNewBillingData] = useState({});
    const [newSales, setNewSales] = useState([]);
    const [monthYearFilter, setMonthYearFilter] = useState(new Date());

    const [newTransfer, setNewTransfer] = useState({
        transfer_date: "",
        transfer_number: "",
        branch_from: "",
        branch_to: "",
        remarks: "",
        dispatcher: "0",
    });

    const [transferData, setTransferData] = useState({});
    const [itemData, setItemData] = useState({});

    const [branchToValue, setBranchToValue] = useState({
        name: "branch_to",
        label: "",
        value: "",
    });
    const [branchFromValue, setBranchFromValue] = useState({
        name: "branch_from",
        label: "",
        value: "",
    });
    const [employeeValue, setEmployeeValue] = useState({
        name: "dispatcher",
        label: "",
        value: "",
    });
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    const [missing, setMissing] = useState([]);
    const [done, setDone] = useState([]);
    const [allMissing, setAllMissing] = useState([]);
    const [allBilling, setAllBilling] = useState([]);
    const [billingData, setBillingData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [file, setFile] = useState("");
    const [headers, setHeaders] = useState([])
    const [columns, setColumns] = useState([])
    const [discountInfo, setDiscountInfo] = useState({})

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        transfer_date: false,
        transfer_number: false,
        branch_from: false,
        branch_to: false,
        dispatcher: false,
        listInfo: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        transfer_date: false,
        transfer_number: false,
        branch_from: false,
        branch_to: false,
        dispatcher: false,
        listInfo: false,
    });

    if (newTransfer.transfer_date === "" && add) {
        setNewTransfer({
            transfer_date: Moment().format("YYYY-MM-DD"),
        });
    }

    const [date, setDate] = useState("");
    const [year, setYear] = useState("");

    // SELECT DROPSEARCH CHANGE HANDLER
    function handleSelectChange(e) {

        const newList = newTransfer;
        newList[e.name] = e.value;
        setNewTransfer(newList);

        if (e.name === "branch_to") {
            setBranchToValue({ name: e.name, label: e.label, value: e.value });
        } else if (e.name === "branch_from") {
            fetchAllItems(e.value);
            setBranchFromValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        } else if (e.name === "dispatcher")
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
    }

    function handleOnMonthSearch(e, type) {
        if(type === "month") {
            var date = e.setDate(1)
            setMonthYearFilter(e.setDate(1));
            searchFranchiseSalesBilling(date)
    
            setNewBillingData({...newBillingData, month: Moment(date).set('date', 1).format("YYYY-MM-DD")})
    
            var newDate = new Date(date).toLocaleDateString("en-us",{ month:"long"})
            var year = new Date(date).getFullYear()
    
            var sheet = Array(parseInt(getMonthDaysAddButton(e))+1)
                .fill("")
                .map((data, d) => {
                    var day = new Date(newDate + " " + d + " " + year).getDay()
                    var info = {};
                    info.id = d;
                    info.day = day;
                    info.dayName = dayNames[day];
                    info.date = newDate + " " + d + " " + year;
                    info.sales = "";
                    info.is_closed = 0;
                    return info;
                });
            const firstElement = sheet.shift();
            setSheetData(sheet);
        } else {
            const { value} = e.target
            setNewBillingData({...newBillingData, branch_id: value.split("|")[0], franchisee_id: value.split("|")[1] })


        }
        
    }

    async function searchFranchiseSalesBilling(date) {
        setShowLoader(true);
        setBranches([]);

            const response = await searchSalesBillingMissing({month: Moment(date).set('date', 1).format("YYYY-MM-DD")});
            setBranches([]);

            if(response.data?.status === "success") {
                var allBills = response.data.data.map((bill) => {
                    var info = bill;
    
                    info.id = bill.id;
                    info.month = dateFormat(bill.month);
                    info.date_added = dateFormat(bill.added_on);
                    info.date_opened = dateFormat(bill.added_on);
                    info.opening_start = bill.opening_start? dateFormat(bill.opening_start) : "N/A";
                    info.branch_id = bill.branch_id;
                    info.balance = bill.balance;
                    info.branch_name = bill.branch_name;
                    info.franchise_id = bill.franchisee_id;
                    info.franchise_name = bill.name;
                    info.payment_status = bill.payment_status;
                    info.contact_person = bill.contact_person
                        ? bill.contact_person
                        : "N/A";
                    info.contact_number = bill.contact_number
                        ? bill.contact_number
                        : "N/A";
                    info.franchise_date = dateFormat(bill.month);
                    info.total_sale = bill.total_sale? bill.total_sale: "0";
                    info.total_net = bill.total_net? bill.total_net: "0";
                    info.total_amount_due = bill.total_amount_due? bill.total_amount_due: "0";
    
                    info.monthYear =
                        new Date(info.month).toLocaleString("en-us", {
                            month: "long",
                        }) +
                        " " +
                        new Date(info.month).getFullYear();
                    return info;
                });
                setBranches(allBills);
            } else {
            }
        setShowLoader(false);
    }


    // PAYMENT DETAILS CHANGE HANDLER
    function handlePayChange(e) {
        const { name, value } = e.target;
        const newList = newTransfer;
        newList[name] = value;
        setNewTransfer(newList);
    }

    // INVOICE CHANGE HANDLER
    function handleItemChange(e, id) {
        setSelectedEntry(id);
        const { name, label, value } = e.target;
        var newSales = sheetData;

        if (name === "is_closed") {
            var newData = sheetData.map((data, index) => {
                if (data.id === id + 1) {
                    if (data.is_closed === 1 || data.is_closed === "1") {
                        data["is_closed"] = "0";
                        data["sales"] = "";
                    } else {
                        data["is_closed"] = "1";
                        data["sales"] = "0";
                    }
                }
            });
            setNewSheetData(newSales);
            setItems(newSales);
        } else if (name === "sales") {
            var newData = sheetData.map((data, index) => {
                if (data.id === id + 1) {
                    data["sales"] = value;
                }
                return data;
            });
            setNewSheetData(newSales);
            setItems(newSales);
        }
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function daysInMonth (month, year) {
        const date = new Date(month + "-1-" + year);
        const monthNum = (date.getMonth() + 1)

        return new Date(year, monthNum, 0).getDate();
    }

    function getMonthDays () {
        console.log(state)
        return daysInMonth (state.month, state.year)
    }

    function getMonthDaysAddButton (date) {
        var d = new Date(date).toLocaleDateString("en-us",{ month:"long"})
        var y = new Date(date).getFullYear()
        return daysInMonth (d, y)
    }

    // INVOICE REMOVAL HANDLER
    function handleRemoveItem(id) {
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);
    }

    //  DISPLAY THE LIST OF ITEMS TABLE
    function renderTable() {
        return (
            <Table className="ps-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Sales</th>
                        <th>Closed</th>
                    </tr>
                </thead>
                <tbody>
                    {sheetData.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td>{data.date + ", " + data.dayName}</td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="sales"
                                        disabled={data.is_closed === "1" || data.is_closed === 1? true : false}
                                        defaultValue={data.sales}
                                        onChange={(e) =>
                                            handleItemChange(
                                                e,
                                                index
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <Col>
                                        <Form.Group controlId="formBasicCheckbox">
                                            <Form.Check
                                                type="checkbox"
                                                name="is_closed"
                                                value="1"
                                                checked={data.is_closed === "1" || data.is_closed === 1? true : false}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                            />
                                        </Form.Group>
                                    </Col>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="franchise-td-gray">
                            {"DISCOUNT"}
                        </td>
                        <td>
                            <Form.Control
                                type="number"
                                name="discount"
                                defaultValue={discountInfo?.discount}
                                onChange={(e) =>
                                    handleChange(e)
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="franchise-td-gray">
                            {"REMARKS"}
                        </td>
                        <td>
                            <Form.Control
                                type="text"
                                name="discount_remarks"
                                defaultValue={discountInfo.discount_remarks}
                                onChange={(e) =>
                                    handleChange(e)
                                }
                            />
                        </td>
                    </tr>
                </tfoot>
            </Table>
        );
    }

    //  FETCH INVENTORY ITEMS   //
    async function fetchAllItems(id) {
        setEntries([]);
        setShowLoader(true);
        const response = await getAllItemList(id);
        if (response.data.data) {
            var itemsList = response.data.data;
            var clean = itemsList.map((entry) => {
                var info = {};
                info.name = "item_id";
                info.value = entry.item_id;
                info.label = entry.item_name;
                info.entry = {
                    name: "item_id",
                    value: entry.item_id,
                    label: entry.item_name,
                };
                info.unit = entry.inventory_unit_name;
                info.prices = entry.price;
                info.current_qty = parseInt(entry.current_qty);
                entry.item_units
                    ? entry.item_units.map((i) => {
                          info.unit = i.inventory_unit_name;
                          info.prices = i.price;
                          info.current_qty = parseInt(i.current_qty);
                      })
                    : (info.units = "");
                return info;
            });
            setEntries(clean);
            setEntriesList(clean);
        } else {
            setItemsData([]);
        }
        setShowLoader(false);
    }

    async function fetchBranches() {
        setBranchTo([]);
        setBranchFrom([]);
        const response = await getAllBranches();

        if (response) {
            let to = response.data.data.map((a) => {
                return {
                    value: a.id,
                    label: a.name,
                    name: "branch_to",
                };
            });
            setBranchTo(to);

            let from = response.data.data.map((a) => {
                return {
                    value: a.id,
                    label: a.name,
                    name: "branch_from",
                };
            });
            setBranchFrom(from);
        }
    }

    const handleChange = (e, isSelect) => {
        if (isSelect) {
            const { name, value } = e.target;
        } else {
            const { name, value } = e.target;
            setDiscountInfo((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    //API CALL
    async function fetchAllEmployees() {
        setShowLoader(true);
        const response = await getAllEmployees();
        if (response.data.data) {
            var employeesList = response.data.data;
            employeesList.map((employee) => {
                var info = {};

                info.name = "dispatcher";
                info.label =
                    employee.first_name +
                    " " +
                    employee.middle_name +
                    " " +
                    employee.last_name;
                info.value = employee.id;

                setEmployeeOptions((prev) => [...prev, info]);
            });
            response.data.data.map((data, key) => {
                employeesList[key].full_name =
                    data.first_name +
                    " " +
                    data.middle_name +
                    " " +
                    data.last_name;
            });
            setEmployeesData(employeesList);
        } else {
            setEmployeesData([]);
        }
        setShowLoader(false);
    }
    /** POST API - SAVE NEW PAYMENT **/
    async function saveBilling() {
        const response = await createFranchiseSaleBilling(
            billingData[0] = {
                branch_id: state.row?.branch_id ? state.row.branch_id : newBillingData.branch_id,
                franchisee_id: state.row?.franchisee_id ? state.row.franchisee_id : newBillingData.franchisee_id,
                month: newBillingData.month? newBillingData.month : Moment(state.month + "-1-" + state.year).format("YYYY-MM-DD")
            },
            newSheetData.length > 0 ? newSheetData : sheetData, discountInfo
        );

        if (response.data?.status === "success") {
            toast.success("Sales billing created successfully", {
                style: toastStyle(),
            });
            setTimeout(() => {
                navigate("/franchisebilling/view/" + response.data.fs_billing_id);
            }, 1000);
        } else {
            if(state.row?.branch_id || newBillingData.branch_id) {
                toast.error("Something went wrong", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    refreshPage();
                }, 1000);
            } else {
                toast.error("Please Select Branch", {
                    style: toastStyle(),
                });
            }
        }
    }

    /** POST API - SAVE NEW PAYMENT **/
    async function editBilling() {
        const response = await updateFranchiseSaleBilling(
            billingData[0],
            newSheetData,
            discountInfo
        );
        if (response.data?.status === "success") {
            toast.success("Sales billing updated successfully", {
                style: toastStyle(),
            });
            setTimeout(() => {
                navigate("/franchisebilling/view/" + id);
            }, 1000);
        } else {
            toast.error("Something went wrong", {
                style: toastStyle(),
            });
        }
    }


    async function fetchBilling(id) {
        setShowLoader(true);

        const response = await getFranchise(id);

        if (response.data.status === "success") {
            var billing = response.data.data;
            billing.map(async (bill) => {
                var info = {};

                info.id = bill.id;
                info.month = bill.month;
                info.date_added = dateFormat(bill.added_on);
                info.date_opened = dateFormat(bill.added_on);
                info.branch_id = bill.branch_id;
                info.branch_name = bill.branch_name;
                info.franchise_id = bill.franchisee_id;
                info.franchise_name = bill.franchisee_name;
                info.contact_person = bill.contact_person
                    ? bill.contact_person
                    : "N/A";
                info.contact_number = bill.contact_number
                    ? bill.contact_number
                    : "N/A";
                info.franchise_date = dateFormat(bill.month);
                info.total_sale = bill.total_sale;
                info.total_net = bill.total_net;
                info.total_amount_due = bill.total_amount_due;

                info.discount = bill.discount;
                info.discount_remarks = bill.discount_remarks;

                setDate(new Date(info.month).getMonth());
                setYear(new Date(info.month).getFullYear());
                info.monthYear =
                    new Date(info.month).toLocaleString("en-us", {
                        month: "long",
                    }) +
                    " " +
                    new Date(info.month).getFullYear();

                info.fs_billing_items = bill.fs_billing_items;

                setBillingData((prev) => [...prev, info]);
                setDiscountInfo({discount: bill.discount, discount_remarks: bill.discount_remarks})
            });
        }
        setShowLoader(false);

    }

    function handlefetchBills() {
        if(billingData) {
            billingData.map((item) => {
                item.fs_billing_items?.map((bill) => {
                    var bill_date = new Date(bill.date).toLocaleDateString(
                        "en-us",
                        { day: "numeric",
                          month:"numeric"}
                    );
                  
                    var otherData = sheetData;
                    sheetData.map((data) => {
                        var sheetDate = new Date(data.date).toLocaleDateString(
                            "en-us",
                            { day: "numeric",
                        month: "numeric" }
                        );
                     
                        if (bill_date === sheetDate) {
                            otherData[data.id - 1]["sales"] = bill.sale;
                            otherData[data.id - 1]["is_closed"] = bill.is_closed;
                        }
                    });
                    setSheetData(otherData);
                });
            });
        } 
        else {

            setTimeout(() => {
                handlefetchBills();
            }, 50);
        }
        
    }

    function handleSetBills() {
        if(columns.length > 0) {
            if(columns.length === sheetData.length) {
                for (var index=0; index<columns.length; index++) {
    
                    var otherData = sheetData;
                    otherData[index]["sales"] = columns[index][1];
                    setSheetData(otherData);
                }
            } else {
                toast.error("Please check if the corresponding days in the file matches the days of the selected month", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    refreshPage();
                }, 1000);
            }
        } 
        else {
            setTimeout(() => {
                handleSetBills();
            }, 50);
        }
        
    }

    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.error) {

        } else {
            setBanks(response.data.data);
        }
    }

    const handleConvert = () =>{
        //convert file into an array of unsigned integers
        //file => variable that contains the file chosen
        file.arrayBuffer().then((res)=>{
    
            //get the filename without the extension
            let filename = file.name.substring(0, file.name.indexOf("."))
    
            //read data
            let data = new Uint8Array(res)
    
            //for creating the actual workbook from the data
            var workbook = XLSX.read(data, {type:"array"});
    
            //read the first sheet name in the excel file
            var sheetName = workbook.SheetNames[0];
    
            //locate the data inside the sheet name
            let worksheet = workbook.Sheets[sheetName]
    
            //convert sheet data to json data inside the certain sheet
            let jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: ''})
            let newdata = jsonData.filter((data, key)=>jsonData[key][1] !== "" && jsonData[key][0] !== "" && key !== 0 && key !== 1 && key !== 2 && key !== 3 && key !== 4)
            // console.log(jsonData)
            // console.log(jsonData[5])
            // console.log(newdata) 
            setHeaders(jsonData[0].filter(data=> data != ""));
            setColumns(newdata);
            // console.log(headers)
    
            //convert json data to sheet
            let newWorksheet = XLSX.utils.json_to_sheet(jsonData)
    
            //initialize new workbook
            let newWorkbook = XLSX.utils.book_new();
    
            //append worksheet to the new workbook 
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet)
    
            //create new csv file from workbook
            // XLSX.writeFile(newWorkbook, filename + "fromcode.csv")
        })
        
    }

    function handleSubmit() {
        if (add) saveBilling();
        if (edit) editBilling();
    }

    useEffect(() => {
        fetchBranches();
        fetchBranches();
        fetchBanks();
        searchFranchiseSalesBilling(monthYearFilter)
        if (edit) {
            fetchBranches();
            fetchBanks();
            fetchAllEmployees();
            fetchBilling(id);
        }
    }, []);
    
    useEffect(() => {
        
    }, []);

    useEffect(() => {
        handleSetBills();
        fetchBranches();
        fetchBranches();
        fetchBanks();
    }, [columns]);

    useEffect(() => {
        console.log(state.month.split(" ").length)
        if(state.month.split(" ").length > 1){
            state.month = state.month.split(" ")[0]
        }
        var sheet = Array(parseInt(getMonthDays() + 1))
            .fill("")
            .map((data, d) => {
                var day = new Date(state.month + " " + d + " " + state.year).getDay()
                var info = {};
                info.id = d;
                info.day = day;
                info.dayName = dayNames[day];
                info.date = state.month + " " + d + " " + state.year;
                info.sales = "";
                info.is_closed = 0;
                return info;
            });
        const firstElement = sheet.shift();
        setSheetData(sheet);

        setTimeout(() => {
            handlefetchBills();
        }, 1000);
    }, []);

    useEffect(() => {
        handlefetchBills();
    }, [billingData[0]]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"FRANCHISE"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    {add ? (
                        <h1 className="page-title mb-4">
                            MONTHLY SALES REPORT{" "}
                        </h1>
                    ) : (
                        <h1 className="page-title mb-4">EDIT TRANSFER</h1>
                    )}
                </div>

                {/* FORM */}

                <div className="edit-form ps-form">
                    <Fragment>
                        {state.type === "table" ?
                            <>
                            <Row className="pt-3 mb-2">
                                <Col xs={6}>
                                    <span className="nc-modal-custom-row uppercase">
                                        MONTH
                                    </span>
                                </Col>
                                <Col xs={6}>
                                    <span className="nc-modal-custom-row uppercase">
                                        BRANCH
                                    </span>
                                </Col>
                            </Row>
                            <Row className="align-items-start">
                                <Col xs={6}>
                                    <Form.Control
                                        type="text"
                                        name="remarks"
                                        disabled
                                        defaultValue={state.month.split(" ").length !== 1 ? state.month : state.month + " " + state.year}
                                        className="react-select-container"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                </Col>
                                <Col xs={6}>
                                    <Form.Control
                                        type="text"
                                        name="remarks"
                                        disabled
                                        defaultValue={state.branchName}
                                        className="react-select-container"
                                        onChange={(e) => handlePayChange(e)}
                                    />
                                </Col>
                            </Row>
                            </>
                            :
                            <>
                            <Row className="pt-3 mb-2">
                                <Col xs={6}>
                                    <span className="nc-modal-custom-row uppercase">
                                        MONTH
                                    </span>
                                </Col>
                                <Col xs={6}>
                                    <span className="nc-modal-custom-row uppercase">
                                        BRANCH
                                    </span>
                                </Col>
                            </Row>
                            <Row className="align-items-start">
                                <Col xs={6}>
                                    <ReactDatePicker
                                        className="date-filter me-2 form-select"
                                        selected={monthYearFilter}
                                        onChange={(date) =>
                                            handleOnMonthSearch(date, "month")
                                        }
                                        dateFormat="MMMM yyyy"
                                        showMonthYearPicker
                                    />
                                </Col>
                                <Col xs={6}>
                                    <Form.Select
                                        name="branch_id"
                                        className="date-filter me-2"
                                        defaultValue={newBillingData.branch_id}
                                        onChange={(e) => handleOnMonthSearch(e, "dropdown")}
                                    >
                                        <option value="" selected>
                                            Select Billing
                                        </option>
                                        {branches.length > 0 ? (
                                            branches.map((branch) => {
                                                return (
                                                    <option
                                                        value={branch.branch_id + "|" + branch.franchisee_id }
                                                    >
                                                        {branch.name + " (" + branch.branch_name + ")"}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option value="" disabled>
                                                (No Billing found)
                                            </option>
                                        )}
                                    </Form.Select>
                                </Col>
                            </Row>
                            </>
                        }

                        {/* FILE UPLOAD BUTTON */}
                        { add && (
                            <Row className="pt-3 mb-2">
                                <Col xs={10}>
                                    <input class="form-control date-filter gotham" type="file" id="formFileSm" onChange={(e)=>setFile(e.target.files[0])}/>
                                </Col>

                                <Col xs={2}>
                                    <button
                                        className="button-primary me-3"
                                        onClick={handleConvert}
                                    >
                                        Submit
                                    </button>
                                </Col>
                            </Row>
                        )}
                    </Fragment>
                    
                    

                    <div className="mt-4 pt-3 d-flex flex-column">
                        <Container fluid className="edit-purchased-items">
                            <>{showLoader ? (
                                    <div className="d-flex justify-content-center my-5">
                                        <SyncLoader color="#5ac8e1" size={15} />
                                    </div>
                                ) :
                                ( renderTable() )
                            }</>
                        </Container>
                    </div>

                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="button-primary me-3"
                            onClick={() => handleSubmit()}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

FranchiseBillingForm.defaultProps = {
    add: false,
    edit: false,
};

export default FranchiseBillingForm;
