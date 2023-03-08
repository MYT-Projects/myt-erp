import React, { useState } from "react";
import { Col, Form, Row, Tab, Tabs, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import AdjustmentTable from "./../../Inventory/Adjustment/AdjustmentTable";
import NoDataImg from "../../../Assets/Images/no-data-img.png"
import {
    dateFormat,
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    getType,
    TokenExpiry,
    getTodayDateISO
} from "../../../Helpers/Utils/Common"; 
import DatePicker from "react-datepicker";
import Moment from "moment";
import MarkModal from "./MarkModal";

import { getAllBanks } from "../../../Helpers/apiCalls/banksAPi";
import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { searchStoreDeposit, updateStatusStoreDeposit, deleteStoreDeposit } from "../../../Helpers/apiCalls/Reports/StoreDepositApi";
import { getCashCountReport } from "../../../Helpers/apiCalls/Reports/DailyCashCountApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";
import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../../Assets/Images/download_icon.png";
import { Fragment } from "react";


export default function StoreDeposit() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({
        transaction_type: "cash"
    })
    const [branches, setBranches] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [totalSales, setTotalSales] = useState([]);
    const [checkedPayments, setCheckedPayments] = useState([]);
    const [selectedTab, setSelectedTab] = useState("submitted");
    const [dailySales, setDailySales] = useState([]);

     /* delete modal handler */
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const handleShowDeleteModal = () => setShowDeleteModal(true);
     const handleCloseDeleteModal = () => setShowDeleteModal(false); 

     /* done Modal */
     const [showMarkAsDoneModal, setShowMarkAsDoneModal] = useState(false);
     const handleShowMarkAsDoneModal = () => (
        checkedPayments.length != 0
            ? setShowMarkAsDoneModal(true)
            : toast.error("Please select payment to mark as done", {
                  style: toastStyle(),
              })
        );
     const handleCloseMarkAsDoneModal = () => setShowMarkAsDoneModal(false);

     /* posted Modal */
     const [showMarkAsPostedModal, setShowMarkAsPostedModal] = useState(false);
     const handleShowMarkAsPostedModal = () => (
        checkedPayments.length != 0
            ? setShowMarkAsPostedModal(true)
            : toast.error("Please select payment to mark as posted", {
                  style: toastStyle(),
              })
        );
     const handleCloseMarkAsPostedModal = () => setShowMarkAsPostedModal(false);

    const [image, setImage] = useState("");
    const [showViewModal, setShowViewModal] = useState(false);
    const handleShowViewModal = (img) => {
        setImage(img)
        // setImage("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CCCCCCCCGCBCX+++++++CBDCCCCCCCCCCCCCCCCCCCCCFBBDf+++++++JBAqCCCCCCCCCCCCCCCCCCCCACBB++++++++JBACCCCCCCCCCCCCCCCCCCCCEDBV/wDvvvvvvqQQCAgUxAhMtQgggggggggggmQAU1/vvvvvvgwQKgtjgLpc4YggggggggggglQARn/vvvvvvoAQSgt4FPhoFKAghQQgghjywggAV/8A7777776AEKkIXEJGeyqkIAHk8wKU/wCCUABT/wDvvvvvrygQSwgkA4AAAJAF1cQgg1+OAhQAUPvvvvvvr6wQKQogAAAAAAEBQggwwwwgQ7gARvvvvvvvvqQQAgAABCABCAEQwgwwwwwwoAQAV/8A7777776kEB8IhviWnZNUEsIv8JOI8KxkMFD77777774kECVMBAaDBERgiIbt1taqWKLoMFPL7777776kEAgICgAAAABeEUnMIIILNQGoMFD77777776kECMIWsA0AABLoKkMMMIMOEIkMFD77777776sEBC05jKBKKCBXgYsc1Kc2gIQAFb77777774kEEIIAAEAEEEEAIIAIIIIAAIIEEf77777776EEEEEEEEEEEEEEEEEEEEEEEEEEEX7777777+IEEEEEEEEEEEEEEEEEEEEEEEEEFT77777776EEEEEEEEEEEEEEEEEEEEEEEEEEFP77777776AEEEEEEEEEEEEEEEEEEEEEEEEEEf77777774AEEEEEEEEEEEEEEEEEEEEIMIIIJb77777774ooAQIYoYsk0IUEEAEAAEEKqDr4gX777777778/wAm/Pvv/f8A3ppnO9zbTNP5DbPPLfvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv/EACMRAQACAgIDAQADAQEAAAAAAAEAERAxITAgQVFAUGFxgWD/2gAIAQMBAT8Q/lLlxmhOR3B/gKUgKSCVhcH5A2n90D4Qc0clMgO5xHwJUn+IzBhL/ER8h9EU8Q9xFeiDxh0NV2XxqAVwZywwBbz2Lj0M3dxK7FQ6eKy0aSA+R+CU+SkRXEVWsH4Ij0RgD3P6EFcRWo8o+iI+R+CEP8TkXho82CnnZ+iZoV5s352fokvi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")
        setShowViewModal(true);
    }
    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setImage("")
        setShowDetails(false)
    };

     const [selectedRow, setSelectedRow] = useState([]);
     const today = Moment().format("MM/DD/YYYY");

    const [banks, setBanks] = useState([]);
    const [transactionType, settransactionType] = useState({});
    const [transactionValue, settransactionValue] = useState([
        {
            name: "transaction_type",
            label: "Cash",
            value: "cash",
        }
    ]);
    const [transactionOptions, settransactionOptions] = useState([
        {
            name: "transaction_type",
            label: "Cash",
            value: "cash",
        },
        {
            name: "transaction_type",
            label: "GCash",
            value: "gcash",
        },
        {
            name: "transaction_type",
            label: "Food Panda",
            value: "food_panda",
        },
        {
            name: "transaction_type",
            label: "Grab Food",
            value: "grab_food",
        },
    ]);

    const excelHeaders = [
        // { label: "Sales Date", key: "sales_date" },
        { label: "Total Sales", key: "total_sales" },
        { label: "Branch Name", key: "branch_name" },
        { label: "Bank", key: "bank" },
        // { label: "DSR No.", key: "dsr_no" },
        { label: "Deposit Date", key: "deposited_on" },
        { label: "Transaction Type", key: "transaction_type" },
        // { label: "Deposited By", key: "deposited_by" },
    ];

    const dummy = [
        {
            id: "1",
            branch_name: "SM CITY CEBU",
            date: "December 2022",
            amount: "1000",
            added_by: "JOSE RIZAL",
        },
        {
            id: "2",
            branch_name: "SM CONSOLACION",
            date: "December 2022",
            amount: "1000",
            added_by: "JOSE RIZAL",
        },
    ]

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function handleSelectChange(e, row) {
        setSelectedRow(row);
        console.log(row)

        if (e.target.value === "view") {
            fetchReport(row.branch_id, row.sales_date)
            handleShowViewModal(row.image_attachment? row.image_attachment : "")
        } else if (e.target.value === "delete") {
            handleShowDeleteModal();
        }
    }


    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row)}
            >
                <option value="" hidden selected>
                    Select
                </option>
                <option value="view" className="color-options">
                    View
                </option>
                { accountType === "office" && filterConfig.tab !== "all" ? (
                    <option value="markposted" className="color-options">
                        Mark as Posted
                    </option>
                    ): null
                }
                { accountType === "admin" && filterConfig.tab !== "all" ? (
                    <option value="markdone" className="color-options">
                        Mark as Done
                    </option>
                    ): null
                }
            </Form.Select>
        );
    }

    function ViewBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row)}
            >
                View
            </button>
        );
    }
    function handlePrint(row) {
        console.log(row)
        setSelectedRow(row);
        fetchReport(row.branch_id, row.sales_date)
        handleShowViewModal(row.image_attachment? row.image_attachment : "")
    }

    const handleTabSelect = (key) => {
        setCheckedPayments([])
        if(key === "submitted" || key === "posted") {
            setSelectedTab(key);
        } else {
            setSelectedTab("");
        }

        setFilterConfig((prev) => {
            return {
                ...prev,
                tab: key,
                status: key !== "all" ? key : ""};
        });
    };
    // console.log(filterConfig)

    function handleOnCheck(row) {
        setCheckedPayments(row.selectedRows);
    }
    
    async function fetchBanks() {
        const response = await getAllBanks();
        var banks = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = banks.map((bank) => {
            var info = bank;
            info.label = bank.name
            info.value = bank.id
            return info;
        });
        setBanks([{label: "All Banks", value:""}, ...cleanedArray]);
    }

    async function fetchBranches() {
        setShowLoader(true);

        const response = await getAllBranches();
        if (response.error) {
        } else {
            var allBranches = response.data.data.data.map((data) => {
                var branch = data;
                branch.label = data.name
                branch.value = data.id
                return branch;
            });
            setBranches([{label: "All Branches", value:""}, ...allBranches]);
        }
        setShowLoader(false);
    }

    async function fetchData() {
        setShowLoader(true);
        setExpenses([])
        setTotalSales("")

        const response = await searchStoreDeposit(filterConfig);

        if (response.error) {
            setTotalSales("0")
        } else {
            var allBills = response.data.data.map((bill) => {
                var info = bill;
                // info.deposited_on = Moment(bill.deposited_on).format("MM-DD-YYYY");
                info.bank = bill.bank_deposited;
                info.total_sales = numberFormat(bill.total_sales);
                return info;
            });
            setExpenses(allBills)

            var total = response.data.summary? response.data.summary.total_sales : "0";
            setTotalSales(total);

        }
        setShowLoader(false);
    }

    async function fetchReport(id, date) {
        setShowLoader(true);
        setDailySales([])

        const response = await getCashCountReport(id, date);
        console.log(response);

        if (response.error) {
            console.log(response);
        } else {
            var dailysales = response.data.daily_sales[0]
            setDailySales(dailysales)
        }
        setShowLoader(false);
    }

    async function handleDeleteExpense() {
        const response = await deleteStoreDeposit(selectedRow.id);
        if (response.data) {
            toast.success("Expense Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Expense", {
                style: toastStyle(),
            });
        }
    }

    async function handleMarkAsDone() {
        console.log(checkedPayments)
        const response = await updateStatusStoreDeposit(checkedPayments, "checked");
        console.log(response)
        if (response.data) {
            toast.success("Payments successfully marked as done!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else if (response.error) {
            TokenExpiry(response);
            toast.error(
                "Something went wrong",
                { style: toastStyle() }
            );
            setTimeout(() => refreshPage(), 1000);
        }
    }

    async function handleMarkAsPosted() {
        console.log(checkedPayments)
        const response = await updateStatusStoreDeposit(checkedPayments, "posted");
        console.log(response)
        if (response.data) {
            toast.success("Payments successfully marked as posted!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else if (response.error) {
            TokenExpiry(response);
            toast.error(
                "Something went wrong",
                { style: toastStyle() }
            );
            setTimeout(() => refreshPage(), 1000);
        }
    }

    React.useEffect(() => {
        fetchBranches();
        fetchBanks();
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [filterConfig]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"DS REPORTS"}
                />
            </div>

            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-3">
                    <Col xs={6}>
                        <h1 className="page-title"> STORE DEPOSIT </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="branch_name"
                            placeholder="Search branch name"
                            className="search-bar"
                            onChange={handleOnSearch}
                        ></input>
                    </Col>
                </Row>

                <div className="row mb-4 my-2 PO-filters d-flex filter">
                    <Row>
                        <Col xs={6}>
                            <Select
                                className="dropsearch-filter-col px-2 py-0 me-2 "
                                classNamePrefix="react-select"
                                defaultValue={transactionValue}
                                options={transactionOptions}
                                onChange={(e) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, "transaction_type": e.value };
                                    });
                                }}
                            />
                        </Col>
                        <Col className="d-flex justify-content-end mb-4">
                            <div className="justify-content-center align-items-center ">
                                <CSVLink
                                    className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                    data={expenses}
                                    headers={excelHeaders}
                                    target="_blank"
                                    filename={`${getTodayDateISO()} Store Deposit`}
                                >
                                    <span className="me-2">
                                        <img
                                            width={20}
                                            height={20}
                                            src={downloadIcon}
                                        ></img>
                                    </span>
                                    Download Excel
                                </CSVLink>
                            </div>
                        </Col>
                    </Row>
                </div>

                <Tabs
                    activeKey={filterConfig.shop}
                    // defaultActiveKey={filterConfig.shop}
                    id="PO-tabs"
                    className="manager-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="submitted" title="Submitted">
                        <div className="tab-content">
                            {/* filters */}
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={branches}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "branch_id": e.value };
                                        });}}
                                />

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Bank"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={banks}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "bank_id": e.value };
                                        });}}
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    From:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_from}
                                    name="date_from"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_from: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    To:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_to}
                                    name="date_to"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_to: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />
                            </div>

                            <div className=" PO-filters d-flex justify-content-center">
                                <span className="me-4 ml-4 mt-2 ps-label">
                                    Total Deposited Amount: {numberFormat(totalSales)}
                                </span>
                            </div>

                            <div className="below">
                                {/* table */}
                                <AdjustmentTable
                                    tableHeaders={[
                                        "-",
                                        // "SALES DATE",
                                        // "DOC SALES",
                                        "TOTAL SALES",
                                        "BRANCH",
                                        "TOTAL DEPOSIT",
                                        // "DSR NO.",
                                        "BANK",
                                        "DEPOSIT DATE",
                                        "TRANSACTION TYPE",
                                        // "DEPOSITED BY",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        // "sales_date",
                                        // "doc_sales",
                                        "total_sales",
                                        "branch_name",
                                        "total_deposit",
                                        // "dsr_no",
                                        "bank",
                                        "deposited_on",
                                        "transaction_type",
                                        // "deposited_by",
                                    ]}
                                    tableData={expenses}
                                    // tableData={dummy}
                                    ActionBtn={(row) => ActionBtn(row)}
                                    ViewBtn={(row) => ViewBtn(row)}
                                    handleOnCheck={(row) => handleOnCheck(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>
                    <Tab eventKey="posted" title="Posted">
                        <div className="tab-content">
                            {/* filters */}
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>

                                {/* <Form.Select
                                    name="transaction_type"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Types
                                    </option>
                                    <option value="cash"> Cash Deposit</option>
                                    <option value="foodpanda"> Food Panda Deposit</option>
                                    <option value="grabfood"> Grab Food Deposit </option>
                                </Form.Select> */}

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={branches}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "branch_id": e.value };
                                        });}}
                                />

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Bank"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={banks}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "bank_id": e.value };
                                        });}}
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    From:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_from}
                                    name="date_from"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_from: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    To:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_to}
                                    name="date_to"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_to: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />
                            </div>

                            <div className=" PO-filters d-flex justify-content-center">
                                <span className="me-4 ml-4 mt-2 ps-label">
                                    Total Sales: {numberFormat(totalSales)}
                                </span>
                            </div>

                            <div className="below">
                                {/* table */}
                                <AdjustmentTable
                                    tableHeaders={[
                                        "-",
                                        // "SALES DATE",
                                        // "DOC SALES",
                                        "TOTAL SALES",
                                        "BRANCH",
                                        "TOTAL DEPOSIT",
                                        // "DSR NO.",
                                        "BANK",
                                        "DEPOSIT DATE",
                                        "TRANSACTION TYPE",
                                        // "DEPOSITED BY",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        // "sales_date",
                                        // "doc_sales",
                                        "total_sales",
                                        "branch_name",
                                        "total_deposit",
                                        // "dsr_no",
                                        "bank",
                                        "deposited_on",
                                        "transaction_type",
                                        // "deposited_by",
                                    ]}
                                    tableData={expenses}
                                    // tableData={dummy}
                                    ActionBtn={(row) => ActionBtn(row)}
                                    ViewBtn={(row) => ViewBtn(row)}
                                    handleOnCheck={(row) => handleOnCheck(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>
                    <Tab eventKey="done" title="Done">
                    <div className="tab-content">
                            {/* filters */}
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>

                                {/* <Form.Select
                                    name="transaction_type"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Types
                                    </option>
                                    <option value="cash"> Cash Deposit</option>
                                    <option value="foodpanda"> Food Panda Deposit</option>
                                    <option value="grabfood"> Grab Food Deposit </option>
                                </Form.Select> */}

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Bank"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={banks}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "bank_id": e.value };
                                        });}}
                                />

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={branches}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "branch_id": e.value };
                                        });}}
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    From:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_from}
                                    name="date_from"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_from: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    To:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_to}
                                    name="date_to"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_to: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />
                            </div>

                            <div className=" PO-filters d-flex justify-content-center">
                                <span className="me-4 ml-4 mt-2 ps-label">
                                    Total Sales: {numberFormat(totalSales)}
                                </span>
                            </div>

                            <div className="below">
                                {/* table */}
                                <Table
                                    tableHeaders={[
                                        "-",
                                        // "SALES DATE",
                                        // "DOC SALES",
                                        "TOTAL SALES",
                                        "BRANCH",
                                        "TOTAL DEPOSIT",
                                        // "DSR NO.",
                                        "BANK",
                                        "DEPOSIT DATE",
                                        "TRANSACTION TYPE",
                                        // "DEPOSITED BY",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        // "sales_date",
                                        // "doc_sales",
                                        "total_sales",
                                        "branch_name",
                                        "total_deposit",
                                        // "dsr_no",
                                        "bank",
                                        "deposited_on",
                                        "transaction_type",
                                        // "deposited_by",
                                    ]}
                                    tableData={expenses}
                                    // tableData={dummy}
                                    ActionBtn={(row) => ActionBtn(row)}
                                    ViewBtn={(row) => ViewBtn(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>
                    <Tab eventKey="all" title="All">
                    <div className="tab-content">
                            {/* filters */}
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>

                                {/* <Form.Select
                                    name="transaction_type"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Types
                                    </option>
                                    <option value="cash"> Cash Deposit</option>
                                    <option value="foodpanda"> Food Panda Deposit</option>
                                    <option value="grabfood"> Grab Food Deposit </option>
                                </Form.Select> */}

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={branches}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "branch_id": e.value };
                                        });}}
                                />

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Bank"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                        borderRadius: "7px",
                                        border: "0px",
                                        minHeight: "20px",
                                        maxHeight: "35px",
                                        }),
                                        input: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: state.isSelected? "white": "white",
                                            
                                        }),
                                        dropdownIndicator: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        singleValue: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        placeholder: (baseStyles, state) => ({
                                            ...baseStyles,
                                            color: "white"
                                            
                                        }),
                                        
                                    }}
                                    // value={branch}
                                    options={banks}
                                    onChange={(e) => { setFilterConfig((prev) => {
                                            return { ...prev, "bank_id": e.value };
                                        });}}
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    From:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_from}
                                    name="date_from"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_from: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    To:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_to}
                                    name="date_to"
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_to: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />
                            </div>

                            <div className=" PO-filters d-flex justify-content-center">
                                <span className="me-4 ml-4 mt-2 ps-label">
                                    Total Sales: {numberFormat(totalSales)}
                                </span>
                            </div>

                            <div className="below">
                                {/* table */}
                                <Table
                                    tableHeaders={[
                                        "-",
                                        // "SALES DATE",
                                        // "DOC SALES",
                                        "TOTAL SALES",
                                        "BRANCH",
                                        "TOTAL DEPOSIT",
                                        // "DSR NO.",
                                        "BANK",
                                        "DEPOSIT DATE",
                                        "TRANSACTION TYPE",
                                        // "DEPOSITED BY",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        // "sales_date",
                                        // "doc_sales",
                                        "total_sales",
                                        "branch_name",
                                        "total_deposit",
                                        // "dsr_no",
                                        "bank",
                                        "deposited_on",
                                        "transaction_type",
                                        // "deposited_by",
                                    ]}
                                    tableData={expenses}
                                    // tableData={dummy}
                                    ActionBtn={(row) => ActionBtn(row)}
                                    ViewBtn={(row) => ViewBtn(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>
                </Tabs>
                {selectedTab === "submitted" && accountType === "admin" ? (
                    <>
                        <div className="d-flex justify-content-end pt-3 mb-3 mr-3">
                            <button
                                type="button"
                                className="button-primary mr-3 "
                                onClick={() => handleShowMarkAsPostedModal()}
                            >
                                Mark as Posted
                            </button>
                        </div>
                    </>
                ) : (
                    <></>
                )}
                {selectedTab === "posted" && accountType === "admin" ? (
                    <>
                        <div className="d-flex justify-content-end pt-3 mb-3 mr-3">
                            <button
                                type="button"
                                className="button-primary mr-3 "
                                onClick={() => handleShowMarkAsDoneModal()}
                            >
                                Mark as Done
                            </button>
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </div>

            {/* modals */}
            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="expenses"
                onDelete={handleDeleteExpense}
            />
            <MarkModal
                show={showMarkAsDoneModal}
                hide={handleCloseMarkAsDoneModal}
                type="mark this store deposit as done?"
                ids={checkedPayments}
                handler={handleMarkAsDone}
            />
            <MarkModal
                show={showMarkAsPostedModal}
                hide={handleCloseMarkAsPostedModal}
                type="mark this store deposit as posted?"
                ids={checkedPayments}
                handler={handleMarkAsPosted}
            />
            <Modal show={showViewModal} onHide={()=>handleCloseViewModal()} size="lg" centered>
                <Modal.Header closeButton/>
                <Modal.Body className='pt-5'>
                    {
                        image !== "" ? (
                            <>
                                <div className='row justify-content-center mb-4'>
                                    <div className='col-sm-12 align-center' style={{textAlignLast:"center"}}><img src={`data:image/png;base64,${image}`} width={400} height={400}/></div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="no-data-cont mb-4">
                                    <div className='mt-5 mb-2' style={{textAlignLast:"center"}} alt="no data found"><img src={NoDataImg} width={400} height={400}/></div>
                                    <span>Uh Oh! No Receipt found.</span>
                                </div>
                            </>
                        )
                    }
                    {
                        showDetails && (
                            <>
                                <div className="review-container mx-2 p-3">
                                    <Row className="nc-modal-custom-row-view">
                                        <Col xs={4}>
                                            Sales Date
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.sales_date ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xs={4}>
                                            Reference No
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.reference_no ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="nc-modal-custom-row-view">
                                        <Col>
                                            Deposited To
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.bank_deposited ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            Deposited On
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.deposited_on ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            Deposited By
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.deposited_by ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>

                                <Row className="review-container d-flex mb-1 justify-content-center p-3 mx-2">
                                    <Row className=" justify-content-center">
                                        <Row>
                                            <span className="edit-label">
                                                TOTAL CASH SALES
                                            </span>
                                        </Row>
                                        <Col xs={5} className='p-2 m-1'>
                                            <Row>
                                                <Col xs={6}></Col>
                                                <Col className="text-end" xs={3}><span className="print-data justify-content-center green">Remitted</span></Col>
                                                <Col className="text-end" xs={3}><span className="print-data justify-content-center green">System</span></Col>
                                            </Row>
                                            <Row className="mt-2">
                                                <Col xs={6}><span className="print-data justify-content-center green"></span></Col>
                                                <Col className="text-end" xs={3}><span className="print-data text-end">{dailySales.actual_cash_sales ? numberFormat(dailySales.actual_cash_sales) : '0.00'}</span></Col>
                                                <Col className="text-end" xs={3}><span className="print-data text-end">{dailySales.system_cash_sales ? numberFormat(dailySales.system_cash_sales) : '0.00'}</span></Col>
                                            </Row>
                                            <Row className="mt-2">
                                                <Col xs={6}><span className="print-data justify-content-center green">Total Expense</span></Col>
                                                <Col className="text-end" xs={3}><span className="print-data text-end">+{dailySales.total_expense ? numberFormat(dailySales.total_expense) : '0.00'}</span></Col>
                                                <Col className="text-end" xs={3}><span className="print-data text-end">-{dailySales.total_expense ? numberFormat(dailySales.total_expense) : '0.00'}</span></Col>
                                            </Row>
                                            <hr/>
                                            <Row className="">
                                                <Col xs={6}><h5 className="print-data"></h5></Col>
                                                <Col className="text-end" xs={3}><span className="print-data text-end green">{dailySales.actual_cash_sales ? numberFormat(parseFloat(dailySales.actual_cash_sales) + parseFloat(dailySales.total_expense)) : '0.00'}</span></Col>
                                                <Col className="text-end" xs={3}><span className="print-data text-end green">{dailySales.system_cash_sales ? numberFormat(parseFloat(dailySales.system_cash_sales) - parseFloat(dailySales.total_expense)) : '0.00'}</span></Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Row>
                                <Fragment>
                                    <Row className="review-container py-3 me-2 ms-2 mt-3">
                                        <Row>
                                            <span className="edit-label">
                                                CASH SALES SUMMARY
                                            </span>
                                        </Row>
                                        <Row>
                                            <Col xs={8}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-left ms-5 mt-1 mb-1">
                                                    Actual Cash Sales   
                                                </Row>
                                                <Row className="justify-content-left ms-5 mt-1 mb-1">
                                                    System Cash Sales   
                                                </Row>
                                            </Col>
                                            <Col xs={4}  className="print-data pl-2 mt-2 mb-1">
                                                <Row className="justify-content-end me-5">
                                                    {dailySales.actual_cash_sales ? numberFormat(dailySales.actual_cash_sales) : "0.00"}
                                                </Row>
                                                <Row className="justify-content-end mt-1 me-5">
                                                    {dailySales.system_cash_sales ? numberFormat(dailySales.system_cash_sales) : "0.00"}
                                                </Row>
                                            </Col>
                                        </Row>
                                        <div className="break "> </div>
                                        <Row>
                                            <Col xs={8}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-left ms-5">
                                                    OVERAGE/SHORTAGE
                                                </Row>
                                            </Col>
                                            <Col xs={4}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-end me-5">
                                                    {dailySales.cash_sales_overage ? numberFormat(dailySales.cash_sales_overage) : "0.00"}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Row>
                                </Fragment>
                                <Fragment>
                                    <Row className="review-container py-3 me-2 ms-2 mt-3">
                                        <Row>
                                            <span className="edit-label">
                                                TOTAL SALES SUMMARY
                                            </span>
                                        </Row>
                                        <Row>
                                            <Col xs={5}></Col>
                                            <Col xs={3} className="print-data mt-2 mb-1">
                                                <Row className="justify-content-center mt-1 mb-1">
                                                    Actual Cash Sales   
                                                </Row>
                                                <Row className="justify-content-center mt-1 mb-1">
                                                    {dailySales.actual_cash_sales ? numberFormat(dailySales.actual_cash_sales) : "0.00"}
                                                </Row>
                                            </Col>
                                            <Col xs={1}>
                                                <div className="vl"></div>
                                            </Col>
                                            <Col xs={3} className="print-data mt-2 mb-1">
                                                <Row className="justify-content-center mt-1 mb-1">
                                                    System Cash Sales   
                                                </Row>
                                                <Row className="justify-content-center mt-1 mb-1">
                                                    {dailySales.system_cash_sales ? numberFormat(dailySales.system_cash_sales) : "0.00"}
                                                </Row>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={3}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-right ms-5 mt-1 mb-1">
                                                    GCASH Sales
                                                </Row>
                                                <Row className="justify-content-right ms-5 mt-1 mb-1">
                                                    Food Panda Sales
                                                </Row>
                                                <Row className="justify-content-right ms-5 mt-1 mb-1">
                                                    Grab Food Sales
                                                </Row>
                                            </Col>
                                            <Col xs={4}></Col>
                                            <Col xs={3}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-center mt-1 mb-1">
                                                    {dailySales.gcash_sales ? numberFormat(dailySales.gcash_sales) : "0.00"}
                                                </Row>
                                                <Row className="justify-content-center mt-1 mb-1">
                                                    {dailySales.food_panda_sales ? numberFormat(dailySales.food_panda_sales) : "0.00"}
                                                </Row>
                                                <Row className="justify-content-center mt-1 mb-1">
                                                    {dailySales.grab_food_sales ? numberFormat(dailySales.grab_food_sales) : "0.00"}
                                                </Row>
                                            </Col>
                                        </Row>
                                        <div className="break "> </div>
                                        <Row>
                                            <Col xs={5}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-right ms-5 green">
                                                    TOTAL SALES
                                                </Row>
                                            </Col>
                                            <Col xs={3}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-center green">
                                                    {dailySales.actual_total_sales ? numberFormat(dailySales.actual_total_sales) : "0.00"}
                                                </Row>
                                            </Col>
                                            <Col xs={1}></Col>
                                            <Col xs={3}  className="print-data mt-2 mb-1">
                                                <Row className="justify-content-center green">
                                                    {dailySales.system_total_sales ? numberFormat(dailySales.system_total_sales): "0.00"}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Row>
                                </Fragment>
                            </>
                        )
                    }

                    <div className='d-flex justify-content-end my-4'>
                        <button
                            className="button-secondary"
                            onClick={()=>handleCloseViewModal()}
                        >
                            Close
                        </button>
                        <button
                            className="button-primary ms-2"
                            onClick={()=>setShowDetails(!showDetails)}
                        >
                            View Details
                        </button>
                    </div>
                
                </Modal.Body>
            </Modal>
        </div>
    );
}
