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
import ViewModal from "../../../Components/Modals/ViewModal";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { getAllSalesByItem } from "../../../Helpers/apiCalls/Reports/BillingFeeSales";
import { getExpenses, searchExpenses } from "../../../Helpers/apiCalls/Reports/DailyExpensesApi";


export default function ViewDailyExpenses() {
    const { id } = useParams();
    const { state } = useLocation();
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({
        branch_id: id,
        by_branch: 0,
        date_from: state.date_from,
        date_to: state.date_to,
    })
    const [franchisees, setFranchisees] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [expensesItems, setExpensesItems] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [branchName, setBranchName] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    // VIEW
    const [showViewBranchModal, setShowViewBranchModal] = useState(false);
    const handleShowViewBranchModal = () => setShowViewBranchModal(true);
    const handleCloseViewBranchModal = () => setShowViewBranchModal(false);

    const excelHeaders = [
        { label: "Item", key: "name" },
        { label: "Quantity", key: "qty" },
        { label: "Unit", key: "unit" },
        { label: "Unit Price", key: "price" },
        { label: "Amount", key: "total" },
        { label: "Time Added", key: "added_on" },
        { label: "Store", key: "store" },
    ];

    const dummy = [
        {
            id: "1",
            item: "STRAWS",
            quantity: "100",
            unit: "PC",
            unit_price: "1000",
            amount: "1000",
            time: "10:00 AM",
            store: "SM",
        },
    ]

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
                onClick={() => handlePrint(row.id)}
            >
                View
            </button>
        );
    }

    function handlePrint(id) {
        window.open('/dailyexpenses/print/' + id ,'_blank')
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
        setExpenses([])
        setExpensesItems([])

        const response = await searchExpenses(filterConfig);

        if (response.error) {
        } else {
            setBranchName(response.data.data[0].branch_name);
            setExpenseDate(response.data.data[0].expense_date)
            var expense = response.data.data.map((data) => {
                var info = data;
                info.grand_total = numberFormat(data.grand_total)
                return info;
            });
            var expenseItem = expense[0]?.expense_item.map((data) => {
                var info = data;
                info.store = expense[0].store_name;
                info.qty = numberFormat(data.qty)
                info.price = numberFormat(data.price)
                info.total = numberFormat(data.total)
                info.added_on = new Date(data.added_on).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                return info;
            });
            setExpenses(expense)
            setExpensesItems(expenseItem)
        }
        setShowLoader(false);
    }
    console.log(expenses)

    React.useEffect(() => {
        fetchFranchisee();
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
                        <h1 className="page-title"> {branchName} </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="item_name"
                            placeholder="Search item name"
                            className="search-bar"
                            onChange={handleOnSearch}
                        ></input>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col xs={6}>
                        <h5 className="page-subtitle"> {new Date(expenseDate).toLocaleDateString( "en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} </h5>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <h1 className="page-title green"> TOTAL: {expenses[0]?.grand_total} </h1>
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-4">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={expensesItems.reverse()}
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

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "STORE",
                                "INVOICE NO.",
                                "TOTAL",
                                "ENCODED BY",
                            ]}
                            headerSelector={[
                                "-",
                                "store_name",
                                "invoice_no",
                                "grand_total",
                                "encoded_by_name",
                            ]}
                            tableData={expenses}
                            ViewBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>
            <ViewModal
                show={showViewBranchModal}
                onHide={handleCloseViewBranchModal}
            >
                <div className="mt-0">
                    <div className="col-sm-12 m-0 space">
                        <span className="custom-modal-body-title-branch-details-report-modal">
                            {branchName}
                        </span>
                        <span className="custom-modal-body-title-branch-details-report-modal-right mt-0 float-r">
                            Invoice No: {expenses[0]?.invoice_no}
                        </span>
                        <div className="mt-3 container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col>
                                    REMARKS
                                    <Row className="nc-modal-custom-row">
                                        <Col> {expenses[0]?.remarks || "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                        <div className="mt-3">
                            <Row className="nc-modal-custom-row-view">
                                <Col>
                                    ATTACHED RECEIPTS
                                    <Row className="nc-modal-custom-row">
                                        <Col> {expenses[0]?.attachment.length !==0 ? expenses[0]?.attachment : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </ViewModal>
        </div>
    );
}
