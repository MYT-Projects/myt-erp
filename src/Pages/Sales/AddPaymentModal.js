import { useEffect } from "react";
import { useState } from "react";
import { Modal, Col, Row, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { getAllBanks } from "../../Helpers/apiCalls/banksAPi";
import {
    paySalesInvoiceModal,
    getSingleSalesInvoice,
    recordStatusInvoice,
} from "../../Helpers/apiCalls/franchiseeApi";
import {
    getTodayDateISO,
    refreshPage,
    toastStyle,
} from "../../Helpers/Utils/Common";
import { validateFranchise } from "../../Helpers/Validation/Franchise/FranchiseModalValidation";
import InputError from "../../Components/InputError/InputError";
import ReactLoading from "react-loading";

export default function AddPaymentModal({
    id,
    franchiseeID,
    show,
    onHide,
    balance = "",
    invoice,
}) {
    let navigate = useNavigate();
    const [banks, setBanks] = useState([]);
    const [bankTo, setBankTo] = useState([]);
    const [bankValue, setBankValue] = useState({
        name: "from_bank_id",
        label: "",
        value: "",
    });
    const [depositValue, setDepositValue] = useState({
        name: "to_bank_id",
        label: "",
        value: "",
    });

    const [isErrorPayment, setIsErrorPayment] = useState({
        invoice_no: false,
        payment_type: false,
        payment_date: false,
        to_bank_id: false,
        bank_name: false,
        cheque_number: false,
        cheque_date: false,
        reference_number: false,
    });
    const [isClicked, setIsClicked] = useState(false);

    const [franchiseeInvoicePayment, setFranchiseeInvoicePayment] = useState(
        {
            to_bank_id: "",
            bank_name: "",
            cheque_number: "",
            cheque_date: "",
            reference_number: "",
        }
    );
    function handleCreatePayment(e) {
        const { name, value } = e.target;
        if (name === "from_bank_id") {
            setBankValue(() => {
                return { name: name, value: value, label: e.label };
            });
        } else if (name === "to_bank_id") {
            setDepositValue(() => {
                return { name: name, value: value, label: e.label };
            });
        }
        setFranchiseeInvoicePayment((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    }

    async function fetchBanks() {
        const response = await getAllBanks();
        var banks = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = banks.map((bank) => {
            var info = {};

            info.name = "from_bank_id";
            info.label = bank.bank_name;
            info.value = bank.id;

            return info;
        });
        setBanks(cleanedArray);

        var cleanedArray2 = banks.map((bank) => {
            var info = {};

            info.name = "to_bank_id";
            info.label = bank.bank_name;
            info.value = bank.id;

            return info;
        });
        setBankTo(cleanedArray2);
    }
    async function pay() {
        if (
            validateFranchise(
                franchiseeInvoicePayment,
                setIsErrorPayment
            )
        ) {
            setIsClicked(true);
            const response = await paySalesInvoiceModal(
                id,
                franchiseeID,
                franchiseeInvoicePayment,
                balance,
            );
            if (response.data) {
                if (response.data.status === "success") {
                    toast.success("Payment saved!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/salesinvoice/print/" + id), 1000);
                }
            } else if (response.error) {
                var errMsg = response.error.response.data.messages.error;
                toast.error(errMsg, { style: toastStyle() });
            }
        } else {
            toast.error("Please fill in all fields", { style: toastStyle() });
        }
    }

    useEffect(() => {
        fetchBanks();
        setFranchiseeInvoicePayment({
            payment_date: getTodayDateISO(),
            deposit_date: getTodayDateISO(),
            payment_type: "cash", 
            paid_amount: balance,

            check_date: "",
            check_number: "",
            bank_name: "",

            payment_description: "",
        });
    }, []);

    return (
        <div>
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Header closeButton>
                    <span className="page-title"> Add Payment</span>
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
                            <InputError
                                    isValid={isErrorPayment.payment_date}
                                    message={"Payment date is required"}
                                />
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
                                <InputError isValid={isErrorPayment.invoice_no} message={"Invoice number is required"}/>
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
                                    defaultChecked
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
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select bank..."
                                        defaultValue={depositValue}
                                        options={bankTo}
                                        onChange={(e) =>
                                            handleCreatePayment({
                                                target: {
                                                    name: e.name,
                                                    value: e.value,
                                                    label: e.label,
                                                },
                                            })
                                        }
                                    />
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
                                        isValid={isErrorPayment.bank_name}
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
                                        isValid={isErrorPayment.cheque_date}
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
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select bank..."
                                        defaultValue={depositValue}
                                        options={bankTo}
                                        onChange={(e) =>
                                            handleCreatePayment({
                                                target: {
                                                    name: e.name,
                                                    value: e.value,
                                                    label: e.label,
                                                },
                                            })
                                        }
                                    />
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required"}
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
                                        <span className="color-red"> *</span>
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select bank..."
                                        defaultValue={depositValue}
                                        options={bankTo}
                                        onChange={(e) =>
                                            handleCreatePayment({
                                                target: {
                                                    name: e.name,
                                                    value: e.value,
                                                    label: e.label,
                                                },
                                            })
                                        }
                                    />
                                    <InputError
                                        isValid={isErrorPayment.to_bank_id}
                                        message={"Deposited to is required"}
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
                                        isValid={isErrorPayment.reference_number}
                                        message={"Reference number to is required"}
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
        </div>
    );
}
