import React, { useState } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    dateFormat,
    isAdmin,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../Helpers/Utils/Common";

import DeleteModal from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import POModal from "./Components/POModal";
import Moment from "moment";
import toast from "react-hot-toast";
import {
    changeStatusPurchaseOrder,
    deletePurchaseOrder,
    getAllPurchaseOrder,
    receivePurchaseOrder,
} from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllSuppliers } from "../../../Helpers/apiCalls/suppliersApi";
import { getSingleUser } from "../../../Helpers/apiCalls/usersApi";
import EmailPurchaseOrder from "./Components/EmailPurchaseOrder";
import "./PurchaseOrders.css";

/**
 *      Supplies Expenses Purchase Orders
 */
export default function PurchaseOrders() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [poID, setPoID] = useState({ id: "", supplier: "" });

    async function handleDeletePO() {
        const response = await deletePurchaseOrder(poID.id);

        if (response.response) {
            toast.success("Supplies PO Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Supplies PO", { style: toastStyle() });
        }
    }

    /* return modal handler */
    const [showReturnModal, setShowReturnModal] = useState(false);
    const handleShowReturnModal = () => setShowReturnModal(true);
    const handleCloseReturnModal = () => setShowReturnModal(false);

    async function handleReturnPO() {
        const response = await changeStatusPurchaseOrder(poID.id, "pending");

        if (
            response.response.response ===
            "purchase status changed successfully"
        ) {
            toast.success("Supplies PO Returned to Pending", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Returning Supplies PO to Pending", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    const [suppliers, setSuppliers] = useState([]);

    async function fetchSuppliers() {
        setSuppliers([]);
        const response = await getAllSuppliers();
        setSuppliers(
            response.response.data.sort((a, b) => {
                return a.trade_name < b.trade_name
                    ? -1
                    : a.trade_name > b.trade_name
                    ? 1
                    : 0;
            })
        );
    }

    async function handleSelectChange(e, suppID) {
        setPoID({ id: e.target.id, supplier: suppID });

        switch (e.target.value) {
            case "edit-po":
                navigate("edit/" + e.target.id);
                break;

            case "delete-po":
                handleShowDeleteModal();
                break;

            case "return-po":
                handleShowReturnModal();
                break;

            case "print-po":
                navigate("print/" + e.target.id);
                break;

            case "review-po":
                navigate("review/0/" + e.target.id);
                break;

            case "view-po":
                navigate("review/1/" + e.target.id);
                break;

            case "send-po":
                handleShowSendModal();
                break;

            case "email-po":
                handleShowEmailModal();
                break;

            case "receive-po":
                const response = await receivePurchaseOrder(e.target.id);
                if (response.response.response) {
                    toast.success("Supplies PO Received", {
                        style: toastStyle(),
                    });
                    setTimeout(
                        () => navigate("/purchaseinvoices/add/" + e.target.id),
                        1000
                    );
                } else {
                    toast.error("Error Receiving Supplies PO", {
                        style: toastStyle(),
                    });
                }
                break;
        }
    }

    /* send modal handler */
    const [showSendModal, setShowSendModal] = useState(false);
    const handleShowSendModal = () => setShowSendModal(true);
    const handleCloseSendModal = () => setShowSendModal(false);

    async function handleSendPO() {
        const response = await changeStatusPurchaseOrder(poID.id, "sent");

        if (
            response.response.response ===
            "purchase status changed successfully"
        ) {
            toast.success("Supplies PO Sent Successfully", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Sending Supplies PO", { style: toastStyle() });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    /* email modal handler */
    const [showEmailModal, setShowEmailModal] = useState(false);
    const handleShowEmailModal = () => setShowEmailModal(true);
    const handleCloseEmailModal = () => refreshPage();

    const [pendingPO, setPendingPO] = useState([]);
    const [approvedPO, setApprovedPO] = useState([]);
    const [printedPO, setPrintedPO] = useState([]);
    const [sentPO, setSentPO] = useState([]);
    const [disapprovedPO, setDisapprovedPO] = useState([]);
    const [deletedPO, setDeletedPO] = useState([]);
    const [allPO, setAllPO] = useState([]);
    const [approvalPO, setApprovalPO] = useState([]);

    function clearTables() {
        setPendingPO([]);
        setApprovedPO([]);
        setPrintedPO([]);
        setSentPO([]);
        setDisapprovedPO([]);
        setDeletedPO([]);
        setAllPO([]);
        setApprovalPO([]);
    }

    const [showLoader, setShowLoader] = useState(false);

    // fetch all PO
    async function fetchData() {
        setShowLoader(true);
        clearTables();

        const response = await getAllPurchaseOrder();

        if (response.error) {
        } else {
            var purchaseOrders = response.data.data;
            purchaseOrders.map(async (PO) => {
                var info = {};

                info.id = PO.id;
                info.purchase_date = dateFormat(PO.purchase_date);
                info.trade_name = PO.supplier_trade_name;
                info.grand_total = numberFormat(PO.grand_total);
                info.order_status = PO.order_status;
                info.po_status = PO.status;
                info.added_by = PO.added_by_name;
                info.supplier_id = PO.supplier_id;

                if (PO.with_payment === "1") {
                    info.payment_status = "paid";
                }

                if (PO.is_deleted === "1") {
                    info.po_status = "deleted";
                    setDeletedPO((prev) => [...prev, info]);
                } else if (PO.status === "pending") {
                    setPendingPO((prev) => [...prev, info]);
                } else if (PO.status === "approved") {
                    info.approved_by = PO.approved_by_name;
                    setApprovedPO((prev) => [...prev, info]);
                } else if (PO.status === "printed") {
                    info.po_status = "approved | printed";
                    info.approved_by = PO.approved_by_name;
                    info.printed_by = PO.printed_by_name;

                    setApprovedPO((prev) => [...prev, info]);
                    setPrintedPO((prev) => [...prev, info]);
                } else if (PO.status === "sent") {
                    info.approved_by = PO.approved_by_name;
                    info.printed_by = PO.printed_by_name;

                    setSentPO((prev) => [...prev, info]);
                } else if (PO.status === "disapproved") {
                    const name = await getSingleUser(PO.disapproved_by);
                    info.disapproved_by =
                        name.data.first_name + " " + name.data.last_name;

                    setDisapprovedPO((prev) => [...prev, info]);
                } else if (PO.status === "for_approval") {
                    info.po_status = "for approval";
                    setApprovalPO((prev) => [...prev, info]);
                }
                setAllPO((prev) => [...prev, info]);
            });
        }
        setShowLoader(false);
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                id={row.id}
                onChange={(e) => handleSelectChange(e, row.supplier_id)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                {type === "deleted" ? (
                    <>
                        <option value="view-po" className="color-options">
                            View
                        </option>
                        <option value="return-po" className="color-yellow">
                            Return to Pending
                        </option>
                    </>
                ) : (
                    <>
                        {type.startsWith("approved") ? (
                            <>
                                <option
                                    value="print-po"
                                    className="color-options"
                                >
                                    {type.includes("printed")
                                        ? "Reprint"
                                        : "Print"}
                                </option>
                                <option
                                    value="send-po"
                                    className="color-options"
                                >
                                    Send to Supplier
                                </option>
                                <option
                                    value="email-po"
                                    className="color-options"
                                >
                                    Email to Supplier
                                </option>
                                <option
                                    value="return-po"
                                    className="color-yellow"
                                >
                                    Return to Pending
                                </option>
                            </>
                        ) : (
                            <>
                                {type === "sent" ? (
                                    <>
                                        <option
                                            value="print-po"
                                            className="color-options"
                                        >
                                            Print
                                        </option>
                                        <option
                                            value="receive-po"
                                            className="color-options"
                                        >
                                            Receive PO
                                        </option>
                                        <option
                                            value="email-po"
                                            className="color-yellow"
                                        >
                                            Email to Supplier
                                        </option>
                                    </>
                                ) : (
                                    <>
                                        {type === "disapproved" ? (
                                            <option
                                                value="return-po"
                                                className="color-yellow"
                                            >
                                                Return to Pending
                                            </option>
                                        ) : (
                                            <>
                                                {type === "for approval" ? (
                                                    <>
                                                        <option
                                                            value="review-po"
                                                            className="color-options"
                                                        >
                                                            Review for Approval
                                                        </option>
                                                        <option
                                                            value="return-po"
                                                            className="color-yellow"
                                                        >
                                                            Return to Pending
                                                        </option>
                                                    </>
                                                ) : (
                                                    <>
                                                        {isAdmin && (
                                                            <option
                                                                value="edit-po"
                                                                className="color-options"
                                                            >
                                                                Edit
                                                            </option>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {isAdmin && (
                            <option value="delete-po" className="color-red">
                                Delete
                            </option>
                        )}
                    </>
                )}
            </Form.Select>
        );
    }

    React.useEffect(() => {
        fetchData();
        fetchSuppliers();
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"EXPENSES"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                {/* headers */}
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> SUPPLIES PO </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input type="search" className="search-bar" />
                        <button
                            className="add-btn"
                            onClick={() => navigate("/purchaseorders/add")}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                {/* tabs */}
                <Tabs defaultActiveKey="pending" id="PO-tabs">
                    <Tab eventKey="pending" title="pending">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="supplier"
                                className="date-filter me-3"
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                {suppliers.map((supplier) => {
                                    return (
                                        <option value={supplier.id}>
                                            {supplier.trade_name}
                                        </option>
                                    );
                                })}
                            </Form.Select>

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="date_from"
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="date_to"
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SUPPLIES PO NO.",
                                "PURCHASE DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PO STATUS",
                                "ORDER STATUS",
                                "PAYMENT STATUS",
                                "PAYMENT REF NO",
                                "PREPARED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "po_status",
                                "order_status",
                                "payment_status",
                                "",
                                "added_by",
                            ]}
                            tableData={pendingPO}
                            ActionBtn={(row) => ActionBtn(row, "pending")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="for_approval" title="for approval">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="supplier"
                                className="date-filter me-3"
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                <option value="1">Sample Supplier 1</option>
                                <option value="2">Sample Supplier 2</option>
                                <option value="3">Sample Supplier 3</option>
                                <option value="4">Sample Supplier 4</option>
                            </Form.Select>

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="date_from"
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="date_to"
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SUPPLIES PO NO.",
                                "PURCHASE DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PO STATUS",
                                "ORDER STATUS",
                                "PAYMENT STATUS",
                                "PAYMENT REF NO",
                                "PREPARED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "po_status",
                                "order_status",
                                "payment_status",
                                "",
                                "added_by",
                            ]}
                            tableData={approvalPO}
                            ActionBtn={(row) => ActionBtn(row, "for approval")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="approved" title="approved">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="supplier"
                                className="date-filter me-3"
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                <option value="1">Sample Supplier 1</option>
                                <option value="2">Sample Supplier 2</option>
                                <option value="3">Sample Supplier 3</option>
                                <option value="4">Sample Supplier 4</option>
                            </Form.Select>

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="date_from"
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="date_to"
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SUPPLIES PO NO.",
                                "PURCHASE DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PO STATUS",
                                "ORDER STATUS",
                                "PAYMENT STATUS",
                                "PAYMENT REF NO",
                                "PREPARED BY",
                                "APPROVED BY",
                                "PRINTED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "po_status",
                                "order_status",
                                "payment_status",
                                "",
                                "added_by",
                                "approved_by",
                                "printed_by",
                            ]}
                            tableData={approvedPO}
                            ActionBtn={(row) => ActionBtn(row, row.po_status)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="sent" title="sent">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="supplier"
                                className="date-filter me-3"
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                <option value="1">Sample Supplier 1</option>
                                <option value="2">Sample Supplier 2</option>
                                <option value="3">Sample Supplier 3</option>
                                <option value="4">Sample Supplier 4</option>
                            </Form.Select>

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="date_from"
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="date_to"
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SUPPLIES PO NO.",
                                "PURCHASE DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PO STATUS",
                                "ORDER STATUS",
                                "PAYMENT STATUS",
                                "PAYMENT REF NO",
                                "PREPARED BY",
                                "APPROVED BY",
                                "PRINTED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "po_status",
                                "order_status",
                                "payment_status",
                                "",
                                "added_by",
                                "approved_by",
                                "printed_by",
                            ]}
                            tableData={sentPO}
                            ActionBtn={(row) => ActionBtn(row, "sent")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="disapproved" title="disapproved">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="supplier"
                                className="date-filter me-3"
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                <option value="1">Sample Supplier 1</option>
                                <option value="2">Sample Supplier 2</option>
                                <option value="3">Sample Supplier 3</option>
                                <option value="4">Sample Supplier 4</option>
                            </Form.Select>

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="date_from"
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="date_to"
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SUPPLIES PO NO.",
                                "PURCHASE DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PO STATUS",
                                "ORDER STATUS",
                                "PAYMENT STATUS",
                                "PAYMENT REF NO",
                                "PREPARED BY",
                                "DISAPPROVED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "po_status",
                                "order_status",
                                "payment_status",
                                "",
                                "added_by",
                                "disapproved_by",
                            ]}
                            tableData={disapprovedPO}
                            ActionBtn={(row) => ActionBtn(row, "disapproved")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="deleted" title="deleted">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="supplier"
                                className="date-filter me-3"
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                <option value="1">Sample Supplier 1</option>
                                <option value="2">Sample Supplier 2</option>
                                <option value="3">Sample Supplier 3</option>
                                <option value="4">Sample Supplier 4</option>
                            </Form.Select>

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="date_from"
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="date_to"
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SUPPLIES PO NO.",
                                "PURCHASE DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PO STATUS",
                                "ORDER STATUS",
                                "PAYMENT STATUS",
                                "PAYMENT REF NO",
                                "PREPARED BY",
                                "APPROVED BY",
                                "PRINTED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "po_status",
                                "order_status",
                                "payment_status",
                                "",
                                "added_by",
                                "approved_by",
                                "printed_by",
                            ]}
                            tableData={deletedPO}
                            ActionBtn={(row) => ActionBtn(row, "deleted")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="all" title="all">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="supplier"
                                className="date-filter me-3"
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                <option value="1">Sample Supplier 1</option>
                                <option value="2">Sample Supplier 2</option>
                                <option value="3">Sample Supplier 3</option>
                                <option value="4">Sample Supplier 4</option>
                            </Form.Select>

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="date_from"
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="date_to"
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "SUPPLIES PO NO.",
                                "PURCHASE DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PO STATUS",
                                "ORDER STATUS",
                                "PAYMENT STATUS",
                                "PAYMENT REF NO",
                                "PREPARED BY",
                                "APPROVED BY",
                                "PRINTED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "po_status",
                                "order_status",
                                "payment_status",
                                "",
                                "added_by",
                                "approved_by",
                                "printed_by",
                            ]}
                            tableData={allPO}
                            ActionBtn={(row) => ActionBtn(row, row.po_status)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>

            {/* modals */}
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="purchase order"
                onDelete={() => handleDeletePO()}
            />
            <POModal
                show={showReturnModal}
                hide={handleCloseReturnModal}
                type="return"
                handler={handleReturnPO}
            />
            <POModal
                show={showSendModal}
                hide={handleCloseSendModal}
                type="send"
                handler={handleSendPO}
            />
            <EmailPurchaseOrder
                show={showEmailModal}
                hide={handleCloseEmailModal}
                po_id={poID.id}
                supplier_id={poID.supplier}
            />
        </div>
    );
}
