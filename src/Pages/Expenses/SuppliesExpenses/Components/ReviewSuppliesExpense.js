import React, { useState, useEffect } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { sampleItems } from "../../../../Helpers/mockData/mockData";
import Navbar from "../../../../Components/Navbar/Navbar";
import "../../PurchaseOrders/PurchaseOrders.css";
import {
    capitalizeFirstLetter,
    dateFormat,
    formatDateSlash,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import {
    approveSuppliesExpense,
    getSingleSuppliesExpense,
} from "../../../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import { getType } from "../../../../Helpers/Utils/Common";
import SEModal from "./SEModal";

export default function ReviewSuppliesExpense() {
    const { id } = useParams();
    let navigate = useNavigate();

    /* Disapprove Modal */
    const [showDisapproveModal, setShowDisapproveModal] = useState(false);
    const handleShowDisapproveModal = () => setShowDisapproveModal(true);
    const handleCloseDisapproveModal = () => setShowDisapproveModal(false);

    /* Approve Modal */
    const [showApproveModal, setShowApproveModal] = useState(false);
    const handleShowApproveModal = () => setShowApproveModal(true);
    const handleCloseApproveModal = () => setShowApproveModal(false);

    /* Pending Modal */
    const [showPendingModal, setShowPendingModal] = useState(false);
    const handleShowPendingModal = () => setShowPendingModal(true);
    const handleClosePendingModal = () => setShowPendingModal(false);

    const [inactive, setInactive] = useState(true);
    const [reviewSE, setReviewSE] = useState([]);
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("");

    /** GET API - Get single supplies expense **/
    async function fetchSingleSuppliesExpense() {
        const response = await getSingleSuppliesExpense(id);
        if (response.data) {
            var data = response.data.data[0];
            data.invoice_no = data.invoice_no?.map((invoice) => {
                return invoice.invoice_no ? invoice.invoice_no : "N/A"
            })
            data.invoice_id = data.invoice_no?.map((invoice) => {
                return invoice.id ? invoice.id : ""
            })
            var items = data.se_items.map((item) => {
                var info = item;
                info.qty = parseInt(item.qty);
                info.received_qty = item.received_qty
                    ? parseInt(item.received_qty)
                    : 0;
                info.remaining_qty = item.remaining_qty
                    ? parseInt(item.remaining_qty)
                    : 0;
                info.current_qty = item.current_qty
                    ? parseInt(item.current_qty)
                    : 0;
                info.unit = item.unit;
                info.price = `PHP ${numberFormat(item.price)}`;
                info.amount = `PHP ${numberFormat(item.total)}`;
                info.remarks = item.remarks || "-";
                info.last_received_date = item.last_received_date
                    ? formatDateSlash(item.last_received_date)
                    : "--/--/---";
                info.last_received_by = item.last_received_by
                    ? item.last_received_by
                    : "N/A";
                return info;
            });
            setReviewSE(data);
            setItems(items);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }

    function approveSE(state) {
        if (state === "disapproved") {
            handleShowDisapproveModal();
        } else if (state === "approved") {
            handleShowApproveModal();
        } else {
            handleShowPendingModal();
        }

        setStatus(state);
    }

    useEffect(() => {
        fetchSingleSuppliesExpense();
    }, []);

    const headersIncompleteOrComplete = [
        "Item",
        "Ordered Qty",
        "Received Qty",
        "Balance",
        "Current Qty",
        "Unit",
        "Unit Price",
        "Amount",
        "Remarks",
        "Latest Invoice Date",
        "Received by",
    ];
    const selectorsIncompleteOrComplete = [
        "name",
        "qty",
        "received_qty",
        "remaining_qty",
        "current_qty",
        "unit",
        "price",
        "amount",
        "remarks",
        "last_received_date",
        "last_received_by",
    ];

    const headers = [
        "Item",
        "Ordered Qty",
        "Current Qty",
        "Unit",
        "Unit Price",
        "Amount",
        "Remarks",
    ];
    const selectors = [
        "name",
        "qty",
        "current_qty",
        "unit",
        "price",
        "amount",
        "remarks",
    ];

    function renderTable() {
        return (
            <>
                <Table>
                    <thead>
                        <tr>
                            {reviewSE.order_status === "incomplete" ||
                            reviewSE.order_status === "complete" ? (
                                <>
                                    {headersIncompleteOrComplete.map(
                                        (header) => {
                                            return <th>{header}</th>;
                                        }
                                    )}
                                </>
                            ) : (
                                <>
                                    {headers.map((header) => {
                                        return <th>{header}</th>;
                                    })}
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            return reviewSE.order_status === "incomplete" ||
                                reviewSE.order_status === "complete" ? (
                                <tr key={item.id}>
                                    {selectorsIncompleteOrComplete.map(
                                        (selector) => {
                                            return <td>{item[selector]}</td>;
                                        }
                                    )}
                                </tr>
                            ) : (
                                <tr key={item.id}>
                                    {selectors.map((selector) => {
                                        return <td>{item[selector]}</td>;
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </>
        );
    }

    async function submitApproveSE() {
        const response = await approveSuppliesExpense(id, status);
        var text;
        if (status === "pending") {
            text = "Returned to Pending";
        } else {
            text = status;
        }

        if (response.data.response) {
            toast.success("Supplies Expense " + text + " Successfully", {
                style: toastStyle(),
            });
            if (status === "approved") {
                setTimeout(
                    () =>
                        navigate("/suppliesexpenses/print/" + id, {
                            state: {
                                type: text.toLowerCase(),
                                suppID: reviewSE.supplier_id,
                            },
                        }),
                    1000
                );
            } else {
                setTimeout(() => navigate("/suppliesexpenses"), 1000);
            }
        } else if (response.error) {
            toast.error(
                "Error Changing Status for Supplies Expense No. " + id,
                { style: toastStyle() }
            );
            setTimeout(() => refreshPage(), 1000);
        }
    }

    function renderButtons() {
        switch (reviewSE.order_status) {
            case "incomplete":
                return (
                    <button
                        type="button"
                        className="button-secondary me-3"
                        onClick={() => navigate("/suppliesexpenses")}
                    >
                        Close
                    </button>
                );
            case "complete":
                return (
                    <button
                        type="button"
                        className="button-secondary me-3"
                        onClick={() => navigate("/suppliesexpenses")}
                    >
                        Close
                    </button>
                );
            default:
                return (
                    <>
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate("/suppliesexpenses")}
                        >
                            Close
                        </button>
                        {getType() === "admin" ? (
                            <button
                                type="button"
                                className="button-warning me-3"
                                onClick={() => approveSE("disapproved")}
                            >
                                Disapprove
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className="button-tertiary me-3"
                            onClick={() =>
                                navigate(
                                    "/suppliesexpenses/edit/for_approval/" + id
                                )
                            }
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            className="button-primary me-3"
                            onClick={() => approveSE("approved")}
                        >
                            Approve
                        </button>
                    </>
                );
        }
    }

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"SUPPLIES"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="d-flex justify-content-between">
                    <h1 className="page-title mb-4">REVIEW SUPPLIES EXPENSE</h1>
                    <div className="review-po">
                        <span className="pe-5">SUPPLIES EXPENSE NO.</span>
                        <span>{id}</span>
                    </div>
                </div>

                {/* content */}
                <div className="review-form mb-3">
                    <Row className="review-container py-3">
                        <Row>
                            <Col xs={3}>
                                <span className="review-label">
                                    Supplier Name
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">Type</span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Purchase Date
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Invoice No.
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewSE.supplier_trade_name ||
                                        reviewSE.vendor_trade_name ||
                                        "N/A"}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewSE.type || "N/A"}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {dateFormat(reviewSE.supplies_expense_date)}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewSE.invoice_no}
                                </span>
                            </Col>
                        </Row>
                    </Row>
                    <Row className="review-container py-3">
                        <Row>
                            <Col xs={3}>
                                <span className="review-label">Branch</span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Delivery Address
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Requisitioner
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">Forwarder</span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewSE.branch_name}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewSE.delivery_address}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewSE.requisitioner_name}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewSE.forwarder_name}
                                </span>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col xs={12}>
                                <span className="review-label">Remarks</span>
                            </Col>
                            <Col xs={12}>
                                <span className="review-data">
                                    {reviewSE.remarks}
                                </span>
                            </Col>
                        </Row>
                    </Row>
                    
                    <div className="mt-4 d-flex flex-column">
                        <span className="review-data mb-2">
                            PURCHASED ITEMS
                        </span>
                        <div className="review-purchased-items">
                            {renderTable()}
                        </div>
                        <div className="d-flex justify-content-end mt-4 mx-5">
                            <div className="print-table-footer-label grand-label mx-4">
                                GRAND TOTAL
                                <span className="mx-2 print-table-footer-data grand-label">
                                    PHP {numberFormat(reviewSE.grand_total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pt-5">
                        {renderButtons()}
                    </div>
                </div>
                {/* Modals */}
                <SEModal
                    show={showApproveModal}
                    hide={handleCloseApproveModal}
                    type="approve"
                    handler={submitApproveSE}
                />
                <SEModal
                    show={showDisapproveModal}
                    hide={handleCloseDisapproveModal}
                    type="disapprove"
                    handler={submitApproveSE}
                />
                <SEModal
                    show={showPendingModal}
                    hide={handleClosePendingModal}
                    type="return"
                    handler={submitApproveSE}
                />
            </div>
        </div>
    );
}
