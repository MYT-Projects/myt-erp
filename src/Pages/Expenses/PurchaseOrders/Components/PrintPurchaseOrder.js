import React, { useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
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

export default function PrintPurchaseOrder() {
    const { id } = useParams();
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [printPO, setPrintPO] = useState([]);
    const [items, setItems] = useState([]);

    async function fetchPO() {
        setPrintPO({});
        setItems([]);

        const response = await getPurchaseOrder(id);

        if (response.error) {
            TokenExpiry(response);
        } else {
            setPrintPO(response.response.data[0][0]);
            var itemDeets = response.response.data[0][0].purchase_items;

            itemDeets.map(async (item) => {
                const response = await getItem(item.ingredient_id);
                var info = {};

                info.detail = response.data[0].name;
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

    /* print modal handler */
    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);

    async function handlePrintPO() {
        const response = await changeStatusPurchaseOrder(id, "print");

        if (response.response) {
            toast.loading("Printing Purchase Order", { style: toastStyle() });
            handleClosePrintModal();
            setTimeout(() => {
                toast.dismiss();
                Print();
                navigate("/purchaseorders");
            }, 1000);
        } else {
            toast.error("Error Printing Purchase Order", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        }
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
                                <td>{item.detail}</td>
                                <td>{item.qty}</td>
                                <td className="text-lowercase">{item.unit}</td>
                                <td>{numberFormat(item.price)}</td>
                                <td>{numberFormat(item.amount)}</td>
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
                <div className="print-container px-3 py-2" id="printablediv">
                    <div className="text-end print-header">
                        <span>PURCHASE ORDER NO. {printPO.id}</span>
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
                        <div className="d-flex my-2">
                            <Col xs={3} className="print-label">
                                Supplier:
                            </Col>
                            <Col xs={7} className="print-data">
                                {printPO.supplier_trade_name}
                            </Col>
                        </div>
                        <div className="d-flex my-2">
                            <Col xs={3} className="print-label">
                                Forwarder:
                            </Col>
                            <Col xs={7} className="print-data">
                                {printPO.forwarder_name}
                            </Col>
                        </div>
                        <div className="d-flex my-2">
                            <Col xs={3} className="print-label">
                                Purchase Date:
                            </Col>
                            <Col xs={7} className="print-data">
                                {dateFormat(printPO.purchase_date)}
                            </Col>
                        </div>
                        <div className="d-flex my-2">
                            <Col xs={3} className="print-label">
                                Delivery Date:
                            </Col>
                            <Col xs={7} className="print-data">
                                {dateFormat(printPO.delivery_date)}
                            </Col>
                        </div>
                        <div className="d-flex my-2">
                            <Col xs={3} className="print-label">
                                Delivery Address:
                            </Col>
                            <Col xs={7} className="print-data">
                                {printPO.delivery_address}
                            </Col>
                        </div>
                        <div className="d-flex mt-5 mb-2 justify-content-evenly">
                            {/* table */}
                            <div className="print-table mt-3 mx-2">
                                {renderTable()}
                            </div>
                        </div>
                        <Row className="print-grand-total text-end">
                            <Col xs={3} className="print-table-footer-label">
                                GRAND TOTAL
                            </Col>
                            <Col xs={2} className="print-table-footer-data">
                                {printPO.grand_total}
                            </Col>
                        </Row>
                        {/* REMARKS HERE */}
                        <Row className="mt-4">
                            <span className="print-footer">
                                Please send two copies of your invoice.
                            </span>
                            <span className="print-footer">
                                Please notify us immediately if you are unable
                                to deliver as specified.
                            </span>
                        </Row>
                        <div className="print-signatures">
                            <span className="text-center text-uppercase nc-modal-custom-text">
                                {" "}
                            </span>
                            <div className="d-flex align-items-center justify-content-center flex-column">
                                <img src={signature} className="print-logo" />
                                <span className="text-center text-uppercase nc-modal-custom-text">
                                    {printPO.approved_by_name}
                                </span>
                            </div>
                        </div>
                        <div className="print-signatories pb-4 mb-4">
                            <span>Received by</span>
                            <span>Approved by</span>
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="d-flex justify-content-end my-4">
                    <button
                        className="button-secondary me-3"
                        onClick={() => navigate("/purchaseorders")}
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
            <POModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                handler={handlePrintPO}
            />
        </div>
    );
}
