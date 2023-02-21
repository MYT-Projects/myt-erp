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
    formatDate,
    formatDateNoTime,
    numberFormat,
    refreshPage,
    toastStyle,
} from "../../../Helpers/Utils/Common";
import {
    getAllTransfers,
    getTransfer,
} from "../../../Helpers/apiCalls/Inventory/TransferApi";
import { createAdjustment } from "../../../Helpers/apiCalls/Inventory/AdjustmentApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllEmployees } from "../../../Helpers/apiCalls/employeesApi";
import { getAdjustment } from "../../../Helpers/apiCalls/Inventory/AdjustmentApi";
import { getAdjustmentPotato } from "../../../Helpers/apiCalls/PotatoCorner/Inventory/AdjustmentApi";
import toast from "react-hot-toast";
import Moment from "moment";

/**
 *  COMPONENT: FORM TO ADD OR EDIT PAYMENT
 */
function ViewAdjustment() {
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [extra, setExtra] = useState({});
    const { id, type } = useParams();
    let navigate = useNavigate();

    const [newItemAdjust, setNewItemAdjust] = useState({
        difference: "",
    });

    // DATA HANDLERS
    const [branches, setBranches] = useState([]);
    const [items, setItems] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);

    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [adjustment, setAdjustment] = useState([]);

    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    async function fetchAdjustment() {
        if (type === "mango_magic") {
            const response = await getAdjustment(id);

            if (response.data.data) {
                var data = response.data.data[0];
                setAdjustment(data);
            } else {
            }
        } else if (type === "potato_corner") {
            const response = await getAdjustmentPotato(id);

            if (response.data.data) {
                var data = response.data.data[0];
                setAdjustment(data);
            } else {
            }
        }
    }

    //API CALL
    async function fetchAllEmployees() {
        setShowLoader(true);
        const response = await getAllEmployees();
        if (response.data.data) {
            var employeesList = response.data.data;
            employeesList.map((employee) => {
                var info = {};

                info.name = "counted_by";
                info.label =
                    employee.first_name +
                    " " +
                    employee.middle_name +
                    " " +
                    employee.last_name;
                info.value = employee.id;

                setEmployeeOptions((prev) => [...prev, info]);
            });
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
        const response = await createAdjustment(newItemAdjust);
        if (response.data.status === "success") {
            toast.success(response.data.response, { style: toastStyle() });
            setTimeout(() => {
                navigate("/itemlists");
            }, 1000);
        } else {
            toast.error(response.data, {
                style: toastStyle(),
            });
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
            newList["difference"] =
                parseInt(value) - parseInt(itemList.current_qty);
            setNewItemAdjust(newList);
            setNewItemAdjust({
                ...newItemAdjust,
                difference: parseInt(value) - parseInt(itemList.current_qty),
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
        fetchAdjustment();
        fetchAllEmployees();
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
                                        {adjustment.item_name}
                                    </span>
                                </Col>

                                <Col xs={3}>
                                    <span className="review-label nc-modal-custom-row">
                                        Inventory Unit
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-data">
                                        {adjustment.unit}
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
                                        {adjustment.branch_name}
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-label nc-modal-custom-row">
                                        Current Level
                                    </span>
                                </Col>
                                <Col xs={3}>
                                    <span className="review-data">
                                        {adjustment.computer_count}
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
                                <input
                                    type="text"
                                    name="counted_by"
                                    disabled
                                    value={adjustment.counted_by_name}
                                    className="nc-modal-custom-input form-control"
                                />
                            </Col>
                            <Col xs={6}>
                                <input
                                    type="text"
                                    name="type_id"
                                    disabled
                                    value={adjustment.type_name}
                                    className="nc-modal-custom-input form-control"
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
                                    disabled
                                    name="physical_count"
                                    className="ps-label-content"
                                    value={adjustment.physical_count}
                                    onChange={(e) => handleUserInput(e)}
                                />
                            </Col>
                            <Col xs={6}>
                                <input
                                    type="number"
                                    name="difference"
                                    disabled
                                    value={adjustment.difference}
                                    className="nc-modal-custom-input form-control"
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="nc-modal-custom-row uppercase">
                                    Admin remarks
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
                                    disabled
                                    defaultValue={adjustment.admin_remarks}
                                    className="nc-modal-custom-input form-control"
                                    onChange={(e) => handleUserInput(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="nc-modal-custom-row uppercase">
                                    Employee remarks
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
                                    disabled
                                    defaultValue={adjustment.remarks}
                                    className="nc-modal-custom-input form-control"
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewAdjustment;
