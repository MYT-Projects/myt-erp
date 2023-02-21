import React, { useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { filterPurchaseOrderPotato } from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import { filterPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    dateFormat,
    formatDate,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";

import "../../../../Helpers/Utils/Common.css";
import "./../PurchaseInvoices.css";

export default function AddModal(props) {
    let navigate = useNavigate();

    const [poID, setPoID] = useState("");
    const [selectedShop, setSelectedShop] = useState("");

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [shops, setShops] = useState([
        { label: "Mango Magic", value: "mango" },
        { label: "Potato Corner", value: "potato" },
    ]);

    async function fetchAllPurchaseOrder() {
        setPurchaseOrders([]);

        if (selectedShop === "mango") {
            const response = await filterPurchaseOrder("sent");

            if (response.data) {
                var purchases = response.data.data;
                purchases
                    .filter(
                        (PO) =>
                            PO.order_status === "incomplete" ||
                            (PO.status === "sent" &&
                                PO.order_status !== "complete")
                    )
                    .map((purchase) => {
                        var info = {};

                        info.label =
                            purchase.id +
                            " - " +
                            purchase.supplier_trade_name +
                            " (sent on " +
                            dateFormat(purchase.sent_on) +
                            ")";
                        info.value = purchase.id;
                        info.branch_name = purchase.branch_name;

                        setPurchaseOrders((prev) => [...prev, info]);
                    });
            } else {
                TokenExpiry(response);
            }
        } else if (selectedShop === "potato") {
            const response = await filterPurchaseOrderPotato("sent");
            if (response.data) {
                var purchases = response.data.data;
                purchases
                    .filter(
                        (PO) =>
                            PO.order_status === "incomplete" ||
                            (PO.status === "sent" &&
                                PO.order_status !== "complete")
                    )
                    .map((purchase) => {
                        var info = {};

                        info.label =
                            purchase.id +
                            " - " +
                            purchase.supplier_trade_name +
                            " (sent on " +
                            dateFormat(purchase.sent_on) +
                            ")";
                        info.value = purchase.id;
                        info.branch_name = purchase.branch_name;

                        setPurchaseOrders((prev) => [...prev, info]);
                    });
            } else {
                TokenExpiry(response);
            }
        }
    }

    React.useEffect(() => {
        fetchAllPurchaseOrder();
    }, [selectedShop]);

    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Body>
                    <span className="PI-modal-header">
                        ADD PURCHASE INVOICE
                    </span>
                    <div className="PI-modal-body mt-3">
                        <span className="PI-modal-label">SHOP</span>
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select Shop..."
                            options={shops}
                            onChange={(e) => setSelectedShop(e.value)}
                        />
                        {selectedShop !== "" && (
                            <>
                                <span className="PI-modal-label">PO NO.</span>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Purchase Order..."
                                    value={
                                        purchaseOrders.filter(
                                            (info) => info.value === poID
                                        )[0]
                                    }
                                    options={purchaseOrders}
                                    onChange={(e) => setPoID(e.value)}
                                />
                            </>
                        )}
                       
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
                            navigate(
                                `/purchaseinvoices/add/${poID}/${selectedShop}`
                            )
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
