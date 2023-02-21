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
    createTransfer,
    updateTransfer,
} from "../../Helpers/apiCalls/Inventory/TransferApi";
import { 
    changeRequestStatus,
    changeRequestStatusPotato,
} from "../../Helpers/apiCalls/Inventory/RequestsApi";
import {
    getAllTransfersPotato,
    getTransferPotato,
    updateTransferPotato,
    updateTransferStatusPotato,
    recordTransferActionPotato,
    createTransferPotato,
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
import { validateTransfer } from "../../Helpers/Validation/Inventory/TransferValidation";
import InputError from "../../Components/InputError/InputError";
import toast from "react-hot-toast";
import Moment from "moment";
import ReactLoading from "react-loading";
/**
 *  COMPONENT: FORM TO ADD OR EDIT PAYMENT
 */
function FormTransfer({ add, edit, request }) {
    const { destination } = useParams();
    const { state } = useLocation();
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const { id, type } = useParams();
    let navigate = useNavigate();
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
    const [items, setItems] = useState([
        {
            entry: {
                name: "item_id",
                label: "",
                value: "",
            },
            prices: 0,
            units: "",
            quantities: "",
        },
        {
            entry: {
                name: "item_id",
                label: "",
                value: "",
            },
            prices: 0,
            units: "",
            quantities: "",
        },
        {
            entry: {
                name: "item_id",
                label: "",
                value: "",
            },
            prices: 0,
            units: "",
            quantities: "",
        },
        {
            entry: {
                name: "item_id",
                label: "",
                value: "",
            },
            prices: 0,
            units: "",
            quantities: "",
        },
        {
            entry: {
                name: "item_id",
                label: "",
                value: "",
            },
            prices: 0,
            units: "",
            quantities: "",
        },
    ]);
    const [banks, setBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [toBanks, setToBanks] = useState([]);
    const [itemsData, setItemsData] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);

    const [newTransfer, setNewTransfer] = useState({
        transfer_date: "",
        transfer_number: "",
        branch_from: "",
        branch_to: "",
        remarks: "",
        dispatcher: "0",
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
        name: "dispatcher",
        label: "",
        value: "",
    });

    useEffect(() => {
        if (add) {
            fetchAllEmployees();
            console.log(add, type)
            const role = getType();
            if (role === "inventory_officer") {
                setBranchFromValue({
                    name: "branch_from",
                    label: "Warehouse",
                    value: 1,
                });
                setNewTransfer((prev) => {
                    return { ...prev, branch_from: 1 };
                });
                fetchAllItems(1);
                fetchBranchToWithoutBranchFrom(1)
            }
            if (role === "commissary_officer") {
                setBranchFromValue({
                    name: "branch_from",
                    label: "Commissary",
                    value: 2,
                });
                setNewTransfer((prev) => {
                    return { ...prev, branch_from: 2 };
                });
                fetchAllItems(2);
                fetchBranchToWithoutBranchFrom(2)
            } else {
                fetchBranches();
            }
        }
    }, []);

    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        transfer_date: false,
        transfer_number: false,
        branch_from: false,
        branch_to: false,
        // dispatcher: false,
        listInfo: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        transfer_date: false,
        transfer_number: false,
        branch_from: false,
        branch_to: false,
        // dispatcher: false,
        listInfo: false,
    });

    if (newTransfer.transfer_date === "" && add) {
        setNewTransfer({
            transfer_date: Moment().format("YYYY-MM-DD"),
        });
    }

    // SELECT DROPSEARCH CHANGE HANDLER
    function handleSelectChange(e) {
        const newList = newTransfer;
        newList[e.name] = e.value;
        setNewTransfer(newList);

        if (e.name === "branch_to") {
            setBranchToValue({ name: e.name, label: e.label, value: e.value });
        } else if (e.name === "branch_from") {
            fetchAllItems(e.value);
            setBranchFromValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        } else if (e.name === "dispatcher")
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
    }

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
            units: "",
            quantities: "",
        };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    // INVOICE CHANGE HANDLER
    function handleItemChange(e, id) {
        setSelectedEntry(id);
        const { name, label, value, prices, quantities, unit, current_qty } = e;

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
                    if (item.quantities > item.current_qty) {
                        toast.error(
                            "Quantity Exceeds Current Branch Quantity",
                            {
                                style: toastStyle(),
                            }
                        );
                    }
                }
                return item;
            });
            setItems(newEntries);
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
                                                index
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
                                            value={parseFloat(item.quantities)}
                                            // value={parseFloat(item.quantities).toFixed(2)}
                                            onChange={(e) =>
                                                handleItemChange(e, index)
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
                                                handleItemChange(e, index)
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
                                                index
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="quantities"
                                            value={item.quantities}
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
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
                                                handleItemChange(e, index)
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

            }
        } else if (add && type === "potato_corner") {
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
                    return {
                        value: a.id,
                        label: a.name,
                        name: "branch_to",
                    };
                });
                setBranchTo(to);
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

                info.name = "dispatcher";
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
    async function saveTransfer() {
        if (isClicked) {
            return;
        }
        if (type === "mango_magic") {
            if (validateTransfer(newTransfer, items, setIsError, "add")) {
                setIsClicked(true);
                const cash = await createTransfer(newTransfer, items);
                if (cash.data.status === "success") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate(-1);
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
        } else if (type === "potato_corner") {
            if (validateTransfer(newTransfer, items, setIsError, "add")) {
                setIsClicked(true);
                const cash = await createTransferPotato(newTransfer, items);
                if (cash.data.status === "success") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate(-1);
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
    async function editTransfer(shopType) {
        if (shopType === "Mango") {
            if (validateTransfer(newTransfer, items, setIsError, "edit")) {
                const cash = await updateTransfer(newTransfer, items);
                if (cash.data.response === "transfer updated successfully") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate("/transfers/view/" + id + "/" + type);
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
            if (validateTransfer(newTransfer, items, setIsError, "edit")) {
                const cash = await updateTransferPotato(newTransfer, items);
                if (cash.data.response === "transfer updated successfully") {
                    toast.success(cash.data.response, { style: toastStyle() });
                    setTimeout(() => {
                        navigate("/transfers/view/" + id + "/" + type);
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

    async function fetchTransfer(id, type) {
        console.log(id, type)
        if (type === "Mango") {
            const response = await getTransfer(id);
            console.log(response)
            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    transfer_id: data.id,
                    transfer_date: data.transfer_date,
                    transfer_number: data.transfer_number,
                    branch_to: data.branch_to,
                    branch_from: data.branch_from,
                    remarks: data.remarks,
                    status: data.status,
                    dispatcher: data.dispatcher,
                });
                setEmployeeValue({
                    name: "dispatcher",
                    label: data.dispatcher_name,
                    value: data.dispatcher,
                });
                var itemEntries = data.transfer_items;
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
                    info.quantities = entry.qty;
                    return info;
                });
                setItems(clean);
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
        } else if (type === "Potato") {
            const response = await getTransferPotato(id);

            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    transfer_id: data.id,
                    transfer_date: data.transfer_date,
                    transfer_number: data.transfer_number,
                    branch_to: data.branch_to,
                    branch_from: data.branch_from,
                    remarks: data.remarks,
                    status: data.status,
                    dispatcher: data.dispatcher,
                });
                setEmployeeValue({
                    name: "dispatcher",
                    label: data.dispatcher_name,
                    value: data.dispatcher,
                });
                var itemEntries = data.transfer_items;
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
                    info.quantities = entry.qty;
                    return info;
                });
                setItems(clean);
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
                setEmployeeValue({
                    name: "dispatcher",
                    label: data.dispatcher_name,
                    value: data.dispatcher,
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
                    info.quantities = entry.qty;
                    return info;
                });
                setItems(clean);
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
                setEmployeeValue({
                    name: "dispatcher",
                    label: data.dispatcher_name,
                    value: data.dispatcher,
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
                    info.quantities = entry.qty;
                    return info;
                });
                setItems(clean);
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
            if (validateTransfer(newTransfer, items, setIsError, "add")) {
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
            if (validateTransfer(newTransfer, items, setIsError, "add")) {
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
        if (add) saveTransfer();
        if (request) saveRequest();
        if (edit) {
            var idInfo = id.split("-");
            var shopType = idInfo[0];
            var ID = idInfo[1];
            editTransfer(shopType);
        }
    }

    useEffect(() => {
        if (edit) {
            var idInfo = id.split("-");
            var shopType = idInfo[0];
            var ID = idInfo[1];
            fetchAllEmployees();
            fetchTransfer(ID, shopType);
            fetchBranches(shopType);
        }
        if (request) {
            fetchAllEmployees();
            fetchRequest();
            fetchBranches(shopType);
        }
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
                className={`manager-container container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <div className="row">
                    {add ? (
                        <h1 className="page-title mb-4">
                            ADD TRANSFER{" "}
                            {destination === "mango_magic" && "TO MANGO MAGIC"}
                            {destination === "potato_corner" &&
                                "TO POTATO CORNER"}
                        </h1>
                    ) : (
                        <h1 className="page-title mb-4">
                            EDIT TRANSFER{" "}
                            {destination === "mango_magic" && "TO MANGO MAGIC"}
                            {destination === "potato_corner" &&
                                "TO POTATO CORNER"}
                        </h1>
                    )}
                </div>

                {/* FORM */}

                <div className="edit-form">
                    <Fragment>
                        <Row className="pt-3 mb-2">
                            <Col xs={3}>
                                <span className="nc-modal-custom-row uppercase">
                                    Transfer Date
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
                                    name="transfer_date"
                                    defaultValue={newTransfer.transfer_date}
                                    className="react-select-container"
                                    onChange={(e) => handlePayChange(e)}
                                />
                                <InputError
                                    isValid={isError.transfer_date}
                                    message={"Transfer Date is required"}
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="number"
                                    name="transfer_number"
                                    defaultValue={newTransfer.transfer_number}
                                    className="react-select-container"
                                    onChange={(e) => handlePayChange(e)}
                                />
                                <InputError
                                    isValid={isError.transfer_number}
                                    message={"Transfer Number is required"}
                                />
                            </Col>
                            <Col xs={3}>
                                <Select
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
                                />
                            </Col>
                            <Col xs={3}>
                                <Select
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
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            {/* {edit && ( */}
                                <Col xs={4}>
                                    <span className="nc-modal-custom-row uppercase">
                                        Dispatcher
                                    </span>
                                </Col>
                            {/* )} */}

                            <Col xs={8}>
                                <span className="nc-modal-custom-row uppercase">
                                    Remarks
                                    <span className="edit-optional px-2">
                                        (Optional)
                                    </span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4}>
                                <Select
                                    name="dispatcher"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Dispatcher..."
                                    value={employeeValue}
                                    options={employeeOptions}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                                {/* <InputError
                                    isValid={isError.dispatcher}
                                    message={"Dispatcher is required"}
                                /> */}
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="remarks"
                                    defaultValue={newTransfer.remarks}
                                    className="react-select-container"
                                    onChange={(e) => handlePayChange(e)}
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    {/* INVOICES */}
                    <div className="mt-4 pt-3 d-flex flex-column">
                        <span className="nc-modal-custom-row mb-2 uppercase">
                            LIST OF ITEMS TO TRANSFER{" "}
                            <label className="badge-required">{` *`}</label>
                        </span>

                        <Container fluid className="edit-purchased-items">
                            {items.length === 0 ? (
                                <div className="entries-not-found">
                                    {add && "You haven't added any items yet."}
                                    {edit && "Items not found."}
                                </div>
                            ) : (
                                <>
                                    {edit && <>{renderTableEdit()}</>}
                                    {!edit && <>{renderTable()}</>}
                                </>
                            )}
                        </Container>
                        <Row className="my-2 align-right pb-2 align-items-start">
                            <Col className="pt-3 PO-add-item">
                                <Button type="button" onClick={() => AddItem()}>
                                    Add Item
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        {isClicked ? (
                            <div className="button-primary me-3 d-flex justify-content-center">
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
                                className="button-primary me-3"
                                onClick={handleSubmit}
                            >
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

FormTransfer.defaultProps = {
    add: false,
    edit: false,
};

export default FormTransfer;
