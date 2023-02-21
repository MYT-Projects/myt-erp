import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import "./SalesInvoice.css";
import toast from "react-hot-toast";
import {
    getTodayDate,
    refreshPage,
    toastStyle,
} from "../../Helpers/Utils/Common";
import {
    Col,
    Form,
} from "react-bootstrap";
import { closeOverpaidFranchiseeSale } from "../../Helpers/apiCalls/franchiseeApi";

export default function CloseFSModal(props) {
    
const [remarks, setRemarks] = useState("");
let navigate = useNavigate();
    
async function CloseBill() {
    const response = await closeOverpaidFranchiseeSale(props.selectedRow.id, remarks);
        if (response.response) {
            toast.success("Successfully closed sales invoice!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else if (response.error) {
            toast.error(
                "Something went wrong",
                { style: toastStyle() }
            );
            setTimeout(() => refreshPage(), 1000);
        } 
}

    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Header className="return-header">
                    <span className="text-warning"> PLEASE CONFIRM </span>
                </Modal.Header>
                <Modal.Body className="return-body text-center">
                    <span>Are you sure you want to {props.type} overpaid bill?</span>
                    {props.type === "close" && (
                        <Col className="text-left pt-3">
                        <span>REMARKS</span>
                        <Form.Control
                            as="textarea"
                            name="remarks"
                            defaultValue={props.selectedRow?.remarks}
                            className="nc-modal-custom-row-grey"
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </Col>
                    )}
                </Modal.Body>
                <Modal.Footer className="return-footer">
                    <button type="button" className={props.type === "delete" || props.type === "reject" ? "button-warning" : "button-secondary"} onClick={props.hide}>Cancel</button>
                    <button type="button" className={props.type === "delete" || props.type === "reject" ? "button-warning-fill" : "button-primary"} onClick={CloseBill}>Proceed</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}