import React, { useState } from "react";
import { Button, Col, Container, Row, Form, Table } from "react-bootstrap";
import Select from "react-select";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import trash from "./../../Assets/Images/trash.png";
import {
    capitalizeFirstLetter,
    formatDate,
    numberFormat,
    toastStyle,
    refreshPage,
    getTodayDateISO,
    TokenExpiry,
} from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import {
    getAllTransfers,
    getTransfer,
    updateTransferStatus,
    recordTransferAction,
} from "../../Helpers/apiCalls/Inventory/TransferApi";
import {
    getAllTransfersPotato,
    getTransferPotato,
    updateTransferStatusPotato,
    recordTransferActionPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Inventory/TransferApi";
import { getAllBranches } from "../../Helpers/apiCalls/Manage/Branches";
import { getAllEmployees } from "../../Helpers/apiCalls/employeesApi";
import { getSingleUser } from "../../Helpers/apiCalls/usersApi";
import {
    getAllItemList,
    getItemHistory,
    updateItemListInventory,
} from "../../Helpers/apiCalls/Inventory/ItemListApi";
import { validateTransferView } from "../../Helpers/Validation/Inventory/TransferValidation";
import InputError from "../../Components/InputError/InputError";
import TransferModal from "./Transfer/TransferModal";
import Moment from "moment";
import cleanLogo from "../../Assets/Images/Login/logo.png";

export default function ViewTransfer() {
    const { id, type } = useParams();
    let navigate = useNavigate();

    var idInfo = id.split("-");
    var shopType = idInfo[0];
    var ID = idInfo[1];

    const [inactive, setInactive] = useState(true);
    const [isSet, setIsSet] = useState(false);
    const [gotBranches, setGotBranches] = useState(false);
    const [transaction, setTransaction] = useState([]);
    const [items, setItems] = useState([]);
    const [newTransfer, setNewTransfer] = useState({
        transfer_date: "",
        branch_from: "",
        branch_from_name: "",
        encoded_by: "",
        branch_to: "",
        branch_to_name: "",
        remarks: "",
    });
    const [itemData, setItemData] = useState({});
    const [additionalItemData, setAdditionalItemData] = useState([]);
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
    const [toBanks, setToBanks] = useState([]);
    const [fromBanks, setFromBanks] = useState([]);
    const [branchesData, setBranchesData] = useState([]);
    const [userData, setUserData] = useState({});
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [employeeValue, setEmployeeValue] = useState({
        name: "dispatcher",
        label: "",
        value: "",
    });
    const [entries, setEntries] = useState([]);
    const [entriesList, setEntriesList] = useState([]);
    const [itemsData, setItemsData] = useState([]);
    const [newDetails, setNewDetails] = useState({
        transfer_number: "",
        dispatcher: "",
    });

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        transfer_number: false,
        dispatcher: false,
    });

    /* print modal handler */
    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);
    const [printPI, setPrintPI] = useState([]);

    /* approve modal handler */
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const handleShowApprovalModal = () => {
        if (validateTransferView(newTransfer, items, setIsError)) {
            setShowApprovalModal(true);
        } else {
            handleCloseApprovalModal();
            toast.error("Please fill in all required fields", {
                style: toastStyle(),
            });
        }
    };
    const handleCloseApprovalModal = () => setShowApprovalModal(false);

    async function handlePrintPI() {
        toast.loading("Printing Transfer Details", { style: toastStyle() });
        handleClosePrintModal();
        setTimeout(() => {
            toast.dismiss();
            Print();
        }, 1000);
    }

    function Print() {
        let printContents = document.getElementById("printablediv").innerHTML;
        let originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print(printContents);
        document.body.innerHTML = originalContents;
        refreshPage();
    }

    function handleDetailChange(e) {
        const { name, value } = e.target;
        const newList = newTransfer;
        newList[name] = value;
        setNewTransfer(newList);
    }

    // SELECT DROPSEARCH CHANGE HANDLER
    function handleSelectChange(e) {
        const newList = newTransfer;
        newList[e.name] = e.value;
        setNewTransfer(newList);

        if (e.name === "dispatcher")
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
    }

    async function fetchTransfer() {
        if (shopType === "Mango") {
            const response = await getTransfer(ID);

            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    transfer_number: data.transfer_number,
                    doc_no: "Mango-" + data.id,
                    encoded_by_id: data.added_by,
                    encoded_by: data.added_by_name,
                    transfer_date: data.transfer_date,
                    dispatcher: data.dispatcher > 0 ? data.dispatcher : "",
                    dispatcher_id: data.dispatcher,
                    dispatcher_name: data.dispatcher_name,
                    branch_to: data.branch_to,
                    branch_from: data.branch_from,
                    branch_to_name: data.branch_to_name,
                    branch_from_name: data.branch_from_name,
                    remarks: data.remarks,

                    received_date: data.completed_on ? data.completed_on.split(" ")[0] : "N/A",
                    received_by_id: data.completed_by,
                    received_by: data.completed_by_name,
                });
                setEmployeeValue({
                    name: "dispatcher",
                    label: data.dispatcher_name,
                    value: data.dispatcher,
                });
                var additionals = data.transfer_receive_items.map((item => {
                    var info = item;
                    info.item_name = `${item.item_name} (Additional)`
                    return info;
                }))
                var itemEntries = data.transfer_items.concat(additionals);
                setItemData(data.transfer_items);
                setAdditionalItemData(itemEntries);
                fetchAllItems(data.branch_from);
                setIsSet(true);
            }
        } else if (shopType === "Potato") {
            const response = await getTransferPotato(ID);

            if (response.data.status === "success") {
                var data = response.data.data[0];
                setNewTransfer({
                    transfer_number: data.transfer_number,
                    doc_no: "Potato-" + data.id,
                    encoded_by_id: data.added_by,
                    encoded_by: data.added_by_name || "N/A",
                    transfer_date: data.transfer_date,
                    dispatcher: data.dispatcher > 0 ? data.dispatcher : "",
                    dispatcher_id: data.dispatcher,
                    dispatcher_name: data.dispatcher_name,
                    branch_to: data.branch_to,
                    branch_from: data.branch_from,
                    branch_to_name: data.branch_to_name,
                    branch_from_name: data.branch_from_name,
                    remarks: data.remarks,

                    received_date: data.completed_on ? data.completed_on.split(" ")[0] : "N/A",
                    received_by_id: data.completed_by,
                    received_by: data.completed_by_name,
                });
                setEmployeeValue({
                    name: "dispatcher",
                    label: data.dispatcher_name,
                    value: data.dispatcher,
                });
                var additionals = data.transfer_receive_items.map((item => {
                    var info = item;
                    info.item_name = `${item.item_name} (Additional)`
                    return info;
                }))
                var itemEntries = data.transfer_items.concat(additionals);
                setItemData(data.transfer_items);
                setAdditionalItemData(itemEntries);
                fetchAllItems(data.branch_from);
                setIsSet(true);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        }
    }

    async function fetchBranches() {
        setBranchesData([]);
        const response = await getAllBranches();

        if (response) {
            let result = response.data.data.data.map((a) => {
                return {
                    id: a.id,
                    branch_name: a.name,
                    address: a.address,
                    phone_number: a.contact_person_no,
                    initial_cash: a.initial_drawer,
                };
            });
            setBranchesData(result);
            setGotBranches(true);
        }
    }

    //API CALL
    async function fetchAllEmployees() {
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
    }

    //  FETCH INVENTORY ITEMS   //
    async function fetchAllItems(id) {
        const response = await getAllItemList(ID);
        if (response.data.data) {
            var itemsList = response.data.data;
            var clean = itemsList.map((entry) => {
                var info = {};
                info.name = "item_id";
                info.value = entry.id;
                info.label = entry.item_name;
                info.entry = {
                    name: "item_id",
                    value: entry.id,
                    label: entry.item_name,
                };
                info.branch_id = entry.branch_id;
                info.inventory_id = entry.id;
                info.ingredient_id = entry.item_id;

                info.unit = entry.inventory_unit_name;
                info.prices = entry.price;
                info.current_qty = parseInt(entry.current_qty);
                return info;
            });
            setEntries(clean);
            setEntriesList(clean);
        } else {
            setItemsData([]);
        }
    }

    function handleApproveTransfer() {
        handleRecordStatusApproved();
    }

    /** POST API - UPDATE TRANSFER STATUS **/
    async function handleChangeStatusApprove() {
        const cash = await updateTransferStatus(
            newTransfer.doc_no,
            "Processed"
        );
        if (cash.data.response === "Status changed successfully") {
            toast.success(cash.data.response, { style: toastStyle() });
            setTimeout(() => {
                handleCloseApprovalModal();
                navigate(
                    "/transfers/view/" + newTransfer.doc_no + "/" + "processed"
                );
            }, 1000);
        } else {
            toast.error(cash.data.response, {
                style: toastStyle(),
            });
        }
    }

    async function handleRecordStatusApproved() {
        if (shopType === "Mango") {
            const response = await recordTransferAction(
                newTransfer,
                "approved"
            ); 
            if (response.data.status === "success") {
                toast.success(response.data.response, { style: toastStyle() });
                setTimeout(() => {
                    handleCloseApprovalModal();
                }, 1000);
                navigate(
                    "/transfers/view/" + newTransfer.doc_no + "/" + "processed"
                );
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
            }
        } else if (shopType === "Potato") {
            const response = await recordTransferActionPotato(
                newTransfer,
                "approved"
            );
            if (response.data.status === "success") {
                toast.success(response.data.response, { style: toastStyle() });
                setTimeout(() => {
                    handleCloseApprovalModal();
                    refreshPage();
                }, 1000);
                navigate(
                    "/transfers/view/" + newTransfer.doc_no + "/" + "completed"
                );
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
            }
        }
    }


    // INVOICE REMOVAL HANDLER
    function handleRemoveItem(id) {
        const rowId = id;
        const newItemList = [...itemData];
        newItemList.splice(rowId, 1);
        setItemData(newItemList);
    }

    function renderTable() {
        return (
            <Table className="ps-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        {
                            (type !== "completed" && type !== "processed") && (
                                <th>Action</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {isSet
                        ? itemData.map((item, index) => {
                              return (
                                  <tr key={item.id}>
                                        <td className="franchise-td-gray">
                                            {item.item_name}
                                        </td>
                                        <td className="franchise-td-gray">{numberFormat(item.qty)}</td>
                                        <td className="franchise-td-gray">{item.unit}</td>
                                        {
                                            (type !== "completed" && type !== "processed") && (
                                                <td>
                                                    <img
                                                        src={trash}
                                                        onClick={() =>
                                                            handleRemoveItem(index)
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                </td>
                                            )
                                        }
                                  </tr>
                              );
                          })
                        : ""}
                </tbody>
            </Table>
        );
    }

    function renderRequestTable() {
        return (
            <Table className="ps-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {isSet
                        ? itemData.map((item, index) => {
                              return (
                                  <tr key={item.id}>
                                      <td className="franchise-td-gray">
                                          {item.item_name}
                                      </td>
                                      <td className="franchise-td-gray">{numberFormat(item.qty)}</td>
                                      <td className="franchise-td-gray">{item.unit}</td>
                                  </tr>
                              );
                          })
                        : ""}
                </tbody>
            </Table>
        );
    }

    function renderReceivedItemsTable() {
        return (
            <Table className="ps-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        {
                            type !== "completed" && (
                                <th>Action</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {isSet
                        ? additionalItemData.map((item, index) => {
                              return (
                                  <tr key={item.id}>
                                        <td className="franchise-td-gray">
                                            {item.item_name}
                                        </td>
                                        <td className="franchise-td-gray">{numberFormat(item.received_qty)}</td>
                                        <td className="franchise-td-gray">{item.unit}</td>
                                        {
                                            type !== "completed" && (
                                                <td>
                                                    <img
                                                        src={trash}
                                                        onClick={() =>
                                                            handleRemoveItem(index)
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                </td>
                                            )
                                        }
                                  </tr>
                              );
                          })
                        : ""}
                </tbody>
            </Table>
        );
    }

    function handleViewPayment(id, bank, type) {
        {
            window.open(
                "/se/paysuppliers/view-invoice/" + id + "/" + bank + "/" + type,
                "_blank"
            );
        }
    }

    React.useEffect(() => {
        fetchBranches();
        fetchTransfer();
        fetchAllEmployees();
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
                <div className="d-flex justify-content-between d-flex-responsive">
                    <h1 className="page-title mb-4">TRANSFER DETAILS </h1>
                    <div className="review-po">
                        <span className="pe-5">TRANSFER NO.</span>
                        <span>{newTransfer.transfer_number}</span>
                    </div>
                </div>

                {/* content */}
                <div className="review-form mb-3">
                    {/* TRANSACTION/PAYMENT DETAILS */}
                    {type === "requested" && (
                        <Container fluid>
                            <Row>
                                <Col xs={3}>
                                    <Row>
                                        <span className="review-label nc-modal-custom-row">
                                            Transfer Number
                                        </span>
                                    </Row>
                                    <Row className="p-sides-10">
                                        <Form.Control
                                            type="number"
                                            name="transfer_number"
                                            defaultValue={
                                                newTransfer.transfer_number
                                            }
                                            className="react-select-container"
                                            onChange={(e) =>
                                                handleDetailChange(e)
                                            }
                                        />
                                        <InputError
                                            isValid={isError.transfer_number}
                                            message={"Transfer number is required"}
                                        />
                                    </Row>
                                </Col>
                                <Col xs={9} className="review-container py-3">
                                    <Row>
                                        <Col>
                                            <Row>
                                                <span className="review-label nc-modal-custom-row">
                                                    Doc No.
                                                </span>
                                            </Row>
                                            <Row>
                                                <span className="review-data">
                                                    {newTransfer.doc_no}
                                                </span>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <Row>
                                                <span className="review-label nc-modal-custom-row">
                                                    Encoded By.
                                                </span>
                                            </Row>
                                            <Row>
                                                <span className="review-data">
                                                    {newTransfer.encoded_by}
                                                </span>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <Row>
                                                <span className="review-label nc-modal-custom-row">
                                                    Transfer Date
                                                </span>
                                            </Row>
                                            <Row>
                                                <span className="review-data">
                                                    {formatDate(
                                                        newTransfer.transfer_date
                                                    )}
                                                </span>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={3}>
                                    <Row>
                                        <span className="review-label nc-modal-custom-row">
                                            Dispatcher
                                        </span>
                                    </Row>
                                    <Row>
                                        <Select
                                            name="dispatcher"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Dispatcher..."
                                            value={employeeValue}
                                            options={employeeOptions}
                                            onChange={(e) =>
                                                handleSelectChange(e)
                                            }
                                        />
                                        <InputError
                                            isValid={isError.dispatcher}
                                            message={"Dispatcher is required"}
                                        />
                                    </Row>
                                </Col>
                                <Col xs={9} className="review-container py-3">
                                    <Row>
                                        <Col>
                                            <Row>
                                                <span className="review-label nc-modal-custom-row">
                                                    From Branch
                                                </span>
                                            </Row>
                                            <Row>
                                                <span className="review-data">
                                                    {
                                                        newTransfer.branch_from_name
                                                    }
                                                </span>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <Row>
                                                <span className="review-label nc-modal-custom-row">
                                                    To Branch
                                                </span>
                                            </Row>
                                            <Row>
                                                <span className="review-data">
                                                    {newTransfer.branch_to_name}
                                                </span>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <Row>
                                                <span className="review-label nc-modal-custom-row">
                                                    Remarks
                                                </span>
                                            </Row>
                                            <Row>
                                                <span className="review-data">
                                                    {newTransfer.remarks}
                                                </span>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Container>
                    )}
                    {type !== "requested" && type !== "completed" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Transfer Number
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Doc No.
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Encoded By
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Transfer Date
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.transfer_number}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.doc_no}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.encoded_by}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {formatDate(
                                                newTransfer.transfer_date
                                            )}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Dispatcher
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            From Branch
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            To Branch
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Remarks
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.dispatcher_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.branch_from_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.branch_to_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.remarks}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                        </Container>
                    )}
                    {type === "completed" && (
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Received Date
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Received By
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Transfer Date
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Encoded By
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {formatDate(
                                                newTransfer.received_date
                                            )}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.received_by}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {formatDate(
                                                newTransfer.transfer_date
                                            )}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.encoded_by}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="review-container py-3">
                                <Row>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Doc No.
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            From Branch
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            To Branch
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Dispatcher
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-label nc-modal-custom-row">
                                            Remarks
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.doc_no}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.branch_from_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.branch_to_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.dispatcher_name}
                                        </span>
                                    </Col>
                                    <Col>
                                        <span className="review-data">
                                            {newTransfer.remarks}
                                        </span>
                                    </Col>
                                </Row>
                            </Row>
                        </Container>
                    )}

                    {type !== "completed" && (
                        <div className="mt-4 d-flex flex-column">
                            <span className="review-data mb-2 nc-modal-custom-row">
                                LIST OF ITEMS TRANSFERRED
                            </span>
                            <div className="review-purchased-items">
                                {type === "requested" && renderRequestTable()}
                                {type !== "requested" &&
                                    type !== "completed" &&
                                    renderTable()}
                            </div>
                        </div>
                    )}

                    {type === "completed" && (
                        <div className="mt-4 d-flex flex-column">
                            <span className="review-data mb-2 nc-modal-custom-row">
                                LIST OF ITEMS TRANSFERRED
                            </span>
                            <div className="review-purchased-items">
                                {renderTable()}
                            </div>
                            <span className="review-data mb-2 nc-modal-custom-row">
                                LIST OF ITEMS RECEIVED
                            </span>
                            <div className="review-purchased-items">
                                {renderReceivedItemsTable()}
                            </div>
                        </div>
                    )}

                    {type === "requested" && (
                        <div className="d-flex justify-content-end pt-5">
                            <button
                                type="button"
                                className="button-primary me-3"
                                onClick={() => navigate("/transfers")}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="button-tertiary me-3"
                                onClick={() =>
                                    navigate(
                                        "/transfers/edit/" + id + "/" + type
                                    )
                                }
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="button-primary me-3 w-15"
                                onClick={() => handleShowApprovalModal()}
                            >
                                Process Transfer
                            </button>
                        </div>
                    )}
                    {type !== "requested" && (
                        <div className="d-flex justify-content-end pt-5">
                            <button
                                type="button"
                                className="button-primary me-3"
                                onClick={handleShowPrintModal}
                            >
                                Print
                            </button>
                            <button
                                type="button"
                                className="button-secondary me-3"
                                onClick={() => navigate("/transfers")}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <TransferModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                page="transaction"
                handler={handlePrintPI}
            />

            <TransferModal
                show={showApprovalModal}
                hide={handleCloseApprovalModal}
                type="process"
                page="transaction"
                handler={handleApproveTransfer}
            />

            {/* PRINT VIEW */}
            <div
                className="print-container px-3 py-2 display-none"
                id="printablediv"
            >
                <div className="text-end print-header d-flex flex-column">
                    <span>TRANSFER NO. {newTransfer.transfer_number}</span>
                    <span className="text-uppercase">
                        {Moment(getTodayDateISO()).format("MMMM DD, yyyy")}
                    </span>
                </div>
                <div className="d-flex justify-content-center py-1">
                    <img src={cleanLogo} className="print-logo" />
                </div>
                {type !== "completed" && (
                    <div className="print-body mt-5">
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Transfer Number:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {formatDate(
                                                newTransfer.transfer_number
                                            )}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Doc No.:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.doc_no}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Encoded By:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.encoded_by}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Transfer Date:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.transfer_date}
                                        </Col>
                                    </div>
                                </Col>
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Dispatcher:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.dispatcher_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            From Branch:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.branch_from_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            To Branch:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.branch_to_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Remarks:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.remarks}
                                        </Col>
                                    </div>
                                </Col>
                            </Row>
                        </Container>

                        <div className="mt-4 d-flex flex-column">
                            <span className="review-data mb-2 nc-modal-custom-row">
                                APPLIED TO THE FOLLOWING ITEMS
                            </span>
                            <div className="review-purchased-items">
                                {renderRequestTable()}
                            </div>
                        </div>
                        <div className="print-signatures">
                            <span className="text-center text-uppercase print-label">
                                {" "}
                            </span>
                            <span className="text-center text-uppercase print-label fw-bold">
                                {printPI.prepared_by}
                            </span>
                        </div>
                        <div className="print-signatories pb-4 mb-4">
                            <span>Approved by</span>
                            <span>Prepared by</span>
                        </div>
                    </div>
                )}
                {type === "completed" && (
                    <div className="print-body mt-5">
                        <Container fluid>
                            <Row className="review-container py-3">
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Received Date:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {formatDate(
                                                newTransfer.received_date
                                            )}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Received By:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.received_by_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Transfer Date:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {formatDate(
                                                newTransfer.transfer_date
                                            )}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Encoded By:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.encoded_by}
                                        </Col>
                                    </div>
                                </Col>
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Doc No.:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.doc_no}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            From Branch:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.branch_from_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            To Branch:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.branch_to_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Dispatcher:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.dispatcher_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Remarks:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {newTransfer.remarks}
                                        </Col>
                                    </div>
                                </Col>
                            </Row>
                        </Container>

                        <div className="mt-4 d-flex flex-column">
                            <span className="review-data mb-2 nc-modal-custom-row">
                                LIST OF ITEMS TRANSFERRED
                            </span>
                            <div className="review-purchased-items">
                                {renderTable()}
                            </div>
                        </div>

                        <div className="mt-4 d-flex flex-column">
                            <span className="review-data mb-2 nc-modal-custom-row">
                                LIST OF ITEMS RECEIVED
                            </span>
                            <div className="review-purchased-items">
                                {renderReceivedItemsTable()}
                            </div>
                        </div>
                        <div className="print-signatures">
                            <span className="text-center text-uppercase print-label">
                                {" "}
                            </span>
                            <span className="text-center text-uppercase print-label fw-bold">
                                {printPI.prepared_by}
                            </span>
                        </div>
                        <div className="print-signatories pb-4 mb-4">
                            <span>Approved by</span>
                            <span>Prepared by</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
