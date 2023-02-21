import moment from "moment";
import { Fragment } from "react";
import React, { useState } from "react";
import { Col, Container, Row, Table, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import cleanLogo from "../../Assets/Images/Login/logo.png";
import Navbar from "../../Components/Navbar/Navbar";
import {
    getSingleFranchisee,
    getSingleSalesInvoice,
} from "../../Helpers/apiCalls/franchiseeApi";
import { getSingleUser } from "../../Helpers/apiCalls/usersApi";
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
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../Helpers/Utils/Common";
import PaymentTable from "../Sales/PaymentTable";
import "./PrintFranchiseInvoice.css";
import Moment from "moment";

export default function PrintFranchiseInvoice(edit) {
    const { franchisee_id } = useParams();
    let navigate = useNavigate();
    const today = getTodayDateISO();

    const [inactive, setInactive] = useState(true);
    const [franchiseeInvoice, setFranchiseeInvoice] = useState([]);
    const [preparedBy, setPreparedBy] = useState("");
    const [paymentInfo, setPaymentInfo] = useState([]);
    const [latestInvoiceNo, setLatestInvoiceNo] = useState("");

    async function fetchFranchiseInvoice() {
        setFranchiseeInvoice({});

        const response = await getSingleFranchisee(franchisee_id);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var details = response.data.data[0];
            setFranchiseeInvoice(details);
            getPreparedBy(details.added_by);

            details.franchisee_payments.map((data) => {
                setLatestInvoiceNo(data.id);
            });
            var payment = details.franchisee_payments.map((data) => {
                var info = data;
                info.amount = numberFormat(data.amount)
                if (data.payment_method === "check") {
                    info.payment_method =
                        data.payment_method + "-" + data.cheque_number;
                }
                info.payment_date = Moment(data.payment_date).format("MM-DD-YYYY"); 
                return info;
            });
            setPaymentInfo(payment);
        }
    }

    async function getPreparedBy(id) {
        const response = await getSingleUser(id);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var details = response.data[0];
            setPreparedBy(
                details.first_name +
                    " " +
                    details.middle_name +
                    " " +
                    details.last_name
            );
        }
    }

    async function handlePrint() {
        toast.loading("Printing sales invoice...", { style: toastStyle() });
        setTimeout(() => {
            toast.dismiss();
            Print();
        }, 1000);
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
        fetchFranchiseInvoice();
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
                    <div className="print-grand-total my-3 text-end print-header d-flex flex-column">
                        <span>FRANCHISE INVOICE NO. {latestInvoiceNo}</span>
                        <span className="text-uppercase">
                            {moment(getTodayDateISO()).format("MM-DD-YYYY")}
                        </span>
                    </div>
                    <div className="d-flex justify-content-center py-1">
                        <img src={cleanLogo} className="print-logo" />
                    </div>

                    {/* content */}
                    <div className="print-body mt-5">
                        <div className="">
                            {/* FRANCHISEE SALES INVOICE DETAILS */}
                            <Fragment>
                                <Row className="pt-3 mb-2">
                                    <Col xs={5}>
                                        <span className="edit-label">
                                            Franchised Branch
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="edit-label">
                                            Franchise Date
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="edit-label">
                                            Opening Date
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={5}>
                                        <Form.Control
                                            type="text"
                                            name="branch_name"
                                            value={
                                                franchiseeInvoice.branch_name
                                            }
                                            className="nc-modal-custom-text"
                                            disabled
                                        />
                                        <Col></Col>
                                    </Col>
                                    <Col xs={3}>
                                        <Form.Control
                                            type="date"
                                            name="franchised_on"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.franchised_on
                                            }
                                            defaultValue={today}
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="date"
                                            name="opening_start"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.opening_start
                                            }
                                            disabled
                                        />
                                    </Col>
                                </Row>
                                <Row className="mt-4 mb-2">
                                    <Col>
                                        <span className="edit-label">
                                            Franchisee Name
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="edit-label">
                                            Branch Address
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="edit-label">
                                            Franchisee Contact Number
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="edit-label">
                                            Email
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Control
                                            className="nc-modal-custom-text"
                                            name="name"
                                            trigger=""
                                            value={franchiseeInvoice.name}
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="address"
                                            className="nc-modal-custom-text"
                                            value={franchiseeInvoice.address}
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="franchisee_contact_no"
                                            value={
                                                franchiseeInvoice.franchisee_contact_no
                                            }
                                            className="nc-modal-custom-text"
                                            disabled
                                        />
                                    </Col>
                                    <Col xs={3}>
                                        <Form.Control
                                            type="text"
                                            name="email"
                                            className="nc-modal-custom-text"
                                            value={franchiseeInvoice.email}
                                            disabled
                                        />
                                    </Col>
                                </Row>
                                <Row className="mt-4 mb-2">
                                    <Col>
                                        <span className="edit-label">
                                            Contact Person
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="edit-label">
                                            Contact Number
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                     <Col>
                                        <span className="edit-label">
                                            Credit Limit
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                </Row>
                                <Row className="mt-4 mb-2">
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="contact_person"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.contact_person
                                            }
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="contact_number"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.contact_number
                                            }
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="beginning_credit_limit"
                                            className="nc-modal-custom-text"
                                            value={numberFormat(franchiseeInvoice.beginning_credit_limit)}
                                            disabled
                                        />
                                    </Col>
                                </Row>
                                <Row className="mt-4 mb-2">
                                    <Col>
                                        <span className="edit-label">
                                            Royalty Fee (%)
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="edit-label">
                                            Marketing Fee (%)
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="edit-label">
                                            Contract Start
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="edit-label">
                                            Contract End
                                            <label className="badge-required">{` *`}</label>
                                        </span>
                                    </Col>
                                </Row>
                                <Row className="mt-4 mb-2">
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="royalty_fee"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.royalty_fee
                                            }
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="marketing_fee"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.marketing_fee
                                            }
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="date"
                                            name="contract_start"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.contract_start
                                            }
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="date"
                                            name="contract_end"
                                            className="nc-modal-custom-text"
                                            value={
                                                franchiseeInvoice.contract_end
                                            }
                                            disabled
                                        />
                                    </Col>
                                </Row>
                            </Fragment>

                            {/* GRAND TOTAL */}
                            <Row className="align-right pt-3 mt-5">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray">
                                        Package Type
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end"></Col>
                                <Col xs={3}>
                                    <Form.Control
                                        type="text"
                                        name="package_type"
                                        value={franchiseeInvoice.package_type}
                                        className="align-middle nc-modal-custom-text"
                                        disabled={edit}
                                    />
                                </Col>
                            </Row>
                            <Row className="align-right pt-3">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray">
                                        Franchise Package
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end">
                                    <span className="edit-label align-middle">
                                        PHP
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <Form.Control
                                        type="text"
                                        name="franchisee_package"
                                        value={numberFormat(franchiseeInvoice.franchisee_package)}
                                        className="align-middle nc-modal-custom-text"
                                        disabled={edit}
                                    />
                                </Col>
                            </Row>
                            <Row className="align-right pt-3">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray">
                                        Franchise Fee
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end">
                                    <span className="edit-label align-middle">
                                        PHP
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <Form.Control
                                        type="text"
                                        name="franchisee_fee"
                                        value={numberFormat(franchiseeInvoice.franchisee_fee)}
                                        className="align-middle nc-modal-custom-text"
                                        disabled={edit}
                                    />
                                </Col>
                            </Row>
                            <Row className="align-right pt-3">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray">
                                        Security Deposit
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end">
                                    <span className="edit-label align-middle">
                                        PHP
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <Form.Control
                                        type="text"
                                        name="security_deposit"
                                        value={
                                            numberFormat(franchiseeInvoice.security_deposit)
                                        }
                                        className="align-middle nc-modal-custom-text"
                                        disabled={edit}
                                    />
                                </Col>
                            </Row>
                            <Row className="align-right pt-3">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray">
                                        Taxes
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end">
                                    <span className="edit-label align-middle">
                                        PHP
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <Form.Control
                                        type="text"
                                        name="taxes"
                                        value={numberFormat(franchiseeInvoice.taxes)}
                                        className="align-middle nc-modal-custom-text"
                                        disabled={edit}
                                    />
                                </Col>
                            </Row>
                            <Row className="align-right pt-3">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray">
                                        Other Fees
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end">
                                    <span className="edit-label align-middle">
                                        PHP
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <Form.Control
                                        type="text"
                                        name="other_fee"
                                        value={numberFormat(franchiseeInvoice.other_fee)}
                                        className="align-middle nc-modal-custom-text"
                                        disabled={edit}
                                    />
                                </Col>
                            </Row>
                            <Row className="align-right py-5">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray grand-total-text">
                                        Grand Total
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end">
                                    <span className="edit-label align-middle grand-total-text">
                                        PHP
                                    </span>
                                </Col>
                                <Col xs={3} className="text-end">
                                    <span className="edit-label align-middle grand-total-text">
                                        {numberFormat(franchiseeInvoice.grand_total)}
                                    </span>
                                </Col>
                            </Row>
                            <Row className="align-right pt-3">
                                <Col xs={2} className="text-end">
                                    <span className="edit-label color-gray">
                                        Paid Amount
                                    </span>
                                </Col>
                                <Col xs={1} className="text-end">
                                    <span className="edit-label align-middle">
                                        PHP
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <Form.Control
                                        type="text"
                                        name="amount"
                                        value={numberFormat(franchiseeInvoice.paid_amount)}
                                        className="align-middle nc-modal-custom-text"
                                        disabled={edit}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="print-signatures">
                            <span className="text-center text-uppercase print-label">
                                {getName()}
                            </span>
                            <span className="text-center text-uppercase print-label fw-bold">
                                {preparedBy}
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
                                "payment_method",
                                "amount",
                                "deposit_date",
                                "to_bank_name",
                                "remarks",
                            ]}
                            tableData={paymentInfo}
                        />
                    </div>
                </Container>

                {/* footer */}
                <div className="d-flex justify-content-end my-4 pb-5 d-flex-responsive">
                    <button
                        className="button-secondary me-3"
                        onClick={() => navigate("/franchise")}
                    >
                        Close
                    </button>
                    <button
                        className="button-tertiary me-3"
                        onClick={() =>
                            navigate("/franchise/edit/" + franchisee_id)
                        }
                    >
                        Edit
                    </button>
                    <button className="button-primary" onClick={handlePrint}>
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
}
