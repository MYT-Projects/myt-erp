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

    // const [newItemAdjust, setNewItemAdjust] = useState({
    //     difference: "",
    // });
    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionFee, setTransactionFee] = useState("");
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState("");

    // DATA HANDLERS
    const [branches, setBranches] = useState([]);
    const [branchGroup, setBranchGroup] = useState([]);
    const [entries, setEntries] = useState([]);
    const [items, setItems] = useState([]);
    const [banks, setBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [adjustments, setAdjustments] = useState([]);

    const [newItemDetails, setnewItemDetails] = useState([]);
    const [newItemDetailsInventory, setnewItemDetailsInventory] = useState([]);

    const [inventoryId, setInventoryId] = useState("");
    const [remarks, setRemarks] = useState("");

    var warehouseIds = new Array(branches?.length)
    var inventoryGroup = new Array(branches?.length)
    var itemUnitIds = new Array(branches?.length)
    var minimumLevels = new Array(branches?.length)
    var maximumLevels = new Array(branches?.length)
    var criticalLevel = new Array(branches?.length)
    var currentLevel = new Array(branches?.length)
    var acceptableVariances = new Array(branches?.length)
    var beginningQty = new Array(branches?.length)
    var units = new Array(branches?.length)
    var withData = new Array(branches?.length)

    // async function fetchAdjustmentTypes() {
    //     const response = await getAllAdjustmentTypes();
    //     if (response.data) {
    //         var adjustmentTypes = response.data.data.map((type) => {
    //             var info = {};
    //             info.value = type.id;
    //             info.name = "type_id";
    //             info.label = type.name;
    //             return info;
    //         });
    //         setAdjustments(adjustmentTypes);
    //     } else {
    //         TokenExpiry(response);
    //     }
    // }

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
                    {branches.map((branch, index) => {
                        if(branch.category === "branch"){
                            warehouseIds.splice(index, 0, branch.id);
                        }
                        if(branch.category === "inventory"){
                            inventoryGroup.splice(index, 0, branch.id);
                        }
                        units.splice(index, 0, itemList.inventory_unit_name);
                        itemUnitIds.splice(index, 0, itemList.item_unit_id);

                        newItemDetails.map((data, i) => {
                            if(data.type === "warehouse") {
                                if(branch.id === data.branch_id) {
                                    withData.splice(i, 0, true)
                                    minimumLevels.splice(i, 0, data.min)
                                    maximumLevels.splice(i, 0, data.max)
                                    criticalLevel.splice(i, 0, data.critical_level)
                                    currentLevel.splice(i, 0, data.current_qty ? numberFormat(data.current_qty) : "",)
                                    acceptableVariances.splice(i, 0, data.acceptable_variance)
                                    beginningQty.splice(i, 0, data.beginning_qty)
                                }
                            } else if(data.type === "inventory") {
                                if((branch.id === data.inventory_group_id) && branch.category === "inventory") {
                                    withData.splice(index, 0, true)
                                    minimumLevels.splice(index, 0, data.min)
                                    maximumLevels.splice(index, 0, data.max)
                                    criticalLevel.splice(index, 0, data.critical_level)
                                    currentLevel.splice(index, 0, "",)
                                    // currentLevel.splice(index, 0, data.current_qty ? numberFormat(data.current_qty) : "",)
                                    acceptableVariances.splice(index, 0, data.acceptable_variance)
                                    beginningQty.splice(index, 0, data.beginning_qty)
                                }
                            }
                            
                        })
                        return (
                            <tr>
                                <td>{branch.name}</td>
                                <td>{itemList.inventory_unit_name}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="min_level"
                                        className="ps-label-content"
                                        defaultValue={minimumLevels[index]}
                                        disabled={!withData[index]}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="max_level"
                                        className="ps-label-content"
                                        defaultValue={maximumLevels[index]}
                                        disabled={!withData[index]}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="critical_level"
                                        className="ps-label-content"
                                        defaultValue={criticalLevel[index]}
                                        disabled={!withData[index]}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                <td>{currentLevel[index]}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="acceptable_variance"
                                        className="ps-label-content"
                                        defaultValue={acceptableVariances[index]}
                                        disabled={!withData[index]}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="beginning_inventory"
                                        className="ps-label-content"
                                        defaultValue={beginningQty[index]}
                                        disabled={!withData[index]}
                                        onBlur={(e) => handleUserInput(e, index, branch)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

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
                    inventory_unit_name: data.inventory_unit_name,
                    item_unit_id: data.item_unit_id,
                    branch_name: data.branch_name,
                    item_name: data.item_name,
                    item_type: data.item_type,
                    current_qty: data.current_qty,
                    min: data.min,
                    max: data.max,
                    acceptable_variance: data.acceptable_variance,
                });
                fetchDetails(data.item_id);
                // setNewItemAdjust({
                //     inventory_id: data.id,
                //     item_id: data.item_id,
                //     branch_id: data.branch_id,
                //     branch_name: data.branch_name,
                //     unit: data.inventory_unit_name,
                // });
            }
        } else if (type === "potato_corner") {
            const response = await getItemListPotato(id);

            if (response.error) {
            } else {
                var data = response.data.data[0];
                setItemList({
                    id: data.id,
                    branch_id: data.branch_id,
                    inventory_unit_name: data.inventory_unit_name,
                    item_unit_id: data.item_unit_id,
                    item_name: data.item_name,
                    item_type: data.item_type,
                    current_qty: data.current_qty,
                    min: data.min,
                    max: data.max,
                    acceptable_variance: data.acceptable_variance,
                });
                fetchDetails(data.item_id);
                // setNewItemAdjust({
                //     inventory_id: data.id,
                //     item_id: data.item_id,
                //     branch_id: data.branch_id,
                //     unit: data.inventory_unit_name,
                // });
            }
        }

        setShowLoader(false);
    }

    //API CALL
    // async function fetchAllEmployees() {
    //     setShowLoader(true);
    //     const response = await getAllEmployees();
    //     if (response.data.data) {
    //         var employeesList = response.data.data.map((employee) => {
    //             var info = {};

    //             info.name = "counted_by";
    //             info.label = `${employee.first_name} ${
    //                 employee.middle_name ? employee.middle_name : ""
    //             } ${employee.last_name}`;
    //             info.value = employee.id;
    //             return info;
    //         });
    //         setEmployeeOptions(employeesList);
    //         response.data.data.map((data, key) => {
    //             employeesList[key].full_name =
    //                 data.first_name +
    //                 " " +
    //                 data.middle_name +
    //                 " " +
    //                 data.last_name;
    //         });
    //         setEmployeesData(employeesList);
    //     } else {
    //         setEmployeesData([]);
    //     }
    //     setShowLoader(false);
    // }

    async function fetchBranches() {
        setBranches([]);
        setBranchGroup([]);

        if(type === "mango_magic") {
            const response = await getAllBranches();
            if (response.data) {
                var data = response.data.data;
                data.map((d) => {
                    if(d.is_franchise === "3") {
                        var info = d;
                        info.type = "mango";
                        info.category = "branch";
                        setBranches((prev) => [...prev, info]);
                    }
                });
            }
            const response2 = await getAllInventoryGroup({});
            if (response2.data) {
                var data = response2.data.data;
                data.map((d) => {
                    var info = d;
                    info.type = "mango";
                    info.category = "inventory";
                    setBranchGroup((prev) => [...prev, info]);
                    setBranches((prev) => [...prev, info]);

                });
            }
        }

        else if(type === "potato_corner") {
            const response = await getAllBranchesPotato();
            if (response.data) {
                var data = response.data.data.data;
                data.map((d) => {
                    if(d.is_franchise === "3") {
                        var info = d;
                        info.type = "potato";
                        info.category = "branch";
                        setBranches((prev) => [...prev, info]);
                        
                    }
                });
            }
            const response2 = await getAllInventoryGroupPotato({});
            if (response2.data) {
                var data = response2.data.data;
                data.map((d) => {
                    var info = d;
                    info.type = "mango";
                    info.category = "inventory";
                    setBranchGroup((prev) => [...prev, info]);
                    setBranches((prev) => [...prev, info]);

                });
            }
        }
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
                    setnewItemDetails((prev) => [...prev, info])
                    return info
                });
                
                var inventories = response.data.data.inventory_group_details;
                var inventoryDeets = inventories.map((inventory, index) => {
                    var info = inventory
                    info.type = "inventory"
                    setnewItemDetails((prev) => [...prev, info])
                    return info
                });
                setnewItemDetailsInventory(inventoryDeets)
            }
            
        }
        else if(type === "potato_corner") {
            const response = await getInventoryDetailsPotato(id);
            if (response.data) {
                var inventories = response.data.warehouse_inventories;
                var inventoryDeets = inventories.map((inventory, index) => {
                    var info = inventory
                    return info
                });
                setnewItemDetails(inventoryDeets)
            }
        }
    }

    async function saveDetails() {
        if (type === "mango_magic") {
            const response = await createItemDetails(id, itemList.item_unit_id, warehouseIds, inventoryGroup, itemUnitIds, minimumLevels, maximumLevels, criticalLevel, currentLevel, acceptableVariances,
                beginningQty, units);
            if (response.data.status === "success") {
                toast.success(response.data.message, { style: toastStyle() });
                setTimeout(() => {
                    // navigate("/itemlists");
                }, 1000);
            } else {
                toast.error("Failed to create adjustment.", {
                    style: toastStyle(),
                });
                refreshPage();
            }
        } else if (type === "potato_corner") {
            const response = await createItemDetailsPotato(id, itemList.item_unit_id, warehouseIds, inventoryGroup, itemUnitIds, minimumLevels, maximumLevels, criticalLevel, currentLevel, acceptableVariances,
                beginningQty, units);
            if (response.data.status === "success") {
                toast.success(response.data.message, { style: toastStyle() });
                setTimeout(() => {
                    // navigate("/itemlists");
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
        const { name, value } = e.target;

        if(value === ""){
            if(name === "inventory_unit") {
                units.splice(index, 1);
            } else if(name === "min_level") {
                minimumLevels.splice(index, 1);
            } else if(name === "max_level") {
                maximumLevels.splice(index, 1);
            } else if(name === "critical_level") {
                criticalLevel.splice(index, 1);
            } else if(name === "current_level") {
                currentLevel.splice(index, 1);
            } else if(name === "beginning_inventory") {
                beginningQty.splice(index, 1);
            } else if(name === "acceptable_variance") {
                acceptableVariances.splice(index, 1);
            }
        } else {
            if(name === "inventory_unit") {
                units.splice(index, 0, value);
            } else if(name === "min_level") {
                minimumLevels.splice(index, 0, value);
            } else if(name === "max_level") {
                maximumLevels.splice(index, 0, value);
            } else if(name === "critical_level") {
                criticalLevel.splice(index, 0, value);
            } else if(name === "current_level") {
                currentLevel.splice(index, 0, value);
            } else if(name === "beginning_inventory") {
                beginningQty.splice(index, 0, value);
            } else if(name === "acceptable_variance") {
                acceptableVariances.splice(index, 0, value);
            }
        }
        
    }

    // SELECT DROPSEARCH CHANGE HANDLER
    // function handleSelectChange(e) {
    //     const newList = newItemAdjust;
    //     newList[e.name] = e.value;
    //     setNewItemAdjust(newList);

    //     if (e.name === "counted_by")
    //         setEmployeeValue({ name: e.name, label: e.label, value: e.value });
    // }

    React.useEffect(() => {
        setBranches([]);

        fetchData(id);
        // fetchDetails();
        fetchBranches();
        // fetchAllEmployees();
        // fetchAdjustmentTypes();
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
                                <Col>
                                    <span className="nc-modal-custom-row uppercase">
                                        Item Name
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <span className="nc-modal-custom-row uppercase">
                                    {itemList.item_name}
                                </span>
                            </Row>
                            <Row>
                                <div className="edit-purchased-items mt-4">
                                    {branches.length === 0 ? (
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