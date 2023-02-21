import React, { useState, useRef, useEffect } from "react";
import {
    Col,
    Form,
    Row,
    Tab,
    Tabs,
    Dropdown,
    DropdownButton,
    ButtonGroup,
} from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
    dateFormat,
    isAdmin,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
    getTodayDate
} from "../../Helpers/Utils/Common";
import {
    getAllTransfers,
    deleteTransfer,
    updateTransferStatus,
    recordTransferAction,
    searchByDate,
    searchByTransfer,
    searchTransfersPotato,
    searchTransfersMango,
} from "../../Helpers/apiCalls/Inventory/TransferApi";
import {
    getAllTransfersPotato,
    deleteTransferPotato,
    updateTransferStatusPotato,
    searchByDatePotato,
    searchByTransferPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Inventory/TransferApi";
import DeleteModal from "../../Components/Modals/DeleteModal";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import TransferModal from "./Transfer/TransferModal";

import toast from "react-hot-toast";
import {
    changeStatusPurchaseOrder,
    deletePurchaseOrder,
    getAllPurchaseOrder,
    getItems,
    receivePurchaseOrder,
} from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllPurchaseOrderPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import { getAllSuppliers } from "../../Helpers/apiCalls/suppliersApi";
import { getSingleUser } from "../../Helpers/apiCalls/usersApi";
import { getType } from "../../Helpers/Utils/Common";
import {
    getAllBranches
} from "../../Helpers/apiCalls/Manage/Branches";
import {
    getAllBranchesPotato
} from "../../Helpers/apiCalls/PotatoCorner/Manage/Branches";

import "./Inventory.css";
import Moment from "moment";

export default function IncomingTransfers() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [userType, setUserType] = useState(getType());
    const today = Moment().format("YYYY-MM-DD");

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [transferId, setTransferId] = useState("");
    const [transferType, setTransferType] = useState("");
    const [searchTransfer, setSearchTransfer] = useState("");
    const [branches, setBranches] = useState([]);

    const [branchFrom, setBranchFrom] = useState({});
    const [branchTo, setBranchTo] = useState({});
    const [branchOptions, setBranchOptions] = useState([]);

    useEffect(()=>{
        console.log(branches);
        setBranchOptions([{label: "All Branches", value:""}, ...branches.map((_branch)=>{
            var retval = {label: _branch.name, value:_branch.id}
            return retval;
        })])
    },[branches])

    function handleBranchFromChange(e){
        console.log(e)
        setBranchFrom(e);
        const toFilter = {target: {name: "branch_from", value: e.value}};
        handleFilterChange(toFilter);
    }

    function handleBranchToChange(e){
        console.log(e)
        setBranchTo(e);
        const toFilter = {target: {name: "branch_to", value: e.value}};
        handleFilterChange(toFilter);
    }


    /** POST API - UPDATE TRANSFER STATUS TO DELETE **/
    async function handleDeleteTransfer() {
        if (transferType === "Mango") {
            const cash = await deleteTransfer(transferId);
            if (cash.data.response === "Transfer deleted successfully.") {
                toast.success("Transfer deleted successfully", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    handleCloseDeleteModal();
                    // refreshPage();
                }, 1000);
            } else {
                toast.error(cash.data.response, {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                // refreshPage();
            }
        } else if (transferType === "Potato") {
            const cash = await deleteTransferPotato(transferId);
            if (cash.data.response === "Transfer deleted successfully") {
                toast.success("Transfer deleted successfully", {
                    style: toastStyle(),
                });
                setTimeout(() => {
                    handleCloseDeleteModal();
                    refreshPage();
                }, 1000);
            } else {
                toast.error(cash.data.response, {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                refreshPage();
            }
        }
    }

    async function handleRequestTransfer() {
        const cash = await updateTransferStatus(transferId, "Requested");
        if (cash.data.response === "Status changed successfully") {
            toast.success("Transfer moved to for Approval", {
                style: toastStyle(),
            });
            setTimeout(() => {
                handleCloseApproveModal();
                refreshPage();
            }, 1000);
        } else {
            toast.error(cash.data.response, {
                style: toastStyle(),
            });
            handleCloseApproveModal();
        }

    }

    /* return modal handler */
    const [showReturnModal, setShowReturnModal] = useState(false);
    const handleShowReturnModal = () => setShowReturnModal(true);
    const handleCloseReturnModal = () => setShowReturnModal(false);

    const dummy = [
        {
            id: "1",
            date_transferred: "08-08-2022",
            date_received: "08-08-2022",
            encoded_on: "08-08-2022",
            transfer_no: "123",
            doc_no: "123",
            to: "SM SEASIDE",
            status: "deleted",
        },
    ];

    const [suppliers, setSuppliers] = useState([]);

    async function fetchBranchesFilter() {
        setShowLoader(true);

        const response = await getAllBranches();
        if (response.error) {
        } else {
            var allBranches = response.data.data.data.map((data) => {
                var branch = data;
                return branch;
            });
            setBranches(allBranches);
        }
        setShowLoader(false);
    }

    async function fetchSuppliers() {
        setSuppliers([]);
        const response = await getAllSuppliers();
    }

    async function handleSelectChange(e, idno, id, status) {
        switch (e.target.value) {
            case "edit-po":
                navigate("edit/" + id + "/" + status);
                break;

            case "delete-po":
                handleShowDeleteModal();
                setTransferId(idno);
                setTransferType(id.split("-")[0]);
                break;

            case "return-po":
                handleShowApproveModal();
                setTransferType(id.split("-")[0]);
                setTransferId(idno);

                break;

            case "print-po":
                navigate("print/" + id);
                break;

            case "review-po":
                window.open(
                    "/transfers/view/" + id + "/" + status, "_blank"
                );
                // navigate("view/" + id + "/" + status);
                break;

            case "view-po":
                navigate("view/" + id + "/" + status);
                break;

            case "send-po":
                // handleShowSendModal();
                break;

            case "email-po":
                // handleShowEmailModal();
                break;

            case "receive-po":
        }
    }

    /* send modal handler */
    const [showSendModal, setShowSendModal] = useState(false);
    const handleShowSendModal = () => setShowSendModal(true);
    const handleCloseSendModal = () => setShowSendModal(false);

    /* email modal handler */
    const [showEmailModal, setShowEmailModal] = useState(false);
    const handleShowEmailModal = () => setShowEmailModal(true);
    const handleCloseEmailModal = () => refreshPage();

    const [pendingPO, setPendingPO] = useState([]);
    const [approvedPO, setApprovedPO] = useState([]);
    const [printedPO, setPrintedPO] = useState([]);
    const [sentPO, setSentPO] = useState([]);
    const [disapprovedPO, setDisapprovedPO] = useState([]);
    const [deletedPO, setDeletedPO] = useState([]);
    const [allPO, setAllPO] = useState([]);
    const [approvalPO, setApprovalPO] = useState([]);

    const [allTransfer, setAllTransfer] = useState([]);
    const [forApprovalTransfer, setForApprovalTransfer] = useState([]);
    const [processedTransfer, setProcessedTransfer] = useState([]);
    const [completedTransfer, setCompletedTransfer] = useState([]);
    const [deletedTransfer, setDeletedTransfer] = useState([]);
    const [filterDate, setFilterDate] = useState({
        date_to: "",
        date_from: "",
        branch_to: "",
    });

    // clear tables
    function clearTables() {
        setPendingPO([]);
        setApprovedPO([]);
        setPrintedPO([]);
        setSentPO([]);
        setDisapprovedPO([]);
        setDeletedPO([]);
        setAllPO([]);
        setApprovalPO([]);

        setAllTransfer([]);
        setForApprovalTransfer([]);
        setProcessedTransfer([]);
        setCompletedTransfer([]);
        setDeletedTransfer([]);
    }

    const [showLoader, setShowLoader] = useState(false);
    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    /* Approve Modal */
    const [showApproveModal, setShowApproveModal] = useState(false);
    const handleShowApproveModal = () => setShowApproveModal(true);
    const handleCloseApproveModal = () => setShowApproveModal(false);

    function approvePO(state) {
        if (state === "deleted") {
            handleShowApproveModal();
        }
    }

    const [transferManager, setTransferManager] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        tab: "requested",
        status: "requested",
        // transfer_status: "requested",
        shop_type: "",
        branch_to: "",
        transfer_number: "",
    });

    const isInitialMount = useRef(true);
    const filterConfigKey = 'inventory-transfers-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 // console.log("found");
    //                 handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])


    async function searchTransfers(filterConfig) {
        setShowLoader(true);
        setTransferManager([]);
        var allData = [];

        const response = await searchTransfersMango(filterConfig);
        const response2 = await searchTransfersPotato(filterConfig);

        if (filterConfig.shop_type !== "potato_corner" && response.data) {
            var mangoTransfers = response.data.data;
            mangoTransfers.map(async (transfer) => {
                var info = {};

                info.id = transfer.id;
                info.status = transfer.status;
                info.transfer_date = Moment(transfer.transfer_date).format("MM-DD-YYYY");
                info.date_received = transfer.completed_on
                    ? Moment(transfer.completed_on).format("MM-DD-YYYY")
                    : "";
                info.added_on = Moment(transfer.added_on).format("MM-DD-YYYY");
                info.added_by = transfer.added_by_name;
                info.transfer_number = transfer.transfer_number;
                info.doc_no = "Mango-" + transfer.id;
                info.branch_from = transfer.branch_from;
                info.branch_from_name = transfer.branch_from_name;
                info.branch_to = transfer.branch_to;
                info.branch_to_name = transfer.branch_to_name;
                info.completed_by = transfer.completed_by_name;
                info.approved_by = transfer.approved_by_name;
                info.shop_type = "mango_magic";
                allData.push(info);
                return info;
            });
        } else {
            TokenExpiry(response);
        }

        if (filterConfig.shop_type !== "mango_magic" && response2.data) {
            var potatoTransfers = response2.data.data;
            potatoTransfers.map(async (transfer) => {
                var info = {};

                info.id = transfer.id;
                info.status = transfer.status;
                info.transfer_date = Moment(transfer.transfer_date).format("MM-DD-YYYY");
                info.date_received = transfer.completed_on
                    ? Moment(transfer.completed_on).format("MM-DD-YYYY")
                    : "";
                info.added_on = Moment(transfer.added_on).format("MM-DD-YYYY");
                info.added_by = transfer.added_by_name;
                info.transfer_number = transfer.transfer_number;
                info.doc_no = "Potato-" + transfer.id;
                info.branch_from = transfer.branch_from;
                info.branch_from_name = transfer.branch_from_name;
                info.branch_to = transfer.branch_to;
                info.branch_to_name = transfer.branch_to_name;
                info.completed_by = transfer.completed_by_name;
                info.approved_by = transfer.approved_by_name;
                info.shop_type = "potato_corner";
                allData.push(info);
                return info;
            });
        } else {
            TokenExpiry(response2);
        }
        console.log(allData)
        var mangoAndPotatoTransfers = allData
                .sort((a, b) =>
                new Date(...a.transfer_date?.split('/').reverse()) - new Date(...b.transfer_date?.split('/').reverse())
            ).reverse()
            .map((transfer) => {
                var info = transfer;
                info.added_on = dateFormat(transfer.added_on);
                return info;
            });
        setTransferManager(mangoAndPotatoTransfers);
        setShowLoader(false);
    }

    const handleTabSelect = (tabKey) => {
        if (tabKey === "") {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    tab: "",
                    status: "",
                    transfer_status: "",
                    branch_from: "",
                    branch_to: "",

                };
            });
        } else if (tabKey === "completed" || tabKey === "incomplete") {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    tab: tabKey,
                    status: tabKey,
                    branch_from: "",
                    branch_to: "",
                };
            });
        }  else if (tabKey === "requested" ) {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    tab: tabKey,
                    // transfer_status: tabKey,
                    status: "requested",
                    branch_from: "",
                    branch_to: "",
                };
            });
        }
        else {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    tab: tabKey,
                    status: tabKey,
                    branch_from: "",
                    branch_to: "",
                };
            });
        }
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    };
    const handleSelectDropsearch = (e) => {
        if (e.name === "branch_to") {
            setBranchValue(e);
        }
        setFilterConfig((prev) => {
            return {
                ...prev,
                [e.name]: e.value,
            };
        });
    };

    React.useEffect(() => {
        // searchTransfers(filterConfig);
        fetchBranches(filterConfig.shop_type);
    }, [filterConfig]);

    async function fetchData() {
        setShowLoader(true);
        clearTables();

        const response = await getAllTransfers();

        if (response.error) {
        } else {
            var transfers = response.data.data;
            transfers.map(async (PO) => {
                var info = {};

                info.id = PO.id;
                info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                info.date_received = PO.completed_on
                    ? Moment(PO.completed_on).format("MM-DD-YYYY")
                    : "";
                info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                info.added_by = PO.added_by_name;
                info.transfer_number = PO.transfer_number;
                info.doc_no = "Mango-" + PO.id;
                info.branch_from = PO.branch_from;
                info.branch_from_name = PO.branch_from_name;
                info.branch_to = PO.branch_to;
                info.branch_to_name = PO.branch_to_name;
                info.completed_by = PO.completed_by_name;
                info.approved_by = PO.approved_by_name;

                if (PO.status === "deleted" || PO.is_deleted === "1") {
                    info.status = "deleted";
                    setDeletedTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "pending"
                ) {
                    info.status = "requested";
                    setForApprovalTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "processed"
                ) {
                    info.status = "processed";
                    setProcessedTransfer((prev) => [...prev, info]);
                } else if (PO.status === "completed") {
                    info.status = "completed";
                    setCompletedTransfer((prev) => [...prev, info]);
                }
                setAllTransfer((prev) => [...prev, info]);
            });
        }

        const response2 = await getAllTransfersPotato();

        if (response2.error) {
        } else {
            var transfers = response2.data.data;
            transfers.map(async (PO) => {
                var info = {};

                info.id = PO.id;
                info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                info.date_received = PO.completed_on
                    ? Moment(PO.completed_on).format("MM-DD-YYYY")
                    : "";
                info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                info.added_by = PO.added_by_name;
                info.transfer_number = PO.transfer_number;
                info.doc_no = "Potato-" + PO.id;
                info.branch_from = PO.branch_from;
                info.branch_from_name = PO.branch_from_name;
                info.branch_to = PO.branch_to;
                info.branch_to_name = PO.branch_to_name;
                info.completed_by = PO.completed_by_name;
                info.approved_by = PO.approved_by_name;

                if (PO.status === "deleted" || PO.is_deleted === "1") {
                    info.status = "deleted";
                    setDeletedTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "pending"
                ) {
                    info.status = "requested";
                    setForApprovalTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "processed"
                ) {
                    info.status = "processed";
                    setProcessedTransfer((prev) => [...prev, info]);
                } else if (PO.status === "completed") {
                    info.status = "completed";
                    setCompletedTransfer((prev) => [...prev, info]);
                }
                setAllTransfer((prev) => [...prev, info]);
            });
        }

        setShowLoader(false);
    }

    const [branchesData, setBranchesData] = useState([]);
    const [branchValue, setBranchValue] = useState({
        name: "branch_to",
        label: "",
        value: "",
    });
    async function fetchBranches(shop_type) {
        setBranchesData([]);

        if (shop_type === "mango_magic") {
            const response = await getAllBranches();

            if (response.data) {
                let result = response.data.data.data.map((a) => {
                    if (a.id === "1" || a.id === "2") {
                        var info = {};
                        info.name = "branch_to";
                        info.label = a.name;
                        info.value = a.id;

                        info.id = a.id;
                        info.branch_name = a.name;
                        info.address = a.address;
                        info.phone_number = a.contact_person_no;
                        info.initial_cash = a.initial_drawer;
                        info.type = "All";
                        info.action_btn = ActionBtn(a);

                        setBranchesData((prev) => [...prev, info]);
                    } else {
                        var info = {};
                        info.name = "branch_to";
                        info.label = a.name;
                        info.value = a.id;

                        info.id = a.id;
                        info.branch_name = a.name;
                        info.address = a.address;
                        info.phone_number = a.contact_person_no;
                        info.initial_cash = a.initial_drawer;
                        info.type = "Mango";
                        info.action_btn = ActionBtn(a);

                        setBranchesData((prev) => [...prev, info]);
                    }
                });
            }
        } else if (shop_type === "potato_corner") {
            const response2 = await getAllBranchesPotato();

            if (response2.data) {

                let result = response2.data.data.data.map((a) => {
                    if (a.id !== "1") {
                        if (a.id !== "2") {
                            var info = {};
                            info.name = "branch_to";
                            info.label = a.name;
                            info.value = a.id;

                            info.id = a.id;
                            info.branch_name = a.name;
                            info.address = a.address;
                            info.phone_number = a.contact_person_no;
                            info.initial_cash = a.initial_drawer;
                            info.type = "Potato";
                            info.action_btn = ActionBtn(a);
                            setBranchesData((prev) => [...prev, info]);
                        }
                    }
                });
            }
        }
    }

    function ReviewTransfer(row) {
        return (
            <button
                type="button"
                className="button-primary view-btn me-3"
                onClick={() => handleReviewTransfer(row.doc_no, row.status)}
            >
                View
            </button>
        );
    }

    function handleReviewTransfer(id, transfer_status) {
        window.open(
            "/transfers/view/" + id + "/" + transfer_status, "_blank"
        );

    }

    function ViewTransfer(row) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={() => handleViewTransfer(row.doc_no, row.status)}
            >
                Review
            </button>
        );
    }

    function handleViewTransfer(id, transfer_status) {
        window.open(
            "/transfers/view/" + id + "/" + transfer_status, "_blank"
        );
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                id={row.id}
                onChange={(e) =>
                    handleSelectChange(e, row.id, row.doc_no, row.status)
                }
            >
                <option value="" selected hidden>
                    Select
                </option>

                {type === "deleted" ? (
                    <>
                        <option value="view-po" className="color-options">
                            View
                        </option>
                        <option value="return-po" className="color-options">
                            Return to Requested
                        </option>
                    </>
                ) : (
                    <>
                        {type === "approved" ? (
                            <>
                                <option
                                    value="print-po"
                                    className="color-options"
                                >
                                    {type.includes("printed")
                                        ? "Reprint"
                                        : "Print"}
                                </option>
                                <option
                                    value="send-po"
                                    className="color-options"
                                >
                                    Send to Supplier
                                </option>
                                <option
                                    value="email-po"
                                    className="color-options"
                                >
                                    Email to Supplier
                                </option>
                                <option
                                    value="return-po"
                                    className="color-yellow"
                                >
                                    Return to Pending
                                </option>
                            </>
                        ) : (
                                <>
                                    {type === "processed" ? (
                                        <>
                                            <option
                                                value="view-po"
                                                className="color-options"
                                            >
                                                View
                                            </option>
                                            {isAdmin && (
                                                <option
                                                    value="delete-po"
                                                    className="color-red"
                                                >
                                                    Delete
                                                </option>
                                            )}
                                        </>
                                    ) : (
                                            <>
                                                {type === "disapproved" ? (
                                                    <option
                                                        value="return-po"
                                                        className="color-yellow"
                                                    >
                                                        Return to Pending
                                                    </option>
                                                    ) : (
                                                        <>
                                                            {type === "all" && (
                                                                <>
                                                                    <option
                                                                        value="view-po"
                                                                        className="color-options"
                                                                    >
                                                                        View
                                                                    </option>
                                                                    {isAdmin() && (
                                                                        <option
                                                                            value="delete-po"
                                                                            className="color-red"
                                                                        >
                                                                            Delete
                                                                        </option>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )
                                                }
                                            </>
                                        )
                                    } : {type === "requested" ? (
                                            <>
                                                <option
                                                    value="review-po"
                                                    className="color-options"
                                                >
                                                    Review
                                                </option>
                                                {isAdmin() && (
                                                    <option
                                                        value="delete-po"
                                                        className="color-red"
                                                    >
                                                        Delete
                                                    </option>
                                                )}
                                            </>
                                            ) : (
                                                <>
                                                    
                                                </>
                                            )
                                    }
                                </>
                            )
                        }
                    </>
                )}
            </Form.Select>
        );
    }

    async function filterDatePO(e) {
        setShowLoader(true);
        clearTables();
        const { name, value } = e.target;
        var filterDateNew = filterDate;
        filterDateNew[name] = value;
        setFilterDate(filterDateNew);

        if (name === "branch_to" && value === "00") {
            setFilterDate({ ...filterDate, branch_to: "" });
            const response = await getAllTransfers();

            if (response.error) {
            } else {
                var transfers = response.data.data;
                transfers.map(async (PO) => {
                    var info = {};

                    info.id = PO.id;
                    info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                    info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                    info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                    info.transfer_number = PO.transfer_number;
                    info.doc_no = "Mango-" + PO.id;
                    info.branch_to = PO.branch_to;
                    info.branch_to_name = PO.branch_to_name;

                    if (PO.status === "deleted" || PO.is_deleted === "1") {
                        info.status = "deleted";
                        setDeletedTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "pending"
                    ) {
                        info.status = "requested";
                        setForApprovalTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "processed"
                    ) {
                        info.status = "processed";
                        setProcessedTransfer((prev) => [...prev, info]);
                    } else if (PO.status === "completed") {
                        info.status = "completed";
                        setCompletedTransfer((prev) => [...prev, info]);
                    }
                    setAllTransfer((prev) => [...prev, info]);
                });
            }

            const response2 = await getAllTransfersPotato();

            if (response2.error) {
            } else {
                var transfers = response2.data.data;
                transfers.map(async (PO) => {
                    var info = {};

                    info.id = PO.id;
                    info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                    info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                    info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                    info.transfer_number = PO.transfer_number;
                    info.doc_no = "Potato-" + PO.id;
                    info.branch_to = PO.branch_to;
                    info.branch_to_name = PO.branch_to_name;
                    info.branch_from = PO.branch_from;
                    info.branch_from_name = PO.branch_from_name;

                    if (PO.status === "deleted" || PO.is_deleted === "1") {
                        info.status = "deleted";
                        setDeletedTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "pending"
                    ) {
                        info.status = "requested";
                        setForApprovalTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "processed"
                    ) {
                        info.status = "processed";
                        setProcessedTransfer((prev) => [...prev, info]);
                    } else if (PO.status === "completed") {
                        info.status = "completed";
                        setCompletedTransfer((prev) => [...prev, info]);
                    }
                    setAllTransfer((prev) => [...prev, info]);
                });
            }
        } else if (
            (name === "date_from" && value !== "") ||
            (name === "date_to" && value !== "")
        ) {
            const response = await searchByDate(filterDate);
            if (response.error) {
            } else {
                var transfers = response.data.data;
                transfers.map(async (PO) => {
                    var info = {};

                    info.id = PO.id;
                    info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                    info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                    info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                    info.transfer_number = PO.transfer_number;
                    info.doc_no = "Mango-" + PO.id;
                    info.branch_to = PO.branch_to;
                    info.branch_to_name = PO.branch_to_name;
                    info.branch_from = PO.branch_from;
                    info.branch_from_name = PO.branch_from_name;
                    info.status = PO.status;

                    if (PO.status === "deleted" || PO.is_deleted === "1") {
                        info.po_status = "deleted";
                        setDeletedTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "pending"
                    ) {
                        info.status = "requested";
                        setForApprovalTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "processed"
                    ) {
                        info.status = "processed";
                        setProcessedTransfer((prev) => [...prev, info]);
                    } else if (PO.status === "completed") {
                        setCompletedTransfer((prev) => [...prev, info]);
                    }
                    setAllTransfer((prev) => [...prev, info]);
                });
            }

            const response2 = await searchByDatePotato(filterDate);
            if (response2.error) {
            } else {
                var transfers = response2.data.data;
                transfers.map(async (PO) => {
                    var info = {};

                    info.id = PO.id;
                    info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                    info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                    info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                    info.transfer_number = PO.transfer_number;
                    info.doc_no = "Potato-" + PO.id;
                    info.branch_to = PO.branch_to;
                    info.branch_to_name = PO.branch_to_name;
                    info.branch_from = PO.branch_from;
                    info.branch_from_name = PO.branch_from_name;
                    info.status = PO.status;

                    if (PO.status === "deleted" || PO.is_deleted === "1") {
                        info.po_status = "deleted";
                        setDeletedTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "pending"
                    ) {
                        info.status = "requested";
                        setForApprovalTransfer((prev) => [...prev, info]);
                    } else if (
                        PO.status === "requested" &&
                        PO.transfer_status === "processed"
                    ) {
                        info.status = "processed";
                        setProcessedTransfer((prev) => [...prev, info]);
                    } else if (PO.status === "completed") {
                        setCompletedTransfer((prev) => [...prev, info]);
                    }
                    setAllTransfer((prev) => [...prev, info]);
                });
            }
        } else {
            if (filterDate.branch_to.split("-")[1] === "Mango") {
                const response = await searchByDate(filterDate);
                if (response.error) {
                } else {
                    var transfers = response.data.data;
                    transfers.map(async (PO) => {
                        var info = {};

                        info.id = PO.id;
                        info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                        info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                        info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                        info.transfer_number = PO.transfer_number;
                        info.doc_no = "Mango-" + PO.id;
                        info.branch_to = PO.branch_to;
                        info.branch_to_name = PO.branch_to_name;
                        info.branch_from = PO.branch_from;
                        info.branch_from_name = PO.branch_from_name;
                        info.status = PO.status;

                        if (PO.status === "deleted" || PO.is_deleted === "1") {
                            info.po_status = "deleted";
                            setDeletedTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "pending"
                        ) {
                            info.status = "requested";
                            setForApprovalTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "processed"
                        ) {
                            info.status = "processed";
                            setProcessedTransfer((prev) => [...prev, info]);
                        } else if (PO.status === "completed") {
                            setCompletedTransfer((prev) => [...prev, info]);
                        }
                        setAllTransfer((prev) => [...prev, info]);
                    });
                }
            } else if (filterDate.branch_to.split("-")[1] === "Potato") {
                const response = await searchByDatePotato(filterDate);
                if (response.error) {
                } else {
                    var transfers = response.data.data;
                    transfers.map(async (PO) => {
                        var info = {};

                        info.id = PO.id;
                        info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                        info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                        info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                        info.transfer_number = PO.transfer_number;
                        info.doc_no = "Potato-" + PO.id;
                        info.branch_to = PO.branch_to;
                        info.branch_to_name = PO.branch_to_name;
                        info.branch_from = PO.branch_from;
                        info.branch_from_name = PO.branch_from_name;
                        info.status = PO.status;

                        if (PO.status === "deleted" || PO.is_deleted === "1") {
                            info.po_status = "deleted";
                            setDeletedTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "pending"
                        ) {
                            info.status = "requested";
                            setForApprovalTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "processed"
                        ) {
                            info.status = "processed";
                            setProcessedTransfer((prev) => [...prev, info]);
                        } else if (PO.status === "completed") {
                            setCompletedTransfer((prev) => [...prev, info]);
                        }
                        setAllTransfer((prev) => [...prev, info]);
                    });
                }
            } else if (filterDate.branch_to.split("-")[1] === "All") {
                const response = await searchByDate(filterDate);
                if (response.error) {
                } else {
                    var transfers = response.data.data;
                    transfers.map(async (PO) => {
                        var info = {};

                        info.id = PO.id;
                        info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                        info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                        info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                        info.transfer_number = PO.transfer_number;
                        info.doc_no = "Mango-" + PO.id;
                        info.branch_to = PO.branch_to;
                        info.branch_to_name = PO.branch_to_name;
                        info.branch_from = PO.branch_from;
                        info.branch_from_name = PO.branch_from_name;
                        info.status = PO.status;

                        if (PO.status === "deleted" || PO.is_deleted === "1") {
                            info.po_status = "deleted";
                            setDeletedTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "pending"
                        ) {
                            info.status = "requested";
                            setForApprovalTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "processed"
                        ) {
                            info.status = "processed";
                            setProcessedTransfer((prev) => [...prev, info]);
                        } else if (PO.status === "completed") {
                            setCompletedTransfer((prev) => [...prev, info]);
                        }
                        setAllTransfer((prev) => [...prev, info]);
                    });
                }

                const response2 = await searchByDatePotato(filterDate);
                if (response2.error) {
                } else {
                    var transfers = response2.data.data;
                    transfers.map(async (PO) => {
                        var info = {};

                        info.id = PO.id;
                        info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                        info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                        info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                        info.transfer_number = PO.transfer_number;
                        info.doc_no = "Potato-" + PO.id;
                        info.branch_to = PO.branch_to;
                        info.branch_to_name = PO.branch_to_name;
                        info.branch_from = PO.branch_from;
                        info.branch_from_name = PO.branch_from_name;
                        info.status = PO.status;

                        if (PO.status === "deleted" || PO.is_deleted === "1") {
                            info.po_status = "deleted";
                            setDeletedTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "pending"
                        ) {
                            info.status = "requested";
                            setForApprovalTransfer((prev) => [...prev, info]);
                        } else if (
                            PO.status === "requested" &&
                            PO.transfer_status === "processed"
                        ) {
                            info.status = "processed";
                            setProcessedTransfer((prev) => [...prev, info]);
                        } else if (PO.status === "completed") {
                            setCompletedTransfer((prev) => [...prev, info]);
                        }
                        setAllTransfer((prev) => [...prev, info]);
                    });
                }
            }
        }
        setShowLoader(false);
    }

    //API CALL
    async function fetchSearchTransfer(id) {
        setShowLoader(true);
        clearTables();
        const response = await searchByTransfer(id);
        if (response.error) {
        } else {
            var transfers = response.data.data;
            transfers.map(async (PO) => {
                var info = {};

                info.id = PO.id;
                info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                info.transfer_number = PO.transfer_number;
                info.doc_no = PO.id;
                info.branch_to = PO.branch_to;
                info.branch_to_name = PO.branch_to_name;

                if (PO.status === "deleted" || PO.is_deleted === "1") {
                    info.status = "deleted";
                    setDeletedTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "pending"
                ) {
                    info.status = "requested";
                    setForApprovalTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "processed"
                ) {
                    info.status = "processed";
                    setProcessedTransfer((prev) => [...prev, info]);
                } else if (PO.status === "completed") {
                    info.status = "completed";
                    setCompletedTransfer((prev) => [...prev, info]);
                }
                setAllTransfer((prev) => [...prev, info]);
            });
        }

        const response2 = await searchByTransferPotato(id);
        if (response2.error) {
        } else {
            var transfers = response2.data.data;
            transfers.map(async (PO) => {
                var info = {};

                info.id = PO.id;
                info.transfer_date = Moment(PO.transfer_date).format("MM-DD-YYYY");
                info.date_received = Moment(PO.date_received).format("MM-DD-YYYY");
                info.added_on = Moment(PO.added_on).format("MM-DD-YYYY");
                info.transfer_number = PO.transfer_number;
                info.doc_no = PO.id;
                info.branch_to = PO.branch_to;
                info.branch_to_name = PO.branch_to_name;

                if (PO.status === "deleted" || PO.is_deleted === "1") {
                    info.status = "deleted";
                    setDeletedTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "pending"
                ) {
                    info.status = "requested";
                    setForApprovalTransfer((prev) => [...prev, info]);
                } else if (
                    PO.status === "requested" &&
                    PO.transfer_status === "processed"
                ) {
                    info.status = "processed";
                    setProcessedTransfer((prev) => [...prev, info]);
                } else if (PO.status === "completed") {
                    info.status = "completed";
                    setCompletedTransfer((prev) => [...prev, info]);
                }
                setAllTransfer((prev) => [...prev, info]);
            });
        }
        setShowLoader(false);
    }

    React.useEffect(() => {
        fetchSuppliers();
        fetchBranchesFilter();
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
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> INCOMING TRANSFERS </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="transfer_number"
                            className="search-bar"
                            placeholder="Search transfer number..."
                            onKeyPress={(e) =>
                                e.key === ("Enter" || "NumpadEnter") &&
                                handleFilterChange(e)
                            }
                        />
                        <DropdownButton
                            as={ButtonGroup}
                            title="Add"
                            id="bg-nested-dropdown"
                            className="add-btn"
                            onSelect={handleAddSelect}
                        >
                            <Dropdown.Item
                                eventKey="MANGO MAGIC"
                                onClick={() =>
                                    navigate("/transfers/add/mango_magic")
                                }
                            >
                                To Mango Magic
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="POTATO CORNER"
                                onClick={() =>
                                    navigate("/transfers/add/potato_corner")
                                }
                            >
                                To Potato Corner
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>

                {/* tabs */}
                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="PO-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="requested" title="for approval">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>

                            <Form.Select
                                name="shop_type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.shop_type}
                            >
                                <option selected value="">
                                    All Shops
                                </option>
                                <option value="mango_magic">Mango Magic</option>
                                <option value="potato_corner">
                                    Potato Corner
                                </option>
                            </Form.Select>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"Branch From"}
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                    }),
                                    
                                }}
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchFromChange}
                            />
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Branch To"
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    
                                }}
                                // value={branchTo}
                                options={branchOptions}
                                onChange={handleBranchToChange}
                            />
                            {/* {filterConfig.shop_type !== "" && (
                                <Select
                                    className="dropsearch-filter px-0 py-0"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchValue}
                                    options={branchesData}
                                    onChange={handleSelectDropsearch}
                                />
                            )}

                            <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch from
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select>
                            <Form.Select
                                name="branch_to"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch to
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}


                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="transfer_date_from"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_from}
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="transfer_date_to"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_to}
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "TRANSFER DATE",
                                "FROM",
                                "TO",
                                "TRANS NO.",
                                "STATUS",
                                "ENCODED BY",
                                "APPROVED BY",
                                "DOC NO.",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "transfer_date",
                                "branch_from_name",
                                "branch_to_name",
                                "transfer_number",
                                "status",
                                "added_by",
                                "approved_by",
                                "doc_no",
                                "-",
                            ]}
                            tableData={transferManager}
                            ActionBtn={(row) => ActionBtn(row, row.status)}
                            ViewBtn={(row) => ViewTransfer(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="processed,for_adjustment" title="processed">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>

                            <Form.Select
                                name="shop_type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.shop_type}
                            >
                                <option selected value="">
                                    All Shops
                                </option>
                                <option value="mango_magic">Mango Magic</option>
                                <option value="potato_corner">
                                    Potato Corner
                                </option>
                            </Form.Select>

                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"Branch From"}
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                    }),
                                    
                                }}
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchFromChange}
                            />
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Branch To"
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    
                                }}
                                // value={branchTo}
                                options={branchOptions}
                                onChange={handleBranchToChange}
                            />
                            {/* { (
                                <Select
                                    className="dropsearch-filter px-0 py-0"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchValue}
                                    options={branchesData}
                                    onChange={handleSelectDropsearch}
                                />
                            )}

                            <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch from
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select>
                            <Form.Select
                                name="branch_to"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch to
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="transfer_date_from"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_from}
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="transfer_date_to"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_to}
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE TRANSFERRED",
                                "DATE RECEIVED",
                                "ENCODED ON",
                                "TRANSFER NO.",
                                "DOC NO.",
                                "TO",
                                "STATUS",
                                "APRVD BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "transfer_date",
                                "date_received",
                                "added_on",
                                "transfer_number",
                                "doc_no",
                                "branch_to_name",
                                "status",
                                "approved_by",
                            ]}
                            tableData={transferManager}
                            ActionBtn={(row) => ActionBtn(row, row.status)}
                            ViewBtn={(row) => ReviewTransfer(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="completed" title="completed">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="shop_type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.shop_type}
                            >
                                <option selected value="">
                                    All Shops
                                </option>
                                <option value="mango_magic">Mango Magic</option>
                                <option value="potato_corner">
                                    Potato Corner
                                </option>
                            </Form.Select>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"Branch From"}
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                    }),
                                    
                                }}
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchFromChange}
                            />
                            {/* {filterConfig.shop_type !== "" && (
                                <Select
                                    className="dropsearch-filter px-0 py-0"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchValue}
                                    options={branchesData}
                                    onChange={handleSelectDropsearch}
                                />
                            )}

                            <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch from
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Branch To"
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    
                                }}
                                // value={branchTo}
                                options={branchOptions}
                                onChange={handleBranchToChange}
                            />
                            {/* <Form.Select
                                name="branch_to"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch to
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="transfer_date_from"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_from}
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="transfer_date_to"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_to}
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "TRANSFER DATE",
                                "FROM",
                                "TO",
                                "TRANS NO.",
                                "STATUS",
                                "ENCODED BY",
                                "APPROVED BY",
                                "DOC NO.",
                            ]}
                            headerSelector={[
                                "-",
                                "transfer_date",
                                "branch_from_name",
                                "branch_to_name",
                                "transfer_number",
                                "status",
                                "added_by",
                                "approved_by",
                                "doc_no",
                            ]}
                            tableData={transferManager}
                            ViewBtn={(row) => ReviewTransfer(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="" title="all" className="manager-tabs">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="shop_type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.shop_type}
                            >
                                <option selected value="">
                                    All Shops
                                </option>
                                <option value="mango_magic">Mango Magic</option>
                                <option value="potato_corner">
                                    Potato Corner
                                </option>
                            </Form.Select>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"Branch From"}
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                    }),
                                    
                                }}
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchFromChange}
                            />
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Branch To"
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    
                                }}
                                // value={branchTo}
                                options={branchOptions}
                                onChange={handleBranchToChange}
                            />
                            {/* {filterConfig.shop_type !== "" && (
                                <Select
                                    className="dropsearch-filter px-0 py-0"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchValue}
                                    options={branchesData}
                                    onChange={handleSelectDropsearch}
                                />
                            )}

                            <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch from
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select>
                            <Form.Select
                                name="branch_to"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch to
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="transfer_date_from"
                                value={filterConfig.transfer_date_from}
                                onChange={handleFilterChange}
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="transfer_date_to"
                                value={filterConfig.transfer_date_to}
                                onChange={handleFilterChange}
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "TRANSFER DATE",
                                "FROM",
                                "TO",
                                "TRANS NO.",
                                "STATUS",
                                "ENCODED BY",
                                "APPROVED BY",
                                "DOC NO.",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "transfer_date",
                                "branch_from_name",
                                "branch_to_name",
                                "transfer_number",
                                "status",
                                "added_by",
                                "approved_by",
                                "doc_no",
                                "-",
                            ]}
                            tableData={transferManager}
                            ActionBtn={(row) => ActionBtn(row, "all")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="deleted" title="deleted">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="shop_type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.shop_type}
                            >
                                <option selected value="">
                                    All Shops
                                </option>
                                <option value="mango_magic">Mango Magic</option>
                                <option value="potato_corner">
                                    Potato Corner
                                </option>
                            </Form.Select>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"Branch From"}
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                    }),
                                    
                                }}
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchFromChange}
                            />
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Branch To"
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    
                                }}
                                // value={branchTo}
                                options={branchOptions}
                                onChange={handleBranchToChange}
                            />
                            {/* {filterConfig.shop_type !== "" && (
                                <Select
                                    className="dropsearch-filter px-0 py-0"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={branchValue}
                                    options={branchesData}
                                    onChange={handleSelectDropsearch}
                                />
                            )}

                            <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch from
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select>
                            <Form.Select
                                name="branch_to"
                                className="date-filter me-2"
                                onChange={handleFilterChange}
                            >
                                <option value="" selected>
                                    Branch to
                                </option>
                                {branches.length > 0 ? (
                                    branches.filter((v, i) => {
                                        return (
                                            branches.map((val) => val.id).indexOf(v.id) == i
                                        );
                                    })
                                    .map((branch) => {
                                        return (
                                            <option
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-4 align-middle mt-2">
                                Date From:
                            </span>
                            <Form.Control
                                type="date"
                                name="transfer_date_from"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_from}
                                className="date-filter me-3"
                            />

                            <span className="me-4 align-middle mt-2">To:</span>
                            <Form.Control
                                type="date"
                                name="transfer_date_to"
                                onChange={handleFilterChange}
                                value={filterConfig.transfer_date_to}
                                className="date-filter me-3"
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "TRANSFER DATE",
                                "FROM",
                                "TO",
                                "TRANS NO.",
                                "STATUS",
                                "ENCODED BY",
                                "APPROVED BY",
                                "DOC NO.",
                            ]}
                            headerSelector={[
                                "-",
                                "transfer_date",
                                "branch_from_name",
                                "branch_to_name",
                                "transfer_number",
                                "status",
                                "added_by",
                                "approved_by",
                                "doc_no",
                            ]}
                            tableData={transferManager}
                            ActionBtn={(row) => ActionBtn(row, row.status)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>

            {/* modals */}
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="transfer"
                onDelete={() => handleDeleteTransfer()}
            />
            <TransferModal
                show={showApproveModal}
                hide={handleCloseApproveModal}
                type="Return to Request"
                handler={handleRequestTransfer}
            />
        </div>
    );
}
