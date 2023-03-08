import React, { useState, useRef, useEffect } from "react";
import { Accordion, Col, Form, Row, Tab, Tabs, Table, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    dateFormat,
    numberFormat,
    numberFormatInt,
    refreshPage,
    toastStyle,
    TokenExpiry,
    formatDateNoTime,
    getTodayDateISO
} from "../../../Helpers/Utils/Common";
import {
    getAllTransfers,
    deleteTransfer,
    updateTransferStatus,
    searchByDate,
    searchByTransfer,
} from "../../../Helpers/apiCalls/Inventory/TransferApi";
import DeleteModal from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import TableTemplate from "../../../Components/TableTemplate/Table";
import cleanLogo from "../../../Assets/Images/Login/logo.png";
import toast from "react-hot-toast";
import { getAllSuppliers } from "../../../Helpers/apiCalls/suppliersApi";
import { getSingleUser } from "../../../Helpers/apiCalls/usersApi";
import { getType } from "../../../Helpers/Utils/Common";
import {
    getAllBranches,
    searchBranch,
    updateBranch,
} from "../../../Helpers/apiCalls/Manage/Branches";
import Moment from "moment"
import ReactDatePicker from "react-datepicker";
import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import {
    getAllFranchiseSaleBilling,
    getAllFSBMissing,
    searchFranchisee,
    searchFranchiseeDropdown,
    searchFranchiseeBranchName,
    searchFranchiseeMonth,
    deleteFranchiseSaleBilling,
    createFranchiseSaleBilling,
    getAllOpenCloseBilling,
    searchSalesBilling,
    searchSalesBillingMissing,
} from "../../../Helpers/apiCalls/Franchise/FranchiseSaleBillingApi";
import FSBillingAddPaymentModal from "./FSBillingAddPaymentModal";
import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../../Assets/Images/download_icon.png";
import "./../Franchise.css";
import Select from "react-select";

export default function FranchiseBilling({reports}) {
    const accountType = getType();
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [userType, setUserType] = useState(getType());

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const [transferId, setTransferId] = useState("");
    const [balance, setBalance] = useState("");
    const [searchTransfer, setSearchTransfer] = useState("");
    const [searchMonth, setSearchMonth] = useState("");
    const [currentMonth, setCurrentMonth] = useState("");

    /* return modal handler */
    const [showReturnModal, setShowReturnModal] = useState(false);
    const handleShowReturnModal = () => setShowReturnModal(true);
    const handleCloseReturnModal = () => setShowReturnModal(false);

    /* add payment modal handler */
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    const handleShowAddPaymentModal = () => setShowAddPaymentModal(true);
    const handleCloseAddPaymentModal = () => {
        setShowAddPaymentModal(false);
        refreshPage();
    };
    const [monthYearFilter, setMonthYearFilter] = useState(new Date());

    /* send modal handler */
    const [showSendModal, setShowSendModal] = useState(false);
    const handleShowSendModal = () => setShowSendModal(true);
    const handleCloseSendModal = () => setShowSendModal(false);

    /* email modal handler */
    const [showEmailModal, setShowEmailModal] = useState(false);
    const handleShowEmailModal = () => setShowEmailModal(true);
    const handleCloseEmailModal = () => refreshPage();

    const [allTransfer, setAllTransfer] = useState([]);
    const [forApprovalTransfer, setForApprovalTransfer] = useState([]);
    const [processedTransfer, setProcessedTransfer] = useState([]);
    const [completedTransfer, setCompletedTransfer] = useState([]);
    const [deletedTransfer, setDeletedTransfer] = useState([]);

    const [missing, setMissing] = useState([]);
    const [done, setDone] = useState([]);
    const [allMissing, setAllMissing] = useState([]);
    const [allBilling, setAllBilling] = useState([]);
    const [openFranchiseBilling, setOpenFranchiseBilling] = useState([]);
    const [closeFranchiseBilling, setCloseFranchiseBilling] = useState([]);

    

    const [filterDate, setFilterDate] = useState({
        to: "",
        from: "",
        branch_to: "",
    });

    const dummy = [
        {
            id: "1",
            month: "SEPTEMBER 2022",
            date_opened: "June 1, 2022",
            branch_name: "SM CITY CEBU",
            franchise_name: "JUAN LUNA",
            contact_person: "JUAN LUNA",
            contact_number: "01234567891",
            franchise_date: "June 1, 2022",
        },
    ];

    const [suppliers, setSuppliers] = useState([]);
    const currentDate = new Date();
    const currentMonthName = new Date(monthYearFilter).toLocaleDateString(
                            "en-us",
                            { month:"long"}
                        );
    
    const currentYear = new Date(monthYearFilter).getFullYear();

    const excelHeaders = [
        { label: "Month", key: "name" },
        { label: "Branch", key: "branch_name" },
        { label: "Franchisee", key: "franchise_name" },
        { label: "Contact Person", key: "contact_person" },
        { label: "Contact No.", key: "contact_number" },
        { label: "Date Opened", key: "opening_start" },
        { label: "Franchise Date", key: "franchised_on" },
    ];
    const excelHeadersClosed = [
        { label: "Month", key: "monthYear" },
        { label: "Branch", key: "branch_name" },
        { label: "Sales", key: "total_sale" },
        { label: "Avg Sales", key: "average_sales" },
        { label: "Net Sales", key: "total_net" },
        { label: "Amt Due", key: "total_amount_due" },
        { label: "Balance", key: "balance" },
        { label: "Franchisee", key: "franchise_name" },
        { label: "Date Added", key: "date_added" },
    ];
    
    async function fetchSuppliers() {
        setSuppliers([]);
        const response = await getAllSuppliers();
        if (response.data) {
            setSuppliers(
                response.data.data.sort((a, b) => {
                    return a.trade_name < b.trade_name
                        ? -1
                        : a.trade_name > b.trade_name
                        ? 1
                        : 0;
                })
            );
        } else {
            TokenExpiry(response);
        }
    }

    async function handleSelectChange(e, id, balance, row) {
        switch (e.target.value) {
            case "edit-po":
                var mon = new Date(row.month)
                navigate("edit/" + id, {
                    state: { 
                        branchName: row.branch_name, 
                        month: mon.toLocaleDateString( "en-us", { month:"long"}), 
                        year: mon.getFullYear(),
                        type: "table"
                    },
                });
                break;

            case "delete-po":
                handleShowDeleteModal();
                setTransferId(id);
                break;

            case "return-po":
                handleShowApproveModal();
                setTransferId(id);

                break;

            case "print-po":
                navigate("print/" + id);
                break;

            case "review-po":
                navigate("view/" + id);
                break;

            case "view-po":
                navigate("view/" + id, {
                    state: { 
                        franchisee_id: row.franchisee_id, 
                        total_amount_due: numberFormatInt(row.total_amount_due), 
                    },
                });
                break;

            case "payment-po":
                setTransferId(id);
                setBalance(numberFormatInt(balance));
                handleShowAddPaymentModal();
                break;
        }
    }

    function clearTables() {
        setMissing([]);
        setDone([]);
        setAllMissing([]);
        setAllBilling([]);
    }

    const [showLoader, setShowLoader] = useState(false);
    const [branchesData, setBranchesData] = useState([]);

    /* Approve Modal */
    const [showApproveModal, setShowApproveModal] = useState(false);
    const handleShowApproveModal = () => setShowApproveModal(true);
    const handleCloseApproveModal = () => setShowApproveModal(false);

    async function fetchData() {
        setShowLoader(true);
        clearTables();

        const response = await getAllFSBMissing();

        if (response.error) {
        } else {
            var closedBills = [];
            var openBills = [];
            var missingBills = [];
            var allMissingBills = [];
            var doneBills = [];

            var billing = response.data.data;

            var allBills = response.data.data.map((bill) => {
                var info = bill;

                info.id = bill.id;
                info.month = dateFormat(bill.month);
                info.date_added = Moment(bill.added_on).format("MM-DD-YYYY");
                info.date_opened = Moment(bill.date_opened).format("MM-DD-YYYY");
                info.branch_id = bill.branch_id;
                info.balance = bill.balance;
                info.branch_name = bill.branch_name;
                info.franchise_id = bill.franchisee_id;
                info.franchise_name = bill.name;
                info.payment_status = bill.payment_status;
                info.contact_person = bill.contact_person
                    ? bill.contact_person
                    : "N/A";
                info.contact_number = bill.contact_number
                    ? bill.contact_number
                    : "N/A";
                info.franchise_date = dateFormat(bill.month);
                info.total_sale = "0";
                info.total_net = "0";
                info.total_amount_due = "0";

                info.monthYear =
                    new Date(info.month).toLocaleString("en-us", {
                        month: "long",
                    }) +
                    " " +
                    new Date(info.month).getFullYear();
                return info;
            });

            missingBills = allBills.filter(
                (bill) =>
                    bill.paid_amount === "0.00" &&
                    new Date(bill.month).toLocaleString("en-us", {
                        month: "long",
                    }) ===
                        new Date(monthYearFilter).toLocaleString("en-us", {
                            month: "long",
                        })
            );
            allMissingBills = allBills.filter(
                (bill) => bill.paid_amount === "0.00"
            );
        }

        const response2 = await getAllFranchiseSaleBilling();
        if (response2.error) {
        } else {
            var closedBills = [];
            var openBills = [];
            var missingBills = [];
            var allMissingBills = [];
            var doneBills = [];

            var billing = response2.data.data;

            var allBills = response2.data.data.map((bill) => {
                var info = bill;

                info.id = bill.id;
                info.month = Moment(bill.month).format("MM-DD-YYYY");
                info.date_added = Moment(bill.added_on).format("MM-DD-YYYY");
                info.date_opened = Moment(bill.added_on).format("MM-DD-YYYY");
                info.branch_id = bill.branch_id;
                info.balance = bill.balance;
                info.branch_name = bill.branch_name;
                info.franchise_id = bill.franchisee_id;
                info.franchise_name = bill.franchisee_name;
                info.payment_status = bill.payment_status;
                info.contact_person = bill.contact_person
                    ? bill.contact_person
                    : "N/A";
                info.contact_number = bill.contact_number
                    ? bill.contact_number
                    : "N/A";
                info.franchise_date = dateFormat(bill.month);
                info.total_sale = bill.total_sale;
                info.total_net = bill.total_net;
                info.total_amount_due = bill.total_amount_due;

                info.monthYear =
                    new Date(info.month).toLocaleString("en-us", {
                        month: "long",
                    }) +
                    " " +
                    new Date(info.month).getFullYear();
                return info;
            });

            closedBills = allBills.filter(
                (bill) => bill.status === "closed_bill"
            );
            openBills = allBills.filter(
                (bill) => bill.status === "done" && bill.paid_amount != "0.00"
            );
            doneBills = allBills.filter(
                (bill) =>
                    (bill.status === "done" || bill.status === "undone") &&
                    bill.paid_amount === "0.00"
            );
        }

        setShowLoader(false);
    }

    const [salesBillingManager, setSalesBillingManager] = useState([]);
    const [printBills, setPrintBills] = useState([]);
    const [printMonths, setPrintMonths] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        tab: !reports ? "missing" : "closed",
        franchisee_id: "",
        status: "",
        payment_status: !reports ? "closed_bill" : "",
        to: "",
        from: "",
        month: (currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-1"),
    });

    const isInitialMount = useRef(true);
    const filterConfigKey = 'franchise-salesBilling-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         console.log("mounted");
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 console.log("found", JSON.parse(window.localStorage.getItem(filterConfigKey)));
    //                 // handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //         // handleTabSelect(filterConfig.tab);
    //     } else {
    //         console.log("updated");
    //         console.log(filterConfig);
    //         // handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])


    async function searchFranchiseSalesBilling(filterConfig) {
        setShowLoader(true);
        setSalesBillingManager([]);

        if (filterConfig.tab === "done" || filterConfig.tab === "open" || filterConfig.tab === "closed" ) {
            const response = await searchSalesBilling(filterConfig);
            
            if(response.data) {
                var sortedData = response.data.data.sort((a, b) =>
                    a.added_on > b.added_on
                        ? 1
                        : b.added_on > a.added_on
                        ? -1
                        : 0
                );
                
                var allBills = sortedData.map((bill) => {
                    var info = bill;
    
                    info.id = bill.id;
                    info.month = dateFormat(bill.month);
                    info.date_added = Moment(bill.added_on).format("MM-DD-YYYY");
                    info.date_opened = Moment(bill.added_on).format("MM-DD-YYYY");
                    info.franchised_on = Moment(bill.franchised_on).format("MM-DD-YYYY");
                    info.opening_start = bill.opening_start !== "0000-00-00" ? Moment(bill.opening_start).format("MM-DD-YYYY") : "N/A";
                    info.branch_id = bill.branch_id;
                    info.balance = numberFormat(bill.balance);
                    info.branch_name = bill.branch_name;
                    info.franchise_id = bill.franchisee_id;
                    info.franchise_name = bill.franchisee_name;
                    info.payment_status = bill.payment_status;
                    info.contact_person = bill.contact_person
                        ? bill.contact_person
                        : "N/A";
                    info.contact_number = bill.contact_number
                        ? bill.contact_number
                        : "N/A";
                    info.franchise_date = Moment(bill.month).format("MM-DD-YYYY");
                    info.total_sale = bill.total_sale? numberFormat(bill.total_sale) : "0";
                    info.average_sales = bill.average_sales? numberFormat(bill.average_sales) : "0";
                    info.total_net = bill.total_net? numberFormat(bill.total_net) : "0";
                    info.total_amount_due = bill.total_amount_due? numberFormat(bill.total_amount_due) : "0";
                    info.paid_amount = bill.paid_amount? numberFormat(bill.paid_amount) : "0";
                    info.discount = bill.discount? numberFormat(bill.discount) : "0";
                    info.grand_total = bill.grand_total? numberFormat(bill.grand_total) : "0";
                    // info.grand_due = bill.discount? numberFormat(parseFloat(bill.total_amount_due) - parseFloat(bill.discount)) : numberFormat(bill.total_amount_due);
    
                    info.monthYear =
                        new Date(info.month).toLocaleString("en-us", {
                            month: "long",
                        }) +
                        " " +
                        new Date(info.month).getFullYear();
                    return info;
                });
                setSalesBillingManager(allBills.reverse());
                setPrintBills(allBills);

            } else {

            }
            
        } else if (filterConfig.tab === "missing") {
            const response = await searchSalesBillingMissing(filterConfig);
            setSalesBillingManager([]);

            if(response.data?.status === "success") {
                var sortedData = response.data.data.sort((a, b) =>
                    a.branch_name > b.branch_name
                        ? 1
                        : b.branch_name > a.branch_name
                        ? -1
                        : 0
                );

                var allBills = response.data.data.map((bill) => {
                    var info = bill;
    
                    info.id = bill.id;
                    info.month = Moment(bill.month).format("MM-YYYY");
                    info.date_added = Moment(bill.added_on).format("MM-DD-YYYY");
                    info.date_opened = Moment(bill.added_on).format("MM-DD-YYYY");
                    info.franchised_on = Moment(bill.franchised_on).format("MM-DD-YYYY");
                    info.opening_start = bill.opening_start !== "0000-00-00"? Moment(bill.opening_start).format("MM-DD-YYYY") : "";
                    info.branch_id = bill.branch_id;
                    info.balance = bill.balance;
                    info.branch_name = bill.branch_name;
                    info.franchise_id = bill.franchisee_id;
                    info.franchise_name = bill.name;
                    info.payment_status = bill.payment_status;
                    info.contact_person = bill.contact_person
                        ? bill.contact_person
                        : "N/A";
                    info.contact_number = bill.contact_number
                        ? bill.contact_number
                        : "N/A";
                    info.franchise_date = dateFormat(bill.month);
                    info.total_sale = bill.total_sale? numberFormat(bill.total_sale): "0";
                    info.total_net = bill.total_net? numberFormat(bill.total_net): "0";
                    info.total_amount_due = bill.total_amount_due? numberFormat(bill.total_amount_due): "0";
    
                    info.monthYear =
                        new Date(info.month).toLocaleString("en-us", {
                            month: "long",
                        }) +
                        " " +
                        new Date(info.month).getFullYear();
                    return info;
                });
                setSalesBillingManager(allBills);
            } else {

            }
        } else if (filterConfig.tab === "all_missing") {
            const response = await searchSalesBillingMissing(filterConfig);
            setSalesBillingManager([]);

            if(response.data) {
                var all = response.data.data;
                var monthlyBillingsArray = [];
                var months = [];
                var bills = [];
    
                for (const [key, value] of Object.entries(all)) {
                    var sortedData = value.sort((a, b) =>
                        a.branch_name > b.branch_name
                            ? 1
                            : b.branch_name > a.branch_name
                            ? -1
                            : 0
                    );
                    var allBills = sortedData.map((bill) => {
                        var info = bill;
    
                        info.id = bill.id;
                        info.month = dateFormat(bill.month);
                        info.date_added = Moment(bill.added_on).format("MM-DD-YYYY");
                        info.date_opened = Moment(bill.added_on).format("MM-DD-YYYY");
                        info.franchised_on = Moment(bill.franchised_on).format("MM-DD-YYYY");
                        info.opening_start = bill.opening_start? Moment(bill.opening_start).format("MM-DD-YYYY") : "N/A";
                        info.branch_id = bill.branch_id;
                        info.balance = bill.balance;
                        info.branch_name = bill.branch_name;
                        info.franchise_id = bill.franchisee_id;
                        info.franchise_name = bill.franchisee_name? bill.franchisee_name : bill.name;
                        info.payment_status = bill.payment_status;
                        info.contact_person = bill.contact_person
                            ? bill.contact_person
                            : "N/A";
                        info.contact_number = bill.contact_number
                            ? bill.contact_number
                            : "N/A";
                        info.franchise_date = Moment(bill.month).format("MM-DD-YYYY");
                        info.total_sale = "0";
                        info.total_net = "0";
                        info.total_amount_due = "0";
    
                        info.monthYear =
                            new Date(info.month).toLocaleString("en-us", {
                                month: "long",
                            }) +
                            " " +
                            new Date(info.month).getFullYear();
                        return info;
                    });
                    monthlyBillingsArray.push([key, allBills]);
                    

                    months.push(key)
                    bills.push({
                        name: key,
                    })
                    for (let i = 0; i < value.length; i++) {
                        const role = value[i];
                        bills.push({
                            name: '',
                            branch_name: role.branch_name,
                            franchise_name: role.franchise_name,
                            contact_person: role.contact_person,
                            contact_number: role.contact_number,
                            opening_start: role.opening_start,
                            franchised_on: role.franchised_on,
                        });
                    }
                }
                setPrintMonths(months);
                setPrintBills(bills);
                setSalesBillingManager(monthlyBillingsArray);
            }

        } else {
        }
        setShowLoader(false);
    }

    const handleTabSelect = (tabKey) => {
        // console.log("received tab")
        console.log(tabKey);
        var newFilterConfig = {
            tab: tabKey,
            month: "",
        };
        setBranch("");
        
        switch (tabKey) {
            case "missing":
                setSalesBillingManager([]);
                if(monthYearFilter === "") {
                    setMonthYearFilter(new Date())
                }
                newFilterConfig.month = Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD");
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "done":
                setSalesBillingManager([]);
                newFilterConfig.status = "undone";
                // if(monthYearFilter !== "") { //gi comment kay wala may date filter 2/14/2023
                //     newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                //     !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                //         ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                //         : "";
                // }
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "open":
                setSalesBillingManager([]);
                newFilterConfig.payment_status = "open_bill";
                newFilterConfig.status = "done";
                // if(monthYearFilter !== "") { //gi comment kay wala may date filter 2/14/2023
                //     newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                //     !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                //         ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                //         : "";
                // }
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "all_missing":
                setSalesBillingManager([]);
                newFilterConfig.month = "";
                setMonthYearFilter("")
                // newFilterConfig.year = Moment(monthYearFilter).format("YYYY");
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "closed":
                setSalesBillingManager([]);
                newFilterConfig.payment_status = "closed_bill";
                if(monthYearFilter !== "") {
                    newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                    !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                        ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                        : "";
                }
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            default:
                setSalesBillingManager([]);
                break;
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        var franchisee_name = "";
        var franchisee = "";
        if(name === "franchisee_name") {
            franchisee_name = value;
        } else if (name === "franchisee_id") {
            franchisee = value;
        }
        var tab = filterConfig.tab
        var newFilterConfig = {tab: tab, month: "", franchisee_id: franchisee, franchisee_name: franchisee_name}

        switch (tab) {
            case "missing":
                setSalesBillingManager([]);
                newFilterConfig.month = Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD");
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "done":
                setSalesBillingManager([]);
                newFilterConfig.status = "undone";
                newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                    !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                        ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                        : "";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "open":
                setSalesBillingManager([]);
                newFilterConfig.payment_status = "open_bill";
                newFilterConfig.status = "done";
                newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                    !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                        ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                        : "";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "all_missing":
                setSalesBillingManager([]);
                newFilterConfig.month = "";
                newFilterConfig.year = Moment(monthYearFilter).format("YYYY");
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            case "closed":
                setSalesBillingManager([]);
                newFilterConfig.payment_status = "closed_bill";
                newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                    !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                        ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                        : "";
                setFilterConfig(() => {
                    return newFilterConfig;
                });
                break;
            default:
                setSalesBillingManager([]);
                break;
        }
    };
    React.useEffect(() => {
        setSalesBillingManager([]);
        searchFranchiseSalesBilling(filterConfig);
    }, [filterConfig]);

    async function fetchBranches(date) {
        setBranchesData([]);
        const response = await getAllBranches();

        if (response) {
            let result = response.data.data.data.map((a) => {
                return {
                    id: a.id,
                    branch_name: a.name,
                    address: a.address,
                    month:
                        new Date(date).toLocaleString("en-us", {
                            month: "long",
                        }) +
                        " " +
                        new Date(date).getFullYear(),
                    opening_date: dateFormat(a.opening_date),
                    franchisee_name: a.franchisee_name,
                    contact_person: a.contact_person,
                    contact_number: a.contact_person_no,
                    initial_cash: a.initial_drawer,
                    action_btn: ActionBtn(a),
                };
            });
            setBranchesData(result);
        }
    }

    /** POST API - DELETE **/
    async function handleDeleteFranchiseBilling() {
        const cash = await deleteFranchiseSaleBilling(transferId);
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

    function addAction(row, month, year) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={() =>
                    handleAddAction(row, row.id, row.branch_id, month, year)
                }
            >
                Add
            </button>
        );
    }

    async function handleAddAction(row, id, branch_id, month, year) {
        // console.log(row, id, branch_id, month, year)
        // console.log(!year)
        if(!year) {
            year = new Date(month).getFullYear()
        }
        // console.log(year)
        navigate("/franchisebilling/add/", {
            state: { branchName: row.branch_name, month: month, year: year, row: row, type: "table" },
        });
    }


    function viewAction(row) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={() => handleViewAction(row.id, row.status, row)}
            >
                View
            </button>
        );
    }

    function handleViewAction(id, transfer_status, row) {
        // navigate("/franchisebilling/view/" + id, {
        //     state: { 
        //         franchisee_id: row.franchisee_id, 
        //         total_amount_due: row.total_amount_due, 
        //     },
        // });
        window.open(
            "/franchisebilling/view/" + id, "_blank"
        );
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                id={row.id}
                onChange={(e) => handleSelectChange(e, row.id, row.balance, row)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                {(accountType === "admin" || (accountType === "franchise_officer" && type === "undone")) && (
                    <option value="edit-po" className="color-options">
                        Edit
                    </option>
                )}
                <option value="view-po" className="color-options">
                    View
                </option>
                {type !== "undone" && (
                    <option value="payment-po" className="color-options">
                        Add Payment
                    </option>
                )}
                {accountType === "admin" && (
                    <option value="delete-po" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    const [franchisees, setFranchisees] = useState([]);

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
        const toFilter = {target: {name: "franchisee_id", value: e.value}};
        handleFilterChange(toFilter);
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

    //API CALL
    // async function fetchFilteredPI(value, type) {
    //     setMissing([]);
    //     setDone([]);
    //     setAllMissing([]);
    //     setAllBilling([]);
    //     clearTables();

    //     if (type === "searchbox") {
    //         setShowLoader(true);
    //         const response = await searchFranchiseeBranchName(value);
    //         if (response.data) {
    //             var closedBills = [];
    //             var openBills = [];
    //             var missingBills = [];
    //             var allMissingBills = [];
    //             var doneBills = [];

    //             var billing = response.data.data;

    //             var allBills = response.data.data.map((bill) => {
    //                 var info = bill;

    //                 info.id = bill.id;
    //                 info.month = dateFormat(bill.month);
    //                 info.date_added = dateFormat(bill.added_on);
    //                 info.date_opened = dateFormat(bill.added_on);
    //                 info.branch_id = bill.branch_id;
    //                 info.balance = bill.balance;
    //                 info.branch_name = bill.branch_name;
    //                 info.franchise_id = bill.franchisee_id;
    //                 info.franchise_name = bill.franchisee_name;
    //                 info.payment_status = bill.payment_status;
    //                 info.contact_person = bill.contact_person
    //                     ? bill.contact_person
    //                     : "N/A";
    //                 info.contact_number = bill.contact_number
    //                     ? bill.contact_number
    //                     : "N/A";
    //                 info.franchise_date = dateFormat(bill.month);
    //                 info.total_sale = bill.total_sale;
    //                 info.total_net = bill.total_net;
    //                 info.total_amount_due = bill.total_amount_due;

    //                 info.monthYear =
    //                     new Date(info.month).toLocaleString("en-us", {
    //                         month: "long",
    //                     }) +
    //                     " " +
    //                     new Date(info.month).getFullYear();
    //                 return info;
    //             });

    //             missingBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "undone" &&
    //                     bill.paid_amount === "0.00" &&
    //                     new Date(bill.month).toLocaleString("en-us", {
    //                         month: "long",
    //                     }) ===
    //                         new Date(monthYearFilter).toLocaleString("en-us", {
    //                             month: "long",
    //                         })
    //             );
    //             allMissingBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "undone" && bill.paid_amount === "0.00"
    //             );
    //             closedBills = allBills.filter(
    //                 (bill) => bill.status === "closed_bill"
    //             );
    //             openBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "done" && bill.paid_amount != "0.00"
    //             );
    //             doneBills = allBills.filter(
    //                 (bill) =>
    //                     (bill.status === "done" || bill.status === "undone") &&
    //                     bill.paid_amount === "0.00"
    //             );

    //             setMissing(missingBills);
    //             setAllMissing(allMissingBills);
    //             setDone(doneBills);
    //             setCloseFranchiseBilling(closedBills);
    //             setOpenFranchiseBilling(openBills);
    //         } else if (response.error) {
    //             clearTables();
    //         }
    //         setShowLoader(false);
    //     } else if (type === "name") {
    //         setShowLoader(true);

    //         const response = await searchFranchiseeDropdown(value);
    //         if (response.data.status === "success") {
    //             var closedBills = [];
    //             var openBills = [];
    //             var missingBills = [];
    //             var allMissingBills = [];
    //             var doneBills = [];

    //             var billing = response.data.data;

    //             var allBills = response.data.data.map((bill) => {
    //                 var info = bill;

    //                 info.id = bill.id;
    //                 info.month = dateFormat(bill.month);
    //                 info.date_added = dateFormat(bill.added_on);
    //                 info.date_opened = dateFormat(bill.added_on);
    //                 info.branch_id = bill.branch_id;
    //                 info.balance = bill.balance;
    //                 info.branch_name = bill.branch_name;
    //                 info.franchise_id = bill.franchisee_id;
    //                 info.franchise_name = bill.franchisee_name;
    //                 info.payment_status = bill.payment_status;
    //                 info.contact_person = bill.contact_person
    //                     ? bill.contact_person
    //                     : "N/A";
    //                 info.contact_number = bill.contact_number
    //                     ? bill.contact_number
    //                     : "N/A";
    //                 info.franchise_date = dateFormat(bill.month);
    //                 info.total_sale = bill.total_sale;
    //                 info.total_net = bill.total_net;
    //                 info.total_amount_due = bill.total_amount_due;

    //                 info.monthYear =
    //                     new Date(info.month).toLocaleString("en-us", {
    //                         month: "long",
    //                     }) +
    //                     " " +
    //                     new Date(info.month).getFullYear();
    //                 return info;
    //             });

    //             missingBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "undone" &&
    //                     bill.paid_amount === "0.00" &&
    //                     new Date(bill.month).toLocaleString("en-us", {
    //                         month: "long",
    //                     }) ===
    //                         new Date(monthYearFilter).toLocaleString("en-us", {
    //                             month: "long",
    //                         })
    //             );
    //             allMissingBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "undone" && bill.paid_amount === "0.00"
    //             );
    //             closedBills = allBills.filter(
    //                 (bill) => bill.status === "closed_bill"
    //             );
    //             openBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "done" && bill.paid_amount != "0.00"
    //             );
    //             doneBills = allBills.filter(
    //                 (bill) =>
    //                     (bill.status === "done" || bill.status === "undone") &&
    //                     bill.paid_amount === "0.00"
    //             );

    //             setMissing(missingBills);
    //             setAllMissing(allMissingBills);
    //             setDone(doneBills);
    //             setCloseFranchiseBilling(closedBills);
    //             setOpenFranchiseBilling(openBills);

    //             fetchBranches(monthYearFilter);
    //         } else if (response.error) {
    //             fetchBranches(monthYearFilter);
    //             setDone([]);
    //             setAllBilling([]);
    //         }
    //         setShowLoader(false);
    //     } else if (type === "month") {
    //         setShowLoader(true);
    //         var search =
    //             value.getFullYear() +
    //             "/" +
    //             (value.getMonth() + 1) +
    //             "/" +
    //             value.getDate();
    //         setSearchMonth(search);
    //         const response = await searchFranchiseeMonth(search);
    //         if (response.data) {
    //             var closedBills = [];
    //             var openBills = [];
    //             var missingBills = [];
    //             var allMissingBills = [];
    //             var doneBills = [];

    //             var billing = response.data.data;

    //             var allBills = response.data.data.map((bill) => {
    //                 var info = bill;

    //                 info.id = bill.id;
    //                 info.month = dateFormat(bill.month);
    //                 info.date_added = dateFormat(bill.added_on);
    //                 info.date_opened = dateFormat(bill.added_on);
    //                 info.branch_id = bill.branch_id;
    //                 info.balance = bill.balance;
    //                 info.branch_name = bill.branch_name;
    //                 info.franchise_id = bill.franchisee_id;
    //                 info.franchise_name = bill.franchisee_name;
    //                 info.payment_status = bill.payment_status;
    //                 info.contact_person = bill.contact_person
    //                     ? bill.contact_person
    //                     : "N/A";
    //                 info.contact_number = bill.contact_number
    //                     ? bill.contact_number
    //                     : "N/A";
    //                 info.franchise_date = dateFormat(bill.month);
    //                 info.total_sale = bill.total_sale;
    //                 info.total_net = bill.total_net;
    //                 info.total_amount_due = bill.total_amount_due;

    //                 info.monthYear =
    //                     new Date(value).toLocaleString("en-us", {
    //                         month: "long",
    //                     }) +
    //                     " " +
    //                     new Date(value).getFullYear();
    //                 return info;
    //             });

    //             missingBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "undone" &&
    //                     bill.paid_amount === "0.00" &&
    //                     new Date(bill.month).toLocaleString("en-us", {
    //                         month: "long",
    //                     }) ===
    //                         new Date(monthYearFilter).toLocaleString("en-us", {
    //                             month: "long",
    //                         })
    //             );
    //             allMissingBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "undone" && bill.paid_amount === "0.00"
    //             );
    //             closedBills = allBills.filter(
    //                 (bill) => bill.status === "closed_bill"
    //             );
    //             openBills = allBills.filter(
    //                 (bill) =>
    //                     bill.status === "done" && bill.paid_amount != "0.00"
    //             );
    //             doneBills = allBills.filter(
    //                 (bill) =>
    //                     (bill.status === "done" || bill.status === "undone") &&
    //                     bill.paid_amount === "0.00"
    //             );

    //             setMissing(missingBills);
    //             setAllMissing(allMissingBills);
    //             setDone(doneBills);
    //             setCloseFranchiseBilling(closedBills);
    //             setOpenFranchiseBilling(openBills);

    //             fetchBranches(search);
    //         } else if (response.error) {
    //             fetchBranches(search);
    //             setDone([]);
    //             setAllBilling([]);
    //         }
    //         setShowLoader(false);
    //     } else {
    //     }
    // }

    // SEARCH USER
    // function handleOnSearch(e, type) {
    //     fetchFilteredPI(e.target.value, type);
    // }

    // SEARCH USER
    function handleOnMonthSearch(e, type) {
        // handleTabSelect()
        var newFilterConfig = {
            tab: filterConfig.tab,
        };

        switch (filterConfig.tab) {
            case "missing":
                setSalesBillingManager([]);
                // newFilterConfig.month = Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD");
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        tab: filterConfig.tab,
                        month: Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD"),
                    };
                });
                break;
            case "done":
                setSalesBillingManager([]);
                // newFilterConfig.status = "undone";
                // newFilterConfig.month = 
                //     new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                //     !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                //         ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                //         : "";
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        tab: filterConfig.tab,
                        status: "undone",
                        month: new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                            !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                                ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                                : "",
                    };
                });
                break;
            case "open":
                setSalesBillingManager([]);
                // newFilterConfig.payment_status = "open_bill";
                // newFilterConfig.status = "done";
                // newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                //     !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                //         ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                //         : "";
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        tab: filterConfig.tab,
                        payment_status: "open_bill",
                        status: "done",
                        month: new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                            !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                                ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                                : "",
                    };
                });
                break;
            case "all_missing":
                setSalesBillingManager([]);
                // newFilterConfig.month = "";
                // newFilterConfig.year = monthYearFilter !== "" ? Moment(monthYearFilter).format("YYYY") : "";
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        tab: filterConfig.tab,
                        month: "",
                        year: monthYearFilter !== "" ? Moment(monthYearFilter).format("YYYY") : "",
                    };
                });
                break;
            case "closed":
                setSalesBillingManager([]);
                // newFilterConfig.payment_status = "closed_bill";
                // newFilterConfig.month = new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                //     !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                //         ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                //         : "";
                setFilterConfig((prev) => {
                    return {
                        ...prev,
                        tab: filterConfig.tab,
                        payment_status: "closed_bill",
                        month: new Date().toLocaleDateString("en-us",{ month:"long"}) + " " + new Date().getFullYear()
                            !== new Date(monthYearFilter).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(monthYearFilter).getFullYear() 
                                ? Moment(monthYearFilter).set('date', 1).format("YYYY-MM-DD")
                                : "",
                    };
                });
                break;
            default:
                setSalesBillingManager([]);
                break;
        }
    }

    const displayMonth = (index) => {
        switch (index) {
            case "0":
                return "January";
            case "1":
                return "February";
            case "2":
                return "March";
            case "3":
                return "April";
            case "4":
                return "May";
            case "5": 
                return "June";
            case "6":
                return "July";
            case "7":
                return "August";
            case "8":
                return "September";
            case "9":
                return "October";
            case "10":
                return "November";
            case "11":
                return "December";
        }
    };

    React.useEffect(() => {
        fetchData();
        fetchFranchisee();
        fetchBranches(monthYearFilter);
        setCurrentMonth(currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-1")
    }, []);

    React.useEffect(() => {
        handleOnMonthSearch(monthYearFilter, "month")
    }, [monthYearFilter]);

    // React.useEffect(() => {
    //     console.log(reports)
    //     setFilterConfig(() => {
    //         return {
    //             tab: "closed",
    //             payment_status: "closed_bill",
    //         };
            
    //     });
    // }, [reports]);

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
                <Row className="mb-1">
                    <Col xs={6}>
                        <h1 className="page-title">
                            {" "}
                            FRANCHISE MONTHLY BILLING{" "}
                        </h1>
                    </Col>
                    <Col xs={6} className="d-flex justify-content-end">
                        <input
                            name="franchisee_name"
                            type="text"
                            className="search-bar"
                            placeholder="Search franchisee..."
                            defaultValue=""
                            onKeyPress={(e) =>
                                e.key === ("Enter" || "NumpadEnter") &&
                                handleFilterChange(e)
                            }
                        />
                        <button
                            className="add-btn"
                            onClick={() => navigate("/franchisebilling/add/", {
                                state: { month: currentMonthName, year: currentDate.getFullYear(), type: "button" },
                            })}
                        >
                            Add
                        </button>
                    </Col>
                </Row>

                {/* filters */}
                <Row>
                    <Col>
                        <div className="my-2 px-4 PO-filters d-flex mb-4 filter">
                            <span className="me-4 align-middle mt-2">Filter By:</span>

                            {(filterConfig.tab === "missing" || filterConfig.tab === "closed") && (
                                <Form>
                                    <ReactDatePicker
                                        className="date-filter me-2 form-select"
                                        selected={monthYearFilter}
                                        placeholderText="Select Year"
                                        onChange={(date) =>
                                            setMonthYearFilter(date.setDate(1))
                                        }
                                        dateFormat="MMMM yyyy"
                                        showMonthYearPicker
                                    />
                                </Form>
                            )}
                            {(filterConfig.tab === "all_missing") && (
                                <Form>
                                <ReactDatePicker
                                    className="date-filter me-2 form-select"
                                    selected={monthYearFilter}
                                    placeholderText="Year"
                                    onChange={(date) =>
                                        setMonthYearFilter(date.setDate(1))
                                    }
                                    dateFormat="yyyy"
                                    showYearPicker
                                />
                            </Form>
                            )}
                            {(filterConfig.tab !== "all_missing") && (
                                <Select
                                    className="dropsearch-filter px-2 py-0 me-2 "
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
                                    value={branch}
                                    options={branches}
                                    onChange={handleBranchChange}
                                />
                            )}

                            {/* <Form.Select
                                name="franchisee_id"
                                className="date-filter me-2 ml-20"
                                defaultValue={filterConfig.franchisee_id}
                                onChange={handleFilterChange}
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
                    <Tab eventKey="missing" title="Missing">
                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "-",
                                "BRANCH",
                                "FRANCHISEE ",
                                "CONT. PERSON",
                                "CONT. NO.",
                                "DATE OPENED",
                                "FRANCH. DATE",
                            ]}
                            headerSelector={[
                                "-",
                                "branch_name",
                                "franchise_name",
                                "contact_person",
                                "contact_number",
                                "opening_start",
                                "franchised_on",
                            ]}
                            tableData={salesBillingManager}
                            ViewBtn={(row) => addAction(row, currentMonthName, currentYear)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="done" title="Pending">
                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "-",
                                "MONTH",
                                "BRANCH",
                                "SALES",
                                "NET SALES",
                                "AMT DUE",
                                "BAL",
                                "FRANCHISEE",
                                "DATE ADDED",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "monthYear",
                                "branch_name",
                                "total_sale",
                                "total_net",
                                "total_amount_due",
                                "balance",
                                "franchise_name",
                                "date_added",
                                "-",
                            ]}
                            tableData={salesBillingManager}
                            ActionBtn={(row) => ActionBtn(row, row.status)}
                            ViewBtn={(row) => viewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="open" title="open">
                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "-",
                                "MONTH",
                                "BRANCH",
                                "SALES",
                                "AVG SALES",
                                "NET SALES",
                                "AMT DUE",
                                "DISCOUNT",
                                "TOTAL",
                                "PAID AMT",
                                "BAL",
                                "FRANCHISEE",
                                "DATE ADDED",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "monthYear",
                                "branch_name",
                                "total_sale",
                                "average_sales",
                                "total_net",
                                "total_amount_due",
                                "discount",
                                "grand_total",
                                "paid_amount",
                                "balance",
                                "franchise_name",
                                "date_added",
                                "-",
                            ]}
                            tableData={salesBillingManager}
                            ActionBtn={(row) => ActionBtn(row, row.status)}
                            ViewBtn={(row) => viewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="all_missing" title="all missing">
                        {salesBillingManager.length !== 0 ? 
                            (salesBillingManager.map((allArray, index) => {
                                return (
                                    <Accordion>
                                        <Accordion.Item eventKey={index}>
                                            <Accordion.Header>
                                                {allArray[0]}
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <TableTemplate
                                                    tableHeaders={[
                                                        "-",
                                                        "BRANCH",
                                                        "FRANCHISEE",
                                                        "CONT PERSON",
                                                        "CONT NO",
                                                        "DATE OPENED",
                                                        "FRANCH DATE",
                                                    ]}
                                                    headerSelector={[
                                                        "-",
                                                        "branch_name",
                                                        "franchise_name",
                                                        "contact_person",
                                                        "contact_number",
                                                        "opening_start",
                                                        "franchised_on",
                                                        // "-",
                                                    ]}
                                                    tableData={allArray[1]}
                                                    ViewBtn={(row) =>
                                                        addAction(row, allArray[0], currentYear)
                                                    }
                                                    showLoader={showLoader}
                                                />
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                );
                            }))
                            :
                            (<TableTemplate
                                tableHeaders={[
                                    "-",
                                    "DATE OPENED",
                                    "BRANCH",
                                    "FRANCHISEE",
                                    "CONT PERSON",
                                    "CONT NO",
                                    "FRANCH DATE",
                                ]}
                                headerSelector={[
                                    "-",
                                    "opening_start",
                                    "branch_name",
                                    "franchise_name",
                                    "contact_person",
                                    "contact_number",
                                    "franchised_on",
                                    // "-",
                                ]}
                                tableData={salesBillingManager}
                                showLoader={showLoader}
                            />)
                        }
                    </Tab>
                    <Tab eventKey="closed" title="closed">
                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "-",
                                "MONTH",
                                "BRANCH",
                                "SALES",
                                "AVG SALES",
                                "NET SALES",
                                "AMT DUE",
                                "BAL",
                                "FRANCHISEE",
                                "DATE ADDED",
                            ]}
                            headerSelector={[
                                "-",
                                "monthYear",
                                "branch_name",
                                "total_sale",
                                "average_sales",
                                "total_net",
                                "total_amount_due",
                                "balance",
                                "franchise_name",
                                "date_added",
                                // "-",
                            ]}
                            tableData={salesBillingManager}
                            ViewBtn={(row) => viewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
                {
                    filterConfig.tab === "all_missing" ? 
                    <Row className="mt-3">
                        <Col className="d-flex justify-content-end mb-4">
                            <div className="justify-content-center align-items-center ">
                                <CSVLink
                                    className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                    data={printBills}
                                    headers={excelHeaders}
                                    target="_blank"
                                    filename={`${getTodayDateISO()} allmissingbills`}
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
                    : ""
                }

                {
                    filterConfig.tab === "closed" ? 
                    <Row className="mt-3">
                        <Col className="d-flex justify-content-end mb-4">
                            <div className="justify-content-center align-items-center ">
                                <CSVLink
                                    className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                    data={printBills}
                                    headers={excelHeadersClosed}
                                    target="_blank"
                                    filename={`${getTodayDateISO()} closed_bills`}
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
                    : ""
                }
            </div>

            {/* modals */}
            <DeleteModal
                show={showDeleteModal}
                onHide={() => handleCloseDeleteModal()}
                text="franchise sales billing"
                onDelete={() => handleDeleteFranchiseBilling()}
            />
            <FSBillingAddPaymentModal
                balance={balance}
                fs_billing_id={transferId}
                show={showAddPaymentModal}
                onHide={handleCloseAddPaymentModal}
            />
        </div>
    );
}
