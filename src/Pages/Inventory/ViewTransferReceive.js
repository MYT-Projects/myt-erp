import React, { Fragment, useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import trash from "./../../Assets/Images/trash.png";
import Select from "react-select";
import "./Inventory.css";
import {
    formatDate,
    formatDateNoTime,
    getType,
    numberFormat,
    refreshPage,
    toastStyle,
} from "../../Helpers/Utils/Common";
import {
    getAllTransfers,
    getTransfer,
    getTransferReceive,
    createTransfer,
    createTransferReceive,
    updateTransferReceive,
    updateTransfer,
    updateTransferReceiveStatus,
} from "../../Helpers/apiCalls/Inventory/TransferApi";
import { 
    changeRequestStatus,
    changeRequestStatusPotato,
} from "../../Helpers/apiCalls/Inventory/RequestsApi";
import {
    getAllTransfersPotato,
    getTransferPotato,
    getTransferReceivePotato,
    updateTransferPotato,
    createTransferReceivePotato,
    updateTransferReceivePotato,
    updateTransferStatusPotato,
    recordTransferActionPotato,
    createTransferPotato,
    updateTransferReceiveStatusPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Inventory/TransferApi";
import { 
    getRequest, 
    getRequestPotato, 
} from "../../Helpers/apiCalls/Inventory/RequestsApi";
import {
    getAllItemList,
    getAllItemListPotato,
    getItemHistory,
} from "../../Helpers/apiCalls/Inventory/ItemListApi";
import { getAllBranches } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllBranchesPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import { getAllItems, getAllBranchItem } from "../../Helpers/apiCalls/itemsApi";
import { getAllEmployees } from "../../Helpers/apiCalls/employeesApi";
import { validateTransferReceive } from "../../Helpers/Validation/Inventory/TransferValidation";
import InputError from "../../Components/InputError/InputError";
import toast from "react-hot-toast";
import Moment from "moment";
import ReactLoading from "react-loading";
import TransferModal from "./Transfer/TransferModal";
/**
 *  COMPONENT: FORM TO ADD OR EDIT PAYMENT
 */
function ViewTransferReceive({ add, edit, request }) {
    let navigate = useNavigate();
    const { state } = useLocation();
    const { id, type } = useParams();
    var idInfo = id.split("-");
    var shopType = idInfo[0];
    var ID = idInfo[1];
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const [totalAmount, setTotalAmount] = useState(0);
    const [transactionFee, setTransactionFee] = useState("");
    const [grandTotal, setGrandTotal] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState("");

    // DATA HANDLERS
    const [branchFrom, setBranchFrom] = useState([]);
    const [branchTo, setBranchTo] = useState([]);
    const [entries, setEntries] = useState([]);
    const [entriesList, setEntriesList] = useState([]);
    const [receiveItems, setReceiveItems] = useState([])
    const [items, setItems] = useState([]);
    const [banks, setBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    const [itemsData, setItemsData] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);

    const [newTransfer, setNewTransfer] = useState({
        transfer_date: "",
        transfer_receive_date: "",
        transfer_number: "",
        branch_from: "",
        branch_to: "",
        remarks: "",
        dispatcher: "0",
        received_by: "",
    });

    const [transferData, setTransferData] = useState({});
    const [itemData, setItemData] = useState({});

    const [branchToValue, setBranchToValue] = useState({
        name: "branch_to",
        label: "",
        value: "",
    });
    const [branchFromValue, setBranchFromValue] = useState({
        name: "branch_from",
        label: "",
        value: "",
    });
    const [employeeValue, setEmployeeValue] = useState({
        name: "received_by",
        label: "",
        value: "",
    });

    /* Approve Modal */
    const [showApproveModal, setShowApproveModal] = useState(false);
    const handleShowApproveModal = () => setShowApproveModal(true);
    const handleCloseApproveModal = () => setShowApproveModal(false);

    // useEffect(() => {
    //     if (add) {
    //         console.log(add)
    //         const role = getType();
    //         if (role === "inventory_officer") {
    //             setBranchFromValue({
    //                 name: "branch_from",
    //                 label: "Warehouse",
    //                 value: 1,
    //             });
    //             setNewTransfer((prev) => {
    //                 return { ...prev, branch_from: 1 };
    //             });
    //             fetchAllItems(1);
    //         }
    //         if (role === "commissary_officer") {
    //             setBranchFromValue({
    //                 name: "branch_from",
    //                 label: "Commissary",
    //                 value: 2,
    //             });
    //             setNewTransfer((prev) => {
    //                 return { ...prev, branch_from: 2 };
    //             });
    //             fetchAllItems(2);
    //         } else {
    //             fetchBranches();
    //         }
    //     }
    // }, []);

    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        transfer_receive_date: false,
        received_by: false,
    });

    if (newTransfer.transfer_receive_date === "" && type === "create") {
        setNewTransfer({
            transfer_receive_date: Moment().format("YYYY-MM-DD"),
        });
    }

    // SELECT DROPSEARCH CHANGE HANDLER
    function handleSelectChange(e) {
        const newList = newTransfer;
        newList[e.name] = e.value;
        setNewTransfer(newList);
        console.log(e.name, e.value)

        if (e.name === "branch_to") {
            setBranchToValue({ name: e.name, label: e.label, value: e.value });
        } else if (e.name === "branch_from") {
            fetchAllItems(e.value);
            setBranchFromValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        } else if (e.name === "received_by")
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
    }

    console.log(newTransfer)

    // PAYMENT DETAILS CHANGE HANDLER
    function handlePayChange(e) {
        const { name, value } = e.target;
        const newList = newTransfer;
        newList[name] = value;
        setNewTransfer(newList);
    }

    // ADD ANOTHER INVOICE HANDLER
    function AddItem() {
        const newItem = {
            entry: {
                name: "item_id",
                label: "",
                value: "",
            },
            prices: 0,
            id: 0,
            units: "",
            quantities: "",
        };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    // INVOICE CHANGE HANDLER
    function handleItemChange(e, id, table) {
        setSelectedEntry(id);
        const { name, label, value, prices, quantities, unit, current_qty } = e;
        if(table === "additional") {
            if (name === "item_id") {
                var entryData = entries.filter((entry) => {
                    return entry.value === value;
                });
                var newItemList = items;
                var newEntries = newItemList.map((item, index) => {
                    if (index === id) {
                        var info = {
                            name: name,
                            label: label,
                            value: value,
                        };
                        item.entry = info;
                        item.prices = prices;
                        item.units = unit;
                        item.current_qty = current_qty;
                    }
                    return item;
                });
                setItems(newEntries);
            }
    
            if (name === undefined && e.target.name === "quantities") {
                var newItemList = items;
                var newEntries = newItemList.map((item, index) => {
                    if (index === id) {
                        item["quantities"] = e.target.value;
                    }
                    return item;
                });
                setItems(newEntries);
            }
        } else {
            if (name === undefined && e.target.name === "quantities") {
                var newItemList = receiveItems;
                var newEntries = newItemList.map((item, index) => {
                    if (index === id) {
                        item["quantities"] = e.target.value;
                    }
                    return item;
                });
                setReceiveItems(newEntries);
                console.log(newEntries)
            }
        }
        
    }

    // INVOICE REMOVAL HANDLER
    function handleRemoveItem(id) {
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);
    }

    //  DISPLAY THE LIST OF ITEMS TABLE
    function renderTable() {
        return (
            <Table className="ps-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        return (
                            <tr key={index}>
                                <td className="select-cell">
                                    <Select
                                        className="text-start react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select Item..."
                                        options={entries}
                                        value={item.entry}
                                        onChange={(e) =>
                                            handleItemChange(
                                                e,
                                                index, 
                                                "additional"
                                            )
                                        }
                                    />
                                    <InputError
                                        isValid={isError.listInfo}
                                        message={"Item is required"}
                                    />
                                </td>
                                <td>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="quantities"
                                            value={item.quantities}
                                            onChange={(e) =>
                                                handleItemChange(e, index, "additional")
                                            }
                                        />
                                        <InputError
                                            isValid={isError.listInfo}
                                            message={"Quantity is required"}
                                        />
                                    </Col>
                                </td>
                                <td>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="units"
                                            value={item.units}
                                            onChange={(e) =>
                                                handleItemChange(e, index, "additional")
                                            }
                                        />
                                    </Col>
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

    function renderTableEdit() {
        return (
            <Table className="ps-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Expected</th>
                        <th>Received</th>
                    </tr>
                </thead>
                <tbody>
                    {receiveItems.map((item, index) => {
                        // console.log(item)
                        return (
                            <tr key={index}>
                                <td className="franchise-td-gray">
                                    {item.label}
                                </td>
                                <td className="franchise-td-gray">
                                    {numberFormat(item.expected_qty)}
                                </td>
                                <td className="franchise-td-gray">
                                    {numberFormat(item.quantities)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    //  FETCH INVENTORY ITEMS   //
    async function fetchAllItems(id, shopType) {
        setEntries([]);
        setShowLoader(true);

        if (type === "mango_magic" || ((edit || request) && shopType === "Mango")) {
            const response = await getAllItemList(id);
            if (response.data) {
                var itemsList = response.data.data;
                var clean = itemsList.map((entry) => {
                    var info = {};
                    info.name = "item_id";
                    info.value = entry.item_id;
                    info.label = entry.item_name;
                    info.entry = {
                        name: "item_id",
                        value: entry.item_id,
                        label: entry.item_name,
                    };
                    info.unit = entry.inventory_unit_name;
                    info.prices = entry.price;
                    info.current_qty = parseInt(entry.current_qty);
                    entry.item_units
                        ? entry.item_units.map((i) => {
                              info.unit = i.inventory_unit_name;
                              info.prices = i.price;
                              info.current_qty = parseInt(i.current_qty);
                          })
                        : (info.units = "");
                    return info;
                });
                setEntries(clean);
                setEntriesList(clean);
            } else {
                setItemsData([]);
            }
        } else if (type === "potato_corner" || ((edit || request) && shopType === "Potato")) {
            const response2 = await getAllItemListPotato(id);
            if (response2.data) {
                var itemsList = response2.data.data;
                var clean = itemsList.map((entry) => {
                    var info = {};
                    info.name = "item_id";
                    info.value = entry.item_id;
                    info.label = entry.item_name;
                    info.entry = {
                        name: "item_id",
                        value: entry.item_id,
                        label: entry.item_name,
                    };
                    info.unit = entry.inventory_unit_name;
                    info.prices = entry.price;
                    info.current_qty = parseInt(entry.current_qty);
                    entry.item_units
                        ? entry.item_units.map((i) => {
                              info.unit = i.inventory_unit_name;
                              info.prices = i.price;
                              info.current_qty = parseInt(i.current_qty);
                          })
                        : (info.units = "");
                    return info;
                });
                setEntries(clean);
                setEntriesList(clean);
            } else {
                setItemsData([]);
            }
        }

        setShowLoader(false);
    }

    async function fetchBranchToWithoutBranchFrom(branch_id) {
        setBranchTo([]);
        if (add && type === "mango_magic") {
            const response = await getAllBranches();
            if (response) {
                var allBranches = [];
                let to = response.data.data.map((a) => {
                    if (a.id !== branch_id) {
                        allBranches.push({
                            value: a.id,
                            label: a.name,
                            name: "branch_to",
                        });
                    }
                });
            }
        } else if (add && type === "potato_corner") {
            const response = await getAllBranchesPotato();
            const response2 = await getAllBranches();

            if (response) {
                var allBranches = [];
                let toMain = response2.data.data.map((a) => {
                    if (a.id >= "1" && a.id <= "5" && a.id !== branch_id) {
                        allBranches.push({
                            value: a.id,
                            label: a.name,
                            name: "branch_to",
                        });
                    }
                });

                let to = response.data.data.map((a) => {
                    if (a.id !== branch_id) {
                        allBranches.push({
                            value: a.id,
                            label: a.name,
                            name: "branch_to",
                        });
                    }
                });

                setBranchTo(allBranches);
            }
        }
    }

    async function fetchBranches(shopType) {
        setBranchTo([]);
        setBranchFrom([]);
        console.log(edit, shopType)
        if ((add && type === "mango_magic") || ((edit || request) && shopType === "Mango")) {
            const response = await getAllBranches();

            if (response) {
                var sortedTo = response.data.data.sort((a, b) =>
                    a.name > b.name
                        ? 1
                        : b.name > a.name
                        ? -1
                        : 0
                );
                let to = sortedTo.map((a) => {
                    return {
                        value: a.id,
                        label: a.name,
                        name: "branch_to",
                    };
                });
                setBranchTo(to);

                let from = response.data.data.map((a) => {
                    if ( a.is_franchise === "3") {
                        var info = {};
                        info.value = a.id;
                        info.label = a.name;
                        info.name = "branch_from";
                        setBranchFrom((prev) => [...prev, info]);
                    }
                });
            }
        } else if ((add && type === "potato_corner")  || ((edit || request) && shopType === "Potato")) {
            const response = await getAllBranchesPotato();
            if (response) {
                var sortedTo = response.data.data.sort((a, b) =>
                    a.name > b.name
                        ? 1
                        : b.name > a.name
                        ? -1
                        : 0
                );
                let to = sortedTo.map((a) => {
                    var info = {};
                    info.value = a.id;
                    info.label = a.name;
                    info.name = "branch_to";
                    setBranchTo((prev) => [...prev, info]);
                });

                let from = response.data.data.map((a) => {
                    if ( a.is_franchise === "3") {
                        var info = {};
                        info.value = a.id;
                        info.label = a.name;
                        info.name = "branch_from";
                        setBranchFrom((prev) => [...prev, info]);
                    }
                });
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

                info.name = "received_by";
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

    /** POST API - SAVE NEW PAYMENT **/
    async function saveTransferReceive() {
        console.log(newTransfer)
        console.log(items)
        console.log(receiveItems)
        console.log(type)

        if (isClicked) {
            return;
        }
        if (shopType === "Mango") {
            if (validateTransferReceive(newTransfer, items, setIsError, "add")) {
                setIsClicked(true);
                const cash = await createTransferReceive(newTransfer, receiveItems, items);
                if (cash.data.status === "success") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate("/transfers");
                    }, 1000);
                } else {
                    toast.error(cash.data.response, {
                        style: toastStyle(),
                    });
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        } else if (shopType === "Potato") {
            if (validateTransferReceive(newTransfer, items, setIsError, "add")) {
                setIsClicked(true);
                const cash = await createTransferReceivePotato(newTransfer, receiveItems, items);
                if (cash.data.status === "success") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate("/transfers");
                    }, 1000);
                } else {
                    toast.error(cash.data.response, {
                        style: toastStyle(),
                    });
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        }
    }

    /** POST API - SAVE NEW PAYMENT **/
    async function editTransferReceive() {
        console.log(shopType)
        console.log(newTransfer)
        console.log(items)
        console.log(receiveItems)

        if (shopType === "Mango") {
            if (validateTransferReceive(newTransfer, items, setIsError, "edit")) {
                const cash = await updateTransferReceive(newTransfer, receiveItems, items);
                if (cash.data.response === "transfer receive updated successfully") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate("/transfers");
                    }, 1000);
                } else {
                    toast.error(cash.data.response, {
                        style: toastStyle(),
                    });
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        } else if (shopType === "Potato") {
            if (validateTransferReceive(newTransfer, items, setIsError, "edit")) {
                const cash = await updateTransferReceivePotato(newTransfer, receiveItems, items);
                if (cash.data.response === "transfer receive updated successfully") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate("/transfers");
                    }, 1000);
                } else {
                    toast.error(cash.data.response, {
                        style: toastStyle(),
                    });
                }
            } else {
                toast.error("Please fill in all required fields", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function handleApproveTransferReceive() {
        console.log(shopType)
        console.log(newTransfer)

        if (shopType === "Mango") {
            const cash = await updateTransferReceiveStatus(newTransfer.id, "completed");
            console.log(cash)
            if (cash.data.response === "Status changed successfully") {
                toast.success("Transfer moved to for Approval", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    handleCloseApproveModal();
                    // refreshPage();
                }, 1000);
            } else {
                toast.error(cash.data.response, {
                    style: toastStyle(),
                });
                handleCloseApproveModal();
            }
        } else if (shopType === "Potato") {
            const cash = await updateTransferReceiveStatusPotato(newTransfer.id, "completed");
            console.log(cash)
            if (cash.data.response === "Status changed successfully") {
                toast.success("Transfer moved to for Approval", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    handleCloseApproveModal();
                    // refreshPage();
                }, 1000);
            } else {
                toast.error(cash.data.response, {
                    style: toastStyle(),
                });
                handleCloseApproveModal();
            }
        }
        

    }

    async function fetchTransfer(id) {
        console.log(id, type)
        if (shopType === "mango") {
            const response = await getTransferReceive(id);
            console.log(response)
            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    id: data.id,
                    transfer_receive_id: data.id,
                    transfer_id: data.transfer_id,
                    transfer_date: data.transfer_date,
                    transfer_number: data.transfer_number,
                    branch_to: data.branch_to,
                    branch_to_name: data.branch_to_name,
                    branch_from: data.branch_from,
                    branch_from_name: data.branch_from_name,
                    remarks: data.remarks,
                    status: data.status,
                    dispatcher: data.dispatcher,
                    dispatcher_name: data.dispatcher_name,
                    completed_by_name: data.completed_by_name,
                    transfer_receive_date: data.completed_on ? Moment(data.completed_on).format("YYYY-MM-DD") : "",
                    received_by: data.completed_by,
                });
                setEmployeeValue({
                    name: "received_by",
                    label: data.completed_by_name,
                    value: data.completed_by,
                });
                var itemEntries = data.transfer_receive_items;
                var clean = itemEntries.map((entry) => {
                    var info = {};
                    info.name = "item_id";
                    info.id = entry.id;
                    info.value = entry.item_id;
                    info.label = entry.item_name;
                    info.entry = {
                        name: "item_id",
                        value: entry.item_id,
                        label: entry.item_name,
                    };
                    info.units = entry.unit;
                    info.prices = entry.price;
                    info.expected_qty = entry.transfer_qty;
                    info.quantities = entry.received_qty;
                    return info;
                });
                setReceiveItems(clean);
                var fromInfo = {};
                fromInfo.name = "branch_from";
                fromInfo.label = data.branch_from_name;
                fromInfo.value = data.branch_from;
                setBranchFromValue(fromInfo);
                var toInfo = {};
                toInfo.name = "branch_to";
                toInfo.label = data.branch_to_name;
                toInfo.value = data.branch_to;
                setBranchToValue(toInfo);
                fetchAllItems(data.branch_from, "Mango");
            }
        } else if (shopType === "potato") {
            const response = await getTransferReceivePotato(id);

            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    transfer_receive_id: data.id,
                    transfer_id: data.transfer_id,
                    transfer_date: data.transfer_date,
                    transfer_number: data.transfer_number,
                    branch_to: data.branch_to,
                    branch_to_name: data.branch_to_name,
                    branch_from: data.branch_from,
                    branch_from_name: data.branch_from_name,
                    remarks: data.remarks,
                    status: data.status,
                    dispatcher: data.dispatcher,
                    dispatcher_name: data.dispatcher_name,
                    transfer_receive_date: data.completed_on ? Moment(data.completed_on).format("YYYY-MM-DD") : "",
                    received_by: data.completed_by,
                    completed_by_name: data.completed_by_name,
                });
                setEmployeeValue({
                    name: "received_by",
                    label: data.completed_by_name,
                    value: data.completed_by,
                });
                var itemEntries = data.transfer_receive_items;
                var clean = itemEntries.map((entry) => {
                    var info = {};
                    info.name = "item_id";
                    info.id = entry.id;
                    info.value = entry.item_id;
                    info.label = entry.item_name;
                    info.entry = {
                        name: "item_id",
                        value: entry.item_id,
                        label: entry.item_name,
                    };
                    info.units = entry.unit;
                    info.prices = entry.price;
                    info.expected_qty = entry.transfer_qty;
                    info.quantities = entry.received_qty;
                    return info;
                });
                setReceiveItems(clean);
                var fromInfo = {};
                fromInfo.name = "branch_from";
                fromInfo.label = data.branch_from_name;
                fromInfo.value = data.branch_from;
                setBranchFromValue(fromInfo);
                var toInfo = {};
                toInfo.name = "branch_to";
                toInfo.label = data.branch_to_name;
                toInfo.value = data.branch_to;
                setBranchToValue(toInfo);
                fetchAllItems(data.branch_from, "Potato");
            }
        }
        
    }

    console.log(newTransfer)

    async function fetchRequest() {
        if (type === "mango_magic") {
            const response = await getRequest(id);

            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    request_id: data.id,
                    transfer_date: Moment().format("YYYY-MM-DD"),
                    transfer_number: data.transfer_number,
                    branch_to: data.branch_to,
                    branch_from: data.branch_from,
                    remarks: "",
                    status: data.status,
                    dispatcher: data.dispatcher,
                });
                var itemEntries = data.request_items;
                var clean = itemEntries.map((entry) => {
                    var info = {};
                    info.name = "item_id";
                    info.value = entry.item_id;
                    info.label = entry.item_name;
                    info.entry = {
                        name: "item_id",
                        value: entry.item_id,
                        label: entry.item_name,
                    };
                    info.units = entry.unit;
                    info.prices = entry.price;
                    info.expected_qty = entry.transfer_qty;
                    info.quantities = entry.received_qty;
                    return info;
                });
                setReceiveItems(clean);
                var fromInfo = {};
                fromInfo.name = "branch_from";
                fromInfo.label = data.branch_from_name;
                fromInfo.value = data.branch_from;
                setBranchFromValue(fromInfo);
                var toInfo = {};
                toInfo.name = "branch_to";
                toInfo.label = data.branch_to_name;
                toInfo.value = data.branch_to;
                setBranchToValue(toInfo);
                fetchAllItems(data.branch_from, "Mango");
            } else if (response.error) {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else if (type === "potato_corner") {
            const response = await getTransferPotato(id);

            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    request_id: data.id,
                    transfer_date: data.transfer_date,
                    transfer_number: data.transfer_number,
                    branch_to: data.branch_to,
                    branch_from: data.branch_from,
                    remarks: data.remarks,
                    status: data.status,
                    dispatcher: data.dispatcher,
                });
                var itemEntries = data.request_items;
                var clean = itemEntries.map((entry) => {
                    var info = {};
                    info.name = "item_id";
                    info.value = entry.item_id;
                    info.label = entry.item_name;
                    info.entry = {
                        name: "item_id",
                        value: entry.item_id,
                        label: entry.item_name,
                    };
                    info.units = entry.unit;
                    info.prices = entry.price;
                    info.expected_qty = entry.transfer_qty;
                    info.quantities = entry.received_qty;
                    return info;
                });
                setReceiveItems(clean);
                var fromInfo = {};
                fromInfo.name = "branch_from";
                fromInfo.label = data.branch_from_name;
                fromInfo.value = data.branch_from;
                setBranchFromValue(fromInfo);
                var toInfo = {};
                toInfo.name = "branch_to";
                toInfo.label = data.branch_to_name;
                toInfo.value = data.branch_to;
                setBranchToValue(toInfo);
                fetchAllItems(data.branch_from, "Potato");
            } else if (response.error) {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        }
    }

    async function saveRequest() {
        if (isClicked) {
            return;
        }
        if (type === "mango_magic") {
            if (validateTransferReceive(newTransfer, items, setIsError, "add")) {
                const response = await createTransfer(newTransfer, items);
                if (response.data.status === "success") {

                    const response2 = await changeRequestStatus(id, "processing");
                    if (response2.data) {
                        toast.success("Successfully created transfer!", {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            navigate("/transfers");
                        }, 1000);
                    } else if (response2.error) {
                        toast.error(
                            "Something went wrong",
                            { style: toastStyle() }
                        );
                        setTimeout(() => {
                            navigate("/transfers");
                        }, 1000);
                    }
                } else {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                }
            }

        } else if (type === "potato_magic") {
            if (validateTransferReceive(newTransfer, items, setIsError, "add")) {
                const response = await createTransferPotato(newTransfer, items);
                if (response.data.status === "success") {
                    const response2 = await changeRequestStatus(id, "processing");
                    if (response2.data) {
                        toast.success("Successfully created transfer!", {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            navigate(-1);
                        }, 1000);
                    } else if (response2.error) {
                        toast.error(
                            "Something went wrong",
                            { style: toastStyle() }
                        );
                        setTimeout(() => {
                            navigate(-1);
                        }, 1000);
                    }
                } else {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                }
            }
        }
    }

    function handleSubmit() {
        if (edit && type === "create") {
            saveTransferReceive();
        } else if (edit && type === "update") {
            editTransferReceive();
        }
    }

    useEffect(() => {
        if (edit) {
            fetchAllEmployees();
            fetchTransfer(ID);
            fetchBranches(shopType);
        }
        // if (request) {
        //     fetchAllEmployees();
        //     fetchRequest();
        //     fetchBranches(shopType);
        // }
    }, []);

    useEffect(() => {
        if (state) {
            setBranchFromValue({
                name: "branch_from",
                label: state.from_branch_name,
                value: state.from_branch_id,
            });

            fetchAllItems(state.from_branch_id);
            setBranchToValue({
                name: "branch_to",
                label: state.to_branch_name,
                value: state.to_branch_id,
            });
            setNewTransfer((prev) => {
                return {
                    ...prev,
                    branch_from: state.from_branch_id,
                    branch_to: state.to_branch_id,
                };
            });

            var requestedItems = state.purchased_items.map((item) => {
                var info = {};
                info.entry = {
                    name: "item_id",
                    value: item?.item_id,
                    label: item?.item_name,
                };
                info.quantities = "0";
                info.units = item.inventory_unit_name;
                info.current_qty = item?.current_qty;

                return info;
            });
            setItems(requestedItems);
        }
    }, []);

    console.log(newTransfer)

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
            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <div className="row">
                    {type === "create" ? (
                        <h1 className="page-title mb-4">
                            RECEIVE TRANSFER{" "}
                        </h1>
                    ) : (
                        <h1 className="page-title mb-4">
                            REVIEW TRANSFER{" "}
                        </h1>
                    )}
                </div>

                {/* FORM */}

                <div className="edit-form ps-form">
                    <Fragment>
                        <Row className="pt-3 mb-2">
                            <Col xs={3}>
                                <span className="nc-modal-custom-row uppercase">
                                    Transfer Receive Date
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="nc-modal-custom-row uppercase">
                                    transfer slip no.
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="nc-modal-custom-row uppercase">
                                    From
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="nc-modal-custom-row uppercase">
                                    To
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row className="align-items-start">
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="transfer_receive_date"
                                    defaultValue={newTransfer.transfer_receive_date}
                                    className="react-select-container"
                                    disabled
                                />
                                <InputError
                                    isValid={isError.transfer_receive_date}
                                    message={"Transfer receive date is required"}
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="number"
                                    name="transfer_number"
                                    defaultValue={newTransfer.transfer_number}
                                    className="react-select-container"
                                    disabled
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="text"
                                    name="branch_from_name"
                                    defaultValue={newTransfer.branch_from_name}
                                    className="react-select-container"
                                    disabled
                                />
                                {/* <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchFromValue}
                                    options={branchFrom}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                                <InputError
                                    isValid={isError.branch_from}
                                    message={"Branch From is required"}
                                /> */}
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="text"
                                    name="branch_to_name"
                                    defaultValue={newTransfer.branch_to_name}
                                    className="react-select-container"
                                    disabled
                                />
                                {/* <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchToValue}
                                    options={branchTo}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                                <InputError
                                    isValid={isError.branch_to}
                                    message={"Branch To is required"}
                                /> */}
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            {edit && (
                                <Col xs={6}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Dispatcher
                                    </span>
                                </Col>
                            )}

                            <Col xs={6}>
                                <span className="nc-modal-custom-row uppercase">
                                    Received By
                                    <label className="badge-required">{` *`}</label>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            {edit && (
                                <Col xs={6}>
                                    <Form.Control
                                        type="text"
                                        name="dispatcher_name"
                                        defaultValue={newTransfer.dispatcher_name}
                                        className="react-select-container"
                                        disabled
                                    />
                                </Col>
                            )}
                            {edit && (
                                <Col xs={6}>
                                    <Form.Control
                                        type="text"
                                        name="completed_by_name"
                                        defaultValue={newTransfer.completed_by_name}
                                        className="react-select-container"
                                        disabled
                                    />
                                </Col>
                            )}
                        </Row>
                    </Fragment>

                    {/* INVOICES */}
                    <div className="mt-4 pt-3 d-flex flex-column">
                        <span className="nc-modal-custom-row mb-2 uppercase">
                            ITEM LIST{" "}
                            <label className="badge-required">{` *`}</label>
                        </span>
                        <div className="edit-purchased-items">
                            {receiveItems.length === 0 ? (
                                <div className="entries-not-found">
                                    {edit && "Items not found."}
                                </div>
                            ) : (
                                <>
                                    {edit && <>{renderTableEdit()}</>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

ViewTransferReceive.defaultProps = {
    add: false,
    edit: false,
};

export default ViewTransferReceive;
