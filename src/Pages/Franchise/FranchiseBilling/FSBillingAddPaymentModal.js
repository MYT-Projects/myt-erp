import { useState, useEffect } from "react";
import { Modal, Col, Row, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    getFranchise,
    createFranchiseeSaleBillingPaymentModal,
    getAllFranchiseSaleBillingPayment,
} from "../../../Helpers/apiCalls/Franchise/FranchiseSaleBillingApi";
import { validateFranchiseSaleBilling } from "../../../Helpers/Validation/Franchise/FranchiseSaleBillingPaymentValidation";
import { paySalesInvoice } from "../../../Helpers/apiCalls/franchiseeApi";
import InputError from "../../../Components/InputError/InputError";
import { getAllBanks } from "../../../Helpers/apiCalls/banksAPi";
import {
    getTodayDateISO,
    refreshPage,
    toastStyle,
} from "../../../Helpers/Utils/Common";

export default function FSBillingAddPaymentModal({
    balance,
    fs_billing_id,
    show,
    onHide,
}) {
    let navigate = useNavigate();
    const [bal, setBal] = useState(balance);
    const [banks, setBanks] = useState([]);
    const [isErrorPayment, setIsErrorPayment] = useState({
        to_bank_id: false,
        payment_type: false,
        payment_date: false,
        bank_name: false,
        cheque_number: false,
        cheque_date: false,
        reference_number: false,
    });
    const [franchiseeInvoicePayment, setFranchiseeInvoicePayment] = useState({
        payment_date: getTodayDateISO(),
        deposit_date: getTodayDateISO(),
        payment_type: "cash", 
        paid_amount: "",

        cheque_date: "",
        cheque_number: "",
        bank_name: "",

        reference_number: "",

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

        if (
            validateFranchiseSaleBilling(
                franchiseeInvoicePayment,
                setIsErrorPayment
            )
        ) {
            const response = await createFranchiseeSaleBillingPaymentModal(
                fs_billing_id,
                franchiseeInvoicePayment,
                balance
            );
            if (response.data) {
                toast.success("Successfully paid!", { style: toastStyle() });
                setTimeout(() => navigate("/franchisebilling"), 1000);
                setTimeout(() => refreshPage(), 1000);
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else {
            toast.error("Please fill in all fields", { style: toastStyle() });
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
                                <InputError
                                    isValid={isErrorPayment.payment_date}
                                    message={"Payment date is required"}
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
                                    name="payment_type"
                                    value="cash"
                                    type="radio"
                                    defaultChecked={
                                        franchiseeInvoicePayment.payment_type ===
                                        "cash"
                                    }
                                    onClick={(e) => {
                                        handleCreatePayment(e);
                                    }}
                                />
                                <Form.Check
                                    inline
                                    label="Check"
                                    name="payment_type"
                                    type="radio"
                                    value="check"
                                    defaultChecked={
                                        franchiseeInvoicePayment.payment_type ===
                                        "check"
                                    }
                                    onClick={(e) => {
                                        handleCreatePayment(e);
                                    }}
                                />
                                <Form.Check
                                    inline
                                    label="Others"
                                    name="payment_type"
                                    value="others"
                                    type="radio"
                                    defaultChecked={
                                        franchiseeInvoicePayment.payment_type ===
                                        "others"
                                    }
                                    onClick={(e) => {
                                        handleCreatePayment(e);
                                    }}
                                />
                            </Col>
                            <InputError
                                isValid={isErrorPayment.payment_type}
                                message={"Payment type is required"}
                            />
                            <Col>
                                <span className="">Balance:</span>
                                <span className="edit-label"> </span>
                                <span className="">{balance}</span>
                            </Col>
                        </Row>
                    </div>

                    {/* CASH PAYMENT DETAILS */}
                    {franchiseeInvoicePayment.payment_type === "cash" && (
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
                                        name="paid_amount"
                                        className="nc-modal-custom-text"
                                        defaultValue={balance}
                                        onChange={(e) => handleCreatePayment(e)}
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
                                        name="term_day"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.term_day
                                        }
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
                                        value={franchiseeInvoicePayment.to_bank_id}
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
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required is required"}
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
                    {franchiseeInvoicePayment.payment_type === "check" && (
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
                                        name="paid_amount"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.paid_amount
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Check Date
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
                                        isValid={isErrorPayment.cheque_date}
                                        message={"Check date is required"}
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-4 mb-2">
                                <Col>
                                    <span className="edit-label">
                                        Bank Name
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
                                        type="text"
                                        name="bank_name"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.bank_name
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
                                    <InputError
                                        isValid={isErrorPayment.bank_name}
                                        message={"Bank name is required"}
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
                                        isValid={isErrorPayment.cheque_number}
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
                                        value={franchiseeInvoicePayment.to_bank_id}
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
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required is required"}
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

                    {/* OTHERS PAYMENT DETAILS */}
                    {franchiseeInvoicePayment.payment_type === "others" && (
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
                                        name="paid_amount"
                                        className="nc-modal-custom-text"
                                        defaultValue={
                                            franchiseeInvoicePayment.paid_amount
                                        }
                                        onChange={(e) => handleCreatePayment(e)}
                                    />
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
                                        isValid={
                                            isErrorPayment.reference_number
                                        }
                                        message={"Reference number is required"}
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
                                        value={franchiseeInvoicePayment.to_bank_id}
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
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required is required"}
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
                                        name="term_day"
                                        className="nc-modal-custom-text"
                                        value={
                                            franchiseeInvoicePayment.term_day
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
                    <button
                        type="button"
                        className="button-primary"
                        onClick={() => pay()}
                    >
                        Pay
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
