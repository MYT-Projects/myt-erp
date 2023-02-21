import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import ReactLoading from "react-loading";
// api
import { getPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";
import { getAllItems } from "../../../../Helpers/apiCalls/itemsApi";
import {
    createInvoice,
    getInvoice,
    updateInvoice,
} from "../../../../Helpers/apiCalls/Purchases/purchaseInvoiceApi";

// assets & styles
import {
    getTodayDateISO,
    numberFormat,
    numberFormatInt,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import trash from "./../../../../Assets/Images/trash.png";
import Navbar from "../../../../Components/Navbar/Navbar";
import "./../../PurchaseOrders/PurchaseOrders.css";
import "./../PurchaseInvoices.css";
import { Fragment } from "react";
import {
    createInvoicePotato,
    getInvoicePotato,
    updateInvoicePotato,
} from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseInvoiceApi";
import { getPurchaseOrderPotato } from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import InputError from "../../../../Components/InputError/InputError";
import { validateFormPurchaseInvoice } from "../../../../Helpers/Validation/Purchase/PurchaseInvoiceValidation";

/**
 *  -- COMPONENT: FORM TO ADD OR EDIT PURCHASE INVOICE
 */
function FormPurchaseInvoice({ add, edit }) {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isChanged, setIsChanged] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    /**
     *  @po_id - param for add purchase invoice form
     *  @pi_id - param for edit purchase invoice form
     */
    const { po_id, pi_id, shopType } = useParams();

    // PURCHASE INVOICE DETAILS HANDLER
    const [addPI, setAddPI] = useState({});
    const [itemList, setItemList] = useState([]);
    const [additionalItemList, setAdditionalItemList] = useState([]);
    const [subtotal, setSubtotal] = useState("0");
    const [freightCost, setFreightCost] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [serviceFee, setServiceFee] = useState("0");
    const [grandTotal, setGrandTotal] = useState("0");

    // DATA HANDLERS
    const [forwarders, setForwarders] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [allIngredients, setAllIngredients] = useState([]);

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        received_date: false,
        invoice_no: false,
        dr_no: false,
        // items
        received_items_table: false,
        qtyInput: false,
        price: false,
        item_id: false,
        qty: false,
        addtl_price: false, 
    });

    // SELECT DROPSEARCH HANDLERS
    const [forwarderValue, setForwarderValue] = useState({
        name: "forwarder_id",
        label: "",
        value: "",
    });

    function handleForwarderChange(e) {
        var newList = addPI;
        newList[e.name] = e.value;
        setAddPI(newList);
        setForwarderValue({ name: e.name, label: e.label, value: e.value });
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
        } else if (name === "service_fee") {
            setServiceFee(value);
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
        setItemList([...itemList]);
        setTimeout(() => setIsChanged(false), 1);
    }

    function handleAddNewRow() {
        const newItem = { item_name: "", qtyInput: "1", unit: "", price: "" };
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
        var item = value.split("|");
        var temp = additionalItemList;

        if (name === "item_id") {
            var ingredient_id = item[0];
            var unit_id = item[1];
            var unit = item[2];
            var qty = item[3] === "null" ? 0 : parseFloat(item[3]);
            var price = item[4] === "null" ? 0 : parseFloat(item[4]);
            var type = item[5];

            temp.map((item, index) => {
                var info = item;
                if (index === id) {
                    info.item_id = ingredient_id;
                    info.unit = unit;
                    info.price = price;
                    info.amount = info.qty * info.price;
                    info.type = type;
                }
                return info;
            });

            setShowLoader(true);
        } else if (name === "qty" || name === "price") {
            setShowLoader(true);
            temp.map((item, index) => {
                if (index === id) {
                    item[name] = value;
                    item.amount = item.qty * item.price;

                    return item;
                }
            });
        } else {
            temp.map((item, index) => {
                if (index === id) {
                    item[name] = value;
                    item.amount = item.qty * item.price;

                    return item;
                }
            });
        }
        setAdditionalItemList(temp);
        setIsChanged(!isChanged);
        setTimeout(() => setShowLoader(false), 1);
    }

    async function handleCreatePI() {
        const allItems = [];
        itemList.map((item) => {
            var info = item;
            info.po_item_id = item.id;
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
        if (isClicked) {
            return;
        }
        if (shopType === "mango") {
            if (
                validateFormPurchaseInvoice(
                    addPI,
                    itemList,
                    additionalItemList,
                    setIsError
                )
            ) {
                setIsClicked(true);
                const response = await createInvoice(addPI, allItems, po_id);

                if (response.data) {
                    if (response.data.status === "error") {
                        TokenExpiry(response);
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                    } else if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(
                            () =>
                                navigate(
                                    "/purchaseinvoices/print/" +
                                        response.data.receive_id +
                                        "/" +
                                        shopType
                                ),
                            1000
                        );
                    }
                }
            } else {
                setIsClicked(false);
            }
        } else if (shopType === "potato") {
            if (
                validateFormPurchaseInvoice(
                    addPI,
                    itemList,
                    additionalItemList,
                    setIsError
                )
            ) {
                setIsClicked(true);
                const response = await createInvoicePotato(
                    addPI,
                    allItems,
                    po_id
                );
                if (response.data) {
                    if (response.data.status === "error") {
                        TokenExpiry(response);
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                        setIsClicked(false);
                    } else if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(
                            () =>
                                navigate(
                                    "/purchaseinvoices/print/" +
                                        response.data.receive_id +
                                        "/" +
                                        shopType
                                ),
                            1000
                        );
                    }
                } else if (response.error) {
                }
            } else {
                setIsClicked(false);
            }
        }
    }

    async function handleUpdatePI() {
        const allItems = [];

        itemList.map((item) => {
            var info = item;
            info.id = item.id;
            info.qtyInput = item.qtyInput ? item.qtyInput : item.remaining_qty;
            allItems.push(info);
        });
        if (additionalItemList.length > 0) {
            additionalItemList.map((item) => {
                var info = item;
                info.qtyInput = item.qtyInput;
                info.po_item_id = "0";
                allItems.push(info);
            });
        }
        if (isClicked) {
            return;
        }
        if (shopType === "mango") {
            if (
                validateFormPurchaseInvoice(
                    addPI,
                    itemList,
                    additionalItemList,
                    setIsError
                )
            ) {
                setIsClicked(true);
                const response = await updateInvoice(addPI, allItems, pi_id);

                if (response.data) {
                    if (response.data.status === "error") {
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                        TokenExpiry(response);
                    } else if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => navigate("/purchaseinvoices"), 1000);
                    }
                }
            } else {
                setIsClicked(false);
            }
        } else if (shopType === "potato") {
            if (
                validateFormPurchaseInvoice(
                    addPI,
                    itemList,
                    additionalItemList,
                    setIsError
                )
            ) {
                setIsClicked(true);
                const response = await updateInvoicePotato(
                    addPI,
                    allItems,
                    pi_id
                );

                if (response.data) {
                    if (response.data.status === "error") {
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                        TokenExpiry(response);
                    } else if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => navigate("/purchaseinvoices"), 1000);
                    }
                }
            } else {
                setIsClicked(false);
            }
        }
    }

    const handleSubmit = () => {
        if (add) handleCreatePI();
        else if (edit) handleUpdatePI();
    };

    /** FOR ADD - Fetch Purchase Order Details */
    async function fetchPO() {
        setAddPI({});
        setItemList([]);
        setIsChanged(true);


        if (shopType === "mango") {
            const response = await getPurchaseOrder(po_id);

            if (response.error) {
                TokenExpiry(response);
            } else {
                var PO = response.response.data[0];
                PO.received_date = getTodayDateISO();
                PO.purchase_date = PO.purchase_date.split(" ")[0];
                PO.discount = PO.discount ? PO.discount : "0"
                PO.service_fee = PO.service_fee ? PO.service_fee : "0"

                PO.item_total = PO.purchase_items
                    .map((item) => item.amount)
                    .reduce((a, b) => parseInt(a) + parseInt(b), 0);

                var receivedItems = PO.purchase_items.map((item) => {
                    var info = item;
                    info.amount = parseFloat(info.qty) * parseFloat(info.price);
                    info.qtyInput = item.remaining_qty;
                    return info;
                });
                PO.remarks = "";
                PO.invoice_no = "";
                PO.dr_no = "";

                setAddPI(PO);
                setSubtotal(PO.item_total);
                setDiscount(PO.discount);
                setServiceFee(PO.service_fee);
                setGrandTotal(PO.item_total);
                setItemList(receivedItems);
                setForwarderValue({
                    name: "forwarder_id",
                    label: PO.forwarder_name,
                    value: PO.forwarder_id,
                });
            }
        } else if (shopType === "potato") {
            const response = await getPurchaseOrderPotato(po_id);

            if (response.error) {
                TokenExpiry(response);
            } else {
                var PO = response.response.data[0];
                PO.received_date = getTodayDateISO();
                PO.purchase_date = PO.purchase_date.split(" ")[0];
                PO.discount = PO.discount ? PO.discount : "0"
                PO.service_fee = PO.service_fee ? PO.service_fee : "0"

                PO.item_total = PO.purchase_items
                    .map((item) => item.amount)
                    .reduce((a, b) => parseInt(a) + parseInt(b), 0);

                var receivedItems = PO.purchase_items.map((item) => {
                    var info = item;
                    info.amount = parseFloat(info.qty) * parseFloat(info.price);
                    info.qtyInput = item.remaining_qty;
                    return info;
                });
                PO.remarks = "";
                PO.invoice_no = "";
                PO.dr_no = "";
                setAddPI(PO);
                setSubtotal(PO.item_total);
                setDiscount(PO.discount);
                setServiceFee(PO.service_fee);
                setGrandTotal(PO.item_total);
                setItemList(receivedItems);
                setForwarderValue({
                    name: "forwarder_id",
                    label: PO.forwarder_name,
                    value: PO.forwarder_id,
                });
            }
        }
        setTimeout(() => setIsChanged(false), 1);

    }

    /** FOR EDIT - Fetch Purchase Invoice Details */
    async function fetchPI() {
        if (shopType === "mango") {
            const response = await getInvoice(pi_id);
            if (response.data) {
                var PI = response.data.data[0];

                var itemsReceived = [];
                var additionalReceived = [];

                var itemReceivedTotal = 0;
                var additionalReceivedTotal = 0;

                if (PI.receive_items) {
                    PI.receive_items = PI.receive_items.map((receive_item) => {
                        var item = receive_item;
                        item.amount = receive_item.total;
                        item.qtyInput = receive_item.qty;
                        return item;
                    });

                    PI.receive_items.map((receive_item) => {
                        var item = receive_item;

                        if (item.po_item_id !== "0") {
                            itemReceivedTotal =
                                itemReceivedTotal + parseFloat(item.total);
                            itemsReceived.push(item);
                        } else {
                            item.qtyInput = item.qty;
                            additionalReceivedTotal =
                                additionalReceivedTotal +
                                parseFloat(item.total);
                            additionalReceived.push(item);
                        }
                    });
                }

                PI.received_date = PI.receive_date;
                PI.supplier_trade_name = PI.supplier_name;
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
                setSubtotal(parseFloat(PI.subtotal));
                setFreightCost(PI.freight_cost);
                setDiscount(PI.discount);
                setServiceFee(PI.service_fee);
                setGrandTotal(PI.grand_total);
            } else {
                TokenExpiry(response);
            }
        } else if (shopType === "potato") {
            const response = await getInvoicePotato(pi_id);
            if (response.data) {
                var PI = response.data.data[0];

                var itemsReceived = [];
                var additionalReceived = [];

                var itemReceivedTotal = 0;
                var additionalReceivedTotal = 0;

                if (PI.receive_items) {
                    PI.receive_items = PI.receive_items.map((receive_item) => {
                        var item = receive_item;
                        item.amount = receive_item.total;
                        return item;
                    });

                    PI.receive_items.map((receive_item) => {
                        var item = receive_item;

                        if (item.po_item_id !== "0") {
                            itemReceivedTotal =
                                itemReceivedTotal + parseFloat(item.total);
                            itemsReceived.push(item);
                        } else {
                            item.qtyInput = item.qty;
                            additionalReceivedTotal =
                                additionalReceivedTotal +
                                parseFloat(item.total);
                            additionalReceived.push(item);
                        }
                    });
                }

                PI.received_date = PI.receive_date;
                PI.supplier_trade_name = PI.supplier_name;
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
                setSubtotal(parseFloat(PI.subtotal));
                setFreightCost(PI.freight_cost);
                setDiscount(PI.discount);
                setServiceFee(PI.service_fee);
                setGrandTotal(PI.grand_total);
            } else {
                TokenExpiry(response);
            }
        }
    }

    async function fetchForwarders() {
        setForwarders([]);

        const response = await getAllForwarders();

        if (response.data) {
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
        } else {
            TokenExpiry(response);
        }
    }

    async function fetchIngredients() {
        setIngredients([]);

        const response = await getAllItems();
        if (response.response.data) {
            var ingredients = response.response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );
            setAllIngredients(ingredients);

            var cleanedItems = ingredients.map((ing) => {
                var info = {};
                info.name = "item_id";
                info.label = ing.name;
                info.value = ing.id;
                return info;
            });
            setIngredients(cleanedItems);
        } else {
            TokenExpiry(response);
        }
    }

    // DATA FETCHING
    React.useEffect(() => {
        if (edit) {
            fetchPI();
        } else if (add) {
            fetchPO();
        }
        fetchForwarders();
        fetchIngredients();
    }, []);

    // FOR DYNAMIC CALCULATION
    React.useEffect(() => {
        var calcSubtotal = 0;
        var tempFreightCost = freightCost ? parseFloat(freightCost) : 0;
        var tempDiscount = discount ? parseFloat(discount) : 0;
        var tempServiceFee = addPI.service_fee
            ? parseFloat(addPI.service_fee)
            : 0;

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
        setGrandTotal((calcSubtotal + tempFreightCost + tempServiceFee) - tempDiscount);
    }, [isChanged, freightCost, discount, serviceFee]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PURCHASES"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                {/* header */}
                <div className="d-flex justify-content-between align-items-center my-3 pb-4">
                    <h1 className="page-title mb-0">
                        {add ? "ADD " : "EDIT "}PURCHASE INVOICE
                    </h1>
                    <div className="PI-header2">
                        <span className="me-5">PURCHASE ORDER NO.</span>
                        <span>{add ? po_id : addPI.po_id}</span>
                    </div>
                </div>

                {/* content */}
                <div className="edit-form">
                    {/* PURCHASE INVOICE DETAILS */}
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
                                    name="supplier_trade_name"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        addPI.supplier_trade_name
                                            ? addPI.supplier_trade_name
                                            : addPI.vendor_name
                                            ? addPI.vendor_name
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
                            <Col xs={6}>
                                <span className="edit-label">Branch</span>
                            </Col>
                            <Col xs={6}>
                                <span className="edit-label">Forwarder</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6}>
                                <Form.Control
                                    type="text"
                                    name="branch_name"
                                    className="nc-modal-custom-text"
                                    defaultValue={addPI.branch_name}
                                    disabled
                                />
                            </Col>
                            <Col xs={6}>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Forwarder..."
                                    value={forwarderValue}
                                    options={forwarders}
                                    onChange={(e) => handleForwarderChange(e)}
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
                                    required
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
                                                    <td>{item.item_name}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            name="qtyInput"
                                                            defaultValue={
                                                                add
                                                                    ? parseInt(
                                                                          item.remaining_qty
                                                                      )
                                                                    : parseInt(
                                                                          item.qtyInput
                                                                      )
                                                            }
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    e,
                                                                    index
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            isValid={
                                                                isError.qtyInput
                                                            }
                                                            message={
                                                                "Qty is required"
                                                            }
                                                        />
                                                    </td>
                                                    <td>{item.unit}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            name="price"
                                                            defaultValue={parseFloat(
                                                                item.price
                                                            ).toFixed(2)}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    e,
                                                                    index
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            isValid={
                                                                isError.price
                                                            }
                                                            message={
                                                                "Price is required"
                                                            }
                                                        />
                                                    </td>
                                                    <td className="color-green">
                                                        PHP{" "}
                                                        {item.amount
                                                            ? numberFormat(
                                                                  parseFloat(
                                                                      item.amount
                                                                  ).toFixed(2)
                                                              )
                                                            : "0"}
                                                    </td>
                                                    <td>
                                                        {item.qty
                                                            ? (
                                                                  parseInt(
                                                                      item.qty
                                                                  )
                                                              )
                                                            : "0"}
                                                    </td>
                                                    <td>
                                                        {item.received_qty
                                                            ? (
                                                                  item.received_qty
                                                              )
                                                            : "0"}
                                                    </td>
                                                    <td>
                                                        {item.remaining_qty
                                                            ? (
                                                                  item.remaining_qty
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

                    {/* ADDITIONAL RECEIVED ITEM TABLE */}
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">
                            Additional Received Items
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
                                                            <select
                                                                className="item-select"
                                                                name="item_id"
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                <option
                                                                    value=""
                                                                    hidden
                                                                >
                                                                    Select Item
                                                                </option>
                                                                {allIngredients.map((data, key) =>
                                                                        data.item_units.length > 0 ? (
                                                                            data.item_units.map((item_unit, key1) => (
                                                                                    <option
                                                                                        key={key1}
                                                                                        value={
                                                                                            data.id +
                                                                                            "|" +
                                                                                            item_unit.id +
                                                                                            "|" +
                                                                                            item_unit.inventory_unit +
                                                                                            "|" +
                                                                                            item_unit.order_qty +
                                                                                            "|" +
                                                                                            item_unit.price +
                                                                                            "|" +
                                                                                            data.type
                                                                                        }
                                                                                        selected={
                                                                                            data.id ===
                                                                                            item.item_id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            data.name
                                                                                        }{" "}
                                                                                        -{" "}
                                                                                        {
                                                                                            item_unit.inventory_unit
                                                                                        }
                                                                                    </option>
                                                                                )
                                                                            )
                                                                        ) : (
                                                                            <option
                                                                                value={
                                                                                    data.id
                                                                                }
                                                                                selected={
                                                                                    data.id ===
                                                                                    item.item_id
                                                                                }
                                                                            >
                                                                                {
                                                                                    data.name
                                                                                }
                                                                            </option>
                                                                        )
                                                                )}
                                                            </select>
                                                            <InputError
                                                                isValid={
                                                                    isError.item_id
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
                                                                value={parseInt(
                                                                    item.qty
                                                                )}
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                isValid={
                                                                    isError.qty
                                                                }
                                                                message={
                                                                    "Qty is required"
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
                                                                disabled
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="price"
                                                                defaultValue={parseFloat(
                                                                    item.price
                                                                ).toFixed(2)}
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                isValid={
                                                                    isError.addtl_price
                                                                }
                                                                message={
                                                                    "Price is required"
                                                                }
                                                            />
                                                        </td>
                                                        <td className="color-green">
                                                            {item.qty &&
                                                            item.price
                                                                ? "PHP " +
                                                                  numberFormat(
                                                                      item.price *
                                                                          item.qty
                                                                  )
                                                                : "PHP 0.00"}
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
                                    There is no additional received items
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
                                Delivery/Service Fee
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="service_fee"
                                value={addPI.service_fee}
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
                            onClick={() => navigate("/purchaseinvoices")}
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

FormPurchaseInvoice.defaultProps = {
    add: false,
    edit: false,
};

export default FormPurchaseInvoice;
