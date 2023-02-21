import React, { useState } from "react";
import { Col, Form, Modal, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { emailPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getSupplier } from "../../../../Helpers/apiCalls/suppliersApi";
import {
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";

export default function EmailPurchaseOrder(props) {
    let navigate = useNavigate();
    let id = props.po_id.split("_");

    const [PO, setPO] = useState({});

    async function handleEmailPO() {
        const response = await emailPurchaseOrder(id);

        if (response.response) {
            toast.success("Email Sent Successfully", { style: toastStyle() });
            setTimeout(
                () =>
                    navigate("print/" + props.po_id, {
                        state: { type: props.type },
                    }),
                1000
            );
        } else {
            TokenExpiry(response);
            toast.error("Error Sending Email", { style: toastStyle() });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Body>
                    <span className="PI-modal-header d-flex justify-content-between my-4">
                        EMAIL PURCHASE ORDER
                        <div className="review-po">
                            <span className="pe-5">PURCHASE ORDER NO.</span>
                            <span>{props.po_id}</span>
                        </div>
                    </span>
                    <div className="PI-modal-body my-3 p-3">
                        <Row className="mb-3">
                            <Col xs={4} className="PI-modal-label">
                                Supplier Name :
                            </Col>
                            <Col xs={8} className="PI-modal-label color-gray">
                                {PO.trade_name}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4} className="PI-modal-label">
                                Supplier Email :
                            </Col>
                            <Col xs={8} className="PI-modal-label color-gray">
                                {PO.email}
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="PI-modal-buttons mb-2">
                    <button
                        type="button"
                        onClick={props.hide}
                        className="button-secondary"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handleEmailPO}
                        className="button-primary"
                    >
                        Continue
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
