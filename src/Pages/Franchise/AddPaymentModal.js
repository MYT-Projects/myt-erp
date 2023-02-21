import React, { useState, useEffect } from "react";
import { Modal, Col, Row, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createFranchiseePaymentModal } from "../../Helpers/apiCalls/Franchise/FranchiseApi";
import { paySalesInvoice } from "../../Helpers/apiCalls/franchiseeApi";
import {
    getSingleFranchisee,
    getSingleSalesInvoice,
} from "../../Helpers/apiCalls/franchiseeApi";
import { validateFranchise } from "../../Helpers/Validation/Franchise/FranchiseValidation";
import { getAllBanks } from "../../Helpers/apiCalls/banksAPi";
import InputError from "../../Components/InputError/InputError";
import ReactLoading from "react-loading";
import {
    getTodayDateISO,
    refreshPage,
    toastStyle,
} from "../../Helpers/Utils/Common";
import ConfirmPaymentModal from "./ConfirmPaymentModal";

export default function AddPaymentModal({
    id,
    franchiseeID,
    show,
    onHide,
    balance,
}) {
    let navigate = useNavigate();
    const [amount, setAmount] = useState(balance);
    const [banks, setBanks] = useState([]);
    const [isClicked, setIsClicked] = useState(false);

    /* add payment modal handler */
    const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
    const handleShowConfirmPaymentModal = () => setShowConfirmPaymentModal(true);
    const handleCloseConfirmPaymentModal = () => setShowConfirmPaymentModal(false);

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        payment_method: false,
        payment_date: false,
        bank_name: false,
        cheque_number: false,
        cheque_date: false,
        reference_number: false,
        invoice_no: false,
    });

    const [franchiseeInvoicePayment, setFranchiseeInvoicePayment] = useState({
        payment_date: getTodayDateISO(),
        deposit_date: getTodayDateISO(),
        payment_method: "cash", 
        paid_amount: balance,

        check_date: "",
        check_number: "",
        bank_name: "",

        reference_number: "",
        invoice_no: "",
        term_days: "",
        remarks: "",
    });

    function handleCreatePayment(e) {
        const { name, value } = e.target;
        setFranchiseeInvoicePayment((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    }

    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.error) {
        } else {
            setBanks(response.data.data);
        }
    }

    async function pay() {
        if (isClicked) {
            return;
        }

        if (validateFranchise(franchiseeInvoicePayment, setIsError)) {
            setIsClicked(true);
            const response = await createFranchiseePaymentModal(
                franchiseeID,
                id,
                franchiseeInvoicePayment,
                balance
            );
            if (response.data) {
                toast.success("Successfully paid!", { style: toastStyle() });
                setTimeout(() => refreshPage(), 1000);
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            }
        }
    }

    useEffect(() => {
        fetchBanks();
    }, []);

    return (
        <div>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <span className="page-title"> Add Payment </span>
                </Modal.Header>
                <Modal.Body className="return-body">
                    <div>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Payment Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="date"
                                    name="payment_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoicePayment.payment_date
                                    }
                                    onChange={(e) => handleCreatePayment(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Invoice Number
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="invoice_no"
                                    className="nc-modal-custom-text"
                                    value={franchiseeInvoicePayment.invoice_no}
                                    onChange={(e) => handleCreatePayment(e)}
                                />
                                <InputError
                                    isValid={isError.invoice_no}
                                    message={"Invoice Number is required"}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Payment Method
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Check
                                    inline
                                    label="Cash"
                                    name="payment_method"
                                    value="cash"
                                    type="radio"
                                    defaultChecked
                                    onClick={(e) => {
                                        handleCreatePayment(e);
                                    }}
                                />
                                <Form.Check
                                    inline
                                    label="Check"
                                    name="payment_method"
                                    type="radio"
                                    value="check"
                                    onClick={(e) => {
                                        handleCreatePayment(e);
                                    }}
                                />
                                <Form.Check
                                    inline
                                    label="Others"
                                    name="payment_method"
                                    value="others"
                                    type="radio"
                                    onClick={(e) => {
                                        handleCreatePayment(e);
                                    }}
                                />
                            </Col>
                            <InputError
                                isValid={isError.payment_method}
                                message={"Please select a payment method"}
                            />
                            <Col>
                                <span className="">Balance:</span>
                                <span className="edit-label"> </span>
                                <span className="">{balance}</span>
                            </Col>
                        </Row>
                    </div>

                    {/* CASH PAYMENT DETAILS */}
                    {franchiseeInvoicePayment.payment_method === "cash" && (
                        <>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Paid Amount
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="amount"
                                        className="nc-modal-custom-text"
                                        defaultValue={balance}
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposit Date
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="deposit_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.deposit_date
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposited to
                                        <span className="edit-optional px-2"></span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Select
                                        type="text"
                                        name="to_bank_id"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.to_bank_id
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    >
                                        <option value="">
                                            Select a bank...
                                        </option>
                                        {banks.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.bank_name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Term (days)
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="term_days"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.term_days
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Remarks
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        name="remarks"
                                        value={
                                            setFranchiseeInvoicePayment.remarks
                                        }
                                        className="nc-modal-custom-text"
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* CHECK PAYMENT DETAILS */}
                    {franchiseeInvoicePayment.payment_method === "check" && (
                        <>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Paid Amount
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="amount"
                                        className="nc-modal-custom-text"
                                        defaultValue={balance}
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Bank Name
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="bank_name"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.bank_name
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                    <InputError
                                        isValid={isError.bank_name}
                                        message={"Bank name is required"}
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Check Date
                                    </span>
                                </Col>
                                <Col>
                                    <span className="edit-label">
                                        Check Number
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="cheque_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.cheque_date
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                    <InputError
                                        isValid={isError.cheque_date}
                                        message={"Check date is required"}
                                    />
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="cheque_number"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.cheque_number
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                    <InputError
                                        isValid={isError.cheque_number}
                                        message={"Cheque number is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposit Date
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="deposit_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.deposit_date
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposited to
                                        <span className="edit-optional px-2"></span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Select
                                        type="text"
                                        name="to_bank_id"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.to_bank_id
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    >
                                        <option value="">
                                            Select a bank...
                                        </option>
                                        {banks.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.bank_name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Term (days)
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="term_days"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.term_days
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Remarks
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        name="remarks"
                                        value={franchiseeInvoicePayment.remarks}
                                        className="nc-modal-custom-text"
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* OTHERS PAYMENT DETAILS */}
                    {franchiseeInvoicePayment.payment_method === "others" && (
                        <>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Paid Amount
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="amount"
                                        className="nc-modal-custom-text"
                                        defaultValue={balance}
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposit Date
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="date"
                                        name="deposit_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.deposit_date
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Deposited to
                                        <span className="edit-optional px-2"></span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Select
                                        type="text"
                                        name="to_bank_id"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.to_bank_id
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    >
                                        <option value="">
                                            Select a bank...
                                        </option>
                                        {banks.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.bank_name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Payment Description
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="remarks"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.remarks
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Reference Number
                                        <label className="badge-required">{` *`}</label>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="reference_number"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.reference_number
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                    <InputError
                                        isValid={isError.reference_number}
                                        message={"Reference number is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Term (days)
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="term_days"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.term_days
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Remarks
                                        <span className="edit-optional px-2">
                                            (Optional)
                                        </span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        name="remarks"
                                        value={franchiseeInvoicePayment.remarks}
                                        className="nc-modal-custom-text"
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="return-footer">
                    <button
                        type="button"
                        className="button-secondary"
                        onClick={onHide}
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
                            onClick={() => pay()}
                        >
                            Pay
                        </button>
                    )}
                </Modal.Footer>
            </Modal>

            <ConfirmPaymentModal
                // id={PIID}
                // balance={balance}
                // franchiseeID={franchiseeID}
                show={showConfirmPaymentModal}
                onHide={handleCloseConfirmPaymentModal}
                // handler={handleRequestTransfer}
            />
        </div>
    );
}
