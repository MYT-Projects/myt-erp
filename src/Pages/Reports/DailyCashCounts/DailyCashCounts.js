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
import { searchCashCount, deleteCashCount } from "../../../Helpers/apiCalls/Reports/DailyCashCountApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";

export default function SalesByItem() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({
        group_cash_counts: true,
    })
    const [branches, setBranches] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [sales, setSales] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const today = Moment().format("MM/DD/YYYY");

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
        console.log(name, value)
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function handleSelectChange(e, row) {
        console.log(e);
        console.log(row);
        console.log(e.target.role, e.target.id);

        if (e.target.value === "view") {
            navigate("/dailycashcount/view/" + row.branch_id, {
                state: { 
                    date: row.count_date,
                },
            });
            // {
            //     window.open('/dailycashcount/view/' + row.branch_id ,'_blank')
            // };
        } else if (e.target.value === "print") {
            navigate("/dailycashcount/view/" + row.branch_id, {
                state: { 
                    date: row.count_date,
                },
            });
            // {
            //     window.open('/dailycashcount/view/' + row.branch_id ,'_blank')
            // };
        }
    }

    console.log(filterConfig)

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
                    <option value="print" className="color-options">
                        Print
                    </option>
                    ): null
                }
            </Form.Select>
        );
    }

    function PrintBtn(row) {
        console.log(row);
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
        console.log(row);
        navigate("/dailycashcount/view/" + row.branch_id, {
            state: { 
                date: row.count_date,
            },
        });
        // {
        //     window.open('/dailycashcount/view/' + row.id ,'_blank')
        // };
    }

    async function fetchBranches() {
        setShowLoader(true);

        const response = await getAllBranches();
        console.log(response);
        if (response.error) {
            console.log(response.error);
        } else {
            var allBranches = response.data.data.data.map((data) => {
                var branch = data;
                branch.label = data.name
                branch.value = data.id
                return branch;
            });
            setBranches([{label: "All Branches", value:""}, ...allBranches]);
            console.log(allBranches);
        }
        setShowLoader(false);
    }

    async function fetchData() {
        setShowLoader(true);
        setSales([])

        const response = await searchCashCount(filterConfig);
        console.log(response);

        if (response.error) {
            console.log(response);
        } else {

            var allBills = response.data.data.map((bill) => {
                console.log(bill)
                var info = bill;
                info.count_date = Moment(bill.count_date).format("MM-DD-YYYY")
                info.amount = numberFormat(bill.total_count);
                return info;
            });
            setSales(allBills)
        }
        setShowLoader(false);
    }

    console.log(sales)

    React.useEffect(() => {
        fetchBranches();
        fetchData();
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
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> DAILY CASH COUNT </h1>
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

                    <div className="my-2 px-2 PO-filters d-flex justify-content-center">
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE",
                                "BRANCH",
                                "AMOUNT",
                                "PREPARED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "count_date",
                                "branch_name",
                                "amount",
                                "added_by_name",
                            ]}
                            tableData={sales}
                            ActionBtn={(row) => ActionBtn(row)}
                            ViewBtn={(row) => PrintBtn(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>
        </div>
    );
}
