import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import "../Inventory.css";
import toast from "react-hot-toast";
import {
    getTodayDate,
    refreshPage,
    toastStyle,
} from "../../../Helpers/Utils/Common";
import {
    Col,
    Form,
} from "react-bootstrap";
import { 
    changeRequestStatus, 
    changeRequestStatusPotato,
} from "../../../Helpers/apiCalls/Inventory/RequestsApi";

export default function RequestModal(props) {
let navigate = useNavigate();

    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Header className="return-header">
                    <span className="text-warning"> PLEASE CONFIRM </span>
                </Modal.Header>
                <Modal.Body className="return-body text-center">
                    <span>Are you sure you want to {props.type} request?</span>
                </Modal.Body>
                <Modal.Footer className="return-footer">
                    <button type="button" className={props.type === "delete" || props.type === "reject" ? "button-warning" : "button-secondary"} onClick={props.hide}>Cancel</button>
                    <button type="button" className={props.type === "delete" || props.type === "reject" ? "button-warning-fill" : "button-primary"} onClick={props.handler}>Proceed</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}