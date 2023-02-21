import moment from "moment";
import React, { useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import cleanLogo from "../../../../Assets/Images/Login/logo.png";
import Navbar from "../../../../Components/Navbar/Navbar";
import TablePagination from "../../../../Components/TableTemplate/Table";
import { getItem } from "../../../../Helpers/apiCalls/itemsApi";
import {
    getInvoicePotato,
    getPaymentHistoryPotato,
} from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseInvoiceApi";
import { getSupplierPotato } from "../../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import {
    getInvoice,
    getPaymentHistory,
} from "../../../../Helpers/apiCalls/Purchases/purchaseInvoiceApi";
import { getSupplier } from "../../../../Helpers/apiCalls/suppliersApi";
import { getVendor } from "../../../../Helpers/apiCalls/Manage/Vendors";
import { getVendorPotato } from "../../../../Helpers/apiCalls/PotatoCorner/VendorsApi";
import {
    dateFormat,
    formatDate,
    formatDateSlash,
    getName,
    getTodayDateISO,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import PIModal from "./PIModal";

export default function PrintPurchaseInvoice() {
    const { id, shopType } = useParams();
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [printPI, setPrintPI] = useState([]);
    const [items, setItems] = useState([]);
    const [paymentInfo, setPaymentInfo] = useState([]);

    async function fetchPaymentHistory() {
        if (shopType === "mango") {
            const response = await getPaymentHistory(id);

            if (response.data) {
                var history = response.data.data;

                var allPayments = history.map((payment) => {
                    var info = payment;
                    info.payment_date = formatDateSlash(payment.date);
                    info.type = payment.payment_mode;
                    info.details = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                        : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                        : payment.payment_mode
                    info.amount = payment.amount ? numberFormat(payment.amount) : "0.00";
                    return info;
                });
                setPaymentInfo(allPayments);
            } else {
                TokenExpiry(response);
            }
        } else if (shopType === "potato") {
            const response = await getPaymentHistoryPotato(id);

            if (response.data) {
                var history = response.data.data;

                var allPayments = history.map((payment) => {
                    var info = payment;
                    info.payment_date = formatDateSlash(payment.date);
                    info.type = payment.payment_mode;
                    info.details = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                        : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                        : payment.payment_mode
                    info.amount = payment.amount || "N/A";
                    return info;
                });
                setPaymentInfo(allPayments);
            } else {
                TokenExpiry(response);
            }
        }
    }

    async function fetchPI() {
        setPrintPI({});
        setItems([]);

        if (shopType === "mango") {
            const response = await getInvoice(id);

            if (response.error) {
                TokenExpiry(response);
            } else {
                var details = response.data.data[0];
                if (details.supplier_id !== null) {
                    const supplierAPI = await getSupplier(details.supplier_id);
                    var supplierContact = supplierAPI.response.data[0];
                    details.supplier_contact_person =
                        supplierContact.contact_person || "(Not indicated)";
                    details.supplier_contact_no = supplierContact.phone_no;
                } else {
                    const vendorAPI = await getVendor(details.vendor_id);
                    var supplierContact = vendorAPI.response.data[0];
                    details.supplier_contact_person =
                        supplierContact.contact_person || "(Not indicated)";
                    details.supplier_contact_no = supplierContact.phone_no;
                }
                setPrintPI(details);
                setItems(details.receive_items);
            }
        } else if (shopType === "potato") {
            const response = await getInvoicePotato(id);

            if (response.error) {
                TokenExpiry(response);
            } else {
                var details = response.data.data[0];
                if (details.supplier_id !== null) {
                    const supplierAPI = await getSupplierPotato(
                        details.supplier_id
                    );
                    var supplierContact = supplierAPI.response.data[0];
                    details.supplier_contact_person =
                        supplierContact.contact_person || "(Not indicated)";
                    details.supplier_contact_no = supplierContact.phone_no;
                } else {
                    const vendorAPI = await getVendorPotato(details.vendor_id);
                    var supplierContact = vendorAPI.response.data[0];
                    details.supplier_contact_person =
                        supplierContact.contact_person || "(Not indicated)";
                    details.supplier_contact_no = supplierContact.phone_no;
                }
                setPrintPI(details);
                var itemDeets = details.receive_items;
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
                    {items &&
                        items?.map((item) => {
                            return (
                                <tr>
                                    <td>{item.item_name}</td>
                                    <td>{item.qty}</td>
                                    <td className="text-lowercase">
                                        {item.unit}
                                    </td>
                                    <td>{numberFormat(item.price)}</td>
                                    <td>{numberFormat(item.total)}</td>
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
        fetchPaymentHistory();
    }, []);

    return (
        <div>
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
                    <div className="text-end print-header d-flex flex-column">
                        <span>PO NO. {printPI.po_id}</span>
                        <span className="text-uppercase">
                            {moment(getTodayDateISO()).format("MMMM DD, yyyy")}
                        </span>
                    </div>
                    <div className="d-flex justify-content-center py-1">
                        <img src={cleanLogo} className="print-logo" />
                    </div>
                    <div className="d-flex justify-content-center py-1 mt-1">
                        <h5 className="print-shop-header">
                            TRIPLE K EXPRESSFOODS / 3K EXPRESSFOODS / CHK
                            BUSINESS VENTURES CORP
                        </h5>
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
                                        {printPI.supplier_name
                                            ? printPI.supplier_name
                                            : printPI.vendor_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Branch:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.branch_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Contact Person:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.supplier_contact_person}
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
                                        Contact No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {printPI.supplier_contact_no}
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
                                PHP {printPI.freight_cost || "0.00"}
                            </Col>
                        </Row>
                        <Row className="print-grand-total my-3 text-end">
                            <Col xs={3} className="print-table-footer-label">
                                DELIVERY/SERVICE FEE
                            </Col>
                            <Col
                                xs={2}
                                className="print-table-footer-data text-left"
                            >
                                PHP {printPI.service_fee || "0.00"}
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
                                PHP {printPI.discount || "0.00"}
                            </Col>
                        </Row>
                        <Row className="print-grand-total my-3 text-end">
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
                        <div className="print-signatures">
                            <span className="text-center text-uppercase print-label">
                                {getName()}
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

                <Container
                    fluid
                    className="PI-payment-info-wrapper mt-5 py-3 px-3 edit-form"
                >
                    <h5 className="PI-payment-info">PAYMENT INFO</h5>
                    <div className="justify-content-center">
                        <TablePagination
                            tableHeaders={[
                                "PAYMENT DATE",
                                "TYPE",
                                "DETAILS",
                                "AMOUNT",
                            ]}
                            headerSelector={[
                                "payment_date",
                                "type",
                                "details",
                                "amount",
                            ]}
                            tableData={paymentInfo}
                        />
                    </div>
                </Container>

                {/* footer */}
                <div className="d-flex justify-content-end my-4 pb-5 d-flex-responsive">
                    <button
                        className="button-secondary me-3"
                        onClick={() => navigate("/purchaseinvoices")}
                    >
                        Close
                    </button>
                    <button
                        className="button-tertiary me-3"
                        onClick={() =>
                            navigate(
                                "/purchaseinvoices/edit/" + id + "/" + shopType
                            )
                        }
                    >
                        Edit
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
