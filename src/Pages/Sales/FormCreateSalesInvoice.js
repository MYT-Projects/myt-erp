import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import ReactLoading from "react-loading";

// api
import { getAllBranches } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllItemsByBranch } from "../../Helpers/apiCalls/itemsApi";

// assets & styles
import {
    getTodayDateISO,
    numberFormat,
    refreshPage,
    toastStyle,
} from "../../Helpers/Utils/Common";
import trash from "./../../Assets/Images/trash.png";
import Navbar from "../../Components/Navbar/Navbar";
import "../Purchases/PurchaseOrders/PurchaseOrders.css";
import "./SalesInvoice.css";
import { Fragment } from "react";
import {
    createSalesInvoice,
    getAllFranchisee,
    getSingleSalesInvoice,
    paySalesInvoice,
    updatePaymentSalesInvoice,
    updateSalesInvoice,
} from "../../Helpers/apiCalls/franchiseeApi";
import { getAllEmployees } from "../../Helpers/apiCalls/employeesApi";
import { getSingleBranch } from "../../Helpers/apiCalls/branchApi";
import { getAllBanks } from "../../Helpers/apiCalls/banksAPi";
import { validateFranchiseSalePayment } from "../../Helpers/Validation/Franchise/FranchiseSalePaymentValidation";
import InputError from "../../Components/InputError/InputError";

/**
 *  -- COMPONENT: FORM TO ADD OR EDIT FRANCHISEE SALES INVOICE
 */
function FormCreateSalesInvoice({ add, edit }) {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isChanged, setIsChanged] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    /**
     *  @franchisee_sale_id - param for edit purchase invoice form
     */
    const { franchisee_sale_id } = useParams();

    // CREATE FRANCHISEE INVOICE
    const [franchiseeInvoice, setFranchiseeInvoice] = useState({
        franchisee_id: "",
        sales_date: getTodayDateISO(),
        order_request_date: "",
        delivery_date: getTodayDateISO(),
        seller_branch_id: "",
        buyer_branch_id: "",
        sales_invoice_no: "",
        franchise_order_no: "",
        transfer_slip_no: "",
        address: "",
        remarks: "",
        sales_staff: "",
        item_ids: [],
        units: [],
        prices: [],
        quantities: [],
        discounts: [],
        buyer_branch_addr: "",
        seller_branch_addr: "",
        ship_via: "",
    });

    // CREATE PAYMENT
    const [franchiseeInvoicePayment, setFranchiseeInvoicePayment] = useState({
        franchisee_id: "",
        franchisee_sale_id: "",
        payment_type: "cash",
        payment_date: getTodayDateISO(),
        remarks: "",
        bank_name: "",
        cheque_number: "",
        cheque_date: "",
        reference_number: "",
        transaction_number: "",
        payment_description: "",
        term_day: "",
        delivery_address: "",
        grand_total: "",
        subtotal: "",
        service_fee: "0",
        delivery_fee: "0",
        withholding_tax: "0",
        to_bank_id: "",
        from_bank_id: "",
    });

    const [isError, setIsError] = useState({
        payment_method: false,
        payment_date: false,
        bank_name: false,
        cheque_number: false,
        cheque_date: false,
        reference_number: false,
        invoice_no: false,
        to_bank_id: false,
    });

    // DATA HANDLERS
    const [banks, setBanks] = useState([]);
    const [depositedTo, setDepositedTo] = useState([]);
    const [salesStaff, setSalesStaff] = useState([]);
    const [sellerBranches, setSellerBranches] = useState([]);
    const [buyerBranches, setBuyerBranches] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [showItem, setShowItem] = useState(false);

    // SELECT DROPSEARCH HANDLERS
    const [bankValue, setBankValue] = useState({
        name: "from_bank_id",
        label: "",
        value: "",
    });
    const [depositedToValue, setDepositedToValue] = useState({
        name: "to_bank_id",
        label: "",
        value: "",
    });
    const [buyerBranchValue, setBuyerBranchValue] = useState({
        name: "buyer_branch_id",
        label: "",
        value: "",
    });
    const [sellerBranchValue, setSellerBranchValue] = useState({
        name: "seller_branch_id",
        label: "",
        value: "",
    });
    const [salesStaffValue, setSalesStaffValue] = useState({
        name: "sales_staff",
        label: "",
        value: "",
    });
    const [exceed, setExceed] = useState(false);

    function handleSelectChange(e) {
        var newList = franchiseeInvoice;
        newList[e.name] = e.value;

        switch (e.name) {
            case "from_bank_id":
                setBankValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                newList.from_bank_id = e.value;
                break;
            case "to_bank_id":
                setDepositedToValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                newList.to_bank_id = e.value;
                break;
            case "seller_branch_id":
                setSellerBranchValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                setSalesStaffValue([]);

                if (e.value === "1") {
                    setSalesStaffValue({
                        name: "sales_staff",
                        label: "Antonette Varona",
                        value: "4",
                    });
                    newList.sales_staff = "4";
                } else if (e.value === "2") {
                    setSalesStaffValue({
                        name: "sales_staff",
                        label: "Maria Angelica Colis",
                        value: "7",
                    });
                    newList.sales_staff = "7";
                } else {
                    setSalesStaffValue([]);
                }

                break;
            case "buyer_branch_id":
                setBuyerBranchValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                var val = e.value.split("|");
                newList.franchisee_id = val[0];
                newList.buyer_branch_id = val[1];
                break;
            case "sales_staff":
                setSalesStaffValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                break;
        }
        setFranchiseeInvoice(newList);
        setFranchiseeInvoicePayment(newList);
    }

    function handleCreateInvoice(e) {
        const newList = { ...franchiseeInvoice };
        const { name, value } = e.target;
        newList[name] = value;
        setFranchiseeInvoice(newList);
    }

    function handleCreatePayment(e) {
        const paymentInfo = { ...franchiseeInvoicePayment };
        const { name, value, id } = e.target;
        if (name === "service_fee" || name === "delivery_fee") {
            const paymentEdit = { ...franchiseeInvoice };
            paymentEdit[name] = value;
            setFranchiseeInvoice(paymentEdit);
            setIsChanged(!isChanged);
        }

        if (name === "to_bank_id" || name === "from_bank_id") {
            paymentInfo[name] = value;
        } else {
            paymentInfo[name] = value;
        }
        setFranchiseeInvoicePayment(paymentInfo);
    }

    /**
     *  ORDER ITEMS
     */
    const [orderItems, setOrderItems] = useState([]);
    function addNewOrder() {
        const newItem = {
            qty: "",
            unit: "",
            item_id: "",
            price: "",
            unit_discount: "0",
            total: "0.00",
        };
        setOrderItems((oldItems) => [...oldItems, newItem]);
    }
    function deleteOrder(row) {
        const updatedOrderList = [...orderItems];
        updatedOrderList.splice(row, 1);
        setOrderItems(updatedOrderList);
    }
    function handleOrderItemsChange(e, row, type) {
        setIsChanged(!isChanged);

        var temp = orderItems;

        if (type === "item_id") {
            temp[row].item_id = { label: e.label, value: e.value };
            temp[row].price = e.item_units[0].price;
            temp[row].unit = e.item_units[0].inventory_unit;
            temp[row].current_qty = e.item_units[0].current_qty;
        } else {
            const { name, value } = e.target;
            temp[row][name] = value;

            if (
                name === "qty" ||
                name === "price" ||
                name === "unit_discount"
            ) {
                if (parseInt(temp[row].qty) > parseInt(temp[row].current_qty)) {
                    toast.error(
                        "Quantity exceeds current inventory quantity.",
                        {
                            style: toastStyle(),
                        }
                    );
                    toast.error(
                        temp[row].item_id.label +
                            " current quantity: " +
                            temp[row].current_qty,
                        {
                            style: toastStyle(),
                        }
                    );
                    setExceed(true);
                    var subtotal =
                        temp[row].qty && temp[row].price
                            ? parseFloat(
                                  parseInt(temp[row].qty) *
                                      parseFloat(temp[row].price)
                              ).toString()
                            : "0.00";
                    if (temp[row].unit_discount) {
                        temp[row].total = (
                            parseFloat(subtotal) -
                            parseFloat(temp[row].unit_discount)
                        ).toString();
                    } else {
                        temp[row].total = subtotal;
                    }
                    setExceed(false);
                } else {
                    var subtotal =
                        temp[row].qty && temp[row].price
                            ? parseFloat(
                                  parseInt(temp[row].qty) *
                                      parseFloat(temp[row].price)
                              ).toString()
                            : "0.00";
                    if (temp[row].unit_discount) {
                        temp[row].total = (
                            parseFloat(subtotal) -
                            parseFloat(temp[row].unit_discount)
                        ).toString();
                    } else {
                        temp[row].total = subtotal;
                    }
                    setExceed(false);
                }
            }
            if (name === "unit") {
                var itemInfo = allItems?.filter(
                    (info) => info.id === temp[row].item_id
                );
                var unitInfo = itemInfo[0].item_units?.filter(
                    (info) => info.inventory_unit === value
                );
                temp[row].price = unitInfo[0].previous_item_price;
            }
        }

        setOrderItems(temp);
        setTimeout(() => setIsChanged(false), 1);
    }

    async function handleSubmitInvoice() {
        const response = await createSalesInvoice(
            orderItems,
            franchiseeInvoice
        );
        if (response.data) {
            if (response.data.status === "error") {
                toast.error(response.data.response, { style: toastStyle() });
                setTimeout(() => refreshPage(), 1000);
            } else if (response.data.status === "success") {
                toast.success("Successfully created order request", {
                    style: toastStyle(),
                });
                setTimeout(() => navigate("/salesinvoice"), 1000);
            }
        } else if (response.error) {
            var errMsg = response.error.response.data.messages.error;
            toast.error(errMsg, { style: toastStyle() });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    async function handleUpdatePI() {

        const pay = await paySalesInvoice(
            franchisee_sale_id,
            franchiseeInvoice.franchisee_id,
            franchiseeInvoicePayment,
            franchiseeInvoice.address
        );

        //API THAT UPDATES AND CREATES PAYMENT
        const response = await updateSalesInvoice(
            franchisee_sale_id,
            orderItems,
            franchiseeInvoice
        );
            if (response.data) {
                if (response.data.status === "success") {
                    const pay = await paySalesInvoice(
                        franchisee_sale_id,
                        franchiseeInvoice.franchisee_id,
                        franchiseeInvoicePayment,
                        franchiseeInvoice.address
                    );

                    if (pay.data) {
                        if (pay.data.status === "success") {
                            toast.success(
                                "Successfully created sales invoice with payment",
                                {
                                    style: toastStyle(),
                                }
                            );
                            setTimeout(
                                () =>
                                    navigate(
                                        "/salesinvoice/print/" + franchisee_sale_id
                                    ),
                                1000
                            );
                        }
                    } else if (pay.error.status === "400") {
                        var errMsg = pay.error.response.data.messages.error;
                        toast.error("Enter amount", { style: toastStyle() });
                        setTimeout(() => refreshPage(), 1000);
                    } else {
                        toast.error("Please enter amount", { style: toastStyle() });
                        setTimeout(() => refreshPage(), 1000);
                    }
                }
            } else if (response.error) {
                toast.error("Error updating sales invoice", {
                    style: toastStyle(),
                });
            }
        }

    const handleSubmit = () => {
        if (isClicked) {
            return;
        }
        setIsClicked(true);
        if (add) handleSubmitInvoice();
        else if (edit) handleUpdatePI();
    };

    /** FOR EDIT - Fetch Sales Invoice Details */
    async function fetchFranchiseeInvoice() {
        const response = await getSingleSalesInvoice(franchisee_sale_id);
        if (response.data) {
            var SI = response.data.data[0];
            setFranchiseeInvoice(SI);
            var ordered_items = SI.franchisee_sale_items.map((item) => {
                var info = item;
                info.total =
                    parseFloat(item.price) * parseFloat(item.qty) -
                    parseFloat(item.discount);
                info.unit_discount = item.discount;
                info.item_id = { label: item.item_name, value: item.item_id };
                info.unit = item.unit;
                return info;
            });
            setOrderItems(ordered_items);
            setBankValue({
                name: "bank_id",
                label: SI.bank_name,
                value: SI.bank_id,
            });
            setBuyerBranchValue({
                name: "buyer_branch_id",
                label: SI.buyer_branch_name,
                value: SI.buyer_branch_id,
            });
            setSellerBranchValue({
                name: "seller_branch_id",
                label: SI.seller_branch_name,
                value: SI.seller_branch_id,
            });
            setSalesStaffValue({
                name: "sales_staff",
                label: SI.sales_staff_name,
                value: SI.sales_staff,
            });
            setShowItem(true);
        }
    }

    // FETCH API
    async function fetchAllFranchisees() {
        const response = await getAllFranchisee();
        var franchisees = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = franchisees.map((franchisee) => {
            var info = {};

            info.name = "buyer_branch_id";
            info.label = `${franchisee.name} (${franchisee.branch_name} Branch)`;
            info.value = `${franchisee.id}|${franchisee.branch_id}`;

            return info;
        });
        setBuyerBranches(cleanedArray);
    }
    async function fetchBranches() {
        const response = await getAllBranches();

        setSellerBranches([
            {
                name: "seller_branch_id",
                label: "Warehouse",
                value: "1",
            },
            {
                name: "seller_branch_id",
                label: "Commissary",
                value: "2",
            },
            {
                name: "seller_branch_id",
                label: "Coldlink",
                value: "4",
            },
        ]);
    }

    async function fetchSalesStaff() {
        const response = await getAllEmployees();
        var employees = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = employees.map((employee) => {
            var info = {};

            info.name = "sales_staff";
            info.label = `${employee.first_name} ${employee.last_name}`;
            info.value = employee.id;

            return info;
        });
        setSalesStaff(cleanedArray);
    }
    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.error) {
        } else {
            setBanks(response.data.data);
        }
    }
    async function fetchItemsByBranch(branch_id) {
        setAllItems([]);
        const response = await getAllItemsByBranch(branch_id);

        if (response.response.status === "success") {
            var data = response.response.data
                .sort((a, b) =>
                    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                )
                .map((data) => {
                    return {
                        label: data.name,
                        value: data.id,
                        id: data.id,
                        item_units: data.item_units,
                        type: data.type,
                        detail: data.detail,
                    };
                });
            setAllItems(data);
        }
    }
    async function getFranchiseeAndBranchAddress() {
        const response = await getSingleBranch(
            buyerBranchValue.value.split("|")[1]
        );
        if (response.data) {
            var franchisee_name = response.data.data[0].franchisee_name;
            var delivery_addr = response.data.data[0].address;
            setFranchiseeInvoice((prev) => {
                return {
                    ...prev,
                    franchisee_name: franchisee_name,
                    address: delivery_addr,
                };
            });
            setFranchiseeInvoicePayment((prev) => {
                return {
                    ...prev,
                    delivery_address: delivery_addr,
                };
            });
        }
    }
    useEffect(() => {
        fetchItemsByBranch(sellerBranchValue.value);
    }, [sellerBranchValue]);

    useEffect(() => {
        getFranchiseeAndBranchAddress();
    }, [buyerBranchValue]);

    // FOR DYNAMIC CALCULATION
    useEffect(() => {

        var tempServiceFee = franchiseeInvoice.service_fee
            ? parseFloat(franchiseeInvoice.service_fee)
            : 0;
        var tempDeliveryFee = franchiseeInvoice.delivery_fee
            ? parseFloat(franchiseeInvoice.delivery_fee)
            : 0;

        var _subtotal = orderItems
            .map((item) => parseFloat(item.total))
            .reduce((a, b) => a + b, 0);

        var _withholdingTax = 0;

        var _grandTotal = _subtotal + tempServiceFee + tempDeliveryFee;
        setFranchiseeInvoicePayment((prev) => {
            return {
                ...prev,
                subtotal: _subtotal.toFixed(2),
                withholding_tax: _withholdingTax.toFixed(2),
                grand_total: _grandTotal.toFixed(2),
            };
        });
    }, [isChanged]);

    useEffect(() => {

        var tempServiceFee = franchiseeInvoice.service_fee
            ? parseFloat(franchiseeInvoice.service_fee)
            : 0;
        var tempDeliveryFee = franchiseeInvoice.delivery_fee
            ? parseFloat(franchiseeInvoice.delivery_fee)
            : 0;

        var _subtotal = orderItems
            .map((item) => parseFloat(item.total))
            .reduce((a, b) => a + b, 0);

        var _withholdingTax = 0;

        var _grandTotal = _subtotal + tempServiceFee + tempDeliveryFee;
        setFranchiseeInvoicePayment((prev) => {
            return {
                ...prev,
                subtotal: _subtotal.toFixed(2),
                withholding_tax: _withholdingTax.toFixed(2),
                grand_total: _grandTotal.toFixed(2),
            };
        });
    }, [orderItems]);

    // DATA FETCHING
    useEffect(() => {
        if (edit) {
            fetchFranchiseeInvoice();
        }
        fetchBranches();
        fetchAllFranchisees();
        fetchSalesStaff();
        fetchBanks();
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"FRANCHISE"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                {/* header */}
                <div className="d-flex justify-content-between align-items-center my-3 pb-4">
                    <h1 className="page-title mb-0">
                        CREATE FRANCHISEE SALES INVOICE
                    </h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    <Fragment>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Franchisee Branch
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Available Credit Limit
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Sales Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select franchisee..."
                                    value={buyerBranchValue}
                                    options={buyerBranches}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="current_credit_limit"
                                    defaultValue={franchiseeInvoice.current_credit_limit}
                                    className="nc-modal-custom-text"
                                    
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="sales_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={franchiseeInvoice.sales_date}
                                    onChange={(e) => handleCreateInvoice(e)}
                                    
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Delivery Address
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">Order Date</span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Delivery Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="delivery_address"
                                    value={franchiseeInvoice.address}
                                    className="nc-modal-custom-text"
                                    
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="order_request_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoice.order_request_date
                                    }
                                    onChange={(e) => handleCreateInvoice(e)}
                                    
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="delivery_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoice.delivery_date
                                    }
                                    onChange={(e) => handleCreateInvoice(e)}
                                    
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Release From
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">Release By</span>
                            </Col>
                            <Col>
                                <span className="edit-label">Ship Via</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={sellerBranchValue}
                                    options={sellerBranches}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                            </Col>
                            <Col>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Forwarder..."
                                    value={salesStaffValue}
                                    options={salesStaff}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                            </Col>
                            <Col>
                                <select
                                    className="nc-modal-custom-select"
                                    name="ship_via"
                                    value={franchiseeInvoice.ship_via}
                                    
                                    onChange={(e) => handleCreateInvoice(e)}
                                >
                                    <option value="">Select...</option>
                                    <option value="pick_up">Pick Up</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                            </Col>
                        </Row>

                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Transfer Slip No.
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="transfer_slip_no"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoice.transfer_slip_no
                                    }
                                    onChange={(e) => handleCreateInvoice(e)}
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    {/* ORDER ITEMS */}
                    {showItem && (
                        <Row className="mt-4 pt-3">
                            <Col>
                                <span className="edit-label mb-2">
                                    Items Ordered
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
                                                {orderItems.map(
                                                    (item, index) => {
                                                        return (
                                                            <tr>
                                                                <td>
                                                                    <Form.Control
                                                                        type="text"
                                                                        name="item_name"
                                                                        defaultValue={
                                                                            item.item_name
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleOrderItemsChange(
                                                                                e,
                                                                                index
                                                                            )
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
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleOrderItemsChange(
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
                                                                        defaultValue={
                                                                            item.unit
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleOrderItemsChange(
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
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleOrderItemsChange(
                                                                                e,
                                                                                index
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td className="color-green">
                                                                    {numberFormat(
                                                                        item.total
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="entries-not-found">
                                            There is no ordered items yet.
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}

                    {/* ADD ITEM BUTTON */}
                    <Row className="pt-3 PO-add-item">
                        <Button
                            type="button"
                            disabled={!franchiseeInvoice.seller_branch_id}
                            onClick={() => addNewOrder()}
                        >
                            Add Item
                        </Button>
                    </Row>

                    <Fragment>
                        <Row className="align-right pt-3">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray">
                                    Subtotal
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3} className="text-end">
                                <span className="edit-label align-middle">
                                    {numberFormat(
                                        franchiseeInvoicePayment.subtotal
                                    )}
                                </span>
                            </Col>
                        </Row>
                        <Row className="align-right pt-3">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray">
                                    Service Fee
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="number"
                                    name="service_fee"
                                    defaultValue={franchiseeInvoice.service_fee}
                                    className="align-middle nc-modal-custom-text"
                                />
                            </Col>
                        </Row>
                        <Row className="align-right pt-3">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray">
                                    Delivery Fee
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="number"
                                    name="delivery_fee"
                                    defaultValue={
                                        franchiseeInvoice.delivery_fee
                                    }
                                    className="align-middle nc-modal-custom-text"
                                />
                            </Col>
                        </Row>
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
                                        franchiseeInvoicePayment.grand_total
                                    )}
                                </span>
                            </Col>
                        </Row>
                        {edit && (
                            <>
                                <Row className="align-right pt-3">
                                    <Col xs={2} className="text-end">
                                        <span className="edit-label color-gray">
                                            Payment Type
                                        </span>
                                    </Col>
                                    <Col xs={1} className="text-end"></Col>
                                    <Col xs={3}>
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
                                            defaultChecked={
                                                franchiseeInvoicePayment.payment_type ===
                                                "others"
                                            }
                                            type="radio"
                                            onClick={(e) => {
                                                handleCreatePayment(e);
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row className="align-right pt-3">
                                    <Col xs={2} className="text-end">
                                        <span className="edit-label color-gray">
                                            Paid Amount
                                            <span className="color-red">
                                                {" "}
                                                *
                                            </span>
                                        </span>
                                    </Col>
                                    <Col xs={1} className="text-end">
                                        <span className="edit-label align-middle">
                                            PHP
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <Form.Control
                                            type="number"
                                            name="paid_amount"
                                            className="align-middle nc-modal-custom-text"
                                            onChange={(e) =>
                                                handleCreatePayment(e)
                                            }
                                        />
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Fragment>
                    {edit && (
                        <>
                            {franchiseeInvoicePayment.payment_type ===
                                "cash" && (
                                <>
                                    <div className="mt-5"></div>
                                    <hr />
                                    <div className="payment-header-wrapper mb-5">
                                        <h5 className="payment-header">
                                            Payment Details
                                        </h5>
                                    </div>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Payment Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.payment_date}
                                                message={
                                                    "Payment date is required"
                                                }
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
                                                value={
                                                    franchiseeInvoicePayment.invoice_no
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.invoice_no}
                                                message={
                                                    "Invoice Number is required"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Deposited To
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                name="term_day"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoicePayment.term_day
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                defaultValue={
                                                    franchiseeInvoicePayment.remarks
                                                }
                                                className="nc-modal-custom-text"
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* CHECK PAYMENT DETAILS */}
                            {franchiseeInvoicePayment.payment_type ===
                                "check" && (
                                <>
                                    <div className="mt-5"></div>
                                    <hr />
                                    <div className="payment-header-wrapper mb-5">
                                        <h5 className="payment-header">
                                            Payment Details
                                        </h5>
                                    </div>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Payment Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Invoice Number
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Check Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="invoice_no"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoicePayment.invoice_no
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.invoice_no}
                                                message={
                                                    "Invoice Number is required"
                                                }
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="date"
                                                name="cheque_date"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoicePayment.cheque_date
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.cheque_date}
                                                message={
                                                    "Check date is required"
                                                }
                                            />
                                        </Col>
                                    </Row>

                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Bank Name
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Check Number
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.bank_name}
                                                message={"Bank is required"}
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.cheque_number}
                                                message={
                                                    "Check number is required"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Deposited To
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                isValid={isError.to_bank_id}
                                                message={
                                                    "Check number is required"
                                                }
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
                                                defaultValue={
                                                    franchiseeInvoicePayment.term_day
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                defaultValue={
                                                    franchiseeInvoicePayment.remarks
                                                }
                                                className="nc-modal-custom-text"
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* OTHERS PAYMENT DETAILS */}
                            {franchiseeInvoicePayment.payment_type ===
                                "others" && (
                                <>
                                    <div className="mt-5"></div>
                                    <hr />
                                    <div className="payment-header-wrapper mb-5">
                                        <h5 className="payment-header">
                                            Payment Details
                                        </h5>
                                    </div>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Payment Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                value={
                                                    franchiseeInvoicePayment.invoice_no
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={
                                                    isError.reference_number
                                                }
                                                message={
                                                    "Reference number is required"
                                                }
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
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Deposited To
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
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
                                            <Form.Select
                                                type="text"
                                                name="to_bank_id"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoicePayment.to_bank_id
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                isValid={isError.to_bank_id}
                                                message={
                                                    "Deposited to is required"
                                                }
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="term_day"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoicePayment.term_day
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
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
                                                defaultValue={
                                                    franchiseeInvoicePayment.remarks
                                                }
                                                className="nc-modal-custom-text"
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </>
                    )}

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

FormCreateSalesInvoice.defaultProps = {
    add: false,
    edit: false,
};

export default FormCreateSalesInvoice;
