import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";
import Select from "react-select";
import "./../PurchaseOrders.css";
import { getAllSuppliers } from "../../../../Helpers/apiCalls/suppliersApi";
import {
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import { createPurchaseOrder } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllItems } from "../../../../Helpers/apiCalls/itemsApi";
import toast from "react-hot-toast";
import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";

export default function AddPurchaseOrder(props) {
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [newPO, setNewPO] = useState({ grand_total: 0 });
    const [items, setItems] = useState([
        { item: "", qty: 1, unit: "", price: 0, amount: 0 },
    ]);

    const [suppliersValue, setSuppliersValue] = useState({
        name: "supplier_id",
        label: "",
        value: "",
    });
    const [forwardersValue, setForwardersValue] = useState({
        name: "forwarder_id",
        label: "",
        value: "",
    });

    function handleRemoveItem(id) {
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);
    }

    function AddItem() {
        const newItem = { item: "", qty: 1, unit: "", price: 0, amount: 0 };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    const [showLoader, setShowLoader] = useState(false);

    function handleItemChange(e, id) {
        const { name, value } = e.target;

        if (name === "item_id") {
            var ingredient_id = value.split("|")[0];
            var unit_id = value.split("|")[1];
            var unit = value.split("|")[2];
            var qty =
                value.split("|")[3] === "null"
                    ? 0
                    : parseFloat(value.split("|")[3]);
            var price =
                value.split("|")[4] === "null"
                    ? 0
                    : parseFloat(value.split("|")[4]);

            items.map((item, index) => {
                if (index === id) {
                    item["item_id"] = ingredient_id;
                    item["qty"] = qty;
                    item.unit = unit;
                    item["price"] = price;

                    item.amount = item.qty * item.price;
                }
            });

            newPO.grand_total = items
                .map((item) => item.amount)
                .reduce((a, b) => a + b, 0);
        }

        if (name === "qty" || name === "price") {
            setShowLoader(true);
        }

        newPO.grand_total = items
            .map((item) => item.amount)
            .reduce((a, b) => a + b, 0);
        items.map((item, index) => {
            if (index === id) {
                item[name] = value;
                item.amount = item.qty * item.price;
            }
        });
        setTimeout(() => setShowLoader(false), 1);
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        return (
                            <tr>
                                <td>
                                    <Form.Select
                                        name="ingredient_id"
                                        defaultValue={item.ingredient_id}
                                        onChange={(e) =>
                                            handleItemChange(e, index)
                                        }
                                    >
                                        <option value="" hidden>
                                            Select Item
                                        </option>
                                        {ingredients.map((item) => {
                                            return (
                                                <option value={item.id}>
                                                    {item.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="qty"
                                        defaultValue={item.qty}
                                        onChange={(e) =>
                                            handleItemChange(e, index)
                                        }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="unit"
                                        defaultValue={item.unit}
                                        onChange={(e) =>
                                            handleItemChange(e, index)
                                        }
                                    />
                                </td>
                                <td className="row align-contents">
                                    <Col xs={2} className="align-middle">
                                        PHP
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="price"
                                            defaultValue={item.price}
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
                                    </Col>
                                </td>
                                <td>
                                    {showLoader
                                        ? null
                                        : "PHP " + numberFormat(item.amount)}
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        onClick={() => handleRemoveItem(index)}
                                        className="cursor-pointer"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
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

    /** Ingredients **/
    const [ingredients, setIngredients] = useState([]);

    async function fetchIngredients() {
        setIngredients([]);

        const response = await getAllItems();
        var ingredients = response.response.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        setIngredients(ingredients);
    }

    function handleSelectChange(e) {
        const newList = newPO;
        newList[e.name] = e.value;
        setNewPO(newList);

        if (e.name === "supplier_id") {
            setSuppliersValue({ name: e.name, label: e.label, value: e.value });
        } else {
            setForwardersValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        }
    }

    function handlePOChange(e) {
        const { name, value } = e.target;
        const newList = newPO;
        newList[name] = value;
        setNewPO(newList);
    }

    async function savePO() {
        newPO.is_save = 1;
        newPO.status = "pending";

        const response = await createPurchaseOrder(newPO, items);

        if (response.status === 200) {
            toast.success("Purchase Order Saved Successfully!", {
                style: toastStyle(),
            });
            setTimeout(
                () =>
                    navigate(
                        "/purchaseorders/review/1/" + response.data.puchase_id
                    ),
                1000
            );
        } else {
            toast.error("Error Saving Purchase Order", { style: toastStyle() });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    async function submitPO() {
        newPO.is_save = 0;
        newPO.status = "for approval";

        const response = await createPurchaseOrder(newPO, items);

        if (response.status === 200) {
            toast.success("Purchase Order Created Successfully!", {
                style: toastStyle(),
            });
            setTimeout(
                () =>
                    navigate(
                        "/purchaseorders/review/0/" + response.data.purchase_id
                    ),
                1000
            );
        } else {
            toast.error("Error Creating Purchase Order", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    React.useEffect(() => {
        fetchSuppliers();
        fetchForwarders();
        fetchIngredients();
    }, []);

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
                <div className="row">
                    <h1 className="page-title mb-4">ADD PURCHASE ORDER</h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    <Row className="pt-3 mb-2">
                        <Col xs={6}>
                            <span className="edit-label">Supplier Name</span>
                        </Col>
                        <Col xs={6}>
                            <span className="edit-label ">Purpose</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Supplier..."
                                value={suppliersValue}
                                options={suppliers}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>
                        <Col xs={6}>
                            <Form.Control
                                type="text"
                                name="purpose"
                                className="nc-modal-custom-input"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 mb-2">
                        <Col xs={2}>
                            <span className="edit-label">Purchase Date</span>
                        </Col>
                        <Col xs={2}>
                            <span className="edit-label">Delivery Date</span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">Forwarder</span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">Requisitioner</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={2}>
                            <Form.Control
                                type="date"
                                name="purchase_date"
                                className="nc-modal-custom-input"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                        <Col xs={2}>
                            <Form.Control
                                type="date"
                                name="delivery_date"
                                className="nc-modal-custom-input"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Forwarder..."
                                value={forwardersValue}
                                options={forwarders}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Form.Control
                                type="text"
                                name="requisitioner"
                                className="nc-modal-custom-input"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 mb-2">
                        <Col xs={7}>
                            <span className="edit-label">Delivery Address</span>
                            <br />
                        </Col>
                        <Col xs={5}>
                            <span className="edit-label">
                                Remarks
                                <span className="edit-optional px-2">
                                    (Optional)
                                </span>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={7}>
                            <Form.Control
                                type="text"
                                name="location"
                                className="nc-modal-custom-input"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                        <Col xs={5}>
                            <Form.Control
                                type="text"
                                name="remarks"
                                className="nc-modal-custom-input"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">Purchased Items</span>
                        <div className="edit-purchased-items">
                            {items.length === 0 ? (
                                <span>No Purchased Item Found!</span>
                            ) : (
                                renderTable()
                            )}
                        </div>
                    </Row>
                    <Row className="my-2 align-right mx-5 pb-2 text-end">
                        <Col xs={3} className="print-table-footer-label ">
                            GRAND TOTAL
                        </Col>
                        <Col xs={2} className="print-table-footer-data">
                            {showLoader
                                ? null
                                : "PHP " + numberFormat(newPO.grand_total)}
                        </Col>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => AddItem()}>
                            Add Item
                        </Button>
                    </Row>
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="button-tertiary me-3"
                            onClick={() => savePO()}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => submitPO()}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
