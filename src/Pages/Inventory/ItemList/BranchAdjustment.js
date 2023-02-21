import React, { Fragment, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import trash from "./../../../Assets/Images/trash.png";
import Select from "react-select";
import "../Inventory.css";
import {
    getAllItemList,
    getItemList,
} from "../../../Helpers/apiCalls/Inventory/ItemListApi";
import {
    getAllItemListPotato,
    getItemListPotato,
} from "../../../Helpers/apiCalls/PotatoCorner/Inventory/ItemListApi";
import {
    formatDate,
    formatDateNoTime,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../Helpers/Utils/Common";
import {
    getAllTransfers,
    getTransfer,
} from "../../../Helpers/apiCalls/Inventory/TransferApi";
import {
    createAdjustment,
    getAllAdjustments,
} from "../../../Helpers/apiCalls/Inventory/AdjustmentApi";
import { createAdjustmentPotato } from "../../../Helpers/apiCalls/PotatoCorner/Inventory/AdjustmentApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllEmployees } from "../../../Helpers/apiCalls/employeesApi";
import toast from "react-hot-toast";
import Moment from "moment";
import { getAllAdjustmentTypes } from "../../../Helpers/apiCalls/adjustmentsApi";

/**
 *  COMPONENT: FORM TO ADD OR EDIT PAYMENT
 */
function BranchAdjustment() {
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [extra, setExtra] = useState({});
    const { id, type } = useParams();
    let navigate = useNavigate();

    const [newItemAdjust, setNewItemAdjust] = useState({
        difference: "",
    });
    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionFee, setTransactionFee] = useState("");
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState("");

    // DATA HANDLERS
    const [branches, setBranches] = useState([]);
    const [entries, setEntries] = useState([]);
    const [items, setItems] = useState([]);
    const [banks, setBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [adjustments, setAdjustments] = useState([]);

    async function fetchAdjustmentTypes() {
        const response = await getAllAdjustmentTypes();

        if (response.data) {
            var adjustmentTypes = response.data.data.map((type) => {
                var info = {};
                info.value = type.id;
                info.name = "type_id";
                info.label = type.name;
                return info;
            });
            setAdjustments(adjustmentTypes);
        } else {
            TokenExpiry(response);
        }
    }

    const adjustmentTypeOptions = [
        { name: "type_id", value: "1", label: "Damaged" },
        { name: "type_id", value: "2", label: "Error" },
        { name: "type_id", value: "3", label: "Inventory Adjustment" },
        { name: "type_id", value: "4", label: "Store Use" },
    ];
    const [employeeOptions, setEmployeeOptions] = useState([]);

    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    async function fetchData(id) {
        setShowLoader(true);
        setItemList([]);

        if (type === "mango_magic") {
            const response = await getItemList(id);

            if (response.error) {
            } else {
                var data = response.data.data[0];
                setItemList({
                    id: data.id,
                    branch_id: data.branch_id,
                    branch_name: data.branch_name,
                    item_name: data.item_name,
                    item_type: data.item_type,
                    current_qty: data.current_qty,
                    min: data.min,
                    max: data.max,
                    acceptable_variance: data.acceptable_variance,
                    inventory_unit_name: data.inventory_unit_name,
                });
                setNewItemAdjust({
                    inventory_id: data.id,
                    item_id: data.item_id,
                    branch_id: data.branch_id,
                    branch_name: data.branch_name,
                    unit: data.inventory_unit_name,
                });
            }
        } else if (type === "potato_corner") {
            const response = await getItemListPotato(id);

            if (response.error) {

            } else {
                var data = response.data.data[0];
                setItemList({
                    id: data.id,
                    branch_id: data.branch_id,
                    item_name: data.item_name,
                    item_type: data.item_type,
                    current_qty: data.current_qty,
                    min: data.min,
                    max: data.max,
                    acceptable_variance: data.acceptable_variance,
                    inventory_unit_name: data.inventory_unit_name,
                });
                setNewItemAdjust({
                    inventory_id: data.id,
                    item_id: data.item_id,
                    branch_id: data.branch_id,
                    unit: data.inventory_unit_name,
                });
            }
        }

        setShowLoader(false);
    }

    //API CALL
    async function fetchAllEmployees() {
        setShowLoader(true);
        const response = await getAllEmployees();
        if (response.data.data) {
            var employeesList = response.data.data.map((employee) => {
                var info = {};

                info.name = "counted_by";
                info.label = `${employee.first_name} ${
                    employee.middle_name ? employee.middle_name : ""
                } ${employee.last_name}`;
                info.value = employee.id;
                return info;
            });
            setEmployeeOptions(employeesList);
            response.data.data.map((data, key) => {
                employeesList[key].full_name =
                    data.first_name +
                    " " +
                    data.middle_name +
                    " " +
                    data.last_name;
            });
            setEmployeesData(employeesList);
        } else {
            setEmployeesData([]);
        }
        setShowLoader(false);
    }

    async function saveAdjustment() {
        if (type === "mango_magic") {
            const response = await createAdjustment(newItemAdjust);
            if (response.data.status === "success") {
                toast.success(response.data.response, { style: toastStyle() });
                setTimeout(() => {
                    navigate("/itemlists");
                }, 1000);
            } else {
                toast.error("Failed to create adjustment.", {
                    style: toastStyle(),
                });
                refreshPage();
            }
        } else if (type === "potato_corner") {
            const response = await createAdjustmentPotato(newItemAdjust);
            if (response.data.status === "success") {
                toast.success(response.data.response, { style: toastStyle() });
                setTimeout(() => {
                    navigate("/itemlists");
                }, 1000);
            } else {
                toast.error("Failed to create adjustment.", {
                    style: toastStyle(),
                });
                refreshPage();
            }
        }
    }

    const [employeeValue, setEmployeeValue] = useState({
        name: "counted_by",
        label: "",
        value: "",
    });

    function handleUserInput(e) {
        const { name, value } = e.target;
        const newList = newItemAdjust;
        newList[name] = value;
        setNewItemAdjust(newList);

        if (name === "physical_count") {
            newList["difference"] = (
                parseFloat(value) - parseFloat(itemList.current_qty)
            ).toFixed(2);
            setNewItemAdjust(newList);
            setNewItemAdjust({
                ...newItemAdjust,
                difference: (
                    parseFloat(value) - parseFloat(itemList.current_qty)
                ).toFixed(2),
            });
        }
    }

    // SELECT DROPSEARCH CHANGE HANDLER
    function handleSelectChange(e) {
        const newList = newItemAdjust;
        newList[e.name] = e.value;
        setNewItemAdjust(newList);

        if (e.name === "counted_by")
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
    }

    React.useEffect(() => {
        fetchData(id);
        fetchAllEmployees();
        fetchAdjustmentTypes();
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"INVENTORY"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    <h1 className="page-title mb-4">ADJUST INVENTORY</h1>
                </div>

                {/* FORM */}

                <div className="edit-form ps-form">
                    <Fragment>
                        <Row className="review-container py-3">
                            <Row>
                                <Col xs={3}>
                                    <span className="review-label nc-modal-custom-row">
                                        Item Description
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-data">
                                        {itemList.item_name}
                                    </span>
                                </Col>

                                <Col xs={3}>
                                    <span className="review-label nc-modal-custom-row">
                                        Inventory Unit
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-data">
                                        {itemList.inventory_unit_name}
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={3}>
                                    <span className="review-label nc-modal-custom-row">
                                        Branch
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-data">
                                        {itemList.branch_name}
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-label nc-modal-custom-row">
                                        Current Level
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-data">
                                        {numberFormat(itemList.current_qty)}
                                    </span>
                                </Col>
                            </Row>
                        </Row>
                        <Row className="pt-3 mb-2">
                            <Col xs={6}>
                                <span className="nc-modal-custom-row uppercase">
                                    counted by
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col xs={6}>
                                <span className="nc-modal-custom-row uppercase">
                                    adjustment type
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row className="align-items-start">
                            <Col xs={6}>
                                <Select
                                    name="counted_by"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Employee..."
                                    defaultValue={employeeValue}
                                    options={employeeOptions}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                            </Col>
                            <Col xs={6}>
                                <Select
                                    name="type_id"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Adjustment Type..."
                                    defaultValue={newItemAdjust.type_id}
                                    options={adjustments}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="pt-3 mb-2">
                            <Col xs={6}>
                                <span className="nc-modal-custom-row uppercase">
                                    Physical count
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col xs={6}>
                                <span className="nc-modal-custom-row uppercase">
                                    difference
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row className="align-items-start">
                            <Col xs={6}>
                                <Form.Control
                                    type="text"
                                    name="physical_count"
                                    className="ps-label-content"
                                    value={newItemAdjust.physical_count}
                                    onChange={(e) => handleUserInput(e)}
                                />
                            </Col>
                            <Col xs={6}>
                                <input
                                    type="number"
                                    name="difference"
                                    value={newItemAdjust.difference}
                                    className="nc-modal-custom-input form-control"
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="nc-modal-custom-row uppercase">
                                    remarks
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
                                    defaultValue={newItemAdjust.remarks}
                                    className="nc-modal-custom-row-grey"
                                    onChange={(e) => handleUserInput(e)}
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="button-primary me-3"
                            onClick={() => saveAdjustment()}
                        >
                            Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BranchAdjustment;