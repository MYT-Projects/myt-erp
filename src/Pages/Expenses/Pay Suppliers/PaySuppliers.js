import React, { useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import {
    deleteBankSe,
    deleteCashSe,
    deleteCheckSe,
    searchByDate,
} from "../../../Helpers/apiCalls/Expenses/sePaymentsListApi";
import { getAllSePayments } from "../../../Helpers/apiCalls/Expenses/sePaymentsListApi";
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
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    isAdmin,
} from "../../../Helpers/Utils/Common";
import POModal from "../PurchaseOrders/Components/POModal";
import { getAllSuppliersPotato } from "../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getAllVendors } from "../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../Helpers/apiCalls/PotatoCorner/VendorsApi";

import "../PurchaseOrders/PurchaseOrders.css";
import "./PaySuppliers.css";
import DatePicker from "react-datepicker";
import Moment from "moment";

export default function PaySuppliers() {
    let navigate = useNavigate();

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const [paymentDeets, setPaymentDeets] = useState({ id: "", payment: "" });
    const [filterDate, setFilterDate] = useState({
        to: getTodayDate(),
        from: getTodayDate(),
        supplier_id: "",
        payment_mode: "",
    });
    const [filterConfig, setFilterConfig] = useState({})
    const [inactive, setInactive] = useState(true);
    const [pendingSP, setPendingSP] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [approvedSP, setApprovedSP] = useState([]);
    const [showLoader, setShowLoader] = useState(false);

    async function handleDeleteSP() {
        if (paymentDeets.payment === "cash") {
            const cashResponse = await deleteCashSe(paymentDeets.id);
            if (cashResponse.data) {
                toast.success(cashResponse.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
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
        } else if (paymentDeets.payment === "check") {
            const checkResponse = await deleteCheckSe(paymentDeets.id);
            if (checkResponse.data) {
                toast.success(checkResponse.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
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
        } else if (paymentDeets.payment === "bank") {
            const bankResponse = await deleteBankSe(paymentDeets.id);
            if (bankResponse.data) {
                toast.success(bankResponse.data.response, {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
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

    const [supplierValue, setSupplierValue] = useState({
        name: "supplier_id",
        label: "",
        value: "",
    });
    const [bankValue, setBankValue] = useState({
        name: "bank_id",
        label: "",
        value: "",
    });

    function clearTables() {
        setPendingSP([]);
        setFilteredData([]);
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === "supplier_id") {
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

    function handleSelectChange(e) {

        if (e.name === "supplier_id") {
            setSupplierValue({ name: e.name, label: e.label, value: e.value });
            // fetchReceives(e.value);
        } else if (e.name === "bank_id")
            setBankValue({ name: e.name, label: e.label, value: e.value });
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
        const suppliersResponse = await getAllSuppliers();
        const suppliersPotatoResponse = await getAllSuppliersPotato();
        const vendorsResponse = await getAllVendors();
        const vendorsPotatoResponse = await getAllVendorsPotato();

        if (suppliersResponse.error) {

        } else {

            suppliersResponse.data.data.map((supplier) => {
                var info = supplier;
                info.type = "mango|supplier";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (suppliersPotatoResponse.error) {
        } else {

            suppliersPotatoResponse.response.data.map((supplier) => {
                var info = supplier;
                info.type = "potato|supplier";
            });
        }

        if (vendorsResponse.error) {
        } else {

            vendorsResponse.response.data.map((vendor) => {
                var info = vendor;
                info.type = "mango|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }

        if (vendorsPotatoResponse.error) {
        } else {

            vendorsPotatoResponse.response.data.map((vendor) => {
                var info = vendor;
                info.type = "potato|vendor";
                setSuppliers((prev) => [...prev, info]);
            });
        }
    }

    async function fetchAllSePayments() {
        setShowLoader(true);
        setFilteredData([])
        const response = await getAllSePayments(filterConfig);
        if (response.data) {
            if (response.data.status === "success") {
                var allPayments = response.data.data.map((data) => {
                    var payment = data;
                    payment.amount = numberFormat(payment.amount);
                    payment.bank_name =
                        payment.payment_mode === "bank"
                            ? `${payment.bank_from_name || "N/A"} to ${
                                  payment.bank_to_name || "N/A"
                              }`
                            : payment.bank_from_name || "N/A";
                    payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                    payment.doc_no = payment.doc_no || "N/A";
                    payment.issued_date = Moment(payment.issued_date).format("MM-DD-YYYY")
                            || "N/A";
                    payment.payee = payment.payee || "N/A";
                    payment.payment_mode = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                                            : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                                            : payment.payment_mode
                    payment.supplier =
                        payment.supplier || payment.vendor || "N/A";
                    return payment;
                });
                setPendingSP(
                    allPayments.filter((v, i) => {
                        return (
                            allPayments.map((val) => val.id).indexOf(v.id) == i
                        );
                    }).sort((a, b) =>
                        new Date(...a.issued_date?.split('/').reverse()) - new Date(...b.issued_date?.split('/').reverse())
                    ).reverse()
                );
                setFilteredData(
                    allPayments.filter((v, i) => {
                        return (
                            allPayments.map((val) => val.id).indexOf(v.id) == i
                        );
                    }).sort((a, b) =>
                        new Date(...a.issued_date?.split('/').reverse()) - new Date(...b.issued_date?.split('/').reverse())
                    ).reverse()
                );
            }
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

        if (name === "supplier_id" && value === "00") {
            const response = await getAllSePayments();

            if (response.error) {
            } else {
                var allPayments = response.data.data.map((data) => {
                    var payment = data;
                    payment.amount = numberFormat(payment.amount);
                    payment.bank_name =
                        payment.payment_mode === "bank"
                            ? `${payment.bank_from_name || "N/A"} to ${
                                  payment.bank_to_name || "N/A"
                              }`
                            : payment.bank_from_name || "N/A";
                    payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                    payment.doc_no = payment.doc_no || "N/A";
                    payment.issued_date =
                        Moment(payment.issued_date).format("MM-DD-YYYY") || "N/A";
                    payment.payee = payment.payee || "N/A";
                    payment.payment_mode = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                                            : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                                            : payment.payment_mode
                    payment.supplier =
                        payment.supplier || payment.vendor || "N/A";
                    return payment;
                });
                setPendingSP(
                    allPayments.filter((v, i) => {
                        return (
                            allPayments.map((val) => val.id).indexOf(v.id) == i
                        );
                    })
                );
                setFilteredData(
                    allPayments.filter((v, i) => {
                        return (
                            allPayments.map((val) => val.id).indexOf(v.id) == i
                        );
                    })
                );
            }
        } else {
            const response = await searchByDate(filterDate);
            if (response.error) {
            } else {
                var allPayments = response.data.data.map((data) => {
                    var payment = data;
                    payment.amount = numberFormat(payment.amount);
                    payment.bank_name =
                        payment.payment_mode === "bank"
                            ? `${payment.bank_from_name || "N/A"} to ${
                                  payment.bank_to_name || "N/A"
                              }`
                            : payment.bank_from_name || "N/A";
                    payment.date = Moment(payment.date).format("MM-DD-YYYY") || "N/A";
                    payment.doc_no = payment.doc_no || "N/A";
                    payment.issued_date =
                        Moment(payment.issued_date).format("MM-DD-YYYY") || "N/A";
                    payment.payee = payment.payee || "N/A";
                    payment.payment_mode = payment.payment_mode === "check" ? payment.payment_mode + " - " + payment.check_no
                                            : payment.payment_mode === "bank" ? payment.payment_mode + " - " + payment.reference_no
                                            : payment.payment_mode
                    payment.supplier =
                        payment.supplier || payment.vendor || "N/A";
                    return payment;
                });
                setPendingSP(
                    allPayments.filter((v, i) => {
                        return (
                            allPayments.map((val) => val.id).indexOf(v.id) == i
                        );
                    })
                );
                setFilteredData(
                    allPayments.filter((v, i) => {
                        return (
                            allPayments.map((val) => val.id).indexOf(v.id) == i
                        );
                    })
                );
            }
        }
        setShowLoader(false);
    }

    function handleSelectChange(e, row) {
        if (e.target.value === "edit-ps") {
            navigate(
                "/se/paysuppliers/edit/" + row.id + "/" + row.payment_mode
            );
        } else if (e.target.value === "delete-ps") {
            handleShowDeleteModal();
            setPaymentDeets({ id: row.id, payment: row.payment_mode });
        } else if (e.target.value === "view-ps") {
            window.open(
                "/se/paysuppliers/view/" + row.id + "/" + row.payment_mode,"_blank"
            );
        } else if (e.target.value === "approve-ps") {
            navigate("/se/paysuppliers/approve/" + row.id);
        }
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                role={row.payment_mode}
                id={row.id}
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                {type === "pending" && isAdmin ? (
                    <option value="edit-ps" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="view-ps" className="color-options">
                    View
                </option>
                {type === "approved" ? (
                    <option value="reprint-ps" className="color-options">
                        Reprint
                    </option>
                ) : null}
                {isAdmin && (
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
                onClick={() => handleViewPayment(row.id, row.payment_mode)}
            >
                View
            </button>
        );
    }

    function handleViewPayment(id, payment_mode) {
        {window.open('/se/paysuppliers/view/' + id + '/' + payment_mode.split(" ")[0],'_blank')};
    }

    function handleAddChange(e) {
        navigate("/se/paysuppliers/add/" + e.target.value);
    }

    React.useEffect(() => {
        fetchSuppliers();
    }, []);

    React.useEffect(() => {
        fetchAllSePayments();
    }, [filterConfig]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"SUPPLIES"}
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
                        <h5 className="page-subtitle"> Supplies Expenses </h5>
                    </Col>
                    <Col xs={6} className="d-flex ">
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
                            name="supplier_id"
                            className="ps-label-content me-3"
                            onChange={(e) => handleFilterChange(e)}
                            value={filterDate.supplier_id}
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
                            name="payment_mode"
                            className="ps-label-content me-3"
                            onChange={(e) => handleFilterChange(e)}
                            value={filterDate.payment_mode}
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
                            name="start_date"
                            className="ps-label-content me-3 form-control"
                            placeholderText="Select Date"
                            selected={filterConfig.start_date}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, start_date: date };
                                });
                            }}
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />

                        <span className="me-4 align-middle mt-2 ps-label">
                            To:
                        </span>
                        <DatePicker
                            name="end_date"
                            className="ps-label-content me-3 form-control"
                            placeholderText="Select Date"
                            selected={filterConfig.end_date}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, end_date: date };
                                });
                            }}
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />
                    </div>

                    <div className="below">
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
                                "issued_date",
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

            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="payment"
                onDelete={handleDeleteSP}
            />
        </div>
    );
}
