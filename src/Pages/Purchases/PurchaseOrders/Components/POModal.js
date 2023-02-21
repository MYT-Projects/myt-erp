import { Modal } from "react-bootstrap";
import { refreshPage } from "../../../../Helpers/Utils/Common";
import "../PurchaseOrders.css"

export default function POModal(props) {
    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Header className="return-header">
                    <span className={props.type === "disapprove" ? "color-red" : "text-warning"}> PLEASE CONFIRM </span>
                </Modal.Header>
                <Modal.Body className="return-body text-center">
                    <span>Are you sure you want to {props.type} this purchase <br />order{props.type === "return" ? " to pending" : props.type === "send" ? " to supplier" : null}?</span>
                </Modal.Body>
                <Modal.Footer className="return-footer">
                    <button type="button" className={props.type === "disapprove" ? "button-warning" : "button-secondary"} onClick={props.hide}>Cancel</button>
                    <button type="button" className={props.type === "disapprove" ? "button-warning-fill" : "button-primary"} onClick={props.handler}>Proceed</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}