import React, { useState, useEffect } from "react";
import { Modal, Form, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import { refreshPage, toastStyle } from "../../../Helpers/Utils/Common";
import { updateAdjustmentStatus } from "../../../Helpers/apiCalls/Inventory/AdjustmentApi";
import { updateAdjustmentStatusPotato } from "../../../Helpers/apiCalls/PotatoCorner/Inventory/AdjustmentApi";
import ReactLoading from "react-loading";

export default function AdjustmentModal(props) {
    const [remarks, setRemarks] = useState("");
    const [isConfirmClicked, setIsConfirmClicked] = useState(false);
    const [isSet, setIsSet] = useState(false);
    const [mangoAdjust, setMangoAdjust] = useState([]);
    const [potatoAdjust, setPotatoAdjust] = useState([]);

    async function handleSetAdjustmentStatus() {

        var mango = props.ids.filter((data) => data.type === "mango_magic");
        var potato = props.ids.filter((data) => data.type === "potato_corner");
        console.log(props.ids)
        console.log(props.request_type)

        if (isConfirmClicked) {
            return;
        }
        if (mango.length !== 0) {
            setIsConfirmClicked(true);
            const response = await updateAdjustmentStatus(
                mango,
                remarks,
                props.status,
                props.request_type
            );
            if (response.data.status === "success") {
                if (potato.length === 0) {
                    if (props.type === "approved") {
                        toast.success("Adjustment/s approved successfully!", {
                            style: toastStyle(),
                        });
                    } else if (props.type === "disapproved") {
                        toast.success(
                            "Adjustment/s disapproved successfully!",
                            { style: toastStyle() }
                        );
                    }
                }
                setTimeout(() => {
                    if (potato.length === 0) {
                        refreshPage();
                    }
                    setRemarks("");
                }, 1000);
            } else {
                setIsConfirmClicked(false);
                toast.error("Something went wrong", {
                    style: toastStyle(),
                });
                setRemarks("");
                if (potato.length === 0) {
                    refreshPage();
                }
            }
        }

        if (potato.length !== 0) {
            setIsConfirmClicked(true);
            const response2 = await updateAdjustmentStatusPotato(
                potato,
                remarks,
                props.status,
                props.request_type
            );
            if (response2.data.status === "success") {
                if (props.type === "approved") {
                    toast.success("Adjustment/s approved successfully!", {
                        style: toastStyle(),
                    });
                } else if (props.type === "disapproved") {
                    toast.success("Adjustment/s disapproved successfully!", {
                        style: toastStyle(),
                    });
                }
                setTimeout(() => {
                    refreshPage();
                    setRemarks("");
                }, 1000);
            } else {
                setIsConfirmClicked(false);
                toast.error("Something went wrong", {
                    style: toastStyle(),
                });
                setRemarks("");
                refreshPage();
            }
        }
    }

    return (
        <div>
            <Modal show={props.show} onHide={props.hide} size="lg" centered>
                <Modal.Header className="return-header">
                    <span
                        className={
                            props.type === "disapproved"
                                ? "color-red"
                                : "text-warning"
                        }
                    >
                        {props.type === "disapproved"
                            ? "DISAPPROVE"
                            : "APPROVE"}{" "}
                        INVENTORY ADJUSTMENTS{" "}
                    </span>
                </Modal.Header>
                <Modal.Body className="return-body text-center">
                    <span>
                        Are you sure you want to {props.type} these selected
                        adjustments?
                    </span>
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
                </Modal.Body>
                <Modal.Footer className="return-footer">
                    <button
                        type="button"
                        className={
                            props.type === "disapproved"
                                ? "button-warning"
                                : "button-secondary"
                        }
                        onClick={props.hide}
                    >
                        Close
                    </button>
                    {isConfirmClicked ? (
                        <div
                            className={
                                props.type === "disapproved"
                                    ? "button-warning-fill d-flex justify-content-center"
                                    : "button-primary d-flex justify-content-center"
                            }
                        >
                            <ReactLoading
                                type="bubbles"
                                color={
                                    props.type === "disapproved"
                                        ? "#FFFFFF"
                                        : "#FFFFFF"
                                }
                                height={50}
                                width={50}
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={
                                props.type === "disapproved"
                                    ? "button-warning-fill"
                                    : "button-primary"
                            }
                            onClick={handleSetAdjustmentStatus}
                        >
                            Confirm
                        </button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
}
