import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { addPurchasInvoice } from "../../../../Helpers/mockData/mockData";
import {
    getTodayDateISO,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import ReactLoading from "react-loading";
import Select from "react-select";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";

import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";
import { getAllItems, getItem } from "../../../../Helpers/apiCalls/itemsApi";
import { getPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllSuppliers } from "../../../../Helpers/apiCalls/suppliersApi";

import toast from "react-hot-toast";
import { createSuppliesInvoice } from "../../../../Helpers/apiCalls/Expenses/suppliesInvoiceApi";
import "./../../PurchaseOrders/PurchaseOrders.css";
import "./../PurchaseInvoices.css";

export default function AddPurchaseInvoice() {
    const { po_id } = useParams();
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isClicked, setIsClicked] = useState(false);

    const [addPI, setAddPI] = useState({});
    const [itemList, setItemList] = useState(addPurchasInvoice);

    async function fetchPO() {
        setAddPI({});
        setItemList([]);

        const response = await getPurchaseOrder(po_id);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var PO = response.response.data[0][0];
            PO.received_date = getTodayDateISO();
            PO.item_total = PO.purchase_items
                .map((item) => item.amount)
                .reduce((a, b) => parseInt(a) + parseInt(b), 0);
            setAddPI(PO);

            PO.purchase_items.map(async (item) => {
                var info = item;

                const response = await getItem(item.item_id);
                info.item = response.data[0].name;
                info.total = item.amount;

                setItemList((prev) => [...prev, info]);
            });
        }
    }

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
        if (name !== "ingredient_id") {
            const newList = { ...addPI };
            newList[name] = value;
            setAddPI(newList);
        } else {
            additionalItemList[index][name] = value;
        }
    }

    function handleAddChange(e) {
        const newList = { ...addPI };
        newList[e.target.name] = e.target.value;

        setAddPI(newList);
    }

    function handleItemChange(e, id) {
        const { name, value } = e.target;

        setIsChanged(true);
        itemList[id][name] = value;
        itemList[id].amount =
            parseInt(itemList[id].qty) * parseInt(itemList[id].price);
        itemList[id].total =
            parseInt(itemList[id].received) * parseInt(itemList[id].price);
        setTimeout(() => setIsChanged(false), 1);
    }

    const [additionalItemList, setAdditionalItemList] = useState([
        { item: "", qty: "1", unit: "", price: "" },
    ]);

    function handleAddNewRow() {
        const newItem = { item: "", qty: "1", unit: "", price: "" };
        setAdditionalItemList((oldItems) => [...oldItems, newItem]);
    }

    function handleDelRow(id) {
        const newList = [...additionalItemList];
        newList.splice(id, 1);
        setAdditionalItemList(newList);
    }

    function handleAddItemChange(e, id) {
        const { name, value } = e.target;

        additionalItemList[id][name] = value;
        additionalItemList[id].total =
            additionalItemList[id].price * additionalItemList[id].qty;
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
            info.ingredient_id = item.ingredient_id;
            info.price = item.price;
            info.qty = item.received;
            info.total = item.total;
            info.unit = item.unit;

            allItems.push(info);
        });

        if (additionalItemList[0].ingredient_id) {
            additionalItemList.map((item) => {
                var info = {};

                info.po_item_id = "0";
                info.ingredient_id = item.ingredient_id;
                info.price = item.price;
                info.qty = item.qty;
                info.total = item.total;
                info.unit = item.unit;

                allItems.push(info);
            });
        }
        if (isClicked) {
            return;
        }
        setIsClicked(true);
        const response = await createSuppliesInvoice(addPI, allItems, po_id);

        if (response.data) {
            toast.success("Invoice Created Successfully!", {
                style: toastStyle(),
            });
            setTimeout(
                () =>
                    navigate(
                        "/se/purchaseinvoices/print/" + response.data.receive_id
                    ),
                1000
            );
        } else {
            toast.error("Error Creating Invoice", { style: toastStyle() });
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
        addPI.additional_item_total = additionalItemList
            .map((item) => item.total)
            .reduce((a, b) => a + b, 0);
        addPI.item_total = itemList
            .map((item) => item.total)
            .reduce((a, b) => a + b, 0);
    }

    /** subtotal for all invoices **/
    if (addPI.item_total && addPI.additional_item_total) {
        addPI.subtotal =
            parseInt(addPI.item_total) + parseInt(addPI.additional_item_total);
    } else if (!addPI.item_total && !addPI.additional_item_total) {
        addPI.subtotal = 0;
    } else if (!addPI.item_total) {
        addPI.subtotal = parseInt(addPI.additional_item_total);
    } else if (!addPI.additional_item_total) {
        addPI.subtotal = parseInt(addPI.item_total);
    }

    /** grand total **/
    if (addPI.subtotal && addPI.freight && addPI.discount) {
        addPI.grand_total =
            parseInt(addPI.subtotal) +
            parseInt(addPI.freight) -
            parseInt(addPI.discount);
    } else if (addPI.subtotal && addPI.freight && !addPI.discount) {
        addPI.grand_total = parseInt(addPI.subtotal) + parseInt(addPI.freight);
    } else if (addPI.subtotal && !addPI.freight && !addPI.discount) {
        addPI.grand_total = parseInt(addPI.subtotal);
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
                    <h1 className="page-title mb-0">ADD PURCHASE INVOICE</h1>
                    <div className="PI-header2">
                        <span className="me-5">PURCHASE ORDER NO.</span>
                        <span>{po_id}</span>
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
                                defaultValue={addPI.received_date}
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
                                        <th>item</th>
                                        <th>quantity</th>
                                        <th>unit</th>
                                        <th>unit price</th>
                                        <th>total amount</th>
                                        <th>received quantity</th>
                                        <th>balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemList.map((item, index) => {
                                        return (
                                            <tr>
                                                <td>{item.item}</td>
                                                <td>
                                                    {parseInt(item.qty)}
                                                </td>
                                                <td>{item.unit}</td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        name="price"
                                                        defaultValue={
                                                            item.price
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
                                                    {item.qty && item.price
                                                        ? numberFormat(
                                                              parseInt(
                                                                  item.qty
                                                              ) *
                                                                  parseInt(
                                                                      item.price
                                                                  )
                                                          )
                                                        : "0.00"}
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        name="received"
                                                        defaultValue={
                                                            item.received
                                                        }
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    PHP{" "}
                                                    {numberFormat(
                                                        parseInt(item.total)
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Row>
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">
                            Additional Received Items
                        </span>
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
                                    {additionalItemList.map((item, index) => {
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
                                                                    item.ingredient_id
                                                            )[0]
                                                        }
                                                        options={ingredients}
                                                        onChange={(e) =>
                                                            handleSelectChange(
                                                                "ingredient_id",
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
                                                    {item.qty && item.price
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
                                name="freight"
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
                                onClick={handleCreatePI}
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
