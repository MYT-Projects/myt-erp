import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";



// api
import {getPettyCashOutDetailTransaction, deletePettyCashTransactionDetails} from "../../Helpers/apiCalls/PettyCash/PettyCashRegisterApi";

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
 *  -- COMPONENT: FORM TO ADD OR EDIT PETTY CASH OUT DETAILS
 */
function PettyCashOutView() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isChanged, setIsChanged] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    /**
     *  @id - param for edit cash out form
     */
    const { id } = useParams();

    const [pettyCashDetails, setPettyCashDetails] = useState({
            petty_cash_id: "1",
            petty_cash_detail_id: "",
			type: "out",
			particulars: "",
            remarks: "",
			invoice_no: "",
			date: getTodayDateISO(),
			item_names: [],
			item_quantities: [],
			item_prices: [],
			item_units: [],
            amount: "0.00",
    });
    
    // DataHandlers

    function handleInvoiceChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["invoice_no"]: e.target.value,
        }));
    }
    function handleDateChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["date"]: e.target.value,
        }));
    }

    function handleParticularsChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["particulars"]: e.target.value,
        }));
    }

    function handleRemarksChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["remarks"]: e.target.value,
        }));
    }

    function handleAmountChange(amount){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["amount"]: amount,
        }));
    }

    function handleItemListChange(){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            "item_names": orderItems.map(item => {return item.item_name}),
        }));
        setPettyCashDetails((prevState) => ({
            ...prevState,
            "item_quantities": orderItems.map(item => {return item.qty}),
        }));
        setPettyCashDetails((prevState) => ({
            ...prevState,
            "item_prices": orderItems.map(item => {return item.price}),
        }));
        setPettyCashDetails((prevState) => ({
            ...prevState,
            "item_units": orderItems.map(item => {return item.unit}),
        }));
    } 

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        cash_out_date: false,
        particulars: false,
        amount: false,
        list: false,
        listInfo: false,
    });

    function cleanErrorList(){
        setIsError({
            cash_out_date: false,
            particulars: false,
            amount: false,    
            list: false,
            listInfo: false,
        });
    }


    /**
     *  PARTICULARS ITEM LIST
     */
    const [orderItems, setOrderItems] = useState([]);

    useEffect(handleItemListChange, [orderItems]);

    function addNewItem(item_name = "", price = "", unit = "", qty = "", total = "0.00") {
        const newItem = {
            qty: qty,
            unit: unit,
            item_name: item_name,
            price: price,
            total: total,
        };
        setOrderItems((oldItems) => [...oldItems, newItem]);
    }
    function deleteOrder(row) {
        const updatedOrderList = [...orderItems];
        updatedOrderList.splice(row, 1);
        setOrderItems(updatedOrderList);
    }
   
    function handleOrderItemsChange(e, row, type) {
        cleanErrorList();
        setIsChanged(true);
        var temp = orderItems;
        const { name, value } = e.target;
        temp[row][name] = value;


        if (
            name === "qty" ||
            name === "price" 
        ) { 
                var subtotal =
                    temp[row].qty && temp[row].price
                        ? parseFloat(
                                parseInt(temp[row].qty) *
                                    parseFloat(temp[row].price)
                            ).toString()
                        : "0.00";
                    temp[row].total = subtotal;
                

        }
        setOrderItems(temp);
        handleItemListChange();
        setTimeout(() => setIsChanged(false), 1);
    }

    
    /** FOR EDIT - Fetch Petty Cash Details */
    async function fetchPettyCashDetail() {
        const response = await getPettyCashOutDetailTransaction(
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
                const items = data.petty_cash_items;
                setPettyCashDetails({ petty_cash_detail_id: data.id, 
                    amount: data.amount, 
                    invoice_no: data.invoice_no, 
                    type: data.type, 
                    out_type: data.out_type, 
                    date: data.date,
                    approved_on: data.approved_on,
                    approved_by: data.approved_by,
                    requested_by_name: data.requested_by_name,
                    particulars: data.particulars,
                    petty_cash_id: data.petty_cash_id ,
                    item_names: [],
                    item_prices: [],
                    item_units: [],
                    item_quantities: [],
                    remarks: data.remarks,

                });
                items.map(element => {
                    addNewItem(element.name, element.price, element.unit, element.qty, (parseFloat(element.price) * parseFloat(element.qty)));
                });
            }
        } else {
            var errMsg = response.error;
            toast.error(errMsg, { style: toastStyle() });
        }
    }

    /* delete modal handler */
    const [isDeleteClicked, setIsDeleteClicked] = useState(false);
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
		setTimeout(() => navigate('/pettycash/cashout/' + id + "/edit/"), 1000);
	}

    useEffect(() => {
        var _subtotal = orderItems
            .map((item) => parseFloat(item.total))
            .reduce((a, b) => a + b, 0);

        var _grandTotal = _subtotal;
        handleAmountChange(_grandTotal.toFixed(2));
    }, [isChanged]);

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
                        VIEW PETTY CASH OUT TRANSACTION
                    </h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    {/* FRANCHISEE SALES INVOICE DETAILS */}
                    <Fragment>
                        <Row className="mt-4 mb-2">
                            <Col xs={3}>
                                <span className="edit-label">
                                    Cash Out Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Invoice No.
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Approved On
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Approved By
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={3}>
                                <Form.Control
                                        type="date"
                                        name="cashout_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={pettyCashDetails.date}
                                        value = {pettyCashDetails.date}
                                        // onChange={(e) => handleDateChange(e)}
                                        disabled
                                    />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="text"
                                    name="cashout_invoice"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value = {pettyCashDetails.invoice_no}
                                    // onChange={(e) => handleInvoiceChange(e)}
                                    disabled
                                />
                            </Col>
                            <Col xs={3}>
                            <Form.Control
                                        type="date"
                                        name="approved_on"
                                        className="nc-modal-custom-text"
                                        defaultValue={pettyCashDetails.approved_on}
                                        value = {pettyCashDetails.approved_on}
                                        // onChange={(e) => handleDateChange(e)}
                                        disabled
                                    />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="text"
                                    name="approved_by"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value = {pettyCashDetails.approved_by}
                                    // onChange={(e) => handleInvoiceChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        

                        <Row className="mt-4 mb-2">
                        <Col xs={6}>
                                <span className="edit-label">
                                    TYPE
                                </span>
                                <span className="color-red"> *</span>
                            </Col>
                            <Col xs={6}>
                                <span className="edit-label">
                                    REQUESTED BY
                                </span>
                                {/* <span className="color-red"> *</span> */}
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="cashout_particulars"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value={pettyCashDetails.out_type}
                                    onChange={(e) => handleParticularsChange(e)}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="requested_by_name"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value={pettyCashDetails.requested_by_name}
                                    onChange={(e) => handleParticularsChange(e)}
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
                            <Col xs={6}>
                                <span className="edit-label">
                                    PARTICULARS
                                </span>
                                <span className="color-red"> *</span>
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="cashout_remarks"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value={pettyCashDetails.remarks}
                                    onChange={(e) => handleRemarksChange(e)}
                                    disabled
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="cashout_particulars"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value={pettyCashDetails.particulars}
                                    onChange={(e) => handleParticularsChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    {/* ORDER ITEMS */}
                    <Row className="mt-4 pt-3">
                        <Col>
                            <span className="edit-label mb-2">
                                List Particulars
                                <span className="color-red"> *</span>
                            </span>
                            <div className="edit-purchased-items">
                                {orderItems.length !== 0 ? (
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th className="color-gray">
                                                    item
                                                </th>
                                                <th className="color-gray">
                                                    quantity
                                                </th>
                                                <th className="color-gray">
                                                    unit
                                                </th>
                                                <th className="color-gray">
                                                    price
                                                </th>
                                                <th className="color-gray">
                                                    total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item, index) => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                name="item_name"
                                                                defaultValue={
                                                                    item.item_name
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                                disabled
                                                            />
                                                            <InputError
                                                                isValid={
                                                                    isError.listInfo
                                                                }
                                                                message={
                                                                    "Item is required"
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="qty"
                                                                defaultValue={
                                                                    item.qty
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                                disabled
                                                            />
                                                            <InputError
                                                                isValid={
                                                                    isError.listInfo
                                                                }
                                                                message={
                                                                    "Quantity is required"
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                name="unit"
                                                                defaultValue={
                                                                    item.unit
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                                disabled
                                                            />


                                                            <InputError
                                                                isValid={
                                                                    isError.listInfo
                                                                }
                                                                message={
                                                                    "Unit is required"
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="price"
                                                                value={
                                                                    item.price
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                                disabled
                                                            />

                                                            <InputError
                                                                isValid={
                                                                    isError.listInfo
                                                                }
                                                                message={
                                                                    "Price is required"
                                                                }
                                                            />
                                                        </td>
                                                        <td className="color-green">
                                                            {numberFormat(
                                                                item.total
                                                            )}
                                                            {item.exceed? <p></p> : ""}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="entries-not-found">
                                        There is no ordered items yet.
                                    </div>
                                )}
                            </div>
                            <InputError
                                isValid={isError.list}
                                message={"Please add an item"}
                            />
                        </Col>
                    </Row>

                    {/* GRAND TOTAL */}
                    <Fragment>
                        <Row className="align-right py-5">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray grand-total-text">
                                    Grand Total
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle grand-total-text">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3} className="text-end">
                                <span className="edit-label align-middle grand-total-text">
                                    {numberFormat(
                                        pettyCashDetails.amount
                                    )}
                                </span>
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


export default PettyCashOutView;
