import React, { useEffect, useState } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import {
    dateFormat,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
    numberFormatInt,
} from "../../../Helpers/Utils/Common";

import DeleteModal from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import POModal from "./Components/POModal";
import PoPaymentModal from "./Components/PoPaymentModal";
import Select from "react-select";
import toast from "react-hot-toast";
import {
    changeStatusPurchaseOrder,
    deletePurchaseOrder,
    getAllPurchaseOrder,
    getItems,
    receivePurchaseOrder,
    getPurchaseOrder,
    searchPurchaseOrder,
    searchPurchaseOrderPotato,
} from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllSuppliers } from "../../../Helpers/apiCalls/suppliersApi";
import {getAllSuppliersPotato} from "../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getAllVendors } from "../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../Helpers/apiCalls/PotatoCorner/VendorsApi";
import { getSingleUser } from "../../../Helpers/apiCalls/usersApi";
import { getType } from "../../../Helpers/Utils/Common";
import EmailPurchaseOrder from "./Components/EmailPurchaseOrder";
import "./PurchaseOrders.css";
import { emailPurchaseOrder } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { searchByDate } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    getAllPurchaseOrderPotato,
    searchByDatePotato,
    changeStatusPurchaseOrderPotato,
    deletePurchaseOrderPotato,
} from "../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import Moment from "moment";
import DatePicker from "react-datepicker";

export default function PurchaseOrders() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [userType, setUserType] = useState(getType());
    const [POtype, setPOType] = useState("");
    const [receivePODetails, setReceivePODetails] = useState({});

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    /* add payment modal handler */
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const handleShowAddPaymentModal = () => setShowAddPaymentModal(true);
    const handleCloseAddPaymentModal = () => setShowAddPaymentModal(false);

    const [poID, setPoID] = useState({ id: "", supplier: "" });
    const [filterValue, setFilterValue] = useState("");
    const [filterDate, setFilterDate] = useState({
        to: "",
        from: "",
        supplier_id: "",
        type: "",
    });
    const [bal, setBal] = useState("");

    const [filterConfig, setFilterConfig] = useState({
        tab: "pending",
        status: "pending",
        order_status: "",
        supplier_id: "",
        purchase_date_from: "",
        purchase_date_to: "",
        type: "", 
    });

    // useEffect(()=>{
    //     setFilterConfig(() => {
    //         if (window.localStorage.getItem('purchases-purchaseOrders-filterConfig') != null){
    //             return JSON.parse(window.localStorage.getItem('purchases-purchaseOrders-filterConfig'))
    //         } else {
    //             var defaultConfig = {
    //                 tab: "pending",
    //                 status: "pending",
    //                 order_status: "",
    //                 supplier_id: "",
    //                 // to: "",
    //                 // from: "",
    //                 purchase_date_from: "",
    //                 purchase_date_to: "",
    //                 type: "", // shoptype: mango / potato
    //             }
    //             return defaultConfig
    //         }
    //     });
    // }, [])

    // useEffect(()=>{
    //     // window.localStorage.setItem("purchases-purchaseOrders-filterConfig", JSON.stringify(filterConfig));
    //     // console.log(filterConfig);
    // }, [filterConfig]);

    const [purchasesManager, setPurchasesManager] = useState([]);
    async function searchPO(filterConfig) {
        console.log(filterConfig)
        setShowLoader(true);
        var allData = [];
        setPurchasesManager([]);
        if (filterConfig.type === "mango") {
            const response = await searchPurchaseOrder(filterConfig);
            if(response.data) {
                response.data.data.map((PO) => {
                    var info = {};
    
                    info.id = "mango-" + PO.id;
                    info.type = "mango";
                    info.purchase_date = Moment(PO.purchase_date).format("MM-DD-YYYY");
                    info.trade_name = PO.supplier_trade_name
                        ? PO.supplier_trade_name
                        : PO.vendor_trade_name;
                    info.grand_total = numberFormat(PO.grand_total);
                    info.order_status = PO.order_status;
                    info.can_be_paid = PO.can_be_paid;
                    info.po_status = PO.status;
                    info.payment_status = PO.payment_status;
                    info.added_by_name = PO.added_by_name;
                    info.approved_by_name = PO.approved_by_name;
                    info.printed_by_name = PO.printed_by_name;
                    info.supplier_id = PO.supplier_id;
                    info.added_by_name = PO.added_by_name;
                    info.pay_ref_no = !PO.payments? "" : PO.payments[0]?.payment_mode === "check" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.check_no
                                                        : PO.payments[0]?.payment_mode === "bank" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.reference_no
                                                        : PO.payments[0]?.payment_mode
                    info.pay_id_no = !PO.payments? "" :  PO.payments[0]?.receive_id? PO.payments[0].receive_id : "";
                    info.invoice = PO.invoice_no?.map((invoice) => {
                        return invoice.invoice_no ? invoice.invoice_no : ""
                    })
                    info.invoice_id = PO.invoice_no?.map((invoice) => {
                        return invoice.id ? invoice.id : ""
                    })
                    allData.push(info);
                    return info;
                });
            }
        } else {
            // TokenExpiry(response);
        }
        if (filterConfig.type === "potato") {
            const response2 = await searchPurchaseOrderPotato(filterConfig);
            if(response2.data) {
                response2.data.data.map((PO) => {
                    var info = {};
    
                    info.id = "potato-" + PO.id;
                    info.type = "potato";
                    info.purchase_date = Moment(PO.purchase_date).format("MM-DD-YYYY");
                    info.trade_name = PO.supplier_trade_name
                        ? PO.supplier_trade_name
                        : PO.vendor_trade_name;
                    info.grand_total = numberFormat(PO.grand_total);
                    info.order_status = PO.order_status;
                    info.can_be_paid = PO.can_be_paid;
                    info.po_status = PO.status;
                    info.payment_status = PO.payment_status;
                    info.added_by_name = PO.added_by_name;
                    info.approved_by_name = PO.approved_by_name;
                    info.printed_by_name = PO.printed_by_name;
                    info.supplier_id = PO.supplier_id;
                    info.added_by_name = PO.added_by_name;
                    info.pay_ref_no = !PO.payments? "" : PO.payments[0]?.payment_mode === "check" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.check_no
                                                        : PO.payments[0]?.payment_mode === "bank" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.reference_no
                                                        : PO.payments[0]?.payment_mode
                    info.pay_id_no = !PO.payments? "" :  PO.payments[0]?.receive_id? PO.payments[0].receive_id : "";
                    info.invoice_no = PO.invoice_no?.map((invoice) => {
                        return invoice.invoice_no ? invoice.invoice_no : ""
                    })
                    info.invoice_id = PO.invoice_no?.map((invoice) => {
                        return invoice.id ? invoice.id : ""
                    })
                    allData.push(info);
                });
            }
        } else {
            const response = await searchPurchaseOrder(filterConfig);
            if(response.data) {
                response.data.data.map((PO) => {
                    var info = {};
    
                    info.id = "mango-" + PO.id;
                    info.type = "mango";
                    info.purchase_date = Moment(PO.purchase_date).format("MM-DD-YYYY");
                    info.trade_name = PO.supplier_trade_name
                        ? PO.supplier_trade_name
                        : PO.vendor_trade_name;
                    info.grand_total = numberFormat(PO.grand_total);
                    info.order_status = PO.order_status;
                    info.can_be_paid = PO.can_be_paid;
                    info.po_status = PO.status;
                    info.payment_status = PO.payment_status;
                    info.added_by_name = PO.added_by_name;
                    info.approved_by_name = PO.approved_by_name;
                    info.printed_by_name = PO.printed_by_name;
                    info.supplier_id = PO.supplier_id;
                    info.added_by_name = PO.added_by_name;
                    info.pay_ref_no = !PO.payments? "" : PO.payments[0]?.payment_mode === "check" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.check_no
                                                        : PO.payments[0]?.payment_mode === "bank" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.reference_no
                                                        : PO.payments[0]?.payment_mode
                    info.pay_id_no = !PO.payments? "" :  PO.payments[0]?.receive_id? PO.payments[0].receive_id : "";
                    info.invoice = PO.invoice_no?.map((invoice) => {
                        return invoice.invoice_no ? invoice.invoice_no : ""
                    })
                    info.invoice_id = PO.invoice_no?.map((invoice) => {
                        return invoice.id ? invoice.id : ""
                    })
                    allData.push(info);
                    return info;
                });
            }

            const response2 = await searchPurchaseOrderPotato(filterConfig);
            if(response2.data) {
                response2.data.data.map((PO) => {
                    var info = {};
    
                    info.id = "potato-" + PO.id;
                    info.type = "potato";
                    info.purchase_date = Moment(PO.purchase_date).format("MM-DD-YYYY");
                    info.trade_name = PO.supplier_trade_name
                        ? PO.supplier_trade_name
                        : PO.vendor_trade_name;
                    info.grand_total = numberFormat(PO.grand_total);
                    info.order_status = PO.order_status;
                    info.can_be_paid = PO.can_be_paid;
                    info.po_status = PO.status;
                    info.payment_status = PO.payment_status;
                    info.added_by_name = PO.added_by_name;
                    info.approved_by_name = PO.approved_by_name;
                    info.printed_by_name = PO.printed_by_name;
                    info.supplier_id = PO.supplier_id;
                    info.added_by_name = PO.added_by_name;
                    info.pay_ref_no = !PO.payments? "" : PO.payments[0]?.payment_mode === "check" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.check_no
                                                        : PO.payments[0]?.payment_mode === "bank" ? PO.payments[0]?.payment_mode + " - " + PO.payments[0]?.reference_no
                                                        : PO.payments[0]?.payment_mode
                    info.pay_id_no = !PO.payments? "" :  PO.payments[0]?.receive_id? PO.payments[0].receive_id : "";
                    info.invoice_no = PO.invoice_no?.map((invoice) => {
                        return invoice.invoice_no ? invoice.invoice_no : ""
                    })
                    info.invoice_id = PO.invoice_no?.map((invoice) => {
                        return invoice.id ? invoice.id : ""
                    })
                    allData.push(info);
                });
            }
        }
        setPurchasesManager(allData.sort((a, b) =>
            new Date(...a.purchase_date?.split('/').reverse()) - new Date(...b.purchase_date?.split('/').reverse())
        ).reverse());
        setShowLoader(false);
    }
    const handleTabSelect = (tabKey) => {
        if (tabKey === "complete" || tabKey === "incomplete") {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    tab: tabKey,
                    status: "",
                    order_status: tabKey,
                    supplier_id: "",
                    vendor_id: "",
                    type: "",
                    purchase_date_from: "",
                    purchase_date_to: "",
                };
            });
        } else {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    tab: tabKey,
                    status: tabKey,
                    order_status: "",
                    supplier_id: "",
                    vendor_id: "",
                    type: "",
                    purchase_date_from: "",
                    purchase_date_to: "",
                };
            });
        }
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if(name === "supplier_id") {
            var id = value.split("|")[0]
            var type = value.split("|")[1]
            var by = value.split("|")[2]
            if(by === "supplier"){
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        ["supplier_id"]: id,
                        ["vendor_id"]: "",
                        ["type"]: type,
                    };
                });
            } else {
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        ["supplier_id"]: "",
                        ["vendor_id"]: id,
                        ["type"]: type,
                    };
                });
            }
            
        } else {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    [name]: value,
                };
            });
        }
        
    };
    React.useEffect(() => {
        searchPO(filterConfig);
    }, [filterConfig]);

    async function handleDeletePO() {
        if (poID.id.split("-")[0] === "mango") {
            const response = await deletePurchaseOrder(poID.id);
            if (response.response) {
                toast.success("Purchase Order Deleted Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error Deleting Purchase Order", {
                    style: toastStyle(),
                });
            }
        } else if (poID.id.split("-")[0] === "potato") {
            const response = await deletePurchaseOrderPotato(poID.id);
            if (response.response) {
                toast.success("Purchase Order Deleted Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error Deleting Purchase Order", {
                    style: toastStyle(),
                });
            }
        }
    }

    /* return modal handler */
    const [showReturnModal, setShowReturnModal] = useState(false);
    const handleShowReturnModal = () => setShowReturnModal(true);
    const handleCloseReturnModal = () => setShowReturnModal(false);

    async function handleReturnPO() {
        const id = poID.id.split("-");
        if (id[0] === "mango") {
            const response = await changeStatusPurchaseOrder(id[1], "pending");
            if (
                response.response.response ===
                "purchase status changed successfully"
            ) {
                toast.success("Purchase Returned to Pending", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error Returning Purchase to Pending", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            }
        } else if (id[0] === "potato") {
            const response = await changeStatusPurchaseOrderPotato(
                id[1],
                "pending"
            );
            if (
                response.response.response ===
                "purchase status changed successfully"
            ) {
                toast.success("Purchase Returned to Pending", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error Returning Purchase to Pending", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            }
        }
    }

    async function handleClosePO() {
        const id = poID.id.split("-");

        if (poID.id.split("-")[0] === "mango") {
            const response = await changeStatusPurchaseOrder(id[1], "closed");
            if (
                response.response.response ===
                "purchase status changed successfully"
            ) {
                toast.success("Purchase closed", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error closing purchase order", {
                    style: toastStyle(),
                });
            }
        } else if (poID.id.split("-")[0] === "potato") {
            const response = await changeStatusPurchaseOrderPotato(
                id[1],
                "closed"
            );
            if (
                response.response.response ===
                "purchase status changed successfully"
            ) {
                toast.success("Purchase closed", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(response);
                toast.error("Error closing purchase order", {
                    style: toastStyle(),
                });
            }
        }
    }

    const [suppliers, setSuppliers] = useState([]);

    const [supplierList, setSupplierList] = useState ([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");

    useEffect(()=>{
        setSupplierList(suppliers.map((supplier)=>{
            return {label: supplier.trade_name, value:supplier.id + "|" + supplier.type};
        }))
        setSupplierList((branches)=>{
            var newBranches = [{label: "All Suppliers", value:""}, ...branches];
            return newBranches;
        });
    },[suppliers])

    function handleSupplierChange(e){
        setSelectedSupplier(e.name)
        const toFilter = {target: {name: "supplier_id", value: e.value}};
        handleFilterChange(toFilter);
    }


    async function fetchSuppliers() {
        setSuppliers([]);

        const suppliersResponse = await getAllSuppliers();
        const suppliersPotatoResponse = await getAllSuppliersPotato();
        const vendorsResponse = await getAllVendors();
        const vendorsPotatoResponse = await getAllVendorsPotato();

            if (suppliersResponse.error) {
                TokenExpiry(suppliersResponse);
            } else {
                suppliersResponse.data.data.map((supplier) => {
                    var info = supplier;
                    info.type = "mango|supplier"
                    setSuppliers((prev) => [...prev, info]);
                });
            }

            if (suppliersPotatoResponse.error) {
                TokenExpiry(suppliersPotatoResponse);
            } else {
                suppliersPotatoResponse.response.data.map((supplier) => {
                    var info = supplier;
                    info.type = "potato|supplier"
                    setSuppliers((prev) => [...prev, info]);
                });
            }

            if (vendorsResponse.error) {
                TokenExpiry(vendorsResponse);
            } else {
                vendorsResponse.response.data.map((vendor) => {
                    var info = vendor;
                    info.type = "mango|vendor"
                    setSuppliers((prev) => [...prev, info]);
                });
            }

            if (vendorsPotatoResponse.error) {
                TokenExpiry(vendorsPotatoResponse);
            } else {
                vendorsPotatoResponse.response.data.map((vendor) => {
                    var info = vendor;
                    info.type = "potato|vendor"
                    setSuppliers((prev) => [...prev, info]);
                });
            }
    }

    async function handleEmailPO(id) {
        const response = await emailPurchaseOrder(id);

        if (response.response) {
            toast.success("Email Sent Successfully", { style: toastStyle() });
        } else {
            TokenExpiry(response);
            toast.error("Error Sending Email", { style: toastStyle() });
        }
        setTimeout(() => refreshPage(), 1000);
    }

    async function handleSelectChange(e, suppID, type, row) {
        setPoID({ id: e.target.id, supplier: suppID, name: row.trade_name });
        setPOType(type);
        switch (e.target.value) {
            case "edit-po":
                var info = e.target.id.split("-");
                window.open(
                    "purchaseorders/edit/" +
                        info[0].replace(/\s/g, "") +
                        "/" +
                        e.target.id +
                        "/" +
                        type,
                    "_blank"
                );
                break;

            case "delete-po":
                handleShowDeleteModal();
                break;

            case "return-po":
                handleShowReturnModal();
                break;

            case "print-po":
                navigate("print/" + e.target.id, {
                    state: { type: type, suppID: suppID },
                });
                break;

            case "review-po":
                var info = e.target.id.split("-");
                window.open(
                    "purchaseorders/review/0/" +
                        info[0].replace(/\s/g, "") +
                        "/" +
                        e.target.id,
                    "_blank"
                );
                break;

            case "view-po":
                var info = e.target.id.split("-");
                window.open(
                    "purchaseorders/review/1/" +
                        info[0].replace(/\s/g, "") +
                        "/" +
                        e.target.id,
                    "_blank"
                );

                break;

            case "payment-po":
                setBal(numberFormatInt(row.grand_total));
                handleShowAddPaymentModal();
                break;

            case "send-po":
                handleShowSendModal();
                break;

            case "close-po":
                handleShowClosePOModal();
                break;

            case "email-po":
                navigate("print/" + e.target.id, {
                    state: { type: type, suppID: suppID },
                });
                break;

            case "receive-po":
                navigate(
                    "/purchaseinvoices/add/" +
                        e.target.id.split("-")[1] +
                        "/" +
                        e.target.id.split("-")[0]
                );
                break;
        }
    }
    

    /* send modal handler */
    const [showSendModal, setShowSendModal] = useState(false);
    const handleShowSendModal = () => setShowSendModal(true);
    const handleCloseSendModal = () => setShowSendModal(false);

    /* close modal handler */
    const [showClosePOModal, setShowClosePOModal] = useState(false);
    const handleShowClosePOModal = () => setShowClosePOModal(true);
    const handleCloseClosePOModal = () => setShowClosePOModal(false);

    async function handleSendPO() {
        const id = poID.id.split("_");
        const response = await changeStatusPurchaseOrder(id[1], "sent");

        if (
            response.response.response ===
            "purchase status changed successfully"
        ) {
            toast.success("Purchase Sent Successfully", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            TokenExpiry(response);
            toast.error("Error Sending Purchase", { style: toastStyle() });
            setTimeout(() => refreshPage(), 1000);
        }
    }

    /* email modal handler */
    const [showEmailModal, setShowEmailModal] = useState(false);
    const handleShowEmailModal = () => setShowEmailModal(true);
    const handleCloseEmailModal = () => {
        setShowEmailModal(false);
    };

    const [pendingPO, setPendingPO] = useState([]);
    const [approvedPO, setApprovedPO] = useState([]);
    const [printedPO, setPrintedPO] = useState([]);
    const [sentPO, setSentPO] = useState([]);
    const [disapprovedPO, setDisapprovedPO] = useState([]);
    const [deletedPO, setDeletedPO] = useState([]);
    const [allPO, setAllPO] = useState([]);
    const [approvalPO, setApprovalPO] = useState([]);
    const [completedPO, setCompletedPO] = useState([]);
    const [incompletePO, setIncompletePO] = useState([]);

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
        setCompletedPO([]);
    }

    const [showLoader, setShowLoader] = useState(false);

    function InvoiceBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleViewInvoice(row.invoice_id, row.type)} //or show modal
            >
                {row.invoice}
            </span>
        );
    }
    function handleViewInvoice(id, type) {
        {
            window.open("/purchaseinvoices/print/" + id + "/" + type);
        }
    }


    function ViewBtn(row, type) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.supplier_id, type, row)}
                value="view-po"
            >
                View
            </button>
        );
    }

    function EditBtn(row, type) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.supplier_id, type, row)}
                value="edit-po"
            >
                Edit
            </button>
        );
    }

    function ReviewBtn(row, type) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.supplier_id, type, row)}
                value="review-po"
            >
                Review
            </button>
        );
    }

    function ReceivePOBtn(row, type) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.supplier_id, type, row)}
                value="receive-po"
            >
                Receive PO
            </button>
        );
    }

    function DonePOBtn(row, type) {
        return (
            <>
                <button
                    name="action"
                    className="btn btn-sm view-btn-table me-1"
                    id={row.id}
                    onClick={(e) =>
                        handleSelectChange(e, row.supplier_id, type, row)
                    }
                    value="view-po"
                >
                    View
                </button>
                <button
                    name="action"
                    className="btn btn-sm view-btn-table me-1"
                    id={row.id}
                    onClick={(e) =>
                        handleSelectChange(e, row.supplier_id, type, row)
                    }
                    value="close-po"
                >
                    Close
                </button>
                <button
                    name="action"
                    className="btn btn-sm view-btn-table"
                    id={row.id}
                    onClick={(e) =>
                        handleSelectChange(e, row.supplier_id, type, row)
                    }
                    value="receive-po"
                >
                    Receive
                </button>
            </>
        );
    }

    function ReturnBtn(row, type) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.supplier_id, type, row)}
                value="return-po"
            >
                Return to Pending
            </button>
        );
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                id={row.id}
                onChange={(e) => handleSelectChange(e, row.supplier_id, type, row)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                {type === "deleted" ? (
                    <>
                        <option value="view-po" className="color-options">
                            View
                        </option>
                    </>
                ) : (
                    <>
                        {type.startsWith("approved") ? (
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
                                    value="email-po"
                                    className="color-options"
                                >
                                    Email to Supplier
                                </option>
                            </>
                        ) : (
                            <>
                                {type === "sent" ? (
                                    <>
                                        {userType ===
                                            "admin" && (
                                            <option
                                                value="edit-po"
                                                className="color-options"
                                            >
                                                Edit
                                            </option>
                                        )}
                                        <option
                                            value="print-po"
                                            className="color-options"
                                        >
                                            Print
                                        </option>
                                        <option
                                            value="receive-po"
                                            className="color-options"
                                        >
                                            Receive PO
                                        </option>
                                        <option
                                            value="email-po"
                                            className="color-yellow"
                                        >
                                            Email to Supplier
                                        </option>
                                    </>
                                ) : (
                                    <>
                                        {type === "disapproved" ? (
                                            <>
                                                <option
                                                    value="view-po"
                                                    className="color-options"
                                                >
                                                    View
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
                                                {type === "for approval" ? (
                                                    <>
                                                        <option
                                                            value="review-po"
                                                            className="color-options"
                                                        >
                                                            Review for Approval
                                                        </option>
                                                    </>
                                                ) : (
                                                    <>
                                                        {type ===
                                                        "incomplete" ? (
                                                            <>
                                                                <option
                                                                    value="done-po"
                                                                    className="color-options"
                                                                >
                                                                    Done
                                                                </option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {userType ===
                                                                    "admin" && (
                                                                    <option
                                                                        value="edit-po"
                                                                        className="color-options"
                                                                    >
                                                                        Edit
                                                                    </option>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {userType === "admin" && (
                            <option value="delete-po" className="color-red">
                                Delete
                            </option>
                        )}
                    </>
                )}
            </Form.Select>
        );
    }

    function redirectAddTo(e) {
        const { value } = e.target;

        return navigate("/purchaseorders/add/" + value);
    }

    function AddPaymentBtn(row, type) {
        // console.log(row)
        if(row.can_be_paid === "0") {
            return (
                <button
                    name="action"
                    className="btn btn-sm view-btn-table"
                    id={row.id}
                    onClick={(e) =>
                        handleSelectChange(e, row.supplier_id, type, row)
                    }
                    value="payment-po"
                >
                    Add Payment
                </button>
            );
        }
        
    }

    function ContractBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleViewContract(row.pay_id_no, row.type)}
            >
                {row.pay_ref_no}
            </span>
        );
    }
    function handleViewContract(id, type) {
        {
            window.open("/purchaseinvoices/print/" + id + "/" + type);
        }
    }

    React.useEffect(() => {
        fetchSuppliers();
    }, []);

    return (
        <div className="page">
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PURCHASES"}
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
                        <h1 className="page-title"> PURCHASE ORDERS </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="anything"
                            placeholder="Search..."
                            value={filterConfig.anything}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <div className="my-2 px-4 PO-filters d-flex">
                            <Form.Select
                                name="add-type"
                                className="date-filter me-3 add-type"
                                onChange={(e) => redirectAddTo(e)}
                            >
                                <option value="" hidden selected>
                                    Select Add
                                </option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>
                        </div>
                    </Col>
                </Row>

                {/* tabs */}
                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="PO-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="pending" title="pending">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Select Supplier"
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
                                value={selectedSupplier}
                                options={supplierList}
                                onChange={handleSupplierChange}
                            />

                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="purchase_date_from"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="purchase_date_to"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                " ",
                                "PO NO.",
                                "PO DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PYMT STATUS",
                                "PREP. BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "payment_status",
                                "added_by_name",
                            ]}
                            tableData={purchasesManager}
                            ActionBtn={(row) => ActionBtn(row, "pending")}
                            PendingBtn={(row) => EditBtn(row, "pending")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="for_approval" title="for approval">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
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
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="purchase_date_from"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="purchase_date_to"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                " ",
                                "PO NO.",
                                "PO DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PYMT STATUS",
                                "PREP. BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "payment_status",
                                "added_by_name",
                            ]}
                            tableData={purchasesManager}
                            ActionBtn={(row) => ActionBtn(row, "for approval")}
                            PendingBtn={(row) => ReviewBtn(row, "for approval")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="approved" title="approved">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
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
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />

                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="purchase_date_from"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="purchase_date_to"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "PO NO.",
                                "PO DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PYMT STATUS",
                                "PREP. BY",
                                "APPR. BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "payment_status",
                                "added_by_name",
                                "approved_by_name",
                            ]}
                            tableData={purchasesManager}
                            ActionBtn={(row) => ActionBtn(row, row.po_status)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="sent" title="sent">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
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
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="purchase_date_from"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="purchase_date_to"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "+",
                                " ",
                                "PO NO.",
                                "PO DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PYMT STATUS",
                                "PYMT REF NO",
                                "PREP. BY",
                                "APPR. BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "+",
                                "",
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "payment_status",
                                "added_by_name",
                                "approved_by_name",
                            ]}
                            tableData={purchasesManager}
                            ActionBtn={(row) => ActionBtn(row, "sent")}
                            PendingBtn={(row) => ReceivePOBtn(row, "sent")}
                            newTabBtn={(row) => ContractBtn(row, row.po_status)}
                            PaymentBtn={(row) => AddPaymentBtn(row, "sent")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="incomplete" title="incomplete">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
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
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            {/* <Form.Select
                                name="supplier_id"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterDate.supplier_id}
                            >
                                <option value="" hidden selected>
                                    Select Supplier
                                </option>
                                <option value="">All</option>
                                {suppliers.map((supplier) => {
                                    return (
                                        <option value={supplier.id + "|" + supplier.type}>
                                            {supplier.trade_name}
                                        </option>
                                    );
                                })}
                            </Form.Select> */}

                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterDate.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="">All</option>
                                <option value="mango">Mango</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="purchase_date_from"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="purchase_date_to"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "   ",
                                "PO NO.",
                                "PO DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PYMT STATUS",
                                "PYMT REF NO",
                                "PREP. BY",
                                "APPR. BY",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "payment_status",
                                "added_by_name",
                                "approved_by_name",
                            ]}
                            tableData={purchasesManager}
                            PendingBtn={(row) => DonePOBtn(row, "incomplete")}
                            newTabBtn={(row) => ContractBtn(row, row.po_status)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="complete" title="completed">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
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
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="purchase_date_from"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="purchase_date_to"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                " ",
                                "PO NO.",
                                "INV NO.",
                                "PO DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PYMT STATUS",
                                "PYMT REF NO",
                                "PREP. BY",
                                "APPR. BY",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "invoice",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "payment_status",
                                "added_by_name",
                                "approved_by_name",
                            ]}
                            tableData={purchasesManager}
                            PendingBtn={(row) => ViewBtn(row, row.po_status)}
                            newTabBtn={(row) => ContractBtn(row, row.po_status)}
                            InvoiceBtn={(row) => InvoiceBtn(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="disapproved" title="disapproved">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
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
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <Form.Select
                                name="type"
                                className="date-filter me-3"
                                onChange={handleFilterChange}
                                value={filterConfig.type}
                            >
                                <option value="" hidden selected>
                                    Select Type
                                </option>
                                <option value="">All</option>
                                <option value="mango">Mango Magic</option>
                                <option value="potato">Potato Corner</option>
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="purchase_date_from"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_from: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                name="purchase_date_to"
                                placeholderText={"Select date"}
                                selected={filterConfig.purchase_date_to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, purchase_date_to: date };
                                    });
                                }}
                                // maxDate={dateToday}
                                // minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                " ",
                                "PO NO.",
                                "PO DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PYMT STATUS",
                                "PREP. BY",
                                "DISAPPR. BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "purchase_date",
                                "trade_name",
                                "grand_total",
                                "payment_status",
                                "added_by_name",
                                "disapproved_by",
                            ]}
                            tableData={purchasesManager}
                            PendingBtn={(row) => ReturnBtn(row, "disapproved")}
                            ActionBtn={(row) => ActionBtn(row, "disapproved")}
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
                text="purchase order"
                onDelete={() => handleDeletePO()}
            />
            <POModal
                show={showReturnModal}
                hide={handleCloseReturnModal}
                type="return"
                handler={handleReturnPO}
            />
            <POModal
                show={showSendModal}
                hide={handleCloseSendModal}
                type="send"
                handler={handleSendPO}
            />
            <POModal
                show={showClosePOModal}
                hide={handleCloseClosePOModal}
                type="close"
                handler={handleClosePO}
            />
            <EmailPurchaseOrder
                show={showEmailModal}
                hide={handleCloseEmailModal}
                po_id={poID.id}
                supplier_id={poID.supplier}
                type={POtype}
            />
            <PoPaymentModal
                id={poID.id}
                show={showAddPaymentModal}
                onHide={handleCloseAddPaymentModal}
                balance={bal}
                payee={poID.name}
            />
        </div>
    );
}
