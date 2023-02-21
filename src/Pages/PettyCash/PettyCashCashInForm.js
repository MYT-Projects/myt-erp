import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";



// validation
import {validatePettyCashInCreate, validatePettyCashInUpdate} from "../../Helpers/Validation/PettyCash/PettyCashValidation";
// api
import {postPettyCashInDetailTransaction, updatePettyCashInDetailTransaction, getPettyCashInDetailTransaction} from "../../Helpers/apiCalls/PettyCash/PettyCashRegisterApi";

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

/**
 *  -- COMPONENT: FORM TO ADD OR EDIT PETTY CASH OUT DETAILS
 */
function PettyCashIn({ add, edit}) {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isChanged, setIsChanged] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

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
    
    // DataHandlers

    function handleFromChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["from"]: e.target.value,
        }));
    }
    function handleDateChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["date"]: e.target.value,
        }));
    }

    function handleRemarksChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["remarks"]: e.target.value,
        }));
    }

    function handleAmountChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["amount"]: e.target.value,
        }));
    }

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        from: false,
        date: false,
        remarks: false,
        amount: false
    });

    function cleanErrorList(){
        setIsError({
            from: false,
            date: false,
            remarks: false,
            amount: false
        });
    }

    async function handleSubmitPettyCashDetail(){
        if (validatePettyCashInCreate(pettyCashDetails, setIsError)) {
                setIsClicked(true);
                const response = await postPettyCashInDetailTransaction(
                    pettyCashDetails
                );
                if (response) {
                    if (response.status === "error") {
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => refreshPage(), 1000);
                        setIsClicked(false);
                    } else if (response.status === "success") {
                        toast.success("Successfully created cash in transaction", {
                            style: toastStyle(),
                        });
                        setTimeout(() => navigate('/pettycash'), 1000);
                    }
                } else {
                    var errMsg = response.error;
                    toast.error(errMsg, { style: toastStyle() });
                    setIsClicked(false);
                }
            
        } else {
            setIsClicked(false);
            toast.error(
                "Please fill in all fields",
                { style: toastStyle() }
            );
        }
    }
  
    async function handleEditPettyCashDetail(){
        if (validatePettyCashInCreate(pettyCashDetails, setIsError)) {
            setIsClicked(true);
            const response = await updatePettyCashInDetailTransaction(
                pettyCashDetails
            );
            if (response) {
                if (response.status === "error") {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                    setIsClicked(false);
                } else if (response.status === "success") {
                    toast.success("Successfully updated cash in transaction", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate('/pettycash'), 1000);
                }
            } else {
                var errMsg = response.error;
                toast.error(errMsg, { style: toastStyle() });
                setIsClicked(false);
            }
        
    } else {
        setIsClicked(false);
        toast.error(
            "Please fill in all fields",
            { style: toastStyle() }
        );
    }

    }

    const handleSubmit = () => {
        if (isClicked) {
            return;
        }
        if (add) handleSubmitPettyCashDetail();
        else if (edit) handleEditPettyCashDetail();

    };

    /** FOR EDIT - Fetch Petty Cash Details */
    async function fetchPettyCashDetail() {
        const response = await getPettyCashInDetailTransaction(
            id
        );
        if (response) {
            if (response.status === "error") {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else if (response.status === "success") {
                const data = response.data['0'];
                setPettyCashDetails({petty_cash_detail_id: data.id, amount: data.amount, from: data.from, type: data.type, date:data.date, petty_cash_id: data.petty_cash_id});
                
            }
        } else {
            var errMsg = response.error;
            toast.error(errMsg, { style: toastStyle() });
        }
    }

    // DATA FETCHING
    useEffect(() => {
        if (edit) {
            fetchPettyCashDetail();
        }
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
                        {add
                            ? "ADD PETTY CASH IN TRANSACTION"
                            : "EDIT PETTY CASH IN TRANSACTION"}
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
                                        onChange={(e) => handleDateChange(e)}
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
                                    onChange={(e) => handleFromChange(e)}
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
                                    onChange={(e) => handleRemarksChange(e)}
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
                                    onChange={(e) => handleAmountChange(e)}
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
                            Cancel
                        </button>
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
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

PettyCashIn.defaultProps = {
    add: false,
    edit: false,
};

export default PettyCashIn;
