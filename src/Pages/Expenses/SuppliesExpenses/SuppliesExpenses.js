import React, { useState, useEffect, useRef } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    formatDate,
    isAdmin,
    refreshPage,
    toastStyle,
    TokenExpiry,
    numberFormat,
    numberFormatInt,
} from "../../../Helpers/Utils/Common";
import Moment from "moment";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";

import toast from "react-hot-toast";
import DeleteModal from "../../../Components/Modals/DeleteModal";
import {
    approveSuppliesExpense,
    changeStatus,
} from "../../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import { getType } from "../../../Helpers/Utils/Common";
import "../PurchaseOrders/PurchaseOrders.css";
import SEModal from "./Components/SEModal";
import { searchSE } from "../../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import { getAllSuppliers } from "../../../Helpers/apiCalls/suppliersApi";
import {getAllSuppliersPotato} from "../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { getAllVendors } from "../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../Helpers/apiCalls/PotatoCorner/VendorsApi";
import POModal from "../PurchaseOrders/Components/POModal";
import PoPaymentModal from "./Components/PoPaymentModal";
import Select from "react-select";
import DatePicker from "react-datepicker";

export default function SuppliesExpenses() {
    let navigate = useNavigate();
    const [showLoader, setShowLoader] = useState(false);
    const [supExpenseID, setSupExpenseID] = useState("");
    const [userType, setUserType] = useState(getType());

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    async function handleDeleteSuppliesExpense() {
        const response1 = await approveSuppliesExpense(
            supExpenseID.id,
            "deleted"
        );

        if (response1.data.response) {

            toast.success("Supplies Expense Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Supplies Expense", {
                style: toastStyle(),
            });
        }
    }
    /* return modal handler */
    const [showReturnModal, setShowReturnModal] = useState(false);
    const handleShowReturnModal = () => setShowReturnModal(true);
    const handleCloseReturnModal = () => setShowReturnModal(false);

    /* close modal handler */
    const [showClosePOModal, setShowClosePOModal] = useState(false);
    const handleShowClosePOModal = () => setShowClosePOModal(true);
    const handleCloseClosePOModal = () => setShowClosePOModal(false);

    const [inactive, setInactive] = useState(true);
    const [suppliesExpenseManager, setSuppliesExpenseManager] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [bal, setBal] = useState("");
    /* add payment modal handler */
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const handleShowAddPaymentModal = () => setShowAddPaymentModal(true);
    const handleCloseAddPaymentModal = () => setShowAddPaymentModal(false);

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
        // const suppliersPotatoResponse = await getAllSuppliersPotato();
        const vendorsResponse = await getAllVendors();
        // const vendorsPotatoResponse = await getAllVendorsPotato();

        if (suppliersResponse.error) {
            TokenExpiry(suppliersResponse);
        } else {

            suppliersResponse.data.data.map((supplier) => {
                var info = supplier;
                info.type = "mango|supplier"
                setSuppliers((prev) => [...prev, info]);
            });
        }

        // if (suppliersPotatoResponse.error) {
        //     TokenExpiry(suppliersPotatoResponse);
        // } else {

        //     suppliersPotatoResponse.response.data.map((supplier) => {
        //         var info = supplier;
        //         info.type = "potato|supplier"
        //         setSuppliers((prev) => [...prev, info]);
        //     });
        // }

        if (vendorsResponse.error) {
            TokenExpiry(vendorsResponse);
        } else {

            vendorsResponse.response.data.map((vendor) => {
                var info = vendor;
                info.type = "mango|vendor"
                setSuppliers((prev) => [...prev, info]);
            });
        }

        // if (vendorsPotatoResponse.error) {
        //     TokenExpiry(vendorsPotatoResponse);
        // } else {

        //     vendorsPotatoResponse.response.data.map((vendor) => {
        //         var info = vendor;
        //         info.type = "potato|vendor"
        //         setSuppliers((prev) => [...prev, info]);
        //     });
        // }
    }

    async function handleReceiveSE(id) {
        navigate("/se/purchaseinvoices/add/" + id);
    }

    async function handleReturnSE() {
        const response = await approveSuppliesExpense(
            supExpenseID.id,
            "pending"
        );
        if (response.data.response) {
            toast.success("Supplies Expense Returned to Pending", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Returning Supplies Expense to Pending", {
                style: toastStyle(),
            });
        }
    }
    const [selectedSEId, setSelectedSEId] = useState("");
    async function handleSelectChange(e, suppID, type, row) {
        const { id, value } = e.target;
        setSupExpenseID({ id: id, supplier: suppID, name: row.supplier_trade_name ? row.supplier_trade_name : row.vendor_trade_name});

        var _baseURL = "suppliesexpenses/";

        if (value === "edit-supExpense") {
            window.open(_baseURL + "edit/" + type + "/" + id, "_blank");
        } else if (value === "delete-supExpense") {
            handleShowDeleteModal();
        } else if (value === "return-supExpense") {
            handleShowReturnModal();
        } else if (value === "print-supExpense") {
            navigate("print/" + id, {
                state: { type: type, suppID: suppID },
            });
        } else if (value === "review-supExpense") {
            window.open(_baseURL + "review/" + id, "_blank");
        } else if (value === "email-supExpense") {
            navigate("print/" + id, {
                state: { type: type, suppID: suppID },
            });
        } else if (value === "view-supExpense") {
            window.open(_baseURL + "review/" + id, "_blank");
        } else if (value === "receive-supExpense") {
            handleReceiveSE(id);
        } else if (value === "close-supExpense") {
            setSelectedSEId(id);
            handleShowClosePOModal();
        } else if (value === "payment-po") {
            setBal(numberFormatInt(row.grand_total));
            handleShowAddPaymentModal();
        }
    }

    async function handleClosePO() {
        var data = {
            se_id: selectedSEId,
            new_status: "complete",
        };
        const response = await changeStatus(data);
        if (response.data) {
            toast.success(response.data.response, {
                style: toastStyle(),
            });
            handleCloseClosePOModal();
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    tab: "complete",
                    order_status: "complete",
                };
            });
        } else {
            TokenExpiry(response);
            toast.error("Error closing supplies purchase order", {
                style: toastStyle(),
            });
        }
    }

    const [filterConfig, setFilterConfig] = useState({
        tab: "pending",
        branch_id: "",
        status: "pending",
        order_status: "",
    });

    async function searchSuppliesExpense(filterConfig) {
        setSuppliesExpenseManager([])
        setShowLoader(true);
        const response = await searchSE(filterConfig);
        if (response.data) {
            var SE = response.data.data.map((se) => {
                var info = se;
                info.supplies_expense_date = Moment(
                    se.supplies_expense_date
                ).format("MM-DD-YYYY");
                info.supplier_trade_name = se.supplier_id
                    ? se.supplier_trade_name
                    : se.vendor_id
                    ? se.vendor_trade_name
                    : "N/A";
                info.grand_total = numberFormat(info.grand_total);    
                info.invoice = se.invoice_no?.map((invoice) => {
                    return invoice.invoice_no ? invoice.invoice_no : ""
                })
                info.invoice_id = se.invoice_no?.map((invoice) => {
                    return invoice.id ? invoice.id : ""
                })
                info.pay_ref_no = !se.payments? "" : se.payments[0]?.payment_mode === "check" ? se.payments[0]?.payment_mode + " - " + se.payments[0]?.check_no
                                                    : se.payments[0]?.payment_mode === "bank" ? se.payments[0]?.payment_mode + " - " + se.payments[0]?.reference_no
                                                    : se.payments[0]?.payment_mode
                info.pay_id_no = !se.payments? "" :  se.payments[0]?.se_id? se.payments[0].se_id : "";
                return info;
            });
            setSuppliesExpenseManager(SE.sort((a, b) =>
                new Date(...a.supplies_expense_date?.split('/').reverse()) - new Date(...b.supplies_expense_date?.split('/').reverse())
            ).reverse());
        } else {
            setSuppliesExpenseManager([]);
        }
        setShowLoader(false);
    }
    // console.log(suppliesExpenseManager)

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
                    from: "",
                    to: "",
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
                    from: "",
                    to: "",
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

    const isInitialMount = useRef(true);

    React.useEffect(() => {
        searchSuppliesExpense(filterConfig);
    }, [filterConfig]);

    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig(() => {
    //             // console.log("override");
    //             if (window.localStorage.getItem('expenses-suppliesExpenses-filterConfig') != null){
    //                 // console.log("found");
    //                 return JSON.parse(window.localStorage.getItem('expenses-suppliesExpenses-filterConfig'))
    //             } else {
    //                 console.log("defaulted");
    //                 var defaultConfig = {
    //                     tab: "pending",
    //                     branch_id: "",
    //                     status: "pending",
    //                     order_status: "",
    //                 }
    //                 return defaultConfig
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem("expenses-suppliesExpenses-filterConfig", JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])


    function ContractBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleViewContract(row.pay_id_no)} 
            >
                {row.pay_ref_no}
            </span>
        );
    }
    function handleViewContract(id, type) {
        {
            window.open("/se/purchaseinvoices/print/" + id);
        }
    }

    function ViewBtn(row) {
        return (
            <>
                {filterConfig.tab === "complete" && (
                    <button
                        name="action"
                        className="btn btn-sm view-btn-table me-1"
                        id={row.id}
                        onClick={(e) =>
                            handleSelectChange(e, row.supplier_id, "sent", row)
                        }
                        value="view-supExpense"
                    >
                        View
                    </button>
                )}

                {filterConfig.tab === "incomplete" && (
                    <>
                        <button
                            name="action"
                            className="btn btn-sm view-btn-table me-1"
                            id={row.id}
                            onClick={(e) =>
                                handleSelectChange(e, row.supplier_id, "sent", row)
                            }
                            value="view-supExpense"
                        >
                            View
                        </button>
                        <button
                            name="action"
                            className="btn btn-sm view-btn-table me-1"
                            id={row.id}
                            onClick={(e) =>
                                handleSelectChange(e, row.supplier_id, "sent", row)
                            }
                            value="close-supExpense"
                        >
                            Close
                        </button>
                        <button
                            name="action"
                            className="btn btn-sm view-btn-table"
                            id={row.id}
                            onClick={(e) =>
                                handleSelectChange(e, row.supplier_id, "sent", row)
                            }
                            value="receive-supExpense"
                        >
                            Receive
                        </button>
                    </>
                )}
            </>
        );
    }

    function InvoiceBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleViewInvoice(row.invoice_id)}
            >
                {row.invoice}
            </span>
        );
    }
    function handleViewInvoice(id) {
        {
            window.open("/se/purchaseinvoices/print/" + id);
        }
    }

    function EditBtn(row, type) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.supplier_id, type, row)}
                value="edit-supExpense"
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
                value="review-supExpense"
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
                value="receive-supExpense"
            >
                Receive SE
            </button>
        );
    }

    function ReturnBtn(row, type) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) => handleSelectChange(e, row.supplier_id, type, row)}
                value="return-supExpense"
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
                        <option
                            value="view-supExpense"
                            className="color-options"
                        >
                            View
                        </option>
                    </>
                ) : (
                    <>
                        {type.startsWith("approved") ? (
                            <>
                                <option
                                    value="print-supExpense"
                                    className="color-options"
                                >
                                    {type.includes("printed")
                                        ? "Reprint"
                                        : "Print"}
                                </option>
                                <option
                                    value="email-supExpense"
                                    className="color-options"
                                >
                                    Email to Supplier
                                </option>
                            </>
                        ) : (
                            <>
                                {type === "sent" ? (
                                    <>
                                        <option
                                            value="print-supExpense"
                                            className="color-options"
                                        >
                                            Print
                                        </option>
                                        <option
                                            value="receive-supExpense"
                                            className="color-options"
                                        >
                                            Receive SE
                                        </option>
                                        <option
                                            value="email-supExpense"
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
                                                    value="return-supExpense"
                                                    className="color-yellow"
                                                >
                                                    Return to Pending
                                                </option>
                                            </>
                                        ) : (
                                            <>
                                                {type === "for_approval" ? (
                                                    <>
                                                        <option
                                                            value="review-supExpense"
                                                            className="color-options"
                                                        >
                                                            Review for Approval
                                                        </option>
                                                    </>
                                                ) : (
                                                    <>
                                                        {isAdmin && (
                                                            <option
                                                                value="edit-supExpense"
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
                        {userType === "admin" && (
                            <option
                                value="delete-supExpense"
                                className="color-red"
                            >
                                Delete
                            </option>
                        )}
                    </>
                )}
            </Form.Select>
        );
    }

    function AddPaymentBtn(row, type) {
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

    React.useEffect(() => {
        fetchSuppliers();
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
                {/* headers */}
                <Row className="mb-5">
                    <Col xs={6}>
                        <h1 className="page-title">
                            {" "}
                            SUPPLIES PURCHASE ORDERS{" "}
                        </h1>
                        <h5 className="page-subtitle"> Supplies Expenses</h5>
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
                        <button
                            className="add-btn"
                            onClick={() => navigate("/suppliesexpenses/add")}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                {/* tabs */}
                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="SE-tabs"
                    onSelect={handleTabSelect}
                    className="TabStyle1"
                >
                    <Tab eventKey="pending" title="pending" className="TabStyle2">
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
                                    backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    textAlign: "left",
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
                                    option:(baseStyles, state) => ({
                                        ...baseStyles,
                                        textAlign: "left"
                                        
                                    }),
                                    
                                }}
                                value={selectedSupplier}
                                options={supplierList}
                                onChange={handleSupplierChange}
                            />

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="from"
                                placeholderText={"selct date"}
                                selected={filterConfig.from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, from: date };
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
                                name="to"
                                placeholderText={"selct date"}
                                selected={filterConfig.to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, to: date };
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
                                "SE NO.",
                                "DATE",
                                "SUPPLIER",
                                "BRANCH",
                                "TOTAL",
                                "PREPARED BY",
                                "APPROVED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "supplies_expense_date",
                                "supplier_trade_name",
                                "branch_name",
                                "grand_total",
                                "prepared_by_name",
                                "approved_by_name",
                            ]}
                            tableData={suppliesExpenseManager}
                            PendingBtn={(row) => EditBtn(row, "pending")}
                            ActionBtn={(row) => ActionBtn(row, "pending")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="for_approval" title="for approval" className="TabStyle2">
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
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                  textAlign: "left",
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
                                  option:(baseStyles, state) => ({
                                    ...baseStyles,
                                    textAlign: "left"
                                    
                                  }),
                                  
                              }}
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="from"
                                placeholderText={"selct date"}
                                selected={filterConfig.from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, from: date };
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
                                name="to"
                                placeholderText={"selct date"}
                                selected={filterConfig.to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, to: date };
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
                                "SE NO.",
                                "DATE",
                                "SUPPLIER",
                                "TOTAL",
                                "PREPARED BY",
                                "APPROVED BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "supplies_expense_date",
                                "supplier_trade_name",
                                "grand_total",
                                "prepared_by_name",
                                "approved_by_name",
                            ]}
                            tableData={suppliesExpenseManager}
                            PendingBtn={(row) => ReviewBtn(row, "for approval")}
                            ActionBtn={(row) => ActionBtn(row, "for_approval")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="approved" title="approved" className="TabStyle2">
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
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                  textAlign: "left",
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
                                  option:(baseStyles, state) => ({
                                    ...baseStyles,
                                    textAlign: "left"
                                    
                                  }),
                                  
                              }}
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="from"
                                placeholderText={"selct date"}
                                selected={filterConfig.from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, from: date };
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
                                name="to"
                                placeholderText={"selct date"}
                                selected={filterConfig.to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, to: date };
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
                                "SE NO.",
                                "DATE",
                                "SUPPLIER",
                                "TYPE",
                                "TOTAL",
                                "PREP BY",
                                "APV BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "id",
                                "supplies_expense_date",
                                "supplier_trade_name",
                                "type",
                                "grand_total",
                                "prepared_by_name",
                                "approved_by_name",
                            ]}
                            tableData={suppliesExpenseManager}
                            ActionBtn={(row) => ActionBtn(row, "approved")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="sent" title="sent" className="TabStyle2">
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
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                  textAlign: "left",
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
                                  option:(baseStyles, state) => ({
                                    ...baseStyles,
                                    textAlign: "left"
                                    
                                  }),
                                  
                              }}
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="from"
                                placeholderText={"selct date"}
                                selected={filterConfig.from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, from: date };
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
                                name="to"
                                placeholderText={"selct date"}
                                selected={filterConfig.to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, to: date };
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
                                "SE NO.",
                                "DATE",
                                "SUPPLIER",
                                "TYPE",
                                "TOTAL",
                                "PREP BY",
                                "APV BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "+",
                                "",
                                "id",
                                "supplies_expense_date",
                                "supplier_trade_name",
                                "type",
                                "grand_total",
                                "prepared_by_name",
                                "approved_by_name",
                            ]}
                            tableData={suppliesExpenseManager}
                            PendingBtn={(row) => ReceivePOBtn(row, "sent")}
                            ActionBtn={(row) => ActionBtn(row, "sent")}
                            PaymentBtn={(row) => AddPaymentBtn(row, "sent")}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="incomplete" title="incomplete" className="TabStyle2">
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
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                  textAlign: "left",
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
                                  option:(baseStyles, state) => ({
                                    ...baseStyles,
                                    textAlign: "left"
                                    
                                  }),
                                  
                              }}
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="from"
                                placeholderText={"selct date"}
                                selected={filterConfig.from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, from: date };
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
                                name="to"
                                placeholderText={"selct date"}
                                selected={filterConfig.to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, to: date };
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
                                "SE NO.",
                                "DATE",
                                "SUPPLIER",
                                "TYPE",
                                "TOTAL",
                                "PREP BY",
                                "APV BY",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "supplies_expense_date",
                                "supplier_trade_name",
                                "type",
                                "grand_total",
                                "prepared_by_name",
                                "approved_by_name",
                            ]}
                            tableData={suppliesExpenseManager}
                            PendingBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="complete" title="completed" className="TabStyle2">
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
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                  textAlign: "left",
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
                                  option:(baseStyles, state) => ({
                                    ...baseStyles,
                                    textAlign: "left"
                                    
                                  }),
                                  
                              }}
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="from"
                                placeholderText={"selct date"}
                                selected={filterConfig.from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, from: date };
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
                                name="to"
                                placeholderText={"selct date"}
                                selected={filterConfig.to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, to: date };
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
                                "SE NO.",
                                "INV NO.",
                                "DATE",
                                "SUPPLIER",
                                "TYPE",
                                "TOTAL",
                                "PYMT REF NO",
                                "PREP BY",
                                "APV BY",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "invoice",
                                "supplies_expense_date",
                                "supplier_trade_name",
                                "type",
                                "grand_total",
                                "prepared_by_name",
                                "approved_by_name",
                            ]}
                            tableData={suppliesExpenseManager}
                            PendingBtn={(row) => ViewBtn(row)}
                            InvoiceBtn={(row) => InvoiceBtn(row)}
                            newTabBtn={(row) => ContractBtn(row, row.status)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="disapproved" title="disapproved" className="TabStyle2">
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
                                  backgroundColor: state.isSelected ? 'white' : '#5ac8e1',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                  textAlign: "left",
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
                                  option:(baseStyles, state) => ({
                                    ...baseStyles,
                                    textAlign: "left"
                                    
                                  }),
                                  
                              }}
                            value={selectedSupplier}
                            options={supplierList}
                            onChange={handleSupplierChange}
                        />
                            

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                name="from"
                                placeholderText={"selct date"}
                                selected={filterConfig.from}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, from: date };
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
                                name="to"
                                placeholderText={"selct date"}
                                selected={filterConfig.to}
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, to: date };
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
                                "SE NO.",
                                "DATE",
                                "SUPPLIER",
                                "TYPE",
                                "TOTAL",
                                "PREP BY",
                                "APV BY",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "",
                                "id",
                                "supplies_expense_date",
                                "supplier_trade_name",
                                "type",
                                "grand_total",
                                "prepared_by_name",
                                "approved_by_name",
                            ]}
                            tableData={suppliesExpenseManager}
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
                onHide={handleCloseDeleteModal}
                text="supplies expense"
                onDelete={handleDeleteSuppliesExpense}
            />
            <SEModal
                show={showReturnModal}
                hide={handleCloseReturnModal}
                type="return"
                handler={handleReturnSE}
            />
            <POModal
                show={showClosePOModal}
                hide={handleCloseClosePOModal}
                type="close"
                handler={handleClosePO}
            />
            <PoPaymentModal
                id={supExpenseID.id}
                show={showAddPaymentModal}
                onHide={handleCloseAddPaymentModal}
                balance={bal}
                payee={supExpenseID.name}
            />
        </div>
    );
}
