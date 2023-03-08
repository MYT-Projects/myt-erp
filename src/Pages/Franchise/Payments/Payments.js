import React, { useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import AdjustmentTable from "./../../Inventory/Adjustment/AdjustmentTable";
import {
    dateFormat,
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    getType,
    TokenExpiry
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";
import "./../Franchise.css";
import { deleteInvoicePayment } from "../../../Helpers/apiCalls/Sales/franchiseInvoice";
import { deleteFranchiseePayment } from "../../../Helpers/apiCalls/Franchise/FranchiseApi";
import { deleteFranchiseSaleBillingPayment } from "../../../Helpers/apiCalls/Franchise/FranchiseSaleBillingApi";
import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import {
    getAllReceivables,
    getReceivable,
    searchReceivables,
    searchFranchisee,
    getAllReceivablesDate,
    getAllPayments,
    searchPaymentsDate,
    markAsDone
} from "../../../Helpers/apiCalls/Franchise/ReceivablesApi";
import ViewModal from "../../../Components/Modals/ViewModal";
import MarkAsDoneModal from "./MarkAsDoneModal";
import { getAllBanks } from "../../../Helpers/apiCalls/banksAPi";

export default function Payments() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const [paymentDeets, setPaymentDeets] = useState({ id: "", payment: "" });
    const [filterDate, setFilterDate] = useState({
        to: "",
        from: "",
    });
    const today = Moment().format("MM/DD/YYYY")

    // VIEW SALES MODAL
    const [showViewSaleModal, setShowViewSaleModal] = useState(false);
    const handleShowViewSaleModal = (id) => {
        fetchPayment(id);
        setShowViewSaleModal(true);
    };
    const handleCloseViewSaleModal = () => setShowViewSaleModal(false);

    // VIEW SALES BILLING MODAL
    const [showViewSaleBillingModal, setShowViewSaleBillingModal] =
        useState(false);
    const handleShowViewSaleBillingModal = (id) => {
        fetchPayment(id);
        setShowViewSaleBillingModal(true);
    };
    const handleCloseViewSaleBillingModal = () =>
        setShowViewSaleBillingModal(false);

    const dummy = [
        {
            id: "1",
            franchise: "FRANCHISE",
            franchise_name: "FRANCHISE NAME",
            contract: "10000",
            sales: "50000",
            sale_billing: "10000",
            total: "160000",
        },
        {
            id: "2",
            franchise: "FRANCHISE 2",
            franchise_name: "FRANCHISE NAME 2",
            contract: "1000",
            sales: "5000",
            sale_billing: "1000",
            total: "7000",
        },
    ];

     /* Approve Modal */
     const [showApproveModal, setShowApproveModal] = useState(false);
     const handleShowApproveModal = () => (
        checkedPayments.length != 0
            ? setShowApproveModal(true)
            : toast.error("Please select payment to mark as done", {
                  style: toastStyle(),
              })
        );
     const handleCloseApproveModal = () => setShowApproveModal(false);

    const [franchisees, setFranchisees] = useState([]);
    const [franchiseesData, setFranchiseesData] = useState([]);
    const [receivableData, setReceivableData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [salesBillingData, setSalesBillingData] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        branch_id: "",
        franchisee_name: "",
        date_from: "",
        date_to: "",
        type: "",
        is_done: "",
    })
    const [totalContract, setTotalContract] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalBilling, setTotalBilling] = useState(0);
    const [selectedRow, setSelectedRow] = useState([]);
    const [checkedPayments, setCheckedPayments] = useState([]);
    const [selectedTab, setSelectedTab] = useState(false);
    const [banks, setBanks] = useState([]);

    async function fetchFranchisee() {
        setShowLoader(true);

        const response = await getAllFranchisee();
        if (response.error) {
        } else {
            setFranchisees(response.data.data);
            var allFranchisee = response.data.data.map((data) => {
                var franchise = data;
                franchise.franchise_name = data.name;
                franchise.franchise = data.name;
                franchise.contract = "0";
                franchise.sale = "0";
                franchise.sale_billing = "0";
                franchise.total = "0";
                return franchise;
            });
            setFranchiseesData(allFranchisee);
        }
        setShowLoader(false);
    }

    const [inactive, setInactive] = useState(true);
    const [dateto, setDateto] = useState("");
    const [datefrom, setDatefrom] = useState("");

    const [showLoader, setShowLoader] = useState(false);

    async function fetchAllPayments() {
        setShowLoader(true);
        setReceivableData([]);
        const response = await getAllPayments(filterConfig);
        if (response.data) {
            var receivables = response.data.payments?.map((data) => {
                var receive = data;
                receive.added_on = Moment(data.added_on).format("MM-DD-YYYY");
                receive.payment_date = data.payment_date ? Moment(data.payment_date).format("MM-DD-YYYY") : "N/A";
                receive.deposit_date = data.deposit_date ? Moment(data.deposit_date).format("MM-DD-YYYY") : "N/A";
                receive.amount = numberFormat(data.amount);
                receive.paid_amount = numberFormat(data.paid_amount);
                receive.check_no = data.check_no? data.check_no : data.ref_no? data.ref_no : "N/A";
                receive.check_date = data.payment_mode === "cash" ? "N/A" : 
                    (data.check_date !== null && data.check_date !== "0000-00-00") ? Moment(data.check_date).format("MM-DD-YYYY") : "N/A";
                receive.type = data.type === "franchisee_payment" ? "franchisee" : data.type === "franchisee_sale_payment" ? "franchisee_sale" : "franchisee_sale_billing";
                receive.is_done = data.is_done === "1" ? "1" : "0"
                return receive;
            });
            
            var contract = response.data.summary? response.data.summary.franchisee_payment_total : "0";
            var sales = response.data.summary? response.data.summary.franchisee_sale_payment_total : "0";
            var billing = response.data.summary? response.data.summary.fs_billing_payment_total : "0";
            setTotalContract(contract);
            setTotalSales(sales);
            setTotalBilling(billing);

            setReceivableData(receivables.sort((a, b) =>
                new Date(...a.payment_date?.split('/').reverse()) - new Date(...b.payment_date?.split('/').reverse())
            ).reverse());
        }
        setShowLoader(false);
    }

    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.data) {
            if (response.data.status === "success") {
                var data = response.data.data;
                var allBanks = data.map((bank) => {
                    var info = {};
                    info.name = "bank_id";
                    info.label = bank.bank_name;
                    info.value = bank.id;
                    return info;
                });
                setBanks([{name: "bank_id", label: "All Banks", value: ""}, ...allBanks]);
            }
        }
    }

    function handleDeleteItem() {
        voidPayment(selectedRow);
    }

    async function voidPayment(selectedRow) {
        if (selectedRow.type === "franchisee") {
            const response = await deleteFranchiseePayment(selectedRow.id);


            if (response.data) {
                toast.success("Franchisee Deleted Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                toast.error("Error Deleting Franchisee", {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.type === "franchisee_sale") {
            const response = await deleteInvoicePayment(selectedRow.id);


            if (response.data.status === "success") {
                toast.success("Sales Invoice Deleted Successfully!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else {
                toast.error("Error Deleting Sales Invoice", {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.type === "franchisee_sale_billing") {
            const cash = await deleteFranchiseSaleBillingPayment(selectedRow.id);
            if (cash.data.status === "success") {
                toast.success("Franchise sale billing deleted successfully", {
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

    function handleOnCheck(row) {
        setCheckedPayments(row.selectedRows);
    }

    async function markPayment() {
        const response = await markAsDone(checkedPayments);
        if (response.data) {
            toast.success("Payment successfully marked as done!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else if (response.error) {
            TokenExpiry(response);
            toast.error(
                "Something went wrong",
                { style: toastStyle() }
            );
            setTimeout(() => refreshPage(), 1000);
        }
    }

    async function fetchPayment(id) {
        setShowLoader(true);
        setSalesData([]);
        setSalesBillingData([]);
        const response = await getAllPayments(id);
        if (response.data) {
            response.data.payments?.map((data) => {
                var receive = data;
                setSalesData((prev) => [...prev, receive]);
            });
        }
        setShowLoader(false);
    }

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function handleSelectChange(e, row) {
        setSelectedRow(row);

        if (e.target.value === "mark_as_done") {
            handleShowApproveModal();
        } else if (e.target.value === "void") {
            handleShowDeleteModal();
            setPaymentDeets({ id: row.id, payment: row.payment_mode });
        }
    }

    const handleTabSelect = (tab) => {
        if(tab === "all") {
            setSelectedTab(false);

            setFilterConfig((prev) => {
                return { ...prev, is_done: "" };
            });
        } else if(tab === "done") {
            setSelectedTab(false);

            setFilterConfig((prev) => {
                return { ...prev, is_done: "1" };
            });
        } else if(tab === "undone") {
            setSelectedTab(true);

            setFilterConfig((prev) => {
                return { ...prev, is_done: "0" };
            });
        }
        
    };

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row)}
            >
                <option value="" hidden selected>
                    Select
                </option>
                { accountType === "admin" ? (
                    <option value="mark_as_done" className="color-options">
                        Mark as done
                    </option>
                    ): null
                }
                { accountType === "admin" ? (
                    <option value="void" className="color-options">
                        Void
                    </option>
                    ): null
                }
            </Form.Select>
        );
    }

    function DoneBtn(row) {
        if(row.is_done !== "1" && accountType === "admin"){
            return (
                <button
                    name="action"
                    className="btn btn-sm view-btn-table"
                    id={row.id}
                    onClick={() => handleDone(row)}
                >
                    Done
                </button>
            );
        }
        
    }

    function handleDone(row) {
        setSelectedRow(row);
        handleShowApproveModal();
    }

    function PrintBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row.id, row.franchisee_id, row.payable_id, row.type)}
            >
                View
            </button>
        );
    }
    
    function handlePrint(id, fran_id, pay_id, type) {

        if(type === "franchisee"){
            window.open("/franchise/print/" + fran_id);
        } else if(type === "franchisee_sale"){
            window.open("/salesinvoice/print/" + pay_id);
        } else if(type === "franchisee_sale_billing"){
            window.open("/franchisebilling/view/" + pay_id);
        }
    }

    function CheckBox(row) {
        return (
            <Form.Check
                type="checkbox"
                name="is_done"
                value="1"
                disabled
                checked={row.is_done === "1" ? true : false}
            />
        );
    }

    const [branchOptions, setBranchesOptions] = useState ([]);

    useEffect(()=>{
        // console.log(franchisees)
        setBranchesOptions(franchisees.map((franchisee)=>{
            return {label: franchisee.branch_name, value:franchisee.branch_id};
        }))
        setBranchesOptions((_branches)=>{
            var newBranches = [..._branches];
            newBranches.push({label: "All Branches", value:""})
            return newBranches.reverse();
        });

        // console.log(branches);
    },[franchisees])

    function handleBranchChange(e){
        const toFilter = {target: {name: "branch_id", value: e.value}};
        handleOnSearch(toFilter);
    }

    const [franchiseeOptions, setFranchiseeOptions] = useState ([]);

    React.useEffect(()=>{
        // console.log("franchisees", franchisees);
        const tmp = franchisees.filter((v, i) => {
            return franchisees.map((val) => val.name).indexOf(v.name) == i;
        });
        const t = tmp.map((fr)=>{
            return {label: fr.name, value:fr.name};
        });
        t.push({label: "All Franchisees", value:""})
        setFranchiseeOptions(t.reverse());
    }, [franchisees]);

    function handleFranchiseeChange(e){
        const toFilter = {target: {name: "franchisee_name", value: e.value}};
        handleOnSearch(toFilter);
    }

    React.useEffect(() => {
        fetchBanks();
        fetchFranchisee();
    }, []);

    React.useEffect(() => {
        fetchAllPayments();
    }, [filterConfig]);

    // console.log(filterConfig)

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"FRANCHISE"}
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
                        <h1 className="page-title"> PAYMENTS </h1>
                    </Col>
                </Row>

                <Tabs 
                    defaultActiveKey="all"
                    id="PO-tabs"
                    onSelect={handleTabSelect}
                    >
                    <Tab
                        eventKey="all"
                        title="All"
                        className="sePI-tab-wrapper"
                    >
                        <div className="tab-content">
                            {/* filters */}
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>
                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch"
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
                                    options={branchOptions}
                                    onChange={handleBranchChange}
                                />
                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Franchisee"
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
                                    options={franchiseeOptions}
                                    onChange={handleFranchiseeChange}
                                />

                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Deposited to"
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
                                    options={banks}
                                    onChange={(e) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, deposited_to: e.value };
                                        });
                                    }}
                                />

                                {/* <Form.Select
                                    name="branch_id"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Branches
                                    </option>
                                    {franchisees.length > 0 ? (
                                        franchisees.map((franchisee) => {
                                            return (
                                                <option
                                                    value={franchisee.branch_id}
                                                >
                                                    {franchisee.branch_name}
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
                                    name="franchisee_name"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Franchisee
                                    </option>
                                    {franchisees.length > 0 ? (
                                        franchisees.filter((v, i) => {
                                            return franchisees.map((val) => val.name).indexOf(v.name) == i;
                                        })
                                        .map((franchisee) => {
                                            return (
                                                <option
                                                    value={franchisee.name}
                                                >
                                                    {franchisee.name}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <option value="" disabled>
                                            (No franchisee found)
                                        </option>
                                    )}
                                </Form.Select> */}
                                <Form.Select
                                    name="type"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All Types </option>
                                    <option value="franchisee_payment"> Contract </option>
                                    <option value="franchisee_sale_payment"> Sales </option>
                                    <option value="fs_billing_payment"> Billing </option>
                                </Form.Select>

                                <Form.Select
                                    name="payment_mode"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All Modes </option>
                                    <option value="cash"> Cash </option>
                                    <option value="check"> Check </option>
                                    <option value="others"> Others </option>
                                </Form.Select>

                            </div>

                            <div className="my-2 px-2 PO-filters d-flex justify-content-center">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    From:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_from}
                                    name="date_from"
                                    placeholderText={"Select Date"}
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

                                <span className="me-4 align-middle mt-2 ps-label">
                                    To:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_to}
                                    name="date_to"
                                    placeholderText={"Select Date"}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_to: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                    showYearDropdown
                                    dateFormatCalendar="MMMM"
                                    yearDropdownItemNumber={20}
                                    scrollableYearDropdown
                                />
                                
                                { accountType === "admin" && (
                                    <>
                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Contract: {numberFormat(totalContract)}
                                    </span>

                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Sales: {numberFormat(totalSales)}
                                    </span>

                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Billing: {numberFormat(totalBilling)}
                                    </span>
                                    </>
                                )}
                                
                            </div>

                            <div className="below">
                                {/* table */}
                                <Table
                                    tableHeaders={[
                                        "-",
                                        // "*",
                                        "DATE PAID",
                                        "FRANCHISEE",
                                        "BRANCH",
                                        "PAID AMT",
                                        "DPST DATE",
                                        "DPST TO",
                                        "CHK DATE",
                                        "REF/CHK",
                                        "PYMT MODE",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        // "*",
                                        "payment_date",
                                        "franchisee_name",
                                        "franchised_branch_name",
                                        "paid_amount",
                                        "deposit_date",
                                        "deposit_to",
                                        "check_date",
                                        "check_no",
                                        "payment_mode",
                                    ]}
                                    tableData={receivableData}
                                    ActionBtn={(row) => ActionBtn(row, "open")}
                                    ViewBtn={(row) => PrintBtn(row)}
                                    DoneBtn={(row) => DoneBtn(row)}
                                    CheckBox={(row) => CheckBox(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>

                    <Tab
                        eventKey="done"
                        title="Done"
                        className="sePI-tab-wrapper"
                    >
                        <div className="tab-content">
                            {/* filters */}
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>
                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch"
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
                                    options={branchOptions}
                                    onChange={handleBranchChange}
                                />
                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Franchisee"
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
                                    options={franchiseeOptions}
                                    onChange={handleFranchiseeChange}
                                />
                                {/* <Form.Select
                                    name="branch_id"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Branches
                                    </option>
                                    {franchisees.length > 0 ? (
                                        franchisees.map((franchisee) => {
                                            return (
                                                <option
                                                    value={franchisee.branch_id}
                                                >
                                                    {franchisee.branch_name}
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
                                    name="franchisee_name"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Franchisee
                                    </option>
                                    {franchisees.length > 0 ? (
                                        franchisees.filter((v, i) => {
                                            return franchisees.map((val) => val.name).indexOf(v.name) == i;
                                        })
                                        .map((franchisee) => {
                                            return (
                                                <option
                                                    value={franchisee.name}
                                                >
                                                    {franchisee.name}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <option value="" disabled>
                                            (No franchisee found)
                                        </option>
                                    )}
                                </Form.Select> */}
                                <Form.Select
                                    name="type"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All Types </option>
                                    <option value="franchisee_payment"> Contract </option>
                                    <option value="franchisee_sale_payment"> Sales </option>
                                    <option value="fs_billing_payment"> Billing </option>
                                </Form.Select>

                                <Form.Select
                                    name="payment_mode"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All Modes </option>
                                    <option value="cash"> Cash </option>
                                    <option value="check"> Check </option>
                                    <option value="others"> Others </option>
                                </Form.Select>
                            </div>

                            <div className="my-2 px-2 PO-filters d-flex justify-content-center">
                            <span className="me-4 align-middle mt-2 ps-label">
                                    From:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_from}
                                    name="date_from"
                                    placeholderText={"Select Date"}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_from: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                />

                                <span className="me-4 align-middle mt-2 ps-label">
                                    To:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_to}
                                    name="date_to"
                                    placeholderText={"Select Date"}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_to: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                />

                                { accountType === "admin" && (
                                    <>
                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Contract: {numberFormat(totalContract)}
                                    </span>

                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Sales: {numberFormat(totalSales)}
                                    </span>

                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Billing: {numberFormat(totalBilling)}
                                    </span>
                                    </>
                                )}

                            </div>

                            <div className="below">
                                {/* table */}
                                <Table
                                    tableHeaders={[
                                        "-",
                                        "DATE PAID",
                                        "FRANCHISEE",
                                        "BRANCH",
                                        "PAID AMT",
                                        "DPST DATE",
                                        "DPST TO",
                                        "CHK DATE",
                                        "REF/CHK",
                                        "PYMT MODE",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        "payment_date",
                                        "franchisee_name",
                                        "franchised_branch_name",
                                        "paid_amount",
                                        "deposit_date",
                                        "deposit_to",
                                        "check_date",
                                        "check_no",
                                        "payment_mode",
                                    ]}
                                    tableData={receivableData}
                                    ActionBtn={(row) => ActionBtn(row, "open")}
                                    ViewBtn={(row) => PrintBtn(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>

                    <Tab
                        eventKey="undone"
                        title="Undone"
                        className="sePI-tab-wrapper"
                    >
                        <div className="tab-content">
                            {/* filters */}
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>
                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch"
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
                                    options={branchOptions}
                                    onChange={handleBranchChange}
                                />
                                <Select
                                    className="dropsearch-filter px-0 py-0 me-2"
                                    classNamePrefix="react-select"
                                    placeholder="Select Franchisee"
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
                                    options={franchiseeOptions}
                                    onChange={handleFranchiseeChange}
                                />
                                {/* <Form.Select
                                    name="branch_id"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Branches
                                    </option>
                                    {franchisees.length > 0 ? (
                                        franchisees.map((franchisee) => {
                                            return (
                                                <option
                                                    value={franchisee.branch_id}
                                                >
                                                    {franchisee.branch_name}
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
                                    name="franchisee_name"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected>
                                        All Franchisee
                                    </option>
                                    {franchisees.length > 0 ? (
                                        franchisees.filter((v, i) => {
                                            return franchisees.map((val) => val.name).indexOf(v.name) == i;
                                        })
                                        .map((franchisee) => {
                                            return (
                                                <option
                                                    value={franchisee.name}
                                                >
                                                    {franchisee.name}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <option value="" disabled>
                                            (No franchisee found)
                                        </option>
                                    )}
                                </Form.Select> */}
                                <Form.Select
                                    name="type"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All Types </option>
                                    <option value="franchisee_payment"> Contract </option>
                                    <option value="franchisee_sale_payment"> Sales </option>
                                    <option value="fs_billing_payment"> Billing </option>
                                </Form.Select>

                                <Form.Select
                                    name="payment_mode"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All Modes </option>
                                    <option value="cash"> Cash </option>
                                    <option value="check"> Check </option>
                                    <option value="others"> Others </option>
                                </Form.Select>
                            </div>

                            <div className="my-2 px-2 PO-filters d-flex justify-content-center">
                                <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                    From:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_from}
                                    name="date_from"
                                    placeholderText={"Select Date"}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_from: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                />

                                <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                    To:
                                </span>
                                <DatePicker
                                    selected={filterConfig.date_to}
                                    name="date_to"
                                    placeholderText={"Select Date"}
                                    onChange={(date) => {
                                        setFilterConfig((prev) => {
                                            return { ...prev, date_to: date };
                                        });
                                    }}
                                    fixedHeight
                                    className="PI-date-btn me-3 form-control"
                                />

                                { accountType === "admin" && (
                                    <>
                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Contract: {numberFormat(totalContract)}
                                    </span>

                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Sales: {numberFormat(totalSales)}
                                    </span>

                                    <span className="me-2 ms-2 align-middle mt-2 ps-label">
                                        Billing: {numberFormat(totalBilling)}
                                    </span>
                                    </>
                                )}

                            </div>

                            <div className="below">
                                {/* table */}
                                <AdjustmentTable
                                    tableHeaders={[
                                        "-",
                                        // "/",
                                        "DATE PAID",
                                        "FRANCHISEE",
                                        "BRANCH",
                                        "PAID AMT",
                                        "DPST DATE",
                                        "DPST TO",
                                        "CHK DATE",
                                        "REF/CHK",
                                        "MODE",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        // "/",
                                        "payment_date",
                                        "franchisee_name",
                                        "franchised_branch_name",
                                        "paid_amount",
                                        "deposit_date",
                                        "deposit_to",
                                        "check_date",
                                        "check_no",
                                        "payment_mode",
                                    ]}
                                    tableData={receivableData}
                                    ActionBtn={(row) => ActionBtn(row, "open")}
                                    ViewBtn={(row) => PrintBtn(row)}
                                    DoneBtn={(row) => DoneBtn(row)}
                                    handleOnCheck={(row) => handleOnCheck(row)}
                                    showLoader={showLoader}
                                />
                            </div>
                            <div className="mb-2" />
                        </div>
                    </Tab>
                </Tabs>
                {selectedTab && getType() === "admin" ? (
                    <>
                        <div className="d-flex justify-content-end pt-3 mb-3 mr-3">
                            <button
                                type="button"
                                className="button-primary mr-3 "
                                onClick={() => handleShowApproveModal()}
                            >
                                Mark as done
                            </button>
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </div>

            {/* modals */}
            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="payment"
                onDelete={handleDeleteItem}
            />
            <MarkAsDoneModal
                show={showApproveModal}
                hide={handleCloseApproveModal}
                type="mark this payment as done?"
                ids={checkedPayments}
                handler={markPayment}
            />
        </div>
    );
}
