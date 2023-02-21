import React, { forwardRef, useState, useEffect, useRef } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import Moment from "moment";
import Select from "react-select";
// components
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/OneTable";
import DeleteModal from "../../Components/Modals/DeleteModal";

// api calls and utils
import {
    deleteInvoice,
    filterInvoice,
    getAllInvoices,
} from "../../Helpers/apiCalls/Sales/franchiseInvoice";
import {
    formatDate,
    dateFormat,
    numberFormat,
    numberFormatInt,
    getTodayDate,
    getType,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../Helpers/Utils/Common";

// css
import "./SalesInvoice.css";
import "../Purchases/PurchaseOrders/PurchaseOrders.css";
import { getAllFranchisee, searchFranchiseeSales } from "../../Helpers/apiCalls/franchiseeApi";
import AddPaymentModal from "./AddPaymentModal";
import CloseFSModal from "./CloseFSModal";

/**
 *  Sales Invoice Register component
 */
export default function SalesInvoice() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [salesInvoiceManager, setSalesInvoiceManager] = useState([]);
    const [total, setTotal] = useState([]);
    const [totalPaid, setTotalPaid] = useState([]);
    const [totalBalance, setTotalBalance] = useState([]);
    const [openListPI, setOpenListPI] = useState([]);
    const [closeListPI, setCloseListPI] = useState([]);
    const [requestListPI, setRequestListPI] = useState([]);
    const [quotation, setQuotation] = useState([]);
    const [franchisees, setFranchisees] = useState([]);
    const today = Moment().format("MM/DD/YYYY");

    const [branches, setBranches] = useState ([]);
    const [branch, setBranch] = useState("");

    useEffect(()=>{
        // console.log(franchisees)
        setBranches(franchisees.map((franchisee)=>{
            return {label: franchisee.branch_name, value:franchisee.branch_id};
        }))
        setBranches((branches)=>{
            var newBranches = [...branches];
            newBranches.push({label: "All Branches", value:""})
            return newBranches.reverse();
        });

        // console.log(branches);
    },[franchisees])

    function handleBranchChange(e){
        setBranch(e.name);
        const toFilter = {target: {name: "branch_id", value: e.value}};
        handleFilterChange(toFilter);
    }

    /* Close bill Modal */
    const [showCloseBillModal, setShowCloseBillModal] = useState(false);
    const handleShowCloseBillModal = () => setShowCloseBillModal(true);
    const handleCloseCloseBillModal = () => setShowCloseBillModal(false);
    const [bill, setBill] = useState([]);


    /* FILTER CONFIGS */
    const [filterConfig, setFilterConfig] = useState({
        tab: "order_quotation",
        franchisee_name: "",
        invoice_no: "",
        invoice_status: "",
        date_from: "",
        date_to: "",
        tabKey: "",
        payment_status: "",
        fs_status: "quoted", // quoted if order quotation una
    });
    

    // const isInitialMount = useRef(true);
    // const filterConfigKey = 'franchise-salesInvoice-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 // console.log("found");
    //                 handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])

    function handleFilterChange(e) {
        // console.log(e)
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    const [showLoader, setShowLoader] = useState(false);

    async function searchFranchiseeApi() {
        setShowLoader(true);
        setSalesInvoiceManager([]);
        // console.log("searchFranchiseeApi", filterConfig)
        const response = await searchFranchiseeSales(filterConfig);
        // console.log(response);

        if (response.data) {
            var allBills = response.data.data.map((data) => {
                var franchise = data;
                var stat = data.payment_status.split("_")
                franchise.payment_status = stat.length < 2 ? data.payment_status : stat[0] + " " + stat[1];
                franchise.franchised_on =
                    Moment(franchise.franchised_on).format("MM-DD-YYYY") || "N/A";
                franchise.grand_total = numberFormat(franchise.grand_total);
                franchise.paid_amount = numberFormat(franchise.paid_amount);
                franchise.balance = data.payment_status !== "overpaid" ? numberFormat(franchise.balance) : numberFormat(franchise.balance.split("-")[1]);
                franchise.order_request_date = Moment(franchise.order_request_date).format("MM-DD-YYYY");
                franchise.delivery_date = Moment(franchise.delivery_date).format("MM-DD-YYYY");
                franchise.sales_date = Moment(franchise.sales_date).format("MM-DD-YYYY");                    
                return franchise;
            });
            var total = response.data.summary? response.data.summary.total : "0";
            var total_paid_amount = response.data.summary? response.data.summary.total_paid_amount : "0";
            var total_balance = response.data.summary? response.data.summary.total_balance : "0";
            setSalesInvoiceManager(allBills.reverse());
            setTotal(total);
            setTotalPaid(total_paid_amount);
            setTotalBalance(total_balance);
        } else if (response.error) {
            TokenExpiry(response);
            setSalesInvoiceManager([]);
        }
        setShowLoader(false);

        // nabyaan tika 221021 2:35PM
    }

    useEffect(() => {
        searchFranchiseeApi();
    }, [filterConfig]);

    async function fetchPI() {
        setShowLoader(true);
        setOpenListPI([]);
        setCloseListPI([]);
        setQuotation([]);


        const response = await getAllInvoices();
        //console.log(response);

        if (response.error) {
            TokenExpiry(response.error);
        } else if (response.data) {
            var allFranchiseeSalesInvoice = response.data.data.map(
                (invoice) => {
                    var info = invoice;
                    info.order_request_date = Moment(invoice.order_request_date).format("MM-DD-YYYY");
                    info.delivery_date = Moment(invoice.delivery_date).format("MM-DD-YYYY");
                    info.sales_date = Moment(invoice.sales_date).format("MM-DD-YYYY");
                    info.grand_total = numberFormat(invoice.grand_total);
                    info.paid_amount = numberFormat(invoice.paid_amount);
                    info.balance = numberFormat(invoice.balance);

                    return info;
                }
            );
            //console.log("allFranchiseeSalesInvoice");
            //console.log(allFranchiseeSalesInvoice);
            var closedBills = [];
            var openBills = [];
            var requests = [];
            var quotation = [];
            closedBills = allFranchiseeSalesInvoice.filter(
                (bill) => bill.payment_status === "closed_bill"
            );
            openBills = allFranchiseeSalesInvoice.filter(
                (bill) =>
                    bill.payment_status === "open_bill" &&
                    bill.franchisee_sale_payments.length !== 0
            );
            quotation = allFranchiseeSalesInvoice.filter(
                (bill) =>
                    bill.fs_status === "quoted"
            );
            requests = allFranchiseeSalesInvoice.filter(
                (bill) =>
                    bill.fs_status === "quoted"
                    && bill.payment_status === "processing"
            );
            setCloseListPI(closedBills);
            setOpenListPI(openBills);
            setRequestListPI(requests);
            setQuotation(quotation);
        }
        setShowLoader(false);
    }

    async function fetchFranchisee() {
        setShowLoader(true);

        const response = await getAllFranchisee();

        if (response.error) {
            TokenExpiry(response.error);
        } else {
            //console.log(response.data.data);
            setFranchisees(response.data.data);
        }
        setShowLoader(false);
    }

    /* add payment modal handler */
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const handleShowAddPaymentModal = () => setShowAddPaymentModal(true);
    const handleCloseAddPaymentModal = () => setShowAddPaymentModal(false);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [PIID, setPIID] = useState("");
    const [franchiseeID, setFranchiseeID] = useState("");

    async function handleDeletePI() {
        const response = await deleteInvoice(PIID);
        // console.log(response);

        if (response.data.status === "success") {
            toast.success("Sales Invoice Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Sales Invoice", {
                style: toastStyle(),
            });
        }
    }

    const [bal, setBal] = useState("");
    const [invoice, setInvoice] = useState("");

    function handleSelectChange(e, id, franchisee_id, balance, row) {
        // console.log(row, id);
        setBill(row)
        if (e.target.value === "edit-pi") {
            navigate("edit/" + id);
        } else if (e.target.value === "add-invoice-pi") {
            navigate("createinvoice/" + id);
        } else if (e.target.value === "process-req") {
            navigate("process/" + id);
        } else if (e.target.value === "print-pi") {
            // navigate("print/" + id);
            window.open(
                "salesinvoice/print/" + id, "_blank"
            );
        } else if (e.target.value === "payment-pi") {
            setPIID(id);
            setFranchiseeID(franchisee_id);
            setBal(numberFormatInt(balance));
            handleShowAddPaymentModal();
        } else if (e.target.value === "delete-pi") {
            setPIID(id);
            handleShowDeleteModal();
        }  else if (e.target.value === "close-pi") {
            handleShowCloseBillModal();
        }
    }

    const handleTabSelect = (tabKey) => {
        var newFilterConfig = {
            tab: tabKey,
        };

        switch (tabKey) {
            case "order_quotation":
                setSalesInvoiceManager([]);
                newFilterConfig.fs_status = "quoted";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "order_request":
                setSalesInvoiceManager([]);
                newFilterConfig.fs_status = "processing";
                newFilterConfig.payment_status = ""; // both open and closed bills
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "open_invoices":
                setSalesInvoiceManager([]);
                newFilterConfig.fs_status = "invoiced";
                newFilterConfig.payment_status = "open_bill";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "closed_invoices":
                const date = new Date();
                date.setDate(date.getDate() - 7);

                setSalesInvoiceManager([]);
                newFilterConfig.fs_status = "invoiced";
                newFilterConfig.payment_status = "closed_bill";
                newFilterConfig.date_from = new Date(date);
                newFilterConfig.date_to = new Date();
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "refundable":
                setSalesInvoiceManager([]);
                newFilterConfig.payment_status = "overpaid";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            default:
                setSalesInvoiceManager([]);
                break;
        }
    };

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) =>
                    handleSelectChange(
                        e,
                        row.id,
                        row.franchisee_id,
                        row.balance,
                        row
                    )
                }
            >
                <option value="" hidden selected>
                    Select
                </option>

                {/* {type === "request" && accountType === "admin" && (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                )} */}
                {type === "request" || type === "quotation" && 
                (accountType === "admin" ||
                    accountType === "franchise_officer") ? (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                ) : null}

                {(type === "open" || type === "closed") && accountType === "admin" ? (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="print-pi" className="color-options">
                    View
                </option>
                {type === "open" ? (
                    <option value="payment-pi" className="color-options">
                        Add Payment
                    </option>
                ) : null}

                {/* {type === "request" && accountType === "admin" && (
                    <option value="add-invoice-pi" className="color-options">
                        Create Invoice
                    </option>
                )} */}
                {type === "request" ? (
                    <option value="add-invoice-pi" className="color-options">
                        Create Invoice
                    </option>
                ) : null}

                {type === "refundable" ? (
                    <option value="close-pi" className="color-options">
                        Close
                    </option>
                ) : null}

                {(accountType === "admin" ||
                    accountType === "franchise_officer") && (
                    <option value="delete-pi" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }
    const [selected, setSelected] = useState({});
    function AddPaymentBtn(row) {
        //console.log("row");
        // console.log(row);
        //console.log(`ID=${row.id} | BAL=${row.balance}`);

        // setSelected(row);
        if(row.payment_status === "open_bill" || row.payment_status === "open bill") {
            return (
                <button
                    name="action"
                    className="btn btn-sm view-btn-table"
                    id={row.id}
                    onClick={(e) =>
                        handleSelectChange(
                            e,
                            row.id,
                            row.franchisee_id,
                            row.balance,
                            row
                        )
                    }
                    value="payment-pi"
                >
                    Pay
                </button>
            );
        }
        
    }
    function ViewBtn(row) {
        //console.log("row");
        //console.log(row);
        //console.log(`ID=${row.id} | BAL=${row.balance}`);
        setSelected(row);

        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) =>
                    handleSelectChange(
                        e,
                        row.id,
                        row.franchisee_id,
                        row.balance
                    )
                }
                value="add-invoice-pi"
            >
                Invoice
            </button>
        );
    }

    function ProcessBtn(row) {
        //console.log("row");
        // console.log(row);
        //console.log(`ID=${row.id} | BAL=${row.balance}`);
        setSelected(row);

        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) =>
                    handleSelectChange(
                        e,
                        row.id,
                        row.franchisee_id,
                        row.balance
                    )
                }
                value="process-req"
            >
                Process
            </button>
        );
    }

    function ViewInvoice(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.id)}
                value="print-pi"
            >
                View
            </button>
        );
    }

    React.useEffect(() => {
        // fetchPI();
        fetchFranchisee();
    }, []);

    React.useEffect(() => {
        return () => {}; // cleanup function
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"FRANCHISE"}
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
                        <h1 className="page-title">RETAIL SALES INVOICE</h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="anything"
                            placeholder="Search..."
                            value={filterConfig.anything}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <button
                            className="add-btn"
                            onClick={() => navigate("/salesinvoice/add")}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                <Tabs activeKey={filterConfig.tab} defaultActiveKey={filterConfig.tab} id="PO-tabs" onSelect={handleTabSelect}>
                    <Tab eventKey="order_quotation" title="ORDER QUOTE">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
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
                            value={branch}
                            options={branches}
                            onChange={handleBranchChange}
                        />
                            {/* <Form.Select
                                name="branch_id"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {franchisees.length > 0 ? (
                                    franchisees.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.branch_id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.branch_name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branches found)
                                    </option>
                                )}
                            </Form.Select> */}
                            {/* <Form.Select
                                name="invoice_status"
                                className="date-filter me-2"
                                defaultValue={filterConfig.invoice_status}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="all" selected hidden>
                                    Invoice Status
                                </option>
                                <option value="all">All</option>
                                <option value="complete">Complete</option>
                                <option value="incomplete">Incomplete</option>
                                <option value="delete">Deleted</option>
                            </Form.Select> */}

                            {/* <span className="me-3 align-middle mt-2">
                                Date From:
                            </span> */}
                            {/* <DatePicker
                                placeholderText={today}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                placeholderText={today}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                maxDate={dateToday}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                            /> */}
                        </div>

                        {/* content */}
                        <div className="sales-tbl">
                            <Table
                                tableHeaders={[
                                    ".",
                                    // "INVOICE NO.",
                                    "ORDER DATE",
                                    "DLVRY DATE",
                                    "DOC. NO",
                                    "FRANCHISEE",
                                    "BRANCH",
                                    "TOTAL",
                                    "STATUS",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    ".",
                                    // "sales_invoice_no",
                                    "order_request_date",
                                    "delivery_date",
                                    "id",
                                    "franchisee_name",
                                    "buyer_branch_name",
                                    "balance",
                                    "payment_status",
                                ]}
                                tableData={salesInvoiceManager}
                                ActionBtn={(row) => ActionBtn(row, "quotation")}
                                ViewBtn={(row) => ProcessBtn(row)}
                                // PaymentBtn={(row) => AddPaymentBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="order_request" title="ORDER REQUEST">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
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
                            value={branch}
                            options={branches}
                            onChange={handleBranchChange}
                        />
                            {/* <Form.Select
                                name="branch_id"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {franchisees.length > 0 ? (
                                    franchisees.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.branch_id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.branch_name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branches found)
                                    </option>
                                )}
                            </Form.Select> */}
                            {/* <Form.Select
                                name="invoice_status"
                                className="date-filter me-2"
                                defaultValue={filterConfig.invoice_status}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="all" selected hidden>
                                    Invoice Status
                                </option>
                                <option value="all">All</option>
                                <option value="complete">Complete</option>
                                <option value="incomplete">Incomplete</option>
                                <option value="delete">Deleted</option>
                            </Form.Select> */}

                            {/* <span className="me-3 align-middle mt-2">
                                Date From:
                            </span> */}
                            {/* <DatePicker
                                placeholderText={today}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                placeholderText={today}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                maxDate={dateToday}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                            /> */}
                        </div>

                        {/* content */}
                        <div className="sales-tbl">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "*",
                                    // "INVOICE NO.",
                                    "ORDER DATE",
                                    "DLVRY DATE",
                                    "DOC. NO",
                                    "FRANCHISEE",
                                    "BRANCH",
                                    "TOTAL",
                                    "STATUS",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "*",
                                    // "sales_invoice_no",
                                    "order_request_date",
                                    "delivery_date",
                                    "id",
                                    "franchisee_name",
                                    "buyer_branch_name",
                                    "grand_total",
                                    "payment_status",
                                ]}
                                tableData={salesInvoiceManager}
                                ActionBtn={(row) => ActionBtn(row, "request")}
                                ViewBtn={(row) => ViewBtn(row)}
                                PaymentBtn={(row) => AddPaymentBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="open_invoices" title="Open Invoice">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
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
                            value={branch}
                            options={branches}
                            onChange={handleBranchChange}
                        />
                            {/* <Form.Select
                                name="branch_id"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {franchisees.length > 0 ? (
                                    franchisees.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.branch_id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.branch_name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branches found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-4 ml-4 align-middle mt-2 ps-label">
                                Total: {numberFormat(total)}
                            </span>

                            <span className="me-4 ml-8 align-middle mt-2 ps-label">
                                Total Paid: {numberFormat(totalPaid)}
                            </span>

                            <span className="me-4 ml-8 align-middle mt-2 ps-label">
                                Total Balance: {numberFormat(totalBalance)}
                            </span>

                            {/* <Form.Select
                                name="invoice_status"
                                className="date-filter me-2"
                                defaultValue={filterConfig.invoice_status}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="all" selected hidden>
                                    Invoice Status
                                </option>
                                <option value="all">All</option>
                                <option value="complete">Complete</option>
                                <option value="incomplete">Incomplete</option>
                                <option value="delete">Deleted</option>
                            </Form.Select> */}

                            {/* <span className="me-3 align-middle mt-2">
                                Date From:
                            </span> */}
                            {/* <DatePicker
                                placeholderText={today}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                placeholderText={today}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                maxDate={dateToday}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                            />*/}
                        </div> 

                        {/* content */}
                        <div className="sales-tbl">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "SALES DATE",
                                    "INV NO.",
                                    "FRANCHISEE",
                                    "BRANCH",
                                    "TOTAL",
                                    "PAID AMNT",
                                    "BALANCE",
                                    "STATUS",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "sales_date",
                                    "id",
                                    "franchisee_name",
                                    "buyer_branch_name",
                                    "grand_total",
                                    "paid_amount",
                                    "balance",
                                    "payment_status",
                                ]}
                                tableData={salesInvoiceManager}
                                ActionBtn={(row) => ActionBtn(row, "open")}
                                ViewBtn={(row) => AddPaymentBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="closed_invoices" title="Closed Invoice">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
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
                                value={branch}
                                options={branches}
                                onChange={handleBranchChange}
                            />

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="date_from"
                                placeholderText={"selct date"}
                                selected={filterConfig.date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="date_to"
                                placeholderText={"selct date"}
                                selected={filterConfig.date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* content */}
                        <div className="sales-tbl">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "SALES DATE",
                                    "INV NO.",
                                    "FRANCHISEE",
                                    "BRANCH",
                                    "TOTAL",
                                    "PAID AMNT",
                                    "BALANCE",
                                    "STATUS",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "sales_date",
                                    "id",
                                    "franchisee_name",
                                    "buyer_branch_name",
                                    "grand_total",
                                    "paid_amount",
                                    "balance",
                                    "payment_status",
                                ]}
                                tableData={salesInvoiceManager}
                                ActionBtn={(row) => ActionBtn(row, "closed")}
                                ViewBtn={(row) => ViewInvoice(row)}
                                showLoader={showLoader}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="refundable" title="Refundable">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
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
                            value={branch}
                            options={branches}
                            onChange={handleBranchChange}
                        />
                            {/* <Form.Select
                                name="branch_id"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {franchisees.length > 0 ? (
                                    franchisees.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.branch_id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.branch_name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branches found)
                                    </option>
                                )}
                            </Form.Select> */}

                            {/* <Form.Select
                                name="franchisee"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="all" selected hidden>
                                    Invoice Status
                                </option>
                                <option value="all">All</option>
                                <option value="complete">Complete</option>
                                <option value="incomplete">Incomplete</option>
                                <option value="deleted">Deleted</option>
                            </Form.Select> */}

                            {/* <span className="me-3 align-middle mt-2">
                                Date From:
                            </span> */}
                            {/* <DatePicker
                                selected={filterConfig.date_from}
                                placeholderText={today}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                selected={filterConfig.date_to}
                                placeholderText={today}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                maxDate={dateToday}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                            /> */}
                        </div>

                        {/* content */}
                        <div className="sales-tbl">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "SALES DATE",
                                    "INV NO.",
                                    "FRANCHISEE",
                                    "BRANCH",
                                    "TOTAL",
                                    "PAID AMNT",
                                    "RFND PYMT",
                                    "STATUS",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "sales_date",
                                    "id",
                                    "franchisee_name",
                                    "buyer_branch_name",
                                    "grand_total",
                                    "paid_amount",
                                    "balance",
                                    "payment_status",
                                ]}
                                tableData={salesInvoiceManager}
                                ActionBtn={(row) => ActionBtn(row, "refundable")}
                                ViewBtn={(row) => ViewInvoice(row)}
                                showLoader={showLoader}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="franchisee sales invoice"
                onDelete={() => handleDeletePI()}
            />
            <AddPaymentModal
                id={PIID}
                franchiseeID={franchiseeID}
                show={showAddPaymentModal}
                onHide={handleCloseAddPaymentModal}
                balance={bal}
                // invoice={invoice}
            />
            <CloseFSModal
                show={showCloseBillModal}
                hide={handleCloseCloseBillModal}
                type="close"
                selectedRow={bill}
                page={"view"}
            />
        </div>
    );
}
