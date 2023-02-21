import React, { useState } from "react";
import { Fragment } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import ReactLoading from "react-loading";

// api
import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";
import { validateSePurchaseInvoice } from "../../../../Helpers/Validation/Purchase/SEPIValidation";

// assets & styles
import {
    capitalizeFirstLetter,
    getTodayDateISO,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import {
    createSEPurchaseInvoice,
    getSingleSEPurchaseInvoice,
    getSingleSEPurchaseOrder,
    updateSEPurchaseInvoice,
} from "../../../../Helpers/apiCalls/Expenses/sePurchaseApi";
import { getAllBranches } from "../../../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import trash from "./../../../../Assets/Images/trash.png";
import Navbar from "../../../../Components/Navbar/Navbar";
import "./../../PurchaseOrders/PurchaseOrders.css";
import "./../PurchaseInvoices.css";
import InputError from "../../../../Components/InputError/InputError";

function SEFormPurchaseInvoice({ add, edit }) {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isChanged, setIsChanged] = useState(false);

    /**
     *  @po_id - param for add purchase invoice form
     *  @pi_id - param for edit purchase invoice form
     */
    const { po_id, pi_id } = useParams();

    // PURCHASE INVOICE DETAILS HANDLER
    const [addPI, setAddPI] = useState({});
    const [itemList, setItemList] = useState([]);
    const [additionalItemList, setAdditionalItemList] = useState([]);
    const [subtotal, setSubtotal] = useState("0");
    const [freightCost, setFreightCost] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [grandTotal, setGrandTotal] = useState("0");
    const [branches, setBranches] = useState([]);
    const [isClicked, setIsClicked] = useState(false);
    const [typeValue, setTypeValue] = useState({
        name: "type",
        label: "",
        value: "",
    });
    const [branchValue, setBranchValue] = useState({
        name: "branch_id",
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

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        received_date: false,
        invoice_no: false,
        dr_no: false,
        // items
        qtyInput: false, //receive tbl
        price: false, //receive tbl
        item_id: false, //additional tbl
        qty: false, //additional tbl
        addtl_price: false, //additional tbl
    });

    // DATA HANDLERS
    const [forwarders, setForwarders] = useState([]);
    const [forwarderValue, setForwarderValue] = useState({
        name: "forwarder_id",
        label: "",
        value: "",
    });

    function handleType(e) {
        var newList = addPI;
        newList[e.name] = e.value;
        setAddPI(newList);
        setTypeValue({ name: e.name, label: e.label, value: e.value });
    }
    function handleForwarderChange(e) {
        var newList = addPI;
        newList[e.name] = e.value;
        setAddPI(newList);
        setForwarderValue({ name: e.name, label: e.label, value: e.value });
    }

    function handleBranchChange(e) {
        console.log(e)
        setBranchValue({ name: e.name, label: e.label, value: e.value });
        setAddPI({
            ...addPI,
            branch_id: e.value,
        });
    }

    function handleAddChange(e) {
        const newList = { ...addPI };
        const { name, value } = e.target;
        newList[name] = value;

        setAddPI(newList);

        if (name === "freight_cost") {
            setFreightCost(value);
        } else if (name === "discount") {
            setDiscount(value);
        }
    }

    function handleItemChange(e, id) {
        const { name, value } = e.target;

        setIsChanged(true);
        itemList[id][name] = value;
        itemList[id].amount =
            itemList[id].qtyInput && itemList[id].price
                ? (
                      parseFloat(itemList[id].qtyInput) *
                      parseFloat(itemList[id].price)
                  ).toString()
                : "0";
        setTimeout(() => setIsChanged(false), 1);
    }

    function handleAddNewRow() {
        const newItem = {
            id: "",
            name: "",
            qtyInput: "1",
            unit: "",
            price: "",
            type: "",
            se_id: "0",
        };
        setAdditionalItemList((oldItems) => [...oldItems, newItem]);
    }

    function handleDelRow(id) {
        const newList = [...additionalItemList];
        newList.splice(id, 1);
        setAdditionalItemList(newList);
    }

    const [showLoader, setShowLoader] = useState(false);

    function handleAddTblChange(e, id) {
        const { name, value } = e.target;
        var temp = additionalItemList;

        if (name === "qtyInput" || name === "price") {
            setShowLoader(true);
            temp.map((item, index) => {
                if (index === id) {
                    item[name] = value;
                    item.amount = item.qtyInput * item.price;

                    return item;
                }
            });
        } else {
            temp.map((item, index) => {
                if (index === id) {
                    item[name] = value;
                    return item;
                }
            });
        }
        setAdditionalItemList(temp);
        setIsChanged(!isChanged);
        setTimeout(() => setShowLoader(false), 1);
    }

    async function handleCreatePI() {
        if (
            validateSePurchaseInvoice(
                addPI,
                itemList,
                setIsError
            )
        ) {
            setIsClicked(true);
            const response = await createSEPurchaseInvoice(
                addPI,
                itemList,
                additionalItemList,
                po_id
            );
            console.log(response)
            if (response.data) {
                toast.success(response.data.response, {
                    style: toastStyle(),
                });
                setTimeout(
                    () =>
                        navigate(
                            "/se/purchaseinvoices/print/" +
                                response.data.supplies_receive_id
                        ),
                    1000
                );
            } else {
                toast.error(response.error.data.messages.response, { style: toastStyle() });
                // setTimeout(() => refreshPage(), 1000);
            }
        } else {
            toast.error("Please fill in all fields", { style: toastStyle() });
        }
        setTimeout(() => {
            setIsClicked(false);
        }, 5000);

    }

    async function handleUpdatePI() {
        const allItems = [];

        itemList.map((item) => {
            var info = item;
            info.po_item_id = item.id;
            info.qtyInput = item.qty;
            allItems.push(info);
        });
        if (additionalItemList.length > 0) {
            additionalItemList.map((item) => {
                var info = item;
                info.qtyInput = item.qty;
                info.po_item_id = "0";
                allItems.push(info);
            });
        }

        if (
            validateSePurchaseInvoice(
                addPI,
                itemList,
                setIsError
            )
        ) {
            setIsClicked(true);
            const response = await updateSEPurchaseInvoice(addPI, allItems);

            if (response.data) {
                toast.success(response.data.response, {
                    style: toastStyle(),
                });
                setTimeout(
                    () => navigate("/se/purchaseinvoices/print/" + addPI.id),
                    1000
                );
            } else if (response.error) {
                var errMsg = response.error.data.messages.error;
                toast.error(errMsg, { style: toastStyle(), duration: 2000 });
            }
        } else {
            toast.error("Please fill in all fields", { style: toastStyle() });
        }
        setTimeout(() => {
            setIsClicked(false);
        }, 5000);

    }

    const handleSubmit = () => {
        if (add) handleCreatePI();
        else if (edit) handleUpdatePI();
    };

    /** GET API - Branches **/
    async function fetchBranches() {
        const response = await getAllBranches();

        if (response.data) {
            var data = response.data.data;
            data.map((branch) => {
                var info = {};

                info.name = "branch_id";
                info.label = branch.name;
                info.value = branch.id;
                setBranches((prev) => [...prev, info]);
            });
        }
    }

    /** FOR ADD - Fetch Purchase Order Details */
    async function fetchPO() {
        setAddPI({});
        setItemList([]);

        const response = await getSingleSEPurchaseOrder(po_id);
        if (response.data.status === "success") {
            var se_PO = response.data.data[0];
            se_PO.paid_amount = se_PO.with_payment !== null ? se_PO.grand_total : "0"
            se_PO.received_date = getTodayDateISO();
            se_PO.purchase_date = se_PO.supplies_expense_date;
            se_PO.invoice_no = "";
            se_PO.dr_no = "";
            var receivedItems = se_PO.se_items.map((item) => {
                var info = item;
                info.amount = parseFloat(info.qty) * parseFloat(info.price);
                info.qtyInput = item.qty;
                info.type = item.type || "";
                return info;
            });
            setAddPI(se_PO);
            setSubtotal(se_PO.grand_total);
            setGrandTotal(se_PO.grand_total);
            setItemList(receivedItems);
            setForwarderValue({
                name: "forwarder_id",
                label: se_PO.forwarder_name,
                value: se_PO.forwarder_id,
            });
            setTypeValue({
                name: "type",
                label: capitalizeFirstLetter(se_PO.type),
                value: se_PO.type,
            });
        } else {
            TokenExpiry(response);
        }
    }

    console.log(addPI)

    /** FOR EDIT - Fetch Purchase Invoice Details */
    async function fetchPI() {
        const response = await getSingleSEPurchaseInvoice(pi_id);
        if (response.data) {
            var PI = response.data.data[0];

            var itemsReceived = [];
            var additionalReceived = [];

            var itemReceivedTotal = 0;
            var additionalReceivedTotal = 0;

            if (PI.supplies_receive_items) {
                PI.receive_items = PI.supplies_receive_items.map((receive_item) => {
                    var item = receive_item;
                    item.se_item_id = receive_item.se_item_id;
                    item.amount = receive_item.total;
                    item.qtyInput = receive_item.qty;
                    return item;
                });

                PI.receive_items.map((receive_item) => {
                    if (receive_item.se_item_id !== "0") {
                        itemReceivedTotal =
                            itemReceivedTotal + parseFloat(receive_item.total);
                        itemsReceived.push(receive_item);
                    } else {
                        receive_item.qtyInput = receive_item.qty;
                        additionalReceivedTotal =
                            additionalReceivedTotal +
                            parseFloat(receive_item.total);
                        additionalReceived.push(receive_item);
                    }
                });
            }

            PI.received_date = PI.supplies_receive_date;
            PI.item_total = itemReceivedTotal;
            PI.additional_item_total = additionalReceivedTotal;

            setAddPI(PI);
            setItemList(itemsReceived);
            setAdditionalItemList(additionalReceived);
            setForwarderValue({
                name: "forwarder_id",
                label: PI.forwarder_name,
                value: PI.forwarder_id,
            });
            setTypeValue({
                name: "type",
                label: PI.type,
                value: PI.type,
            });
            setSubtotal(parseFloat(PI.subtotal));
            setFreightCost(PI.freight_cost);
            setDiscount(PI.discount);
            setGrandTotal(PI.grand_total);
        }
    }

    async function fetchForwarders() {
        setForwarders([]);

        const response = await getAllForwarders();
        var forwarders = response.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        forwarders.map((forwarder) => {
            var info = {};

            info.name = "forwarder_id";
            info.label = forwarder.name;
            info.value = forwarder.id;

            setForwarders((prev) => [...prev, info]);
        });
    }

    // DATA FETCHING
    React.useEffect(() => {
        if (edit) {
            fetchPI();
        } else if (add) {
            fetchPO();
        }
        fetchForwarders();
        fetchBranches();
    }, []);

    // FOR DYNAMIC CALCULATION
    React.useEffect(() => {
        var calcSubtotal = 0;
        var tempFreightCost = freightCost ? parseFloat(freightCost) : 0;
        var tempDiscount = discount ? parseFloat(discount) : 0;

        if (itemList && !additionalItemList) {
            calcSubtotal = itemList
                .map((item) => parseFloat(item.amount))
                .reduce((a, b) => a + b, 0);
        } else if (!itemList && additionalItemList) {
            calcSubtotal = additionalItemList
                .map((item) => parseFloat(item.amount))
                .reduce((a, b) => a + b, 0);
        } else if (itemList && additionalItemList) {
            var itemListSubtotal = itemList
                .map((item) => parseFloat(item.amount))
                .reduce((a, b) => a + b, 0);
            var additionalItemListSubtotal = additionalItemList
                .map((item) => parseFloat(item.amount))
                .reduce((a, b) => a + b, 0);

            calcSubtotal = itemListSubtotal + additionalItemListSubtotal;
        }
        setSubtotal(calcSubtotal);
        setGrandTotal(calcSubtotal + tempFreightCost - tempDiscount);
    }, [isChanged, freightCost, discount]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"SUPPLIES"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                {/* header */}
                <div className="d-flex justify-content-between align-items-center my-3 pb-4 d-flex-responsive">
                    <div>
                        <h1 className="page-title mb-1">
                            {add ? "ADD " : "EDIT "}PURCHASE INVOICE
                        </h1>
                        <h5 className="page-subtitle mb-0">Supplies Expense</h5>
                    </div>
                    <div className="PI-header2">
                        <span className="me-5">PURCHASE ORDER NO.</span>
                        <span>{add ? po_id : addPI.se_id}</span>
                    </div>
                </div>

                {/* content */}
                <div className="edit-form">
                    <Fragment>
                        <Row className="pt-3 mb-2">
                            <Col xs={6}>
                                <span className="edit-label">
                                    Supplier Name
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Purchase Date
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Received Date
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6}>
                                <Form.Control
                                    type="text"
                                    name="supplier_name"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        addPI.supplier_name ?
                                            addPI.supplier_name
                                                : addPI.supplier_trade_name ?
                                                    addPI.supplier_trade_name
                                                    : addPI.vendor_name ?
                                                        addPI.vendor_name
                                                        : addPI.vendor_trade_name
                                    }
                                    disabled
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="purchase_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={addPI.purchase_date}
                                    disabled
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="received_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={addPI.received_date}
                                    onChange={(e) => handleAddChange(e)}
                                />
                                <InputError
                                    isValid={isError.received_date}
                                    message={"Received date is required"}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col xs={4}>
                                <span className="edit-label">Branch</span>
                            </Col>
                            <Col xs={4}>
                                <span className="edit-label">Forwarder</span>
                            </Col>
                            <Col xs={4}>
                                <span className="edit-label">
                                    Type{" "}
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                {add && (
                                    <Form.Control
                                    type="text"
                                    name="branch_name"
                                    className="nc-modal-custom-text"
                                    defaultValue={addPI.branch_name}
                                    disabled
                                />
                                )}
                                {edit && (
                                    <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchValue}
                                    options={branches}
                                    onChange={(e) => handleBranchChange(e)}
                                />
                                )}
                            </Col>
                            <Col xs={4}>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Forwarder..."
                                    value={forwarderValue}
                                    options={forwarders}
                                    onChange={(e) => handleForwarderChange(e)}
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
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col xs={4}>
                                <span className="edit-label">Waybill No.</span>
                            </Col>
                            <Col xs={4}>
                                <span className="edit-label">Invoice No.</span>
                            </Col>
                            <Col xs={4}>
                                <span className="edit-label">DR No.</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <Form.Control
                                    type="text"
                                    name="waybill_no"
                                    className="nc-modal-custom-text"
                                    value={addPI.waybill_no}
                                    onChange={(e) => handleAddChange(e)}
                                />
                            </Col>
                            <Col xs={4}>
                                <Form.Control
                                    type="text"
                                    name="invoice_no"
                                    className="nc-modal-custom-text"
                                    value={addPI.invoice_no}
                                    onChange={(e) => handleAddChange(e)}
                                />
                                <InputError
                                    isValid={isError.invoice_no}
                                    message={
                                        "Either invoice no. or DR no. is required"
                                    }
                                />
                            </Col>
                            <Col xs={4}>
                                <Form.Control
                                    type="text"
                                    name="dr_no"
                                    className="nc-modal-custom-text"
                                    value={addPI.dr_no}
                                    onChange={(e) => handleAddChange(e)}
                                />
                                <InputError
                                    isValid={isError.dr_no}
                                    message={
                                        "Either invoice no. or DR no. is required"
                                    }
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    {/* RECEIVED ITEM TABLE */}
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">Received Items</span>
                        <div className="edit-purchased-items">
                            {itemList.length !== 0 ? (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>item</th>
                                            <th>quantity</th>
                                            <th>unit</th>
                                            <th>unit price</th>
                                            <th>total amount</th>
                                            <th>ordered</th>
                                            <th>previously received</th>
                                            <th>balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemList.map((item, index) => {
                                            return (
                                                <tr>
                                                    <td>{item.name}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            name="qtyInput"
                                                            defaultValue={parseFloat(
                                                                item.qty
                                                            )}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    e,
                                                                    index
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>{item.unit}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            name="price"
                                                            defaultValue={parseFloat
                                                                (item.price)
                                                            }
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    e,
                                                                    index
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="color-green">
                                                        PHP{" "}
                                                        {numberFormat(
                                                            item.amount
                                                        )}
                                                    </td>
                                                    <td className="color-green">
                                                        {item.qty}
                                                    </td>
                                                    <td className="color-green">
                                                        {item.received_qty ||
                                                            "0"}
                                                    </td>
                                                    <td className="color-green">
                                                        {item.qty &&
                                                        item.received_qty
                                                            ? parseFloat(
                                                                  item.qty
                                                              ) -
                                                              parseFloat(
                                                                  item.received_qty
                                                              )
                                                            : "0"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="entries-not-found">
                                    There is no received items recorded.
                                </div>
                            )}
                        </div>
                    </Row>

                    {/* ADDITIONAL PURCHASED ITEM TABLE */}
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">
                            Additional Purchased Items
                        </span>
                        <div className="edit-purchased-items">
                            {additionalItemList.length !== 0 ? (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th className="color-gray">item</th>
                                            <th className="color-gray">
                                                quantity
                                            </th>
                                            <th className="color-gray">unit</th>
                                            <th className="color-gray">
                                                unit price
                                            </th>
                                            <th className="color-gray">
                                                amount
                                            </th>
                                            <th className="color-gray">
                                                actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {additionalItemList.map(
                                            (item, index) => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                name="name"
                                                                defaultValue={
                                                                    item.name
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="qtyInput"
                                                                defaultValue={
                                                                    item.qty
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                name="unit"
                                                                value={
                                                                    item.unit
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="price"
                                                                defaultValue={
                                                                    item.price
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="color-green">
                                                            {item.qtyInput &&
                                                            item.price
                                                                ? numberFormat(
                                                                      item.price *
                                                                          item.qtyInput
                                                                  )
                                                                : "0.00"}
                                                        </td>
                                                        <td className="text-center">
                                                            <img
                                                                src={trash}
                                                                onClick={() =>
                                                                    handleDelRow(
                                                                        index
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="entries-not-found">
                                    There is no additional purchased items
                                    recorded yet.
                                </div>
                            )}
                        </div>
                    </Row>

                    {/* ADD ITEM BUTTON */}
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => handleAddNewRow()}>
                            Add Item
                        </Button>
                    </Row>

                    {/* SUBTOTAL, FREIGHT COST, DISCOUNT, & GRAND TOTAL */}
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Subtotal
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3} className="text-end">
                            <span className="edit-label align-middle">
                                {numberFormat(subtotal)}
                            </span>
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Freight Cost
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="freight_cost"
                                value={addPI.freight_cost}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Discount
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="discount"
                                value={addPI.discount}
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Grand Total
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3} className="text-end">
                            <span className="edit-label align-middle">
                                {numberFormat(grandTotal)}
                            </span>
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
                                value={addPI.remarks}
                                className="nc-modal-custom-text"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>

                    {/* FOOTER: CANCEL & SUBMIT BUTTONS */}
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate("/se/purchaseinvoices")}
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

SEFormPurchaseInvoice.defaultProps = {
    add: false,
    edit: false,
};

export default SEFormPurchaseInvoice;
