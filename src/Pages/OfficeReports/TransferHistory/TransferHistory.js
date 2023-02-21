import React, { useState } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import AdjustmentTable from "./../../Inventory/Adjustment/AdjustmentTable";
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
import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../../Assets/Images/download_icon.png";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { searchTransferHistory, searchTransferHistoryPotato } from "../../../Helpers/apiCalls/Reports/TransferHistoryApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";
import { getAllItems } from "../../../Helpers/apiCalls/itemsApi";


export default function TransferHistory() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({})
    const [branches, setBranches] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [expensesCsv, setExpensesCsv] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [totalBranchFromTransfers, setTotalBranchFromTransfers] = useState([]);
    const [totalBranchToTransfers, setTotalBranchToTransfers] = useState([]);
    const [totalTransfers, setTotalTransfers] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [items, setItems] = useState([]);
    const excelHeaders = [
        { label: "Total Transfers", key: "total_transfers" },
        { label: "Total Quantity", key: "total_quantity" },
        { label: "Item Name", key: "name" },
        { label: "Unit", key: "unit" },
        { label: "Quantity", key: "total_qty" },
        { label: "Branch From", key: "source_branch" },
        { label: "Branch To", key: "destination_branch" },
    ];
    
    const [branchFrom, setBranchFrom] = useState("");
    const [branchTo, setBranchTo] = useState("");


     /* delete modal handler */
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const handleShowDeleteModal = () => setShowDeleteModal(true);
     const handleCloseDeleteModal = () => setShowDeleteModal(false); 
     const [selectedRow, setSelectedRow] = useState([]);

    const dummy = [
        {
            id: "1",
            branch_name: "SM CITY CEBU",
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

        if (e.target.value === "view") {
            {
                window.open('/dailyexpenses/view/' + row.id ,'_blank')
            };
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
                { accountType === "admin" ? (
                    <option value="view" className="color-options">
                        View
                    </option>
                    ): null
                }
                { accountType === "admin" ? (
                    <option value="delete" className="color-red">
                        Delete
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
                // value="payment-pi"
            >
                View
            </button>
        );
    }
    function handlePrint(row) {
        {
            window.open('/transferhistory/view/' + row.id ,'_blank')
        };
    }

    function handleItemChange(e){
        const toFilter = {target: {name: "item_id", value: e.value}};
        handleOnSearch(toFilter);
    }

    function handleBranchFromChange(e){
        setBranchFrom(e.name);
        const toFilter = {target: {name: "branch_from", value: e.value}};
        handleOnSearch(toFilter);
    }

    function handleBranchToChange(e){
        setBranchTo(e.name);
        const toFilter = {target: {name: "branch_to", value: e.value}};
        handleOnSearch(toFilter);
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

    async function fetchAllItems() {
        const response = await getAllItems();

        if (response.response.data) {
            var data = response.response.data.map((item) => {
                var info = item;
                info.label = item.name
                info.value = item.id
                return info;
            });
            setItems([{label: "All Items", value:""}, ...data]);
        } else {
        }
    }

    async function fetchData() {
        setShowLoader(true);
        setExpenses([])
        var allData = [];
        var total = {
            total_transfers: "",
            total_quantity: "",
        }

        const response = await searchTransferHistory(filterConfig);

        if (response.error) {
        } else {
            var allBills = response.data.data.map((bill) => {
                var info = bill;
                info.expense_date = Moment(bill.expense_date).format("MM-DD-YYYY")
                info.total_qty = numberFormat(bill.total_qty)
                allData.push(info);
                return info;
            });

            var totaltransfers = response.data.summary? response.data.summary.total_transfers : "0";
            var totalqty = response.data.summary? response.data.summary.total_qty : "0";
            total["total_transfers"] = numberFormat(totaltransfers);
            total["total_quantity"] = numberFormat(totalqty);
            setTotalTransfers(totaltransfers);
            setTotalQuantity(totalqty);

        }

        const response2 = await searchTransferHistoryPotato(filterConfig);
        if (response2.error) {
        } else {
            var allBills2 = response2.data.data.map((bill) => {
                var info = bill;
                info.expense_date = Moment(bill.expense_date).format("MM-DD-YYYY")
                info.total_qty = numberFormat(bill.total_qty)
                allData.push(info);
                return info;
            });

            var totaltransfers = response2.data.summary? response2.data.summary.total_transfers + totalBranchToTransfers : "0";
            var totalqty = response2.data.summary? response2.data.summary.total_qty + totalQuantity: "0";
            total["total_transfers"] = numberFormat(totaltransfers);
            total["total_quantity"] = numberFormat(totalqty);
            setTotalTransfers(totaltransfers);
            setTotalQuantity(totalqty);
        }
        setExpenses(allData)
        setExpensesCsv([total, ...allData])
        setShowLoader(false);
    }

    React.useEffect(() => {
        fetchBranches();
        fetchAllItems();
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
                    active={"OFFICE REPORTS"}
                />
            </div>

            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-1">
                    <Col xs={6}>
                        <h1 className="page-title"> TRANSFER HISTORY </h1>
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-3">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={expensesCsv}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} 'TransferHistory'`}
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

                <div className="tab-content">
                    {/* filters */}
                    <div className="my-2 px-2 PO-filters d-flex">
                        <span className="me-4 align-middle mt-2 ps-label">
                            Filter By:
                        </span>
                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Item"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
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
                            options={items}
                            onChange={handleItemChange}
                        />
                        {/* <Form.Select
                            name="item_id"
                            className="date-filter me-2"
                            defaultValue={filterConfig.item_id}
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                All Items
                            </option>
                            {items.length > 0 ? (
                                items.map((data) => {
                                    return (
                                        <option value={data.id}>
                                            {data.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No item found)
                                </option>
                            )}
                        </Form.Select> */}

                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Branch From"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
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
                            // value={branchFrom}
                            options={branches}
                            onChange={handleBranchFromChange}
                        />
                        {/* <Form.Select
                            name="branch_from"
                            className="date-filter me-2"
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                Branch from
                            </option>
                            {branches.length > 0 ? (
                                branches.filter((v, i) => {
                                    return (
                                        branches.map((val) => val.id).indexOf(v.id) == i
                                    );
                                })
                                .map((branch) => {
                                    return (
                                        <option
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No branch found)
                                </option>
                            )}
                        </Form.Select> */}

                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Branch To"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
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
                            // value={branchTo}
                            options={branches}
                            onChange={handleBranchToChange}
                        />
                        {/* <Form.Select
                            name="branch_to"
                            className="date-filter me-2"
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                Branch to
                            </option>
                            {branches.length > 0 ? (
                                branches.filter((v, i) => {
                                    return (
                                        branches.map((val) => val.id).indexOf(v.id) == i
                                    );
                                })
                                .map((branch) => {
                                    return (
                                        <option
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No branch found)
                                </option>
                            )}
                        </Form.Select> */}

                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            selected={filterConfig.date_from}
                            name="date_from"
                            placeholderText={"Select Date"}
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
                            placeholderText={"Select Date"}
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

                    <div className="my-2 px-2 PO-filters d-flex justify-content-center">

                        <span className="me-4 ml-4 align-middle mt-2 ps-label">
                            Total Transfers: {numberFormat(totalTransfers)}
                        </span>

                        <span className="me-4 ml-8 align-middle mt-2 ps-label">
                            Total Quantity: {numberFormat(totalQuantity)}
                        </span>
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "ITEM NAME",
                                "UNIT",
                                "QTY",
                                "BRANCH FROM",
                                "BRANCH TO",
                            ]}
                            headerSelector={[
                                "name",
                                "unit",
                                "total_qty",
                                "source_branch",
                                "destination_branch",
                            ]}
                            tableData={expenses}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>
        </div>
    );
}
