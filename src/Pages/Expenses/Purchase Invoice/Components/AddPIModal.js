import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { filterPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllSEPO } from "../../../../Helpers/apiCalls/Expenses/sePurchaseApi";
import { dateFormat } from "../../../../Helpers/Utils/Common";

import "../../../../Helpers/Utils/Common.css";
import "./../PurchaseInvoices.css";

export default function AddModal(props) {
    let navigate = useNavigate();
    const [poID, setPoID] = useState("");

    const [purchaseOrders, setPurchaseOrders] = useState([]);

    async function fetchAllPurchaseOrder() {
        setPurchaseOrders([]);

        const response = await getAllSEPO();

        var purchases = response.data.data;
        purchases
            .filter(
                (PO) =>
                    PO.order_status === "incomplete" ||
                    (PO.status === "sent" && PO.order_status !== "complete")
            )
            .map((purchase) => {
                var info = {};

                info.label =
                    purchase.id +
                    " - " +
                    (purchase.supplier_trade_name
                        ? purchase.supplier_trade_name
                        : purchase.vendor_trade_name) +
                    (purchase.sent_on ? " (sent on " : "") +
                    (purchase.sent_on
                        ? dateFormat(purchase.sent_on) + ")"
                        : "");
                info.value = purchase.id;
                info.branch_name = purchase.branch_name;

                setPurchaseOrders((prev) => [...prev, info]);
            });
    }

    React.useEffect(() => {
        fetchAllPurchaseOrder();
    }, []);

    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Body>
                    <span className="PI-modal-header">
                        ADD PURCHASE INVOICE
                    </span>
                    <div className="PI-modal-body mt-3">
                        <span className="PI-modal-label">
                            Supplies Expense PO NO.
                        </span>
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier..."
                            value={
                                purchaseOrders.filter(
                                    (info) => info.value === poID
                                )[0]
                            }
                            options={purchaseOrders}
                            onChange={(e) => setPoID(e.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer className="PI-modal-buttons">
                    <button
                        type="button"
                        onClick={props.hide}
                        className="button-secondary"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/se/purchaseinvoices/add/" + poID)
                        }
                        className="button-primary"
                    >
                        Continue
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
