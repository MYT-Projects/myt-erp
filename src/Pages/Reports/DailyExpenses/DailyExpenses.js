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
    TokenExpiry
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { searchExpenses, deleteExpenses } from "../../../Helpers/apiCalls/Reports/DailyExpensesApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";
import { searchBranch } from "../../../Helpers/apiCalls/Manage/Branches";


export default function DailyExpenses() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({
        by_branch: 0
    })
    const [branches, setBranches] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false); 
    const [selectedRow, setSelectedRow] = useState([]);
    const today = Moment().format("MM/DD/YYYY");
    const [branchOptions, setBranchOptions] = useState([]);
     
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
            navigate("/dailyexpenses/view/" + row.branch_id, {
                state: { 
                    branch_id: row.branch_id,
                    // date: row.datetime ? row.datetime : today, 
                    date_from: filterConfig.date_from? filterConfig.date_from : today, 
                    date_to: filterConfig.date_to? filterConfig.date_to : today,
                },
            });
            // {
            //     window.open('/dailyexpenses/view/' + row.id ,'_blank')
            // };
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
        navigate("/dailyexpenses/view/" + row.branch_id, {
            state: { 
                branch_id: row.branch_id,
                // date: row.datetime ? row.datetime : today, 
                date_from: filterConfig.date_from? filterConfig.date_from : today, 
                date_to: filterConfig.date_to? filterConfig.date_to : today,
            },
        });
        // {
        //     window.open('/dailyexpenses/view/' + row.id ,'_blank')
        // };
    }

    async function fetchBranches() {
        setShowLoader(true);

        const response = await searchBranch({is_franchise: "0"});

        if (response.data) {
            var data = response.data.data;
            var sortedData = data.sort((a, b) =>
                a.name.toUpperCase() > b.name.toUpperCase()
                    ? 1
                    : b.name.toUpperCase() > a.name.toUpperCase()
                    ? -1
                    : 0
            );
            setBranches(sortedData.reverse());
        } else {
        }
        setShowLoader(false);
    }

    async function fetchData() {
        setShowLoader(true);
        setExpenses([])

        const response = await searchExpenses(filterConfig);

        if (response.error) {
        } else {
            var allBills = response.data.data.map((bill) => {
                var info = bill;
                info.grand_total = numberFormat(bill.grand_total)
                info.expense_date = Moment(bill.expense_date).format("MM-DD-YYYY")
                return info;
            });
            setExpenses(allBills)
        }
        setShowLoader(false);
    }

    async function handleDeleteExpense() {
        const response = await deleteExpenses(selectedRow.id);
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

    React.useEffect(() => {
        fetchBranches();
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [filterConfig]);

    React.useEffect(()=>{
        setBranchOptions(branches.map((_branch)=>{
            var retval = {label: _branch.name, value:_branch.id}
            return retval;
        }))
        setBranchOptions((branchesOptions)=>{
            var newBranches = [...branchesOptions];
            newBranches.push({label: "All Branches", value:""})
            return newBranches.reverse();
        });
    },[branches])

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
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> DAILY EXPENSES </h1>
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
                            // defaultValue={{label: "All Branches", value:""}}
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
                            options={branchOptions}
                            onChange={(e) => {
                            setFilterConfig((prev) => {
                                return {
                                    ...prev,
                                    branch_id: e.value,
                                };
                            })}}
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

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE",
                                "BRANCH",
                                "AMOUNT",
                                "ADDED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "expense_date",
                                "branch_name",
                                "grand_total",
                                "encoded_by_name",
                            ]}
                            tableData={expenses}
                            ActionBtn={(row) => ActionBtn(row)}
                            ViewBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>

            {/* modals */}
            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="expeses"
                onDelete={handleDeleteExpense}
            />
        </div>
    );
}
