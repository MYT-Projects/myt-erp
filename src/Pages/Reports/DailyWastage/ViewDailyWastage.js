import React, { useState } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
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
import { getWastage } from "../../../Helpers/apiCalls/Reports/DailyWastageApi";


export default function ViewDailyExpenses() {
    const { id } = useParams();
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({})
    const [franchisees, setFranchisees] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [wastage, setWastage] = useState([]);
    const [wastageItems, setWastageItems] = useState([]);
    const [wastageItemsCsv, setWastageItemsCsv] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [branchName, setBranchName] = useState("");
    const [wastageDate, setWastageDate] = useState("");

    const excelHeaders = [
        { label: "Branch Name", key: "branch_name" },
        { label: "Date", key: "date" },
        { label: "Item", key: "name" },
        { label: "Quantity", key: "qty" },
        { label: "Unit", key: "unit" },
        { label: "Reason", key: "reason" },
        { label: "Wastage By", key: "wasted_by_name" },
        { label: "Remarks", key: "remarks" },
    ];

    const dummy = [
        {
            id: "1",
            item: "straw",
            quantity: "500",
            unit: "pc",
            reason: "asdfasdf",
        },
    ]

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    async function fetchFranchisee() {
        setShowLoader(true);

        const response = await getAllFranchisee();
        if (response.error) {
        } else {
            setFranchisees(response.data.data);
            var allFranchisee = response.data.data.map((data) => {
                var franchise = data;
                franchise.franchise_name = data.name;
                franchise.franchise = data.name;
                franchise.contract = "0";
                franchise.sale = "0";
                franchise.sale_billing = "0";
                franchise.total = "0";
                return franchise;
            });
            setFranchisees(allFranchisee);
        }
        setShowLoader(false);
    }

    async function fetchData() {
        setShowLoader(true);
        setWastage([])
        setWastageItems([])

        const response = await getWastage(id);
        if (response.error) {
        } else {
            setBranchName(response.data.data[0].branch_name);
            setWastageDate(response.data.data[0].wastage_date);
            var wastage = response.data.data.map((data) => {
                var info = data;
                return info;
            });
            setWastage(wastage)
            setWastageItems(wastage[0].wastage_item)

            var array = [{branch_name: response.data.data[0].branch_name, 
                        date: response.data.data[0].wastage_date} ]
            var wastage_items = wastage[0].wastage_item.map((data) => {
                var info = data;
                array.push(info)
                return info;
            });
            setWastageItemsCsv(array)
        }
        setShowLoader(false);
    }

    React.useEffect(() => {
        fetchFranchisee();
        fetchData();
    }, []);

    React.useEffect(() => {
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
                        <h1 className="page-title"> {branchName} </h1>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col xs={6}>
                        <h5 className="page-subtitle"> {new Date(wastageDate).toLocaleDateString( "en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} </h5>
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-4">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={wastageItemsCsv.reverse()}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} Wastage_${branchName}`}
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
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "ITEM",
                                "QUANTITY",
                                "UNIT",
                                "REASON",
                                "WASTAGE BY",
                                "REMARKS",
                            ]}
                            headerSelector={[
                                "name",
                                "qty",
                                "unit",
                                "reason",
                                "wasted_by_name",
                                "remarks",
                            ]}
                            tableData={wastageItems}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>
        </div>
    );
}
