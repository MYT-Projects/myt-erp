import React, { useState } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { sampleItems } from "../../../../Helpers/mockData/mockData";
import Navbar from "../../../../Components/Navbar/Navbar";

import "./../PurchaseOrders.css";
import {
    capitalizeFirstLetter,
    dateFormat,
    getType,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import {
    changeStatusPurchaseOrder,
    getPurchaseOrder,
} from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getItem } from "../../../../Helpers/apiCalls/itemsApi";
import toast from "react-hot-toast";
import POModal from "./POModal";

export default function ReviewPurchaseOrder() {
    const { state, id } = useParams();
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [reviewPO, setReviewPO] = useState([]);
    const [items, setItems] = useState([]);

    async function fetchPO() {
        setReviewPO([]);
        setItems([]);

        const response = await getPurchaseOrder(id);

        if (response.error) {
            TokenExpiry(response);
        } else {
            setReviewPO(response.response.data[0]);
            var itemDeets = response.response.data[0].purchase_items;

            itemDeets.map(async (item) => {
                const response = await getItem(item.ingredient_id);
        
                var info = {};
                info.detail = item.item_name;
                info.id = item.id;
                info.ingredient_id = item.ingredient_id;
                info.qty = item.qty;
                info.unit = item.unit;
                info.price = item.price;
                info.amount = item.amount;

                setItems((prev) => [...prev, info]);
            });
        }
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr key={item.id}>
                                <td>{item.detail}</td>
                                <td>{item.qty}</td>
                                <td>{item.unit}</td>
                                <td>PHP {numberFormat(item.price)}</td>
                                <td>PHP {numberFormat(item.amount)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

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

    const [status, setStatus] = useState("");

    function approvePO(state) {
        if (state === "disapproved") {
            handleShowDisapproveModal();
        } else if (state === "approve") {
            handleShowApproveModal();
        } else {
            handleShowPendingModal();
        }

        setStatus(state);
    }

    async function submitApprovePO() {
        const response = await changeStatusPurchaseOrder(id, status);


        var text;
        if (status === "pending") {
            text = "Returned to Pending";
        } else {
            text = capitalizeFirstLetter(status);
        }

        if (
            response.response.response ===
            "purchase status changed successfully"
        ) {
            toast.success("Purchase Order " + { text } + " Successfully", {
                style: toastStyle(),
            });
            if (status === "approve") {
                setTimeout(() => navigate("/purchaseorders/print/" + id), 1000);
            } else {
                setTimeout(() => navigate("/purchaseorders"), 1000);
            }
        } else {
            toast.error("Error Changing Status for Purchase Order No. " + id, {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    React.useEffect(() => {
        fetchPO();
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
                <div className="d-flex justify-content-between">
                    <h1 className="page-title mb-4">REVIEW PURCHASE ORDER</h1>
                    <div className="review-po">
                        <span className="pe-5">PURCHASE ORDER NO.</span>
                        <span>{id}</span>
                    </div>
                </div>

                {/* content */}
                <div className="review-form mb-3">
                    <Row className="review-container py-3">
                        <Row>
                            <Col xs={4}>
                                <span className="review-label">
                                    Supplier Name
                                </span>
                            </Col>
                            <Col xs={5}>
                                <span className="review-label">Purpose</span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Purchase Date
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <span className="review-data">
                                    {reviewPO?.supplier_trade_name}
                                </span>
                            </Col>
                            <Col xs={5}>
                                <span className="review-data">
                                    {reviewPO.purpose}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {dateFormat(reviewPO.purchase_date)}
                                </span>
                            </Col>
                        </Row>
                    </Row>
                    <Row className="review-container py-3">
                        <Row>
                            <Col xs={2}>
                                <span className="review-label">
                                    Delivery Date
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Delivery Address
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className="review-label">Forwarder</span>
                            </Col>
                            <Col xs={2}>
                                <span className="review-label">
                                    Requisitioner
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className="review-label">Remarks</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={2}>
                                <span className="review-data">
                                    {dateFormat(reviewPO.delivery_date)}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewPO.delivery_address}
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className="review-data">
                                    {reviewPO.forwarder_name}
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className="review-data">
                                    {reviewPO.requisitioner}
                                </span>
                            </Col>
                            <Col xs={2}>
                                <span className="review-data">
                                    {reviewPO.remarks}
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
                    </div>
                    <div className="print-table-footer">
                        <Col
                            xs={3}
                            className="print-table-footer-label text-start"
                        >
                            GRAND TOTAL
                        </Col>
                        <Col
                            xs={2}
                            className="print-table-footer-data text-start"
                        >
                            PHP {numberFormat(reviewPO.grand_total)}
                        </Col>
                    </div>
                    
                    <div className="d-flex justify-content-end pt-5">
                        {state === "0" ? (
                            <>
                                <button
                                    type="button"
                                    className="button-secondary me-3"
                                    onClick={() => navigate("/purchaseorders")}
                                >
                                    Close
                                </button>
                                {getType() === "manager" ? (
                                    <button
                                        type="button"
                                        className="button-warning me-3"
                                        onClick={() => approvePO("disapproved")}
                                    >
                                        Disapprove
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    className="button-tertiary me-3"
                                    onClick={() =>
                                        navigate("/purchaseorders/edit/" + id)
                                    }
                                >
                                    Edit
                                </button>
                                {getType() === "manager" ? (
                                    <button
                                        type="button"
                                        className="button-primary"
                                        onClick={() => approvePO("approve")}
                                    >
                                        Approve
                                    </button>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="button-secondary me-3"
                                    onClick={() => navigate("/purchaseorders")}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="button-primary me-3"
                                    onClick={() => approvePO("pending")}
                                >
                                    Restore
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {/* Modals */}
                <POModal
                    show={showApproveModal}
                    hide={handleCloseApproveModal}
                    type="approve"
                    handler={submitApprovePO}
                />
                <POModal
                    show={showDisapproveModal}
                    hide={handleCloseDisapproveModal}
                    type="disapprove"
                    handler={submitApprovePO}
                />
                <POModal
                    show={showPendingModal}
                    hide={handleClosePendingModal}
                    type="return"
                    handler={submitApprovePO}
                />
            </div>
        </div>
    );
}
