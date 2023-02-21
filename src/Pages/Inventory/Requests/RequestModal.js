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
    
const [remarks, setRemarks] = useState("");
let navigate = useNavigate();

async function rejectRequest() {
    if (props.selectedRow.shopType === "Mango") {
        const response = await changeRequestStatus(props.selectedRow.id, "rejected", remarks);
        if (response.data) {
            toast.success("Successfully rejected request!", {
                style: toastStyle(),
            });
            if(props.page === "table"){
                setTimeout(() => refreshPage(), 1000);
            } else if(props.page === "view"){
                setTimeout(() => navigate(-1), 1000);
            }
        } else if (response.error) {
            toast.error(
                "Something went wrong",
                { style: toastStyle() }
            );
            if(props.page === "table"){
                setTimeout(() => refreshPage(), 1000);
            } else if(props.page === "view"){
                setTimeout(() => navigate(-1), 1000);
            }
        }
    } else if (props.selectedRow.shopType === "Potato") {
        const response = await changeRequestStatusPotato(props.selectedRow.id, "rejected", remarks);
        if (response.data) {
            toast.success("Successfully rejected request!", {
                style: toastStyle(),
            });
            if(props.page === "table"){
                setTimeout(() => refreshPage(), 1000);
            } else if(props.page === "view"){
                setTimeout(() => navigate(-1), 1000);
            }
        } else if (response.error) {
            toast.error(
                "Something went wrong",
                { style: toastStyle() }
            );
            if(props.page === "table"){
                setTimeout(() => refreshPage(), 1000);
            } else if(props.page === "view"){
                setTimeout(() => navigate(-1), 1000);
            }
        }
    }   
}

    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Header className="return-header">
                    <span className="text-warning"> PLEASE CONFIRM </span>
                </Modal.Header>
                <Modal.Body className="return-body text-center">
                    <span>Are you sure you want to {props.type} request?</span>
                    {props.type === "reject" && (
                        <Col className="text-left pt-3">
                        <span>REMARKS</span>
                        <Form.Control
                            as="textarea"
                            name="remarks"
                            defaultValue={remarks}
                            className="nc-modal-custom-row-grey"
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </Col>
                    )}
                </Modal.Body>
                <Modal.Footer className="return-footer">
                    <button type="button" className={props.type === "delete" || props.type === "reject" ? "button-warning" : "button-secondary"} onClick={props.hide}>Cancel</button>
                    <button type="button" className={props.type === "delete" || props.type === "reject" ? "button-warning-fill" : "button-primary"} onClick={rejectRequest}>Proceed</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}