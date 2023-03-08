import React, { useEffect, useState } from "react";
import { Col, Row, Table, Form } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getItem } from "../../../../Helpers/apiCalls/itemsApi";
import {
    changeStatusPurchaseOrder,
    getPurchaseOrder,
} from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    dateFormat,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import cleanLogo from "../../../../Assets/Images/Login/logo.png";
import signature from "../../../../Assets/Images/signature.png";
import Navbar from "../../../../Components/Navbar/Navbar";
import POModal from "./POModal";
import { emailPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getSupplier } from "../../../../Helpers/apiCalls/suppliersApi";
import {
    changeStatusPurchaseOrderPotato,
    emailPurchaseOrderPotato,
    getPurchaseOrderPotato,
} from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import { getSupplierPotato } from "../../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getVendor } from "../../../../Helpers/apiCalls/Manage/Vendors";
import { getVendorPotato } from "../../../../Helpers/apiCalls/PotatoCorner/VendorsApi";

export default function PrintPurchaseOrder() {
    const { id } = useParams();
    var idInfo = id.split("-");
    var shopType = idInfo[0].replace(/\s/g, "");
    var poID = idInfo[1].replace(/\s/g, "");
    let navigate = useNavigate();
    const { state } = useLocation();
    const [inactive, setInactive] = useState(true);
    const [printPO, setPrintPO] = useState([]);
    const [items, setItems] = useState([]);
    const [note, setNote] = useState("");
    const [hasEmail, setHasEmail] = useState(false);

    const [showSendModal, setShowSendModal] = useState(false);
    const handleShowSendModal = () => setShowSendModal(true);
    const handleCloseSendModal = () => setShowSendModal(false);

    async function fetchPO() {
        setPrintPO({});
        setItems([]);

        if (shopType === "mango") {
            const response = await getPurchaseOrder(poID);

            if (response.error) {
                TokenExpiry(response);
            } else {
                setPrintPO(response.response.data[0]);
                var itemDeets = response.response.data[0].purchase_items;

                itemDeets.map((item) => {
                    var info = {};

                    info.detail = item.item_name;
                    info.id = item.id;
                    info.ingredient_id = item.ingredient_id;
                    info.qty = parseInt(item.qty);
                    info.unit = item.unit;
                    info.price = item.price;
                    info.amount = item.amount;
                    info.receive_qty =
                        item.received_qty === null
                            ? 0
                            : parseInt(item.received_qty);
                    info.current_qty =
                        item.inventory_qty === null
                            ? 0
                            : parseInt(item.inventory_qty);
                    info.remarks = item.remarks;

                    setItems((prev) => [...prev, info]);
                });
                fetchSupplierData();
            }
        } else if (shopType === "potato") {
            const response = await getPurchaseOrderPotato(poID);

            if (response.error) {
                TokenExpiry(response);
            } else {
                setPrintPO(response.response.data[0]);
                var itemDeets = response.response.data[0].purchase_items;

                itemDeets.map((item) => {
                    var info = {};

                    info.detail = item.item_name;
                    info.id = item.id;
                    info.ingredient_id = item.ingredient_id;
                    info.qty = parseInt(item.qty);
                    info.unit = item.unit;
                    info.price = item.price;
                    info.amount = item.amount;
                    info.receive_qty =
                        item.received_qty === null
                            ? 0
                            : parseInt(item.received_qty);
                    info.current_qty =
                        item.inventory_qty === null
                            ? 0
                            : parseInt(item.inventory_qty);
                    info.remarks = item.remarks;

                    setItems((prev) => [...prev, info]);
                });
                fetchSupplierData();
            }
        }
    }

    /* print modal handler */
    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);

    async function handlePrintPO() {
        if (shopType === "mango") {
            const response = await changeStatusPurchaseOrder(poID, "print");

            if (response.response) {
                const response1 = await changeStatusPurchaseOrder(poID, "sent");
                if (response.response) {
                    toast.loading("Printing Purchase Order", {
                        style: toastStyle(),
                    });
                    handleClosePrintModal();
                    setTimeout(() => {
                        toast.dismiss();
                        Print();
                    }, 1000);
                } else {
                    TokenExpiry(response1);
                }
            } else {
                TokenExpiry(response);

                toast.error("Error Printing Purchase Order", {
                    style: toastStyle(),
                });
                setTimeout(() => navigate("/purchaseorders"), 1000);
            }

            setTimeout(() => {
                toast.dismiss();
                navigate("/purchaseorders");
                refreshPage();
            }, 1000);
        } else if (shopType === "potato") {
            const response = await changeStatusPurchaseOrderPotato(
                poID,
                "print"
            );

            if (response.response) {
                const response1 = await changeStatusPurchaseOrderPotato(
                    poID,
                    "sent"
                );
                if (response.response) {
                    toast.loading("Printing Purchase Order", {
                        style: toastStyle(),
                    });
                    handleClosePrintModal();
                    setTimeout(() => {
                        toast.dismiss();
                        Print();
                    }, 1000);
                } else {
                    TokenExpiry(response1);
                }
            } else {
                TokenExpiry(response);

                toast.error("Error Printing Purchase Order", {
                    style: toastStyle(),
                });
                setTimeout(() => navigate("/purchaseorders"), 1000);
            }

            setTimeout(() => {
                toast.dismiss();
                navigate("/purchaseorders");
                refreshPage();
            }, 1000);
        }
    }

    async function fetchSupplierData() {
        if (shopType === "mango" && printPO.length !== 0) {
            if (printPO.supplier_id) {
                const response = await getSupplier(printPO.supplier_id);
            } else {
                const response = await getVendor(printPO.vendor_id);
            }
        } else if (shopType === "potato") {
            if (
                printPO.supplier_id !== null ||
                printPO.supplier_id !== undefined ||
                printPO.supplier_id !== ""
            ) {
                const response = await getSupplierPotato(printPO.supplier_id);

                if (response.response.data) {
                    setHasEmail(
                        response.response.data[0].email !== null &&
                            response.response.data[0].email !== "null" &&
                            response.response.data[0].email !== ""
                    );
                } else {
                    TokenExpiry(response);
                }
            } else {
                const response = await getVendorPotato(printPO.vendor_id);

                if (response.response.data) {
                    setHasEmail(
                        response.response.data[0].email !== null &&
                            response.response.data[0].email !== "null" &&
                            response.response.data[0].email !== ""
                    );
                } else {
                    TokenExpiry(response);
                }
            }
        }
    }

    async function handleSendToSupplier() {
        if (printPO.supplier_email || printPO.vendor_email) {
            if (shopType === "mango") {
                const response = await emailPurchaseOrder(poID);

                if (response.response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate("/purchaseorders", {
                            params: {
                                state: "sent",
                            },
                        });
                    }, 1000);
                } else {
                    TokenExpiry(response);
                    toast.error("Error Sending Purchase", {
                        style: toastStyle(),
                    });
                }
            } else if (shopType === "potato") {
                const response = await emailPurchaseOrderPotato(poID);

                if (response.response.response) {
                    toast.success(response.response.response, {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate("/purchaseorders", {
                            params: {
                                state: "sent",
                            },
                        });
                    }, 1000);
                } else {
                    TokenExpiry(response);
                    toast.error("Error Sending Purchase", {
                        style: toastStyle(),
                    });
                }
            }
        } else {
            toast.error("Error sending email. Supplier/vendor has no email!", {
                style: toastStyle(),
            });
        }
    }

    useEffect(() => {
        fetchSupplierData();
    }, [printPO]);

    function renderTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr>
                                <td>{item.detail}</td>
                                <td>{item.qty}</td>
                                <td className="text-lowercase">{item.unit}</td>
                                <td>{numberFormat(item.price)}</td>
                                <td>{numberFormat(item.amount)}</td>
                                <td>{item.remarks}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function Print() {
        let printContents = document.getElementById("printablediv").innerHTML;
        let originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print(printContents);
        document.body.innerHTML = originalContents;
        setTimeout(() => {
            navigate("/purchaseorders");
            refreshPage();
        }, 1000);
    }

    React.useEffect(() => {
        fetchPO();
    }, []);

    return (
        <div className="page">
            <div className="print-page page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PURCHASES"}
                />
            </div>
            <div
                className={`print-top container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <div className="print-container px-3 py-2" id="printablediv">
                    <div className="text-end print-header">
                        <span>
                            {shopType.toUpperCase()} PURCHASE ORDER NO.{" "}
                            {printPO.id}
                        </span>
                    </div>
                    <div className="print-top d-flex justify-content-center py-1">
                        <img src={cleanLogo} className="print-logo" />
                    </div>
                    <div className="print-top d-flex justify-content-center py-1 mt-1">
                        <h5 className="print-shop-header">
                            TRIPLE K EXPRESSFOODS / 3K EXPRESSFOODS / CHK
                            BUSINESS VENTURES CORP
                        </h5>
                    </div>

                    {/* content */}
                    <div className="print-body mt-5">
                        <Row>
                            <Col xs={7}>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Supplier:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printPO.supplier_trade_name
                                            ? printPO.supplier_trade_name
                                            : printPO.vendor_trade_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Branch:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printPO.branch_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Forwarder:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printPO.forwarder_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Delivery Address:
                                    </Col>
                                    <Col
                                        xs={6}
                                        className="print-data align-items-start"
                                    >
                                        {printPO.delivery_address}
                                    </Col>
                                </div>
                               
                            </Col>

                            <Col xs={5}>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Purchase Date:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {dateFormat(printPO.purchase_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Delivery Date:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {dateFormat(printPO.delivery_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Requisitioner:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printPO.requisitioner_name}
                                    </Col>
                                </div>
                            </Col>
                        </Row>
                        <div className="d-flex mt-5 mb-2 justify-content-evenly">
                            {/* table */}
                            <div className="print-table mt-3 mx-2">
                                {renderTable()}
                            </div>
                        </div>
                        <Row className="mt-4">
                            <span className="print-footer">
                                {printPO.remarks}
                            </span>
                        </Row>
                        <div className="d-flex justify-content-end mt-4 mx-5">
                            <div className="print-table-footer-label grand-label mx-4">
                                Delivery/Service Fee
                                <span className="mx-2 print-table-footer-data grand-label">
                                    PHP {printPO.service_fee ? numberFormat(printPO.service_fee) : "0.00"}
                                </span>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-4 mx-5">
                            <div className="print-table-footer-label grand-label mx-4">
                                Discount
                                <span className="mx-2 print-table-footer-data grand-label">
                                    PHP {printPO.discount ? numberFormat(printPO.discount) : "0.00"}
                                </span>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-4 mx-5">
                            <div className="print-table-footer-label grand-label mx-4">
                                GRAND TOTAL
                                <span className="mx-2 print-table-footer-data grand-label">
                                    PHP {numberFormat(printPO.grand_total)}
                                </span>
                            </div>
                        </div>

                        <Row className="mt-4 additional-note-input">
                            <Col xs={7}>
                                <div className="d-flex my-2 align-items-center">
                                    <Col
                                        xs={4}
                                        className="print-label"
                                        style={{
                                            color: "#5ac8e1",
                                            fontFamily: "Gotham-Rounded-Medium",
                                        }}
                                    >
                                        Additional Note:{" "}
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        <Form.Control
                                            size="sm"
                                            type="text"
                                            name="additional note"
                                            className="nc-modal-custom-input"
                                            value={note}
                                            onChange={(e) =>
                                                setNote(e.target.value)
                                            }
                                            required
                                        />
                                    </Col>
                                </div>
                            </Col>
                        </Row>
                        <div className="print-signatures">
                            <div className="d-flex align-items-center justify-content-end flex-column">
                                <span className="text-center text-uppercase nc-modal-custom-text">
                                    {printPO.added_by_name}
                                </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center flex-column">
                                <img src={signature} className="print-logo" />
                                <span className="text-center text-uppercase nc-modal-custom-text">
                                    KRISTOFFER CHAN
                                </span>
                            </div>
                        </div>
                        <div className="print-signatories pb-4 mb-4">
                            <span>Prepared by</span>
                            <span>Approved by</span>
                        </div>
                    </div>
                </div>

                {/* footer */}
                <Row className="d-flex my-4 justify-content-end d-flex-responsive">
                    <Col xs={2} className="mb-3">
                        <button
                            className="button-secondary me-3"
                            style={{ width: "100%" }}
                            onClick={() => navigate("/purchaseorders")}
                        >
                            Close
                        </button>
                    </Col>
                    <Col xs={2} className="mb-3">
                        <button
                            className="button-secondary me-3"
                            style={{ width: "100%" }}
                            onClick={handleShowSendModal}
                        >
                            Send to Supplier
                        </button>
                    </Col>
                    <Col xs={2} className="mb-3">
                        <button
                            className="button-primary"
                            style={{ width: "100%" }}
                            onClick={handleShowPrintModal}
                        >
                            Print
                        </button>
                    </Col>
                </Row>
            </div>
            {/* modals */}
            <POModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                handler={handlePrintPO}
            />

            <POModal
                show={showSendModal}
                hide={handleCloseSendModal}
                type="send"
                handler={handleSendToSupplier}
            />
        </div>
    );
}
