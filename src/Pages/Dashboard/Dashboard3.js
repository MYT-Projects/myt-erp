import React, { useState, useEffect, Fragment } from "react";
import {
    Carousel,
    Card,
    Row,
    Col,
    Container,
    Stack,
    Badge,
} from "react-bootstrap";
import NoDataImg from "../../Assets/Images/Dashboard/no-data.png";
import arrowNext from "../../Assets/Images/Dashboard/arrow-next.png";
import circleArrow from "../../Assets/Images/Dashboard/circle-arrow.png";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAllRequests, 
    getAllRequestsPotato
} from "../../Helpers/apiCalls/Inventory/RequestsApi";

//components
import Navbar from "../../Components/Navbar/Navbar";

//css
import "../../Components/Navbar/Navbar.css";
import "./Dashboard.css";
import {
    capitalizeFirstLetter,
    dateFormat,
    formatDate,
    formatDateNoTime,
    getName,
    getTime,
    getType,
    numberFormat,
    TokenExpiry,
    getTodayDate,
} from "../../Helpers/Utils/Common";

// img
import profile from "../../Assets/Images/Dashboard/user_profile.png";
import NoDataPrompt from "../../Components/NoDataPrompt/NoDataPrompt";
import {
    getAllPurchaseOrder,
    searchPurchaseOrder,
    searchPurchaseOrderPotato,
} from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    getAllSuppliesExpenses,
    getAllSuppliesExpensesPotato,
    searchSE,
} from "../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import {
    getAlgetAllTransfersPotato,
    lTransfers,
    getTransfer,
    getAllTransfers,
    searchTransfersMango,
    searchTransfersPotato,
} from "../../Helpers/apiCalls/Inventory/TransferApi";
import {
    getAllTransfersPotato,
    getTransferPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Inventory/TransferApi";
import { getAllPurchaseOrderPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import {
    getAllInventoryAdjustments,
    getAllInventoryAdjustmentsPotato,
} from "../../Helpers/apiCalls/adjustmentsApi";
import { Navigate } from "react-router-dom";
import { searchAdjustmentsMango } from "../../Helpers/apiCalls/Inventory/AdjustmentApi";
import { searchAdjustmentsPotato } from "../../Helpers/apiCalls/PotatoCorner/Inventory/AdjustmentApi";
import { searchFranchiseeSales } from "../../Helpers/apiCalls/franchiseeApi";
import { filterInvoice } from "../../Helpers/apiCalls/Purchases/purchaseInvoiceApi";
import { filterInvoicePotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseInvoiceApi";
import { filterSEInvoiceDashboard } from "../../Helpers/apiCalls/Expenses/suppliesInvoiceApi";
import {
    getLowOnStock,
    getLowOnStockPotato,
} from "../../Helpers/apiCalls/Inventory/ItemListApi";
import {
    getNegativeInventory,
    getNegativeInventoryPotato,
} from "../../Helpers/apiCalls/Reports/TransferHistoryApi";
import { getAllPayments } from "../../Helpers/apiCalls/Franchise/ReceivablesApi";
import {searchPettyCashTransactionDetails} from "../../Helpers/apiCalls/PettyCash/PettyCashRegisterApi";
import { searchBranchStatus } from "../../Helpers/apiCalls/Manage/Branches";
import { searchBranchStatusPotato } from "../../Helpers/apiCalls/PotatoCorner/Manage/Branches";
import {
    searchSalesBillingMissing,
} from "../../Helpers/apiCalls/Franchise/FranchiseSaleBillingApi";
export default function Dashboard3() {
    let navigate = useNavigate();
    const type = getType();
    const [inactive, setInactive] = useState(false);
    const [username, setUsername] = useState(getName());
    const [purchasesPO, setPurchasesPO] = useState([]);
    const [incompletePO, setIncompletePO] = useState([]);
    const [incompleteSEPO, setIncompleteSEPO] = useState([]);
    const [unreceivedPO, setunreceivedPO] = useState([]);
    const [suppliesPO, setSuppliesPO] = useState([]);
    const [openPI, setOpenPI] = useState([]);
    const [openSePI, setOpenSePI] = useState([]);
    const [unpprocessedQuotations, setUnpprocessedQuotations] = useState([]);
    const [openSalesInvoice, setOpenSalesInvoice] = useState([]);
    const [undonePayment, setundonePayment] = useState([]);
    const [officeAdjustments, setOfficeAdjustments] = useState([]);
    const [storeAdjustments, setStoreAdjustments] = useState([]);
    const [openBranchesMango, setOpenBranchesMango] = useState([]);
    const [openBranchesPotato, setOpenBranchesPotato] = useState([]);
    const [negativeInventories, setNegativeInventories] = useState([]);
    const [transfersPO, setTransfersPO] = useState([]);
    const [requestStocks, setRequestStocks] = useState([]);
    const [branchCount, setBranchCount] = useState([]);
    const [pettyCash, setPettyCash] = useState([]);
    const [allMissingBills, setAllMissingBills] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [inventoryAdjustments, setInventoryAdjustments] = useState([]);
    var dateToday = getTodayDate();
    const [days, setDays] = useState({
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
    });

    // FOR APPROVAL PURCHASE ORDERS FROM MANGO AND POTATO
    async function fetchAllForApprovalPurchases() {
        var allPO = [];
        setPurchasesPO([]);
        const response = await searchPurchaseOrder({
            status: "for_approval",
        });
        const response2 = await searchPurchaseOrderPotato({
            status: "for_approval",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "mango";
                info.status = PO.status;
                info.label = `Mango-${PO.id}`;
                info.supplier =
                    PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                allPO.push(info);
                return info;
            });
        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "potato";
                info.status = PO.status;
                info.label = `Potato-${PO.id}`;
                info.supplier =
                PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setPurchasesPO(allPO);
    }

    // UNRECEIVED PURCHASE ORDERS FROM MANGO AND POTATO
    async function fetchAllUnreceivedPurchases() {
        var allPO = [];
        setunreceivedPO([]);
        const response = await searchPurchaseOrder({
            status: "sent",
        });
        const response2 = await searchPurchaseOrderPotato({
            status: "sent",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "mango";
                info.status = PO.status;
                info.label = `Mango-${PO.id}`;
                info.supplier =
                    PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                allPO.push(info);
                return info;
            });
        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "potato";
                info.status = PO.status;
                info.label = `Potato-${PO.id}`;
                info.supplier =
                PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setunreceivedPO(allPO);
    }

    // INCOMPLETE PURCHASE ORDERS FROM MANGO AND POTATO
    async function fetchAllIncompletePurchases() {
        var allPO = [];
        setPurchasesPO([]);
        const response = await searchPurchaseOrder({
            order_status: "incomplete",
        });
        const response2 = await searchPurchaseOrderPotato({
            order_status: "incomplete",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "mango";
                info.status = PO.status;
                info.label = `Mango-${PO.id}`;
                info.supplier =
                    PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                allPO.push(info);
                return info;
            });
        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "potato";
                info.status = PO.status;
                info.label = `Potato-${PO.id}`;
                info.supplier =
                PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setIncompletePO(allPO);
    }

    // FOR APPROVAL SUPPLIES EXPENSES FROM MANGO AND POTATO
    async function fetchAllForApprovalSuppliesExpense() {
        const response = await searchSE({
            status: "for_approval",
        });
        if (response.data) {
            var mangoSE = response.data.data.map((SE) => {
                var info = {};
                info.id = SE.id;
                info.type = "mango";
                info.label = `Mango-${SE.id}`;
                info.supplier = SE.supplier_trade_name || "N/A";
                return info;
            });
            setSuppliesPO(mangoSE);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }

    // INCOMPLETE SUPPLIES EXPENSES FROM MANGO AND POTATO
    async function fetchAllIncompleteSuppliesExpense() {
        const response = await searchSE({
            order_status: "incomplete",
        });
        if (response.data) {
            var mangoSE = response.data.data.map((SE) => {
                var info = {};
                info.id = SE.id;
                info.type = "mango";
                info.label = `Mango-${SE.id}`;
                info.supplier = SE.supplier_trade_name || "N/A";
                return info;
            });
            setIncompleteSEPO(mangoSE);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }

    // UNPROCESSED QUOTATIONS
    async function fetchAllUnprocessedQuotations() {
        const response = await getAllPayments({
            is_done: "0",
        });
        if (response.data) {
            var mangoSE = response.data.payments.map((SE) => {
                var info = SE;
                return info;
            });
            setundonePayment(mangoSE);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }

    // PETTY CASH
    async function fetchAllPettyCashRequest() {
        const response = await searchPettyCashTransactionDetails({
            status: "request", 
            petty_cash_id: 1
        });
        if (response.history) {
            var mangoSE = response.history.map((SE) => {
                var info = SE;
                return info;
            });
            setPettyCash(mangoSE);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }

    // UNDONE PAYMENTS
    async function fetchAllUndonePayments() {
        const response = await searchFranchiseeSales({
            fs_status: "quoted",
        });
        if (response.data) {
            var mangoSE = response.data.data.map((SE) => {
                var info = SE;
                return info;
            });
            setUnpprocessedQuotations(mangoSE);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }
    
    // OPEN SALES INVOICE
    async function fetchAllOpenSalesInvoice() {
        const response = await searchFranchiseeSales({
            fs_status: "invoiced",
            payment_status: "open_bill",
        });
        if (response.data) {
            var allPO = response.data.data.map((PO) => {
                var info = PO;
                return info;
            });
            setOpenSalesInvoice(allPO);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }

    // ALL MISSING FRANCHISE BILLING
    async function fetchAllMissingBills() {
        setAllMissingBills([])
        const response = await searchSalesBillingMissing({});
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
            setAllMissingBills(bills);
        }
    }

    //OPEN PI
    async function fetchAllOpenPI() {
        var allPO = [];
        setOpenPI([]);
        const response = await filterInvoice({
            payment_status: "open",
        });
        const response2 = await filterInvoicePotato({
            payment_status: "open",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "mango";
                allPO.push(info);
                return info;
            });

        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "potato";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setOpenPI(allPO);
    }

    //PENDING REQUEST
    async function fetchAllPendingRequest() {
        var allPO = [];
        setPendingRequests([]);
        const response = await getAllRequests({
            tab: "pending",
        });
        const response2 = await getAllRequestsPotato({
            tab: "pending",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = PO;
                info.type = "mango";
                allPO.push(info);
                return info;
            });

        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = PO;
                info.type = "potato";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setPendingRequests(allPO);
    }

    //LOW ON STOCK
    async function fetchAllLowOnStock() {
        var allPO = [];
        var branchId = [];
        setRequestStocks([]);
        const response = await getLowOnStock({
            low_stock: "1",
        });
        const response2 = await getLowOnStockPotato({
            low_stock: "1",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = PO;
                info.type = "mango";
                allPO.push(info);
                return info;
            });
        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = PO;
                info.type = "potato";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setRequestStocks(allPO);
    }

    //OPEN SE PI
    async function fetchAllOpenSePI() {
        var allPO = [];
        setOpenSePI([]);
        const response = await filterSEInvoiceDashboard({
            bill_type: "open",
        });
        if (response.data) {
            var mangoPO = response.data.response.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "mango";
                allPO.push(info);
                return info;
            });

        } else if (response.error) {
            TokenExpiry(response);
        }
        setOpenSePI(allPO);
    }

    // OFFICE ADJUSTMENTS
    async function fetchAllOfficeAdjustments() {
        var allPO = [];
        setOfficeAdjustments([]);
        const response = await searchAdjustmentsMango({
            status: "pending",
            type: "office",
        });
        const response2 = await searchAdjustmentsPotato({
            status: "pending",
            type: "office",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = PO;
                info.type = "mango";
                allPO.push(info);
                return info;
            });

        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = PO;
                info.type = "potato";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setOfficeAdjustments(allPO);
    }

    // OPEN BRANCHES
    async function fetchOpenBranches() {
        var mango = [];
        var potato = [];
        setOpenBranchesMango([]);
        setOpenBranchesPotato([]);
        const response = await searchBranchStatus({
            tab: "mango",
            branch_type: "company-owned",
            date_from: dateToday,
        });
        const response2 = await searchBranchStatusPotato({
            tab: "mango",
            branch_type: "company-owned",
            date_from: dateToday,
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = PO;
                info.type = "mango";
                mango.push(info);
                return info;
            });

        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = PO;
                info.type = "potato";
                potato.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setOpenBranchesMango(mango);
        setOpenBranchesPotato(potato);
    }

    // STORE ADJUSTMENTS
    async function fetchAllStoreAdjustments() {
        var allPO = [];
        setStoreAdjustments([]);
        const response = await searchAdjustmentsMango({
            status: "pending",
            type: "store",
        });
        const response2 = await searchAdjustmentsPotato({
            status: "pending",
            type: "store",
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = PO;
                info.type = "mango";
                allPO.push(info);
                return info;
            });

        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = PO;
                info.type = "potato";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setStoreAdjustments(allPO);
    }

    // NEGATIVE INVENTORY
    async function fetchAllNegativeInventories() {
        var allPO = [];
        setNegativeInventories([]);
        const response = await getNegativeInventory();
        const response2 = await getNegativeInventoryPotato();
        console.log(response)
        console.log(response2)
        if (response.data) {
            var mangoPO = response.data.negative_items.map((PO) => {
                var info = PO;
                info.type = "mango";
                allPO.push(info);
                return info;
            });

        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.negative_items.map((PO) => {
                var info = PO;
                info.type = "potato";
                allPO.push(info);
                
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setNegativeInventories(allPO);
    }

    // FOR APPROVAL TRANSFERS FROM MANGO AND POTATO
    async function fetchAllForApprovalTransfers() {
        var allTransfers = [];
        setTransfersPO([]);
        const response = await searchTransfersMango({
            transfer_status: "requested",
            limit_by: 5,
        });
        const response2 = await searchTransfersPotato({
            transfer_status: "requested",
            limit_by: 5,
        });
        if (response.data) {
            var mangoTransfers = response.data.data.map((pendingTransfer, key) => {
                if (key < 3){
                    var info = {};
                    info.id = pendingTransfer.id;
                    info.status = pendingTransfer.status;
                    info.label = `Mango-${pendingTransfer.id}`;
                    info.type = "mango";
                    info.branchTo =
                        `To: ${capitalizeFirstLetter(
                            pendingTransfer.branch_to_name
                        )}` || "N/A";
                    allTransfers.push(info);
                    return info;
                }
            });
        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoTransfers = response2.data.data.map((pendingTransfer, key) => {
                if (key < 3){
                    var info = {};
                    info.id = pendingTransfer.id;
                    info.status = pendingTransfer.status;
                    info.label = `Potato-${pendingTransfer.id}`;
                    info.type = "potato";
                    info.branchTo =
                        `To: ${pendingTransfer.branch_to_name}` || "N/A";
                    if (allTransfers.length < 3){
                        allTransfers.push(info);
                    }
                    return info;
                }
                
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }

        setTransfersPO(allTransfers);
    }

    // RECENT INVENTORY ADJUSTMENTS IN MANGO AND POTATO
    async function fetchInvetoryAdjustments() {
        var allAdjustments = [];
        const response = await searchAdjustmentsMango({
            status: "pending",
            limit_by: 5,
        });
        const response2 = await searchAdjustmentsPotato({
            status: "pending",
            limit_by: 5,
        });

        if (response.data) {
            var mangoAdjustments = response.data.data.map((adjustment) => {
                var info = {};
                info.type = "mango";
                allAdjustments.push(adjustment);
            });
        } else if (response.error) {
            TokenExpiry(response);
        }

        if (response2.data) {
            var potatoAdjustments = response2.data.data.map((adjustment) => {
                var info = {};
                info.type = "potato";
                allAdjustments.push(adjustment);
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setInventoryAdjustments(allAdjustments);

    }

    useEffect(() => {
        fetchOpenBranches();
        fetchAllMissingBills();
        fetchAllOpenSalesInvoice();
        fetchInvetoryAdjustments();
        fetchAllForApprovalPurchases();
        fetchAllIncompletePurchases();
        fetchAllUnreceivedPurchases();
        fetchAllPendingRequest();
        fetchAllLowOnStock();
        fetchAllUndonePayments();
        fetchAllOpenPI();
        fetchAllOpenSePI();
        fetchAllOpenSalesInvoice();
        fetchAllForApprovalSuppliesExpense();
        fetchAllIncompleteSuppliesExpense();
        fetchAllOfficeAdjustments();
        fetchAllStoreAdjustments();
        fetchAllForApprovalTransfers();
        fetchAllUnprocessedQuotations();
        fetchAllNegativeInventories();
        fetchAllPettyCashRequest();
    }, []);

    return (
        <div className="dashboard-wrapper">
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"DASHBOARD"} //Dashboard navbar index
                />
            </div>
            <div className={`dashboard ${inactive ? "inactive" : "active"}`}>
                <Row className="d-flex justify-content-between align-items-end">
                    <Col xs={"auto"}>
                        <h2 className="font-medium">
                            Hello, <b>{getName()}!</b>👋
                        </h2>
                    </Col>
                    <Col xs={"auto"}>
                        <h3 className="date-and-time">{`${getTime(
                            new Date()
                        )} ${days[new Date().getDay()]} | ${formatDateNoTime(
                            new Date()
                        )}`}</h3>
                    </Col>
                </Row>
                {type === "admin" ? (
                    <Fragment>
                        <Row className="mt-3">
                            <Col>
                                <h2 className="business-name">Mango Magic</h2>
                            </Col>
                            <Col>
                                <h2 className="business-name">Potato Corner</h2>
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-between align-items-end">
                            <Col>
                                <Row>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                BRANCHES OPEN
                                            </div>
                                            <div className="stats"
                                                onClick={(e) => navigate("/listofbranches")}
                                                >
                                                {openBranchesMango.filter((data) => {
                                                    return data.status === "open"
                                                }).length + " "}
                                                    
                                                <span className="stats-small">
                                                    out of 
                                                    {" " + openBranchesMango.length + " "}
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                SALES DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                INVENTORY DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Col>
                            <Col>
                                <Row>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                BRANCHES OPEN
                                            </div>
                                            <div className="stats"
                                                onClick={(e) => navigate("/listofbranches")}
                                                >
                                                {openBranchesPotato.filter((data) => {
                                                    return data.status === "open"
                                                }).length + " "}
                                                    
                                                <span className="stats-small">
                                                    out of 
                                                    {" " + openBranchesPotato.length + " "}
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                SALES DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                INVENTORY DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-between align-items-end mt-4">
                            <Col>
                                <Row>
                                    
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                PENDING PURCHASE ORDERS
                                            </div>
                                            <Row className="mt-1">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {purchasesPO.filter((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        MANGO
                                                    </span>
                                                </Col>
                                                <Col className="me-2 ms-2 "> 
                                                    <div className="stats " 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {purchasesPO.filter((data) => {
                                                            return data.type === "potato"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        POTATO
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                INCOMPLETE PURCHASES
                                            </div>
                                            <Row className="mt-1">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {incompletePO.filter((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        MANGO
                                                    </span>
                                                </Col>
                                                <Col className="me-2 ms-2 "> 
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {incompletePO.filter((data) => {
                                                            return data.type === "potato"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        POTATO
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr "
                                                onClick={(e) => navigate("/suppliesexpenses")}
                                                >
                                                PENDING SUPPLIES PO
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats"
                                                        onClick={(e) => navigate("/suppliesexpenses")}
                                                        >
                                                        {suppliesPO.map((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                INCOMPLETE SUPPLIES PO
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats"
                                                        onClick={(e) => navigate("/suppliesexpenses")}
                                                        >
                                                        {incompleteSEPO.map((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="align-items-start mt-3">
                            <Col >
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Unprocessed Quotations</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            <Row className="">
                                                {unpprocessedQuotations.length === 0 ? (
                                                    <div className="no-data-found d-flex justify-content-center">
                                                        <span>
                                                            <img
                                                                src={NoDataImg}
                                                                alt="no data found"
                                                                width={20}
                                                                height={20}
                                                            />
                                                        </span>
                                                        <p className="no-data-label mx-1">
                                                            Uh Oh! No data found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        { unpprocessedQuotations.filter((v, i) => {
                                                            return (
                                                                unpprocessedQuotations.map((val) => val.franchisee_id).indexOf(v.franchisee_id) == i
                                                            );
                                                        })
                                                        .map((adj, i) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    adj?.buyer_branch_name
                                                                                }
                                                                            </div>
                                                                            <div className="date">
                                                                                {unpprocessedQuotations.filter((data) => {
                                                                                        return data.franchisee_id === adj.franchisee_id
                                                                                    }).length + " QUOTATION/S" 
                                                                                } 
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/salesinvoice"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </Row>
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Request Stocks</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {pendingRequests.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {pendingRequests?.map(
                                                        (adj) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    "Request No. " + adj?.id
                                                                                }
                                                                            </div>
                                                                            <div className="date">
                                                                                {adj?.branch_from_name + " to " + adj?.branch_to_name}
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/requests"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        }
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">
                                            Pending Transfers
                                        </p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {transfersPO.length ===
                                            0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {transfersPO?.map(
                                                        (adj) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    "Transfer Slip No. " + adj?.label
                                                                                }
                                                                            </div>

                                                                            <div className="date">
                                                                                {`${adj?.branchTo}`}
                                                                            </div>
                                                                            <div className="date">
                                                                                {adj?.status}
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/transfers"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Low On Stock</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {requestStocks.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    requestStocks.filter((v, i) => {
                                                        return (
                                                            requestStocks.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + requestStocks?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/transfers"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            {/* <Col xs={6} className="box-2">
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box-3 box-header">
                                        <Row className="px-3">
                                            For Approval Purchases
                                        </Row>
                                        <Row className="for-approval-wrapper">
                                            {purchasesPO.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Row className="for-approval-cont py-0 d-flex align-items-center">
                                                    <Col xs={9}>
                                                        <Row>
                                                            {purchasesPO?.map(
                                                                (purchase) => {
                                                                    return (
                                                                        <Col
                                                                            xs={
                                                                                3
                                                                            }
                                                                            className="approval-box mx-1"
                                                                        >
                                                                            <button
                                                                                className="next-btn"
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        "/purchaseorders/review/0/" +
                                                                                            purchase.type +
                                                                                            `/${purchase.type}-${purchase.id}`
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className="approval-card">
                                                                                    <Badge
                                                                                        bg={
                                                                                            purchase.type ===
                                                                                            "mango"
                                                                                                ? "warning"
                                                                                                : "success"
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            purchase?.label
                                                                                        }
                                                                                    </Badge>
                                                                                    <p className="fs-normal">
                                                                                        {
                                                                                            purchase?.supplier
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                        </Col>
                                                                    );
                                                                }
                                                            )}
                                                        </Row>
                                                    </Col>
                                                    <Col className="d-flex justify-content-end">
                                                        <button
                                                            className="next-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/purchaseorders"
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    circleArrow
                                                                }
                                                                alt="see more"
                                                                width={30}
                                                                height={30}
                                                            />
                                                        </button>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Row>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box-3 box-header">
                                        <Row className="px-3">
                                            For Approval Supplies
                                        </Row>
                                        <Row className="for-approval-wrapper">
                                            {suppliesPO.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Row className="for-approval-cont py-0 d-flex align-items-center">
                                                    <Col xs={9}>
                                                        <Row>
                                                            {suppliesPO?.map(
                                                                (supplies) => {
                                                                    return (
                                                                        <Col
                                                                            xs={
                                                                                3
                                                                            }
                                                                            className="approval-box mx-1"
                                                                        >
                                                                            <button
                                                                                className="next-btn"
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        "/suppliesexpenses/review/" +
                                                                                            supplies.id
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className="approval-card">
                                                                                    <Badge
                                                                                        bg={
                                                                                            supplies.type ===
                                                                                            "mango"
                                                                                                ? "warning"
                                                                                                : "success"
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            supplies?.label
                                                                                        }
                                                                                    </Badge>
                                                                                    <p className="fs-normal">
                                                                                        {
                                                                                            supplies?.supplier
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                        </Col>
                                                                    );
                                                                }
                                                            )}
                                                        </Row>
                                                    </Col>
                                                    <Col className="d-flex justify-content-end">
                                                        <button
                                                            className="next-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/suppliesexpenses"
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    circleArrow
                                                                }
                                                                alt="see more"
                                                                width={30}
                                                                height={30}
                                                            />
                                                        </button>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Row>
                                    </Col>
                                </Row>

                                
                            </Col> */}
                        </Row>
                        <Row className="d-flex justify-content-between align-items-end mt-4">
                            <Col>
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">OFFICE ADJUSTMENTS</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {officeAdjustments.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    officeAdjustments.filter((v, i) => {
                                                        return (
                                                            officeAdjustments.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + officeAdjustments?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/adjustments"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    {/* <Col className="me-auto mx-2 box-1">
                                        <Stack className="align-items-center">
                                            <div className="big-hdr ">
                                                OFFICE ADJUSTMENTS
                                            </div>
                                            <Row className="">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/adjustments")}
                                                        >
                                                        {officeAdjustments.filter((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        MANGO
                                                    </span>
                                                </Col>
                                                <Col className="me-2 ms-2 "> 
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/adjustments")}
                                                        >
                                                        {officeAdjustments.filter((data) => {
                                                            return data.type === "potato"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        POTATO
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col> */}
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">STORE ADJUSTMENTS</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {storeAdjustments.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    storeAdjustments.filter((v, i) => {
                                                        return (
                                                            storeAdjustments.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + storeAdjustments?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/storeadjustments"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">NEGATIVE INVENTORIES</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {negativeInventories.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {
                                                    negativeInventories.map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch + "(" + adj.type + ") - " + adj.negative_items
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/lowonstock"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    {/* <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                OPEN SUPPLIES INVOICE
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats"
                                                        onClick={(e) => navigate("/se/purchaseinvoices")}
                                                        >
                                                        {openSePI.map((data) => {
                                                            return data
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col> */}
                                    <Col>
                                        <Row>
                                            <Col className="me-auto mx-2 box-1 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNRECEIVED PO
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "mango"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                MANGO
                                                            </span>
                                                        </Col>
                                                        <Col className="me-2 ms-2 "> 
                                                            <div className="stats " onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "potato"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                POTATO
                                                            </span>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    
                                        <Row>
                                            <Col className="me-auto mx-2 box-1 mt-3 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNDONE PAYMENT
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/payments")}>
                                                                {undonePayment.map((data) => {
                                                                    return data
                                                                }).length + " "}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col className="me-auto mx-2 box-1 mt-3 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        PETTY CASH REQUEST
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/pettycash")}>
                                                                {pettyCash.map((data) => {
                                                                    return data
                                                                }).length + " "}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    </Col>
                                    {/* <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                OPEN SALES INVOICE
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats">
                                                        {openSalesInvoice.map((data) => {
                                                            return data
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col> */}
                                </Row>
                            </Col>
                        </Row>
                    </Fragment>
                ) : type === "purchasing_officer" ? (
                    <Fragment>
                        <Row className="d-flex justify-content-between align-items-end mt-4">
                            <Col>
                                <Row>
                                    
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                PENDING PURCHASE ORDERS
                                            </div>
                                            <Row className="mt-1">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {purchasesPO.filter((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        MANGO
                                                    </span>
                                                </Col>
                                                <Col className="me-2 ms-2 "> 
                                                    <div className="stats " 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {purchasesPO.filter((data) => {
                                                            return data.type === "potato"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        POTATO
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                INCOMPLETE PURCHASES
                                            </div>
                                            <Row className="mt-1">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {incompletePO.filter((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        MANGO
                                                    </span>
                                                </Col>
                                                <Col className="me-2 ms-2 "> 
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {incompletePO.filter((data) => {
                                                            return data.type === "potato"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        POTATO
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr "
                                                onClick={(e) => navigate("/suppliesexpenses")}
                                                >
                                                PENDING SUPPLIES PO
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats"
                                                        onClick={(e) => navigate("/suppliesexpenses")}
                                                        >
                                                        {suppliesPO.map((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                INCOMPLETE SUPPLIES PO
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats"
                                                        onClick={(e) => navigate("/suppliesexpenses")}
                                                        >
                                                        {incompleteSEPO.map((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-between align-items-end mt-4">
                            <Col>
                                <Row>
                                    
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Low On Stock</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {requestStocks.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    requestStocks.filter((v, i) => {
                                                        return (
                                                            requestStocks.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + requestStocks?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/transfers"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>

                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">OFFICE ADJUSTMENTS</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {officeAdjustments.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    officeAdjustments.filter((v, i) => {
                                                        return (
                                                            officeAdjustments.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + officeAdjustments?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/adjustments"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">NEGATIVE INVENTORIES</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {negativeInventories.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {
                                                    negativeInventories.map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch + "(" + adj.type + ") - " + adj.negative_items
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/lowonstock"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Col className="me-auto mx-2 box-1 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNRECEIVED PO
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "mango"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                MANGO
                                                            </span>
                                                        </Col>
                                                        <Col className="me-2 ms-2 "> 
                                                            <div className="stats " onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "potato"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                POTATO
                                                            </span>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    
                                        <Row>
                                            <Col className="me-auto mx-2 box-1 mt-3 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNDONE DSR
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/payments")}>
                                                                -
                                                                {/* {undonePayment.map((data) => {
                                                                    return data
                                                                }).length + " "} */}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Fragment>
                ) : type === "franchise_officer" ? (
                    <Fragment>
                        <Row className="align-items-start mt-3">
                            <Col >
                                <Row>
                                    <Col xs={3}>
                                        <Col className="me-auto mx-2 box-1 mt-3 "> 
                                            <Stack className="align-items-center">
                                                <div className="big-hdr ">
                                                    OPEN BILLING INVOICES
                                                </div>
                                                <Row className="mt-2">
                                                    <Col className="me-2 ms-2 ">
                                                        <div className="stats" onClick={(e) => navigate("/salesinvoice")}>
                                                            {openSalesInvoice.length + " "}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Stack>
                                        </Col>
                                        <Col className="me-auto mx-2 box-1 mt-3 "> 
                                            <Stack className="align-items-center">
                                                <div className="big-hdr ">
                                                    MISSING BILLING REPORTS
                                                </div>
                                                <Row className="mt-2">
                                                    <Col className="me-2 ms-2 ">
                                                        <div className="stats" onClick={(e) => navigate("/franchisebilling")}>
                                                            {allMissingBills.length + " "}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Stack>
                                        </Col>
                                    </Col>
                                    <Col  xs={8} className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Unprocessed Quotations</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            <Row className="">
                                                {unpprocessedQuotations.length === 0 ? (
                                                    <div className="no-data-found d-flex justify-content-center">
                                                        <span>
                                                            <img
                                                                src={NoDataImg}
                                                                alt="no data found"
                                                                width={20}
                                                                height={20}
                                                            />
                                                        </span>
                                                        <p className="no-data-label mx-1">
                                                            Uh Oh! No data found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        { unpprocessedQuotations.filter((v, i) => {
                                                            return (
                                                                unpprocessedQuotations.map((val) => val.franchisee_id).indexOf(v.franchisee_id) == i
                                                            );
                                                        })
                                                        .map((adj, i) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    adj?.buyer_branch_name
                                                                                }
                                                                            </div>
                                                                            <div className="date">
                                                                                {unpprocessedQuotations.filter((data) => {
                                                                                        return data.franchisee_id === adj.franchisee_id
                                                                                    }).length + " QUOTATION/S" 
                                                                                } 
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/salesinvoice"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Fragment>
                ) : type === "inventory_officer" ? (
                    <Fragment>
                        
                        <Row className="align-items-start mt-3">
                            <Col >
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">
                                            Pending Transfers
                                        </p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {transfersPO.length ===
                                            0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {transfersPO?.map(
                                                        (adj) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    "Transfer Slip No. " + adj?.label
                                                                                }
                                                                            </div>

                                                                            <div className="date">
                                                                                {`${adj?.branchTo}`}
                                                                            </div>
                                                                            <div className="date">
                                                                                {adj?.status}
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/transfers"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">OFFICE ADJUSTMENTS</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {officeAdjustments.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    officeAdjustments.filter((v, i) => {
                                                        return (
                                                            officeAdjustments.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + officeAdjustments?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/adjustments"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Col className="me-auto mx-2 box-1 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNRECEIVED PO
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "mango"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                MANGO
                                                            </span>
                                                        </Col>
                                                        <Col className="me-2 ms-2 "> 
                                                            <div className="stats " onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "potato"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                POTATO
                                                            </span>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    
                                        {/* <Row>
                                            <Col className="me-auto mx-2 box-1 mt-3 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNDONE PAYMENT
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/payments")}>
                                                                {undonePayment.map((data) => {
                                                                    return data
                                                                }).length + " "}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col className="me-auto mx-2 box-1 mt-3 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        PETTY CASH REQUEST
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/pettycash")}>
                                                                {pettyCash.map((data) => {
                                                                    return data
                                                                }).length + " "}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row> */}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Fragment>
                ) : type === "admin_staff" ? (
                    <Fragment>
                        <Row className="d-flex justify-content-between align-items-end mt-4">
                            <Col>
                                <Row>
                                    
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                PENDING PURCHASE ORDERS
                                            </div>
                                            <Row className="mt-1">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {purchasesPO.filter((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        MANGO
                                                    </span>
                                                </Col>
                                                <Col className="me-2 ms-2 "> 
                                                    <div className="stats " 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {purchasesPO.filter((data) => {
                                                            return data.type === "potato"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        POTATO
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                INCOMPLETE PURCHASES
                                            </div>
                                            <Row className="mt-1">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {incompletePO.filter((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        MANGO
                                                    </span>
                                                </Col>
                                                <Col className="me-2 ms-2 "> 
                                                    <div className="stats" 
                                                        onClick={(e) => navigate("/purchaseorders")}
                                                        >
                                                        {incompletePO.filter((data) => {
                                                            return data.type === "potato"
                                                        }).length + " "}
                                                    </div>
                                                    <span className="stats-small">
                                                        POTATO
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr "
                                                onClick={(e) => navigate("/suppliesexpenses")}
                                                >
                                                PENDING SUPPLIES PO
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats"
                                                        onClick={(e) => navigate("/suppliesexpenses")}
                                                        >
                                                        {suppliesPO.map((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1 ">
                                        <Stack className="align-items-center">

                                            <div className="big-hdr ">
                                                INCOMPLETE SUPPLIES PO
                                            </div>
                                            <Row className="mt-2">
                                                <Col className="me-2 ms-2 ">
                                                    <div className="stats"
                                                        onClick={(e) => navigate("/suppliesexpenses")}
                                                        >
                                                        {incompleteSEPO.map((data) => {
                                                            return data.type === "mango"
                                                        }).length + " "}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="align-items-start mt-3">
                            <Col >
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Unprocessed Quotations</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            <Row className="">
                                                {unpprocessedQuotations.length === 0 ? (
                                                    <div className="no-data-found d-flex justify-content-center">
                                                        <span>
                                                            <img
                                                                src={NoDataImg}
                                                                alt="no data found"
                                                                width={20}
                                                                height={20}
                                                            />
                                                        </span>
                                                        <p className="no-data-label mx-1">
                                                            Uh Oh! No data found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        { unpprocessedQuotations.filter((v, i) => {
                                                            return (
                                                                unpprocessedQuotations.map((val) => val.franchisee_id).indexOf(v.franchisee_id) == i
                                                            );
                                                        })
                                                        .map((adj, i) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    adj?.buyer_branch_name
                                                                                }
                                                                            </div>
                                                                            <div className="date">
                                                                                {unpprocessedQuotations.filter((data) => {
                                                                                        return data.franchisee_id === adj.franchisee_id
                                                                                    }).length + " QUOTATION/S" 
                                                                                } 
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/salesinvoice"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </Row>
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Request Stocks</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {pendingRequests.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {pendingRequests?.map(
                                                        (adj) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    "Request No. " + adj?.id
                                                                                }
                                                                            </div>
                                                                            <div className="date">
                                                                                {adj?.branch_from_name + " to " + adj?.branch_to_name}
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/requests"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        }
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">
                                            Pending Transfers
                                        </p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {transfersPO.length ===
                                            0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {transfersPO?.map(
                                                        (adj) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    "Transfer Slip No. " + adj?.label
                                                                                }
                                                                            </div>

                                                                            <div className="date">
                                                                                {`${adj?.branchTo}`}
                                                                            </div>
                                                                            <div className="date">
                                                                                {adj?.status}
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/transfers"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Low On Stock</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {requestStocks.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    requestStocks.filter((v, i) => {
                                                        return (
                                                            requestStocks.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + requestStocks?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/transfers"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-between align-items-end mt-4">
                            <Col>
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">OFFICE ADJUSTMENTS</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {officeAdjustments.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    officeAdjustments.filter((v, i) => {
                                                        return (
                                                            officeAdjustments.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + officeAdjustments?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/adjustments"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">STORE ADJUSTMENTS</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {storeAdjustments.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    { 
                                                    // requestStocks?.filter((data) => {return data.branch_id === "1"})
                                                    storeAdjustments.filter((v, i) => {
                                                        return (
                                                            storeAdjustments.map((val) => val.branch_id).indexOf(v.branch_id) == i
                                                        );
                                                    })
                                                    .map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch_name + " - " + storeAdjustments?.filter((data) => { return data.branch_id === adj.branch_id}).length
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/storeadjustments"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">NEGATIVE INVENTORIES</p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {negativeInventories.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {
                                                    negativeInventories.map((adj, i) => {
                                                        return (
                                                            <Stack>
                                                                <Row>
                                                                    <Col>
                                                                        <div className="label">
                                                                            {
                                                                                adj?.branch + "(" + adj.type + ") - " + adj.negative_items
                                                                            }
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs="auto">
                                                                        <button
                                                                            className="adjustment-btn"
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    "/lowonstock"
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    arrowNext
                                                                                }
                                                                                alt="see more"
                                                                                width={
                                                                                    20
                                                                                }
                                                                                height={
                                                                                    20
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </Col>
                                                                </Row>
                                                                <hr />
                                                            </Stack>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Col className="me-auto mx-2 box-1 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNRECEIVED PO
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "mango"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                MANGO
                                                            </span>
                                                        </Col>
                                                        <Col className="me-2 ms-2 "> 
                                                            <div className="stats " onClick={(e) => navigate("/purchaseorders")}>
                                                                {unreceivedPO.filter((data) => {
                                                                    return data.type === "potato"
                                                                }).length + " "}
                                                            </div>
                                                            <span className="stats-small">
                                                                POTATO
                                                            </span>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    
                                        <Row>
                                            <Col className="me-auto mx-2 box-1 mt-3 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        UNDONE PAYMENT
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/payments")}>
                                                                {undonePayment.map((data) => {
                                                                    return data
                                                                }).length + " "}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col className="me-auto mx-2 box-1 mt-3 "> 
                                                <Stack className="align-items-center">
                                                    <div className="big-hdr ">
                                                        PETTY CASH REQUEST
                                                    </div>
                                                    <Row className="mt-2">
                                                        <Col className="me-2 ms-2 ">
                                                            <div className="stats" onClick={(e) => navigate("/pettycash")}>
                                                                {pettyCash.map((data) => {
                                                                    return data
                                                                }).length + " "}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Fragment>
                ) : type === "hr_officer" ? (
                    <Fragment>
                        <Col>
                            <Row>
                                <Col className="me-auto mx-2 box-1">
                                    <Stack>
                                        <div className="small-hdr">
                                            BRANCHES OPEN
                                        </div>
                                        <div className="stats"
                                            onClick={(e) => navigate("/listofbranches")}
                                            >
                                            {openBranchesMango.filter((data) => {
                                                return data.status === "open"
                                            }).length + " "}
                                                
                                            <span className="stats-small">
                                                out of 
                                                {" " + openBranchesMango.length + " "}
                                            </span>
                                        </div>
                                    </Stack>
                                </Col>
                                <Col className="me-auto mx-2 box-1">
                                    <Stack>
                                        <div className="small-hdr">
                                            BRANCHES OPEN
                                        </div>
                                        <div className="stats"
                                            onClick={(e) => navigate("/listofbranches")}
                                            >
                                            {openBranchesPotato.filter((data) => {
                                                return data.status === "open"
                                            }).length + " "}
                                                
                                            <span className="stats-small">
                                                out of 
                                                {" " + openBranchesPotato.length + " "}
                                            </span>
                                        </div>
                                    </Stack>
                                </Col>
                            </Row>
                        </Col>
                    </Fragment>
                ) : (
                    <Row className="d-flex justify-content-center align-items-center business-name mt-5 gray">
                        You do not have an authorized access to view this page.
                    </Row>
                )}
            </div>
        </div>
    );
}
