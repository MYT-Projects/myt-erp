import React, { useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";

import toast from "react-hot-toast";
import {
    changeStatusPurchaseOrder,
    getPurchaseOrder,
} from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    dateFormat,
    formatDate,
    formatDateSlash,
    getType,
    numberFormat,
    numberFormatInt,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import "./../PurchaseOrders.css";
import POModal from "./POModal";
import {
    changeStatusPurchaseOrderPotato,
    getPurchaseOrderPotato,
} from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";

export default function ReviewPurchaseOrder() {
    const { state, id, shopType } = useParams();
    var idInfo = id.split("-");
    var poID = idInfo[1].replace(/\s/g, "");
    let navigate = useNavigate();
    const [userType, setUserType] = useState(getType());

    const [inactive, setInactive] = useState(true);
    const [reviewPO, setReviewPO] = useState([]);
    const [items, setItems] = useState([]);

    async function fetchPO() {
        setReviewPO([]);
        setItems([]);

        if (shopType === "mango") {
            const response = await getPurchaseOrder(poID);
            if (response.error) {
                TokenExpiry(response);
            } else {
                setReviewPO(response.response.data[0]);
                var itemDeets = response.response.data[0].purchase_items;
                var purchasedItems = itemDeets.map((item) => {
                    var info = {};  

                    info.id = item.id;
                    info.ingredient_id = item.ingredient_id;
                    info.item_name = item.item_name;
                    info.qty = parseInt(item.qty);
                    info.received_qty = item.received_qty
                        ? parseInt(item.received_qty)
                        : 0;
                    info.remaining_qty = item.remaining_qty
                        ? parseInt(item.remaining_qty)
                        : 0;
                    info.current_qty = item.inventory_qty
                        ? parseInt(item.inventory_qty)
                        : 0;
                    info.unit = item.unit;
                    info.price = `PHP ${numberFormat(item.price)}`;
                    info.amount = `PHP ${numberFormat(item.amount)}`;
                    info.remarks = item.remarks || "-";
                    info.last_received_date = item.last_received_date
                        ? formatDateSlash(item.last_received_date)
                        : "--/--/---";
                    info.last_received_by = item.last_received_by
                        ? item.last_received_by
                        : "N/A";

                    return info;
                });
                setItems(purchasedItems);
            }
        } else if (shopType === "potato") {
            const response = await getPurchaseOrderPotato(poID);
            if (response.error) {
                TokenExpiry(response);
            } else {
                setReviewPO(response.response.data[0]);
                var itemDeets = response.response.data[0].purchase_items;

                var purchasedItems = itemDeets.map((item) => {
                    var info = {};

                    info.id = item.id;
                    info.ingredient_id = item.ingredient_id;
                    info.item_name = item.item_name;
                    info.qty = parseInt(item.qty);
                    info.received_qty = item.received_qty
                        ? parseInt(item.received_qty)
                        : 0;
                    info.remaining_qty = item.remaining_qty
                        ? parseInt(item.remaining_qty)
                        : 0;
                    info.current_qty = item.inventory_qty
                        ? parseInt(item.inventory_qty)
                        : 0;
                    info.unit = item.unit;
                    info.price = `PHP ${numberFormat(item.price)}`;
                    info.amount = `PHP ${numberFormat(item.amount)}`;
                    info.remarks = item.remarks || "-";
                    info.last_received_date = item.last_received_date
                        ? formatDateSlash(item.last_received_date)
                        : "--/--/----";
                    info.last_received_by = item.last_received_by;

                    return info;
                });
                setItems(purchasedItems);
            }
        }
    }

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
        "item_name",
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
        "item_name",
        "qty",
        "current_qty",
        "unit",
        "price",
        "amount",
        "remarks",
    ];
    function renderTable() {
        return (
            <Table responsive>
                <thead>
                    <tr>
                        {reviewPO.order_status === "incomplete" ||
                        reviewPO.order_status === "complete" ? (
                            <>
                                {headersIncompleteOrComplete.map((header) => {
                                    return <th>{header}</th>;
                                })}
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
                        return reviewPO.order_status === "incomplete" ||
                            reviewPO.order_status === "complete" ? (
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
        if (shopType === "mango") {
            const response = await changeStatusPurchaseOrder(poID, status);
            var text;
            if (status === "pending") {
                text = "Returned to Pending";
            } else {
                text = status;
            }
            if (response.response) {
                toast.success("Purchase Order " + text + " Successfully", {
                    style: toastStyle(),
                });
                if (status === "approve") {
                    setTimeout(
                        () =>
                            navigate("/purchaseorders/print/" + id, {
                                state: {
                                    type: text.toLowerCase(),
                                    suppID: reviewPO.supplier_id,
                                },
                            }),
                        1000
                    );
                } else {
                    setTimeout(() => navigate("/purchaseorders"), 1000);
                }
            } else if (response.error) {
                TokenExpiry(response);

                toast.error(
                    "Error Changing Status for Purchase Order No. " + id,
                    { style: toastStyle() }
                );
                setTimeout(() => refreshPage(), 1000);
            }
        } else if (shopType === "potato") {
            const response = await changeStatusPurchaseOrderPotato(
                poID,
                status
            );
            var text;
            if (status === "pending") {
                text = "Returned to Pending";
            } else {
                text = status;
            }
            if (response.response) {
                toast.success("Purchase Order " + text + " Successfully", {
                    style: toastStyle(),
                });
                if (status === "approve") {
                    setTimeout(
                        () =>
                            navigate("/purchaseorders/print/" + id, {
                                state: {
                                    type: text.toLowerCase(),
                                    suppID: reviewPO.supplier_id,
                                },
                            }),
                        1000
                    );
                } else {
                    setTimeout(() => navigate("/purchaseorders"), 1000);
                }
            } else if (response.error) {
                TokenExpiry(response);

                toast.error(
                    "Error Changing Status for Purchase Order No. " + id,
                    { style: toastStyle() }
                );
                setTimeout(() => refreshPage(), 1000);
            }
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
                    active={"PURCHASES"}
                />
            </div>
            <div
                className={`manager-container container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <div className="d-flex justify-content-between d-flex-responsive">
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
                            <Col xs={6}>
                                <span className="review-label">
                                    Supplier Name
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Purchase Date
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">
                                    Delivery Date
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6}>
                                <span className="review-data">
                                    {reviewPO.supplier_trade_name
                                        ? reviewPO.supplier_trade_name
                                        : reviewPO.vendor_trade_name}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {dateFormat(reviewPO.purchase_date)}
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {dateFormat(reviewPO.delivery_date)}
                                </span>
                            </Col>
                        </Row>
                    </Row>
                    <Row className="review-container py-3">
                        <Row>
                            <Col xs={3}>
                                <span className="review-label">Branch</span>
                            </Col>
                            <Col xs={5}>
                                <span className="review-label">
                                    Requisitioner
                                </span>
                            </Col>
                            <Col xs={4}>
                                <span className="review-label">Forwarder</span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-data">
                                    {reviewPO.branch_name}
                                </span>
                            </Col>
                            <Col xs={5}>
                                <span className="review-data">
                                    {reviewPO.requisitioner_name}
                                </span>
                            </Col>
                            <Col xs={4}>
                                <span className="review-data">
                                    {reviewPO.forwarder_name}
                                </span>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col xs={8}>
                                <span className="review-label">
                                    Delivery Address
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="review-label">Remarks</span>
                            </Col>
                            <Col xs={8}>
                                <span className="review-data">
                                    {reviewPO.delivery_address}
                                </span>
                            </Col>
                            <Col xs={3}>
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
                        <div className="review-purchased-items purchased-items">
                            {renderTable()}
                        </div>
                    </div>
                    <Row>
                        <div
                            align="right"
                            className=" grand-label-review pr-160"
                        >
                            Delivery/Service Fee PHP {reviewPO.service_fee ? numberFormat(reviewPO.service_fee) : "0.00"}
                        </div>
                    </Row>
                    <Row>
                        <div
                            align="right"
                            className=" grand-label-review pr-160"
                        >
                            Discount PHP {reviewPO.discount ? numberFormat(reviewPO.discount) : "0.00"}
                        </div>
                    </Row>
                    <Row>
                        <div
                            align="right"
                            className=" grand-label-review pr-160"
                        >
                            GRAND TOTAL PHP {numberFormat(reviewPO.grand_total)}
                        </div>
                    </Row>
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
                                {userType === "admin" ? (
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
                                        navigate(
                                            "/purchaseorders/edit/" +
                                                shopType +
                                                "/" +
                                                id +
                                                "/" +
                                                "for_approval"
                                        )
                                    }
                                >
                                    Edit
                                </button>
                                {userType === "admin" ? (
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
                            <Row className="d-flex">
                                <Col>
                                    <button
                                        type="button"
                                        className="button-secondary me-3"
                                        onClick={() =>
                                            navigate("/purchaseorders")
                                        }
                                    >
                                        Close
                                    </button>
                                </Col>
                            </Row>
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
