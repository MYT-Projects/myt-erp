import React, { forwardRef, useState, useEffect } from "react";
import { Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import Moment from "moment";
import { CSVLink, CSVDownload } from "react-csv";
// components
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/OneTable";
import DeleteModal from "../../Components/Modals/DeleteModal";
import PettyCashModal from "./PettyCashModal";

// api calls and utils
import {searchPettyCashTransactionDetails, deletePettyCashTransactionDetails, getPettyCashInfo, approvePettyCashRequest} from "../../Helpers/apiCalls/PettyCash/PettyCashRegisterApi";

import {
    getTodayDateISO,
    getType,
    refreshPage,
    toastStyle,
    formatYDM,
    numberFormat,
    getUser
} from "../../Helpers/Utils/Common";

// css
import "./PettyCash.css";
import downloadIcon from "../../Assets/Images/download_icon.png";
/**
 *  Petty Cash Register component
 */

export default function PettyCash() {
    let navigate = useNavigate();
    const dateToday = getTodayDateISO();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [pettyCashID, setPettyCashID] = useState("1");
    const [pettyCashInfo, setPettyCashInfo] = useState({});
    const [pettyCashTransactions, setPettyCashTransactions] = useState([]);
    const [isDeleteClicked, setIsDeleteClicked] = useState(false);

    const date = new Date();
    date.setDate(date.getDate() - 7);

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate());

    /* FILTER CONFIGS */
    const [filterConfig, setFilterConfig] = useState({
        tab: "all-register",
        transaction_type: "all",
        date_from: date,
        date_to: nextDay,
        status: "approved"
    });

    function handleFilterChange(e) {
        const { name, value } = e.target;
        const newConfig = {...filterConfig, [name]: value};
        setFilterConfig(newConfig);
    }

    function filterPettyCashTransactions() {
        searchTransactionsApi();
        
    }


    useEffect(() => {
        filterPettyCashTransactions();
    }, [filterConfig]);

    const excelHeaders = [
        { label: "Date", key: "date" },
        { label: "Transaction Type", key: "type" },
        { label: "From", key: "from" },
        { label: "Particulars", key: "particulars" },
        { label: "Cash In", key: "cashin_amount" },
        { label: "Cash Out", key: "cashin_amount" },
        { label: "Balance", key: "current" },
        { label: "Added By", key: "added_by_name" },
        { label: "Added On", key: "added_on" },
        
    ];

    const [showLoader, setShowLoader] = useState(false);

    async function searchTransactionsApi() {
        console.log(filterConfig)
        setShowLoader(true);
        var params = {
            petty_cash_id: pettyCashID, 
            ...filterConfig
        };
        // if(filterConfig.transaction_type !== "all"){
        //     params = {...params,
        //         type: filterConfig.transaction_type, 
        //         status: filterConfig.status
        //     }
            
        // }
        // if(filterConfig.date_from !== ""  && filterConfig.date_to !== ""){
        //     params = {...params,
        //         date_to: formatYDM(filterConfig.date_to),
        //         date_from: formatYDM(filterConfig.date_from), 
        //         status: filterConfig.status
        //     }
        // } else if (filterConfig.date_from !== "" ) {
        //     params = {...params,
        //         date_to: dateToday,
        //         date_from: formatYDM(filterConfig.date_from), 
        //         status: filterConfig.status
        //     }
        // }
        // else {
        //     params = {...params,
        //         // date_from: "2000-01-01",
        //         // date_to: dateToday, 
        //         status: filterConfig.status
        //     }
        // }
        const response = await searchPettyCashTransactionDetails(
            params
        );
        console.log(response)
        if (response.status === "error") {
            toast.error(response.data.response, {
                style: toastStyle(),
            });
        } else if (response.status === "success") {
            var newData = response.history.map((data)=>{
                var newData = data;
                newData.from = data.from ? data.from : " "
                newData.particulars = data.particulars ? data.particulars : " "
                newData.particulars = data.from + " "  + data.particulars
                if(newData.type === "out"){
                    newData.cashin_amount = "";
                    newData.cashout_amount = numberFormat(newData.amount);
                } else {
                    newData.cashin_amount = numberFormat(newData.amount);
                    newData.cashout_amount = "";
                }
                newData.date = Moment(data.date).format("MM-DD-YYYY");
                newData.added_on = Moment(data.added_on).format("MM-DD-YYYY");
                
                newData.current = numberFormat(newData.current);
                return newData;
            })
            newData = newData.sort((transaction_1, transaction_2) => {
                return Moment(transaction_1.date).isBefore(transaction_2.date);
            });
            setPettyCashTransactions(newData);
        } else {
            var errMsg = response.error;
            toast.error(errMsg, { style: toastStyle() });
        }
        setShowLoader(false);
    }


    

    async function fetchPettyCashInfo(){
        const response = await getPettyCashInfo(
            {petty_cash_id: pettyCashID}
        );
        if (response.error) {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
        } else {
            if (response.status === "error") {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            } else if (response.status === "success") {
                setPettyCashInfo({...response['data']});
            } else {
                var errMsg = response.error;
                toast.error(errMsg, { style: toastStyle() });
            }
        }
    }

    async function handleApprovePettyCashRequest(){
        console.log(selected)
        const response = await approvePettyCashRequest(
            selected.petty_cash_items[0].petty_cash_detail_id
        );
        console.log(response)
        if (response.error) {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
        } else {
            if (response.status === "error") {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            } else if (response.response === "Cashout approved") {
                toast.success("Successfully Approved Petty Cash Request", {
                    style: toastStyle(),
                });
                refreshPage()
            } else {
                var errMsg = response.error;
                toast.error(errMsg, { style: toastStyle() });
            }
        }
    }

    useEffect(() => {
        fetchPettyCashInfo();
    }, []);

    async function fetchTransactions() {
        setShowLoader(true);

        const response = await searchPettyCashTransactionDetails(
            {petty_cash_id: pettyCashID}
        );
        if(response.error){
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
        } else {
                if (response.status === "404") {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            } else if (response.status === "success") {
                var newData = response.history.map((data)=>{
                    var newData = data;
                    if(newData.type === "out"){
                        newData.cashin_amount = "";
                        newData.cashout_amount = numberFormat(newData.amount);
                    } else {
                        newData.cashin_amount = numberFormat(newData.amount);
                        newData.cashout_amount = "";
                    }
                    newData.date = Moment(data.date).format("MM-DD-YYYY");
                    newData.added_on = Moment(data.added_on).format("MM-DD-YYYY");
                    newData.current = numberFormat(newData.current);
                    newData.amount = numberFormat(newData.amount);
                    return newData;
                })
                newData = newData.sort((transaction_1, transaction_2) => {
                    return Moment(transaction_1.date).isBefore(transaction_2.date);
                });
                setPettyCashTransactions(newData);
            } else {
                var errMsg = response.error;
                toast.error(errMsg, { style: toastStyle() });
            }
        }
        setShowLoader(false);
    }

    /* approve modal handler */
    const [showApproveModal, setShowApproveModal] = useState(false);
    const handleShowApproveModal = () => setShowApproveModal(true);
    const handleCloseApproveModal = () => setShowApproveModal(false);

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [transactionDetailID, setTransactionDetailID] = useState("");

    async function handleDeleteTransaction() {
        if(isDeleteClicked){
            return;
        }

        setIsDeleteClicked(true);
        const response = await deletePettyCashTransactionDetails(transactionDetailID);

        if (response.status === "success") {
            toast.success("Petty Cash Transaction Deleted Successfully!", {
                style: toastStyle(),
            });
            setTimeout(() => refreshPage(), 1000);
        } else {
            toast.error("Error Deleting Petty Cash Transaction", {
                style: toastStyle(),
            });
        }
    }


    function handleSelectChange(e, id, type) {
        if (e.target.value === "edit-pi") {
            if(type === "in"){
                navigate("/pettycash/cashin/" + id + "/edit/" );
            } else if(type ==="out") {
                navigate("/pettycash/cashout/" + id + "/edit/" );
            }
            
        } else if (e.target.value === "delete-pi") {
            setTransactionDetailID(id);
            handleShowDeleteModal();
        }

        else if (e.target.value === "view-btn"){
            if(type === "in"){
                navigate("/pettycash/cashin/" + id );
            } else if(type ==="out") {
                navigate("/pettycash/cashout/" + id );
            }
        }
    }

    const handleTabSelect = (tabKey) => {
        var newFilterConfig = {
            ...filterConfig,
            tab: tabKey,
        };
        switch (tabKey) {
            case "all-register":
                newFilterConfig.tab = "all-register";
                newFilterConfig.status = "approved";
                newFilterConfig.date_from = date;
                newFilterConfig.date_to = nextDay;
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "request":
                newFilterConfig.tab = "request";
                newFilterConfig.status = "request";
                newFilterConfig.date_from = "";
                newFilterConfig.date_to = "";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                // setFilterConfig((prev) => {
                //     return {
                //         ...prev,
                //         newFilterConfig,
                // }});
                break;
            default:
                break;
        }
    };

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                onChange={(e) =>
                    handleSelectChange(
                        e,
                        row.id,
                        row.type
                    )
                }
            >
                <option value="" hidden selected>
                    Select
                </option>

                {((accountType === "admin" ||
                    accountType === "franchise_officer") && type === "request" ) && (
                    <option value="view-btn" className="color-options">
                        View
                    </option>
                )}
                {(accountType === "admin" ||
                    accountType === "franchise_officer") ? (
                    <option value="edit-pi" className="color-options">
                        Edit
                    </option>
                ) : null}
                {((accountType === "admin" ||
                    accountType === "franchise_officer") && type === "request" ) && (
                    <option value="approve-btn" className="color-options">
                        Approve
                    </option>
                )}
                {(accountType === "admin" ||
                    accountType === "franchise_officer") && (
                    <option value="delete-pi" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }
    const [selected, setSelected] = useState({});
    
    

    function ViewBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={(e) =>
                    handleSelectChange(
                        e,
                        row.id,
                        row.type
                    )
                }
                value="view-btn"
            >
                View
            </button>
        );
    }

    function ApproveBtn(row) {
        if(accountType === "admin") {
            return (
                <button
                    name="action"
                    className="btn btn-sm view-btn-table"
                    id={row.id}
                    onClick={(e) => handleApprove(row)}
                    value="approve-btn"
                >
                    Approve
                </button>
            );
        }
    }
    function handleApprove(row) {
        console.log(row)
        setSelected(row);
        handleShowApproveModal()
    }


    React.useEffect(() => {
        // fetchTransactions();
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PETTY CASH"}
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
                        <h1 className="page-title">PETTY CASH REGISTER</h1>
                        <h4 className="page-subtitle"> Current Petty Cash: {"\u20B1"}{numberFormat(pettyCashInfo.current_petty_cash)}</h4>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <button
                            className="add-btn"
                            onClick={() => navigate("/pettycash/cashin")}
                        >
                            Cash In
                        </button>
                        <button
                            className="add-btn"
                            onClick={() => navigate("/pettycash/cashout")}
                        >
                            Cash Out
                        </button>
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-end mb-4">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={pettyCashTransactions.slice()}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} History-PettyCashTransactions`}
                            >
                                <span className="me-2">
                                    <img
                                        width={20}
                                        height={20}
                                        src={downloadIcon}
                                    ></img>
                                </span>
                                Download Excel
                            </CSVLink>
                        </div>
                    </Col>
                </Row>
                <Tabs defaultActiveKey="all-register" id="petty-cash-tabs" onSelect={handleTabSelect}>
                    <Tab eventKey="all-register" title="ALL REGISTER">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>

                            <Form.Select
                                name="transaction_type"
                                className="date-filter me-2"
                                defaultValue={filterConfig.transaction_type}
                                onChange={(e) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, transaction_type: e.target.value };
                                    });
                                }}
                            >
                                <option value="all" selected>
                                    All Transactions
                                </option>
                                <option value="in" >
                                    Cash In
                                </option>
                                <option value="out" >
                                    Cash Out
                                </option>
                                
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={Moment(date).format("MM/DD/YYYY")}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                placeholderText={Moment(nextDay).format("MM/DD/YYYY")}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                maxDate={dateToday}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                            />
                        </div>

                        {/* content */}
                        <div className="pettycash-tbl">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "DATE",
                                    // "FROM",
                                    "PARTICULARS",
                                    "REQ BY",
                                    "CASH IN",
                                    "CASH OUT",
                                    "BALANCE",
                                    "ADDED BY",
                                    "ADDED ON",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "date",
                                    // "from",
                                    "particulars",
                                    "requested_by_name",
                                    "cashin_amount",
                                    "cashout_amount",
                                    "current",
                                    "added_by_name",
                                    "added_on",
                                    "actions"
                                ]}
                                tableData={pettyCashTransactions}
                                ActionBtn={(row) => ActionBtn(row)}
                                ViewBtn={(row) => ViewBtn(row)}
                                showLoader={showLoader}
                                withActionData={false}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="request" title="CASH REQUEST">
                        {/* filters */}
                        <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                            <span className="me-3 align-middle mt-2">
                                Filter By:
                            </span>

                            <Form.Select
                                name="transaction_type"
                                className="date-filter me-2"
                                defaultValue={filterConfig.transaction_type}
                                onChange={(e) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, transaction_type: e.target.value };
                                    });
                                }}
                            >
                                <option value="all" selected>
                                    All Transactions
                                </option>
                                <option value="in" >
                                    Cash In
                                </option>
                                <option value="out" >
                                    Cash Out
                                </option>
                                
                            </Form.Select>

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_from: date };
                                    });
                                }}
                                maxDate={dateToday}
                                fixedHeight
                                className="PI-date-btn me-3 form-control"
                            />

                            <span className="me-3 align-middle mt-2">To:</span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return { ...prev, date_to: date };
                                    });
                                }}
                                maxDate={dateToday}
                                minDate={filterConfig.date_from}
                                className="PI-date-btn me-3 form-control"
                            />
                        </div>

                        {/* content */}
                        <div className="pettycash-tbl">
                            <Table
                                tableHeaders={[
                                    "-",
                                    "DATE",
                                    // "FROM",
                                    "PARTICULARS",
                                    "REQ BY",
                                    "CASH IN",
                                    "CASH OUT",
                                    "BALANCE",
                                    "ADDED BY",
                                    "ADDED ON",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "date",
                                    // "from",
                                    "particulars",
                                    "requested_by_name",
                                    "cashin_amount",
                                    "cashout_amount",
                                    "current",
                                    "added_by_name",
                                    "added_on",
                                    "actions"
                                ]}
                                tableData={pettyCashTransactions}
                                ActionBtn={(row) => ActionBtn(row, "request")}
                                ViewBtn={(row) => ApproveBtn(row)}
                                showLoader={showLoader}
                                withActionData={false}
                            />
                        </div>
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="petty cash transaction"
                onDelete={() => handleDeleteTransaction()}
            />
            <PettyCashModal
                show={showApproveModal}
                hide={handleCloseApproveModal}
                type="approve"
                handler={handleApprovePettyCashRequest}
            />
        </div>
    );
}
