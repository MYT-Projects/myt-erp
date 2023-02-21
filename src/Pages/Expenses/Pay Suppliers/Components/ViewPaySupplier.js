import React, { useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../../../Components/Navbar/Navbar";
import "../../PurchaseOrders/PurchaseOrders.css";
import {
    capitalizeFirstLetter,
    formatDate,
    numberFormat,
    toastStyle,
    refreshPage,
    getTodayDateISO,
    formatDateSlash,
} from "../../../../Helpers/Utils/Common";
import {
    getSingleBankSe,
    getSingleCashSe,
    getSingleCheckSe,
} from "../../../../Helpers/apiCalls/Expenses/sePaymentsListApi";
import cleanLogo from "../../../../Assets/Images/Login/logo.png";
import PIModal from "./PIModal";
import Moment from "moment";

export default function ViewPaySupplier() {
    const { id, type } = useParams();
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [transaction, setTransaction] = useState([]);
    const [items, setItems] = useState([]);

    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);
    const [printPI, setPrintPI] = useState([]);

    async function handlePrintPI() {
        toast.loading("Printing Transaction", { style: toastStyle() });
        handleClosePrintModal();
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

    async function fetchSingleSuppliesExpense(id) {
        setPrintPI({});

        if (type === "cash") {
            const cash = await getSingleCashSe(id);
            if (cash.data.status === "success") {
                var data = cash.data.data[0];
                setPrintPI(data);
                setTransaction({
                    supplier_name: data.supplier_name || "N/A",
                    payee: data.payee || "N/A",
                    payment_date: formatDate(data.payment_date),
                    acknowledged_by: data.acknowledged_by_name || "N/A",
                    particulars: data.particulars || "N/A",
                    amount: data.amount,
                });
                var cashEntries = data.cash_entries.map((entry) => {
                    var info = entry;
                    info.added_on = formatDateSlash(entry.added_on);
                    return info;
                });
                setItems(cashEntries);
            }
        } else if (type === "check") {
            const check = await getSingleCheckSe(id);
            if (check.data.status === "success") {
                var data = check.data.data[0];
                setPrintPI(data);
                setTransaction({
                    bank_name: data.bank_name || "N/A",
                    check_date: formatDate(data.check_date),
                    issued_date: formatDate(data.issued_date),
                    check_no: data.check_no,

                    supplier_name: data.supplier_name || "N/A",
                    payee: data.payee || "N/A",
                    acknowledged_by: data.acknowledged_by_name || "N/A",

                    particulars: data.particulars || "N/A",
                    amount: data.amount,
                });
                var checkEntries = data.check_entries.map((entry) => {
                    var info = entry;
                    info.added_on = formatDateSlash(entry.added_on);
                    return info;
                });
                setItems(checkEntries);
            }
        } else if (type === "bank") {
            const bank = await getSingleBankSe(id);
            if (bank.data.status === "success") {
                var data = bank.data.data[0];
                setPrintPI(data);
                setTransaction({
                    payment_date: formatDate(data.payment_date),
                    transaction_fee: data.transaction_fee,
                    reference_no: data.reference_no,
                    amount: data.amount,
                    payee: data.payee,
                    particulars: data.particulars,
                    acknowledged_by: data.acknowledged_by_name,

                    bank_from_name: data.bank_from_name,
                    from_account_no: data.from_account_no,
                    from_account_name: data.from_account_name,

                    bank_to_name: data.bank_to,
                    to_account_no: data.to_account_no,
                    to_account_name: data.to_account_name,

                    supplier_name: data.supplier_name,
                });
                var bankEntries = data.bank_entries.map((entry) => {
                    var info = entry;
                    info.added_on = formatDateSlash(entry.added_on);
                    return info;
                });
                setItems(bankEntries);
            }
        }
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Entry</th>
                        <th>Invoice Date</th>
                        <th>Invoice Details</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr key={item.id}>
                                <td className="sentence">
                                    {"Invoice No. " +
                                        item.se_id +
                                        " - " +
                                        item.amount}
                                </td>
                                <td>{item.added_on}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="button-primary view-btn me-3"
                                        onClick={() =>
                                            handleViewPayment(
                                                item.se_id,
                                                id,
                                                type
                                            )
                                        }
                                    >
                                        View
                                    </button>
                                </td>
                                <td>PHP {numberFormat(item.amount)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function renderPrintTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Entry</th>
                        <th>Invoice Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr key={item.id}>
                                <td className="sentence">
                                    {"Invoice No. " +
                                        item.se_id +
                                        " - " +
                                        item.amount}
                                </td>
                                <td>{item.added_on}</td>
                                <td>PHP {numberFormat(item.amount)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function handleViewPayment(id, bank, type) {
        window.open("/se/purchaseinvoices/print/" + id, "_blank");
    }

    React.useEffect(() => {
        fetchSingleSuppliesExpense(id);
    }, []);

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
                <div className="d-flex justify-content-between d-flex-responsive">
                    <h1 className="page-title mb-4">VIEW TRANSACTION</h1>
                    <div className="review-po">
                        <span className="pe-5">DOCUMENT NO.</span>
                        <span>{id}</span>
                    </div>
                </div>

                <div className="review-form mb-3">
                    {type === "cash" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Supplier Name
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Payee
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Payment Date
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Payment Mode
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.supplier_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.payee}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.payment_date}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            CASH
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Acknowledged Bysdfsd
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Particulars
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.acknowledged_by}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.particulars}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                        </Container>
                    )}
                    {type === "check" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Bank
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Check Date
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Issue Date
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Check No.
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.bank_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.check_date}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.issued_date}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.check_no}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Supplier Name
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Payee
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Acknowledged By
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.supplier_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.payee}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.acknowledged_by}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Particulars
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.particulars}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                        </Container>
                    )}
                    {type === "bank" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            From Bank
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Payment Date
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Reference No.
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Payment Mode
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.bank_from_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.payment_date}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.reference_no}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            BANK TO BANK
                                        </span>
                                    </Col>
                                </Row>
                            </Row>

                            <Row className="review-container py-3">
                                <Row>
                                    <Col xs={3}>
                                        <span className="review-label nc-modal-custom-row">
                                            To Bank
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="review-label nc-modal-custom-row">
                                            Supplier Name
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="review-label nc-modal-custom-row">
                                            Payee
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={3}>
                                        <span className="review-data">
                                            {transaction.bank_to_name}
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="review-data">
                                            {transaction.supplier_name}
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="review-data">
                                            {transaction.payee}
                                        </span>
                                    </Col>
                                </Row>
                                <Row className="mt-5">
                                    <Col xs={3}>
                                        <span className="review-label nc-modal-custom-row">
                                            Account Number
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="review-label nc-modal-custom-row">
                                            Account Name
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={3}>
                                        <span className="review-data">
                                            {transaction.to_account_no}
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <span className="review-data">
                                            {transaction.to_account_name}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Acknowledged By
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Particulars
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.acknowledged_by}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {transaction.particulars}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                        </Container>
                    )}

                    <div className="mt-4 d-flex flex-column">
                        <span className="review-data mb-2 nc-modal-custom-row">
                            APPLIED TO THE FOLLOWING INVOICES
                        </span>
                        <div className="review-purchased-items">
                            {renderTable()}
                        </div>
                    </div>
                    <div className="print-table-footer text-end">
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
                            PHP {numberFormat(transaction.amount)}
                        </Col>
                    </div>

                    <div className="d-flex justify-content-end pt-5">
                        <button
                            type="button"
                            className="button-tertiary me-3"
                            onClick={() =>
                                navigate(
                                    "/se/paysuppliers/edit/" + id + "/" + type
                                )
                            }
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            className="button-primary me-3"
                            onClick={handleShowPrintModal}
                        >
                            Print
                        </button>
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate("/se/paysuppliers")}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
            <PIModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                page="transaction"
                handler={handlePrintPI}
            />

            <div
                className="print-container px-3 py-2 display-none"
                id="printablediv"
            >
                <div className="text-end print-header d-flex flex-column">
                    <span>DOCUMENT NO. {id}</span>
                    <span className="text-uppercase">
                        {Moment(getTodayDateISO()).format("MMMM DD, yyyy")}
                    </span>
                </div>
                <div className="d-flex justify-content-center py-1">
                    <img src={cleanLogo} className="print-logo" />
                </div>
                <div className="d-flex justify-content-center py-1 mt-1">
                    <h5 className="print-shop-header">
                        TRIPLE K EXPRESSFOODS / 3K EXPRESSFOODS / CHK BUSINESS
                        VENTURES CORP
                    </h5>
                </div>
                <div className="print-body mt-5">
                    {type === "cash" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Supplier Name:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.supplier_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payee:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.payee}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payment Date:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.payment_date}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payment Mode:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            Cash
                                        </Col>
                                    </div>
                                </Col>
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Acknowledged By:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.acknowledged_by}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Particulars:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.particulars}
                                        </Col>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    )}
                    {type === "check" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Bank:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.bank_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Check Date:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.check_date}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Issue Date:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.issued_date}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Check No.:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.check_no}
                                        </Col>
                                    </div>
                                </Col>
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Supplier Name:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.supplier_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payee:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.payee}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Acknowledged By:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.acknowledged_by}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Particulars:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.particulars}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payment Mode:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            Check
                                        </Col>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    )}
                    {type === "bank" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            From Bank:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.bank_from_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payment Date:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.payment_date}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Reference No.:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.reference_no}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payment Mode:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            Bank
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Account No.:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.from_account_no}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Account Name:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.from_account_name}
                                        </Col>
                                    </div>
                                </Col>
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            To Bank:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.bank_to_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Supplier Name:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.supplier_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Payee:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.payee}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Account No.:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.from_account_no}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Account Name:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.from_account_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Acknowledged By:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.acknowledged_by}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Particulars:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {transaction.particulars}
                                        </Col>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    )}

                    <div className="mt-4 d-flex flex-column">
                        <span className="review-data mb-2 nc-modal-custom-row">
                            APPLIED TO THE FOLLOWING INVOICES
                        </span>
                        <div className="review-purchased-items">
                            {renderPrintTable()}
                        </div>
                    </div>
                    <div className="pt-3">
                        <Row>
                            <Col></Col>
                            <Col>
                                <Row className="mb-1">
                                    <Col className="print-table-footer-label text-start">
                                        TOTAL AMOUNT
                                    </Col>
                                    <Col className="print-table-footer-data text-start">
                                        PHP {numberFormat(transaction.amount)}
                                    </Col>
                                </Row>
                                {type === "bank" && (
                                    <>
                                        <Row className="mb-1">
                                            <Col className="print-table-footer-label text-start">
                                                TRANSACTION FEE
                                            </Col>
                                            <Col className="print-table-footer-data text-start">
                                                PHP{" "}
                                                {numberFormat(
                                                    transaction.transaction_fee
                                                )}
                                            </Col>
                                        </Row>
                                        <Row className="mb-1">
                                            <Col className="print-table-footer-label text-start">
                                                GRAND TOTAL
                                            </Col>
                                            <Col className="print-table-footer-data text-start">
                                                PHP{" "}
                                                {numberFormat(
                                                    transaction.grand_total
                                                )}
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </Col>
                        </Row>
                    </div>
                    <div className="print-signatures">
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
        </div>
    );
}
