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
    getTime,
    getMilitaryTime
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { getAllBranches, searchBranch, searchBranchStatus } from "../../../Helpers/apiCalls/Manage/Branches";
import { getAllBranchesPotato } from "../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import { searchBranchPotato, searchBranchStatusPotato } from "../../../Helpers/apiCalls/PotatoCorner/Manage/Branches";

export default function BranchList() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const today = Moment().format("MM/DD/YYYY");

    const [filterConfig, setFilterConfig] = useState({
        tab: "mango",
        branch_type: "company-owned",
        date_from: dateToday
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
            window.open('/dailyexpenses/view/' + row.id ,'_blank')
        };
    }

    function BranchStatus(row) {
        return (
            <span >
                {row.status === "closed" ?  
                    <span >🔴</span> : 
                    <span >🟢</span> 
                }
                 {row.status.toUpperCase()}
            </span>
        );
    }

    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };

    async function fetchBranches() {
        setShowLoader(true);
        setBranches([])
        
        if (filterConfig.tab === "mango") {
            const response = await getAllBranches();
            if (response.error) {
            } else {
                var allBranches = response.data.data.data.filter((company) => { return company.is_franchise === "0"})
                .map((data) => {
                    var branch = data;
                    // branch.name = "branch_id"
                    branch.label = data.name
                    branch.value = data.id
                    return branch;
                });
                setBranches([{label: "All Branches", value:""}, ...allBranches]);
            }
        } else if (filterConfig.tab === "potato") {
            const response = await getAllBranchesPotato();
            // console.log(response)
            if (response.error) {
            } else {
                var allBranches = response.data.data.filter((company) => { return company.is_franchise === "0"})
                .map((data) => {
                    var branch = data;
                    // branch.name = "branch_id"
                    branch.label = data.name
                    branch.value = data.id
                    return branch;
                });
                setBranches([{label: "All Branches", value:""}, ...allBranches]);
            }
        }
        
        setShowLoader(false);
    }

    // console.log(filterConfig)

    async function fetchData() {
        setShowLoader(true);
        setExpenses([])

        if (filterConfig.tab === "mango") {
            const response = await searchBranchStatus(filterConfig);
            if (response.error) {
            } else {
                var allBills = response.data.data.map((bill) => {
                    var info = bill;
                    info.time_open = bill.time_open ? getTime(bill.time_open) : ""
                    info.time_close = bill.time_close ? getTime(bill.time_close) : ""
                    // var open = bill.time_open !== "N/A" ? Moment(bill.operation_schedule.split("-")[1]).format("hh:mm:ss A") : "Close"
                    // if(open !== "Close") {
                    //     console.log(getMilitaryTime(new Date()), getMilitaryTime(bill.operation_schedule.split("-")[1]), getMilitaryTime(bill.operation_schedule.split("-")[3]))
                    //     console.log((getMilitaryTime(new Date()) >= getMilitaryTime(bill.operation_schedule.split("-")[1])) && 
                    //                 (getMilitaryTime(new Date()) <= getMilitaryTime(bill.operation_schedule.split("-")[3])))
                    //     if((getMilitaryTime(new Date()) >= getMilitaryTime(bill.operation_schedule.split("-")[1])) && (getMilitaryTime(new Date()) <= getMilitaryTime(bill.operation_schedule.split("-")[3]))){
                    //         info.status = "OPEN"
                    //     } else {
                    //         info.status = "CLOSE"
                    //     }
                    // } else {
                    //     info.status = "CLOSE"
                    // }
                    return info;
                });
                setExpenses(allBills)
            }
        } else if (filterConfig.tab === "potato") { 
            const response2 = await searchBranchStatusPotato(filterConfig);
            if (response2.error) {
            } else {
                var allBills = response2.data.data.map((bill) => {
                    var info = bill;
                    info.time_open = bill.time_open ? getTime(bill.time_open) : "N/A"
                    info.time_close = bill.time_close ? getTime(bill.time_close) : "N/A"
                    // info.time_open = bill.operation_schedule ? getTime(bill.operation_schedule.split("-")[1]) : "N/A"
                    // info.time_close = bill.operation_schedule ? getTime(bill.operation_schedule.split("-")[3]) : "N/A"
                    // var open = bill.time_open !== "N/A" ? Moment(bill.operation_schedule.split("-")[1]).format("hh:mm:ss A") : "Close"
                    // if(open !== "Close") {
                    //     console.log(getMilitaryTime(new Date()), getMilitaryTime(bill.operation_schedule.split("-")[1]), getMilitaryTime(bill.operation_schedule.split("-")[3]))
                    //     console.log((getMilitaryTime(new Date()) >= getMilitaryTime(bill.operation_schedule.split("-")[1])) && 
                    //                 (getMilitaryTime(new Date()) <= getMilitaryTime(bill.operation_schedule.split("-")[3])))
                    //     if((getMilitaryTime(new Date()) >= getMilitaryTime(bill.operation_schedule.split("-")[1])) && (getMilitaryTime(new Date()) <= getMilitaryTime(bill.operation_schedule.split("-")[3]))){
                    //         info.status = "OPEN"
                    //     } else {
                    //         info.status = "CLOSE"
                    //     }
                    // } else {
                    //     info.status = "CLOSE"
                    // }
                    return info;
                });
                setExpenses(allBills)
            }
        }
        
        setShowLoader(false);
    }

    React.useEffect(() => {
        fetchBranches();
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
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> BRANCH STATUS </h1>
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

                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="suppliers-tabs"
                    className="manager-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="mango" title="Mango Magic">
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
                                    options={branches}
                                    onChange={(e) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, "branch_id": e.value };
                                        });
                                    }}
                                />

                                <Form.Select
                                    name="status"
                                    className="date-filter me-3"
                                    onChange={(e) => handleOnSearch(e)}
                                    value={filterConfig.status}
                                >
                                    <option value="">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </Form.Select>

                                {/* <Form.Select
                                    name="branch_id"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Branches
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
                                    Date:
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
                                />
{/* 
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
                                /> */}
                            </div>

                            <div className="below">
                                {/* table */}
                                <Table
                                    tableHeaders={[
                                        "NAME",
                                        "BRANCH STATUS",
                                        "TIME OPEN",
                                        "TIME CLOSE",
                                    ]}
                                    headerSelector={[
                                        "branch_name",
                                        "status",
                                        "time_open",
                                        "time_close",
                                    ]}
                                    tableData={expenses}
                                    ActionBtn={(row) => ActionBtn(row)}
                                    ViewBtn={(row) => ViewBtn(row)}
                                    branchStatus={(row) => BranchStatus(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>
                    <Tab eventKey="potato" title="Potato Corner">
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
                                    options={branches}
                                    onChange={(e) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, "branch_id": e.value };
                                        });
                                    }}
                                />
                                {/* <Form.Select
                                    name="branch_id"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Branches
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
                                    placeholderText={today}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_from: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
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
                                />
                            </div>

                            <div className="below">
                                {/* table */}
                                <Table
                                    tableHeaders={[
                                        "NAME",
                                        "BRANCH STATUS",
                                        "TIME OPEN",
                                        "TIME CLOSE",
                                    ]}
                                    headerSelector={[
                                        "branch_name",
                                        "status",
                                        "time_open",
                                        "time_close",
                                    ]}
                                    tableData={expenses}
                                    ActionBtn={(row) => ActionBtn(row)}
                                    ViewBtn={(row) => ViewBtn(row)}
                                    branchStatus={(row) => BranchStatus(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>
                </Tabs>
                
            </div>

            {/* modals */}
            
        </div>
    );
}
