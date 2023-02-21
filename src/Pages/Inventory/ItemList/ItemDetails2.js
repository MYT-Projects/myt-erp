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
    createItemDetails,
    createItemDetailsPotato,
    getInventoryDetails,
    getInventoryDetailsPotato,
} from "../../../Helpers/apiCalls/Inventory/ItemDetailsApi";
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
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllBranchesPotato } from "../../../Helpers/apiCalls/PotatoCorner/Manage/Branches";
import { getAllEmployees } from "../../../Helpers/apiCalls/employeesApi";
import toast from "react-hot-toast";
import Moment from "moment";
import { getAllAdjustmentTypes } from "../../../Helpers/apiCalls/adjustmentsApi";
import {
    getAllInventoryGroup,
    getAllInventoryGroupPotato,
} from "../../../Helpers/apiCalls/Manage/InventoryGroup";

/**
 *  COMPONENT: FORM TO ADD OR EDIT PAYMENT
 */
function ItemDetails() {
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [extra, setExtra] = useState({});
    const { id, type } = useParams();
    let navigate = useNavigate();

    const [itemName, setItemName] = useState("");
    const [unit, setUnit] = useState("");
    const [branches, setBranches] = useState([]);

    const [itemDetails, setItemDetails] = useState([]);

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

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Branch</th>
                        <th>Default Unit</th>
                        <th>Min Level</th>
                        <th>Max Level</th>
                        <th>Critical Level</th>
                        <th>Current Level</th>
                        <th>Acceptable Variance</th>
                        <th>Beginning Inventory</th>
                    </tr>
                </thead>
                <tbody>
                    {itemDetails.map((branch, index) => {
                        console.log(branch)
                        return (
                            <tr>
                                <td>{branch.name ? branch.name : branch.inventory_group_name}</td>
                                <td>{unit}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="min"
                                        className="ps-label-content"
                                        defaultValue={branch.min ? branch.min : 0}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="max"
                                        className="ps-label-content"
                                        defaultValue={branch.max ? branch.max : 0}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="critical_level"
                                        className="ps-label-content"
                                        defaultValue={branch.critical_level ? branch.critical_level : 0}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                <td>{branch.current_qty ? branch.current_qty : 0}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="acceptable_variance"
                                        className="ps-label-content"
                                        defaultValue={branch.acceptable_variance ? branch.acceptable_variance : 0}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                {
                                    branch.type === "warehouse" && (
                                        <>
                                            <td>{branch.beginning_qty ? branch.beginning_qty : 0}</td>
                                        </>
                                    )
                                }
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }


    async function fetchDetails(item_id) {
        setBranches([]);

        if(type === "mango_magic") {
            const response = await getInventoryDetails(item_id);
            if (response.data) {
                var warehouse = response.data.data.warehouse_inventories;
                var warehouseDeets = warehouse.map((house, index) => {
                    var info = house
                    info.type = "warehouse"
                    setItemDetails((prev) => [...prev, info])
                    return info
                });
                
                var inventories = response.data.data.inventory_group_details;
                var inventoryDeets = inventories.map((inventory, index) => {
                    var info = inventory
                    info.type = "inventory"
                    setItemDetails((prev) => [...prev, info])
                    return info
                });
                setItemName(response.data.data.item_name)
                setUnit(response.data.data.item_unit)
            }
            
        }
        else if(type === "potato_corner") {
            const response = await getInventoryDetailsPotato(id);
            if (response.data) {
                var warehouse = response.data.data.warehouse_inventories;
                var warehouseDeets = warehouse.map((house, index) => {
                    var info = house
                    info.type = "warehouse"
                    setItemDetails((prev) => [...prev, info])
                    return info
                });
                
                var inventories = response.data.data.inventory_group_details;
                var inventoryDeets = inventories.map((inventory, index) => {
                    var info = inventory
                    info.type = "inventory"
                    setItemDetails((prev) => [...prev, info])
                    return info
                });
                setItemName(response.data.data.item_name)
                setUnit(response.data.data.item_unit)
            }
        }
    }

    async function saveDetails() {
        console.log(id, unit, itemDetails[0].item_unit_id);
        console.log(itemDetails[0].item_unit_id);
        if (type === "mango_magic") {
            const response = await createItemDetails(id, itemDetails[0].item_unit_id, itemDetails);
            if (response.data.status === "success") {
                toast.success(response.data.message, { style: toastStyle() });
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
            const response = await createItemDetailsPotato(id, unit, itemDetails);
            if (response.data.status === "success") {
                toast.success(response.data.message, { style: toastStyle() });
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

    function handleUserInput(e, index, branch) {
        var temp = itemDetails;
        const { name, value } = e.target;
        temp[index][name] = value;
        setItemDetails(temp);
        
    }

    React.useEffect(() => {
        setBranches([]);
        fetchDetails(id);
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
                    <h1 className="page-title mb-4">ITEM DETAILS</h1>
                </div>

                {/* FORM */}

                <div className="edit-form ps-form">
                    <Fragment>
                        <Row className=" py-3">
                            <Row>
                                <h3 className="page-subtitle">
                                    <strong>{itemName}</strong> 
                                </h3>
                            </Row>
                            <Row>
                                <div className="edit-purchased-items mt-4">
                                    {itemDetails.length === 0 ? (
                                        <span>No Branch Found!</span>
                                    ) : (
                                        renderTable() 
                                    )}
                                </div>
                            </Row>
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
                            className="button-primary me-3 ms-2"
                            onClick={() => saveDetails()}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ItemDetails;