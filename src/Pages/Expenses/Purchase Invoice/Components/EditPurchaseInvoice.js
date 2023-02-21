import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { addPurchasInvoice } from "../../../../Helpers/mockData/mockData";
import {
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";

import Select from "react-select";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";

import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";
import { getAllItems } from "../../../../Helpers/apiCalls/itemsApi";
import { getAllSuppliers } from "../../../../Helpers/apiCalls/suppliersApi";

import toast from "react-hot-toast";
import {
    getSuppliesInvoice,
    updateSuppliesInvoice,
} from "../../../../Helpers/apiCalls/Expenses/suppliesInvoiceApi";
import "./../../PurchaseOrders/PurchaseOrders.css";
import "./../PurchaseInvoices.css";

export default function EditPurchaseInvoice() {
    const { id } = useParams();
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);

    const [addPI, setAddPI] = useState({});
    const [itemList, setItemList] = useState(addPurchasInvoice);

    /** Fetch Purchase Order Details */
    async function fetchPO() {
        setAddPI({});
        setItemList([]);

        const response = await getSuppliesInvoice(id);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var PO = response.data.data[0];
            PO.item_total = PO.receive_items
                .map((item) => item.total)
                .reduce((a, b) => parseInt(a) + parseInt(b), 0);
            setAddPI(PO);

            PO.receive_items.map(async (item) => {
                var info = {};

                info.item_id = item.item_id;
                info.qty = parseInt(item.qty);
                info.unit = item.unit;
                info.price = parseInt(item.price);
                info.amount = parseInt(item.qty) * parseInt(item.price);
                info.total = parseInt(item.qty) * parseInt(item.price);

                setItemList((prev) => [...prev, info]);
            });
        }
    }

    /** Suppliers **/
    const [suppliers, setSuppliers] = useState([]);

    async function fetchSuppliers() {
        setSuppliers([]);

        const response = await getAllSuppliers();
        if (response.error) {
            TokenExpiry(response);
        } else {
            var suppliers = response.response.data.sort((a, b) =>
                a.trade_name > b.trade_name
                    ? 1
                    : b.trade_name > a.trade_name
                    ? -1
                    : 0
            );

            suppliers.map((supplier) => {
                var info = {};

                info.name = "supplier_id";
                info.label = supplier.trade_name;
                info.value = supplier.id;

                setSuppliers((prev) => [...prev, info]);
            });
        }
    }

    /** Forwarders **/
    const [forwarders, setForwarders] = useState([]);

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

    /** Items **/
    const [ingredients, setIngredients] = useState([]);

    async function fetchIngredients() {
        setIngredients([]);

        const response = await getAllItems();
        var ingredients = response.response.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        ingredients.map((ing) => {
            var info = {};

            info.label = ing.name;
            info.value = ing.id;

            setIngredients((prev) => [...prev, info]);
        });
    }

    function handleSelectChange(name, value, index) {
        if (name !== "item_id") {
            const newList = { ...addPI };
            newList[name] = value;
            setAddPI(newList);
        } else {
            itemList[index][name] = value;
        }
    }

    function handleAddChange(e) {
        const newList = { ...addPI };
        newList[e.target.name] = e.target.value;

        setAddPI(newList);
    }

    function handleAddNewRow() {
        const newItem = { item: "", qty: "1", unit: "", price: "" };
        setItemList((oldItems) => [...oldItems, newItem]);
    }

    function handleDelRow(id) {
        const newList = [...itemList];
        newList.splice(id, 1);
        setItemList(newList);
    }

    function handleAddItemChange(e, id) {
        const { name, value } = e.target;

        itemList[id][name] = value;
        itemList[id].total = itemList[id].price * itemList[id].qty;
    }

    const [isChanged, setIsChanged] = useState(false);

    function handleChange(e, index) {
        setIsChanged(true);
        handleAddItemChange(e, index);
        setTimeout(() => setIsChanged(false), 1);
    }

    async function handleCreatePI() {
        const allItems = [];
        itemList.map((item) => {
            var info = {};

            info.po_item_id = item.id;
            info.item_id = item.item_id;
            info.price = item.price;
            info.qty = item.qty;
            info.total = item.total;
            info.unit = item.unit;

            allItems.push(info);
        });

        const response = await updateSuppliesInvoice(addPI, allItems, id);

        if (response.data) {
            toast.success("Invoice Updated Successfully!", {
                style: toastStyle(),
            });
            setTimeout(
                () => navigate("/se/purchaseinvoices/print/" + id),
                1000
            );
        } else {
            toast.error("Error Updating Invoice", { style: toastStyle() });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    React.useEffect(() => {
        fetchPO();
        fetchSuppliers();
        fetchForwarders();
        fetchIngredients();
    }, []);

    /** grand total for items **/
    if (isChanged) {
        addPI.item_total = itemList
            .map((item) => item.total)
            .reduce((a, b) => a + b, 0);
    }

    /** subtotal for all invoices **/
    if (addPI.item_total) {
        addPI.subtotal = parseInt(addPI.item_total);
    } else if (!addPI.item_total) {
        addPI.subtotal = 0;
    }

    /** grand total **/
    if (addPI.subtotal && addPI.freight_cost && addPI.discount) {
        addPI.grand_total =
            parseInt(addPI.subtotal) +
            parseInt(addPI.freight_cost) -
            parseInt(addPI.discount);
    } else if (addPI.subtotal && addPI.freight_cost && !addPI.discount) {
        addPI.grand_total =
            parseInt(addPI.subtotal) + parseInt(addPI.freight_cost);
    } else if (addPI.subtotal && !addPI.freight_cost && !addPI.discount) {
        addPI.grand_total = parseInt(addPI.subtotal);
    } else if (!addPI.subtotal && !addPI.freight_cost && !addPI.discount) {
        addPI.grand_total = 0;
    } else if (!addPI.subtotal && addPI.freight_cost && !addPI.discount) {
        addPI.grand_total = parseInt(addPI.freight_cost);
    } else if (!addPI.subtotal && addPI.freight_cost && addPI.discount) {
        addPI.grand_total =
            parseInt(addPI.freight_cost) - parseInt(addPI.discount);
    } else if (!addPI.subtotal && !addPI.freight_cost && addPI.discount) {
        addPI.grand_total = parseInt(-addPI.discount);
    } else if (addPI.subtotal && !addPI.freight_cost && addPI.discount) {
        addPI.grand_total = parseInt(addPI.subtotal) - parseInt(addPI.discount);
    }

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"EXPENSES"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="d-flex justify-content-between align-items-center my-3 pb-4">
                    <h1 className="page-title mb-0">EDIT Supplies INVOICE</h1>
                    <div className="PI-header2">
                        <span className="me-5 text-uppercase">
                            Supplies Expense NO.
                        </span>
                        <span>{addPI.se_id}</span>
                    </div>
                </div>

                <div className="edit-form">
                    <Row className="pt-3 mb-2">
                        <Col xs={6}>
                            <span className="edit-label">Supplier Name</span>
                        </Col>
                        <Col xs={3}>
                            <span className="edit-label">Purchase Date</span>
                        </Col>
                        <Col xs={3}>
                            <span className="edit-label">Received Date</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Supplier..."
                                value={
                                    suppliers.filter(
                                        (info) =>
                                            info.value === addPI.supplier_id
                                    )[0]
                                }
                                options={suppliers}
                                onChange={(e) =>
                                    handleSelectChange("supplier_id", e.value)
                                }
                            />
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="date"
                                name="purchase_date"
                                className="nc-modal-custom-text"
                                defaultValue={addPI.purchase_date}
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="date"
                                name="received_date"
                                className="nc-modal-custom-text"
                                defaultValue={addPI.receive_date}
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 mb-2">
                        <Col xs={6}>
                            <span className="edit-label">Purpose</span>
                        </Col>
                        <Col xs={6}>
                            <span className="edit-label">Forwarder</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <Form.Control
                                type="text"
                                name="purpose"
                                className="nc-modal-custom-text"
                                defaultValue={addPI.purpose}
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col xs={6}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Forwarder..."
                                value={
                                    forwarders.filter(
                                        (info) =>
                                            info.value === addPI.forwarder_id
                                    )[0]
                                }
                                options={forwarders}
                                onChange={(e) => handleSelectChange(e)}
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
                                defaultValue={addPI.waybill_no}
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Form.Control
                                type="text"
                                name="invoice_no"
                                className="nc-modal-custom-text"
                                defaultValue={addPI.invoice_no}
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Form.Control
                                type="text"
                                name="dr_no"
                                className="nc-modal-custom-text"
                                defaultValue={addPI.dr_no}
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">Received Items</span>
                        <div className="edit-purchased-items">
                            <Table>
                                <thead>
                                    <tr>
                                        <th className="color-gray">item</th>
                                        <th className="color-gray">quantity</th>
                                        <th className="color-gray">unit</th>
                                        <th className="color-gray">
                                            unit price
                                        </th>
                                        <th className="color-gray">amount</th>
                                        <th className="color-gray">actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemList.map((item, index) => {
                                        return (
                                            <tr>
                                                <td>
                                                    <Select
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                        placeholder="Select Item..."
                                                        value={
                                                            ingredients.filter(
                                                                (info) =>
                                                                    info.value ===
                                                                    item.item_id
                                                            )[0]
                                                        }
                                                        options={ingredients}
                                                        onChange={(e) =>
                                                            handleSelectChange(
                                                                "item_id",
                                                                e.value,
                                                                index
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        name="qty"
                                                        defaultValue={item.qty}
                                                        onChange={(e) =>
                                                            handleChange(
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
                                                        defaultValue={item.unit}
                                                        onChange={(e) =>
                                                            handleAddItemChange(
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
                                                            handleChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="color-green">
                                                    {item.total
                                                        ? numberFormat(
                                                              item.total
                                                          )
                                                        : "0.00"}
                                                </td>
                                                <td className="text-center">
                                                    <img
                                                        src={trash}
                                                        onClick={() =>
                                                            handleDelRow(index)
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => handleAddNewRow()}>
                            Add Item
                        </Button>
                    </Row>
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
                                {numberFormat(addPI.subtotal)}
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
                                className="nc-modal-custom-text align-middle"
                                defaultValue={addPI.freight_cost}
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
                                className="nc-modal-custom-text align-middle"
                                defaultValue={addPI.discount}
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
                                {numberFormat(addPI.grand_total)}
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
                                className="nc-modal-custom-text"
                                defaultValue={addPI.remarks}
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate("/se/purchaseinvoices")}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => handleCreatePI()}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
