import React, { useEffect, useState, useRef } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import AddModal from "./Components/AddPIModal";
import DeleteModal from "../../../Components/Modals/DeleteModal";

import { getAllSuppliers } from "../../../Helpers/apiCalls/suppliersApi";
import { getAllBanks } from "../../../Helpers/apiCalls/banksAPi";
import {
    deleteSuppliesInvoice,
    filterSEInvoice,
    getAllSuppliesInvoices,
} from "../../../Helpers/apiCalls/Expenses/suppliesInvoiceApi";
import {
    formatDateNoTime,
    getTodayDate,
    isAdmin,
    refreshPage,
    toastStyle,
    TokenExpiry,
    numberFormat
} from "../../../Helpers/Utils/Common";
import "./PurchaseInvoices.css";
import { getAllVendors } from "../../../Helpers/apiCalls/Manage/Vendors";
import Moment from "moment";

export default function PurchaseInvoices() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const [inactive, setInactive] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [banks, setBanks] = useState([]);
    const [sePiManager, setSePiManager] = useState([]);
    const [openListPI, setOpenListPI] = useState([]);
    const [closeListPI, setCloseListPI] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const today = Moment().format("MM/DD/YYYY");

    const [filterConfig, setFilterConfig] = useState({
        status: "open",
        supplier: "",
        bank: "",
        invoice_no: "",
        date_from: "",
        date_to: "",
    });

    const [grandTotal, setGrandTotal] = useState(0);
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, 
                status: tabKey,
                supplier_id: "",
                vendor_id: "",
                date_from: "",
                date_to: "",
             };
        });
    };

    const isInitialMount = useRef(true);
    const filterConfigKey = 'supplies-suppliesExpenses-filterConfig';
    useEffect(()=>{
        if(isInitialMount.current){
            isInitialMount.current = false;
            setFilterConfig((prev) => {
                // console.log("override");
                if (window.localStorage.getItem(filterConfigKey) != null){
                    // console.log("found");
                    // handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).status);
                    return JSON.parse(window.localStorage.getItem(filterConfigKey))
                } else {
                    return {...prev}
                }
            });
        } else {
            window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
        }
    }, [filterConfig])


    useEffect(() => {
        fetchPI();
    }, [filterConfig]);

    async function fetchPI() {
        setShowLoader(true);
        setSePiManager([]);
        setGrandTotal("0")
        setTotalPaidAmount("0")
        setTotalBalance("0")

        const response = await filterSEInvoice(filterConfig);

        if (response.error) {
            TokenExpiry(response.error);
        } else {
            var closedBills = [];
            var openBills = [];
            var allBills = response.data.response.map((invoice) => {
                var info = invoice;
                info.supplier_vendor = info.supplier_id
                    ? info.supplier_name || info.supplier_trade_name
                    : info.vendor_id
                    ? info.vendor_name || info.vendor_trade_name
                    : "N/A";
                info.po_no = invoice.se_id;
                info.supplies_receive_date = invoice.supplies_receive_date
                    ? Moment(invoice.supplies_receive_date).format("MM-DD-YYYY")
                    : "(Invalid)";
                info.total = numberFormat(invoice.grand_total);
                info.amount_paid = numberFormat(invoice.paid_amount);
                info.balance = numberFormat(info.balance);    

                info.pay_ref_no = !invoice.payments? "" : invoice.payments[0]?.payment_mode === "check" ? invoice.payments[0]?.payment_mode + " - " + invoice.payments[0]?.check_no
                                                            : invoice.payments[0]?.payment_mode === "bank" ? invoice.payments[0]?.payment_mode + (invoice.reference_no ? " - " + invoice.reference_no : " ")
                                                            : invoice.payments[0]?.payment_mode
                return info;
            });

            var grandtotal = response.data.summary? response.data.summary.total : "0";
            var totalpaid = response.data.summary? response.data.summary.total_paid : "0";
            var totalbalance = response.data.summary? response.data.summary.total_balance : "0";
            setGrandTotal(grandtotal);
            setTotalPaidAmount(totalpaid);
            setTotalBalance(totalbalance);

            setSePiManager(allBills.sort((a, b) =>
                new Date(...a.supplies_receive_date?.split('/').reverse()) - new Date(...b.supplies_receive_date?.split('/').reverse())
            ).reverse())
        }
        setShowLoader(false);
    }



    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [PIID, setPIID] = useState("");

    async function handleDeletePI() {
        const response = await deleteSuppliesInvoice(PIID);

        if (response.data) {
            toast.success("Supplies Invoice Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Supplies Invoice", {
                style: toastStyle(),
            });
        }
    }

    const [showAddModal, setShowAddModal] = useState(false);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    function handleSelectChange(e, id) {
        if (e.target.value === "edit-pi") {
            navigate("edit/" + id);
        } else if (e.target.value === "print-pi") {
            window.open(
                "purchaseinvoices/print/" +
                    id,
                "_blank"
            );
        } else if (e.target.value === "pay-pi") {
            navigate("pay-check");
        } else if (e.target.value === "delete-pi") {
            setPIID(id);
            handleShowDeleteModal();
        }
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row.id)}
            >
                <option value="" hidden selected>
                    Select
                </option>
                {isAdmin ? (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="print-pi" className="color-options">
                    View
                </option>
                {isAdmin && (
                    <option value="delete-pi" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    function ViewPIBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.id)}
                value="print-pi"
            >
                View
            </button>
        );
    }

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
        const toFilter = {target: {name: "supplier", value: e.value}};
        handleFilterChange(toFilter);
    }


    async function fetchSuppliers() {
        setShowLoader(true);

        const response = await getAllSuppliers();
        const response2 = await getAllVendors();
        var allData = [];

        if (response.error) {
            TokenExpiry(response.error);
        } else {
            response.data.data.map((supplier) => {
                var info = supplier;
                info.type = "supplier";
                allData.push(info);
            });
        }

        if (response2.error) {
            TokenExpiry(response2.error);
        } else {
            response2.response.data.map((vendor) => {
                var info = vendor;
                info.type = "vendor";
                allData.push(info);
            });
        }

        setSuppliers(allData);
        setShowLoader(false);
    }
    async function fetchBanks() {
        setShowLoader(true);

        const response = await getAllBanks();

        if (response.error) {
            TokenExpiry(response.error);
        } else {
            setBanks(response.data.data);
        }
        setShowLoader(false);
    }

    React.useEffect(() => {
        fetchPI();
        fetchSuppliers();
        fetchBanks();
    }, []);

    React.useEffect(() => {
        return () => {}; 
    }, []);

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
                <Row className="mb-2 align-items-start">
                    <Col xs={6}>
                        <h1 className="page-title"> SUPPLIES INVOICE </h1>
                        <h5 className="page-subtitle"> Supplies Expenses</h5>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="invoice_no"
                            placeholder="Search Invoice No.."
                            value={filterConfig.invoice_no}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <button
                            className="add-btn"
                            onClick={handleShowAddModal}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                <Tabs 
                    activeKey={filterConfig.status}
                    defaultActiveKey={filterConfig.status}
                    id="PO-tabs"
                    onSelect={handleTabSelect}>
                    <Tab
                        eventKey="open"
                        title="Open Bills"
                        className="sePI-tab-wrapper"
                    >
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
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
                                                value={`${supplier.id}|${supplier.type}`}
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

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                selected={filterConfig.date_from}
                                placeholderText={"Select Date"}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                selected={filterConfig.date_to}
                                placeholderText={"Select Date"}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        <div className=" PO-filters d-flex justify-content-center">
                            <span className="me-4 ml-4 mt-2 ps-label">
                                Grand Total: {numberFormat(grandTotal)}
                            </span>

                            <span className="me-4 ml-4 mt-2 ps-label">
                                Total Paid Amount: {numberFormat(totalPaidAmount)}
                            </span>

                            <span className="me-4 ml-4 mt-2 ps-label">
                                Total Balance: {numberFormat(totalBalance)}
                            </span>
                        </div>

                        <div className="sePI-tbl ">
                            {
                                <Table
                                    tableHeaders={[
                                        "-",
                                        "DATE",
                                        "SUPPLIER",
                                        "INV NO.",
                                        "DR NO.",
                                        "TOTAL",
                                        "AMT PAID",
                                        "BAL",
                                        "PYMT STATS",
                                        "PYMT REF NO",
                                        "SE NO.",
                                        "BRANCH",
                                        "PREP BY",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        "supplies_receive_date",
                                        "supplier_vendor",
                                        "invoice_no",
                                        "dr_no",
                                        "total",
                                        "amount_paid",
                                        "balance",
                                        "payment_status",
                                        "pay_ref_no",
                                        "po_no",
                                        "branch_name",
                                        "prepared_by",
                                    ]}
                                    tableData={sePiManager}
                                    ActionBtn={(row) => ActionBtn(row, "open")}
                                    ViewBtn={(row) => ViewPIBtn(row)}
                                    showLoader={showLoader}
                                />
                            }
                        </div>
                        <div className="mb-2" />
                    </Tab>

                    <Tab
                        eventKey="close"
                        title="Closed Bills"
                        className="sePI-tab-wrapper"
                    >
                        {/* filters */}

                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Supplier"
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
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
                                                value={`${supplier.id}|${supplier.type}`}
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

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                selected={filterConfig.date_from}
                                placeholderText={"Select Date"}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                selected={filterConfig.date_to}
                                placeholderText={"Select Date"}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                                showYearDropdown
                                dateFormatCalendar="MMMM"
                                yearDropdownItemNumber={20}
                                scrollableYearDropdown
                            />
                        </div>

                        <div className=" PO-filters d-flex justify-content-center">
                            <span className="me-4 ml-4 mt-2 ps-label">
                                Grand Total: {numberFormat(grandTotal)}
                            </span>

                            <span className="me-4 ml-4 mt-2 ps-label">
                                Total Paid Amount: {numberFormat(totalPaidAmount)}
                            </span>

                            <span className="me-4 ml-4 mt-2 ps-label">
                                Total Balance: {numberFormat(totalBalance)}
                            </span>
                        </div>
                        
                        <div className="">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "DATE",
                                    "SUPPLIER",
                                    "INV NO.",
                                    "DR NO.",
                                    "TOTAL",
                                    "AMT PAID",
                                    "BAL",
                                    "PYMT STATS",
                                    "PYMT REF NO",
                                    "SE NO.",
                                    "BRANCH",
                                    "PREP BY",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "supplies_receive_date",
                                    "supplier_vendor",
                                    "invoice_no",
                                    "dr_no",
                                    "total",
                                    "amount_paid",
                                    "balance",
                                    "payment_status",
                                    "pay_ref_no",
                                    "po_no",
                                    "branch_name",
                                    "prepared_by",
                                ]}
                                tableData={sePiManager}
                                ActionBtn={(row) => ActionBtn(row, "closed")}
                                ViewBtn={(row) => ViewPIBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="purchase invoice"
                onDelete={() => handleDeletePI()}
            />
            <AddModal show={showAddModal} hide={handleCloseAddModal} />
        </div>
    );
}
