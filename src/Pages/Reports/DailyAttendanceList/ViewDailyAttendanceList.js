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
    getTodayDateISO,
    getTime
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";
import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../../Assets/Images/download_icon.png";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { getAttendance, getAllAttendance, searchAttendance } from "../../../Helpers/apiCalls/Reports/DailyAttendanceApi";


export default function SalesByItem() {
    const { id } = useParams();
    const { state } = useLocation();
    console.log(state)
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [franchisees, setFranchisees] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [sales, setSales] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [branchName, setBranchName] = useState("");
    const today = Moment().format("MM/DD/YYYY");

    const [filterConfig, setFilterConfig] = useState({
        branch_id: state.branch_id,
        // date_from: state.date_from,
        // date_to: state.date_to,
        date: state.date,
        by_employees: true,
    })


    const excelHeaders = [
        { label: "NAME", key: "employee_name" },
        { label: "IN", key: "time_in_1" },
        { label: "OUT", key: "time_out_1" },
        { label: "IN", key: "time_in_2" },
        { label: "OUT", key: "time_out_2" },
        { label: "IN", key: "time_in_3" },
        { label: "OUT", key: "time_out_3" },
    ];

    const dummy = [
        {
            id: "1",
            name: "Jose Rizal",
            in: "9:00 AM",
            out: "9:00 PM",
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

    function ViewBtn(row) {
        console.log(row);
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handleView(row.id, row.franchisee_id, row.payable_id, row.type)}
            >
                View
            </button>
        );
    }
    function handleView(id, type, shop) {
        console.log(id, type, shop);

    }

    async function fetchData() {
        setShowLoader(true);
        setSales([])

        const response = await searchAttendance(filterConfig);
        console.log(response);

        if (response.error) {
            console.log(response);
        } else {
            setBranchName(response.data.data[0].branch_name);
            var allBills = response.data.data.map((bill) => {
            var info = bill;
                info.time_in_1 = bill?.attendance_entries[0]?.time_in ? getTime(bill.attendance_entries[0]?.time_in) : ""
                info.time_out_1 = bill?.attendance_entries[0]?.time_out ? getTime(bill.attendance_entries[0]?.time_out) : ""
                info.time_in_2 = bill?.attendance_entries[1]?.time_in ? getTime(bill.attendance_entries[1]?.time_in) : ""
                info.time_out_2 = bill?.attendance_entries[1]?.time_out ? getTime(bill.attendance_entries[1]?.time_out) : ""
                info.time_in_3 = bill?.attendance_entries[2]?.time_in ? getTime(bill.attendance_entries[2]?.time_in) : ""
                info.time_out_3 = bill?.attendance_entries[2]?.time_out ? getTime(bill.attendance_entries[2]?.time_out) : ""
                return info;
            });
            setSales(allBills)
        }
        setShowLoader(false);
    }

    console.log(sales)

    React.useEffect(() => {
        fetchData();
    }, []);

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
                        <h1 className="page-title"> {branchName} </h1>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col xs={6}>
                        <h5 className="page-subtitle"> {new Date(filterConfig.date).toLocaleDateString( "en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} </h5>
                    </Col>
                </Row>

                <div className="tab-content">

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "NAME",
                                "IN",
                                "OUT",
                                "IN",
                                "OUT",
                                "IN",
                                "OUT",
                            ]}
                            headerSelector={[
                                "employee_name",
                                "time_in_1",
                                "time_out_1",
                                "time_in_2",
                                "time_out_2",
                                "time_in_3",
                                "time_out_3",
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
                    className="button-secondary me-3"
                    onClick={() => navigate("/dailyattendancelist/view/employeehours/" + id, 
                        {
                            state: { 
                                date_from: state.date_from ? new Date(state.date_from) : "", 
                                date_to: state.date_to ? new Date(state.date_to) : "",
                                by_employees: true,
                                date: state.date ? new Date(state.date) : "",
                            },
                        }
                        )}
                >
                    Total Hours
                </button>
                <CSVLink
                    className=""
                    data={sales}
                    headers={excelHeaders}
                    target="_blank"
                    filename={`${getTodayDateISO()} DailyAttendance_${branchName}`}
                >
                    <button
                        type="button"
                        className="button-primary me-3"
                    >
                        Download
                    </button>
                </CSVLink>
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
