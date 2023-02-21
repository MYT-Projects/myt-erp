import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { sampleItems } from "../../../../Helpers/mockData/mockData";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";
import Select from "react-select";
import "./../PurchaseOrders.css";
import { getAllSuppliers } from "../../../../Helpers/apiCalls/suppliersApi";
import {
    formatYDM,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../../Helpers/Utils/Common";
import { getAllEmployees } from "../../../../Helpers/apiCalls/employeesApi";
import {
    getPurchaseOrder,
    updatePurchaseOrder,
} from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllItems } from "../../../../Helpers/apiCalls/itemsApi";
import toast from "react-hot-toast";
import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";

export default function EditPurchaseOrder() {
    const { id } = useParams();
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [editPO, setEditPO] = useState({});
    const [items, setItems] = useState([]);

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

    async function fetchPO() {
        setEditPO({});
        setItems([]);

        const response = await getPurchaseOrder(id);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var PO = response.response.data[0][0];
            setEditPO(PO);
            setSuppliersValue({
                name: "supplier_id",
                label: PO.supplier_trade_name,
                value: PO.supplier_id,
            });
            setForwardersValue({
                name: "supplier_id",
                label: PO.forwarder_name,
                value: PO.forwarder_id,
            });
            setItems(PO.purchase_items);
        }
    }

    /** Suppliers **/
    const [suppliers, setSuppliers] = useState([]);

    async function fetchSuppliers() {
        setSuppliers([]);

        const response = await getAllSuppliers();
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
        const newList = editPO;
        newList[e.name] = e.value;
        setEditPO(newList);

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
        const newList = editPO;
        newList[name] = value;
        setEditPO(newList);
    }

    async function savePO() {
        editPO.is_save = 1;
        editPO.status = "pending";

        const response = await updatePurchaseOrder(editPO, items);

        if (response.status === 200) {
            toast.success("Purchase Order Saved Succesfully", {
                style: toastStyle(),
            });
            setTimeout(() => navigate("/purchaseorders"), 1000);
        } else {
            toast.error("Error Saving Purchase Order", { style: toastStyle() });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    async function submitPO() {
        editPO.is_save = 0;
        editPO.status = "for approval";

        const response = await updatePurchaseOrder(editPO, items);

        if (response.status === 200) {
            toast.success("Purchase Order Updated Succesfully", {
                style: toastStyle(),
            });
            setTimeout(() => navigate("/purchaseorders/review/0/" + id), 1000);
        } else {
            toast.error("Error Updating Purchase Order", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    function handleRemoveItem(id) {
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);
    }

    function AddItem() {
        const newItem = {
            id: "",
            ingredient_id: "",
            qty: 1,
            unit: "",
            price: 0,
            amount: 0,
        };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    const [showLoader, setShowLoader] = useState(false);

    function handleItemChange(e, id) {
        const { name, value } = e.target;

        if (name === "qty" || name === "price") {
            setShowLoader(true);
        }

        editPO.grand_total = items
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
                            <tr key={item.id}>
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
                                        {ingredients.map((ing) => {
                                            return (
                                                <option value={ing.id}>
                                                    {ing.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="qty"
                                        className="nc-modal-custom-input"
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
                                        className="nc-modal-custom-input"
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
                                <td>PHP {numberFormat(item.amount)}</td>
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

    React.useEffect(() => {
        fetchPO();
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
                    <h1 className="page-title mb-4">EDIT PURCHASE ORDER</h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    <Row className="pt-3 mb-2">
                        <Col xs={6}>
                            <span className="edit-label">Supplier Name</span>
                        </Col>
                        <Col xs={6}>
                            <span className="edit-label">Purpose</span>
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
                                defaultValue={editPO.purpose}
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
                                className="nc-modal-custom-text"
                                defaultValue={formatYDM(editPO.purchase_date)}
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                        <Col xs={2}>
                            <Form.Control
                                type="date"
                                name="delivery_date"
                                className="nc-modal-custom-text"
                                defaultValue={formatYDM(editPO.delivery_date)}
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
                                defaultValue={editPO.requisitioner}
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
                                defaultValue={editPO.delivery_address}
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                        <Col xs={5}>
                            <Form.Control
                                type="text"
                                name="remarks"
                                className="nc-modal-custom-input"
                                defaultValue={editPO.remarks}
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
                        <Col xs={3} className="print-table-footer-label">
                            GRAND TOTAL
                        </Col>
                        <Col xs={2} className="print-table-footer-data">
                            {showLoader
                                ? null
                                : "PHP " + numberFormat(editPO.grand_total)}
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
