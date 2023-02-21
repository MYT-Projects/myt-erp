import { Modal } from "react-bootstrap";
import { refreshPage } from "../../Helpers/Utils/Common";

export default function ConfirmPaymentModal(props) {
    return (
        <div>
            <Modal show={props.show} onHide={props.onHide} size="lg" centered>
                <Modal.Header className="return-header">
                    <span className={props.type === "disapprove" ? "color-red" : "text-warning"}> PLEASE CONFIRM </span>
                </Modal.Header>
                <Modal.Body className="return-body text-center">
                    <span>There is already a recorded payment entry for this invoice. Are you sure you want to create payment?</span>
                </Modal.Body>
                <Modal.Footer className="return-footer">
                    <button type="button" className={props.type === "disapprove" ? "button-warning" : "button-secondary"} onClick={props.onHide}>Cancel</button>
                    <button type="button" className={props.type === "disapprove" ? "button-warning-fill" : "button-primary"} onClick={props.handler}>Proceed</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}