import React, { useState } from "react";
import { Button, Col, Container, Row, Form, Table } from "react-bootstrap";
import Select from "react-select";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import trash from "./../../../Assets/Images/trash.png";
import {
    capitalizeFirstLetter,
    formatDate,
    numberFormat,
    toastStyle,
    refreshPage,
    getTodayDateISO,
    TokenExpiry,
    dateFormat,
} from "../../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import {
    getAllTransfers,
    getTransfer,
    updateTransferStatus,
    recordTransferAction,
} from "../../../Helpers/apiCalls/Inventory/TransferApi";
import {
    getAllTransfersPotato,
    getTransferPotato,
    updateTransferStatusPotato,
    recordTransferActionPotato,
} from "../../../Helpers/apiCalls/PotatoCorner/Inventory/TransferApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Manage/Branches";
import { getAllEmployees } from "../../../Helpers/apiCalls/employeesApi";
import { getSingleUser } from "../../../Helpers/apiCalls/usersApi";
import {
    getAllItemList,
    getItemHistory,
    updateItemListInventory,
} from "../../../Helpers/apiCalls/Inventory/ItemListApi";
import { validateTransferView } from "../../../Helpers/Validation/Inventory/TransferValidation";
import InputError from "../../../Components/InputError/InputError";
import TransferModal from "./../Transfer/TransferModal";
import Moment from "moment";
import cleanLogo from "../../../Assets/Images/Login/logo.png";


import { 
    getAllRequests, 
    getAllRequestsPotato, 
    getRequest, 
    getRequestPotato, 
    createTransferRequest, 
    createTransferRequestPotato,
    changeRequestStatus,
    changeRequestStatusPotato,
} from "../../../Helpers/apiCalls/Inventory/RequestsApi";
import RequestModal from "./RequestModal";
import ApproveRequestModal from "./ApproveRequestModal";
import ReactLoading from "react-loading";


export default function ViewRequest() {
    const { id, type } = useParams();
    let navigate = useNavigate();
    console.log(type)
    var idInfo = id.split("-");
    var shopType = idInfo[0];
    var ID = idInfo[1];

    const [inactive, setInactive] = useState(true);
    const [isSet, setIsSet] = useState(false);
    const [items, setItems] = useState([]);
    const [newTransfer, setNewTransfer] = useState({
        transfer_date: "",
        transfer_number: "",
        branch_from: "",
        branch_from_name: "",
        encoded_by: "",
        branch_to: "",
        branch_to_name: "",
        remarks: "",
    });
    const [itemData, setItemData] = useState({});
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

    const [request, setRequest] = useState([]);
    const [isClicked, setIsClicked] = useState(false);
    const [selectedRow, setSelectedRow] = useState([]);


    /* print modal handler */
    const [showPrintModal, setShowPrintModal] = useState(false);
    const handleShowPrintModal = () => setShowPrintModal(true);
    const handleClosePrintModal = () => setShowPrintModal(false);
    const [printPI, setPrintPI] = useState([]);

     /* Approve Modal */
     const [showApproveModal, setShowApproveModal] = useState(false);
     const handleShowApproveModal = () => setShowApproveModal(true);
     const handleCloseApproveModal = () => setShowApproveModal(false);

     /* Approve Modal */
     const [showForApprovalModal, setShowForApprovalModal] = useState(false);
     const handleShowForApprovalModal = () => setShowForApprovalModal(true);
     const handleCloseForApprovalModal = () => setShowForApprovalModal(false);

     /* Disapprove Modal */
     const [showDisapproveModal, setShowDisapproveModal] = useState(false);
     const handleShowDisapproveModal = () => setShowDisapproveModal(true);
     const handleCloseDisapproveModal = () => setShowDisapproveModal(false);

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

    }

    async function fetchRequest() {
        if (shopType === "Mango") {
            const response = await getRequest(ID);

            if (response.data.status === "success") {
                var data = response.data.data[0];
                data.shopType = "Mango";
                setRequest(data)
                setItems(data.request_items)
                setIsSet(true);
            }
        } else if (shopType === "Potato") {
            const response = await getTransferPotato(ID);

            if (response.data.status === "success") {
                data.shopType = "Potato";
                setRequest(data)
                setItems(data.request_items)
                
                setIsSet(true);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        }
    }

    // //  FETCH INVENTORY ITEMS   //
    // async function fetchAllItems(id) {
    //     const response = await getAllItemList(ID);
    //     if (response.data.data) {
    //         var itemsList = response.data.data;
    //         var clean = itemsList.map((entry) => {
    //             var info = {};
    //             info.name = "item_id";
    //             info.value = entry.id;
    //             info.label = entry.item_name;
    //             info.entry = {
    //                 name: "item_id",
    //                 value: entry.id,
    //                 label: entry.item_name,
    //             };
    //             info.branch_id = entry.branch_id;
    //             info.inventory_id = entry.id;
    //             info.ingredient_id = entry.item_id;

    //             info.unit = entry.inventory_unit_name;
    //             info.prices = entry.price;
    //             info.current_qty = parseInt(entry.current_qty);
    //             return info;
    //         });
    //         setEntries(clean);
    //         setEntriesList(clean);
    //     } else {
    //         setItemsData([]);
    //     }
    // }

    function redirectToTransfer() {
        if(shopType === "Mango"){
            navigate("/transfers/add/" + ID + "/mango_magic")
        } else if(shopType === "Potato"){
            navigate("/transfers/add/" + ID + "/potato_corner")
        }
    } 

    async function approveRequest() {
        if (isClicked) {
            return;
        }
        if (shopType === "Mango") {
            const response = await changeRequestStatus(ID, "pending");
            if (response.data) {
                toast.success("Successfully approved request!", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    navigate(-1);
                }, 1000);
            } else if (response.error) {
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => {
                    navigate(-1);
                }, 1000);
            }

        } else if (shopType === "Potato") {
            const response = await changeRequestStatusPotato(ID, "pending");
            if (response.data) {
                toast.success("Successfully approved request!", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    navigate(-1);
                }, 1000);
            } else if (response.error) {
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => {
                    navigate(-1);
                }, 1000);
            }
        }
    }

    //para create ug transfer dritso
    async function saveRequest() {
        if (isClicked) {
            return;
        }
        if (shopType === "Mango") {
            const response = await createTransferRequest(request, items);
            if (response.data.status === "success") {

                const response2 = await changeRequestStatus(ID, "processing");
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

        } else if (shopType === "Potato") {
            const response = await createTransferRequestPotato(request, items);
            if (response.data.status === "success") {
                const response2 = await changeRequestStatus(ID, "processing");
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

    async function rejectRequest() {
        if (shopType === "Mango") {
            const response = await changeRequestStatus(ID, "rejected");
            if (response.data) {
                toast.success("Successfully rejected request!", {
                    style: toastStyle(),
                });
                setTimeout(() => navigate(-1), 1000);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => navigate(-1), 1000);
            }
        } else if (shopType === "Potato") {
            const response = await changeRequestStatusPotato(ID, "rejected");
            if (response.data) {
                toast.success("Successfully rejected request!", {
                    style: toastStyle(),
                });
                setTimeout(() => navigate(-1), 1000);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => navigate(-1), 1000);
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
                        <th>Current Quantity</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        {/* <th>Action</th> */}
                    </tr>
                </thead>
                <tbody>
                    {isSet
                        ? items.map((item, index) => {
                              return (
                                  <tr key={item.id}>
                                      <td className="franchise-td-gray">
                                          {item.item_name}
                                      </td>
                                      <td className="franchise-td-gray">{item.current_qty ? numberFormat(item.current_qty) : 0}</td>
                                      <td className="franchise-td-gray">{item.qty ? numberFormat(item.qty) : 0}</td>
                                      <td className="franchise-td-gray">{item.unit}</td>
                                      {/* <td className="franchise-td-gray">
                                          <img
                                              src={trash}
                                              onClick={() =>
                                                  handleRemoveItem(index)
                                              }
                                              className="cursor-pointer"
                                          />
                                      </td> */}
                                  </tr>
                              );
                          })
                        : ""}
                </tbody>
            </Table>
        );
    }

    React.useEffect(() => {
        fetchRequest();
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
                <div className="d-flex justify-content-between d-flex-responsive">
                    <h1 className="page-title mb-4">REQUEST DETAILS </h1>
                    <div className="review-po">
                        <span className="pe-5">REQUEST NO.</span>
                        <span>{request.id}</span>
                    </div>
                </div>

                {/* content */}
                <div className="review-form mb-3">
                    {/* TRANSACTION/PAYMENT DETAILS */}
                
                    <Container fluid>
                        <Row className="review-container py-3">
                            <Row>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Doc No.
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Request Date
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Delivery Date
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Encoded By
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Approved By
                                    </span>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <span className="review-data">
                                        {request.id}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {dateFormat(request.request_date)}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {dateFormat(request.delivery_date)}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {request.encoded_by_name}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {request.approved_by_name}
                                    </span>
                                </Col>
                            </Row>
                        </Row>
                        <Row className="review-container py-3">
                            <Row>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Request from
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-label nc-modal-custom-row">
                                        Request To
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
                                        {request.branch_from_name}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {request.branch_to_name}
                                    </span>
                                </Col>
                                <Col>
                                    <span className="review-data">
                                        {request.remarks}
                                    </span>
                                </Col>
                            </Row>
                        </Row>
                    </Container>

                    <div className="mt-4 d-flex flex-column">
                        <span className="review-data mb-2 nc-modal-custom-row">
                            LIST OF ITEMS REQUESTED
                        </span>
                        <div className="review-purchased-items">
                            {renderTable()}
                        </div>
                    </div>

                    {(type !== "pending" && type !== "completed" && type !== "on hold") && (
                        <div className="d-flex justify-content-end pt-5">
                            <button
                                type="button"
                                className="button-secondary me-3"
                                onClick={() => navigate("/requests")}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="button-warning me-3"
                                onClick={handleShowDisapproveModal}
                            >
                                Reject
                            </button>
                            <button
                                type="button"
                                className="button-primary me-3"
                                onClick={handleShowForApprovalModal}
                            >
                                Approve
                            </button>
                        </div>
                    )}
                    {(type === "completed" || type === "on hold") && (
                        <div className="d-flex justify-content-end pt-5">
                            <button
                                type="button"
                                className="button-secondary me-3"
                                onClick={() => navigate("/requests")}
                            >
                                Close
                            </button>
                        </div>
                    )}
                    {type === "pending" && (
                        <div className="d-flex justify-content-end pt-5">
                            {isClicked ? (
                                <div className="button-warning me-3 d-flex justify-content-center">
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
                                    className="button-warning me-3"
                                    onClick={handleShowDisapproveModal}
                                >
                                    Reject
                                </button>
                            )}
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
                                    onClick={handleShowApproveModal}
                                >
                                    Create Transfer
                                </button>
                            )}
                            <button
                                type="button"
                                className="button-secondary me-3"
                                onClick={() => navigate("/requests")}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>

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
                <div className="print-body mt-5">
                    <Container fluid>
                        <Row className="review-container py-3">
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Doc No.:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {request.id}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Request Date:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(request.request_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Delivery Date:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(request.delivery_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Encoded By:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {request.encoded_by_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Approved By:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {request.approved_by_name}
                                    </Col>
                                </div>
                            </Col>
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Request From:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {request.branch_from_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Request To:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {request.branch_to_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Remarks:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {request.remarks}
                                    </Col>
                                </div>
                            </Col>
                        </Row>
                    </Container>

                    <div className="mt-4 d-flex flex-column">
                        <span className="review-data mb-2 nc-modal-custom-row">
                            LIST OF THE ITEMS REQUESTED
                        </span>
                        <div className="review-purchased-items">
                            {renderTable()}
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
            </div>
            <ApproveRequestModal
                show={showApproveModal}
                hide={handleCloseApproveModal}
                type="create transfer"
                handler={redirectToTransfer}
            />
            <RequestModal
                show={showDisapproveModal}
                hide={handleCloseDisapproveModal}
                type="reject"
                selectedRow={request}
                page={"view"}
            />
            <ApproveRequestModal
                show={showPrintModal}
                hide={handleClosePrintModal}
                type="print"
                handler={handlePrintPI}
            />
            <ApproveRequestModal
                show={showForApprovalModal}
                hide={handleCloseForApprovalModal}
                type="approve"
                handler={approveRequest}
            />
        </div>
    );
}
