import moment from "moment";
import React, { useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import cleanLogo from "../../../../Assets/Images/Login/logo.png";
import Navbar from "../../../../Components/Navbar/Navbar";
import { getItem } from "../../../../Helpers/apiCalls/itemsApi";
import { getInvoice } from "../../../../Helpers/apiCalls/Purchases/purchaseInvoiceApi";
import {
    dateFormat,
    getTodayDateISO,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import {
    getAllReceives,
    getSingleReceive,
    getSingleReceivePotato,
} from "../../../../Helpers/apiCalls/receiveApi";
import PIModal from "./PIModal";

export default function ViewInvoice() {
    const { id, shopType, type } = useParams();
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [printPI, setPrintPI] = useState([]);
    const [items, setItems] = useState([]);

    async function fetchPI() {
        setPrintPI({});
        setItems([]);

        if (shopType === "mango") {
            const response = await getSingleReceive(id);
            if (response.error) {
                TokenExpiry(response);
            } else {
                setPrintPI(response.data.data[0]);
                var itemDeets = response.data.data[0].receive_items;

                itemDeets.map(async (item) => {
                    const response = await getItem(item.item_id);
                    var info = {};

                    if (response.data) {
                        info.detail = response.data[0].name;
                    } else {
                        TokenExpiry(response);
                    }
                    info.id = item.id;
                    info.item_name = item.item_name;
                    info.ingredient_id = item.ingredient_id;
                    info.qty = parseInt(item.qty);
                    info.unit = item.unit;
                    info.price = item.price;
                    info.amount = item.total;

                    setItems((prev) => [...prev, info]);
                });
            }
        } else if (shopType === "potato") {
            const response = await getSingleReceivePotato(id);
            if (response.error) {
                TokenExpiry(response);
            } else {
                setPrintPI(response.data.data[0]);
                var itemDeets = response.data.data[0].receive_items;
                setItems(itemDeets);
            }
        }
    }

    /* print modal handler */
    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);

    async function handlePrintPI() {
        toast.loading("Printing Invoice", { style: toastStyle() });
        handleClosePrintModal();
        setTimeout(() => {
            toast.dismiss();
            Print();
        }, 1000);
    }

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
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr>
                                <td>{item.item_name}</td>
                                <td>{item.qty}</td>
                                <td className="text-lowercase">{item.unit}</td>
                                <td>{numberFormat(item.price)}</td>
                                <td>
                                    {numberFormat(
                                        parseFloat(item.qty) *
                                            parseFloat(item.price)
                                    )}
                                </td>
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
        refreshPage();
    }

    React.useEffect(() => {
        fetchPI();
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
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="print-container px-3 py-2" id="printablediv">
                    <div className="text-end print-header d-flex flex-column">
                        <span>PURCHASE INVOICE NO. {printPI.id}</span>
                        <span className="text-uppercase">
                            {moment(getTodayDateISO()).format("MMMM DD, yyyy")}
                        </span>
                    </div>
                    <div className="d-flex justify-content-center py-1">
                        <img src={cleanLogo} className="print-logo" />
                    </div>

                    {/* content */}
                    <div className="print-body mt-5">
                        <Row>
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Supplier:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.supplier_name ||
                                            printPI.vendor_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Contact Person:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.contact_person}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        PO No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.po_id}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Waybill No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.waybill_no}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Forwarder:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.forwarder_name}
                                    </Col>
                                </div>
                            </Col>
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        DR No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.dr_no}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Invoice No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.invoice_no}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Contact No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.contact_no}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Date Purchased:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(printPI.purchase_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Date Received:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(printPI.receive_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Remarks:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.remarks}
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
                        <Row className="print-grand-total my-3 text-end">
                            <Col xs={3} className="print-table-footer-label">
                                SUBTOTAL
                            </Col>
                            <Col
                                xs={2}
                                className="print-table-footer-data text-left"
                            >
                                PHP{" "}
                                {printPI.subtotal
                                    ? numberFormat(printPI.subtotal)
                                    : "0.00"}
                            </Col>
                        </Row>
                        <Row className="print-grand-total my-3 text-end">
                            <Col xs={3} className="print-table-footer-label">
                                FREIGHT COST
                            </Col>
                            <Col
                                xs={2}
                                className="print-table-footer-data text-left"
                            >
                                PHP {printPI.freight_cost}
                            </Col>
                        </Row>
                        <Row className="print-grand-total my-3 text-end">
                            <Col xs={3} className="print-table-footer-label">
                                DISCOUNT
                            </Col>
                            <Col
                                xs={2}
                                className="print-table-footer-data text-left"
                            >
                                PHP {printPI.discount}
                            </Col>
                        </Row>
                        <Row className="print-grand-total my-3 text-end mb-5">
                            <Col xs={3} className="print-table-footer-label">
                                GRAND TOTAL
                            </Col>
                            <Col
                                xs={2}
                                className="print-table-footer-data text-left"
                            >
                                PHP{" "}
                                {printPI.grand_total
                                    ? numberFormat(printPI.grand_total)
                                    : "0.00"}
                            </Col>
                        </Row>
                        <div className="print-signatures mt-5">
                            <span className="text-center text-uppercase print-label">
                                {" "}
                            </span>
                            <span className="text-center text-uppercase print-label fw-bold">
                                {printPI.prepared_by}
                            </span>
                        </div>
                        <div className="print-signatories pb-4 mb-4">
                            <span>Received by</span>
                            <span>Prepared by</span>
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="d-flex justify-content-end my-4 d-flex-responsive">
                    <button
                        className="button-secondary me-3"
                        onClick={() => window.close()}
                    >
                        Close
                    </button>
                    <button
                        className="button-primary"
                        onClick={handleShowPrintModal}
                    >
                        Print
                    </button>
                </div>
            </div>
            {/* modals */}
            <PIModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                handler={handlePrintPI}
            />
        </div>
    );
}
