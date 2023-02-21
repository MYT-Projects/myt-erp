import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";


// validation
import {validatePettyCashOutCreate, validatePettyCashOutUpdate} from "../../Helpers/Validation/PettyCash/PettyCashValidation";
// api
import {postPettyCashOutDetailTransaction, getPettyCashOutDetailTransaction, updatePettyCashOutDetailTransaction} from "../../Helpers/apiCalls/PettyCash/PettyCashRegisterApi";
import { getAllEmployees } from "../../Helpers/apiCalls/employeesApi";

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
function PettyCashOut({ add, edit }) {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isChanged, setIsChanged] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [employees, setEmployees] = useState([]);

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
			out_type: "",
			date: getTodayDateISO(),
			item_names: [],
			item_quantities: [],
			item_prices: [],
			item_units: [],
            amount: "0.00",
    });
    const [grandTotal, setGrandTotal] = useState("0.00");
    const [typeValue, setTypeValue] = useState({
        name: "type",
        label: "",
        value: "",
    });
    const typeOptions = [
        {
            id: 1,
            name: "type_id",
            value: "Transportation",
            label: "Transportation",
        },
        {
            id: 2,
            name: "type_id",
            value: "Kiosk construction",
            label: "Kiosk Construction",
        },
        {
            id: 3,
            name: "type_id",
            value: "Office supplies",
            label: "Office Supplies",
        },
        {
            id: 4,
            name: "type_id",
            value: "Store supplies",
            label: "Store Supplies",
        },
        {
            id: 5,
            name: "type_id",
            value: "Rental",
            label: "Rental",
        },
        {
            id: 6,
            name: "type_id",
            value: "CUSA + Aircon",
            label: "CUSA + Aircon",
        },
        {
            id: 7,
            name: "type_id",
            value: "Salaries + 13th Month",
            label: "Salaries + 13th Month",
        },
        {
            id: 8,
            name: "type_id",
            value: "Benefits - Employer Share",
            label: "Benefits - Employer Share",
        },
        {
            id: 9,
            name: "type_id",
            value: "Professional Fees",
            label: "Professional Fees",
        },
        {
            id: 10,
            name: "type_id",
            value: "Repairs and Maintenance",
            label: "Repairs and Maintenance",
        },
        {
            id: 11,
            name: "type_id",
            value: "Communication",
            label: "Communication",
        },
        {
            id: 12,
            name: "type_id",
            value: "Insurance",
            label: "Insurance",
        },
        {
            id: 13,
            name: "type_id",
            value: "Pest Control",
            label: "Pest Control",
        },
        {
            id: 14,
            name: "type_id",
            value: "Logistics",
            label: "Logistics",
        },
        {
            id: 15,
            name: "type_id",
            value: "Rental - Payable from Sales",
            label: "Rental - Payable from Sales",
        },
        {
            id: 16,
            name: "type_id",
            value: "Marketing",
            label: "Marketing",
        },
        {
            id: 17,
            name: "type_id",
            value: "Permits & Liscense Renewal",
            label: "Permits & Liscense Renewal",
        },
        {
            id: 18,
            name: "type_id",
            value: "Operating Supplies",
            label: "Operating Supplies",
        },
        {
            id: 19,
            name: "type_id",
            value: "Others",
            label: "Others",
        },
        {
            id: 20,
            name: "type_id",
            value: "Water",
            label: "Water",
        },
        {
            id: 21,
            name: "type_id",
            value: "Electricity",
            label: "Electricity",
        },
    ];
    
    // DataHandlers

    function handleInvoiceChange(e){
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["invoice_no"]: e.target.value,
        }));
    }
    function handleType(e) {
        setPettyCashDetails((prevState) => ({
            ...prevState,
            ["out_type"]: e.value,
        }));
        setTypeValue({ name: e.name, label: e.label, value: e.value });
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
        out_type: false,
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
        handleOrderItemsChange();
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

    console.log(pettyCashDetails)

    async function handleSubmitPettyCashDetail(){
        if (validatePettyCashOutCreate(pettyCashDetails, setIsError)) {
                setIsClicked(true);
                const response = await postPettyCashOutDetailTransaction(
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
                        toast.success("Successfully created cash out transaction", {
                            style: toastStyle(),
                        });
                        setTimeout(() => navigate('/pettycash'), 1000);
                    }
                } else {
                    var errMsg = response.error.data.messages.error;
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
        if (isClicked) {
            return;
        }
        if (validatePettyCashOutUpdate(pettyCashDetails, setIsError)) {
            setIsClicked(true);
            const response = await updatePettyCashOutDetailTransaction(
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
                    toast.success("Successfully edited cash out transaction", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate('/pettycash'), 1000);
                }
            } else {
                var errMsg = response.error.data.messages.error;
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

    async function fetchEmployees() {
        setEmployees([]);
        const response = await getAllEmployees();

        if (response.data) {
            let result = response.data.data.map((data) => {
                return {
                    label:
                        data.first_name +
                        " " +
                        data.middle_name +
                        " " +
                        data.last_name,
                    value: data.id,
                };
            });
            setEmployees(result);
        } else {
            // TokenExpiry(response);
            setEmployees([]);
        }
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
                    remarks: data.remarks, 
                    invoice_no: data.invoice_no, 
                    type: data.type, 
                    out_type: data.out_type, 
                    date: data.date,
                    particulars: data.particulars,
                    petty_cash_id: data.petty_cash_id ,
                    item_names: [],
                    item_prices: [],
                    item_units: [],
                    item_quantities: []

                });
                items.map(element => {
                    addNewItem(element.name, element.price, element.unit, element.qty, (parseFloat(element.price) * parseFloat(element.qty)));
                });
                setTypeValue({ name: "type",  label: data.out_type,  value: data.out_type,  });
            }
        } else {
            var errMsg = response.error;
            toast.error(errMsg, { style: toastStyle() });
        }
    }



    // FOR DYNAMIC CALCULATION
    useEffect(() => {
        var _subtotal = orderItems
            .map((item) => parseFloat(item.total))
            .reduce((a, b) => a + b, 0);

        var _grandTotal = _subtotal;
        handleAmountChange(_grandTotal.toFixed(2));
    }, [isChanged]);

    // DATA FETCHING
    useEffect(() => {
        fetchEmployees()
        if (edit) {
            fetchPettyCashDetail();
        }
    }, []);

    console.log(pettyCashDetails)

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
                            ? "ADD PETTY CASH OUT TRANSACTION"
                            : "EDIT PETTY CASH OUT TRANSACTION"}
                    </h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    {/* FRANCHISEE SALES INVOICE DETAILS */}
                    <Fragment>
                        <Row className="mt-4 mb-2">
                            <Col xs={4}>
                                <span className="edit-label">
                                    Cash Out Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col xs={4}>
                                <span className="edit-label">
                                    Invoice No.
                                </span>
                            </Col>
                            <Col xs={4}>
                                <span className="edit-label">
                                    Type
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <Form.Control
                                        type="date"
                                        name="cashout_date"
                                        className="nc-modal-custom-text"
                                        defaultValue={pettyCashDetails.date}
                                        value = {pettyCashDetails.date}
                                        onChange={(e) => handleDateChange(e)}
                                    />
                            </Col>
                            <Col xs={4}>
                                <Form.Control
                                    type="text"
                                    name="cashout_invoice"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value = {pettyCashDetails.invoice_no}
                                    onChange={(e) => handleInvoiceChange(e)}
                                />
                            </Col>
                            <Col xs={4}>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select type..."
                                    value={typeValue}
                                    options={typeOptions.sort((a, b) =>
                                        a.value > b.value ? 1 : b.value > a.value ? -1 : 0
                                    )}
                                    onChange={(e) => handleType(e)}
                                />
                                <InputError isValid={ isError.out_type }
                                    message={"Type is required"}
                                />
                            </Col>
                        </Row>
                        

                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    PARTICULARS
                                </span>
                                <span className="color-red"> *</span>
                            </Col>
                            <Col>
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
                                    value={pettyCashDetails.particulars}
                                    onChange={(e) => handleParticularsChange(e)}
                                />
                            </Col>
                            <Col>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Employee..."
                                    value={pettyCashDetails.requested_by}
                                    options={employees}
                                    onChange={(e) =>{
                                        setPettyCashDetails((prevState) => ({
                                            ...prevState,
                                            ["requested_by"]: e.requested_by,
                                        }));
                                    }}
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
                                    name="cashout_remarks"
                                    className="nc-modal-custom-text"
                                    defaultValue={""}
                                    value={pettyCashDetails.remarks}
                                    onChange={(e) => handleRemarksChange(e)}
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
                                                <th className="color-gray">
                                                    actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item, index) => {
                                                console.log(item)
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
                                                        <td className="text-center">
                                                            <img
                                                                src={trash}
                                                                onClick={() =>
                                                                    deleteOrder(
                                                                        index
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            />
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

                    {/* ADD ITEM BUTTON */}
                    <Row className="pt-3 PO-add-item">
                        <Button
                            type="button"
                            disabled={false}
                            onClick={() => addNewItem()}
                        >
                            Add Item
                        </Button>
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

PettyCashOut.defaultProps = {
    add: false,
    edit: false,
};

export default PettyCashOut;
