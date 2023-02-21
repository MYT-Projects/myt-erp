import React, { useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import Select from "react-select";
import {
    deleteBankSP,
    deleteCashSP,
    deleteCheckSP,
    getAllSupplierPayments,
    searchByDate,
} from "../../../Helpers/apiCalls/Purchases/paySupplierApi";
import {
    getAllSuppliers,
    getSupplier,
} from "../../../Helpers/apiCalls/suppliersApi";
import {
    paySuppliersMockData,
    POpending,
} from "../../../Helpers/mockData/mockData";
import {
    dateFormat,
    getTodayDate,
    isAdmin,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../Helpers/Utils/Common";
import POModal from "../PurchaseOrders/Components/POModal";

import "../PurchaseOrders/PurchaseOrders.css";
import "./PaySuppliers.css";
import DatePicker from "react-datepicker";
import Moment from "moment";
import { getAllSupplierPaymentsPotato } from "../../../Helpers/apiCalls/PotatoCorner/Purchases/paySupplierApi";
import { searchByDatePotato } from "../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import { getAllSuppliersPotato } from "../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getAllVendors } from "../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../Helpers/apiCalls/PotatoCorner/VendorsApi";

export default function PaySuppliers() {
    let navigate = useNavigate();

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const [paymentDeets, setPaymentDeets] = useState({ id: "", payment: "" });
    const [inactive, setInactive] = useState(true);
    const [paymentList, setPaymentList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterSupplier, setFilterSupplier] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [dateto, setDateto] = useState("");
    const [datefrom, setDatefrom] = useState("");
    const [shopType, setShopType] = useState("");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [filterDate, setFilterDate] = useState({
        to: "",
        from: "",
        supplier_id: "",
        payment_mode: "",
        type: "",
    });
    const [filterConfig, setFilterConfig] = useState({
        to: "",
        from: "",
        supplier_id: "",
        payment_mode: "",
        type: "",
    })

    //MODAL HANDLERS
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const handleShowAddBranchModal = () => setShowAddBranchModal(true);
    const handleCloseAddBranchModal = () => {
        setShowAddBranchModal(false);
    };

    function clearTables() {
        setPaymentList([]);
        setFilteredData([]);
    }

    async function handleDeleteSP() {
        var paymentMode = paymentDeets.payment.split("-")[0];
        if (paymentMode === "cash") {
            const cashResponse = await deleteCashSP(paymentDeets.id);
            if (cashResponse.data) {
                toast.success(cashResponse.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(cashResponse);
                if (
                    cashResponse.error.data.messages.error ===
                    "cash_slip not found"
                )
                    toast.error(`Cash slip No. ${paymentDeets.id} not found!`, {
                        style: toastStyle(),
                    });
                else
                    toast.error(
                        `Failed to delete cash slip No. ${paymentDeets.id}`,
                        { style: toastStyle() }
                    );
                setTimeout(() => refreshPage(), 1000);
            }
        } else if (paymentMode === "check") {
            const checkResponse = await deleteCheckSP(paymentDeets.id);
            if (checkResponse.data) {
                toast.success(checkResponse.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(checkResponse);
                if (
                    checkResponse.error.data.messages.error ===
                    "check_slip not found"
                )
                    toast.error(
                        `Check slip No. ${paymentDeets.id} not found!`,
                        { style: toastStyle() }
                    );
                else
                    toast.error(
                        `Failed to delete check slip No. ${paymentDeets.id}`,
                        { style: toastStyle() }
                    );
                setTimeout(() => refreshPage(), 1000);
            }
        } else if (paymentMode === "bank") {
            const bankResponse = await deleteBankSP(paymentDeets.id);
            if (bankResponse.data) {
                toast.success(bankResponse.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                TokenExpiry(bankResponse);
                if (
                    bankResponse.error.data.messages.error ===
                    "bank_slip not found"
                )
                    toast.error(`Bank slip No. ${paymentDeets.id} not found!`, {
                        style: toastStyle(),
                    });
                else
                    toast.error(
                        `Failed to delete bank slip No. ${paymentDeets.id}`,
                        { style: toastStyle() }
                    );
                setTimeout(() => refreshPage(), 1000);
            }
        }
    }

    const [suppliers, setSuppliers] = useState([]);

    const [supplierList, setSupplierList] = useState ([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");

    useEffect(()=>{
        // console.log(suppliers)
        setSupplierList(suppliers.map((supplier)=>{
            return {label: supplier.trade_name, value:supplier.id + "|" + supplier.type};
        }))
        setSupplierList((branches)=>{
            var newBranches = [...branches];
            newBranches.push({label: "All Suppliers", value:""})
            return newBranches.reverse();
        });

        // console.log(branches);
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
                info.type = "mango|supplier";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (suppliersPotatoResponse.error) {
            TokenExpiry(suppliersPotatoResponse);
        } else {

            suppliersPotatoResponse.response.data.map((supplier) => {
                var info = supplier;
                info.type = "potato|supplier";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (vendorsResponse.error) {
            TokenExpiry(vendorsResponse);
        } else {
            vendorsResponse.response.data.map((vendor) => {
                var info = vendor;
                info.type = "mango|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (vendorsPotatoResponse.error) {
            TokenExpiry(vendorsPotatoResponse);
        } else {
            vendorsPotatoResponse.response.data.map((vendor) => {
                var info = vendor;
                info.type = "potato|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }
    }

    async function fetchAllSupplierPayments() {
        setShowLoader(true);
        var allData = [];
        if (filterConfig.type === "mango") {
            const response = await getAllSupplierPayments(filterConfig);
            if (response.data) {
                var allPayments = response.data.data.map((data) => {
                    var payment = data;
                    payment.shopType = "mango";
                    payment.amount = numberFormat(payment.amount);
                    payment.bank_name =
                        payment.payment_mode === "bank"
                            ? `${payment.bank_from_name || "N/A"} to ${
                                  payment.bank_to_name || "N/A"
                              }`
                            : payment.bank_from_name || "N/A";
                    payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                    payment.doc_no = payment.id || "N/A";
                    payment.issue_date = Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                    payment.payee = payment.payee || "N/A";
                    payment.payment_mode = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                                            : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                                            : payment.payment_mode
                    payment.supplier = payment.supplier || payment.vendor || "N/A";
                    allData.push(payment);
                    return payment;
                });
                setPaymentList(allData.sort((a, b) =>
                    new Date(...a.issue_date?.split('/').reverse()) - new Date(...b.issue_date?.split('/').reverse())
                ).reverse());
                setFilteredData(allData.sort((a, b) =>
                    new Date(...a.issue_date?.split('/').reverse()) - new Date(...b.issue_date?.split('/').reverse())
                ).reverse());
            }
        } else if (filterConfig.type === "mango") {
            const response2 = await getAllSupplierPaymentsPotato(filterConfig);
            if (response2.data) {
                var allPayments = response2.data.data.map((data) => {
                    var payment = data;
                    payment.shopType = "potato";
                    payment.amount = numberFormat(payment.amount);
                    payment.bank_name =
                        payment.payment_mode === "bank"
                            ? `${payment.bank_from_name || "N/A"} to ${
                                  payment.bank_to_name || "N/A"
                              }`
                            : payment.bank_from_name || "N/A";
                    payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                    payment.doc_no = payment.id || "N/A";
                    payment.issue_date = Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                    payment.payee = payment.payee || "N/A";
                    payment.payment_mode = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                                            : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                                            : payment.payment_mode
                    payment.supplier = payment.supplier || payment.vendor || "N/A";
                    allData.push(payment);
                    return payment;
                });
                setPaymentList(allData.sort((a, b) =>
                    new Date(...a.issue_date?.split('/').reverse()) - new Date(...b.issue_date?.split('/').reverse())
                ).reverse());
                setFilteredData(allData.sort((a, b) =>
                    new Date(...a.issue_date?.split('/').reverse()) - new Date(...b.issue_date?.split('/').reverse())
                ).reverse());
            } else {
                TokenExpiry(response2);
            }
        } else {
            const response = await getAllSupplierPayments(filterConfig);
            const response2 = await getAllSupplierPaymentsPotato(filterConfig);
            if (response.data) {
                var allPayments = response.data.data.map((data) => {
                    var payment = data;
                    payment.shopType = "mango";
                    payment.amount = numberFormat(payment.amount);
                    payment.bank_name =
                        payment.payment_mode === "bank"
                            ? `${payment.bank_from_name || "N/A"} to ${
                                  payment.bank_to_name || "N/A"
                              }`
                            : payment.bank_from_name || "N/A";
                    payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                    payment.doc_no = payment.id || "N/A";
                    payment.issue_date = Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                    payment.payee = payment.payee || "N/A";
                    payment.payment_mode = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                                            : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                                            : payment.payment_mode
                    payment.supplier = payment.supplier || payment.vendor || "N/A";
                    allData.push(payment);
                    return payment;
                });
            }
    
            if (response2.data) {
                var allPayments = response2.data.data.map((data) => {
                    var payment = data;
                    payment.shopType = "potato";
                    payment.amount = numberFormat(payment.amount);
                    payment.bank_name =
                        payment.payment_mode === "bank"
                            ? `${payment.bank_from_name || "N/A"} to ${
                                  payment.bank_to_name || "N/A"
                              }`
                            : payment.bank_from_name || "N/A";
                    payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                    payment.doc_no = payment.id || "N/A";
                    payment.issue_date = Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                    payment.payee = payment.payee || "N/A";
                    payment.payment_mode = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                                            : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                                            : payment.payment_mode
                    payment.supplier = payment.supplier || payment.vendor || "N/A";
                    allData.push(payment);
                    return payment;
                });
            } else {
                TokenExpiry(response2);
            }
            setPaymentList(allData.sort((a, b) =>
                new Date(...a.issue_date?.split('/').reverse()) - new Date(...b.issue_date?.split('/').reverse())
            ).reverse());
            setFilteredData(allData.sort((a, b) =>
                new Date(...a.issue_date?.split('/').reverse()) - new Date(...b.issue_date?.split('/').reverse())
            ).reverse());
        }
        setShowLoader(false);
    }

    async function filterDatePO(e) {
        setShowLoader(true);
        clearTables();
        const { name, value } = e.target;
        var filterDateNew = filterDate;
        filterDateNew[name] = value;
        setFilterDate(filterDateNew);

        if (filterDate.supplier_id === "") {
            if (
                filterDate.type === "mango" ||
                filterDate.type === "" ||
                filterDate.type === "00"
            ) {
                const response = await getAllSupplierPayments();

                if (response.error) {
                    TokenExpiry(response);
                } else {
                    var allPayments = response.data.data.map((data) => {
                        var payment = data;
                        payment.shopType = "mango";
                        payment.amount = numberFormat(payment.amount);
                        payment.bank_name =
                            payment.payment_mode === "bank"
                                ? `${payment.bank_from_name || "N/A"} to ${
                                      payment.bank_to_name || "N/A"
                                  }`
                                : payment.bank_from_name || "N/A";
                        payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                        payment.doc_no = "Mango - " + payment.id || "N/A";
                        payment.issue_date =
                            Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                        payment.payee = payment.payee || "N/A";
                        payment.payment_mode = payment.payment_mode || "N/A";
                        payment.supplier = payment.supplier || "N/A";
                        return payment;
                    });

                    if (filterDate.type === "" || filterDate.type === "00") {
                        var tempPaymentList = allPayments.concat(paymentList);
                        var tempFilteredData = allPayments.concat(filteredData);

                        setPaymentList(tempPaymentList);
                        setFilteredData(tempFilteredData);
                    } else {
                        setPaymentList(allPayments);
                        setFilteredData(allPayments);
                    }

                }
            } else if (
                filterDate.type === "potato" ||
                filterDate.type === "" ||
                filterDate.type === "00"
            ) {
                const response = await getAllSupplierPaymentsPotato();
                if (response.error) {
                } else {
                    var allPayments = response.data.data.map((data) => {
                        var payment = data;
                        payment.shopType = "potato";
                        payment.amount = numberFormat(payment.amount);
                        payment.bank_name =
                            payment.payment_mode === "bank"
                                ? `${payment.bank_from_name || "N/A"} to ${
                                      payment.bank_to_name || "N/A"
                                  }`
                                : payment.bank_from_name || "N/A";
                        payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                        payment.doc_no = "Potato - " + payment.id || "N/A";
                        payment.issue_date =
                            Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                        payment.payee = payment.payee || "N/A";
                        payment.payment_mode = payment.payment_mode || "N/A";
                        payment.supplier = payment.supplier || "N/A";
                        return payment;
                    });

                    if (filterDate.type === "" || filterDate.type === "00") {
                        var tempPaymentList = allPayments.concat(paymentList);
                        var tempFilteredData = allPayments.concat(filteredData);

                        setPaymentList(tempPaymentList);
                        setFilteredData(tempFilteredData);
                    } else {
                        setPaymentList(allPayments);
                        setFilteredData(allPayments);
                    }
                }
            }
        } else {
            if (
                filterDate.type === "mango" ||
                filterDate.type === "" ||
                filterDate.type === "00"
            ) {
                const response = await searchByDate(filterDate);
                if (response.error) {
                    TokenExpiry(response);
                } else {
                    var allPayments = response.data.data.map((data) => {
                        var payment = data;
                        payment.shopType = "mango";
                        payment.amount = numberFormat(payment.amount);
                        payment.bank_name =
                            payment.payment_mode === "bank"
                                ? `${payment.bank_from_name || "N/A"} to ${
                                      payment.bank_to_name || "N/A"
                                  }`
                                : payment.bank_from_name || "N/A";
                        payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                        payment.doc_no = "Mango - " + payment.id || "N/A";
                        payment.issue_date =
                            Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                        payment.payee = payment.payee || "N/A";
                        payment.payment_mode = payment.payment_mode || "N/A";
                        payment.supplier = payment.supplier || "N/A";
                        return payment;
                    });
                    if (filterDate.type === "" || filterDate.type === "00") {
                        var tempPaymentList = allPayments.concat(paymentList);
                        var tempFilteredData = allPayments.concat(filteredData);
                        setPaymentList(tempPaymentList);
                        setFilteredData(tempFilteredData);
                    } else {
                        setPaymentList(allPayments);
                        setFilteredData(allPayments);
                    }
                }
            } else if (
                filterDate.type === "potato" ||
                filterDate.type === "" ||
                filterDate.type === "00"
            ) {
                const response = await searchByDatePotato(filterDate);
                if (response.error) {
                } else {
                    var allPayments = response.data.data.map((data) => {
                        var payment = data;
                        payment.shopType = "potato";
                        payment.amount = numberFormat(payment.amount);
                        payment.bank_name =
                            payment.payment_mode === "bank"
                                ? `${payment.bank_from_name || "N/A"} to ${
                                      payment.bank_to_name || "N/A"
                                  }`
                                : payment.bank_from_name || "N/A";
                        payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                        payment.doc_no = "Potato - " + payment.id || "N/A";
                        payment.issue_date =
                            Moment(payment.issue_date).format("MM-DD-YYYY") || "N/A";
                        payment.payment_mode = payment.payment_mode || "N/A";
                        payment.payment_mode = payment.payment_mode || "N/A";
                        payment.supplier = payment.supplier || "N/A";
                        return payment;
                    });
                    if (filterDate.type === "" || filterDate.type === "00") {
                        var tempPaymentList = allPayments.concat(paymentList);
                        var tempFilteredData = allPayments.concat(filteredData);

                        setPaymentList(tempPaymentList);
                        setFilteredData(tempFilteredData);
                    } else {
                        setPaymentList(allPayments);
                        setFilteredData(allPayments);
                    }
                }
            }
        }
        setShowLoader(false);
    }

    function handleSelectChange(e) {

        if (e.target.value === "edit-ps") {
            navigate(
                "/paysuppliers/edit/" +
                    e.target.id +
                    "/" +
                    e.target.role.split("-")[0] +
                    "/" +
                    e.target.role.split("-")[1]
            );
        } else if (e.target.value === "delete-ps") {
            handleShowDeleteModal();
            setPaymentDeets({ id: e.target.id, payment: e.target.role });
        } else if (e.target.value === "view-ps") {
            navigate(
                "/paysuppliers/view/" +
                    e.target.id +
                    "/" +
                    e.target.role.split("-")[0] +
                    "/" +
                    e.target.role.split("-")[1]
            );
        }
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                role={`${row.payment_mode}-${row.shopType}`}
                id={row.id}
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                <option value="view-ps" className="color-options">
                    View
                </option>
                {isAdmin() && (
                    <option value="edit-ps" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin() && (
                    <option value="delete-ps" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    function ViewPayment(row) {
        return (
            <button
                type="button"
                className="button-primary view-btn me-3"
                onClick={() =>
                    handleViewPayment(row.id, row.payment_mode, row.shopType)
                }
            >
                View
            </button>
        );
    }

    function handleViewPayment(id, payment_mode, shopType) {
        window.open(
            "/paysuppliers/view/" + id + "/" + payment_mode.split(" ")[0] + "/" + shopType, "_blank"
        );
    }

    function handleAddChange(e) {
        setSelectedPayment(e.target.value);
        handleShowAddBranchModal();
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === "supplier") {
            var id = value.split("|")[0];
            var type = value.split("|")[1];
            var by = value.split("|")[2];
            if (by === "supplier") {
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        ["supplier"]: id,
                        ["supplier_id"]: id,
                        ["vendor_id"]: "",
                        ["type"]: type,
                    };
                });
            } else {
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        ["supplier"]: "",
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

    const handleFilters = (sup) => {
        if (sup === "") {
            setFilteredData(paymentList);
        } else {
            var newData = paymentList.filter((data) => data.supplier === sup);
            setFilteredData(newData);
        }
    };

    React.useEffect(() => {
        fetchSuppliers();
    }, []);

    React.useEffect(() => {
        fetchAllSupplierPayments();
    }, [filterConfig]);

    React.useEffect(() => {
        if (shopType !== "") {
            navigate("/paysuppliers/add/" + selectedPayment + "/" + shopType);
        }
    }, [shopType]);

    return (
        <div>
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
                        <h1 className="page-title"> PAYMENTS LIST </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="doc_no"
                            placeholder="Search Doc No..."
                            value={filterConfig.doc_no}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <div className="my-2 px-4 PO-filters d-flex">
                            <Form.Select
                                className="add-select"
                                className="date-filter me-3 add-type"
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option value="" hidden selected>
                                    Add
                                </option>
                                <option value="bank">Bank to Bank</option>
                                <option value="cash">Cash</option>
                                <option value="check">Check</option>
                            </Form.Select>
                        </div>
                    </Col>
                </Row>

                <div className="tab-content">
                    {/* filters */}
                    <div className="my-2 px-2 PO-filters d-flex">
                        <span className="me-4 align-middle mt-2 ps-label">
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
                            name="supplier"
                            className="date-filter me-2"
                            defaultValue={filterConfig.supplier}
                            onChange={(e) => handleFilterChange(e)}
                        >
                            <option value="" selected>
                                All Suppliers
                            </option>
                            {suppliers.length > 0 ? (
                                suppliers.map((supplier) => {
                                    return (
                                        <option
                                            value={
                                                supplier.id +
                                                "|" +
                                                supplier.type
                                            }
                                            selected={
                                                supplier.id ===
                                                filterConfig.supplier
                                            }
                                        >
                                            {supplier.trade_name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No suppliers found)
                                </option>
                            )}
                        </Form.Select> */}

                        <Form.Select
                            name="type"
                            className="date-filter me-3"
                            onChange={(e) => handleFilterChange(e)}
                            value={filterConfig.type}
                        >
                            <option value="" hidden selected>
                                Select Type
                            </option>
                            <option value="">All</option>
                            <option value="mango">Mango Magic</option>
                            <option value="potato">Potato Corner</option>
                        </Form.Select>

                        <Form.Select
                            name="payment_mode"
                            className="ps-label-content me-3"
                            onChange={(e) => handleFilterChange(e)}
                            value={filterConfig.payment_mode}
                        >
                            <option value="" hidden selected>
                                Payment Mode
                            </option>
                            <option value="">All</option>
                            <option value="bank">Bank</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                        </Form.Select>

                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            name="from"
                            className="ps-label-content me-3 form-control"
                            // placeholderText="Select Date"
                            selected={filterConfig.from}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, from: date };
                                });
                            }}
                            placeholderText="Select Date"
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />

                        <span className="me-4 align-middle mt-2 ps-label">
                            To:
                        </span>
                        <DatePicker
                            name="to"
                            className="ps-label-content me-3 form-control"
                            // placeholderText="Select Date"
                            selected={filterConfig.to}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, to: date };
                                });
                            }}
                            placeholderText="Select Date"
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />
                    </div>

                    <div className="below">
                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE ISSUED",
                                "SUPPLIER",
                                "PAYEE",
                                "AMT",
                                "PYMNT MODE",
                                "DOC NO.",
                                "BANK NAME",
                                "DATE ADDED",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "issue_date",
                                "supplier",
                                "payee",
                                "amount",
                                "payment_mode",
                                "doc_no",
                                "bank_name",
                                "date",
                            ]}
                            tableData={filteredData}
                            ActionBtn={(row) => ActionBtn(row, "pending")}
                            ViewBtn={(row) => ViewPayment(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>

            {/* modals */}
            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="payment"
                onDelete={handleDeleteSP}
            />
            <Modal
                show={showAddBranchModal}
                onHide={handleCloseAddBranchModal}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <p className="custom-modal-body-title"> CHOOSE STORE </p>
                </Modal.Header>
                <Modal.Body>
                    <div className="text">
                        <Form.Select
                            name="type"
                            className="date-filter me-3"
                            onChange={(e) => setShopType(e.target.value)}
                        >
                            <option value="" hidden selected>
                                Select Type
                            </option>
                            <option value="mango">Mango Magic</option>
                            <option value="potato">Potato Corner</option>
                        </Form.Select>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
