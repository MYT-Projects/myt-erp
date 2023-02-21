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
import { getAllSales } from "../../../Helpers/apiCalls/Reports/BillingFeeSales";


export default function TotalSales() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({
        payment_status: "paid"
    })
    const [franchisees, setFranchisees] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [sales, setSales] = useState([]);
    const [royaltyFee, setRoyaltyFee] = useState([]);
    const [marketingFee, setMarketingFee] = useState([]);
    const [invoiceSales, setInvoiceSales] = useState([]);
    const [totalSales, setTotalSales] = useState([]);
    const excelHeaders = [
        { label: "Date Paid", key: "added_on" },
        { label: "Franchisee", key: "franchisee_name" },
        { label: "Branch", key: "branch_name" },
        { label: "Doc Type", key: "doc_type" },
        { label: "Marketing Fee", key: "marketing_fee" },
        { label: "Royalty Fee", key: "royalty_fee" },
        { label: "Sales Invoice", key: "sales_invoice" },
        { label: "Deposit Date", key: "deposit_date" },
        { label: "Deposit To", key: "deposit_to" },
        { label: "Check No", key: "check_no" },
        { label: "Pay Mode", key: "pay_mode" },
        { label: "Check Date", key: "check_date" },
    ];

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function handleSelectChange(e, row) {

        if (e.target.value === "mark_as_done") {
            // handleShowApproveModal();
        } else if (e.target.value === "void") {
            // handleShowDeleteModal();
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
            </Form.Select>
        );
    }

    function PrintBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row.id, row.doc_type)}
            >
                View
            </button>
        );
    }
    function handlePrint(id, doc_type) {
        if(doc_type === "Billing") {
            window.open(
                "/franchisebilling/view/" + id, "_blank"
            );
        } else if(doc_type === "Invoice") {
            window.open(
                "/salesinvoice/print/" + id, "_blank"
            );
        }
        
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
        setSales([])

        const response = await getAllSales(filterConfig);

        if (response.error) {
        } else {

            var billing = response.data.data;

            var allBills = response.data.data.map((bill) => {
                var info = bill;
                info.id = bill.id;
                info.added_on = Moment(bill.added_on).format("MM-DD-YYYY");
                info.deposit_date = bill.deposit_date ? Moment(bill.deposit_date).format("MM-DD-YYYY") : "N/A";
                info.branch_id = bill.branch_id;
                info.balance = bill.balance;
                info.branch_name = bill.branch_name;
                info.franchise_id = bill.franchisee_id;
                info.franchise_name = bill.name;
                info.payment_status = bill.payment_status;
                info.paid_amount = numberFormat(bill.paid_amount);
                info.royalty_fee = numberFormat(bill.royalty_fee);
                info.marketing_fee = numberFormat(bill.marketing_fee);
                info.sales_invoice = numberFormat(bill.sales_invoice);
                info.check_date = bill.cheque_date !== "0000-00-00" ? bill.cheque_date : "N/A";
                info.check_no = bill.cheque_number ? bill.cheque_number : bill.reference_number;
                return info;
            });

            var royalty = response.data.summary? response.data.summary.total_royalty_fees : "0";
            var marketing = response.data.summary? response.data.summary.total_marketing_fees : "0";
            var invoice = response.data.summary? response.data.summary.total_invoices : "0";
            var total = response.data.summary? response.data.summary.total_sales : "0";
            setRoyaltyFee(royalty);
            setMarketingFee(marketing);
            setInvoiceSales(invoice);
            setTotalSales(total);

            setSales(allBills)
        }

        setShowLoader(false);
    }

    React.useEffect(() => {
        fetchFranchisee();
    }, []);

    const [franchiseOptions, setFranchiseOptions] = useState ([]);
    const [branchOptions, setBranchOptions] = useState ([]);

    React.useEffect(()=>{
        // console.log("franchisees", franchisees);
        const tmp = franchisees.filter((v, i) => {
            return franchisees.map((val) => val.name).indexOf(v.name) == i;
        });
        const t = tmp.map((fr)=>{
            return {label: fr.name, value:fr.name};
        });
        t.push({label: "All Franchisees", value:""})
        setFranchiseOptions(t.reverse());
    }, [franchisees]);

    React.useEffect(()=>{
        const t = franchisees.map((fr)=>{
            return {label: fr.branch_name, value:fr.branch_id};
        });
        t.push({label: "All Branches", value:""})
        setBranchOptions(t.reverse());
    }, [franchisees]);

    function handleBranchChange(e){
        // setBranch(e.name);
        const toFilter = {target: {name: "franchisee_name", value: e.value}};
        handleOnSearch(toFilter);
    }

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
                    active={"FRANCHISE REPORTS"}
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
                        <h1 className="page-title"> SALES BY TYPE </h1>
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-end mb-3">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={sales}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} Sales By Type`}
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
                        <span className="me-1 align-middle mt-2 ps-label">
                            Filter By:
                        </span>
                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Franchisee"
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
                            options={franchiseOptions}
                            onChange={handleBranchChange}
                        />
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
                            options={branchOptions}
                            onChange={(e) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, "branch_id": e.value };
                                });
                            }}
                        />
                        {/* <Form.Select
                            name="franchisee_name"
                            className="date-filter me-2"
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                All Franchisee
                            </option>
                            {franchisees.length > 0 ? (
                                franchisees.filter((v, i) => {
                                    return franchisees.map((val) => val.name).indexOf(v.name) == i;
                                })
                                .map((franchisee) => {
                                    return (
                                        <option
                                            value={franchisee.name}
                                        >
                                            {franchisee.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No franchisee found)
                                </option>
                            )}
                        </Form.Select> */}

                        <Form.Select
                            name="type"
                            className="date-filter me-2"
                            defaultValue={filterConfig.type}
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected> All types </option>
                            <option value="royalty_fee"> Royalty Fee Sales </option>
                            <option value="marketing_fee"> Marketing Fee Sales </option>
                            <option value="invoice_sales"> Sales from Invoice </option>
                        </Form.Select>

                        <Form.Select
                            name="payment_status"
                            className="date-filter me-2"
                            defaultValue={filterConfig.payment_status}
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value=""> All Payment Status </option>
                            <option value="paid" selected> Paid </option>
                            <option value="unpaid"> Unpaid </option>
                        </Form.Select>

                        <span className="me-1 align-middle mt-2 ps-label">
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

                        <span className="me-1 align-middle mt-2 ps-label">
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

                        <span className="me-4 ml-4 align-middle ps-label">
                            Royalty Fee: {numberFormat(royaltyFee)}
                        </span>

                        <span className="me-4 ml-4 align-middle ps-label">
                            Marketing Fee: {numberFormat(marketingFee)}
                        </span>

                        <span className="me-4 ml-4 align-middle ps-label">
                            Sales from Invoices: {numberFormat(invoiceSales)}
                        </span>

                        <span className="me-4 ml-4 align-middle ps-label">
                            Total Sales: {numberFormat(totalSales)}
                        </span>
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE PAID",
                                "FRANCHISEE",
                                "BRANCH",
                                "DOC TYPE",
                                // "PAID AMT",
                                "MRK AMT",
                                "RYLTY AMT",
                                "INV AMT",
                                "DPST DATE",
                                "DPST TO",
                                "REF/CHK",
                                "PYMT MODE",
                                "CHK DATE",
                            ]}
                            headerSelector={[
                                "-",
                                "added_on",
                                "franchisee_name",
                                "branch_name",
                                "doc_type",
                                // "paid_amount",
                                "marketing_fee",
                                "royalty_fee",
                                "sales_invoice",
                                "deposit_date",
                                "deposit_to",
                                "check_no",
                                "pay_mode",
                                "check_date",
                            ]}
                            tableData={sales}
                            ActionBtn={(row) => ActionBtn(row, "open")}
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
