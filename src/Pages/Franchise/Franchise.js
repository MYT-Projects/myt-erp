import React, { forwardRef, useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/DataTable";
import DeleteModal from "../../Components/Modals/DeleteModal";
import Select from "react-select";

// api calls and utils
import {
    deleteInvoice,
    filterInvoice,
    getAllInvoices,
} from "../../Helpers/apiCalls/Sales/franchiseInvoice";
import {
    getTodayDate,
    refreshPage,
    toastStyle,
    TokenExpiry,
    formatDate,
    formatDateNoTime,
    dateFormat,
    getType,
    numberFormat,
    numberFormatInt,
} from "../../Helpers/Utils/Common";
import { getAllSuppliers } from "../../Helpers/apiCalls/suppliersApi";

// css
import "./Franchise.css";
import "../Purchases/PurchaseOrders/PurchaseOrders.css";
import {
    getAllFranchisee,
} from "../../Helpers/apiCalls/franchiseeApi";
import {
    deleteFranchisee,
    searchFranchisee,
    searchFranchiseeApi,
} from "../../Helpers/apiCalls/Franchise/FranchiseApi";
import AddPaymentModal from "./AddPaymentModal";
import ConfirmPaymentModal from "./ConfirmPaymentModal";
import Moment from "moment";
/**
 *  Franchise Register component
 */



export default function Franchise() {
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const userType = getType()
    const [inactive, setInactive] = useState(true);
    const [openListPI, setOpenListPI] = useState([]);
    const [closeListPI, setCloseListPI] = useState([]);
    const [franchisees, setFranchisees] = useState([]);

    /* FILTER CONFIGS */
    const [filterConfig, setFilterConfig] = useState({
        franchise: "",
        tabKey: "",
        payment_status: "",
        franchised_on_from: "",
        franchised_on_to: "",
    });

    const [branches, setBranches] = useState ([]);
    const [branch, setBranch] = useState("");

    useEffect(()=>{
        // console.log(franchisees)
        setBranches(franchisees.map((franchisee)=>{
            return {label: franchisee.branch_name, value:franchisee.branch_id};
        }))
        setBranches((branches)=>{
            var newBranches = [...branches];
            newBranches.push({label: "All Branches", value:""})
            return newBranches.reverse();
        });

        console.log(branches);
    },[franchisees])

    function handleBranchChange(e){
        setBranch(e.name);
        const toFilter = {target: {name: "branch_id", value: e.value}};
        handleFilterChange(toFilter);
    }

    const today = Moment().format("MM-DD-YYYY");

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    const handleTabSelect = (tabKey) => {
        var newFilterConfig = {
            tab: tabKey,
        };

        switch (tabKey) {
            case "open_bills":
                setFranchiseeManager([]);
                newFilterConfig.payment_status = "open_bill";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "closed_bills":
                setFranchiseeManager([]);
                newFilterConfig.payment_status = "closed_bill";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            default:
                setFranchiseeManager([]);
                break;
        }
    };

    // async function fetchFilteredPI() { 
    //     if (
    //         filterConfig.franchise ||
    //         (filterConfig.franchised_on_from && filterConfig.franchised_on_to)
    //     ) {
    //         setShowLoader(true);

    //         const response = await searchFranchisee(filterConfig);
    //         if (response.data) {
    //             var allBills = response.data.data.map((data) => {
    //                 var franchise = data;
    //                 franchise.franchised_on =
    //                     dateFormat(franchise.franchised_on) || "N/A";
    //                 franchise.beginning_credit_limit = numberFormat(franchise.beginning_credit_limit);
    //                 franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
    //                 franchise.paid_amount = numberFormat(franchise.paid_amount);
    //                 franchise.grand_total = numberFormat(franchise.grand_total);
    //                 franchise.balance = numberFormat(franchise.balance)
    //                 return franchise;
    //             });

    //             var closedBills = allBills.filter(
    //                 (bill) =>
    //                     bill.payment_status === "closed_bill" ||
    //                     bill.payment_status === "paid"
    //             );
    //             var openBills = allBills.filter(
    //                 (bill) =>
    //                     bill.payment_status === "open_bill" ||
    //                     bill.payment_status === "unpaid"
    //             ); 
    //             setCloseListPI(closedBills);
    //             setOpenListPI(openBills);
    //         } else if (response.error) {
    //             setCloseListPI([]);
    //             setOpenListPI([]);
    //         }
    //         setShowLoader(false);
    //     } else if (filterConfig.franchise === "") {
    //         setShowLoader(true);

    //         const response = await searchFranchisee(filterConfig.franchise); 
    //         if (response.data) { 
    //             var allBills = response.data.data.map((data) => {
    //                 var franchise = data;
    //                 franchise.franchised_on =
    //                     formatDate(franchise.franchised_on) || "N/A";
    //                 franchise.beginning_credit_limit = numberFormat(franchise.beginning_credit_limit);
    //                 franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
    //                 franchise.paid_amount = numberFormat(franchise.paid_amount);
    //                 franchise.grand_total = numberFormat(franchise.grand_total);
    //                 franchise.balance = numberFormat(franchise.balance)
    //                 return franchise;
    //             });

    //             var closedBills = allBills.filter(
    //                 (bill) =>
    //                     bill.payment_status === "closed_bill" ||
    //                     bill.payment_status === "paid"
    //             );
    //             var openBills = allBills.filter(
    //                 (bill) =>
    //                     bill.payment_status === "open_bill" ||
    //                     bill.payment_status === "unpaid"
    //             ); 
    //             setCloseListPI(closedBills);
    //             setOpenListPI(openBills);
    //         } else if (response.error) {
    //             setCloseListPI([]);
    //             setOpenListPI([]);
    //         }
    //         setShowLoader(false);
    //     }
    // }

    const [franchiseeManager, setFranchiseeManager] = useState([]);
    async function searchFranchisee() {
        setShowLoader(true);
        setFranchiseeManager([]);

        const response = await searchFranchiseeApi(filterConfig); 

        if (response.data) {
            var sortedData = response.data.data.sort((a, b) =>
                a.branch_name > b.branch_name
                    ? 1
                    : b.branch_name > a.branch_name
                    ? -1
                    : 0
            );

            var allBills = sortedData.map((data) => {
                var franchise = data;
                franchise.franchised_on = franchise.franchised_on !== "0000-00-00" ?
                    formatDateNoTime(franchise.franchised_on) : "None";
                franchise.opening_start = franchise.opening_start !== "0000-00-00" ?
                    Moment(franchise.opening_start).format("MM-DD-YYYY") : "None";
                franchise.contract_end = franchise.contract_end !== "0000-00-00" ?
                    Moment(franchise.contract_end).format("MM-DD-YYYY") : "N/A";
                franchise.beginning_credit_limit = numberFormat(data.beginning_credit_limit);
                franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
                franchise.is_expired = Moment(franchise.contract_end).format("YYYY-MM-DD") < Moment().format("YYYY-MM-DD") ? "Expired" : ""
                franchise.paid_amount = numberFormat(franchise.paid_amount);
                    franchise.grand_total = numberFormat(franchise.grand_total);
                    franchise.balance = numberFormat(franchise.balance)
                return franchise;
            });
            setFranchiseeManager(allBills);
        } else if (response.error) {
            TokenExpiry(response);
        }
        setShowLoader(false);

    }

    useEffect(() => {
        searchFranchisee();
    }, [filterConfig]);

    const [showLoader, setShowLoader] = useState(false);

    async function fetchPI() {
        setShowLoader(true);
        setOpenListPI([]);
        setCloseListPI([]);

        const response = await getAllFranchisee(); 

        if (response.error) {
            TokenExpiry(response.error);
        } else if (response.data) { 
            var closedBills = [];
            var openBills = [];

            var allFranchiseeSalesInvoice = response.data.data.map((data) => {
                var franchise = data;
                franchise.franchised_on =
                    dateFormat(franchise.franchised_on) || "N/A";
                franchise.beginning_credit_limit = numberFormat(data.beginning_credit_limit);
                franchise.franchisee_fee = numberFormat(franchise.franchisee_fee);
                franchise.paid_amount = numberFormat(franchise.paid_amount);
                franchise.grand_total = numberFormat(franchise.grand_total);
                franchise.balance = numberFormat(franchise.balance)
                return franchise;
            });

            closedBills = allFranchiseeSalesInvoice.filter(
                (bill) =>
                    bill.payment_status === "closed_bill" ||
                    bill.payment_status === "paid"
            );
            openBills = allFranchiseeSalesInvoice.filter(
                (bill) =>
                    bill.payment_status === "open_bill" ||
                    bill.payment_status === "unpaid"
            );
            setCloseListPI(closedBills);
            setOpenListPI(openBills); 
        }
        setShowLoader(false);
    } 

    async function fetchFranchisee() {
        setShowLoader(true);

        const response = await getAllFranchisee();

        if (response.error) {
            TokenExpiry(response.error);
        } else { 
            setFranchisees(response.data.data);
        }
        setShowLoader(false);
    }

    /* add payment modal handler */
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const handleShowAddPaymentModal = () => setShowAddPaymentModal(true);
    const handleCloseAddPaymentModal = () => setShowAddPaymentModal(false);

    /* add payment modal handler */
    const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
    const handleShowConfirmPaymentModal = () => setShowConfirmPaymentModal(true);
    const handleCloseConfirmPaymentModal = () => setShowConfirmPaymentModal(false);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [PIID, setPIID] = useState("");
    const [balance, setBalance] = useState("");

    async function handleDeletePI() {
        const response = await deleteFranchisee(PIID); 

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
    }

    /* add modal handler */
    const [showAddModal, setShowAddModal] = useState(false);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    /* add payment modal handler */
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const handleShowPaymentModal = () => setShowPaymentModal(true);
    const handleClosePaymentModal = () => setShowPaymentModal(false);
    const [franchiseeID, setFranchiseeID] = useState("");

    function handleSelectChange(e, id, franchisee_id, balance) {
        console.log(balance)
        if (e.target.value === "edit-pi") {
            navigate("edit/" + franchisee_id);
        } else if (e.target.value === "print-pi") {
            navigate("print/" + franchisee_id);
        } else if (e.target.value === "payment-pi") {
            setBalance(numberFormatInt(balance));
            setPIID(id);
            setBalance(numberFormatInt(balance));
            setFranchiseeID(franchisee_id);
            if(balance === 0 || balance === "0.00") {
                handleShowConfirmPaymentModal()
            } else {
                handleShowAddPaymentModal();
            }
        } else if (e.target.value === "delete-pi") {
            setPIID(franchisee_id);
            handleShowDeleteModal();
        }
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

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) =>
                    handleSelectChange(e, row.branch_id, row.id, row.balance)
                }
            >
                <option value="" hidden selected>
                    Select
                </option>
                {userType === "admin" ? (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="print-pi" className="color-options">
                    View
                </option>
                {type === "open_bill" ? (
                    <option value="payment-pi" className="color-options">
                        Add Payment
                    </option>
                ) : null}
                {userType === "admin" && (
                    <option value="delete-pi" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    function ViewBtn(row) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={(e) => handleViewBtn(row.id)}
            >
                View
            </button>
        );
    }

    function handleViewBtn(id) {
        navigate("print/" + id);
    }

    function PayBtn(row) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table small"
                onClick={(e) => handleShowModal(row.id, row.balance)}
            >
                Add Payment
            </button>
        );
    }

    function handleShowModal(id, balance) { 
        setFranchiseeID(id);
        setBalance(numberFormatInt(balance));
        handleShowAddPaymentModal();
    }

    React.useEffect(() => { 
        fetchFranchisee();
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
                        <h1 className="page-title">FRANCHISE REGISTER</h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="franchise"
                            placeholder="Search franchisee..."
                            value={filterConfig.franchise}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <button
                            className="add-btn"
                            onClick={() => navigate("/franchise/add")}
                        >
                            Add
                        </button>
                    </Col>
                </Row>


                <div className="tab-content">

                    <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                        <span className="me-3 align-middle mt-2">
                            FILTER BY:
                        </span>

                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="All Branches"
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
                            value={branch}
                            options={branches}
                            onChange={handleBranchChange}
                        />
                        {/* <Form.Select
                            name="branch_id"
                            className="date-filter me-2"
                            defaultValue={filterConfig.franchisee_id} 
                            onChange={(e) => handleFilterChange(e)}
                        >
                            <option value="" selected>
                                All Branches
                            </option>
                            {franchisees.length > 0 ? (
                                franchisees.map((franchisee) => {
                                    return (
                                        <option
                                            value={franchisee.branch_id}
                                            selected={
                                                franchisee.id ===
                                                filterConfig.franchisee
                                            }
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
                        </Form.Select> */}

                        <Form.Select
                            name="payment_status"
                            className="date-filter me-2"
                            defaultValue={filterConfig.payment_status} 
                            onChange={(e) => handleFilterChange(e)}
                        >
                            <option value="" selected> All Bill</option>
                            <option value="open_bill" selected> Open bill </option>
                            <option value="closed_bill" selected> Closed bill </option>
                        </Form.Select>

                        <Form.Select
                            name="type"
                            className="date-filter me-2"
                            defaultValue={filterConfig.type} 
                            onChange={(e) => handleFilterChange(e)}
                        >
                            <option value="" selected> All Type</option>
                            <option value="active"> Active </option>
                            <option value="expired"> Expired </option>
                        </Form.Select>
                    </div>

                    <Table
                        tableHeaders={[
                            "-",
                            "BRANCH NAME",
                            "FRANCHISEE",
                            "PACKAGE",
                            "TOTAL",
                            "PAID AMOUNT",
                            "BALANCE",
                            "CREDIT LIMIT",
                            "OPEN DATE",
                            "CNTRCT END",
                            "        ",
                            "ACTIONS",
                        ]}
                        headerSelector={[
                            "-",
                            "branch_name",
                            "name",
                            "franchisee_fee",
                            "grand_total",
                            "paid_amount",
                            "balance",
                            "beginning_credit_limit",
                            "opening_start",
                            "contract_end",
                            "is_expired",
                        ]}
                        tableData={franchiseeManager}
                        ViewBtn={(row) => ViewBtn(row)}
                        ActionBtn={(row) => ActionBtn(row, "open_bill")}
                        showLoader={showLoader}
                        withActionData={false}
                    />
                </div>
                <div className="mb-2" />
            </div>
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="franchisee"
                onDelete={() => handleDeletePI()}
            />
            <AddPaymentModal
                id={PIID}
                balance={balance}
                franchiseeID={franchiseeID}
                show={showAddPaymentModal}
                onHide={handleCloseAddPaymentModal}
            />
            <ConfirmPaymentModal
                // id={PIID}
                // balance={balance}
                // franchiseeID={franchiseeID}
                show={showConfirmPaymentModal}
                onHide={handleCloseConfirmPaymentModal}
                handler={handleShowAddPaymentModal}
            />
        </div>
    );
}
