import React, { forwardRef, useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";

// components
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/DataTable";
import DeleteModal from "../../Components/Modals/DeleteModal";

// api calls and utils
import {
    deleteInvoice,
    filterInvoice,
    getAllInvoices,
} from "../../Helpers/apiCalls/Sales/franchiseInvoice";
import {
    getTodayDate,
    refreshPage,
    toastStyle,
    TokenExpiry,
    formatDate,
    numberFormat,
} from "../../Helpers/Utils/Common";
import { getAllSuppliers } from "../../Helpers/apiCalls/suppliersApi";

// css
import "./Franchise.css";
import "../Purchases/PurchaseOrders/PurchaseOrders.css";
import {
    getAllFranchisee,
    searchFranchiseeApi,
} from "../../Helpers/apiCalls/franchiseeApi";
import {
    deleteFranchisee,
    searchFranchisee,
} from "../../Helpers/apiCalls/Franchise/FranchiseApi";
import AddPaymentModal from "./AddPaymentModal";
import Moment from "moment";
/**
 *  Franchise Sales Report
 */
export default function FranchiseSalesReport() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const [inactive, setInactive] = useState(true);
    const [openListPI, setOpenListPI] = useState([]);
    const [closeListPI, setCloseListPI] = useState([]);
    const [franchisees, setFranchisees] = useState([]);

    /* FILTER CONFIGS */
    const [filterConfig, setFilterConfig] = useState({
        name: "",
        payment_status: "open_bill",
        franchised_on_from: "",
        franchised_on_to: "",
    });

    const today = Moment().format("MM/DD/YYYY");

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    async function fetchFilteredPI() {
        if (
            filterConfig.franchise ||
            (filterConfig.franchised_on_from && filterConfig.franchised_on_to)
        ) {
            setShowLoader(true);

            const response = await searchFranchisee(filterConfig);
            if (response.data) {
                var allBills = response.data.data.map((data) => {
                    var franchise = data;
                    franchise.franchised_on =
                        formatDate(franchise.franchised_on) || "N/A";
                    franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
                    franchise.paid_amount = numberFormat(franchise.paid_amount);
                    franchise.balance = numberFormat(franchise.balance)
                    return franchise;
                });

                var closedBills = allBills.filter(
                    (bill) =>
                        bill.payment_status === "closed_bill" ||
                        bill.payment_status === "paid"
                );
                var openBills = allBills.filter(
                    (bill) =>
                        bill.payment_status === "open_bill" ||
                        bill.payment_status === "unpaid"
                );
                setCloseListPI(closedBills);
                setOpenListPI(openBills);
            } else if (response.error) {
                setCloseListPI([]);
                setOpenListPI([]);
            }
            setShowLoader(false);
        } else if (filterConfig.franchise === "") {
            setShowLoader(true);

            const response = await searchFranchisee(filterConfig.franchise);
            if (response.data) {
                var allBills = response.data.data.map((data) => {
                    var franchise = data;
                    franchise.franchised_on =
                        formatDate(franchise.franchised_on) || "N/A";
                    franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
                    franchise.paid_amount = numberFormat(franchise.paid_amount);
                    franchise.balance = numberFormat(franchise.balance)
                    return franchise;
                });

                var closedBills = allBills.filter(
                    (bill) =>
                        bill.payment_status === "closed_bill" ||
                        bill.payment_status === "paid"
                );
                var openBills = allBills.filter(
                    (bill) =>
                        bill.payment_status === "open_bill" ||
                        bill.payment_status === "unpaid"
                );
                setCloseListPI(closedBills);
                setOpenListPI(openBills);
            } else if (response.error) {
                setCloseListPI([]);
                setOpenListPI([]);
            }
            setShowLoader(false);
        }
    }

    const [franchiseeManager, setFranchiseeManager] = useState([]);
    async function searchFranchisee() {
        setShowLoader(true);
        setFranchiseeManager([]);

        const response = await searchFranchiseeApi(filterConfig);

        if (response.data) {
            var allBills = response.data.data.map((data) => {
                var franchise = data;
                franchise.franchised_on =
                    formatDate(franchise.franchised_on) || "N/A";
                franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
                franchise.paid_amount = numberFormat(franchise.paid_amount);
                franchise.balance = numberFormat(franchise.balance)
                return franchise;
            });
            setFranchiseeManager(allBills);
        } else if (response.error) {
            TokenExpiry(response);
        }
        setShowLoader(false);

    }

    const [showLoader, setShowLoader] = useState(false);

    async function fetchPI() {
        setShowLoader(true);
        setOpenListPI([]);
        setCloseListPI([]);

        const response = await getAllFranchisee();

        if (response.error) {
            TokenExpiry(response.error);
        } else if (response.data) {
            var closedBills = [];
            var openBills = [];

            var allFranchiseeSalesInvoice = response.data.data.map((data) => {
                var franchise = data;
                franchise.franchised_on =
                    formatDate(franchise.franchised_on) || "N/A";
                franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
                franchise.paid_amount = numberFormat(franchise.paid_amount);
                franchise.balance = numberFormat(franchise.balance)
                return franchise;
            });

            closedBills = allFranchiseeSalesInvoice.filter(
                (bill) =>
                    bill.payment_status === "closed_bill" ||
                    bill.payment_status === "paid"
            );
            openBills = allFranchiseeSalesInvoice.filter(
                (bill) =>
                    bill.payment_status === "open_bill" ||
                    bill.payment_status === "unpaid"
            );
            setCloseListPI(closedBills);
            setOpenListPI(openBills);
        }
        setShowLoader(false);
    }

    async function fetchFranchisee() {
        setShowLoader(true);

        const response = await getAllFranchisee();

        if (response.error) {
            TokenExpiry(response.error);
        } else {
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
    const [balance, setBalance] = useState("");

    async function handleDeletePI() {
        const response = await deleteFranchisee(PIID);

        if (response.data) {
            toast.success("Franchisee Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Franchisee", {
                style: toastStyle(),
            });
        }
    }

    /* add modal handler */
    const [showAddModal, setShowAddModal] = useState(false);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    /* add payment modal handler */
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const handleShowPaymentModal = () => setShowPaymentModal(true);
    const handleClosePaymentModal = () => setShowPaymentModal(false);
    const [franchiseeID, setFranchiseeID] = useState("");

    function handleSelectChange(e, id, franchisee_id, balance) {
        if (e.target.value === "edit-pi") {
            navigate("edit/" + franchisee_id);
        } else if (e.target.value === "print-pi") {
            navigate("print/" + franchisee_id);
        } else if (e.target.value === "payment-pi") {
            setBalance(balance);
            setPIID(id);
            setBalance(balance);
            setFranchiseeID(franchisee_id);
            handleShowAddPaymentModal();
        } else if (e.target.value === "delete-pi") {
            setPIID(franchisee_id);
            handleShowDeleteModal();
        }
    }

    function ViewPIBtn(row) {
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

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) =>
                    handleSelectChange(e, row.branch_id, row.id, row.balance)
                }
            >
                <option value="" hidden selected>
                    Select
                </option>
                {type === "open_bill" && type === "admin" ? (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="print-pi" className="color-options">
                    View
                </option>
                {type === "open_bill" ? (
                    <option value="payment-pi" className="color-options">
                        Add Payment
                    </option>
                ) : null}
                {type === "admin" && (
                    <option value="delete-pi" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    function ViewBtn(row) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={(e) => handleViewBtn(row.id)}
            >
                View
            </button>
        );
    }

    function handleViewBtn(id) {
        navigate("print/" + id);
    }

    function PayBtn(row) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table small"
                onClick={(e) => handleShowModal(row.id, row.balance)}
            >
                Add Payment
            </button>
        );
    }

    function handleShowModal(id, balance) {
        setFranchiseeID(id);
        setBalance(balance);
        handleShowAddPaymentModal();
    }

    
    useEffect(() => {
        searchFranchisee();
    }, [filterConfig]);

    React.useEffect(() => {
        return () => {};
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
                        <h1 className="page-title">FRANCHISE SALES REPORT</h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="franchise"
                            placeholder="Search franchisee..."
                            value={filterConfig.franchise}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <button
                            className="add-btn"
                            onClick={() => navigate("/franchise/add")}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                <Tabs defaultActiveKey="open_bills" id="PO-tabs">
                    <Tab eventKey="open_bills" title="Open Bills">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                FILTER BY Franchisee Date From:
                            </span>
                            <DatePicker
                                placeholderText={today}
                                selected={filterConfig.franchised_on_from}
                                name="franchised_on_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            franchised_on_from: date,
                                        };
                                    });
                                }}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                placeholderText={today}
                                selected={filterConfig.franchised_on_to}
                                name="franchised_on_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            franchised_on_to: date,
                                        };
                                    });
                                }}
                                minDate={filterConfig.franchised_on_from}
                                className="PI-date-btn me-3 form-control"
                            />
                        </div>

                        {/* content */}
                        <div className="">
                            <Table
                                tableHeaders={[
                                    "*",
                                    "FRANCHISE DATE",
                                    "BRANCH NAME",
                                    "FRANCHISEE",
                                    "FRANCHISEE FEE",
                                    "PAID AMOUNT",
                                    "BALANCE",
                                    "ADDRESS",
                                    "CONTACT PERSON",
                                    "CONTACT NUMBER",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "*",
                                    "franchised_on",
                                    "branch_name",
                                    "name", 
                                    "franchisee_fee",
                                    "paid_amount",
                                    "balance",
                                    "address",
                                    "contact_person",
                                    "contact_number",
                                ]}
                                tableData={franchiseeManager}
                                PayBtn={(row) => PayBtn(row)}
                                ActionBtn={(row) => ActionBtn(row, "open_bill")}
                                showLoader={showLoader}
                                withActionData={false}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="closed_bills" title="Closed Bills">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>

                            <Form.Select
                                name="franchise"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchise}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="all" selected>
                                    All Franchisees
                                </option>
                                {franchisees.length > 0 ? (
                                    franchisees.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No franchisees found)
                                    </option>
                                )}
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={today}
                                selected={filterConfig.franchised_on_from}
                                name="franchised_on_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            franchised_on_from: date,
                                        };
                                    });
                                }}
                                maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                placeholderText={today}
                                selected={filterConfig.franchised_on_to}
                                name="franchised_on_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            franchised_on_to: date,
                                        };
                                    });
                                }}
                                maxDate={dateToday}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                            />
                        </div>

                        {/* content */}
                        <div className="">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "FRANCHISE DATE",
                                    "BRANCH NAME",
                                    "FRANCHISEE",
                                    "FRANCHISEE FEE",
                                    "PAID AMOUNT",
                                    "BALANCE",
                                    "ADDRESS",
                                    "CONTACT PERSON",
                                    "CONTACT NUMBER",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "franchised_on",
                                    "branch_name",
                                    "name",
                                    "franchisee_fee",
                                    "paid_amount",
                                    "balance",
                                    "address",
                                    "contact_person",
                                    "contact_number",
                                ]}
                                tableData={franchiseeManager}
                                ActionBtn={(row) =>
                                    ActionBtn(row, "closed_bill")
                                }
                                ViewBtn={(row) => ViewBtn(row)}
                                showLoader={showLoader}
                                withActionData={false}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="franchisee"
                onDelete={() => handleDeletePI()}
            />
            <AddPaymentModal
                id={PIID}
                balance={balance}
                franchiseeID={franchiseeID}
                show={showAddPaymentModal}
                onHide={handleCloseAddPaymentModal}
            />
        </div>
    );
}
