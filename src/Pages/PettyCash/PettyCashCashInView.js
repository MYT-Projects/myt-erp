import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";




// api
import {deletePettyCashTransactionDetails, getPettyCashInDetailTransaction} from "../../Helpers/apiCalls/PettyCash/PettyCashRegisterApi";

// assets & styles
import {
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDateISO,
} from "../../Helpers/Utils/Common";
import trash from "./../../Assets/Images/trash.png";
import Navbar from "../../Components/Navbar/Navbar";
import "./PettyCash.css";
import { Fragment } from "react";
import InputError from "../../Components/InputError/InputError";
import ReactLoading from "react-loading";


import DeleteModal from "../../Components/Modals/DeleteModal";
/**
 *  -- COMPONENT: VIEW PETTY CASH IN DETAILS
 */
function PettyCashInView() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
	const [isClicked, setIsClicked] = useState(false);
	const [isDeleteClicked, setIsDeleteClicked] = useState(false);


    /**
     *  @id - param for edit purchase invoice formL
     */
    const { id } = useParams();
    const [pettyCashDetails, setPettyCashDetails] = useState({
            petty_cash_id: "1",
			type: "in",
			from: "",
			date: getTodayDateISO(),
			remarks: "",
			amount: "",
            petty_cash_detail_id : ""
    });
    


    /** FOR VIEW - Fetch Petty Cash Details */
    async function fetchPettyCashDetail() {
        const response = await getPettyCashInDetailTransaction(
            id
        );
        if (response) {
            if (response.status === "404") {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => navigate('/pettycash/'), 1000);
            } else if (response.status === "success") {
                const data = response.data['0'];
                setPettyCashDetails({petty_cash_detail_id: data.id, amount: data.amount, from: data.from, type: data.type, date:data.date, petty_cash_id: data.petty_cash_id, remarks:data.remarks});
                
            }
        } else {
            var errMsg = response.error;
            toast.error(errMsg, { style: toastStyle() });
        }
    }

	/* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    async function handleDeleteTransaction() {
        if(isDeleteClicked){
            return;
        }

        setIsDeleteClicked(true);
        const response = await deletePettyCashTransactionDetails(id);

        if (response.status === "success") {
            toast.success("Petty Cash Transaction Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => navigate('/pettycash/'), 1000);
        } else {
            toast.error("Error Deleting Petty Cash Transaction", {
                style: toastStyle(),
            });
        }
    }

	function handleEdit(){
		setTimeout(() => navigate('/pettycash/cashin/' + id + "/edit/"), 1000);
	}

    // DATA FETCHING
    useEffect(() => {
		fetchPettyCashDetail();
    }, []);


    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PETTY CASH"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                {/* header */}
                <div className="d-flex justify-content-between align-items-center my-3 pb-4">
                    <h1 className="page-title mb-0">
						VIEW PETTY CASH IN TRANSACTION
                    </h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    {/* FRANCHISEE SALES INVOICE DETAILS */}
                    <Fragment>
                        <Row className="mt-4 mb-2">
                            <Col xs={3}>
                                <span className="edit-label">
                                    Cash In Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={3}>
                                <Form.Control
                                        type="date"
                                        name="cashin_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={pettyCashDetails.date}
                                        value = {pettyCashDetails.date}
										disabled
                                    />
                            </Col>
                        </Row>

                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    FROM
                                </span>
                                <span className="color-red"> *</span>
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="cashin_from"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value = {pettyCashDetails.from}
									disabled
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    REMARKS
                                </span>
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="cashin_remarks"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value = {pettyCashDetails.remarks}
									disabled
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col xs={3}>
                                <span className="edit-label">
                                    Amount
                                </span>
                                <span className="color-red"> *</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={3}>
                                <Form.Control
                                    type="number"
                                    name="cashin_amount"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value = {pettyCashDetails.amount}
									disabled
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    

                    {/* FOOTER: CANCEL & SUBMIT BUTTONS */}
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </button>
                        
						{isClicked ? (
                            <div className="button-warning-fill d-flex justify-content-center">
                                <ReactLoading
                                    type="bubbles"
                                    color="#FFFFFF"
                                    height={50}
                                    width={50}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="button-warning-fill me-3 justify-content-center"
                                onClick={handleShowDeleteModal}
                            >
                                Delete
                            </button>
                        )}
						{isClicked ? (
                            <div className="button-primary d-flex justify-content-center">
                                <ReactLoading
                                    type="bubbles"
                                    color="#FFFFFF"
                                    height={50}
                                    width={50}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="button-primary"
                                onClick={handleEdit}
                            >
                                Edit
                            </button>
                        )}
						<DeleteModal
						show={showDeleteModal}
						onHide={() => handleCloseDeleteModal()}
						text="petty cash transaction"
						onDelete={() => handleDeleteTransaction()}
					/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PettyCashInView;
