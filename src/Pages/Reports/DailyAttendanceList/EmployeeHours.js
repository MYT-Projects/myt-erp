import React, { useState } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import { searchAttendance } from "../../../Helpers/apiCalls/Reports/DailyAttendanceApi";


export default function EmployeeHours() {
    const { id } = useParams();
    let navigate = useNavigate();
    const { state } = useLocation();
    console.log(state)
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({
        branch_id: id ? id : "",
        date_from: state?.date ? "" : new Date(),
        date_to: state?.date ? "" : new Date(),
        date: state?.date ? state.date : "",
        by_employees: state?.by_employees ? state.by_employees : true,
    })
    const [franchisees, setFranchisees] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [sales, setSales] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const today = Moment().format("MM/DD/YYYY");

    const dummy = [
        {
            id: "1",
            name: "JOSE RIZAL",
            total_hours: "9",
        },
    ]

    const excelHeaders = [
        { label: "NAME", key: "employee_name" },
        { label: "WORKING HOURS", key: "total_hours" },
    ];

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
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

    }

    async function fetchData() {
        setShowLoader(true);
        setSales([])

        const response = await searchAttendance(filterConfig);

        if (response.error) {
        } else {

            var allBills = response.data.data.map((bill) => {
                var info = bill;
                info.time_in = bill.attendance_entries[0]?.time_in
                info.time_out = bill.attendance_entries[0]?.time_out
                info.total_hours = numberFormat(parseInt(bill.total_minutes)/60)
                return info;
            });
            setSales(allBills)
        }
        setShowLoader(false);
    }

    React.useEffect(() => {
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
                    active={"STORE REPORTS"}
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
                        <h1 className="page-title"> EMPLOYEE HOURS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="employee_name"
                            className="search-bar"
                            placeholder="Search employee name..."
                            onChange={handleOnSearch}
                        ></input>
                    </Col>
                </Row>
                {state && 
                    <Row className="mb-4">
                        <Col xs={6}>
                            <h5 className="page-subtitle"> {new Date(filterConfig.date).toLocaleDateString( "en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} </h5>
                        </Col>
                    </Row>
                }

                <Row>
                    <Col className="d-flex justify-content-end mb-4">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={sales}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} EmployeeHours`}
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
                    {!state && 
                        <div className="my-2 px-2 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2 ps-label">
                                Filter By:
                            </span>
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
                    }
                    

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "NAME",
                                "WORKING HOURS",
                            ]}
                            headerSelector={[
                                "employee_name",
                                "total_hours",
                            ]}
                            tableData={sales}
                            ViewBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>
            <div className="d-flex justify-content-end pt-5 pb-3 me-5">
                <button
                    type="button"
                    className="button-primary me-3"
                    onClick={() => navigate(-1)}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
