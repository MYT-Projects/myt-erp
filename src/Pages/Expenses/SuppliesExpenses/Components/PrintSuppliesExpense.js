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
    getName,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import cleanLogo from "../../../../Assets/Images/Login/logo.png";
import signature from "../../../../Assets/Images/signature.png";
import Navbar from "../../../../Components/Navbar/Navbar";
import SEModal from "./SEModal";
import { emailPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getSupplier } from "../../../../Helpers/apiCalls/suppliersApi";
import {
    approveSuppliesExpense,
    getSingleSuppliesExpense,
    emailSE,
} from "../../../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import { getVendor } from "../../../../Helpers/apiCalls/Manage/Vendors";

export default function PrintSuppliesExpense() {
    const { id } = useParams();
    let navigate = useNavigate();
    const { state } = useLocation();
    const [inactive, setInactive] = useState(true);
    const [printSE, setPrintSE] = useState([]);
    const [items, setItems] = useState([]);
    const [note, setNote] = useState("");
    const [hasEmail, setHasEmail] = useState(false);

    const [showSendModal, setShowSendModal] = useState(false);
    const handleShowSendModal = () => setShowSendModal(true);
    const handleCloseSendModal = () => setShowSendModal(false);

    async function fetchSE() {
        setPrintSE({});
        setItems([]);

        const response = await getSingleSuppliesExpense(id);
        if (response.error) {
            TokenExpiry(response);
        } else {
            var SE = response.data.data[0];
            SE.hasSupplier = SE.supplier_trade_name ? true : false;
            setPrintSE(SE);
            setItems(SE.se_items);
        }
    }

    /* print modal handler */
    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);

    async function handleSendToSupplier() {
        if (printSE.supplier_email || printSE.vendor_email) {
            const response = await emailSE(id);

            if (response.response.response) {
                toast.success(response.response.response, {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    toast.dismiss();
                    navigate("/suppliesexpenses");
                }, 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error Sending Supplies Expense PO", {
                    style: toastStyle(),
                });
            }
        } else {
            toast.error("Error sending email. Supplier/vendor has no email!", {
                style: toastStyle(),
            });
        }
    }

    async function handleEmailSE() {
        if (hasEmail) {
            const response = await emailSE(id);
            if (response.response) {
                toast.success("Email Sent Successfully", {
                    style: toastStyle(),
                });
            } else {
                toast.error("Error Sending Email", { style: toastStyle() });
            }
        } else {
            toast.error("Error Sending Email. Supplier has no Email", {
                style: toastStyle(),
            });
        }
        setTimeout(() => {
            toast.dismiss();
            navigate("/suppliesexpenses");
            refreshPage();
        }, 1000);
    }

    async function handleSendSE() {
        if (hasEmail) {
            const response = await approveSuppliesExpense(id, "sent");
            if (response.data.response) {
                toast.success("Supplies Expense Sent Successfully", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    toast.dismiss();
                }, 1000);
            } else {
                toast.error("Error Sending Supplies Expense", {
                    style: toastStyle(),
                });
            }
        } else {
            toast.error(
                "Error Sending Supplies Expense. Supplier has no Email",
                { style: toastStyle() }
            );
        }
        setTimeout(() => {
            navigate("/suppliesexpenses");
            refreshPage();
        }, 1000);
    }

    async function handlePrintSE() {
        const response = await approveSuppliesExpense(id, "printed");

        if (response.data.response) {
            const response1 = await approveSuppliesExpense(id, "sent");
            if (response1.data.response) {
                toast.loading("Printing Supplies Expense", {
                    style: toastStyle(),
                });
                handleClosePrintModal();
                setTimeout(() => {
                    toast.dismiss();
                    Print();
                }, 1000);
            }
        } else {
            toast.error("Error Printing Supplies Expense", {
                style: toastStyle(),
            });
            setTimeout(() => navigate("/suppliesexpenses"), 1000);
        }

        setTimeout(() => {
            toast.dismiss();
            navigate("/suppliesexpenses");
            refreshPage();
        }, 1000);
    }

    async function fetchSupplierData() {
        const response = await getVendor(state.suppID);
        setHasEmail(
            response.response.data[0].email !== null &&
                response.response.data[0].email !== "null" &&
                response.response.data[0].email !== ""
        );
    }

    useEffect(() => {
        fetchSupplierData();
    }, []);

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
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{parseInt(item.qty)}</td>
                                <td>{item.unit}</td>
                                <td>PHP {numberFormat(item.price)}</td>
                                <td>PHP {numberFormat(item.total)}</td>
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
            navigate("/suppliesexpenses");
            refreshPage();
        }, 1000);
    }

    React.useEffect(() => {
        fetchSE();
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
                <div className="print-container px-3 py-2" id="printablediv">
                    <div className="text-end print-header">
                        <span>SUPPLIES EXPENSE NO. {printSE.id}</span>
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
                            <Col xs={7} className="justify-content-start">
                                <div className="d-flex my-2 align-items-center ms-5">
                                    <Col xs={4} className="print-label">
                                        Supplier:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printSE.supplier_trade_name ||
                                            printSE.vendor_trade_name ||
                                            "N/A"}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center ms-5">
                                    <Col xs={4} className="print-label">
                                        Forwarder:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printSE.forwarder_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center ms-5">
                                    <Col xs={4} className="print-label">
                                        Branch:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printSE.branch_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center ms-5">
                                    <Col xs={4} className="print-label">
                                        Delivery Address:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printSE.delivery_address}
                                    </Col>
                                </div>
                            </Col>

                            <Col xs={5} className="justify-content-start">
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Purchase Date:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {dateFormat(
                                            printSE.supplies_expense_date
                                        )}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Requisitioner:
                                    </Col>
                                    <Col xs={6} className="print-data">
                                        {printSE.requisitioner_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        {" "}
                                    </Col>
                                    <Col xs={6} className="print-data"></Col>
                                </div>
                            </Col>
                        </Row>
                        <div className="d-flex mt-5 mb-2 justify-content-evenly">
                            {/* table */}
                            <div className="print-table mt-3 mx-2">
                                {renderTable()}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-4 mx-5">
                            <div className="print-table-footer-label grand-label mx-4">
                                GRAND TOTAL
                                <span className="mx-2 print-table-footer-data grand-label">
                                    PHP {numberFormat(printSE.grand_total)}
                                </span>
                            </div>
                        </div>
                        <Row className="mt-4">
                            <span className="print-footer">
                                {printSE.remarks}
                            </span>
                        </Row>
                        <Row className="mt-4 additional-note-input">
                            <Col xs={7}>
                                <div className="d-flex my-2 align-items-center">
                                    <Col
                                        xs={4}
                                        className="print-label"
                                        style={{
                                            color: "#169422",
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
                            <div className="d-flex align-items-end justify-content-end flex-column">
                                <span className="text-center text-uppercase nc-modal-custom-text">
                                    {getName()}
                                </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center flex-column">
                                <img src={signature} className="print-logo" />
                                <span className="text-center text-uppercase nc-modal-custom-text">
                                    {printSE.approved_by_name}
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
                            onClick={() => navigate("/suppliesexpenses")}
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
            <SEModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                handler={handlePrintSE}
            />

            <SEModal
                show={showSendModal}
                hide={handleCloseSendModal}
                type="send"
                handler={handleSendToSupplier}
            />
        </div>
    );
}
