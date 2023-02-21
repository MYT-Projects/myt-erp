import moment from "moment";
import React, { useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import cleanLogo from "../../Assets/Images/Login/logo.png";
import signature from "../../Assets/Images/signature.png";
import Navbar from "../../Components/Navbar/Navbar";
import PaymentTable from "./PaymentTable";
import { getSingleSalesInvoice } from "../../Helpers/apiCalls/franchiseeApi";
import { getItem } from "../../Helpers/apiCalls/itemsApi";
import {
    getInvoice,
    getPaymentHistory,
} from "../../Helpers/apiCalls/Purchases/purchaseInvoiceApi";
import { getSupplier } from "../../Helpers/apiCalls/suppliersApi";
import {
    dateFormat,
    formatDate,
    getName,
    getTodayDateISO,
    isAdmin,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../Helpers/Utils/Common";
import "./SalesInvoice.css";
import Moment from "moment";

export default function PrintSalesInvoice() {
    const { franchisee_sale_id } = useParams(); // franchisee_sale_id
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [salesInvoice, setSalesInvoice] = useState([]);
    const [items, setItems] = useState([]);
    const [paymentInfo, setPaymentInfo] = useState([]);

    async function fetchSalesInvoice() {
        setSalesInvoice({});
        setPaymentInfo([]);
        setItems([]);

        const response = await getSingleSalesInvoice(franchisee_sale_id);
        //console.log(response);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var details = response.data.data[0];
            // if (details.payment_status === "closed_bill") {
            //     details.fs_status = "Invoiced";
            // } else if (
            //     details.payment_status === "open_bill" &&
            //     (details.paid_amount !== "0.00" ||
            //         details.franchisee_sale_payments.length !== 0)
            // ) {
            //     details.fs_status = "Invoiced";
            // };
            setSalesInvoice(details);
            setItems(details.franchisee_sale_items);
            //console.log(details.franchisee_sale_payments);

            var payment = details.franchisee_sale_payments.map((data) => {
                if (data.paid_amount !== "0.00") {
                    var info = data;
                    if (data.payment_type === "check") {
                        info.payment_type =
                            data.payment_type + "-" + data.cheque_number;
                    }
                    setPaymentInfo((prev) => [...prev, info]);
                    return info;
                }
            });
        }
    }

    console.log(paymentInfo)

    async function handlePrint() {
        toast.loading("Printing sales invoice...", { style: toastStyle() });
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
                        <th>Price</th>
                        <th>Discount</th>
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
                                <td>{numberFormat(item.discount)}</td>
                                <td>{numberFormat(item.subtotal)}</td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={6}>
                            <div>
                                <hr />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}></td>
                        <td>Service Fee</td>
                        <td>
                            PHP{" "}
                            {salesInvoice.service_fee
                                ? numberFormat(salesInvoice.service_fee)
                                : "0.00"}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}></td>
                        <td>Delivery Fee</td>
                        <td>
                            PHP{" "}
                            {salesInvoice.delivery_fee
                                ? numberFormat(salesInvoice.delivery_fee)
                                : "0.00"}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}></td>
                        <td>GRAND TOTAL</td>
                        <td>
                            PHP{" "}
                            {salesInvoice.grand_total
                                ? numberFormat(salesInvoice.grand_total)
                                : "0.00"}
                        </td>
                    </tr>
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
    //console.log(salesInvoice)
    React.useEffect(() => {
        fetchSalesInvoice();
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
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="print-container px-3 py-2" id="printablediv">
                    <div
                        className={
                            salesInvoice.fs_status === "invoiced"
                                ? "text-end print-header d-flex flex-column"
                                : "text-start print-header d-flex flex-column"
                        }
                    >
                        {salesInvoice.fs_status === "invoiced" ? (
                            <span>
                                FRANCHISE INVOICE NO. {franchisee_sale_id}
                            </span>
                        ) : salesInvoice.fs_status === "quoted" ?
                        (
                            <span>ORDER QUOTATION NO. {franchisee_sale_id}</span>
                        )
                        : (
                            <span>ORDER REQUEST NO. {franchisee_sale_id}</span>
                        )}
                        <span className="text-uppercase">
                            {moment(getTodayDateISO()).format("MMMM DD, yyyy")}
                        </span>
                    </div>
                    <div className="d-flex justify-content-center py-1">
                        <img src={cleanLogo} className="print-logo" />
                    </div>

                    {/* content */}
                    <div className="print-body mt-5 justify-content-start">
                        <Row className="d-flex align-items-start">
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Franchisee:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.franchisee_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Buyer Branch:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.buyer_branch_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Released From:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.seller_branch_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Released By:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.sales_staff_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Invoice Status:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.fs_status}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Ship Via:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.ship_via === "pick_up" ? "Pick Up" : salesInvoice.ship_via}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Delivery Date:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(salesInvoice.delivery_date)}
                                    </Col>
                                </div>
                            </Col>
                            <Col>
                                {salesInvoice.franchisee_sale_payments
                                    ?.length !== 0 ? (
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Franchisee Invoice No.:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {salesInvoice.id}
                                        </Col>
                                    </div>
                                ) : (
                                    ""
                                )}
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Franchisee Order Request No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.id}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Transfer Slip No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {salesInvoice.transfer_slip_no}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Order Request Date:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(salesInvoice.order_request_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Sales Date:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(salesInvoice.sales_date)}
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

                        {/* <Row className="print-grand-total my-3 mr-0 text-end">
                            <Col md={3}>
                                <Row className="print-table-footer-label">
                                    Service Fee
                                </Row>
                                <Row className="print-table-footer-label">
                                    Delivery Fee
                                </Row>
                                <Row className="print-table-footer-label">
                                    GRAND TOTAL
                                </Row>
                            </Col>
                            <Col
                                md={3}
                                className="print-table-footer-data text-left"
                            >
                                <Row className="print-table-footer-label">
                                    PHP{" "}
                                    {salesInvoice.service_fee
                                        ? numberFormat(salesInvoice.service_fee)
                                        : "0.00"}
                                </Row>
                                <Row className="print-table-footer-label">
                                    PHP{" "}
                                    {salesInvoice.delivery_fee
                                        ? numberFormat(
                                              salesInvoice.delivery_fee
                                          )
                                        : "0.00"}
                                </Row>
                                <Row className="print-table-footer-label">
                                    PHP{" "}
                                    {salesInvoice.grand_total
                                        ? numberFormat(salesInvoice.grand_total)
                                        : "0.00"}
                                </Row>
                            </Col>
                        </Row> */}
                         <Row className="mt-4">
                            <span className="print-footer">
                                {salesInvoice.remarks}
                            </span>
                            {/* <span className="print-footer">Please notify us immediately if you are unable to deliver as specified.</span> */}
                        </Row>
                        <div className="print-signatures">
                            {/* <span className="text-center text-uppercase print-label">
                                {salesInvoice.sales_staff_name}
                            </span> */}
                            <div className="d-flex align-items-center justify-content-end flex-column">
                                {/* <img src={signature} className="print-logo" /> */}
                                <span className="text-center text-uppercase print-label fw-bold">
                                    {salesInvoice?.added_by_name}
                                </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center flex-column">
                                <img src={signature} className="print-logo" />
                                <span className="text-center text-uppercase print-label fw-bold">
                                    KRISTOFFER CHAN
                                    {/* {getName()} */}
                                </span>
                            </div>
                        </div>
                        <div className="print-signatories pb-2">
                            <span>Prepared by</span>
                            <span>Approved by</span>
                        </div>
                        <div className="print-signatures">
                            <span className="text-center text-uppercase print-label fw-bold">
                                {salesInvoice.client}
                            </span>
                        </div>
                        <div className="print-signatories pb-4 mb-4">
                            <span>Noted by (Client)</span>
                        </div>
                    </div>
                </div>

                <Container
                    fluid
                    className="PI-payment-info-wrapper mt-5 py-3 px-3 edit-form"
                >
                    <h5 className="PI-payment-info">PAYMENT HISTORY</h5>
                    <div className="sales-tbl justify-content-center">
                        <PaymentTable
                            tableHeaders={[
                                "PYMT DATE",
                                "INV NO.",
                                "TYPE",
                                "PAID AMT",
                                "DEPOSIT DATE",
                                "DEPOSITED TO",
                                "REMARKS",
                            ]}
                            headerSelector={[
                                "payment_date",
                                "invoice_no",
                                "payment_type",
                                "paid_amount",
                                "deposit_date",
                                "to_bank_name",
                                "remarks",
                            ]}
                            tableData={paymentInfo}
                        />
                    </div>
                </Container>

                {/* footer */}
                <div className="d-flex justify-content-end my-4 pb-5 d-flex-responsive" >
                    <button
                        className="button-secondary me-3"
                        onClick={() => navigate("/salesinvoice")}
                    >
                        Close
                    </button>
                    {salesInvoice.payment_status === "open_bill" &&
                    isAdmin() ? (
                        <button
                            className="button-tertiary me-3"
                            onClick={() =>
                                navigate(
                                    "/salesinvoice/edit/" + franchisee_sale_id
                                )
                            }
                        >
                            Edit
                        </button>
                    ) : (
                        ""
                    )}
                    <button className="button-primary" onClick={handlePrint}>
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
}
